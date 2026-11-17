# Release smoke plan

## v0.4.0 release candidate

Automated gates run on macOS, Windows, and Ubuntu:

- clean dependency install;
- JavaScript lint and unit/integration tests;
- production dependency audit;
- unpacked Electron package build;
- API smoke-summary and checklist validation.

Before publishing v0.4.0, manually confirm on each supported platform:

1. App launches and tray/menu icon appears.
2. **Copy bridge token** pairs a newly loaded extension.
3. Play/pause, previous, next, seek, volume, like, shuffle, and repeat work.
4. Waveform begins after one user interaction with the YouTube Music page.
5. Hide/show, media keys, reconnect, and quit behave correctly.
6. Each published installer launches from a clean install.

Observed locally on macOS on 2026-09-11: both the source app and packaged arm64 app started, the main window reported visible, the WebSocket bridge listened on loopback, and `GET /status` returned HTTP 200 with API version 1. Browser pairing and clean-install checks remain pending.

Record automated CI, release asset publication, and manual runtime checks separately. The v0.3.3 matrix in repository history is evidence for that release, not for v0.4.0.
# Local folder playback (development branch)

- Launch without network or companion: LOCAL is selected and playback is paused.
- Open a music folder containing nested folders. LIST shows the queue; the picker cancel action preserves the previous queue. Selecting a track plays it from its original location.
- Check MP3, WAV, FLAC and M4A samples available on the test machine. Check pause/resume, seek, previous/next, shuffle and repeat. Verify audible output and that the oscilloscope reacts to audio.
- Restart: the same folder/track and volume return paused. No audio copies appear in app data.
- Disconnect/reconnect an external drive; verify actionable feedback and successful folder re-selection. Check a corrupt file and an empty folder.
- Switch to YT MUSIC with the updated companion and a signed-in tab. Verify YT controls. Switch back to LOCAL: outgoing YT pauses, local metadata returns and local audio stays paused until Play.
- `npm run test:desktop` covers generated WAV playback, analyzer output, seek, pause, next, switching and bad files with muted output and isolated settings. macOS listening, actual YT authentication and external-drive recovery remain separate interactive checks.

## Stage 2 music library (0.6.0 development preview)

Automated coverage is separate from the following owner checks:

1. Update the existing Mac app while retaining its profile. Confirm the stage 1 folder and selected track migrate, with LOCAL selected and playback paused.
2. Use ADD to select two music folders. Confirm tags, embedded covers and folder covers; nested/overlapping folders do not duplicate tracks.
3. Open LIBRARY. Search by artist, album, Cyrillic text and genre; test the folder filter and no-results feedback. Switch between tracks and albums without interrupting audio.
4. Play an album with numbered tracks. Confirm its queue ends at the album boundary; repeat/shuffle remain scoped to that queue. Add or refresh another folder during playback and confirm continuity.
5. Restart. Disconnect an external music drive and refresh: its albums remain searchable but offline. Reconnect and refresh, then play again.
6. Remove one root from the library. Verify its original files are intact and overlapping tracks still belong to any remaining root. Test canceling a large import.
7. Confirm the mini-player remains compact and the expanded library stays within the display. Check audible output on representative MP3, FLAC, M4A and WAV files.
8. Collapse the library with COLLAPSE and reopen with LIBRARY. Confirm the query, album/folder selection and playback are preserved. The future vinyl deck must follow the same panel behavior and suspend rendering when collapsed.
9. Set Player size to 75% by right click or View menu. Confirm the full transport fits in 270 × 87, reopen the library, then test 125%/150% and reset with Cmd/Ctrl+0. Reopen the app and confirm the chosen size persists. Scaling must preserve the selected track, playback and filters and keep the window in the display's work area.

`npm run test:library:desktop` covers generated tagged WAV decoding, image decoding, multiple roots, accent-insensitive search, album playback boundaries, offline/reconnect and safe removal under Linux Xvfb. Unit tests cover restart, cancellation, containment, cache budgets and public catalog fields. A Mac CI check loads the real metadata worker and parser from the signed app's ASAR. These checks use generated music and temporary profiles, not the owner's collection.

Observed on the owner's Apple Silicon Mac, 11 November 2026: the 0.6.0 development preview replaced the existing app through Finder and launched from the installed Applications folder without the previous damaged-app warning. The saved external-drive folder produced 165 tracks with tags and embedded covers; search narrowed the list, playback time advanced on an actual MP3, pause worked, and volume remained 31%. Album browsing exposed seven folder/tag groups. Listening quality, a physical drive disconnect and YouTube authentication were not claimed by this UI check. The first migration selection issue found during this check has a regression test; final preview validation is linked from PR #15.

