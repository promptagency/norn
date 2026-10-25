"""Generate design/tokens.css from design/tokens.json.

tokens.json is the Norn design system's token file, copied from the design system in Claude.
Run this after every change to tokens.json:

  python scripts/build_tokens_css.py
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "design" / "tokens.json"
OUT = ROOT / "design" / "tokens.css"

COMMENTS = {
    "grund": "page background",
    "yta": "raised surface: cards, fields, dialogs, the forecast card",
    "yta-sankt": "sunken surface: footer, file drop zone, disabled fields",
    "text": "body text and headings",
    "text-dampad": "secondary text, help text, axis labels, sources",
    "indigo": "brand colour: logo, primary button fill, links, active step",
    "pa-indigo": "text on an --indigo fill",
    "kant": "decorative dividers and card borders",
    "kant-kontroll": "borders on fields and controls (3:1)",
    "fokus": "focus ring, 2px solid, 2px offset",
    "krapp": "accent for the present: the now-line, at most one more mark per view",
    "ockra": "dark ochre, the complement of indigo: only the forecast's most likely line",
    "fel": "error text, always with words",
    "prognos-historik": "chart: the past, solid 2.5px",
    "prognos-median": "chart: most likely path, dotted 1/6 in ockra so it stands out from the bands",
    "prognos-band-90": "chart: nine times out of ten, drawn first",
    "prognos-band-50": "chart: half of the time, drawn on top of band-90",
    "prognos-nu": "chart: vertical now-line, 2px",
    "prognos-utfall": "chart: what actually happened in the backtest, solid 2px",
}

HEADERS = {
    "ljus": '/* Light theme ("positiv"): linen ground, indigo brand. */\n:root,\n[data-theme="ljus"] {',
    "mork": '/* Dark theme ("negativ"): night indigo ground, linen brand. */\n[data-theme="mork"] {',
}


def value(tok: dict, theme: str) -> str:
    v = tok["value"][theme] if isinstance(tok["value"], dict) else tok["value"]
    return f"var(--{v[1:-1]})" if v.startswith("{") else v


def main() -> None:
    t = json.loads(SRC.read_text())
    colors = t["color"]["tokens"]
    out = [
        "/* Norn design tokens. Generated from design/tokens.json (the Norn design system).",
        "   Do not edit values here by hand. Change tokens.json first, then regenerate with scripts/build_tokens_css.py.",
        "   Rules for how to use each token are in DESIGN.md. */",
        "",
    ]
    for theme in ("ljus", "mork"):
        out.append(HEADERS[theme])
        for tok in colors:
            note = COMMENTS.get(tok["name"], tok.get("usage", ""))
            out.append(f'  --{tok["name"]}: {value(tok, theme)}; /* {note} */')
        out.append("}\n")
    out.append('/* Follow the operating system unless the app sets data-theme explicitly. */')
    out.append('@media (prefers-color-scheme: dark) {\n  :root:not([data-theme="ljus"]) {')
    for tok in colors:
        out.append(f'    --{tok["name"]}: {value(tok, "mork")};')
    out.append("  }\n}\n")
    out.append(":root {")
    for key, stack in t["type"]["families"].items():
        out.append(f"  --font-{key}: {stack};")
    for family in ("spacing", "radius"):
        for tok in t[family]["tokens"]:
            out.append(f'  --{tok["name"]}: {tok["value"]}; /* {tok["usage"]} */')
    out.append("}\n")
    out.append("/* Type styles. Use the classes, or copy the declarations into a component. */")
    for group in t["type"]["groups"]:
        fam = group["family"]
        for s in group["styles"]:
            decl = [
                f"font-family: var(--font-{fam})",
                f'font-size: {s["fontSize"]}',
                f'line-height: {s["lineHeight"]}',
                f'font-weight: {s["fontWeight"]}',
            ]
            if "letterSpacing" in s:
                decl.append(f'letter-spacing: {s["letterSpacing"]}')
            if "opticalSize" in s:
                decl.append(f'font-variation-settings: "opsz" {s["opticalSize"]}')
            out.append(f'.{s["name"]} {{ {"; ".join(decl)}; }} /* {s["usage"]} */')
    out.append("\n/* Numbers that are compared (amounts, dates, axis labels) use tabular figures. */")
    out.append(".siffror { font-variant-numeric: tabular-nums; }")
    OUT.write_text("\n".join(out) + "\n")
    print("wrote", OUT.relative_to(ROOT))


if __name__ == "__main__":
    main()
