// Adds a small "BetterCompass" button to normal Compass pages.
(function () {
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
