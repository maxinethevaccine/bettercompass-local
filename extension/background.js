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

// Reads one file out of a .zip, using the browser's own decompression - the
// release zip is always attached, so updating works even when the loose
// app.js/app.css files have been left off a release.
async function fileFromZip(buf, wanted) {
  const dv = new DataView(buf)
  let eocd = -1
  const floor = Math.max(0, buf.byteLength - 70000)
  for (let i = buf.byteLength - 22; i >= floor; i--) {
    if (dv.getUint32(i, true) === 0x06054b50) {
      eocd = i
      break
    }
  }
  if (eocd < 0) return null
  const count = dv.getUint16(eocd + 10, true)
  let p = dv.getUint32(eocd + 16, true)
  const dec = new TextDecoder()
  for (let i = 0; i < count; i++) {
    if (dv.getUint32(p, true) !== 0x02014b50) return null
    const method = dv.getUint16(p + 10, true)
    const compSize = dv.getUint32(p + 20, true)
    const nameLen = dv.getUint16(p + 28, true)
    const extraLen = dv.getUint16(p + 30, true)
    const commentLen = dv.getUint16(p + 32, true)
    const localOffset = dv.getUint32(p + 42, true)
    const name = dec.decode(new Uint8Array(buf, p + 46, nameLen))
    if (name === wanted) {
      const localNameLen = dv.getUint16(localOffset + 26, true)
      const localExtraLen = dv.getUint16(localOffset + 28, true)
      const dataStart = localOffset + 30 + localNameLen + localExtraLen
      const slice = buf.slice(dataStart, dataStart + compSize)
      if (method === 0) return dec.decode(slice)
      if (method !== 8) return null
      return await new Response(
        new Blob([slice]).stream().pipeThrough(new DecompressionStream("deflate-raw"))
      ).text()
    }
    p += 46 + nameLen + extraLen + commentLen
  }
  return null
}

// Gets the app's files out of a release: from the zip if it is there,
// otherwise from app.js/app.css attached on their own.
async function appFilesFromRelease(tag) {
  const base =
    "https://github.com/" + REPO + "/releases/download/" + encodeURIComponent(tag) + "/"
  try {
    const zipRes = await fetch(base + "BetterCompass-extension.zip", { cache: "no-store" })
    if (zipRes.ok) {
      const buf = await zipRes.arrayBuffer()
      const [js, css] = await Promise.all([
        fileFromZip(buf, "app/js/app.js"),
        fileFromZip(buf, "app/css/app.css")
      ])
      if (js && css) return { js, css }
    }
  } catch (e) {
    /* fall through to the loose files */
  }
  const [jsRes, cssRes] = await Promise.all([
    fetch(base + "app.js", { cache: "no-store" }),
    fetch(base + "app.css", { cache: "no-store" })
  ])
  if (!jsRes.ok || !cssRes.ok) return null
  const [js, css] = await Promise.all([jsRes.text(), cssRes.text()])
  return { js, css }
}

// Looks at the latest release and downloads it if it is newer than what we
// have. Resolves to { state, version }, where state is one of:
//   "current"     - nothing newer published
//   "downloaded"  - a newer version is now ready, waiting for a reload
//   "unreachable" - GitHub could not be reached (offline, or private repo)
//   "incomplete"  - there is a newer release, but its files are missing
async function checkForUpdate(force) {
  const s = await chrome.storage.local.get(["remote", "bad", "lastCheck"])
  if (!force && s.lastCheck && Date.now() - s.lastCheck < CHECK_EVERY_MS) {
    return { state: "current" }
  }
  await chrome.storage.local.set({ lastCheck: Date.now() })

  // github.com/<repo>/releases/latest redirects to .../releases/tag/<tag>
  let res
  try {
    res = await fetch(LATEST_URL, { redirect: "follow", cache: "no-store" })
  } catch (e) {
    return { state: "unreachable" }
  }
  if (!res.ok) return { state: "unreachable" }
  const m = /\/releases\/tag\/([^/?#]+)/.exec(res.url)
  if (!m) return { state: "unreachable" }
  const tag = decodeURIComponent(m[1])
  const version = tag.replace(/^v/, "")
  if (!/^\d+(\.\d+)*$/.test(version)) return { state: "current" }

  const have =
    s.remote && compareVersions(s.remote.version, bundledVersion) > 0
      ? s.remote.version
      : bundledVersion
  if (compareVersions(version, have) <= 0) return { state: "current" }
  if ((s.bad || []).includes(version)) return { state: "current" }

  const files = await appFilesFromRelease(tag)
  if (!files) return { state: "incomplete", version }
  const { js, css } = files
  // A release without real files (or an error page) must never replace a
  // working copy.
  if (js.length < MIN_JS_BYTES || css.length < MIN_CSS_BYTES) {
    return { state: "incomplete", version }
  }
  if (js.trimStart().startsWith("<")) return { state: "incomplete", version }

  await chrome.storage.local.set({ remote: { version, js, css, savedAt: Date.now() } })
  return { state: "downloaded", version }
}

function checkInBackground(tabId, force) {
  if (!checking) {
    checking = checkForUpdate(force)
      .catch(() => ({ state: "unreachable" }))
      .then((r) => {
        checking = null
        return r
      })
  }
  checking.then((result) => {
    if (tabId == null) return
    chrome.tabs
      .sendMessage(tabId, {
        type: "bcx-check-result",
        state: result.state,
        version: result.version || null
      })
      .catch(() => {})
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
