// Auto-update for BetterCompass.
//
// Chrome will not update an extension installed with "Load unpacked", and it
// will not let a content script run downloaded code. What it does allow:
// this background worker downloads the newest app.js / app.css from this
// fork's latest GitHub release and keeps them in extension storage, and
// starts whichever copy is newest (downloaded or bundled) in the page when
// loader.js asks for it. So the BetterCompass app updates itself; only manifest.json,
// loader.js, launcher.js, finder.js and this file still need a manual
// reinstall when they change.

const REPO = "maxinethevaccine/bettercompass-local"
const LATEST_URL = "https://github.com/" + REPO + "/releases/latest"
const CHECK_EVERY_MS = 10 * 60 * 1000
const MIN_JS_BYTES = 200 * 1024
const MIN_CSS_BYTES = 50 * 1024

function compareVersions(a, b) {
  const pa = String(a).replace(/^v/, "").split(".").map(Number)
  const pb = String(b).replace(/^v/, "").split(".").map(Number)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] || 0
    const nb = pb[i] || 0
    if (na > nb) return 1
    if (na < nb) return -1
  }
  return 0
}

const bundledVersion = chrome.runtime.getManifest().version
let bundled = null
let checking = null

// The copy inside the extension. Chrome loads these files itself, by path -
// nothing here reads their contents, so this cannot fail the way reading
// them could (v2.0.0 and v2.0.1 read them with fetch(), which died with
// "Failed to fetch" if the folder on disk had been swapped under a running
// Chrome, leaving the page dead).
function bundledApp() {
  return { version: bundledVersion, source: "bundled" }
}

// The downloaded copy, if it is newer than the bundled one and has not
// been marked as broken. Otherwise null.
async function getDownloaded() {
  const s = await chrome.storage.local.get(["remote", "bad"])
  const remote = s.remote
  if (!remote || !remote.js || !remote.css) return null
  if (compareVersions(remote.version, bundledVersion) <= 0) {
    await chrome.storage.local.remove("remote")
    return null
  }
  if ((s.bad || []).includes(remote.version)) return null
  return { version: remote.version, source: "github", js: remote.js, css: remote.css }
}

// Looks at the latest release. If it is newer than what we have, downloads
// app.js and app.css from it. Resolves to the new version, or null.
async function checkForUpdate(force) {
  const s = await chrome.storage.local.get(["remote", "bad", "lastCheck"])
  if (!force && s.lastCheck && Date.now() - s.lastCheck < CHECK_EVERY_MS) return null
  await chrome.storage.local.set({ lastCheck: Date.now() })

  // github.com/<repo>/releases/latest redirects to .../releases/tag/<tag>
  const res = await fetch(LATEST_URL, { redirect: "follow", cache: "no-store" })
  if (!res.ok) return null
  const m = /\/releases\/tag\/([^/?#]+)/.exec(res.url)
  if (!m) return null
  const tag = decodeURIComponent(m[1])
  const version = tag.replace(/^v/, "")
  if (!/^\d+(\.\d+)*$/.test(version)) return null

  const have =
    s.remote && compareVersions(s.remote.version, bundledVersion) > 0
      ? s.remote.version
      : bundledVersion
  if (compareVersions(version, have) <= 0) return null
  if ((s.bad || []).includes(version)) return null

  const base =
    "https://github.com/" + REPO + "/releases/download/" + encodeURIComponent(tag) + "/"
  const [jsRes, cssRes] = await Promise.all([
    fetch(base + "app.js", { cache: "no-store" }),
    fetch(base + "app.css", { cache: "no-store" })
  ])
  if (!jsRes.ok || !cssRes.ok) return null
  const [js, css] = await Promise.all([jsRes.text(), cssRes.text()])
  // A release without real files (or an error page) must never replace a
  // working copy.
  if (js.length < MIN_JS_BYTES || css.length < MIN_CSS_BYTES) return null
  if (js.trimStart().startsWith("<")) return null

  await chrome.storage.local.set({ remote: { version, js, css, savedAt: Date.now() } })
  return version
}

function checkInBackground(tabId, force) {
  if (!checking) {
    checking = checkForUpdate(force)
      .catch(() => null)
      .then((v) => {
        checking = null
        return v
      })
  }
  checking.then((version) => {
    if (version && tabId != null) {
      chrome.tabs
        .sendMessage(tabId, { type: "bcx-update-ready", version })
        .catch(() => {})
    }
  })
}

// Marks which version is running, for the app and for loader.js.
function markVersion(version, source) {
  document.documentElement.dataset.bcxVersion = version
  document.documentElement.dataset.bcxSource = source
}

// Runs a downloaded copy. Chrome does not let a content script run
// downloaded code, but the page itself may, so it goes in as a page script.
function startDownloadedApp(code, version, source) {
  document.documentElement.dataset.bcxVersion = version
  document.documentElement.dataset.bcxSource = source
  ;(0, eval)(code)
}

async function putBundledInTab(tabId) {
  const target = { tabId }
  await chrome.scripting.insertCSS({ target, files: ["app/css/app.css"] })
  await chrome.scripting.executeScript({
    target,
    world: "MAIN",
    func: markVersion,
    args: [bundledVersion, "bundled"]
  })
  await chrome.scripting.executeScript({
    target,
    world: "MAIN",
    files: ["app/js/app.js"]
  })
}

async function putDownloadedInTab(tabId, app) {
  const target = { tabId }
  await chrome.scripting.insertCSS({ target, css: app.css })
  await chrome.scripting.executeScript({
    target,
    world: "MAIN",
    func: startDownloadedApp,
    args: [app.js, app.version, app.source]
  })
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || !msg.type) return
  if (msg.type === "bcx-get-app") {
    const tabId = sender.tab && sender.tab.id
    ;(async () => {
      let downloaded = null
      try {
        downloaded = await getDownloaded()
      } catch (e) {}

      if (downloaded) {
        try {
          await putDownloadedInTab(tabId, downloaded)
          sendResponse({ version: downloaded.version, source: downloaded.source })
          checkInBackground(tabId, false)
          return
        } catch (e) {
          // A downloaded copy that will not even go into the page is no
          // use: drop it and fall through to the bundled one.
          await chrome.storage.local.remove("remote").catch(() => {})
        }
      }

      const app = bundledApp()
      await putBundledInTab(tabId)
      sendResponse({ version: app.version, source: app.source })
      checkInBackground(tabId, false)
    })().catch((e) => sendResponse({ error: String((e && e.message) || e) }))
    return true
  }
  if (msg.type === "bcx-bad-version") {
    // loader.js reports that a downloaded version did not start.
    ;(async () => {
      const s = await chrome.storage.local.get(["bad"])
      const bad = (s.bad || []).filter((v) => v !== msg.version)
      bad.push(msg.version)
      await chrome.storage.local.set({ bad: bad.slice(-20) })
      await chrome.storage.local.remove("remote")
      sendResponse(true)
    })().catch(() => sendResponse(false))
    return true
  }
  if (msg.type === "bcx-check-now") {
    checkInBackground(sender.tab && sender.tab.id, true)
    sendResponse(true)
  }
})
