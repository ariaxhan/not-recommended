import {execFileSync} from "node:child_process";
import {readFileSync} from "node:fs";

const scripts = ["background.js", "content.js", "lib/core.js", "popup.js", "scripts/package.mjs"];
for (const script of scripts) {
  execFileSync(process.execPath, ["--check", script], {stdio: "inherit"});
}

const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
if (manifest.manifest_version !== 3) throw new Error("manifest.json must use Manifest V3");

const source = scripts.map(file => readFileSync(file, "utf8")).join("\n");
for (const forbidden of ["eval(", "new Function(", "http://", "innerHTML"]) {
  if (source.includes(forbidden)) throw new Error(`Forbidden source pattern: ${forbidden}`);
}

const css = `${readFileSync("content.css", "utf8")}\n${readFileSync("popup.css", "utf8")}`;
for (const forbiddenFont of ["Inter", "Roboto", "Arial", "system-ui"]) {
  if (css.includes(forbiddenFont)) throw new Error(`Forbidden font: ${forbiddenFont}`);
}

console.log(`Checked ${scripts.length} JavaScript files, manifest scope, source safety, and typography.`);
