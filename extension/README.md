# BetterCompass (local) - Chrome extension

Runs the BetterCompass interface inside your own logged-in Compass session.
No proxy, no database, no token, no third-party servers: every request goes to your school's Compass site.

## Install
1. Unzip this folder somewhere permanent (Chrome loads it from here).
2. Open chrome://extensions, turn on **Developer mode**, click **Load unpacked**, pick this folder.
3. Log in to https://sjchsdow-nsw.compass.education normally.
4. Click the blue **BetterCompass** button (bottom-left of any Compass page), or open
   https://sjchsdow-nsw.compass.education/bettercompass

## Removed
The Class Roll tab has been removed: Compass does not provide a class member list to student accounts (confirmed against the live site), and the call BetterCompass used for it in 2022 is gone.

## If it asks for your user ID
The extension tries to detect your Compass user ID by itself. If it cannot, a red banner asks for it: open your own profile in Compass (click your name) and copy the number after `userId=` in the address bar.

## Notes
- Settings and custom themes are saved in this browser (localStorage keys starting `bcx:`). Clearing site data resets them.
- Not available in this version: weather, the discussions/chat backend, feedback sending, admin pages.
- The extension only runs on sjchsdow-nsw.compass.education and now asks for storage and scripting permissions, used only by the auto-updater.
- Another school: change the two `matches` URLs in manifest.json, then reload the extension.

## Rebuild from source
From the project root: `npm install --legacy-peer-deps` then `npm run build:ext` (writes extension/app).
