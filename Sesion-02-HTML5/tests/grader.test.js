/**
 * Grader / Tests para la Tarea Sesion 2 - HTML
 *
 * NO requiere dependencias externas. Solo Node.js 18+.
 *
 *   node tests/grader.test.js
 *
 * El script lee los .html de la raiz y verifica que cumplan
 * con los requisitos de la sesion. Si todo pasa, imprime PASS.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

let passed = 0;
let failed = 0;
const results = [];

function check(name, ok, detail = "") {
  if (ok) {
    passed++;
    results.push({ ok: true, name, detail });
  } else {
    failed++;
    results.push({ ok: false, name, detail });
  }
}

function readFile(p) {
  return fs.readFileSync(p, "utf-8");
}

function exists(p) {
  return fs.existsSync(p);
}

function findHtmlFiles() {
  return fs
    .readdirSync(ROOT)
    .filter((f) => f.endsWith(".html"))
    .map((f) => path.join(ROOT, f));
}

// === 1) Estructura minima: 4 paginas HTML ===
const htmlFiles = findHtmlFiles();
check(
  "1. Existen al menos 4 archivos .html en la raiz",
  htmlFiles.length >= 4,
  `Encontrados: ${htmlFiles.length} (${htmlFiles.map((f) => path.basename(f)).join(", ")})`
);

// === 2) Cada HTML debe tener estructura HTML5 basica ===
htmlFiles.forEach((file) => {
  const content = readFile(file);
  const base = path.basename(file);

  check(`2.${base} usa <!DOCTYPE html>`, /<!DOCTYPE\s+html>/i.test(content));
  check(`2.${base} tiene <html lang="...">`, /<html\s+[^>]*lang=/i.test(content));
  check(`2.${base} tiene <head> con <title>`, /<head>[\s\S]*<title>[\s\S]+<\/title>[\s\S]*<\/head>/i.test(content));
  check(`2.${base} tiene <body>`, /<body>[\s\S]*<\/body>/i.test(content));
});

// === 3) Elementos semanticos (al menos en index.html) ===
const indexFile = path.join(ROOT, "index.html");
if (exists(indexFile)) {
  const html = readFile(indexFile);
  check("3. index.html usa <header>", /<header[\s>]/i.test(html));
  check("3. index.html usa <main>", /<main[\s>]/i.test(html));
  check("3. index.html usa <footer>", /<footer[\s>]/i.test(html));
  check("3. index.html usa <article> o <section>", /<(article|section)[\s>]/i.test(html));
  check("3. index.html usa <nav>", /<nav[\s>]/i.test(html));
}

// === 4) Navegacion entre paginas (anchors) ===
const linkRe = /<a\s+[^>]*href\s*=\s*["']([^"']+)["']/gi;
let allHrefs = [];
htmlFiles.forEach((file) => {
  const content = readFile(file);
  let m;
  while ((m = linkRe.exec(content)) !== null) {
    allHrefs.push(m[1]);
  }
});
const localHrefs = allHrefs.filter(
  (h) => !h.startsWith("http") && !h.startsWith("mailto:") && !h.startsWith("tel:") && !h.startsWith("#")
);
check(
  "4. Hay al menos 1 enlace entre paginas (.html)",
  localHrefs.length >= 1,
  `Encontrados: ${localHrefs.length}`
);

// === 5) Enlaces externos con rel="noopener" ===
const externalLinks = allHrefs.filter((h) => h.startsWith("http"));
let extWithRel = 0;
externalLinks.forEach((href) => {
  htmlFiles.forEach((file) => {
    const content = readFile(file);
    const linkMatches = content.match(
      new RegExp(`<a[^>]*href=["']${href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*>`, "gi")
    );
    if (linkMatches) {
      linkMatches.forEach((lm) => {
        if (/rel\s*=\s*["'][^"']*noopener/i.test(lm)) extWithRel++;
      });
    }
  });
});
if (externalLinks.length > 0) {
  check(
    "5. Enlaces externos tienen rel=\"noopener\"",
    extWithRel >= externalLinks.length,
    `${extWithRel}/${externalLinks.length} enlaces externos`
  );
} else {
  check("5. (opcional) Hay al menos 1 enlace externo", true, "omitido");
}

// === 6) Imagenes con alt y loading="lazy" ===
let imgsWithAlt = 0;
let imgsWithLazy = 0;
let totalImgs = 0;
htmlFiles.forEach((file) => {
  const content = readFile(file);
  const imgRe = /<img\s+[^>]*>/gi;
  let m;
  while ((m = imgRe.exec(content)) !== null) {
    totalImgs++;
    if (/alt\s*=\s*["'][^"']+["']/i.test(m[0])) imgsWithAlt++;
    if (/loading\s*=\s*["']lazy["']/i.test(m[0])) imgsWithLazy++;
  }
});
check(
  "6. Todas las imagenes tienen alt",
  totalImgs === 0 || imgsWithAlt === totalImgs,
  `${imgsWithAlt}/${totalImgs} imagenes con alt`
);
check(
  "6. Al menos 1 imagen con loading=\"lazy\"",
  imgsWithLazy >= 1,
  `Encontradas: ${imgsWithLazy}`
);

// === 7) APIs modernas: <dialog>, popover, command ===
if (exists(indexFile)) {
  const html = readFile(indexFile);
  check("7. index.html usa <dialog>", /<dialog[\s>]/i.test(html));
  check("7. index.html usa popover (atributo o popovertarget)", /popover|popovertarget/i.test(html));
  check("7. index.html usa command/commandfor (Invoker Commands)", /command\s*=/i.test(html) || /commandfor\s*=/i.test(html));
}

// === 8) Formulario con al menos un input ===
let hasForm = false;
let hasInput = false;
htmlFiles.forEach((file) => {
  const content = readFile(file);
  if (/<form[\s>]/i.test(content)) hasForm = true;
  if (/<input[\s>]/i.test(content)) hasInput = true;
});
check("8. Hay al menos un <form>", hasForm);
check("8. Hay al menos un <input>", hasInput);

// === Imprimir resultados ===
console.log("\n========== RESULTADOS ==========");
results.forEach((r) => {
  const mark = r.ok ? "✓" : "✗";
  const color = r.ok ? "\x1b[32m" : "\x1b[31m";
  console.log(`${color}${mark}\x1b[0m ${r.name}${r.detail ? "  —  " + r.detail : ""}`);
});
console.log("=================================");
console.log(`Total: ${passed} pasaron, ${failed} fallaron.`);
console.log("");

if (failed === 0) {
  console.log("\x1b[32m¡FELICIDADES! Todos los tests pasaron.\x1b[0m");
  process.exit(0);
} else {
  console.log("\x1b[31mHay requisitos pendientes. Revisa los items marcados con ✗.\x1b[0m");
  process.exit(1);
}
