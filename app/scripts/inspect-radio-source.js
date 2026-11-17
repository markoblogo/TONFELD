// Bounded public-source integration probe. Logs selectors and numeric facts only.
(async () => {
    for (const route of ['radios-ville/nantes-44200', 'radios-detail/fip--nantes-44200', 'radios/france-info']) {
        try {
            const response = await fetch('https://www.arcom.fr/radio-et-audio-numerique/radio-fm-dab/' + route, { signal: AbortSignal.timeout(12000) });
            const html = await response.text();
            const snippets = route.startsWith('radios-ville') ? [...html.matchAll(/<a\b[^>]*data-action-url[^>]*>[\s\S]*?<\/a>/g)].slice(0,4).map((m) => m[0].slice(0,2000)) : [...html.matchAll(/<tr\b[^>]*>[\s\S]*?<\/tr>/g)].filter((m) => /95[.,]7|98[.,]9/.test(m[0])).slice(0,3).map((m) => m[0].slice(0,3500));
            console.log('FM_SOURCE_PROBE ' + JSON.stringify({route,status:response.status,bytes:html.length,snippets}));
        } catch(error) { console.log('FM_SOURCE_PROBE_UNAVAILABLE ' + route + ' ' + error.message); }
    }
})();
