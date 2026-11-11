// Converte um HTML em PDF A4 usando o Chromium do Playwright.
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH ?? "playwright");
const [input, output] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(input).href, { waitUntil: "networkidle" });
// Os PNGs são renderizados em 2x: exibe no tamanho lógico para não ampliar diagramas pequenos.
await page.evaluate(() =>
  document.querySelectorAll("img").forEach((img) => {
    img.style.width = `${img.naturalWidth / 2}px`;
  }),
);
await page.pdf({
  path: output,
  format: "A4",
  printBackground: true,
  margin: { top: "18mm", bottom: "18mm", left: "16mm", right: "16mm" },
  displayHeaderFooter: true,
  headerTemplate: `<div style="font-size:8px;width:100%;text-align:right;padding-right:16mm;color:#888">RateMedia — Documentação do Projeto</div>`,
  footerTemplate: `<div style="font-size:8px;width:100%;text-align:center;color:#888">Página <span class="pageNumber"></span> de <span class="totalPages"></span></div>`,
});
await browser.close();
