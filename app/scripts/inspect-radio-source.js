// Bounded public-source integration probe. Logs selectors and numeric facts only.
(async () => {
    for (const route of ['radios-ville/nantes-44200', 'radios-detail/fip--nantes-44200', 'radios/france-info']) {
        try {
            const response = await fetch('https://www.arcom.fr/radio-et-audio-numerique/radio-fm-dab/' + route, { signal: AbortSignal.timeout(12000) });
            const html = await response.text();
            const snippets = [...html.matchAll(/.{0,200}(?:data-radio|data-url|data-ajax|Alouette|NANTES|Nantes|95[.,]7|98[.,]9).{0,350}/g)].slice(0,16).map((m) => m[0]);
            console.log('FM_SOURCE_PROBE ' + JSON.stringify({route,status:response.status,bytes:html.length,snippets}));
        } catch(error) { console.log('FM_SOURCE_PROBE_UNAVAILABLE ' + route + ' ' + error.message); }
    }
})();
