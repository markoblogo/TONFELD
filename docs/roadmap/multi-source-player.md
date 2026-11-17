# TONFELD development plan

Updated 17 November 2026. The owner accepted **TONFELD 0.9.0** on macOS and authorized the public release. The typographic identity uses T + 180-degree-rotated F. The repository is markoblogo/TONFELD.

## Working agreement

Work in agreed, bounded blocks. Implement/check one block, report results and unresolved issues, then stop for owner review. Do not roll into the next features automatically. Keep the player compact; additional browsing/visualization belongs in collapsible panels. Whole-computer audio scanning is excluded; music stays in explicitly selected original folders, including external drives.

## Implemented and accepted before this block

- LOCAL default: multiple music folders, tags, artwork, albums, search, queue, transport, saved selection/settings and paused restart. Local limits are 20 roots, 10,000 unique tracks, 5,000 tracks/50,000 examined entries per root, 16 MiB manifest and 32 MiB artwork cache. No audio copies, symlink traversal or global disk scan.
- Compact 360 × 116 player; 75/100/125/150% scaling; collapsible library; hide preserves playback, X quits.
- YT MUSIC browser companion, authentication/pairing, source isolation and default-browser opening when disconnected.
- RADIO global catalog/search/sorting, custom streams, favorites, muted availability checking, compatible alternatives, local-only FM tuning and bounded unavailable-channel SEEK.
- French per-city frequency lookup for visited places, private 50-place/1 MiB cache, weekly-on-use frequency refresh, daily/failed-stream address refresh and last-good fallback.
- Saved-city selection independent of actual location: Nantes, Rennes, Menton, explicitly requested Kyiv and visited directories. Manual selection survives location updates/restart; Device location returns to the actual device fix. Changing directory does not interrupt the current stream until another station is selected.
- Shared bounded WAV recording: LOCAL microphone, RADIO current stream, YT MUSIC explicitly approved browser tab; recording pause/STOP/Save As, source/quit cancellation and interrupted-file recovery. 512 MiB cap with 256 MiB free-space reserve.

The owner reported that 0.8.0 works on Mac. Automated evidence and earlier native/service diagnostics remain in [the test log](../smoke-test.md); frequency counts never imply guaranteed online availability or measured RF reception.

## Completed implementation block: TONFELD 0.9.0

1. Apply the approved typographic identity to the player, app, companion, icons and packaging. Use the TF mark for missing/broken station art. Preserve original profile, app ID, browser storage and integration compatibility.
2. Make explicit Save/Saved controls and Saved stations consistent across cards, mini-player, compatible addresses, removal and restart. This is saved stations, not automatic listening history.
3. Refine the existing search effect to one characteristic, volume-scaled optional hiss, outside the recording path.
4. Improve Nantes/Kyiv online counterpart coverage with sourced candidate addresses and actual decoder checks. Preserve real FM identities/frequencies and the separation from internet-only stations.
5. Audit implementation, dependencies/resources, upgrade behavior and release checks. Remove obsolete probes/generated outputs, reconcile current documents/README and prepare GitHub About metadata.
6. Produce one checked test/release candidate with the matching companion. Report the audit and coverage/acceptance limits; stop for owner review before a public tag/release. Public release checks include version consistency, native Mac acceptance, signatures/archives, staged-branch reconciliation and verified download assets.

The owner explicitly confirmed that audit/sanitation/README/GitHub About is the final part of this block; discuss remaining development ideas afterwards.

