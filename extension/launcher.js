// Loads the floating "BetterCompass" button shown on normal Compass
// pages - see selfupdate-core.js for how it decides between a
// freshly-fetched newer build and the one bundled with this extension.
;(function () {
  window.__bcxSelfUpdate({
    jsAssetName: "launcher.js",
    jsLocalUrl: chrome.runtime.getURL("launcher.local.js")
  })
})()
