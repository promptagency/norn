// Build the Norn design system's component bundle from src/ui/components.
//
//   npm run build:ds
//
// Writes dist-ds/components/bundle.js (one classic script assigning window.Norn,
// React read from window.React), bundle.css and index.d.ts. Upload those three
// files to the design system in Claude, in project/components/.

import { build } from "esbuild";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "src/ui/components");
const out = join(root, "dist-ds/components");
mkdirSync(out, { recursive: true });

// React and its JSX runtime come from the page (window.React), never from the bundle.
const reactFromWindow = {
  name: "react-from-window",
  setup(b) {
    b.onResolve({ filter: /^react(\/jsx-runtime|\/jsx-dev-runtime)?$/ }, (args) => ({ path: args.path, namespace: "window-react" }));
    b.onLoad({ filter: /.*/, namespace: "window-react" }, (args) => {
      if (args.path === "react") return { contents: "module.exports = window.React;", loader: "js" };
      return {
        contents: `
          const R = window.React;
          // jsx: one or no child. jsxs: a static list of children, passed as arguments so React
          // does not ask for keys on them, exactly as the automatic runtime does.
          function make(type, props, key, spread) {
            const { children, ...rest } = props || {};
            if (key !== undefined) rest.key = key;
            if (spread && Array.isArray(children)) return R.createElement(type, rest, ...children);
            return children === undefined ? R.createElement(type, rest) : R.createElement(type, rest, children);
          }
          const jsx = (type, props, key) => make(type, props, key, false);
          const jsxs = (type, props, key) => make(type, props, key, true);
          module.exports = { jsx, jsxs, jsxDEV: jsx, Fragment: R.Fragment };`,
        loader: "js",
      };
    });
  },
};

const names = [
  "Knapp", "Valknapp", "Valgrupp", "Steg", "Slappyta", "Exempelkort", "Betyg", "Svar", "Kort",
  "Prognosgraf", "Forklaring", "Fraga", "Sakerhetsval", "Nyckeltal", "Sidhuvud", "Sidfot",
];

const result = await build({
  entryPoints: [join(src, "index.ts")],
  bundle: true,
  format: "iife",
  globalName: "Norn",
  target: "es2020",
  jsx: "automatic",
  minify: false,
  legalComments: "none",
  write: false,
  outdir: out,
  plugins: [reactFromWindow],
  loader: { ".css": "css" },
});

for (const f of result.outputFiles) {
  if (f.path.endsWith(".js")) {
    const header = `/* @ds-bundle: ${JSON.stringify({ format: 4, namespace: "Norn", components: names.map((name) => ({ name })) })} */\n`;
    const body = f.text.replace(/<\/script/gi, "<\\/script").replace(/<!--/g, "<\\!--");
    writeFileSync(join(out, "bundle.js"), header + body);
  } else if (f.path.endsWith(".css")) {
    writeFileSync(join(out, "bundle.css"), f.text);
  }
}

// index.d.ts: the props file plus one declaration per component. Documentation, not type-checked.
const types = readFileSync(join(src, "types.ts"), "utf8").replace(/^import .*$/gm, "").trim();
const chart = readFileSync(join(src, "chart.ts"), "utf8");
const chartTypes = [...chart.matchAll(/export interface [\s\S]*?\n}\n/g)].map((m) => m[0]).join("\n");
const decl = names.map((n) => `export declare function ${n}(props: ${n}Props): ReactElement;`).join("\n");
writeFileSync(
  join(out, "index.d.ts"),
  `// Norn components. Generated from src/ui/components/types.ts by scripts/build_ds_bundle.mjs.\n` +
    `import type { ReactElement, ReactNode, ButtonHTMLAttributes } from "react";\n\n${chartTypes}\n${types}\n\n${decl}\n` +
    `export declare const NORNORNA: StegPost[];\n` +
    `export declare function bucketMeans(values: number[], size: number): number[];\n`,
);
console.log("wrote", ["bundle.js", "bundle.css", "index.d.ts"].map((f) => `dist-ds/components/${f}`).join(", "));
