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

Owner acceptance: everything works; the station-art placeholder needs cosmetic alignment/proportion refinement, explicitly deferred without blocking release. Release reconciliation, builds and uploaded-asset verification are the final operational steps of this block. About remains prepared for manual owner insertion, Website empty.

## Deferred recording workspace

Save As is sufficient now. **Do not add a recordings list/manager in 0.9.0.** A future separately agreed workspace may cover dictaphone recordings plus meetings/calls, with explicit sending to transcription and summarization. Discuss capture methods, permission/consent, processing destination, privacy and storage at that stage. Meeting capture, transcription and summarization are outside the current implementation.

## Later queue, to discuss after this block

- **Station-art placeholder cosmetics:** center on both axes; compare the full TONFELD wordmark in the wide rectangle with a larger monogram sized like normal station artwork. Preserve the accepted typography and card dimensions. This is queued for the next agreed block, not part of 0.9.0 code changes.
- Local vinyl visual deck based on [rauchg/vinyl](https://github.com/rauchg/vinyl), in its own collapsible panel. Reuse shared local playback; collapsing suspends rendering. Physical groove/stylus sound simulation and preprocessing are separately measured enhancements with bounded storage.
- YouTube Music playlist selection and optional in-app playback. The current signed-in browser companion remains the working model.
- Further macOS integration and other owner ideas. Their order is not fixed before the review.

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
