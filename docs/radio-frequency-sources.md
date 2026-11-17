# Local broadcast directories and online streams

Reviewed 17 November 2026. The local dial recreates terrestrial FM stations receivable in an area, playing an online counterpart. National networks belong on that dial when they broadcast locally. A stream's Paris office coordinates do not determine its broadcast coverage. Internet-only stations remain in the global directory.

## Sources assessed

| Source | Useful data | Access / remaining issue |
| --- | --- | --- |
| [Arcom Ma radio FM et DAB+](https://www.arcom.fr/radio-et-audio-numerique/radio-fm-dab) | Indicative reception by commune, station identity, FM/DAB+ and transmitter facts | Useful primary reference, not an assumed open API. Its [terms](https://www.arcom.fr/mentions-legales) require express agreement for electronic reproduction. 0.8.0 adds a bounded per-city factual lookup for the user’s private local cache; it is not an official API or a licence to republish the site or national dataset. |
| [Radio Browser API](https://api.radio-browser.info/) | Online URLs, UUIDs, codecs, availability checks, alternate streams | Free API usable in apps; does not supply a complete city-specific FM frequency/coverage model. Existing stream provider. |
| [ANFR Open Data](https://data.anfr.fr/) and [API](https://data.anfr.fr/node/2) | Open-licence radio-installation and spectrum data, geographic search | Matching technical installations to program identity and online streams is unresolved; not a confirmed drop-in frequency provider. |
| [Radio Data Center](https://www.radiodatacenter.com/en/radio-database/) | Combined worldwide RF/frequencies, calculated coverage and online URLs, daily updates | Licensed API/raw data; price by quotation. No account, purchase or contact initiated. |
| [Radioplayer Partner API](https://developers.radioplayer.org/api-reference/stations-1.1.html) | Geographic station lookup, bearers and live streams | Partner authentication required; access, coverage and caching terms not established. |
| [fmstream API](https://fmstream.org/api.htm) | Frequencies and streams | Published conditions forbid storing/aggregating its data into our own database; unsuitable for the proposed persistent place cache. |

A free, comprehensive, openly reusable location-to-frequency-to-stream API has not been established. Do not claim that no such service exists: the combined licensed Radio Data Center offering is a concrete counterexample. For a small project, keep Radio Browser and our own compact reviewed area records while investigating a reusable geographic frequency source. Do not silently add a paid dependency or embed partner credentials.

## On-demand lookup in 0.8.0

`radio_frequency_provider.js` reads public French commune membership and numeric FM table rows, retaining names/frequencies/source references rather than HTML pages, artwork or a national dataset. Only the current requested city is resolved. City index/detail routes are pinned to the source origin, responses are bounded, three detail requests run at once under a 45-second lookup deadline, and DAB-only records never enter FM. If a service has several frequencies, the best indicated reception is selected. These are indicative city coverage facts, not a measurement at the device. This personal-cache implementation does not establish an open licence for republishing source content or a shared derivative national database. Source attribution and the website's reuse conditions remain relevant to any wider redistribution/service plan.

`radio_places.js` persists at most 50 recently used areas within 1 MiB, and stores only visited areas. Frequencies refresh after seven days when that area is used. Online URLs are resolved separately after 24 hours or a failed stream; muted device decoder checks remain independent. A fresh area is available again after restart without a new source request. Source time (unknown when not supplied), local fetch time, stream resolution time and decoder-check time are separate. Empty/time-out results never overwrite useful area data or mark it fresh. Favorites/audio files are unaffected by area eviction.

France is the initial automatic frequency provider. Cities absent from the source or source layout/network failures keep saved/reference facts and show a warning; other countries retain the global online catalog and supplied-frequency fallback. This is not guaranteed worldwide FM coverage. Nantes/Rennes/Menton reviewed seeds remain useful during outages; the owner's Monaco/Italian/motorway Menton selection supplements the French-only source. Exact regional streams are preferred; a national online edition may still differ from local advertising/programs.

## Initial Nantes reference

The draft contains 33 individually sourced numeric FM assignments in `app/src/main/nantes_stations.json`. This is the researched initial grid, not measured signal reception or a guaranteed number of playable streams. Only numeric station facts and source references are stored, not copied regulator pages, artwork or a national database. The current Arcom [Nantes page](https://www.arcom.fr/radio-et-audio-numerique/radio-fm-dab/radios-ville/nantes-44200) is a cross-check for terrestrial membership.

| Station | MHz | Source |
| --- | --- | --- |
| Radio Nova | 87.8 | [Reference](https://www.arcom.fr/radio-et-audio-numerique/radio-fm-dab/radios/radio-nova) |
| Rire et Chansons | 88.4 | [Reference](https://www.arcom.fr/radio-et-audio-numerique/radio-fm-dab/radios/rire-et-chansons) |
| M Radio | 88.8 | [Reference](https://www.arcom.fr/radio-et-audio-numerique/radio-fm-dab/radios/m-radio) |
| Alouette | 89.5 | [Reference](https://www.arcom.fr/radio-et-audio-numerique/radio-fm-dab/radios/alouette) |
| RFM | 90.1 | [Reference](https://www.arcom.fr/radio-et-audio-numerique/radio-fm-dab/radios/rfm) |
| France Inter | 90.6 | [Reference](https://www.arcom.fr/radio-et-audio-numerique/radio-fm-dab/radios/france-inter) |
| Jet FM | 91.2 | [Reference](https://www.arcom.fr/radio-et-audio-numerique/radio-fm-dab/radios/jet-fm) |
| Prun’ | 92 | [Reference](https://www.arcom.fr/radio-et-audio-numerique/radio-fm-dab/radios/prun) |
| Radio Orient | 92.4 | [Reference](https://www.arcom.fr/radio-et-audio-numerique/radio-fm-dab/radios/radio-orient) |
| SUN | 93 | [Reference](https://www.arcom.fr/radio-et-audio-numerique/radio-fm-dab/radios/sun) |
| NTI | 93.4 | [Reference](https://www.radionti.com/) |
| France Culture | 94.2 | [Reference](https://www.arcom.fr/radio-et-audio-numerique/radio-fm-dab/radios/france-culture) |
| Europe 2 | 94.7 | [Reference](https://www.arcom.fr/radio-et-audio-numerique/radio-fm-dab/radios/europe-2-pays-de-la-loire) |
| FIP | 95.7 | [Reference](https://www.arcom.fr/radio-et-audio-numerique/radio-fm-dab/radios/fip) |
| Nostalgie | 96.8 | [Reference](https://www.nostalgie.fr/frequences) |
| RTL2 | 97.7 | [Reference](https://www.arcom.fr/radio-et-audio-numerique/radio-fm-dab/radios/rtl2-nantes) |
| Alternantes FM | 98.1 | [Reference](https://www.arcom.fr/radio-et-audio-numerique/radio-fm-dab/radios/alternantes-fm) |
| France Info | 98.9 | [Reference](https://www.arcom.fr/radio-et-audio-numerique/radio-fm-dab/radios/france-info) |
| RCA | 99.5 | [Reference](https://www.arcom.fr/radio-et-audio-numerique/radio-fm-dab/radios/rca) |
| RMC | 99.9 | [Reference](https://www.arcom.fr/radio-et-audio-numerique/radio-fm-dab/radios/rmc) |
| Hit West | 100.9 | [Reference](https://hitwest.ouest-france.fr/comment-ecouter-hit-west) |
| Euradio | 101.3 | [Reference](https://www.arcom.fr/radio-et-audio-numerique/radio-fm-dab/radios/euradio) |
| ici Loire Océan | 101.8 | [Reference](https://www.arcom.fr/radio-et-audio-numerique/radio-fm-dab/radios/ici-loire-ocean) |
| NRJ | 102.4 | [Reference](https://www.nrj.fr/frequences) |
| Skyrock | 102.9 | [Reference](https://www.arcom.fr/radio-et-audio-numerique/radio-fm-dab/radios/skyrock) |
| Fun Radio | 103.4 | [Reference](https://www.funradio.fr/frequences) |
| Radio Fidélité | 103.8 | [Reference](https://radio-fidelite.fr/ecouter/) |
| RTL | 104.3 | [Reference](https://www.arcom.fr/radio-et-audio-numerique/radio-fm-dab/radios/rtl) |
| Europe 1 | 104.7 | [Reference](https://www.arcom.fr/radio-et-audio-numerique/radio-fm-dab/radios/europe-1) |
| France Musique | 105.5 | [Reference](https://www.arcom.fr/radio-et-audio-numerique/radio-fm-dab/radios/france-musique) |
| Chérie FM | 106.2 | [Reference](https://www.cheriefm.fr/frequences) |
| Radio Classique | 106.7 | [Reference](https://www.arcom.fr/radio-et-audio-numerique/radio-fm-dab/radios/radio-classique) |
| BFM Business | 107.2 | [Reference](https://www.arcom.fr/radio-et-audio-numerique/radio-fm-dab/radios/bfm-business) |

Current assignments matter: France Info is now 98.9 and France Musique 105.5 in Nantes; older directories reverse them. [Radio France announced July 2026 network changes](https://www.radiofrance.com/actualite/partir-du-22-juillet-une-partie-des-frequences-fm-de-radio-france-evolue-quest-ce-qui). [Arcom confirms Mouv' ended FM on 31 August 2026](https://www.arcom.fr/presse/larcom-autorise-les-evolutions-du-reseau-de-diffusion-fm-de-radio-france), so its former 96.1 slot is excluded. NTI's 93.4 is confirmed by its own Nantes listening notice; reception depends on the location.

## Menton reference

The owner's [AzurMenton radio](https://azurmenton.com/en/tools) reconstructs the local terrestrial offering with 19 online station counterparts. Public station fields were read from the existing `src/content/utility/radio.ts` and imported into `app/src/main/menton_stations.json`; the website was not changed. Those 19 are a starting selection, not evidence there are only 19 receivable stations. Monaco/Italian broadcasts in that selection are not rejected merely because the device is in France.

The explicit Nice/Menton Radio Monaco value is 95.4, versus 98.2 in Monaco. M Radio is resolved to 104.1 from [its 2026 authorization](https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000054132637), retaining the original multi-frequency site label as provenance. Ici Azur's supplied HLS URL needs a supported direct alternative in this preview. The VINCI URL's regional motorway program still needs confirmation before it can be described as the exact local edition. Imported addresses remain candidates until actual decoder/listening checks succeed.

## Current implementation limits

Location is refreshed on radio entry, wake/focus after cooldown and every 15 minutes in RADIO; automatic retries pause after location failure until manual retry. Numeric device coordinates stay local; French frequency lookups request city paths, not the device coordinates. The playing stream is preserved when location changes; the dial and Prev/Next use the newly selected local queue. Native location returns a locale-neutral city label plus postcode for lookup.

Generated tests establish parsing, cache lifecycle, source isolation and queue behavior. The first live Nantes decoder report passed 28 of 33 streams on 17 November. The unseeded Rennes lookup resolved 29 FM entries, survived a cache restart and was then retained as a bundled reference at the owner’s request. Subsequent reports refresh that Rennes reference. These are separate service diagnostics. They do not establish audible program quality, exact regional editions or reception on the owner's Mac. Browser tab capture and native microphone permission still require interactive acceptance in the test build.

## Saved-city selection and Kyiv

RADIO LIBRARY offers Device location plus bundled/visited directories. A manual city selection changes the local tuning queue while keeping the current stream playing. It survives device-location updates and restart. Returning to Device location uses the most recent actual device position. Unknown/unvisited directory IDs cannot be selected through IPC. New French visited places are resolved and retained on demand; explicit owner requests may add reviewed references without travelling there. There is no global city import.

Kyiv was explicitly requested on 17 November and adds 35 FM service references in `kyiv_stations.json`. Numeric facts are cross-checked against [Radiomap Kyiv](https://radiomap.eu/ua/kyiv) and primary frequency pages from [Hit FM](https://www.hitfm.ua/about/), [Radio ROKS](https://www.radioroks.ua/about/), [Radio Jazz](https://www.radiojazz.ua/about/), [Kiss FM](https://www.kissfm.ua/about/) and [Nashe Radio](https://www.nasheradio.ua/about/). One principal FM assignment per service is listed; OIRT, AM, DAB-only and internet-only channels are excluded. Shared/program-relay frequencies are not additional full-time services. Online addresses are matched within UA and checked independently. Cyrillic identities are preserved, never normalized to an empty channel name. Kyiv is a reviewed saved reference with separate online-address refresh, not an automatic Ukraine frequency provider or measured reception guarantee.

Final candidate service diagnostics (17 November): Nantes decoded 31/33 referenced frequency slots; Kyiv decoded 14/35. Rennes refreshed/cached 29 FM facts. A single unique dial slot is retained for each frequency even if directory names differ. Unresolved/failed streams are not treated as verified playback. See smoke-test.md for exact CI artifacts and remaining coverage gaps.
