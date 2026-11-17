# TONFELD identity and upgrade compatibility

The owner selected TONFELD and approved a strictly typographic identity on 17 November 2026. The compact symbol is an upright T and an F rotated 180 degrees: right stem, bottom long arm and middle short arm. No handwritten texture, added wave/radio illustration or ornamental strokes.

The wordmark appears on the player; the compact symbol serves the app, companion and missing/broken station-art placeholder. Dark graphite and warm white remain legible at small sizes. The menu-bar icon is a transparent monochrome template, independent of the square app icon.

Committed SVG paths/raster icons are font-derived artwork, with no runtime font download or embedded font file. The macOS regeneration script uses installed Arial Black; the font itself is not redistributed. The interface otherwise keeps its existing compact layout and scaling.

## Compatibility contract

Public product name, visible labels, executable/bundle names and new distribution files use TONFELD. The repository is markoblogo/TONFELD.

Preserved deliberately: npm package name `ytmamp`, application identifier `com.antonbiletskiy.ytmamp`, native location-helper identifier/name, media scheme `ytmamp-media`, bridge protocol/version, integration headers/environment variables, browser storage keys and existing profile files. A pre-ready identity helper selects the existing YTMamp/ytmamp settings directory before setting the visible app name. Explicit custom/test profiles are respected. Files are neither copied nor rewritten for the rename.

Quit the old app before replacing/installing TONFELD. Existing folder manifests, covers, favorites, visited places, pending recordings and bridge token should remain available. Native permission labels may update to TONFELD; OS permission behavior is checked separately from profile-file continuity.

Keep the companion in its existing unpacked folder when updating if you want Chromium to retain its extension ID/preferences. A different folder can create a new browser extension identity and require pairing again. On Mac the renamed bundle is TONFELD.app; quit YTMamp first and avoid launching both copies against the same profile.
