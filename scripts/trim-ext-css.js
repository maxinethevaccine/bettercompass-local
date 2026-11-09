// Keeps only the woff2 icon font in the extension CSS (the other formats are ~3 MB of duplicates).
const fs = require("fs")
const path = require("path")
const postcss = require("postcss")
const file = path.join(__dirname, "..", "extension", "app", "css", "app.css")
const css = fs.readFileSync(file, "utf8")
const root = postcss.parse(css)
root.walkAtRules("font-face", (rule) => {
  rule.walkDecls("src", (decl) => {
    if (!/format\(/.test(decl.value)) {
      decl.remove() // legacy IE9 declaration
      return
    }
    const parts = decl.value.split(/,(?=\s*url\()/).filter((p) => /format\(["']?woff2["']?\)/.test(p))
    if (parts.length) decl.value = parts.join(",")
  })
})
fs.writeFileSync(file, root.toString())
console.log("Trimmed", file, (fs.statSync(file).size / 1048576).toFixed(2) + " MB")

// Chrome rejects content scripts that contain Unicode non-characters.
for (const f of ["js/app.js", "css/app.css"]) {
  const text = fs.readFileSync(path.join(__dirname, "..", "extension", "app", f), "utf8")
  const bad = [...text].filter((c) => {
    const n = c.codePointAt(0)
    return (n >= 0xfdd0 && n <= 0xfdef) || (n & 0xfffe) === 0xfffe
  })
  if (bad.length) {
    console.error("ERROR: " + f + " contains " + bad.length + " Unicode non-character(s); Chrome would refuse to load it.")
    process.exit(1)
  }
}
console.log("Encoding check passed")
