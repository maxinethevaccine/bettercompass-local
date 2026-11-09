# BetterCompass (local fork)

A Chrome extension that runs [Troplo's BetterCompass](https://github.com/Troplo/BetterCompass)
frontend directly inside your own, already-logged-in Compass session.

**No proxy, no external servers** - except an optional check against this
repo's GitHub Releases, which can also fetch a newer build and run it on the
spot (self-update, without ever needing chrome://extensions). It never talks
to the original author's infrastructure.

This is a personal fork, hardcoded to one school's Compass domain
(`sjchsdow-nsw.compass.education`). If you go to a different school, you'll
need to edit the `matches` URLs in `extension/manifest.json` to your own
school's domain before it'll load.

## Installing

1. Grab the latest `BetterCompass-extension.zip` from
   [Releases](../../releases/latest) and unzip it.
2. Go to `chrome://extensions`, turn on **Developer mode** (top right).
3. Click **Load unpacked**, and select the unzipped `extension` folder.
4. Log in to Compass as normal, then go to
   `https://<your-school>.compass.education/bettercompass` to use it.

Every time you open a Compass page, every one of this extension's scripts
(the main app, the floating launcher button, and the user-ID finder) checks
this repo's latest release on its own, and runs that instead if it's newer -
no reinstalling needed. A small GitHub icon in the app's top bar also shows
this: it lights up with a dot if, for whatever reason, a newer version
hasn't auto-applied yet (e.g. GitHub was briefly unreachable).

**One thing this can't update:** `manifest.json` itself (permissions, which
pages it runs on, its toolbar icon) and the self-update mechanism's own
loader files (`bootstrap.js`, `launcher.js`, `finder.js`,
`selfupdate-core.js`). Those are read by Chrome directly off disk before
any of this extension's own code gets to run, so there's no way for code
*inside* the extension to change them - that's a Chrome platform limit, not
something this fork chose. In practice this almost never matters: those
files are tiny and rarely change. If one of them ever does need a fix,
you'd still need to grab a fresh `BetterCompass-extension.zip` and reload it
via `chrome://extensions`.

## Publishing a release (for whoever maintains this repo)

Each release needs **five** files attached, not just the zip:

- `BetterCompass-extension.zip` (so people can still load it fresh)
- `app.js` / `app.css` (plain, unzipped - from `extension/app/js/app.js` and
  `extension/app/css/app.css` after building)
- `launcher.js` (plain, unzipped - from `extension/launcher.local.js`)
- `finder.js` (plain, unzipped - from `extension/finder.local.js`)

The self-update mechanism fetches each of these by its exact filename from
the release's assets, so they need to be attached with those exact names -
`app.js`, `app.css`, `launcher.js`, `finder.js` - on every release.

## What's different from the original

See [CHANGELOG](src/views/Changelog.vue) inside the app (BetterCompass →
sidebar → Changelog) for the running list - removed/added features, and
bug fixes specific to this fork.

## Building from source

```
npm install
NODE_OPTIONS=--openssl-legacy-provider npm run build:ext
```

This builds the extension into `extension/app/`, ready to load unpacked as
above.

## License

GPL-3.0, same as the upstream project - see [LICENSE](LICENSE).