Follow-up verification, 11 November 2026: 75% (270 × 87), 100% (360 × 116), 125% (450 × 145) and 150% (540 × 174) mini-player layouts were observed on the Mac without clipped controls. The View menu's Larger action worked; automated input did not activate its increase shortcut, which is an input/shortcut observation rather than a confirmed application defect. COLLAPSE hid the library while the same local track continued from 02:30 to 02:44; Pause remained available. The owner then reported that everything appeared to work and accepted this pass. Multiple-root/restart/offline tests retain their automated status; no physical external drive was disconnected.

## 0.6.1 hide-button pass

- Click **_** during playback: the window disappears, the track keeps advancing and its identity/revision stays unchanged.
- Restore using the menu-bar/tray icon or Dock: the same track, scale, query and album/folder view return.
- **X** remains Quit and ends playback. Hiding and quitting are distinct actions with explicit tooltips.
- At 75%, both window buttons and the library controls remain visible inside the header.
- With YT selected, a new playingStarted event must not reopen a window explicitly hidden by the user. Explicit restore re-enables the normal show behavior.

The Electron library smoke exercises real audio while hidden and restored. Routing tests cover sender validation, lack of pause/reload on hide, tray restoration and suppression of YouTube auto-show. Manual Mac observation is recorded separately from automated checks.

## 0.7.0 radio and recording pass

Owner acceptance update: local playback works well. Native diagnosis of the installed 0.7.0 app reproduced the confusing RADIO entry state and a failing HLS variant of FIP. A direct AAC FIP stream then played on the owner's Mac, with Pause state and an actual oscilloscope signal observed. The earlier unsupported-HLS message remained visible over successful playback. These observations motivate 0.7.1 source onboarding/catalog fixes; recording, full local-frequency coverage and native geolocation were not validated by this diagnosis.

0.7.1 checks: selecting RADIO should automatically load supported distinct station cards and request device location independently. Denied/unavailable location must leave the online catalog usable. No city/country/region input is required. FIP duplicates should select a compatible direct stream; an unavailable address gets a bounded cooldown and another compatible cached address is tried. LIVE replaces stale error text. Prev/Next sweep toward the next/previous known local frequency; cancellation or rapid presses must not resume an old stream. YT selection opens the default browser only when disconnected, with cooldown and a retry button. A connected session is left alone; companion pairing remains required.

The Core Location helper compiles locally for Apple Silicon and its noninteractive `--check` passes. Unit tests validate coordinate bounds/rounding, permission errors, default-browser launch rules, address classification, distinct-stream choice and failed-address cooldown. All three 0.7.1 CI jobs passed. Native checks are recorded below; compilation alone does not establish the OS permission flow.

Local focused tests validate public URL restrictions, explicit frequency parsing, directory query/cache/favorites, geographical/frequency ordering, exclusion of internet-only stations from the dial, stale reports, recording pause/resume and PCM WAV headers/samples. Existing local playback/routing tests remain required.

`npm run test:radio:desktop` uses generated audio and an isolated profile. It stubs transport only within the test process; production has no private-network exception. The test checks RADIO selection, the same LIBRARY toggle, station cards, local frequency order, real decoding/analyzer data, Prev/Next, worklet capture, pause without stopping listening, WAV save, hide/collapse, compact layout at four scales and return to LOCAL. This does not establish real Radio Browser availability or native macOS permissions.

Native acceptance checklist:

1. Install the latest signed preview, retaining local folders/settings. Launch LOCAL paused, then select RADIO from the same switch.
2. LIBRARY opens radio cards. Search a real station, combine genre/language filters, sort and favorite it. Check a failed stream and retry. Test an online-only stream as well as a terrestrial station's online stream.
3. Request device location without entering a city/country/region. Inspect supplied local FM frequencies, assign a known frequency if needed, and check Prev/Next and dial use only the local list. No supplied local data must produce a clear empty state. Denied/unavailable device location must leave online stations usable and provide an actionable retry path.
4. Check waveform and volume, optional short tuning noise, 75/100/125/150% sizes, collapse/reopen, explicit hide and Dock/tray restore while audio keeps playing.
5. Record, pause only the recording, resume and STOP. Save WAV to an external drive and play it back. Cancel Save As and then save/discard from the panel. Switch away during recording and try normal quit with a pending recording.
6. Return to LOCAL and verify the collection/selected track are preserved, the stream stops, and local playback still works. Do not claim physical-drive disconnect, YouTube authentication, verified FM coverage or listening quality from an automated fixture.

