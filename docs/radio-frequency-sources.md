# Local broadcast directories and online streams

Reviewed 17 November 2026. The local dial recreates terrestrial FM stations receivable in an area, playing an online counterpart. National networks belong on that dial when they broadcast locally. A stream's Paris office coordinates do not determine its broadcast coverage. Internet-only stations remain in the global directory.

## Sources assessed

| Source | Useful data | Access / remaining issue |
| --- | --- | --- |
| [Arcom Ma radio FM et DAB+](https://www.arcom.fr/radio-et-audio-numerique/radio-fm-dab) | Indicative reception by commune, station identity, FM/DAB+ and transmitter facts | Useful primary reference, not an assumed open API. Its [terms](https://www.arcom.fr/mentions-legales) require express agreement for electronic reproduction. No unattended scraping adapter is integrated. |
| [Radio Browser API](https://api.radio-browser.info/) | Online URLs, UUIDs, codecs, availability checks, alternate streams | Free API usable in apps; does not supply a complete city-specific FM frequency/coverage model. Existing stream provider. |
| [ANFR Open Data](https://data.anfr.fr/) and [API](https://data.anfr.fr/node/2) | Open-licence radio-installation and spectrum data, geographic search | Matching technical installations to program identity and online streams is unresolved; not a confirmed drop-in frequency provider. |
| [Radio Data Center](https://www.radiodatacenter.com/en/radio-database/) | Combined worldwide RF/frequencies, calculated coverage and online URLs, daily updates | Licensed API/raw data; price by quotation. No account, purchase or contact initiated. |
| [Radioplayer Partner API](https://developers.radioplayer.org/api-reference/stations-1.1.html) | Geographic station lookup, bearers and live streams | Partner authentication required; access, coverage and caching terms not established. |
| [fmstream API](https://fmstream.org/api.htm) | Frequencies and streams | Published conditions forbid storing/aggregating its data into our own database; unsuitable for the proposed persistent place cache. |

A free, comprehensive, openly reusable location-to-frequency-to-stream API has not been established. Do not claim that no such service exists: the combined licensed Radio Data Center offering is a concrete counterexample. For a small project, keep Radio Browser and our own compact reviewed area records while investigating a reusable geographic frequency source. Do not silently add a paid dependency or embed partner credentials.

## Owner-approved on-demand design (pending implementation)

Store an area directory only when that place is first visited. Use a stable country/commune or provider area identifier, not a translated city label. Keep broadcast records separate from stream records: one station may have multiple transmitters/frequencies, and an exact regional program may have several online URLs.

Proposed initial policy:

- On location change, load only the current area's saved directory immediately. An unvisited area triggers one bounded provider lookup, never a country/world crawl.
- Revalidate frequency/coverage data after 7 days, only while that area is in use. Re-resolve stream URLs after 24 hours or a playback failure. Continue short decoder checks on the device; an HTTP success is not an audio check.
- Use conditional requests/source versions where supported, update atomically and retain the last good area during timeouts. Keep source URL, source update date, local fetch date and last stream-check time separate.
- Keep at most 50 recently used areas and a small metadata size cap. Evict old area metadata first; retain user favorites and their playback addresses. Download no audio/archive as part of directory refresh.
- Prefer the exact regional stream. Mark a national fallback when the local edition has no usable online address. A failed URL is not evidence that the terrestrial station ceased broadcasting.
- Do not place web-only stations or DAB-only services on the FM scale. Keep unknown frequencies unresolved rather than inventing positions. A future DAB/AM mode needs its own band model.

This cache/provider pipeline is a next bounded implementation step, not working behavior of 0.7.2 or the current two-area draft. There is no background scheduled collection job and no guarantee of automatic complete coverage for an arbitrary city yet.

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

The two coarse city centres/radii select reference areas locally; they are not transmitter positions or reception contours. Stream addresses are resolved separately through exact station aliases, with regional variants preferred. The current playing stream is preserved when location changes; local dial and Prev/Next use the newly selected area's frequency queue. One-shot location updates occur on radio entry, wake/focus after cooldown and every 15 minutes in RADIO; automatic retries pause after a permission/location failure until manual retry.

Bundled area facts plus sparse directory frequency/coordinate labels remain a fallback pending the on-demand provider/cache above. Generated tests establish mapping and queue behavior, not real reception, stream uptime, exact regional programming or native Mac acceptance.
