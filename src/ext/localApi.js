// Replaces the BetterCompass proxy ("/api/v1/*") with a local, in-browser backend.
// Compass requests (/Services/*, /graphql, downloads) go straight to the school's
// Compass server from the logged-in browser session, so no proxy or token is needed.
// Settings and custom themes are stored in this browser's localStorage under "bcx:".
import axios from "axios"
import builtinThemes from "./themes.json"
import userDefaults from "./userDefaults.json"

const PREFIX = "bcx:"
const clone = (o) => JSON.parse(JSON.stringify(o))

function read(key, fallback) {
  try {
    const v = localStorage.getItem(PREFIX + key)
    return v === null ? fallback : JSON.parse(v)
  } catch (e) {
    return fallback
  }
}
function write(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch (e) {
    /* storage full or blocked: settings simply won't persist */
  }
}

function fail(config, status, name, message) {
  const err = new Error(message)
  err.isAxiosError = true
  err.config = config
  err.response = {
    status,
    statusText: message,
    headers: {},
    config,
    data: { errors: [{ name, message, status }] }
  }
  return err
}
function ok(config, data, status = 200) {
  return Promise.resolve({
    data: data === undefined ? "" : data,
    status,
    statusText: "OK",
    headers: {},
    config,
    request: {}
  })
}

const SKIP = ["themeId", "accentColor", "settings"]
const SETTING_KEYS = Object.keys(userDefaults).filter((k) => !SKIP.includes(k))

function settings() {
  // weather is off by default: the proxy's weather route called third-party services
  return { ...clone(userDefaults), weather: false, ...read("settings", {}) }
}

function themeList() {
  const uid = read("uid", 0)
  const mine = read("themes", []).map((t) => ({
    ...t,
    user: { id: uid, sussiId: read("sussiId", "you") }
  }))
  const builtin = clone(builtinThemes).map((t) => ({
    ...t,
    user: { id: 1, sussiId: "BetterCompass" }
  }))
  return [...builtin, ...mine]
}

function leaveToCompass() {
  window.location.href = "/"
}

function showProblem(text, askId) {
  console.error("BetterCompass:", text)
  let el = document.getElementById("bcx-problem")
  if (!el) {
    el = document.createElement("div")
    el.id = "bcx-problem"
    el.style.cssText =
      "position:fixed;z-index:2147483647;left:0;right:0;top:0;padding:12px 16px;background:#b00020;" +
      "color:#fff;font:14px/1.4 system-ui,sans-serif;max-height:60vh;overflow:auto"
    document.body.appendChild(el)
  }
  el.textContent = ""
  const msg = document.createElement("div")
  msg.style.whiteSpace = "pre-wrap"
  msg.textContent = "BetterCompass could not load your Compass account.\n" + text
  el.appendChild(msg)
  if (askId) {
    const row = document.createElement("div")
    row.style.marginTop = "8px"
    const input = document.createElement("input")
    input.placeholder = "Your Compass user ID"
    input.inputMode = "numeric"
    input.style.cssText = "padding:6px;margin-right:8px;width:200px"
    const btn = document.createElement("button")
    btn.textContent = "Save and reload"
    btn.style.cssText = "padding:6px 10px;cursor:pointer"
    btn.onclick = () => {
      const n = parseInt(input.value, 10)
      if (n > 0) {
        write("uid", n)
        window.location.reload()
      }
    }
    row.appendChild(input)
    row.appendChild(btn)
    const hint = document.createElement("div")
    hint.style.cssText = "margin-top:6px;font-size:12px;opacity:.9"
    hint.textContent =
      "Find it in Compass: open your own profile (click your name) and copy the number after userId= in the address bar."
    el.appendChild(row)
    el.appendChild(hint)
  }
}

const ROLES = ["GUEST", "STUDENT", "STAFF", "PARENT", "ADMIN", "VISITOR", "NOT AUTHENTICATED", "UNKNOWN"]

async function compassPost(path, body) {
  const res = await window.fetch(path, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  })
  const text = await res.text()
  let json = null
  try {
    json = JSON.parse(text)
  } catch (e) {
    /* not JSON */
  }
  return { status: res.status, text, json }
}

