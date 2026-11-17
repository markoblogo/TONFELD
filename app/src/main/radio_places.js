const fs = require('node:fs');
const path = require('node:path');
const fmCatalog = require('./fm_catalog');
const { FranceFrequencyProvider } = require('./radio_frequency_provider');
const WEEK = 7 * 86400000; const DAY = 86400000;
const slug = (value) => String(value || '').normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0,100);
function distance(a,b) { const rad = (v) => v * Math.PI / 180; return 6371 * 2 * Math.asin(Math.min(1,Math.sqrt(Math.sin(rad(a.lat-b.lat)/2)**2 + Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(rad(a.lon-b.lon)/2)**2))); }
function validArea(area) {
    return area && /^[a-z0-9:-]{1,180}$/.test(area.id) && /^[A-Z]{2}$/.test(area.countrycode) && typeof area.label === 'string' && area.label.length <= 120 && Number.isFinite(area.lat) && Math.abs(area.lat) <= 90 && Number.isFinite(area.lon) && Math.abs(area.lon) <= 180 && Number.isFinite(area.radiusKm) && area.radiusKm > 0 && area.radiusKm <= 60 && Array.isArray(area.stations) && area.stations.length <= 120 && area.stations.every((s) => s && typeof s.name === 'string' && s.name.length <= 200 && Number.isFinite(s.frequency) && s.frequency >= 87.5 && s.frequency <= 108 && Array.isArray(s.aliases) && s.aliases.length <= 20 && s.aliases.every((n) => typeof n === 'string' && n.length <= 200) && typeof s.source === 'string' && s.source.startsWith('https://') && s.source.length <= 2048);
}
class RadioPlaces {
    constructor({ directory, provider = new FranceFrequencyProvider(), now = Date.now }) {
        this.file = path.join(directory,'radio-places-v1.json'); this.provider = provider; this.now = now; this.entries = new Map(); this.pending = new Map();
        try {
            if (fs.statSync(this.file).size > 1024 * 1024) return;
            for (const item of JSON.parse(fs.readFileSync(this.file,'utf8')).places.slice(0,50)) if (validArea(item.area) && Number.isFinite(item.fetchedAt) && item.fetchedAt <= now() && Number.isFinite(item.usedAt)) this.entries.set(item.area.id,item);
        } catch { /* no saved directories */ }
    }
    save() {
        const places = [...this.entries.values()].sort((a,b) => b.usedAt-a.usedAt).slice(0,50);
        let json = JSON.stringify({ version:1, places });
        while (Buffer.byteLength(json) > 1024*1024 && places.length > 1) { places.pop(); json = JSON.stringify({version:1,places}); }
        this.entries = new Map(places.map((p) => [p.area.id,p]));
        fs.writeFileSync(this.file+'.tmp', json, { mode:0o600 }); fs.renameSync(this.file+'.tmp', this.file);
    }
    seed(location) { return fmCatalog.areas.find((a) => a.countrycode === location.countrycode && distance(a,location) <= a.radiusKm); }
    cached(location) {
        const seed = this.seed(location);
        return [...this.entries.values()].find((p) => p.area.countrycode === location.countrycode && (seed ? p.area.id === seed.id : slug(p.area.label) === slug(location.label) && distance(p.area,location) <= p.area.radiusKm))?.area || seed || null;
    }
    async resolve(location, { force = false } = {}) {
        const seed = this.seed(location);
        const id = seed?.id || (location.countrycode + ':' + slug(location.label) + ':' + String(location.postalCode || '').replace(/[^a-zA-Z0-9]/g,'').slice(0,12)).toLowerCase();
        const previous = this.entries.get(id);
        if (previous) previous.usedAt = this.now();
        if (!force && previous && this.now()-previous.fetchedAt < WEEK) { this.save(); return {area:previous.area,cached:true}; }
        if (this.pending.has(id)) return this.pending.get(id);
        const task = (async () => {
            try {
                const fetched = await this.provider.lookup({ ...location, seed: previous?.area || seed });
                const area = { ...fetched, id, lat: seed?.lat ?? location.lat, lon: seed?.lon ?? location.lon, radiusKm: seed?.radiusKm || 15 };
                if (!validArea(area) || !area.stations.length) throw new Error('No confirmed local FM frequencies returned.');
                this.entries.set(id,{area,fetchedAt:this.now(),usedAt:this.now(),streamsAt:previous?.streamsAt || 0}); this.save();
                return {area,cached:false};
            } catch (error) {
                const area = previous?.area || seed;
                // Never replace a useful directory with an empty/outage result or stamp it fresh.
                if (area) return { area, cached:true, stale:true, warning:error.message };
                return {area:null,cached:false,warning:error.message};
            } finally { this.pending.delete(id); }
        })();
        this.pending.set(id,task); return task;
    }
    needsStreams(id) { const item=this.entries.get(id); return !item || this.now()-(item.streamsAt || 0) >= DAY; }
    markStreams(id) { const item=this.entries.get(id); if (item) { item.streamsAt=this.now(); this.save(); } }
    invalidateStreams() { for (const item of this.entries.values()) item.streamsAt=0; this.save(); }
}
module.exports = { RadioPlaces, validArea, WEEK, DAY };
