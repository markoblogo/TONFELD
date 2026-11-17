// Reviewed numeric tuning facts, separate from online stream coordinates.
// These city areas are selection hints, not transmitter coverage predictions.
const reviewed = '2026-11-17';
const mentonStations = require('./menton_stations.json');
const areas = [
    { id: 'fr-nantes', label: 'Nantes', countrycode: 'FR', lat: 47.22, lon: -1.55, radiusKm: 25, stations: require('./nantes_stations.json') },
    { id: 'fr-rennes', label: 'Rennes', countrycode: 'FR', lat: 48.11, lon: -1.68, radiusKm: 15, stations: require('./rennes_stations.json') },
    { id: 'fr-menton', label: 'Menton', countrycode: 'FR', lat: 43.78, lon: 7.5, radiusKm: 8, stations: mentonStations }
];
function channelName(name) {
    return String(name || '').normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase()
        .replace(/\([^)]*(?:aac|mp3|hifi|metadata|bose|kbps|kbit)[^)]*\)/g, '')
        .replace(/\b\d{2,3}(?:[.,]\d+)?\s*(?:mhz|fm)\b/g, '')
        .replace(/\b(?:aac|mp3|ogg|opus|hifi|\d+\s*(?:kbps|kbits?|k))\b/g, '')
        .replace(/[^a-z0-9]/g, '');
}
function matches(station, broadcast) {
    return broadcast.aliases.some((name) => channelName(name) === channelName(station.name));
}
function regional(station, broadcast) { return (broadcast.preferredAliases || []).some((name) => channelName(name) === channelName(station.name)); }
module.exports = { areas, reviewed, matches, regional };
