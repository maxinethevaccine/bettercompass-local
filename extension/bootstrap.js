// Loads BetterCompass's app code and stylesheet, and - this is the whole
// point of this file - checks whether a newer build has been published to
// GitHub first, and runs THAT instead if so. This means the extension
// effectively self-updates without you ever having to go to
// chrome://extensions and reload it: the code that actually runs is
// whatever's newest, even though the installed extension's own version
// number (in chrome://extensions) stays at whatever you last loaded.
//
// How: this fetches the JS/CSS text (either the bundled copy that ships
// with the extension, or a newer copy downloaded from GitHub) and runs it
// with eval() from right here, rather than inserting a <script> tag into
// the Compass page. That keeps it running in this content script's own
// "isolated world" - the same place the old direct-script-tag approach
// ran in - so chrome.* APIs keep working and the Compass page's own CSP
// never gets a say in it.
//
// If GitHub is unreachable (offline, or blocked by a school's firewall -
// some do block github.com), this always falls back to the version that
// shipped with the extension. It never blocks longer than UPDATE_TIMEOUT_MS
// waiting on the network.

;(function () {
  "use strict"

  var OWNER_REPO = "maxinethevaccine/bettercompass-local"
  var UPDATE_TIMEOUT_MS = 2500
  var RUNNING_VERSION_KEY = "bcx:runningVersion"

  function compareVersions(a, b) {
    var pa = String(a).replace(/^v/, "").split(".").map(Number)
    var pb = String(b).replace(/^v/, "").split(".").map(Number)
    for (var i = 0; i < Math.max(pa.length, pb.length); i++) {
      var na = pa[i] || 0
      var nb = pb[i] || 0
      if (na > nb) return 1
      if (na < nb) return -1
    }
    return 0
  }

  function installedVersion() {
    try {
      return chrome.runtime.getManifest().version
    } catch (e) {
      return "0.0.0"
    }
  }

  function setRunningVersion(v) {
    try {
      localStorage.setItem(RUNNING_VERSION_KEY, v)
    } catch (e) {}
  }

  function runLocalBundle() {
    setRunningVersion(installedVersion())
    fetchAndRun(
      chrome.runtime.getURL("app/css/app.css"),
      chrome.runtime.getURL("app/js/app.js"),
      true
    )
  }

  function fetchAndRun(cssUrl, jsUrl, isLocalFallback) {
    fetch(cssUrl)
      .then(function (r) {
        return r.text()
      })
      .then(function (css) {
        var style = document.createElement("style")
        style.textContent = css
        document.documentElement.appendChild(style)
      })
      .catch(function () {})

    fetch(jsUrl)
      .then(function (r) {
        if (!r.ok) throw new Error("bad response " + r.status)
        return r.text()
      })
      .then(function (js) {
        ;(0, eval)(js)
      })
      .catch(function (e) {
        console.error("BetterCompass: failed to load app code.", e)
        if (!isLocalFallback) {
          // The remote copy failed part way through - fall back to the
          // bundled one rather than leaving a blank page.
          runLocalBundle()
        }
      })
  }

  function withTimeout(promise, ms) {
    return new Promise(function (resolve) {
      var timer = setTimeout(function () {
        resolve(null)
      }, ms)
      promise.then(
        function (v) {
          clearTimeout(timer)
          resolve(v)
        },
        function () {
          clearTimeout(timer)
          resolve(null)
        }
      )
    })
  }

  var checked = withTimeout(
    fetch("https://api.github.com/repos/" + OWNER_REPO + "/releases/latest", {
      headers: { Accept: "application/vnd.github+json" }
    })
      .then(function (r) {
        return r.ok ? r.json() : null
      })
      .then(function (data) {
        if (!data || !data.tag_name) return null
        var latest = data.tag_name.replace(/^v/, "")
        if (compareVersions(latest, installedVersion()) <= 0) return null
        return { version: latest, tag: data.tag_name }
      }),
    UPDATE_TIMEOUT_MS
  )

  checked.then(function (update) {
    if (!update) {
      runLocalBundle()
      return
    }
    var base =
      "https://github.com/" +
      OWNER_REPO +
      "/releases/download/" +
      update.tag +
      "/"
    setRunningVersion(update.version)
    fetchAndRun(base + "app.css", base + "app.js", false)
  })
})()
