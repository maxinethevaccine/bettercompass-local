// Tolerant helpers for Compass's ChronicleV2 feed (its response shape has drifted since 2022).
export function chronicleList(res) {
  const d = res && res.data && res.data.d
  const raw = Array.isArray(d) ? d : d && Array.isArray(d.data) ? d.data : []
  return raw
    .filter((c) => c && Array.isArray(c.chronicleEntries) && c.chronicleEntries.length)
    .map((c) => {
      c.chronicleEntries.forEach((e) => {
        e.attendees = Array.isArray(e.attendees) ? e.attendees : []
        e.inputFields = Array.isArray(e.inputFields) ? e.inputFields : []
        e.communicationLogs = Array.isArray(e.communicationLogs) ? e.communicationLogs : []
      })
      return c
    })
}

export function pinnedChronicles(list, $date) {
  return list.filter((c) => {
    const a = c.chronicleEntries[0].attendees[0]
    return !!(a && a.pinToProfile && $date(a.pinExpiry || "01-01-9999").isAfter($date()))
  })
}

// The school's own 4-tier behaviour convention, read off the Compass category
// name itself (e.g. "02 Behaviour LOW - Uniform", "00a Respect for Learning"):
// green = positive/merit, grey = low, amber = medium, red = high.
export function tierColor(categoryName) {
  const name = String(categoryName || "")
  if (/high/i.test(name)) return "#F44336" // red
  if (/medium/i.test(name)) return "#FFC107" // amber
  if (/low/i.test(name) || /learning note/i.test(name)) return "#9E9E9E" // grey
  if (
    /^00/.test(name) ||
    /merit|award|commendation|respect for|fortnightly focus/i.test(name)
  ) {
    return "#4CAF50" // green
  }
  return "#9E9E9E" // anything else (attendance notices, communication, etc.) - neutral grey
}

export function safeChronicleJson(json) {
  try {
    const parsed = JSON.parse(json)
    if (Array.isArray(parsed)) {
      const hit = parsed.find((x) => x && x.isChecked)
      if (hit) return hit.valueOption
    }
  } catch (e) {
    /* not JSON: nothing to show */
  }
  return ""
}
