// Asks background.js to start the BetterCompass app in this page.
// background.js uses the newest copy it has: the one downloaded from the
// latest GitHub release if that is newer, otherwise the one bundled with
// this extension.
;(function () {
  var root = document.documentElement
  var BOOT_TIMEOUT_MS = 12000

  function showUpdateReady(version) {
    root.dataset.bcxUpdateReady = version
    document.dispatchEvent(new CustomEvent("bcx-update-ready"))
    if (document.getElementById("bcx-update-pill")) return
    var pill = document.createElement("button")
    pill.id = "bcx-update-pill"
    pill.textContent = "BetterCompass " + version + " is ready - click to reload"
    pill.style.cssText =
      "position:fixed;right:16px;bottom:16px;z-index:2147483647;padding:10px 16px;" +
      "border:0;border-radius:999px;background:#0190ea;color:#fff;cursor:pointer;" +
      "font:500 14px system-ui,sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.4)"
    pill.addEventListener("click", function () {
      location.reload()
    })
    ;(document.body || root).appendChild(pill)
  }

  chrome.runtime.onMessage.addListener(function (msg) {
    if (msg && msg.type === "bcx-update-ready") showUpdateReady(msg.version)
  })

  // The app asks for an immediate check (About page button).
  document.addEventListener("bcx-check-now", function () {
    chrome.runtime.sendMessage({ type: "bcx-check-now" }, function () {
      void chrome.runtime.lastError
    })
  })

  chrome.runtime.sendMessage({ type: "bcx-get-app" }, function (started) {
    if (chrome.runtime.lastError || !started || started.error) {
      console.error(
        "BetterCompass: could not start the app.",
        chrome.runtime.lastError || (started && started.error)
      )
      return
    }
    if (started.source !== "github") return
    // If a downloaded version never starts, stop using it and go back to
    // the bundled one, so a bad release cannot lock anyone out.
    setTimeout(function () {
      if (root.dataset.bcxBooted) return
      chrome.runtime.sendMessage(
        { type: "bcx-bad-version", version: started.version },
        function () {
          void chrome.runtime.lastError
          location.reload()
        }
      )
    }, BOOT_TIMEOUT_MS)
  })
})()
