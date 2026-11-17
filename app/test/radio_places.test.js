const test=require('node:test'); const assert=require('node:assert/strict'); const fs=require('node:fs'); const os=require('node:os'); const path=require('node:path');
const {RadioPlaces,WEEK,DAY}=require('../src/main/radio_places');
const {FranceFrequencyProvider,stationLinks,frequencies}=require('../src/main/radio_frequency_provider');
const ROOT='/radio-et-audio-numerique/radio-fm-dab/';
const link=(name,band,route)=>`<a data-action-url="${Buffer.from(encodeURIComponent(ROOT+route)).toString('base64')}" href="#">${name}<span>${band}</span></a>`;
const row=(mhz,band='fm',quality=5)=>`<tr><td><strong>${mhz} MHz</strong></td><td>Station</td><td><a href="${ROOT}emetteur/example--${band}">Transmitter</a></td><td><img alt="Bonne ${quality}/5"></td></tr>`;
function fixture(t,provider){const directory=fs.mkdtempSync(path.join(os.tmpdir(),'ytmamp-places-')); t.after(()=>fs.rmSync(directory,{recursive:true,force:true}));let time=2000000000000;return{directory,clock:()=>time,advance:(n)=>time+=n,places:new RadioPlaces({directory,provider,now:()=>time})};}
const location={label:'Angers',countrycode:'FR',lat:47.47,lon:-0.55,postalCode:'49000'};
const area={label:'Angers',countrycode:'FR',stations:[{name:'Test FM',frequency:99.1,aliases:['Test FM'],source:'https://example.org/frequencies'}]};
test('new places fetch on demand, survive restart, and separate weekly frequency from daily stream refresh',async(t)=>{
 let calls=0;const f=fixture(t,{lookup:async()=>{calls++;return area;}});
 const first=await f.places.resolve(location);assert.equal(calls,1);assert.equal(f.places.needsStreams(first.area.id),true);
 assert.ok(f.places.available().some(a=>a.label==='Angers'));assert.equal(f.places.available().some(a=>a.label==='Unvisited'),false);
 f.places.markStreams(first.area.id);assert.equal(f.places.needsStreams(first.area.id),false);
 await f.places.resolve(location);assert.equal(calls,1);f.advance(DAY+1);assert.equal(f.places.needsStreams(first.area.id),true);
 const restored=new RadioPlaces({directory:f.directory,provider:{lookup:async()=>{throw Error('Should use cache');}},now:f.clock});assert.equal((await restored.resolve(location)).area.stations[0].frequency,99.1);
 f.advance(WEEK);await f.places.resolve(location);assert.equal(calls,2);
});
test('outages never replace a useful directory or make stale frequency data fresh',async(t)=>{
 const f=fixture(t,{lookup:async()=>area}); const first=await f.places.resolve(location);f.advance(WEEK+1);
 const saved=f.places.entries.get(first.area.id).fetchedAt;f.places.provider.lookup=async()=>{throw Error('Service unavailable');};
 const stale=await f.places.resolve(location);assert.equal(stale.stale,true);assert.equal(stale.area.stations.length,1);assert.equal(f.places.entries.get(first.area.id).fetchedAt,saved);
});
test('place cache retains only fifty recently used areas and stays below one MiB',async(t)=>{
 const f=fixture(t,{lookup:async(l)=>({...area,label:l.label})});
 for(let i=0;i<55;i++){await f.places.resolve({...location,label:'City '+i,postalCode:String(i)});f.advance(1);}
 assert.equal(f.places.entries.size,50);assert.ok(fs.statSync(f.places.file).size<=1024*1024);assert.equal([...f.places.entries.values()].some((e)=>e.area.label==='City 0'),false);
});
test('source parser follows only bounded FM detail routes and excludes DAB-only services',()=>{
 const html=link('FIP','DAB+ · FM','radios-detail/fip--angers-49000')+link('DAB Radio','DAB+','radios-detail/dab--angers-49000')+link('Other','FM','../../evil');
 assert.deepEqual(stationLinks(html).map((s)=>s.name),['FIP']);
 assert.deepEqual(frequencies(row(99.1,'fm',3)+row(101.2,'fm',5)+row(190.64,'dab',5)).map((s)=>s.frequency),[101.2,99.1]);
});
test('a place without a bundled grid loads its own FM membership, frequencies and provenance',async()=>{
 const reads=[];const provider=new FranceFrequencyProvider({read:async(url)=>{
  reads.push(url);if(url.endsWith('/radios-ville'))return `<a href="${ROOT}radios-ville/angers-49000">Angers</a>`;
  if(url.endsWith('/radios-ville/angers-49000'))return link('Local FM','FM','radios-detail/local--angers-49000')+link('DAB Radio','DAB+','radios-detail/dab--angers-49000');
  if(url.endsWith('/radios-detail/local--angers-49000'))return row(99.1);throw Error('Unexpected source');
 }});
 const result=await provider.lookup(location);assert.equal(result.stations.length,1);assert.equal(result.stations[0].frequency,99.1);assert.match(result.stations[0].source,/local--angers/);assert.equal(reads.length,3);
});
test('national services in a new city never inherit another city regional stream or aliases',async()=>{
 const provider=new FranceFrequencyProvider({read:async(url)=>{
  if(url.endsWith('/radios-ville'))return `<a href="${ROOT}radios-ville/angers-49000">Angers</a>`;
  if(url.endsWith('/radios-ville/angers-49000'))return link('NRJ','FM','radios-detail/nrj--angers-49000');
  return row(98);
 }});
 const station=(await provider.lookup(location)).stations[0];
 assert.equal(station.aliases.some((a)=>/Nantes|Rennes/i.test(a)),false);
 assert.equal(station.preferredAliases,undefined);assert.equal(station.url,undefined);
});
