// Bounded, optional service diagnostic using public city centres, never owner data.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { areas } = require('../src/main/fm_catalog');
const { RadioLibrary } = require('../src/main/radio_library');
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ytmamp-directory-check-'));
(async () => {
    try {
        const library = new RadioLibrary({ directory });
        await library.chooseLocation({ lat: 47.22, lon: -1.55, label: 'Nantes', countrycode: 'FR' });
        const nantes = library.local().map((s) => ({ name: s.name, frequency: s.frequency }));
        await library.chooseLocation({ lat: 43.78, lon: 7.5, label: 'Menton', countrycode: 'FR' });
        const menton = library.local().map((s) => ({ name: s.name, frequency: s.frequency }));
        console.log('RADIO_DIRECTORY_CHECK ' + JSON.stringify({ nantes, menton, expected: Object.fromEntries(areas.map((a) => [a.id, a.stations.length])), streamPlaybackTested: false, note: 'Resolved candidates may include bundled stream addresses; decoding is tested separately.' }));
        if (nantes.length < 20 || !menton.some((s) => s.frequency === 97.6)) throw new Error('Directory resolution did not reach the expected local-channel coverage; inspect this diagnostic independently of fixture tests.');
    } finally { fs.rmSync(directory, { recursive: true, force: true }); }
})().catch((error) => { console.error('RADIO_DIRECTORY_CHECK_UNAVAILABLE ' + error.message); process.exitCode = 1; });
