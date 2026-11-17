# YTMamp companion distribution notes

Last updated: 2026-11-17. Version 0.8.0 is an unpacked test companion, not a submitted Chrome Web Store release.

## Listing

Name: YTMamp. Short description: Companion bridge for the YTMamp desktop mini-player. Category: Productivity. Language: English.

Single purpose: control and display the user's YouTube Music playback in the paired desktop player, with explicitly requested recording of that tab.

The desktop app must be running and paired with a token. In YT MUSIC mode, desktop REC requests recording; the user invokes the extension on the active YouTube Music tab and presses START RECORDING. Pause and STOP/save are in the desktop player. Capture ends when the source changes or the bridge disconnects. Chrome 116+ is required. Some browser versions require manually clicking the extension icon rather than opening the popup programmatically.

## Permissions

| Permission | Purpose |
| --- | --- |
| tabs | Find, focus and control the user's YouTube Music tab. |
| storage | Save pairing/preferences and keep the capture request/state across worker restarts. |
| activeTab | Limit capture to the tab on which the user invokes the extension. |
| tabCapture | Record audio only from the active YouTube Music tab after the explicit extension action. |
| offscreen | Keep audio capture and playback running after the popup closes. |
| https://music.youtube.com/* | Run the bundled playback adapter only on YouTube Music. |

No desktopCapture, downloads, microphone, camera or all-sites host permission is requested. Tab audio is reconnected to the audio output so listening continues during capture. No remote code is loaded.

## Privacy and data use

Current track, playback state and waveform go to the paired desktop app over authenticated loopback WebSocket. Requested tab audio travels as bounded PCM chunks over the same local connection and is saved by the desktop app as WAV. Audio is not sent to an external server. Capture session IDs expire and stale/source-mismatched chunks are rejected. The extension does not record browsing history or capture other tabs, the microphone or system audio.

Pairing token and user preferences use `chrome.storage.sync`, which can be synchronized by the user's browser account. Capture request/state uses `chrome.storage.session`. Audio is not stored in either storage area. No advertising, analytics, sale of data, creditworthiness use or unrelated data use is implemented.

## Assets and publication readiness

Existing manifest icon files are retained. Store screenshots, publisher contact details, a hosted privacy-policy URL and final store disclosures still require review before any store submission. Support: https://github.com/markoblogo/YTMamp/issues. No store submission is authorized by this test build.

## Version history

| Version | Date | Change | Status |
| --- | --- | --- | --- |
| 0.8.0 | 2026-11-17 | Explicit YT Music tab recording to the paired desktop recorder; activeTab/tabCapture/offscreen permissions. | Test preview, not submitted |
