// Runs on ordinary Compass pages. All it does is ask background.js to put
// page.js into the page - the newest copy it has, downloaded or bundled.
// Everything those pages actually get (the BetterCompass button, noting who
// is signed in) lives in page.js so it can update without a reinstall.
if (window.top === window.self) {
  chrome.runtime.sendMessage({ type: "bcx-get-page" }, function () {
    void chrome.runtime.lastError
  })
}