Verified code checkpoint, 11 November 2026: commit `777ecbc9fdc3bb07c34deecb140bdf2e2b778a8a`, [CI run 43072684050](https://github.com/markoblogo/TONFELD/actions/runs/43072684050), passed macOS/Windows/Ubuntu clean install, lint/tests/audit and packaging. Mac archive signatures and ASAR metadata passed. Ubuntu local-player, library and radio/recording desktop smokes all passed. The 21 focused local tests also cover recovery of an interrupted recording. A preceding smoke failure read a destination WAV before its asynchronous copy completed; the test now waits for the app's saved state before checking header/sample length.

Apple Silicon preview: [YTMamp-0.7.0-macos-arm64](https://github.com/markoblogo/TONFELD/actions/runs/43072684050/artifacts/13878138151), artifact 13878138151, archive SHA-256 `13e50df9670b78d40ff3d6647748ccc5982a2cd29aceb90af9790f7fb343b7ff`. This is an ad-hoc signed preview, not a tagged/notarized public release.

Native 0.7.1 check, 11 November 2026: installed in the owner's user Applications folder after verifying artifact 13896667236, SHA-256 `38a1de7429f2d524236c423cc85ea346507c494e6df961fa03df671c4de0d479`. Installed ASAR SHA-256 `0d99b13e97147cc39fd546c984d99782aff9503827f01a0d9f596d2372025a3a` matches the strictly verified package. [CI run 43112024710](https://github.com/markoblogo/TONFELD/actions/runs/43112024710) passed macOS, Windows and Ubuntu, including the native helper --check and Electron SEEK cancellation/WAV smoke. The native UI showed automatic catalog loading, active Prev/Next controls and no manual city/country/region fields. Existing macOS permission for YTMamp was off; after enabling this requested app-specific permission, Core Location resolved Nantes successfully. The first permission dialog was not observed. Before enabling access, the helper returned a timeout, so existing denial feedback still needs refinement.

Nantes returned zero supplied local FM matches. This is a real acceptance gap: automatic SEEK passes generated-audio tests but cannot yet tune actual nearby stations using this sparse directory alone. Arcom publishes city-based FM data, for example [FIP in Nantes](https://www.arcom.fr/radio-et-audio-numerique/radio-fm-dab/radios-detail/fip--nantes-44200). A bounded provider/matching pass is needed before local FM acceptance. No 0.7.1 native recording, complete browser pairing or listening-quality acceptance is claimed. The owner's local collection was retained. The owner then confirmed several catalog streams fail, motivating the 0.7.2 pass below.

## 0.7.2 catalog availability pass

Before exposing a new card, the renderer briefly decodes a muted audio preview through the same controlled protocol and decoder as listening. Three previews run at most, each capped at 128 KiB and six seconds. Search pages contain 24 provider records and show successful cards progressively. Source changes/new searches cancel previews without marking the addresses bad. A working check is cached for 15 minutes and bound to the exact address; failed addresses are hidden for five minutes, with one compatible alternate preview attempted. Favorites are retained. The default catalog uses provider popularity to avoid starting with a long alphabetic list of promotional duplicates; other sorts remain available.

Each successful catalog check indicates that a stream decoded on the device at the time of the check; it does not establish perpetual availability or audible program quality. A subsequent playback failure removes its visible card and expires its successful check. Offline checks do not condemn stations. Code checkpoint `26d2b55bf5870437d35b8cdbf8b564c896bf8e35` passed all three jobs in [CI run 43116237066](https://github.com/markoblogo/TONFELD/actions/runs/43116237066). This includes the Electron decoder smoke with generated WAV previews and an invalid HTML stream that must be hidden, sorting after incremental checks, no main-player start during checks, SEEK cancellation and recording. These fixtures do not establish real-stream behavior on the owner's Mac. All 26 focused local tests passed.

Apple Silicon [0.7.2 preview artifact 13898966284](https://github.com/markoblogo/TONFELD/actions/runs/43116237066/artifacts/13898966284), ZIP SHA-256 `316c69510432e10bc79d35d79c72aa9b79bd92666843ecb078fa21c36ab7bb31`. Package signatures and the bundled native helper passed CI. Native 0.7.2 installation/testing remains open: two attempts to access Comet through desktop control timed out, so no install or real-station acceptance is claimed. Read-only verification confirmed the installed app is still 0.7.1 with ASAR SHA-256 `0d99b13e97147cc39fd546c984d99782aff9503827f01a0d9f596d2372025a3a`. Resume with this exact verified artifact, finish the real-station/dead-stream and recording checks, then stop for review. The next radio data pass should address city-based FM frequencies before audit/release.

## 17 November 2026 follow-up

The owner requested completion of the radio block and real-world testing. The Mac still has 0.7.1 installed; 0.7.2 has not been installed or tested interactively on that Mac. The 0.7.2 CI artifact was downloaded from GitHub, its SHA-256 matched the documented artifact digest, and its extracted app passed `codesign --verify --deep --strict`. Its packaged Core Location helper returned `YTMAMP_CORE_LOCATION_READY` with `--check`; this noninteractive check does not request or confirm location permission.

From the packaged 0.7.2 ASAR, an isolated Electron-as-Node fixture check exercised a two-station local FM queue, the Next tuning command and stale-revision rejection, WAV recording pause behavior, and good/bad catalog-preview results. The 26 focused source tests passed locally. These checks used generated inputs and do not establish actual station availability, audio output quality, native recording, or the real FM dial.

The desktop control surface needed to install the app and operate the Mac UI was unavailable in this session. The owner can obtain the [0.7.2 preview artifact](https://github.com/markoblogo/TONFELD/actions/runs/43116237066/artifacts/13898966284), extract the Mac package and install it using Finder. Before calling radio complete, test real station discovery and playback, WAV recording, location and local FM SEEK on the installed preview.

A source assessment found that the [Arcom website terms](https://www.arcom.fr/mentions-legales) state electronic reproduction of website content requires express agreement; confirm the applicable reuse conditions before integrating or redistributing its content. [ANFR's open-data portal](https://data.anfr.fr/) states that its published datasets use open licences, but matching its transmitter records to station names, frequencies and playable streams still requires evaluation. The CC0 [verified-radio-streams](https://github.com/eyalev/verified-radio-streams) catalogue reports checks from August 2026 and does not provide comprehensive local frequencies; it is a possible supplementary stream source, not evidence of current playback or a solution for local FM.

## 0.7.3 location-following FM pass

Owner testing confirms most catalog stations play in installed 0.7.2. Read-only profile diagnosis found a saved location, 95 records with frequencies and coordinates, but zero within 60 km and zero user tuning assignments. Empty frequency data explains the inactive dial/Next/Prev behavior.

The new tests resolve reviewed Nantes frequencies to compatible national streams whose directory coordinates are in Paris, exclude themed channels and similarly named/wrong-country streams, and move the location to Menton without changing the playing stream or its audio revision. RFM changes from 90.1 to 97.6 MHz through the location-based catalogue; Nantes-only channels disappear from the local queue. Internet-only city matches stay outside the local FM list. The draft now has 33 researched Nantes channels and the owner’s 19-station Menton selection; M Radio is confirmed at 104.1 MHz. Regional stream preference and July 2026 France Info/Musique assignments are tested separately. A desktop smoke also moves an isolated profile and verifies Next selects the new city's queue while recording/source-isolation checks remain intact. Native acceptance and 0.7.3 CI/build outcomes are pending until recorded explicitly.

17 November source/cache clarification: the owner requests terrestrial local FM counterparts and an on-demand visited-place directory, not arbitrary nearby web radios. The source assessment and pending cache policy are documented in `radio-frequency-sources.md`. The current draft contains 33 Nantes assignments and 19 owner Menton candidates, not an integrated automatic frequency provider. Local `npm run check` linted 61 JavaScript files and ran 83 tests: 82 passed, and the real metadata-worker test could not import the locally absent `music-metadata` dependency. This is an environment dependency failure, not a completed clean-install gate. CI must run `npm ci`, the full check, audit and packaging before any new installer is described as verified. Native Mac 0.7.3 listening remains untested.

## 0.8.0 combined directory and recording preview

The owner authorized on-demand new-place lookup, concrete Nantes playback checks and recording in every source before the next test build. Changes add French per-city frequency parsing/cache, regional stream matching, microphone capture, an explicit browser action/offscreen YT Music capture, one session-pinned bounded PCM/WAV writer, pause/STOP/save and capture cancellation on source change. New generated tests cover fresh/stale/restarted/evicted place caches, FM-only parser boundaries, capture envelope validation, session/source rejection and extension action/source guards. CI also runs generated microphone desktop recording and a separate real Nantes decoder/new-place Rennes diagnostic. Clean-install CI, resulting artifact and native acceptance outcomes will be recorded after execution; no native 0.8.0 playback or permission acceptance is claimed here.

17 November intermediate service check: run 44089720071 decoded 28 of 33 Nantes streams (three unresolved, two failed) and fetched 29 Rennes FM entries without a bundled Rennes grid, retaining them through a cache restart. Rennes is now bundled at the owner’s request. macOS and Windows clean-install/check/audit/package gates passed, including signed Mac microphone entitlement/usage description and the location-helper check. The generated microphone desktop smoke failed because its injected function assignment returned a non-cloneable JavaScript value; a shell pipeline masked that failure. Both the fixture return and pipeline error propagation are fixed for the next run. Do not treat that earlier green job as microphone acceptance. The final candidate and native interactive checks remain pending.

Run [44092901384](https://github.com/markoblogo/TONFELD/actions/runs/44092901384) passed clean-install checks/audit/packaging across macOS, Windows and Ubuntu, including generated microphone capture with nonzero PCM, pause/resume, source-change saving/released tracks and compact-scale controls. Its live Nantes check decoded 30/33 streams: Rire & Chansons and Euradio failed, RCA was unresolved. These service diagnostics remain separate from audible listening. The owner then added saved-directory switching and explicitly requested Kyiv. The next candidate therefore adds persistent manual/device selection, 35 Kyiv references and bounded unavailable-channel SEEK; the earlier artifact does not contain these additions and is not the final candidate.

## Final 0.8.0 test candidate, 17 November 2026

Code commit `7aaef79f1ab07f0e0be6e81b55d86f43cfe60826`, [CI 44095939679](https://github.com/markoblogo/TONFELD/actions/runs/44095939679), [Apple Silicon artifact 14334790172](https://github.com/markoblogo/TONFELD/actions/runs/44095939679/artifacts/14334790172). The artifact contains the Mac DMG/ZIP and matching 0.8.0 companion ZIP. GitHub artifact digest: `sha256:154364896790f0e8251c85fcfe7779a84e7b9e004fac2a76bf87c6812761b681`. The [service-check artifact](https://github.com/markoblogo/TONFELD/actions/runs/44095939679/artifacts/14334430877) digest is `sha256:5427e06b35bd71fcf45f2fe946c8b45b69f7079f8850e499e821749dbd1e7bed`; its downloaded JSON reports were hash-verified locally.

All three CI platforms passed clean install, audit, lint, 100 tests (plus the separately repeated 13 integration checks) and packaging. Ubuntu desktop checks passed local/library playback, radio cards and muted verification, saved-city selection/manual GPS override/return to device city, local-only Next/Prev, generated microphone capture, pause/resume, source-change saving, released capture tracks and compact scaling. macOS verified the final package/ZIP signatures, microphone entitlement and usage text, location helper and packaged metadata. The preview is ad-hoc signed and not Apple-notarized.

| Service diagnostic | Final observed result | Remaining gap |
| --- | --- | --- |
| Nantes | 31 of 33 frequency slots decoded | Rire & Chansons 88.4 and Euradio 101.3 failed |
| Rennes | 29 FM facts refreshed and cached across restart | No audible/complete stream acceptance |
| Kyiv | 14 of 35 referenced frequency slots decoded | 19 online counterparts unresolved; Priamyi FM 88.4 and My Ukraine 106.0 failed in this run |

The earlier Kyiv result included two addresses for Radio ROKS on 103.6; the final queue keeps one slot per frequency and prefers mapped facts over loose supplied labels. A regression test covers the observed duplicate. Service availability fluctuated between runs; successful muted decoding is not a guarantee or audible listening test. No final native Mac installation, live location permission, physical microphone recording or real browser-tab capture is claimed. Follow [the owner test pass](test-0.8.0.md), update the companion and stop for block review before audit/release or vinyl work.

17 November owner acceptance: the owner reports “everything works” in the 0.8.0 test version and moves the discussion to branding, missing-art placeholders, tuning hiss, explicit radio favorites and coverage improvements. The combined test block is accepted by the owner. No further instrumented native checks were run for this confirmation; remaining diagnostic coverage limits above are retained.
