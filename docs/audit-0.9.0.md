# TONFELD 0.9.0 bounded audit

17 November 2026. Scope: the agreed rename/radio finishing block and preparation for a public release. This is a code/configuration/documentation review plus the recorded automated checks, not a penetration test or native listening certification.

## Findings and actions

| Finding | Action / evidence |
| --- | --- |
| Renaming an Electron product can select a fresh profile | Added a pre-ready identity helper that reuses existing YTMamp/ytmamp settings and respects explicit custom/test profiles. Original settings/token bytes are verified unchanged. Application ID and storage/protocol names remain stable. |
| Station saving differed between stream variants and UI controls | Shared saved-state lookup across compatible variants; authoritative Save result and selection events synchronize cards/mini-player. Removing a saved item removes its card immediately. Restart/alternate-stream and desktop interaction checks added. |
| Empty/broken station artwork and square tray template | Approved font-derived SVG fallback, dedicated transparent monochrome menu-bar icon and matching app/companion icons. No runtime font/image service required. |
| Existing tuning effect was faint/briefly crackled | One bounded filtered-noise hiss with fade edges and volume updates. Its monitor branch remains outside recording; source/gain nodes disconnect after stopping. |
| Stale stream candidates reduced local coverage | Added sourced direct addresses without inventing frequencies or replacing terrestrial channels with themed web stations. Actual final decoder counts belong in smoke-test.md; candidates alone are not verification. |
| Current docs contained obsolete staged statements | Rewrote README/current roadmap, canonical repository links, upgrade/privacy/browser notes and candidate changes. Historical evidence is retained in the test log/git. |
| One-time source probes and missing output exclusions | Removed unused old probes; exclude generated Kyiv, recording trace and screenshot outputs. User music/profiles are untouched. |
| Tag workflow built without full tests/audit/version gating | Added app/companion/tag/identity consistency, dependency audit, checks, Mac signature/helper verification and release checksums. A native review still precedes a new public tag. |

## Invariants checked

- Existing authenticated loopback WebSocket bridge and origin/authenticated LAN API contracts are preserved. Rename does not change integration headers or wire version.
- Renderer context isolation, sandbox, CSP, navigation restrictions and trusted-frame IPC remain enabled.
- File playback retains opaque IDs/path containment/range support; metadata workers and collection/art caches stay bounded. No library-wide audio copies or whole-disk scan.
- Public-only station URLs, DNS pinning and redirect checks remain in the controlled media protocol. No new arbitrary network/filesystem interface was added.
- Recording remains session/source/socket bounded, explicit for microphone/tab capture, streamed to disk and recoverable. No transcription/meeting integration or recordings manager added.
- Radio place/address/decoder caches remain separate and bounded. Stored frequency counts are not claimed as online playback or RF reception proof.

## Verification and remaining release work

Final code commit `90e2d9032c91742f446ce156b8ca66dfed15ce48` passed [CI 44110614752](https://github.com/markoblogo/TONFELD/actions/runs/44110614752) on macOS, Windows and Ubuntu: clean install, identity/version checks, lint, 102 tests plus 13 repeated integration checks, dependency audit at high severity and packaging. Ubuntu's generated local/library/radio/microphone desktop checks passed, including TF assets, synchronized Save/Saved controls and compact scaling. macOS verified the app and extracted ZIP signatures, native location helper, microphone entitlement and packaged metadata. Exact artifacts/digests are in [smoke-test.md](smoke-test.md).

The dependency audit reported **six moderate findings**, all in the development packaging chain through `minimatch`, `@electron/universal` and `electron-builder` (GHSA-g3hv-75wg-m249, glob-pattern denial of service). No high or critical findings were reported. These build dependencies are separate from the packaged production dependencies; this does not establish zero risk. The suggested forced fix changes the builder version incompatibly. A reviewed build-tool update remains a release follow-up; no blind forced downgrade was applied to the validated candidate.

The live diagnostic decoded Nantes 33/33 and Kyiv 29/35 (one unresolved, five failed); Rennes refreshed 29 FM entries and retained them across cache restart. Kyiv had decoded 30/35 in the preceding run, demonstrating time-dependent availability. Service diagnostics are assessed independently of the green unit/build gates and do not establish audible program quality.

Owner acceptance, 17 November: the owner reports that 0.9.0 works, with no functional objections, and explicitly authorizes release. Missing-station-art alignment/proportions are deferred as cosmetic work. This is owner acceptance, not a new instrumented permission/listening test. The [Mac pass](test-0.9.0.md) remains a repeatable checklist.

Release operations are complete: staged PRs #14–16 are merged; [v0.9.0 is public](https://github.com/markoblogo/TONFELD/releases/tag/v0.9.0). Release builds and main CI passed all platforms, and every uploaded distributable was downloaded and checksum-verified before publication. See [the release verification](releases/v0.9.0-verification.md) for the tag commit, jobs and asset digests.

Partial stream coverage and the documented moderate packaging findings remain known limits. The Mac build is ad-hoc signed, not notarized. GitHub About remains owner-applied (agreed text in github-about.md); Website/landing page is deferred. The release block is closed; vinyl, placeholder cosmetics and meeting/transcription features remain later work.
