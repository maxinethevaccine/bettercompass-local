// Loads the main BetterCompass app, once access-gate.js has confirmed the
// right password - see selfupdate-core.js for how it then decides between
// a freshly-fetched newer build and the one bundled with this extension.
;(function () {
  window.__bcxAccessGranted.then(function (granted) {
    if (!granted) return
    window.__bcxSelfUpdate({
      jsAssetName: "app.js",
      jsLocalUrl: chrome.runtime.getURL("app/js/app.js"),
      cssAssetName: "app.css",
      cssLocalUrl: chrome.runtime.getURL("app/css/app.css")
    })
  })
})()
