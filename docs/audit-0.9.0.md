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

Local focused tests/lint and the full clean-install CI results will be recorded against the final candidate commit in smoke-test.md. CI runs npm ci, audit at high severity, checks/packaging on three platforms, generated Electron playback/recording/UI checks, live Nantes/Kyiv diagnostics and signed Apple Silicon package checks. Service diagnostics are assessed independently of the green unit/build gates.

Remaining external/interactive items: native upgrade/listening/permissions on the renamed Mac app; any unresolved stream coverage; GitHub About metadata editing (exact text in github-about.md; connector has no repository-description update operation); staged PR reconciliation/public tag/download verification. The candidate is ad-hoc signed, not notarized. Do not call the public release complete until these outcomes are recorded explicitly.
