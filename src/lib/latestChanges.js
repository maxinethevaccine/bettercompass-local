// What the "What's new" box on the home page shows. Kept here so it is one
// short edit per release, next to the version number in the manifest, rather
// than buried in the page.
export const LATEST_CHANGES = {
  version: "2.0.3",
  items: [
    "Learning Tasks no longer looks empty: when everything is older than the \"Hide Irrelevant Tasks\" cut-off it now says so, with a button to show them all.",
    "BetterCompass now asks Compass who is signed in, instead of trusting a user ID left in this browser - so a shared or borrowed computer shows the right person, with no reload.",
    "Signing out of Compass clears the name, email and timetable kept in this browser.",
    "Arrow keys no longer move the calendar while you are typing in a search box.",
    "The welcome box stays closed once you close it, however you close it.",
    "The school's real name is used instead of its Compass address."
  ]
}
