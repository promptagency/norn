// Real Safari, which Playwright's WebKit is not: each example from Start to Skuld, then an own CSV, against the live
// site (or NORN_URL). Drives Safari through macOS's safaridriver over plain WebDriver HTTP, so it needs no dependency.
// Once per Mac: Safari → Settings → Advanced → "Show features for web developers", then Developer → "Allow remote
// automation". Run with `npm run e2e:safari`; a Safari window opens and runs on its own for a minute or so.
import { spawn } from "node:child_process";

const base = process.env.NORN_URL ?? "https://nornor.app";
const wd = "http://localhost:4444";
const driver = spawn("safaridriver", ["-p", "4444"], { stdio: "inherit" });
process.on("exit", () => driver.kill());
await new Promise((r) => setTimeout(r, 1000));
const call = async (method, path, body) => {
  const r = await fetch(wd + path, { method, headers: { "content-type": "application/json" }, body: body && JSON.stringify(body) });
  const j = await r.json();
  if (j.value?.error) throw new Error(`${j.value.error}: ${j.value.message}`);
  return j.value;
};
const { sessionId } = await call("POST", "/session", { capabilities: { alwaysMatch: { browserName: "safari" } } });
const s = `/session/${sessionId}`;
const js = (script, ...args) => call("POST", `${s}/execute/sync`, { script, args });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function until(what, script, timeout = 120_000, ...args) {
  const t0 = Date.now();
  for (;;) {
    const v = await js(script, ...args);
    if (v) return v;
    if (Date.now() - t0 > timeout) {
      const text = await js("return document.querySelector('main')?.innerText.slice(0, 400)");
      throw new Error(`Timed out: ${what}\n${text}`);
    }
    await sleep(500);
  }
}
const svar = (sub) => until(`.n-svar has "${sub}"`, "return document.querySelector('.n-svar')?.innerText.includes(arguments[0])", 120_000, sub);
const clickText = (sel, text) =>
  until(`click ${sel} "${text}"`, "const e=[...document.querySelectorAll(arguments[0])].find(e=>e.innerText.trim().includes(arguments[1])); if(e){e.click(); return true}", 30_000, sel, text);

const EXAMPLES = [["Detaljhandel", "Pålitlig"], ["Elförbrukning", "Pålitlig"], ["Wikipedia", "Pålitlig"]];
let failed = 0;
try {
  for (const [card, grade] of EXAMPLES) {
    const t0 = Date.now();
    try {
      await call("POST", `${s}/url`, { url: base + "/" });
      await clickText(".n-exempelkort", card);
      await svar(" från ");
      await clickText("button", "Ja");
      const betyg = await until("grade", "return document.querySelector('.n-betyg')?.innerText", 180_000);
      if (!betyg.includes(grade)) throw new Error(`grade ${betyg}, expected ${grade}`);
      await clickText("button", "Visa vad som kommer");
      await svar("troligen");
      const first = await js("return document.querySelector('.n-svar').innerText");
      await js("const b=[...document.querySelectorAll('[role=group] button')]; b[b.length-1].click()");
      await until("new horizon", "const t=document.querySelector('.n-svar').innerText; return t!==arguments[0] && t.includes('troligen')", 60_000, first);
      await clickText("summary, button, [role=button]", "Hur säker vill du vara?");
      await until("9 of 10", "const l=[...document.querySelectorAll('label')].find(l=>l.innerText.includes('Räcker i 9 fall av 10')); if(l){l.click(); return true}", 10_000);
      await until("plan sentence", "return [...document.querySelectorAll('[role=status]')].some(e=>e.innerText.includes('Räkna med'))", 10_000);
      const chart = await js("return !!document.querySelector('svg.n-graf')");
      const foreign = await js("return performance.getEntriesByType('resource').map(e=>e.name).filter(u=>!u.startsWith(location.origin))");
      if (!chart) throw new Error("no chart");
      if (foreign.length) throw new Error(`requests to another origin: ${foreign}`);
      console.log(`ok   ${card}: ${betyg.split("\n")[0]}, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    } catch (e) {
      failed++;
      console.log(`FAIL ${card}: ${e.message}`);
    }
  }
  // The user's own CSV: WebDriver cannot pick a file in Safari, so the page builds one and hands it to the drop zone's input.
  try {
    await call("POST", `${s}/url`, { url: base + "/" });
    await until("file input", "return !!document.querySelector('.n-slappyta__input')", 30_000);
    await js(`const rows=['Datum;Kassa']; for(let i=0;i<400;i++){const d=new Date(Date.UTC(2025,0,1+i)); rows.push(d.toISOString().slice(0,10)+';'+(100+20*Math.sin(i/7*2*Math.PI)+i/10).toFixed(1).replace('.',','))}
      const dt=new DataTransfer(); dt.items.add(new File([rows.join('\\n')],'kassa.csv',{type:'text/csv'}));
      const input=document.querySelector('.n-slappyta__input'); input.files=dt.files; input.dispatchEvent(new Event('change',{bubbles:true}));`);
    await svar(" från ");
    await clickText("button", "Ja");
    const betyg = await until("grade", "return document.querySelector('.n-betyg')?.innerText", 180_000);
    await clickText("button", "Visa vad som kommer");
    await svar("troligen");
    const stored = await js("return localStorage.length + sessionStorage.length + document.cookie.length");
    console.log(`ok   own CSV: ${betyg.split("\n")[0]}, ${stored} things stored`);
  } catch (e) {
    failed++;
    console.log(`FAIL own CSV: ${e.message}`);
  }
  const version = await js("return [...document.querySelectorAll('footer p')].map(p=>p.innerText).find(t=>t.startsWith('Version'))");
  console.log(version, "|", await js("return navigator.userAgent"));
} finally {
  await call("DELETE", s);
}
process.exit(failed ? 1 : 0);
