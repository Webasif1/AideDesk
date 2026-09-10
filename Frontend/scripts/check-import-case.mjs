// Case-sensitive import checker.
//
// Windows and macOS resolve `../features/user/pages/Customers` and
// `../features/user/Pages/Customers` identically; Linux and Docker do not.
// That asymmetry has already broken this build twice (six `pages/` imports in
// app.route.jsx, nine `../../Components/` imports in App/Pages/), and neither
// was catchable by `vite build` on a developer machine.
//
// This walks every relative import and compares each path segment against the
// real directory listing, so a casing mismatch fails here instead of in CI.
//
//   node scripts/check-import-case.mjs
import fs from "fs";
import path from "path";

const root = path.resolve("src");
const CODE = /\.(jsx?|mjs|tsx?)$/;
const EXTS = ["", ".jsx", ".js", ".mjs", ".ts", ".tsx", "/index.jsx", "/index.js"];

const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (CODE.test(entry.name)) files.push(p);
  }
})(root);

// Resolve `abs` the way a case-sensitive filesystem would: every segment must
// appear verbatim in its parent's listing, not merely match case-insensitively.
const resolvesExactly = (abs) =>
  EXTS.some((ext) => {
    const full = abs + ext;
    const parts = full.split(path.sep);
    let cur = parts[0] + path.sep;
    for (let i = 1; i < parts.length; i++) {
      let entries;
      try {
        entries = fs.readdirSync(cur);
      } catch {
        return false;
      }
      if (!entries.includes(parts[i])) return false;
      cur = path.join(cur, parts[i]);
    }
    return fs.existsSync(full) && fs.statSync(full).isFile();
  });

// Strip comments first — docblocks carry example imports that aren't real.
const strip = (src) =>
  src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

let broken = 0;
for (const file of files) {
  const src = strip(fs.readFileSync(file, "utf8"));
  for (const [, spec] of src.matchAll(/(?:from|import)\s*\(?\s*["'](\.[^"']+)["']/g)) {
    if (!resolvesExactly(path.resolve(path.dirname(file), spec))) {
      console.error(`BROKEN  src/${path.relative(root, file)}  ->  ${spec}`);
      broken++;
    }
  }
}

if (broken) {
  console.error(`\n${broken} import(s) will fail to resolve on a case-sensitive filesystem.`);
  process.exit(1);
}
console.log(`✓ ${files.length} files checked — all relative imports resolve case-sensitively`);
