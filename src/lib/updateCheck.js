// Version and update information for the app.
//
// The app itself does not talk to GitHub. The extension's background worker
// downloads newer versions from this fork's latest release, and loader.js
// records on <html> which version it started and whether a newer one has
// been downloaded since.

export const UPDATE_REPO = "maxinethevaccine/bettercompass-local"
export const UPDATE_REPO_URL = `https://github.com/${UPDATE_REPO}`

const root = () => document.documentElement

// The version of the app that is running right now.
export function runningVersion() {
  return root().dataset.bcxVersion || null
}

// "github" when this copy was downloaded by the auto-updater, "bundled"
// when it is the one that came inside the extension.
export function runningSource() {
  return root().dataset.bcxSource || null
}

// A newer version that has been downloaded and will be used after a reload.
export function updateReadyVersion() {
  return root().dataset.bcxUpdateReady || null
}

// What the last check found: "current", "downloaded", "unreachable",
// "incomplete", or null if no check has finished yet.
export function lastCheckState() {
  return root().dataset.bcxCheckState || null
}

export function lastCheckVersion() {
  return root().dataset.bcxCheckVersion || null
}

export function onCheckResult(callback) {
  const handler = () => callback(lastCheckState(), lastCheckVersion())
  document.addEventListener("bcx-check-result", handler)
  return () => document.removeEventListener("bcx-check-result", handler)
}

export function onUpdateReady(callback) {
  const handler = () => callback(updateReadyVersion())
  document.addEventListener("bcx-update-ready", handler)
  return () => document.removeEventListener("bcx-update-ready", handler)
}

// Ask the background worker to look at GitHub now instead of waiting.
export function checkNow() {
  document.dispatchEvent(new CustomEvent("bcx-check-now"))
}
