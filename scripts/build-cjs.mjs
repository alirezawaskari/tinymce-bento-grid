import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const distDir = resolve("dist");
mkdirSync(distDir, { recursive: true });

const jsPath = resolve(distDir, "index.js");
const mjsPath = resolve(distDir, "index.mjs");
const cjsPath = resolve(distDir, "index.cjs");

const esmCode = readFileSync(jsPath, "utf8");
writeFileSync(mjsPath, esmCode, "utf8");

// Simple ESM -> CJS transform for zero-dependency single-file export
const cjsCode = esmCode
  .replace(/export const /g, "const ")
  .replace(/export function /g, "function ")
  .concat(
    "\nmodule.exports = { DEFAULT_BENTO_LABELS, BENTO_GRID_CONTENT_CSS, buildBentoGridHtml, registerBentoGridPlugin };\n",
  );
writeFileSync(cjsPath, cjsCode, "utf8");

copyFileSync(resolve("src/bento-grid.css"), resolve(distDir, "bento-grid.css"));
