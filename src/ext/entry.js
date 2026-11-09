// Entry point for the Chrome extension build. Runs as a content script on
// https://<school>.compass.education/bettercompass and replaces that page with BetterCompass.
import { initSchoolInfo } from "./localApi"

function start() {
  initSchoolInfo()
  // Remove whatever Compass served for this path (usually a 404 page).
  document
    .querySelectorAll("script, link[rel=stylesheet], style:not([data-bc])")
    .forEach((n) => n.remove())
  document.documentElement.removeAttribute("style")
  document.documentElement.removeAttribute("class")
  document.body.removeAttribute("style")
  document.body.removeAttribute("class")
  document.body.innerHTML = '<div id="app"></div>'
  document.title = "BetterCompass"
  if (!document.querySelector("meta[name=viewport]")) {
    const meta = document.createElement("meta")
    meta.name = "viewport"
    meta.content = "width=device-width, initial-scale=1"
    document.head.appendChild(meta)
  }
  require("../main.js")
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start)
} else {
  start()
}
