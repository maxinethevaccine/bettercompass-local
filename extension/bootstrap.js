// Loads the main BetterCompass app - see selfupdate-core.js for how it
// decides between a freshly-fetched newer build and the one bundled with
// this extension.
;(function () {
  window.__bcxSelfUpdate({
    jsAssetName: "app.js",
    jsLocalUrl: chrome.runtime.getURL("app/js/app.js"),
    cssAssetName: "app.css",
    cssLocalUrl: chrome.runtime.getURL("app/css/app.css")
  })
})()
