<picture><source media="(prefers-color-scheme: dark)" srcset="app/src/renderer/assets/tonfeld-wordmark.svg"><img alt="TONFELD" src="docs/branding/tonfeld-wordmark.svg" width="360"></picture>

[![CI](https://github.com/markoblogo/TONFELD/actions/workflows/ci.yml/badge.svg)](https://github.com/markoblogo/TONFELD/actions/workflows/ci.yml) [![License](https://img.shields.io/github/license/markoblogo/TONFELD)](LICENSE)

A compact retro music player for local collections, online radio and YouTube Music. Formerly **YTMamp**. Starts in LOCAL mode and keeps your music in its original folders.

## Current build

**0.9.0 is the TONFELD release candidate**, on the [radio development branch](https://github.com/markoblogo/TONFELD/tree/codex/radio-recording-stage3-20261111). Candidate checks and download links are recorded in [the test log](docs/smoke-test.md). This is not yet a new tagged public release. Older [published YTMamp releases](https://github.com/markoblogo/TONFELD/releases) do not include the full local-library/radio player.

The owner accepted 0.8.0 on macOS. The new candidate adds the approved typographic TONFELD/rotated-F identity, station-art fallback, synchronized saved stations, one tuning hiss and updated stream addresses. Test the renamed app before replacing a verified installation. Mac previews are ad-hoc signed and not Apple-notarized.

## Listen

- **LOCAL:** ADD one or several music folders, including external drives. LIBRARY offers tracks, albums, embedded/folder cover art and search across tags and filenames. Supported file extensions include MP3, WAV, FLAC, M4A, AAC, OGG and OPUS; decoding depends on Electron. No whole-computer scan or audio copying.
- **RADIO:** search the global station catalog by name, genre and language; sort by popularity, name, genre, language, country or region. Save stations from a card or the mini-player and return through **Saved stations**. Compatible stream alternatives share their saved state. Missing or failed station artwork shows the TF symbol.
- **Local FM:** the frequency strip, Next and Prev reproduce terrestrial local stations using online counterparts. SEEK tries compatible addresses and skips unavailable channels. Drag the dial for manual tuning. One optional, volume-scaled search hiss is separate from the recording signal.
- **FM city:** select Device location or an existing saved directory in RADIO / LIBRARY. Nantes, Rennes, Menton and Kyiv are supplied; visited French cities load on demand. Manual selection survives GPS updates and restart. Changing the directory keeps the current stream playing until another station is selected.
- **YT MUSIC:** control your signed-in YouTube Music browser tab through the matching Chromium companion. If disconnected, selecting YT MUSIC opens the site in the default browser; OPEN retries. The companion must still be installed and paired in that browser profile.

The compact player is **360 × 116**. LIBRARY expands/collapses without interrupting playback. View/right-click/tray menus and Cmd/Ctrl `-`, `=` and `0` select 75%, 100%, 125% or 150% size. **_** hides the player while audio continues; restore it from the Dock/menu bar/tray. **X** quits and stops playback.

## Record

**REC**, recording pause and **STOP** work separately from listening:

| Mode | Recorded source |
| --- | --- |
| LOCAL | Microphone / dictaphone, permission requested after REC |
| RADIO | Current station stream |
| YT MUSIC | Explicitly approved active YouTube Music tab |

STOP opens native **Save As** for stereo 48 kHz / 16-bit WAV. Recording pause removes that interval. Source changes/quit end capture and offer to save. Cancel keeps the pending file for Save As or Discard; interrupted WAVs are repaired on restart. There is no recordings manager, meeting capture, transcription or summarization in this version.

For YT MUSIC recording, press desktop REC, then **START RECORDING** in the companion on the active YouTube Music tab. Browsers that block automatic popup opening require clicking the extension icon. Update the app and companion together. See [browser support](docs/browser-support.md).

## Install and pair

1. Extract the candidate archive. On Mac, open its DMG and drag **TONFELD** to Applications, or extract the app ZIP. Quit the older player first. Existing music folders, metadata, favorites, saved cities, bridge token and settings remain in the original profile. See [upgrade compatibility](docs/branding/README.md).
2. Extract the matching extension ZIP. In `chrome://extensions`, enable Developer mode and load its unpacked folder, or reload/update the existing companion. Extensions are installed per browser profile.
3. In the TONFELD tray menu, choose **Copy bridge token**. Paste it into the companion, then Save and Connect.
4. Open [YouTube Music](https://music.youtube.com) and interact with the page to allow browser audio. LOCAL and RADIO work without this browser setup.

Windows uses the installer/portable ZIP; Linux uses DEB or AppImage. Tray availability depends on the desktop. Automated platform checks and native listening acceptance are recorded separately in [the test log](docs/smoke-test.md).

## Coverage, privacy and storage

Local FM facts and online availability are separate. Initial references contain Nantes 33, Rennes 29, Menton 19 owner-selected candidates (including cross-border services) and Kyiv 35 FM services. These counts are **not guarantees of playable streams or measured signal reception**. France is the initial automatic frequency provider; Kyiv is an explicitly added reviewed reference. See [sources and limits](docs/radio-frequency-sources.md).

Device location is optional for the global online catalog. macOS uses Core Location and Apple's city lookup, not IP location or a Google API key. One-shot updates occur in RADIO on entry, wake/focus and a 15-minute timer; errors pause automatic retry. Coordinates are rounded locally. The private visited-place cache keeps at most 50 areas/1 MiB. Frequency facts refresh weekly on use; online addresses re-resolve daily or after failure. Outages retain useful saved data.

The catalog uses Radio Browser; stations supply audio and artwork and see your IP address. French frequency lookup reads bounded public city-specific Arcom facts. Cards are progressively checked with muted decoder previews: three at a time, six seconds/128 KiB each. Successes are reused for 15 minutes; failed addresses cool down for five minutes. HLS-only streams remain unsupported. A successful check is recent availability, not a guarantee.

Music is never copied. WAV recording uses about 11 MiB/minute, streams to disk, stops at 512 MiB and retains a 256 MiB free-space reserve. Save As can target an external drive. Selected local folders are bounded and scanned without following symlinks. The metadata/artwork cache is bounded.

The browser companion stores its pairing preferences/token through browser storage, which may sync with the browser account. Tab-recorded audio is sent only to the paired local desktop writer. No transcription service is contacted. Last.fm is disabled unless configured.

HTTP/WebSocket services bind to loopback by default. LAN API exposure requires authentication and explicit browser-origin allowlists. Compatibility headers, IDs and internal protocol names retain their YTMamp spelling. See [bridge protocol](docs/protocol.md), [integration API](docs/integration-api.md), [security policy](SECURITY.md) and [architecture/audit](docs/audit-0.9.0.md).

## Develop

Node.js 22.12+; CI uses Node.js 24.

```sh
git clone https://github.com/markoblogo/TONFELD.git
cd TONFELD/app
npm ci
npm run check
npm audit --audit-level=high
npm run pack
npm start
```

Electron desktop checks use generated audio and isolated profiles. macOS packaging builds the native location helper with Xcode command-line tools. The committed vector/raster brand assets require no font at runtime; `app/scripts/generate-brand.swift` regenerates them on macOS.

See [contributing](CONTRIBUTING.md), [current roadmap](docs/roadmap/multi-source-player.md), [release notes](CHANGELOG.md) and [license](LICENSE). TONFELD is independent and is not affiliated with Google, YouTube, or the vintage electronics brands that informed its visual direction.
