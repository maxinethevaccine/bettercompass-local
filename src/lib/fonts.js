// Font customization: which fonts can be picked, which parts of the app can
// each have their own, and the CSS that applies the choice.

// Fonts that come with Windows, macOS or ChromeOS. Each has fallbacks, so a
// font that is missing on one computer still gives something similar.
export const BUILT_IN_FONTS = [
  { name: "Roboto (default)", value: "" },
  { name: "System font", value: 'system-ui, -apple-system, "Segoe UI", sans-serif' },
  { name: "Arial", value: "Arial, Helvetica, sans-serif" },
  { name: "Helvetica", value: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
  { name: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { name: "Tahoma", value: "Tahoma, Geneva, sans-serif" },
  { name: "Trebuchet MS", value: '"Trebuchet MS", "Lucida Grande", sans-serif' },
  { name: "Century Gothic", value: '"Century Gothic", "Avenir Next", Futura, sans-serif' },
  { name: "Georgia", value: 'Georgia, "Times New Roman", serif' },
  { name: "Times New Roman", value: '"Times New Roman", Times, serif' },
  { name: "Garamond", value: 'Garamond, "EB Garamond", Baskerville, serif' },
  { name: "Palatino", value: '"Palatino Linotype", Palatino, "Book Antiqua", serif' },
  { name: "Courier New", value: '"Courier New", Courier, monospace' },
  { name: "Monospace (code)", value: 'Consolas, Menlo, "Lucida Console", monospace' },
  { name: "Comic Sans", value: '"Comic Sans MS", "Chalkboard SE", "Comic Neue", cursive' },
  { name: "Brush Script", value: '"Brush Script MT", "Snell Roundhand", cursive' },
  { name: "Impact", value: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif' }
]

// The parts of the app that can each have their own font. "selector" is
// written relative to the app root.
export const FONT_AREAS = [
  { key: "base", name: "Everything", hint: "The main font for the whole app." },
  {
    key: "headings",
    name: "Headings and titles",
    selector:
      ":is(h1, h2, h3, h4, h5, h6, .v-toolbar__title, .v-card__title, .v-card__subtitle, [class*='text-h'])"
  },
  { key: "nav", name: "Sidebar menu", selector: ".v-navigation-drawer" },
  { key: "buttons", name: "Buttons and tabs", selector: ":is(.v-btn, .v-tab, .v-chip)" },
  { key: "calendar", name: "Calendar and timetable", selector: ".v-calendar" },
  { key: "tables", name: "Tables and lists", selector: ":is(.v-data-table, .v-list)" },
  {
    key: "inputs",
    name: "Text boxes and search",
    selector: ":is(.v-input, .v-text-field, input, textarea)"
  }
]

export const UPLOADED_FAMILY = "BCX Uploaded Font"
export const MAX_FONT_FILE_BYTES = 1024 * 1024

export function defaultFonts() {
  return {
    base: "",
    headings: "",
    nav: "",
    buttons: "",
    calendar: "",
    tables: "",
    inputs: "",
    scale: 100,
    custom: [],
    uploaded: null
  }
}

// Only letters, digits, spaces and a few safe characters are let through, so
// a typed font name cannot break out of the CSS.
export function cleanFontName(name) {
  return String(name || "")
    .replace(/[^A-Za-z0-9 _\-.']/g, "")
    .replace(/'/g, "")
    .trim()
    .slice(0, 60)
}

function customValue(name) {
  return '"' + cleanFontName(name) + '", sans-serif'
}

const UPLOADED_VALUE = '"' + UPLOADED_FAMILY + '", sans-serif'

// Everything that can be chosen right now: built-in fonts, fonts the user
// typed the name of, and the uploaded font file.
export function fontChoices(fonts) {
  const f = fonts || {}
  const list = BUILT_IN_FONTS.slice()
  ;(f.custom || []).forEach((name) => {
    const clean = cleanFontName(name)
    if (clean) list.push({ name: clean + " (installed font)", value: customValue(clean) })
  })
  if (f.uploaded && f.uploaded.dataUrl) {
    list.push({
      name: (f.uploaded.name || "Uploaded font") + " (uploaded)",
      value: UPLOADED_VALUE
    })
  }
  return list
}

export function customFontValue(name) {
  return customValue(name)
}

export function uploadedFontValue() {
  return UPLOADED_VALUE
}

// A stored value is only used if it is still one of the available choices.
function safeValue(fonts, value) {
  if (!value) return ""
  return fontChoices(fonts).some((c) => c.value === value) ? value : ""
}

// Icons are drawn with an icon font, so they must keep their own font.
const NOT_ICONS = ":not(.v-icon):not(.mdi):not(.material-icons)"

export function buildFontCss(fonts) {
  const f = Object.assign(defaultFonts(), fonts || {})
  const out = []

  if (f.uploaded && /^data:(font|application)\//.test(f.uploaded.dataUrl || "")) {
    out.push(
      '@font-face{font-family:"' +
        UPLOADED_FAMILY +
        '";src:url(' +
        JSON.stringify(f.uploaded.dataUrl) +
        ");font-display:swap}"
    )
  }

  const scale = Math.min(140, Math.max(75, Number(f.scale) || 100))
  if (scale !== 100) out.push("html{font-size:" + (16 * scale) / 100 + "px !important}")

  const base = safeValue(f, f.base)
  if (base) {
    out.push(
      ".v-application,.v-application *" +
        NOT_ICONS +
        ",.Vue-Toastification__toast,.Vue-Toastification__toast *" +
        NOT_ICONS +
        "{font-family:" +
        base +
        " !important}"
    )
  }

  FONT_AREAS.forEach((area) => {
    if (!area.selector) return
    const value = safeValue(f, f[area.key])
    if (!value) return
    // Listed twice (the element itself and everything inside it) and with
    // one more class than the "Everything" rule, so it wins over it.
    out.push(
      ".v-application.v-application " +
        area.selector +
        NOT_ICONS +
        ",.v-application.v-application " +
        area.selector +
        " *" +
        NOT_ICONS +
        "{font-family:" +
        value +
        " !important}"
    )
  })

  return out.join("\n")
}

export function applyFonts(fonts) {
  let el = document.getElementById("bcx-fonts")
  if (!el) {
    el = document.createElement("style")
    el.id = "bcx-fonts"
    el.setAttribute("data-bc", "fonts")
    document.head.appendChild(el)
  }
  const css = buildFontCss(fonts)
  if (el.textContent !== css) el.textContent = css
}

export function readFontFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error("No file chosen."))
    if (!/\.(ttf|otf|woff2?)$/i.test(file.name)) {
      return reject(new Error("That is not a font file. Use a .ttf, .otf, .woff or .woff2 file."))
    }
    if (file.size > MAX_FONT_FILE_BYTES) {
      return reject(new Error("That font file is too big. The limit is 1 MB."))
    }
    const ext = file.name.split(".").pop().toLowerCase()
    const reader = new FileReader()
    reader.onerror = () => reject(new Error("Could not read that file."))
    reader.onload = () => {
      // Always store it with a font type, whatever the browser guessed.
      const base64 = String(reader.result).split(",")[1] || ""
      const dataUrl = "data:font/" + ext + ";base64," + base64
      // Let the browser confirm it really is a usable font.
      const probe = new FontFace("BCX Font Probe", "url(" + JSON.stringify(dataUrl) + ")")
      probe
        .load()
        .then(() =>
          resolve({ name: file.name.replace(/\.[^.]+$/, "").slice(0, 40), dataUrl })
        )
        .catch(() => reject(new Error("The browser could not use that font file.")))
    }
    reader.readAsDataURL(file)
  })
}
