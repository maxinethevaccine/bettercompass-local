// What BetterCompass adds to ordinary Compass pages: the "BetterCompass"
// button, and a note of who is signed in for the app to pick up.
//
// background.js puts this into the page (launcher.js asks it to). A newer
// copy of this file inside a GitHub release replaces this one automatically,
// the same way the app itself updates. It runs as part of the page, so it
// has no access to extension APIs - keep it that way.

// A small "BetterCompass" button in the corner.
;(function () {
  if (window.top !== window.self || document.getElementById("bc-launcher")) return
  const host = document.createElement("div")
  host.id = "bc-launcher"
  host.style.cssText = "position:fixed;left:12px;bottom:12px;z-index:2147483647;"
  const root = host.attachShadow({ mode: "closed" })
  root.innerHTML =
    '<style>a{display:block;font:600 13px/1 system-ui,sans-serif;color:#fff;background:#0190ea;' +
    "padding:10px 14px;border-radius:20px;text-decoration:none;box-shadow:0 2px 8px rgba(0,0,0,.35);" +
    'opacity:.85}a:hover{opacity:1}</style><a href="/bettercompass">BetterCompass</a>'
  document.documentElement.appendChild(host)
})()

// Reads the signed-in user's id from Compass's own page script and hands it
// to BetterCompass through localStorage.
;(function () {
  try {
    var id = null
    var C = window.Compass
    if (C) {
      var keys = ["organisationUserId", "userId", "currentUserId", "loggedInUserId"]
      for (var i = 0; i < keys.length && !id; i++) {
        if (Number.isInteger(C[keys[i]]) && C[keys[i]] > 0) id = C[keys[i]]
      }
      if (!id) {
        Object.keys(C).some(function (k) {
          if (/user.?id/i.test(k) && Number.isInteger(C[k]) && C[k] > 0) {
            id = C[k]
            return true
          }
          return false
        })
      }
    }
    if (id) localStorage.setItem("bcx:uid", JSON.stringify(id))
  } catch (e) {
    /* ignore */
  }
})()