Owner acceptance: everything works; the station-art placeholder needs cosmetic alignment/proportion refinement, explicitly deferred without blocking release. **[v0.9.0 is published](https://github.com/markoblogo/TONFELD/releases/tag/v0.9.0)**; staged PR reconciliation, builds and uploaded-asset verification are complete. See [release verification](../releases/v0.9.0-verification.md). This block is closed. About remains prepared for manual owner insertion, Website empty.

## Owner priorities after the 0.9.0 release

17 November 2026 follow-up. These decisions supersede the earlier suggested next-release order:

- Proceed with local vinyl and local playlist workflows.
- Develop YT MUSIC around an internal browser session, independent of external Chrome and its companion in everyday use. The browser UI should stay out of the way during playback; explicit visible sign-in/account recovery remains necessary when required.
- Convenient application updating is a priority, before expanding the embedded service surface significantly.
- Add a retro television/monitor video mode: YouTube first, then Netflix and a reviewed list of other preset services when actual playback compatibility is established.
- Show artist/title where radio metadata supplies them; otherwise keep the station identity as the fallback.
- Deprioritize travel-radio expansion. Existing local FM and saved directories continue to work; do not expand countries/providers in the next blocks.
- Defer hardware remotes and display integrations.
- Plan a separate recording workspace combining dictaphone, calls/meetings, transcription and summarization.
- Keep the agreed station-art cosmetic correction queued: center both axes and compare a full TONFELD wordmark with a larger monogram matched to normal artwork dimensions.

No new feature implementation is started by this planning update. Agree each block's concrete scope and acceptance before coding; one test build and owner review closes each block.

## Proposed release sequence

Feature priorities above are owner decisions. The grouping/version labels below are a proposed implementation sequence, not promised dates or a commitment that an unverified service will be supported.

| Block | Scope | Exit / review |
| --- | --- | --- |
| 0.10: local listening | Local playlists and editable queue; a collapsible local vinyl deck using the existing audio path; station-art cosmetics. Add radio artist/title if obtainable within a bounded metadata pass. | Playlists survive restart and unavailable external-drive files; normal transport and vinyl stay synchronized; collapsed visualization stops rendering; compact player remains usable. |
| 0.11: updates | In-app update discovery, release notes, explicit download/install/restart and preservation of profiles/collections. Define platform-specific package verification and recovery. Review the documented build-tool audit findings as technical maintenance. | Test a real older-to-newer installation, cancellation/failure, retained data and a viable recovery path. The first update-capable version needs a one-time manual installation. |
| 0.12: internal YT MUSIC | First validate real account sign-in, persistent session, playback and background behavior on the Mac. Then connect mini-player transport, track metadata, playlist selection and an explicitly controlled recording path to that session. | Everyday listening works without external Chrome/companion; restart retains the session, source switching stops the old source, and resources remain bounded. Report any sign-in requirement instead of promising an entirely invisible login. |
| 0.13: retro TV / YouTube | Reuse the internal browser foundation for a visible collapsible/resizable retro monitor, YouTube viewing, navigation and fullscreen. Keep cosmetic CRT effects optional. | Real video, account flow, keyboard/fullscreen controls and mode switching work without leaving background audio playing unexpectedly. |
| Following TV block: preset video services | Start with a separate feasibility check for Netflix and candidate services; only then implement verified presets. Validate protected video on the packaged Mac app, not merely page loading or a DRM test page. | A compatibility table records service, platform, sign-in, actual playback, limits and update requirements. Assign a release version after the compatibility result; do not promise Netflix from browser embedding alone. |

### Vinyl scope

The first deck is a visual integration with existing local playback, not a mandatory replacement of the audio engine. No preprocessing or copying the music collection. The physical groove/stylus simulation in rauchg/vinyl is a separately measured optional experiment: benchmark selected files on the owner's Mac, then decide latency, CPU/memory and bounded cache policy before implementation.

### Internal browser and protected-service feasibility

TONFELD already uses Electron/Chromium; prefer one managed embedded-browser foundation for YT MUSIC and TV, with isolated persistent service sessions and lazy loading. Do not start a browser session for every preset on app launch. Keep remote pages isolated from local files, recordings and privileged application APIs; release inactive resources.

Google's OAuth policies restrict developer-controlled embedded authorization user agents. That is not by itself a verdict on the first-party YouTube Music website's sign-in flow: validate the actual intended website/account path and use a supported authorization route where needed. Opening a hidden page is not evidence of successful authenticated playback.

Netflix lists supported consumer browsers, not a general guarantee for an Electron wrapper. Protected content introduces CDM/DRM, codec and potentially application-signing dependencies. Validate the installed package and actual subscribed-service playback before setting a delivery promise. Do not bypass service protections.

Reference checks, 17 November 2026:
- [Google OAuth policies](https://developers.google.com/identity/protocols/oauth2/policies)
- [Netflix supported browsers](https://help.netflix.com/en/node/30081)
- [Widevine overview](https://developers.google.com/widevine/drm/overview)

## Separate future block: recordings, calls and text

Today, dictaphone/radio/explicit YT tab recording and Save As already work. Do not introduce a recordings manager as incidental work in the next music or video releases.

The future workspace joins microphone dictation, meeting/call capture, a recording library, transcription and summarization. Split it into useful passes: reliable capture and source selection; transcript generation; summaries and export. Choose supported call capture methods, explicit start/stop indicators, local/cloud processing, destinations and storage limits before implementation. External audio/text transmission must be an explicit user action. The release order and processing provider remain undecided.

## Deferred or unconfirmed ideas

- Travel-radio provider expansion and new country coverage: low priority.
- Cardputer remotes, Divoom displays and other hardware integrations: later.
- Landing page/Website: later; GitHub About remains owner-applied.
- Physical vinyl sound simulation: optional later experiment.
- Sleep timer, numerical radio presets, gapless albums and settings export remain suggestions to review, not accepted implementation scope.
- Do not invent a further feature list until these blocks have been reviewed.

## Donor references

| Reference | Useful scope | Current decision |
| --- | --- | --- |
| [Webamp](https://github.com/captbaritone/webamp) | Retro browser audio and visualization | MIT reference; reuse narrow modules only where beneficial |
| [Museeks](https://github.com/martpie/museeks) | Local library and playlist workflows | Architecture/product reference, not a Tauri/Electron drop-in |
| [Radio Browser](https://docs.radio-browser.info/) | Stream directory, metadata and health hints | Integrated; device decoder checks remain authoritative for current availability |
| [Radiola](https://github.com/SokoloffA/radiola) | Native radio UX | MIT reference |
| [Pear Desktop](https://github.com/pear-devs/pear-desktop) | Future YouTube session integration | Later reference, not bundled wholesale |
| [vinyl](https://github.com/rauchg/vinyl) | WebGL deck | Deferred; preserve code attribution and review separate media licenses |
| [Musicat](https://github.com/basharovV/musicat) | Rich library UX | GPL product reference; no GPL code copied into this MIT project |

Historical checkpoints are retained in git and the test log. The current plan supersedes earlier staged notes that described now-implemented features as pending.