// Compass pages define the logged-in user's id in their own scripts; read it from the page source.
async function sniffUserId() {
  try {
    const res = await window.fetch("/", { credentials: "include" })
    const html = await res.text()
    const m = /organisationUserId["']?\s*[:=]\s*(\d+)/.exec(html)
    return m ? parseInt(m[1], 10) : null
  } catch (e) {
    return null
  }
}

function splitName(full) {
  const name = String(full || "").trim()
  if (name.includes(",")) {
    const [last, first] = name.split(",").map((x) => x.trim())
    return { firstName: first || "", lastName: last || "" }
  }
  const parts = name.split(/\s+/)
  return { firstName: parts[0] || "", lastName: parts.slice(1).join(" ") }
}

async function currentUser(config) {
  let id = read("uid", null)
  if (!id) id = await sniffUserId()
  if (!id) {
    showProblem(
      "I could not work out your Compass user ID automatically (make sure you are logged in to Compass).",
      true
    )
    throw fail(config, 401, "noUserId", "Compass user ID unknown.")
  }
  let r
  try {
    r = await compassPost("/Services/User.svc/GetUserDetailsBlobByUserId", {
      userId: id,
      targetUserId: id
    })
  } catch (e) {
    showProblem("Request to Compass failed: " + e.message)
    throw fail(config, 503, "compassUnreachable", "Could not reach Compass.")
  }
  const d = r.json && r.json.d
  if (!d || !d.userId) {
    localStorage.removeItem(PREFIX + "uid")
    showProblem(
      "Compass did not return an account for user ID " + id + " (HTTP " + r.status + "). If you are logged in, " +
        "the ID may be wrong.\nReply: " + r.text.replace(/\s+/g, " ").slice(0, 300),
      true
    )
    throw fail(config, 401, "notLoggedIn", "Not logged in to Compass.")
  }
  const names = splitName(d.userFullName)
  const photo = /[0-9a-fA-F]{8}-[0-9a-fA-F-]{27}/.exec(String(d.userPhotoPath || ""))
  const u = {
    id,
    userId: id,
    username: d.userSussiID || "",
    sussiId: d.userSussiID || "",
    firstName: names.firstName,
    lastName: names.lastName,
    reportName: d.userFullName || "",
    imageGuid: photo ? photo[0] : "",
    personalEmail: d.userEmail || null,
    baseRole: ROLES[d.userRole] || "STUDENT",
    children: []
  }
  write("uid", id)
  write("sussiId", u.username)
  localStorage.setItem("userId", String(id))
  return u
}

function bcUser(u) {
  const s = settings()
  const themeId = read("themeId", 1)
  const themes = themeList()
  const themeObject = themes.find((t) => t.id === themeId) || themes[0]
  return {
    ...s,
    id: u.userId,
    compassUserId: u.userId,
    sussiId: u.username,
    instance: window.location.hostname.split(".")[0],
    themeId: themeObject.id,
    accentColor: read("accent", null),
    themeObject: clone(themeObject)
  }
}

const ROUTES = [
  ["GET", /^\/api\/v1\/state$/, async (c) => ({
    release: "stable",
    loading: false,
    notification: "",
    latestVersion: process.env.VUE_APP_VERSION || "1.0.0"
  })],
  ["GET", /^\/api\/v1\/user$/, async (c) => {
    const u = await currentUser(c)
    return { bcUser: bcUser(u), ...u }
  }],
  ["POST", /^\/api\/v1\/user\/logout$/, async () => {
    setTimeout(leaveToCompass, 50)
    return null
  }],
  ["PUT", /^\/api\/v1\/user\/settings\/full$/, async (c, body) => {
    const next = read("settings", {})
    SETTING_KEYS.forEach((k) => {
      if (body[k] !== undefined) next[k] = body[k]
    })
    write("settings", next)
    return null
  }],
  ["PUT", /^\/api\/v1\/user\/settings\/theme$/, async (c, body) => {
    if (!themeList().some((t) => t.id === body.id)) {
      throw fail(c, 400, "invalidParameter", "Invalid theme specified")
    }
    write("themeId", body.id)
    write("accent", body.accent || null)
    return null
  }],
  ["POST", /^\/api\/v1\/user\/create(\/alternate)?$/, async (c) => {
    const u = await currentUser(c)
    return { user: bcUser(u) }
  }],
  ["GET", /^\/api\/v1\/themes$/, async () => themeList()],
  ["POST", /^\/api\/v1\/themes$/, async (c, body) => {
    const t = body.theme
    if (!t || !t.name || !t.primaryType || !t.dark || !t.light) {
      throw fail(c, 400, "invalidParameter", "Theme validation failed.")
    }
    const mine = read("themes", [])
    const id = Math.max(1000, ...mine.map((x) => x.id)) + 1
    const row = {
      id,
      name: body.name,
      public: false,
      userId: read("uid", 0),
      theme: t
    }
    write("themes", [...mine, row])
    return row
  }],
  ["PUT", /^\/api\/v1\/themes\/(\d+)$/, async (c, body, m) => {
    const t = body.theme
    if (!t || !t.name || !t.primaryType || !t.dark || !t.light) {
      throw fail(c, 400, "invalidParameter", "Theme validation failed.")
    }
    const mine = read("themes", [])
    const row = mine.find((x) => x.id === Number(m[1]))
    if (!row) throw fail(c, 400, "invalidParameter", "Theme not found.")
    row.name = body.name
    row.theme = t
    write("themes", mine)
    return row
  }],
  ["DELETE", /^\/api\/v1\/themes\/(\d+)$/, async (c, body, m) => {
    const id = Number(m[1])
    const mine = read("themes", [])
    if (!mine.some((x) => x.id === id)) {
      throw fail(c, 400, "invalidParameter", "Theme not found.")
    }
    write("themes", mine.filter((x) => x.id !== id))
    if (read("themeId", 1) === id) write("themeId", 1)
    return null
  }],
  ["POST", /^\/api\/v1\/feedback$/, async () => null],
  ["GET", /^\/api\/v1\/communications$/, async () => []],
  ["GET", /^\/api\/v1\/weather$/, async (c) => {
    throw fail(c, 501, "unavailable", "Weather is not available in the extension.")
  }]
]

function parseBody(data) {
  if (!data) return {}
  if (typeof data === "object") return data
  try {
    return JSON.parse(data)
  } catch (e) {
    return {}
  }
}

async function local(config) {
  const path = String(config.url).split("?")[0]
  const method = String(config.method || "get").toUpperCase()
  for (const [m, re, fn] of ROUTES) {
    const match = m === method && re.exec(path)
    if (match) {
      const data = await fn(config, parseBody(config.data), match)
      return ok(config, data === null ? "" : data, data === null ? 204 : 200)
    }
  }
  throw fail(config, 404, "notFound", "Not available in the extension.")
}

// Headers meant for the proxy; Compass itself does not need them.
const PROXY_HEADERS = [
  "CompassAPIKey",
  "compassInstance",
  "compassSchoolId",
  "compassUserId"
]

// Diagnostics: for a few Compass calls, log only the *structure* of the reply (key names and
// types, never values) so layout changes can be debugged without exposing personal data.
function shapeOf(v, depth = 0) {
  if (v === null) return "null"
  if (Array.isArray(v)) return depth > 4 ? "[...]" : "[" + v.length + "] of " + (v.length ? shapeOf(v[0], depth + 1) : "?")
  if (typeof v === "object") {
    if (depth > 4) return "{...}"
    const keys = Object.keys(v).slice(0, 40)
    return "{" + keys.map((k) => k + ": " + shapeOf(v[k], depth + 1)).join(", ") + "}"
  }
  return typeof v === "string" ? "string(" + v.length + ")" : typeof v
}
const DIAG_URL = /Chronicle|GetEnrolmentsByActivityId|GetCalendarEventsByUser/i
const diagSeen = new Set()
function diag(config, res, failed) {
  try {
    const url = String(config.url).split("?")[0]
    if (diagSeen.has(url + failed)) return
    diagSeen.add(url + failed)
    if (failed || !res) {
      const body = res && res.data
      const text = body ? (typeof body === "string" ? body : JSON.stringify(body)).replace(/\s+/g, " ").slice(0, 300) : ""
      console.log("BCX diag", url, "FAILED, HTTP", res && res.status, text)
      return
    }
    if (/GetCalendarEventsByUser/i.test(url)) {
      const list = (res.data && res.data.d) || []
      const odd = Array.isArray(list) && list.find((e) => e && /[<&]/.test(String(e.longTitleWithoutTime)))
      if (odd) console.log("BCX diag sample event title:", JSON.stringify(odd.longTitleWithoutTime))
      return
    }
    console.log("BCX diag", url, "HTTP", res.status, "reply shape:", shapeOf(res.data))
  } catch (e) {
    /* diagnostics must never break the app */
  }
}

const original = axios.defaults.adapter
axios.defaults.adapter = function (config) {
  if (/^\/api\/v1\//.test(String(config.url))) return local(config)
  if (config.headers) {
    PROXY_HEADERS.forEach((h) => {
      delete config.headers[h]
      delete config.headers[h.toLowerCase()]
    })
  }
  const p = original(config)
  if (DIAG_URL.test(String(config.url))) {
    p.then(
      (res) => diag(config, res, false),
      (err) => diag(config, err && err.response, true)
    )
  }
  return p
}

// Values the app reads from localStorage (they used to be set by the login page).
export function initSchoolInfo() {
  const instance = window.location.hostname.split(".")[0]
  localStorage.setItem("schoolInstance", instance)
  localStorage.setItem("schoolFqdn", window.location.origin + "/")
  localStorage.setItem("schoolName", instance)
  localStorage.removeItem("apiKey")
}
