const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { RadioLibrary } = require('../src/main/radio_library');
const { RadioPlayer } = require('../src/main/radio_player');
const { matches, areas, regional } = require('../src/main/fm_catalog');

function fixture(t) {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ytmamp-fm-catalog-'));
    t.after(() => fs.rmSync(directory, { force: true, recursive: true }));
    const station = (name, suffix, extra = {}) => ({ name, url: 'https://example.org/' + suffix, countrycode: 'FR', codec: 'MP3', geo_lat: 48.85, geo_long: 2.35, ...extra });
    const channels = [station('FIP', 'fip'), station('FIP Jazz', 'jazz'), station('RFM', 'rfm'), station('RTL', 'rtl'), station('RTL2', 'rtl2'), station('Europe 1', 'europe'), station('RTL', 'german', { countrycode: 'DE' })];
    const nearby = [station('Nantes online', 'nantes', { geo_lat: 47.22, geo_long: -1.55 }), station('Menton online', 'menton', { geo_lat: 43.78, geo_long: 7.5 })];
    const calls = [];
    const browser = { search: async (query) => { calls.push(query); return query.has_geo_info ? nearby : channels; } };
    return { directory, calls, library: new RadioLibrary({ directory, browser, frequencyProvider: { lookup: async () => { throw new Error('Isolated directory fixture.'); } } }) };
}
test('known local frequencies resolve to national streams even when their directory coordinates are elsewhere', async (t) => {
    const { library } = fixture(t);
    await library.chooseLocation({ lat: 47.22, lon: -1.55, label: 'Нант', countrycode: 'FR' });
    for (const [name, mhz] of [['RFM',90.1],['FIP',95.7],['RTL',104.3],['Europe 1',104.7]]) assert.ok(library.local().some((s) => s.name === name && s.frequency === mhz));
    assert.equal(library.local().some((s) => /Jazz/.test(s.name)), false);
    assert.ok(library.local().every((s) => s.frequencySource.startsWith('https:')));
    assert.equal(library.local().some((s) => s.name === 'Nantes online'), false);
});
test('moving Nantes to Menton replaces local stations and frequencies without interrupting the current stream', async (t) => {
    const { library } = fixture(t);
    await library.chooseLocation({ lat: 47.22, lon: -1.55, label: 'Nantes', countrycode: 'FR' });
    const player = new RadioPlayer({ library }); t.after(() => player.close());
    const commands = []; player.on('audio', (c) => commands.push(c));
    const fip = library.local().find((s) => s.name === 'FIP'); player.select(fip.id);
    player.receive({ id: player.id, revision: player.revision, playing: true });
    const before = commands.length;
    await library.chooseLocation({ lat: 43.78, lon: 7.5, label: 'Menton', countrycode: 'FR' }); player.publish();
    assert.ok(library.local().some((s) => s.name === 'RFM' && s.frequency === 97.6));
    assert.equal(library.local().some((s) => ['FIP', 'RTL', 'Europe 1'].includes(s.name)), false);
    assert.equal(library.local().some((s) => /online/.test(s.name)), false);
    assert.equal(player.id, fip.id); assert.equal(player.state.playing, true); assert.equal(commands.length, before);
    player.command({ cmd: 'next' }); assert.equal(commands.at(-1).frequency, 97);
});
test('location refresh retries lookup explicitly, respects the short cache and never carries frequencies into another country', async (t) => {
    const { directory, library, calls } = fixture(t);
    const location = { lat: 47.22, lon: -1.55, label: 'Nantes', countrycode: 'FR' };
    await library.chooseLocation(location); const first = calls.length;
    await library.chooseLocation(location); assert.equal(calls.length, first);
    await library.chooseLocation({ ...location, refresh: true }); assert.ok(calls.length > first);
    const restored = new RadioLibrary({ directory }); assert.deepEqual(restored.local().map((s) => s.frequency), library.local().map((s) => s.frequency));
    await library.chooseLocation({ lat: 43.78, lon: 7.5, label: 'Border', countrycode: 'IT' });
    assert.equal(library.local().length, 0);
});
test('technical stream labels match a reviewed channel, but themed and similarly named channels do not', () => {
    const channel = { aliases: ['FIP', 'FIP Radio France'] };
    assert.equal(matches({ name: 'FIP (AAC 128kbps)' }, channel), true);
    assert.equal(matches({ name: 'FIP Radio France - MP3' }, channel), true);
    for (const name of ['FIP Jazz', 'FIP Rock', 'FIP 1980']) assert.equal(matches({ name }, channel), false);
});
test('Menton retains all 19 owner station candidates and resolves M Radio to the authorized local frequency', async (t) => {
    const { library } = fixture(t);
    const { areas } = require('../src/main/fm_catalog');
    assert.equal(areas.find((a) => a.id === 'fr-menton').stations.length, 19);
    await library.chooseLocation({ lat: 43.78, lon: 7.5, label: 'Menton', countrycode: 'FR' });
    assert.ok(library.local().some((s) => s.name === 'M Radio' && s.frequency === 104.1));
    assert.ok(library.local().some((s) => s.name === 'Radio Monaco' && s.frequency === 95.4));
    assert.equal(library.local().some((s) => s.frequency === 98.2), false);
});
test('the Nantes dial maps the researched broadcast grid, not arbitrary city-named internet streams', async (t) => {
    const { library } = fixture(t);
    const nantes = areas.find((a) => a.id === 'fr-nantes');
    assert.equal(nantes.stations.length, 33);
    library.browser.search = async () => [...nantes.stations.map((s) => ({ name: s.name, url: 'https://example.org/' + encodeURIComponent(s.name), countrycode: 'FR', codec: 'MP3', geo_lat: 48.85, geo_long: 2.35 })), { name: 'Nantes internet only', url: 'https://example.org/web', countrycode: 'FR', geo_lat: 47.22, geo_long: -1.55 }];
    await library.chooseLocation({ lat: 47.22, lon: -1.55, label: 'Nantes', countrycode: 'FR' });
    assert.equal(library.local().length, 33);
    assert.ok(library.local().some((s) => s.name === 'France Info' && s.frequency === 98.9));
    assert.ok(library.local().some((s) => s.name === 'France Musique' && s.frequency === 105.5));
    assert.equal(library.local().some((s) => s.frequency === 96.1 || s.name === 'Nantes internet only'), false);
});
test('regional stream variants win over national fallback addresses without matching other cities or themed streams', async (t) => {
    const { library } = fixture(t);
    library.browser.search = async () => ['NRJ', 'NRJ Nantes', 'NRJ Nice', 'NRJ Dance'].map((name) => ({ name, url: 'https://example.org/' + encodeURIComponent(name), countrycode: 'FR', codec: 'MP3' }));
    await library.chooseLocation({ lat: 47.22, lon: -1.55, label: 'Nantes', countrycode: 'FR' });
    assert.equal(library.local().find((s) => s.frequency === 102.4).name, 'NRJ Nantes');
    const channel = areas[0].stations.find((s) => s.name === 'NRJ');
    assert.equal(regional({ name: 'NRJ Nantes' }, channel), true);
    assert.equal(matches({ name: 'NRJ Nice' }, channel), false);
});
