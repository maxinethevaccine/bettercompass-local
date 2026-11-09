// Runs inside Compass's own page context (world: MAIN) so it can read the logged-in user's id
// from Compass's page script and hand it to BetterCompass through localStorage.
(function () {
  try {
    var id = null
    var C = window.Compass
    if (C) {
      var keys = ["organisationUserId", "userId", "currentUserId", "loggedInUserId"]
      for (var i = 0; i < keys.length && !id; i++) {
        if (Number.isInteger(C[keys[i]]) && C[keys[i]] > 0) id = C[keys[i]]
      }
      if (!id) {
        Object.keys(C).some(function (k) {
          if (/user.?id/i.test(k) && Number.isInteger(C[k]) && C[k] > 0) {
            id = C[k]
            return true
          }
          return false
        })
      }
    }
    if (id) localStorage.setItem("bcx:uid", JSON.stringify(id))
  } catch (e) {
    /* ignore */
  }
})()
