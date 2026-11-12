// Renderiza os diagramas Mermaid de public/docs/diagramas/src/*.mmd em SVG e PNG.
// Uso: MERMAID_JS=caminho/para/mermaid.min.js node scripts/docs/render-diagrams.mjs
// (requer Playwright + Chromium instalados: npm i -D playwright mermaid)
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH ?? "playwright");
const ROOT = resolve(import.meta.dirname, "../../public/docs/diagramas");
const mermaidJs = readFileSync(process.env.MERMAID_JS ?? require.resolve("mermaid/dist/mermaid.min.js"), "utf8");

const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 2 });
await page.setContent(`<html><body style="margin:0;background:#fff"><div id="out"></div></body></html>`);
await page.addScriptTag({ content: mermaidJs });
await page.evaluate(() =>
  window.mermaid.initialize({
    startOnLoad: false,
    theme: "base",
    fontFamily: "Arial, Helvetica, sans-serif",
    themeVariables: {
      primaryColor: "#ede7ff",
      primaryBorderColor: "#7c5cd6",
      primaryTextColor: "#1d1630",
      lineColor: "#5b5470",
      secondaryColor: "#e3f4ff",
      tertiaryColor: "#fff4e3",
      noteBkgColor: "#fff4e3",
      noteBorderColor: "#ca8100",
    },
    flowchart: { htmlLabels: true, curve: "basis" },
    er: { useMaxWidth: false },
    sequence: { useMaxWidth: false, mirrorActors: false },
  }),
);

for (const file of readdirSync(join(ROOT, "src")).filter((f) => f.endsWith(".mmd"))) {
  const name = file.replace(/\.mmd$/, "");
  const code = readFileSync(join(ROOT, "src", file), "utf8");
  const svg = await page.evaluate(async ({ name, code }) => {
    const { svg } = await window.mermaid.render(`d-${name}`, code);
    const out = document.getElementById("out");
    out.innerHTML = svg;
    // Re-serializa como XML: o HTML do Mermaid (ex.: <br>) quebra o SVG quando usado em <img>.
    return new XMLSerializer().serializeToString(out.querySelector("svg"));
  }, { name, code });
  writeFileSync(join(ROOT, `${name}.svg`), svg);
  const el = await page.$("#out svg");
  await el.screenshot({ path: join(ROOT, `${name}.png`), omitBackground: false });
  console.log("ok", name);
}
await browser.close();
