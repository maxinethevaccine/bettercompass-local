// Compass event titles can contain HTML (e.g. a struck-through original teacher followed by the
// substitute teacher). Turn them into safe plain text; `substituteTeacher` is true when a teacher
// was struck out.
const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

function parse(html) {
  return new DOMParser().parseFromString(String(html), "text/html")
}

export function cleanTitle(raw) {
  let doc = parse(raw == null ? "" : raw)
  // markup that arrived entity-encoded shows up as literal tags after the first parse
  for (let i = 0; i < 3; i++) {
    const text = doc.body.textContent || ""
    if (/<\/?[a-z][^>]*>|&(lt|gt|amp|nbsp|#\d+);/i.test(text)) doc = parse(text)
    else break
  }
  const struck = doc.body.querySelectorAll(
    "strike, s, del, [style*='line-through'], [class*='strike']"
  )
  const substituteTeacher = struck.length > 0
  struck.forEach((n) => n.remove())
  const text = (doc.body.textContent || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  return { text, html: escapeHtml(text), substituteTeacher }
}
