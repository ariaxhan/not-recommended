import {execFileSync} from "node:child_process";
import {cpSync, mkdirSync, rmSync, statSync} from "node:fs";
import {resolve} from "node:path";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");
const unpacked = resolve(dist, "unpacked");
const zipPath = resolve(dist, "not-recommended-v0.1.0.zip");
const runtimeFiles = [
  "manifest.json",
  "background.js",
  "content.js",
  "content.css",
  "lib",
  "popup.html",
  "popup.css",
  "popup.js",
  "icons",
  "README.md",
  "PRIVACY.md",
  "LICENSE",
];

rmSync(dist, {recursive: true, force: true});
mkdirSync(unpacked, {recursive: true});
for (const file of runtimeFiles) cpSync(resolve(root, file), resolve(unpacked, file), {recursive: true});

execFileSync("zip", ["-q", "-r", zipPath, "."], {cwd: unpacked, stdio: "inherit"});
console.log(`Created ${zipPath} (${statSync(zipPath).size} bytes)`);
console.log(`Created ${unpacked}`);
