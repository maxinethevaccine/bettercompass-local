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

Every time you open BetterCompass it checks this repo's latest release, and
if it's newer than what you've got, it loads that version automatically -
no reinstalling needed. A small GitHub icon in the top bar also shows this:
it lights up with a dot if, for whatever reason, a newer version hasn't
auto-applied yet (e.g. GitHub was briefly unreachable).

## Publishing a release (for whoever maintains this repo)

Each release needs **three** files attached, not just the zip:

- `BetterCompass-extension.zip` (so people can still load it fresh)
- `app.js` (plain, unzipped - from `extension/app/js/app.js` after building)
- `app.css` (plain, unzipped - from `extension/app/css/app.css` after building)

The extension's self-update feature fetches `app.js`/`app.css` directly by
their predictable GitHub release-asset URL, so those two files need to be
attached with those exact names on every release for it to work.

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
