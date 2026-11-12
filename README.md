# BetterCompass (local fork)

A Chrome extension that runs [Troplo's BetterCompass](https://github.com/Troplo/BetterCompass)
frontend directly inside your own, already-logged-in Compass session.

**No proxy.** The only outside server it contacts is GitHub, to download
newer versions of itself from this repo's releases. It never talks to the
original author's infrastructure.

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

## Auto-update

You install the zip once. After that, every time you open BetterCompass the
extension looks at this repo's latest release. If it is newer, it downloads
`app.js`, `app.css` and `page.js` out of the release zip and shows a
"ready - click to reload" button. About > "Check for updates now" does the
same check on demand.

If GitHub cannot be reached, or a downloaded version fails to start, the copy
that came inside the extension is used instead.

Not covered by auto-update: `manifest.json`, `background.js` and the two
small starter scripts `loader.js` and `launcher.js`. Chrome reads those from
the installed folder, so a change to them needs the new zip and a reload on
`chrome://extensions`.

Anyone who can publish a release here can change the code that runs in every
user's Compass session, so keep this GitHub account secure.

## Publishing a release

1. Build (see below).
2. Create a release whose tag is the new version, e.g. `v2.0.7`. It must be
   higher than the last one.
3. Attach `BetterCompass-extension.zip` (the whole `extension` folder zipped).
   That one file is enough: the updater reads `app.js`, `app.css` and
   `page.js` out of it. Loose `app.js`/`app.css` files are still read if they are attached, so
   versions before 2.0.4 can update too.

The repo must be public, or nobody's extension can see the release.

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
