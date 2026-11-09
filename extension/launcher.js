// Loads the floating "BetterCompass" button shown on normal Compass
// pages, once access-gate.js has confirmed the right password - see
// selfupdate-core.js for how it then decides between a freshly-fetched
// newer build and the one bundled with this extension.
;(function () {
  window.__bcxAccessGranted.then(function (granted) {
    if (!granted) return
    window.__bcxSelfUpdate({
      jsAssetName: "launcher.js",
      jsLocalUrl: chrome.runtime.getURL("launcher.local.js")
    })
  })
})()
