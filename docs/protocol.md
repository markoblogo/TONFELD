# TONFELD local bridge protocol

TONFELD uses an authenticated WebSocket bridge between the Electron app and its Chromium extension.

- Endpoint: `ws://127.0.0.1:18765`
- Message version: `v: 1`
- Format: JSON objects

## Pair the extension

1. Launch TONFELD.
2. Open its menu bar or tray menu and choose **Copy bridge token**.
3. Paste the token into the extension popup, then select **Save** and **Connect**.

The desktop app generates and stores a random per-install token. The extension supplies it as the `token` query parameter when connecting. A client may instead send `{ "type": "auth", "token": "..." }` immediately after connecting.

A missing token produces `auth-request` followed by WebSocket close code `4003`. A valid token produces `auth-ok`; an invalid or expired attempt produces `auth-error` and closes the socket. `LOCAL_TRUST=true` permits unauthenticated loopback development and must not be used for production builds.

## Commands

Renderer-to-extension commands are `playPause`, `next`, `prev`, `seek` (`valueSec`), `setVolume` (`value` from `0` to `1`), `like`, `dislike`, `shuffle`, and `repeat`.

The local-player development branch also accepts `pause`, an idempotent media pause used when switching away from YouTube Music. Update the companion extension together with the desktop branch. LOCAL commands are handled inside the app and are not relayed to the extension. Protocol message version stays `1`; published v0.4.1 companions do not implement this new command.

Popup-to-app commands are `showWindow` and `hideWindow`.

## Status and validation

The extension reports `Client connected`, `Need YTM Tab`, `OFFLINE`, or `WAITING`. When no YouTube Music tab is connected, the renderer clears stale track state.

The app validates protocol version, message types, commands, numeric ranges, and waveform payload size. Track titles and artists are trimmed and limited to 300 characters before renderer IPC.

The 0.8.0 development preview also has RADIO. Radio commands are handled in the desktop app, never forwarded to the YouTube companion. Play/pause starts/stops the selected online stream, Prev/Next select only the local FM queue, and Like toggles a station favorite. Seek/shuffle/repeat have no radio operation. Microphone/radio recording and location use sender-checked desktop IPC. Explicit browser-tab recording uses the authenticated extension bridge described below.

## Tab recording in 0.8.0

The desktop sends `capture-request` with a random 32-hex session ID after a YT MUSIC REC click. The companion requires an explicit action on the active music.youtube.com tab before capture. `ytm-record` messages have `v:1`, the session ID and action `ready`, `chunk`, `ended` or `error`. Chunks contain a nonnegative monotonic integer sequence and base64 stereo 48 kHz Float32 PCM, at most 64 KiB decoded; the desktop pins them to the accepted socket/session/source and applies its disk/real-time writer limits. General WebSocket frames are capped at 128 KiB.

Desktop `capture-control` messages report active/paused state; stop, source change and disconnect end capture. These messages are internal to the paired companion, not public integration API controls. Production authentication, loopback binding and renderer isolation remain enabled.

Saved FM-city selection stays on trusted desktop IPC (`radio-action: place`, saved ID or empty ID for device mode); it is not exposed through the integration HTTP API. Only bundled or visited directory IDs are accepted. Device updates retain an explicit manual city, and returning to device mode uses the last actual device fix. Next/Prev SEEK tries alternate addresses and then advances past unavailable local channels, bounded to one traversal; pause cancels pending tuning. Offline reports do not blacklist or sweep stations.
