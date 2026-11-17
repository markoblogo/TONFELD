# Browser support

TONFELD uses a Chromium extension to bridge YouTube Music with the desktop app.

## Tested browsers

These Chromium-based browsers have been manually tested:

- Chrome
- Comet
- Atlas

## Expected compatibility

Other Chromium-based browsers may work if they support:

- Manifest V3 extensions
- unpacked extension loading
- `chrome.tabs`
- `chrome.storage`
- content scripts on `https://music.youtube.com/*`

Examples likely to work but not yet listed as tested: Brave, Edge, Arc-style Chromium browsers.

## Install note

Extensions are installed per browser profile. If you use more than one browser or profile, load the unpacked `extension/` folder in each one.

## Tab recording

The browser list above records existing playback/bridge testing, not acceptance of the new recorder. Tab recording additionally requires Chromium 116+ with `chrome.tabCapture`, `chrome.offscreen` and active-tab permission support. Update the unpacked companion from the same TONFELD build and accept its permission changes. Press REC in desktop YT MUSIC mode, then explicitly choose START RECORDING in the companion on the active music.youtube.com tab. A browser that blocks automatic popup opening may require clicking the pinned extension icon. Native Comet/Atlas/Chrome recording acceptance is still pending; no microphone or system-wide audio capture is used for YT MUSIC.
