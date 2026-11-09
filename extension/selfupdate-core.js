// Shared self-update helper, reused by bootstrap.js (the main app),
// launcher.js (the floating button on normal Compass pages), and
// finder.js (the script that reads your Compass user ID). All three of
// this extension's actual scripts are tiny loaders that hand their work
// off to this file, so EVERY piece of this extension's code - not just
// the main app bundle - gets checked for a newer version and run live if
// one exists.
//
// How it decides what to run, for each file:
//  1. Ask GitHub for this fork's latest release (one request, shared
//     across all callers on a given page load via a short-lived cache).
//  2. If it's newer than what's installed, fetch that file by name from
//     the release's assets and run it instead.
//  3. If GitHub can't be reached, the check times out, or nothing's
//     newer, run the copy bundled with the extension instead.
// Either way, the actual version used gets recorded so the rest of the
// app can show the true running version, not just whatever's in the
// installed extension's manifest.json (which never changes on its own -
// Chrome has no auto-update mechanism for an unpacked/"Load unpacked"
// extension like this one).
(function () {
  if (window.__bcxSelfUpdate) return // already defined by another script on this page

  var OWNER_REPO = "maxinethevaccine/bettercompass-local"
  var UPDATE_TIMEOUT_MS = 2500
  var RUNNING_VERSION_KEY = "bcx:runningVersion"
  var RELEASE_CACHE_KEY = "__bcxReleaseCheck" // in-memory only, per page load

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

  // One release lookup is shared by every caller on this page load
  // (bootstrap/launcher/finder each ask separately, but only the first
  // one actually hits the network - the rest reuse its in-flight result).
  function getLatestRelease() {
    if (!window[RELEASE_CACHE_KEY]) {
      window[RELEASE_CACHE_KEY] = withTimeout(
        fetch(
          "https://api.github.com/repos/" + OWNER_REPO + "/releases/latest",
          { headers: { Accept: "application/vnd.github+json" } }
        )
          .then(function (r) {
            return r.ok ? r.json() : null
          })
          .then(function (data) {
            if (!data || !data.tag_name) return null
            return { version: data.tag_name.replace(/^v/, ""), tag: data.tag_name }
          }),
        UPDATE_TIMEOUT_MS
      )
    }
    return window[RELEASE_CACHE_KEY]
  }

  function fetchText(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error("bad response " + r.status + " for " + url)
      return r.text()
    })
  }

  function runJs(text) {
    ;(0, eval)(text)
  }

  function runCss(text) {
    var style = document.createElement("style")
    style.textContent = text
    document.documentElement.appendChild(style)
  }

  function runLocal(opts) {
    setRunningVersion(installedVersion())
    if (opts.cssLocalUrl) fetchText(opts.cssLocalUrl).then(runCss).catch(function () {})
    fetchText(opts.jsLocalUrl)
      .then(runJs)
      .catch(function (e) {
        console.error("BetterCompass: failed to run " + opts.jsAssetName + ".", e)
      })
  }

  /**
   * opts: {
   *   jsAssetName: "app.js",            filename as attached to the release
   *   jsLocalUrl: chrome.runtime.getURL("app/js/app.js"),  bundled fallback
   *   cssAssetName: "app.css",          optional
   *   cssLocalUrl: chrome.runtime.getURL("app/css/app.css") optional
   * }
   */
  window.__bcxSelfUpdate = function (opts) {
    getLatestRelease().then(function (release) {
      if (!release || compareVersions(release.version, installedVersion()) <= 0) {
        runLocal(opts)
        return
      }
      var base =
        "https://github.com/" + OWNER_REPO + "/releases/download/" + release.tag + "/"
      setRunningVersion(release.version)
      if (opts.cssAssetName) {
        fetchText(base + opts.cssAssetName).then(runCss).catch(function () {})
      }
      fetchText(base + opts.jsAssetName)
        .then(runJs)
        .catch(function (e) {
          console.error(
            "BetterCompass: fetched update for " + opts.jsAssetName + " failed, falling back.",
            e
          )
          runLocal(opts)
        })
    })
  }
})()
