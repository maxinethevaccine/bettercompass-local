// Gates the rest of this extension behind a shared password, whose hash
// (never the password itself) is published in this fork's GitHub repo at
// access.json. That means the password can be changed - or someone's
// access revoked - just by editing that one file, without rebuilding or
// re-releasing anything: everyone re-checks it on their next page load.
//
// What this is and isn't: it's a "don't use this without being given the
// password" gate for casual sharing with friends, done entirely in your
// own browser with no real server behind it (same as everything else in
// this extension). Someone determined enough to read this file could
// patch around it. It's not meant to withstand that - it's meant to stop
// someone just finding the public repo and using it without being told
// the password.
//
// Used by bootstrap.js (the main app) and launcher.js (the floating
// button) - whichever of them runs on a given page awaits
// window.__bcxAccessGranted before doing anything else.
;(function () {
  if (window.__bcxAccessGranted) return // another script on this page already set this up

  var OWNER_REPO = "maxinethevaccine/bettercompass-local"
  var HASH_URL =
    "https://raw.githubusercontent.com/" + OWNER_REPO + "/main/access.json"
  var CACHE_KEY = "bcx:accessVerified"
  var CHECK_TIMEOUT_MS = 2500

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

  function sha256Hex(text) {
    var enc = new TextEncoder().encode(text)
    return crypto.subtle.digest("SHA-256", enc).then(function (buf) {
      return Array.prototype.map
        .call(new Uint8Array(buf), function (b) {
          return b.toString(16).padStart(2, "0")
        })
        .join("")
    })
  }

  function readCache() {
    try {
      return JSON.parse(localStorage.getItem(CACHE_KEY))
    } catch (e) {
      return null
    }
  }

  function writeCache(hash) {
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ hash: hash, verifiedAt: Date.now() })
      )
    } catch (e) {}
  }

  function show404() {
    document.documentElement.innerHTML =
      "<head><title>404 Not Found</title></head>" +
      '<body style="font:16px/1.5 system-ui,sans-serif;margin:40px;color:#222;background:#fff">' +
      '<h1 style="font-size:22px;border-bottom:1px solid #ccc;padding-bottom:10px">Not Found</h1>' +
      "<p>The requested URL was not found on this server.</p>" +
      "</body>"
  }

  function showPrompt(onSubmit) {
    var overlay = document.createElement("div")
    overlay.style.cssText =
      "position:fixed;inset:0;z-index:2147483647;background:#1e1e1e;" +
      "display:flex;align-items:center;justify-content:center;" +
      "font-family:system-ui,-apple-system,sans-serif"
    overlay.innerHTML =
      '<div style="background:#2a2a2a;padding:28px 32px;border-radius:10px;width:300px;' +
      'box-shadow:0 10px 40px rgba(0,0,0,.5)">' +
      '<div style="color:#fff;font-size:15px;margin-bottom:14px">BetterCompass</div>' +
      '<form id="bcx-access-form">' +
      '<input type="password" id="bcx-access-pw" autocomplete="current-password" placeholder="Password" ' +
      'style="width:100%;box-sizing:border-box;padding:10px;border-radius:6px;border:1px solid #444;' +
      'background:#1e1e1e;color:#fff;font-size:14px" />' +
      '<button type="submit" style="margin-top:10px;width:100%;padding:10px;border-radius:6px;' +
      'border:none;background:#4b8bf4;color:#fff;font-size:14px;cursor:pointer">Continue</button>' +
      "</form></div>"
    document.documentElement.appendChild(overlay)
    var form = overlay.querySelector("#bcx-access-form")
    var input = overlay.querySelector("#bcx-access-pw")
    input.focus()
    form.addEventListener("submit", function (e) {
      e.preventDefault()
      overlay.remove()
      onSubmit(input.value)
    })
  }

  window.__bcxAccessGranted = withTimeout(
    fetch(HASH_URL).then(function (r) {
      return r.ok ? r.json() : null
    }),
    CHECK_TIMEOUT_MS
  ).then(function (config) {
    var requiredHash = config && config.passwordHash
    var cached = readCache()

    if (!requiredHash) {
      // Couldn't reach GitHub, or nothing's published there. If this
      // browser was verified before, give it the benefit of the doubt
      // rather than locking someone out over a network hiccup.
      if (cached && cached.hash) return true
      show404()
      return false
    }

    if (cached && cached.hash === requiredHash) {
      return true // already verified against the CURRENT password
    }

    return new Promise(function (resolve) {
      showPrompt(function (entered) {
        sha256Hex(entered || "").then(function (hash) {
          if (hash === requiredHash) {
            writeCache(hash)
            resolve(true)
          } else {
            show404()
            resolve(false)
          }
        })
      })
    })
  })
})()
