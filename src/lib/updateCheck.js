// Checks GitHub for a newer tagged release of this extension than the one
// currently installed, so a "new version available" indicator can be shown.
// This is the ONLY external network call this extension makes outside of
// Compass itself - it talks to GitHub's public API, never to the original
// BetterCompass author's infrastructure. It's cached and rate-limited to
// once every 6 hours so it isn't hammering GitHub's API on every page load.

// Owner/repo of the fork this build updates from. Kept in one place so it's
// easy to change if the repo ever moves.
export const UPDATE_REPO = "maxinethevaccine/bettercompass-local"
export const UPDATE_REPO_URL = `https://github.com/${UPDATE_REPO}`

const CACHE_KEY = "bcx:updateCheck"
const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000 // 6 hours

function compareVersions(a, b) {
  const pa = a.replace(/^v/, "").split(".").map(Number)
  const pb = b.replace(/^v/, "").split(".").map(Number)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] || 0
    const nb = pb[i] || 0
    if (na > nb) return 1
    if (na < nb) return -1
  }
  return 0
}

// bootstrap.js records whichever build it actually ran (local or a newer
// one fetched from GitHub) here, since that's the real running version -
// the installed extension's own manifest version doesn't change just
// because bootstrap.js ran newer code this load.
export function runningVersion() {
  try {
    const running = localStorage.getItem("bcx:runningVersion")
    if (running) return running
  } catch (e) {
    // fall through to the manifest version below
  }
  try {
    return chrome.runtime.getManifest().version
  } catch (e) {
    return null
  }
}

function currentVersion() {
  return runningVersion()
}

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
}

function writeCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch (e) {
    // localStorage full or unavailable - not worth blocking anything on.
  }
}

/**
 * Resolves to { updateAvailable, latestVersion, releaseUrl, currentVersion }.
 * Uses a cached result if it's less than CHECK_INTERVAL_MS old, otherwise
 * hits the GitHub API for the latest release and re-caches the result.
 * Never throws - resolves with updateAvailable: false on any failure
 * (no release yet, offline, rate-limited, etc).
 */
export async function checkForUpdate() {
  const installed = currentVersion()
  const fallback = {
    updateAvailable: false,
    latestVersion: null,
    releaseUrl: UPDATE_REPO_URL + "/releases",
    currentVersion: installed
  }
  if (!installed) return fallback

  const cached = readCache()
  if (cached && Date.now() - cached.checkedAt < CHECK_INTERVAL_MS) {
    return {
      updateAvailable: compareVersions(cached.latestVersion, installed) > 0,
      latestVersion: cached.latestVersion,
      releaseUrl: cached.releaseUrl,
      currentVersion: installed
    }
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${UPDATE_REPO}/releases/latest`,
      { headers: { Accept: "application/vnd.github+json" } }
    )
    if (!res.ok) return fallback
    const data = await res.json()
    const latestVersion = (data.tag_name || "").replace(/^v/, "")
    const releaseUrl = data.html_url || fallback.releaseUrl
    if (!latestVersion) return fallback

    writeCache({ latestVersion, releaseUrl, checkedAt: Date.now() })

    return {
      updateAvailable: compareVersions(latestVersion, installed) > 0,
      latestVersion,
      releaseUrl,
      currentVersion: installed
    }
  } catch (e) {
    return fallback
  }
}
