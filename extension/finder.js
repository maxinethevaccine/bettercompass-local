// Loads the script that reads your Compass user ID out of the page -
// see selfupdate-core.js for how it decides between a freshly-fetched
// newer build and the one bundled with this extension. Runs in the
// MAIN world (same as finder.local.js needs to, to read window.Compass).
;(function () {
  window.__bcxSelfUpdate({
    jsAssetName: "finder.js",
    jsLocalUrl: chrome.runtime.getURL("finder.local.js")
  })
})()
