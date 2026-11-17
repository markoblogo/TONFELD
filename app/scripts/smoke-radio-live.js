// Public city test data only, isolated from the owner's profile. No audio is saved.
const {app,BrowserWindow,protocol,ipcMain}=require('electron');const fs=require('node:fs');const os=require('node:os');const path=require('node:path');
const {RadioLibrary}=require('../src/main/radio_library');const {RadioPlaces}=require('../src/main/radio_places');const {createRadioMediaHandler}=require('../src/main/radio_network');
const directory=fs.mkdtempSync(path.join(os.tmpdir(),'ytmamp-live-nantes-'));app.setPath('userData',directory);app.commandLine.appendSwitch('mute-audio');app.disableHardwareAcceleration();
protocol.registerSchemesAsPrivileged([{scheme:'ytmamp-media',privileges:{standard:true,secure:true,stream:true,corsEnabled:true}}]);
const city=process.env.YTMAMP_LIVE_CITY==='kyiv'?'kyiv':'nantes';const cityName=city==='kyiv'?'Kyiv':'Nantes';const prefix=city.toUpperCase();
const results=[];let library;let remaining=0;let finished=false;let window;
const output=path.resolve(__dirname,'../'+city+'-radio-check.json');const deadline=setTimeout(()=>finish(Error('Live stream diagnostic timed out')),240000);
function finish(error){if(finished)return;finished=true;clearTimeout(deadline);const expected=require('../src/main/'+city+'_stations.json');const missing=expected.filter(b=>!results.some(s=>s.frequency===b.frequency)).map(s=>({name:s.name,frequency:s.frequency,decoded:false,unresolved:true}));const report={checkedAt:new Date().toISOString(),location:cityName+' (public city-centre fixture)',machine:process.platform,expected:expected.length,decoded:results.filter(s=>s.decoded).length,stations:[...results,...missing].sort((a,b)=>a.frequency-b.frequency),error:error?.message||null,audibleListeningTested:false};fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(prefix+'_LIVE_CHECK '+JSON.stringify({expected:report.expected,decoded:report.decoded,unresolved:missing.length,error:report.error}));fs.rmSync(directory,{recursive:true,force:true});app.exit(error||!report.decoded?1:0);}
ipcMain.handle('live-stations',()=>library.local().map(({id,name,frequency,frequencySource})=>({id,name,frequency,frequencySource})));
ipcMain.handle('live-alternative',(_e,id)=>{library.markFailed(id);return library.alternatives(id)[0]?.id||null;});
ipcMain.on('live-station-result',(_e,value)=>{const actual=library.stations.get(value.attempts?.at(-1)); if(actual) value.streamUrl=actual.url; results.push(value);console.log(prefix+'_STATION '+JSON.stringify(value));if(--remaining===0)finish();});
app.whenReady().then(async()=>{
 try{
  library=new RadioLibrary({directory});if(city==='kyiv')await library.choosePlace('ua-kyiv');else await library.chooseLocation({lat:47.22,lon:-1.55,label:'Nantes',countrycode:'FR'});
  if(city==='nantes') {
  // Refresh Rennes, fetched without a bundled seed in the first 0.8.0 diagnostic and retained at the owner’s request, then verify restart caching.
  const rennes={lat:48.11,lon:-1.68,label:'Rennes',countrycode:'FR',postalCode:'35000'};
  const place=await library.places.resolve(rennes);if(!place.area||place.area.stations.length<10)throw Error('Unseeded Rennes frequency lookup failed: '+place.warning);
  const cached=new RadioPlaces({directory,provider:{lookup:async()=>{throw Error('Unexpected cache miss');}}});const read=await cached.resolve(rennes);if(!read.cached)throw Error('New-place cache did not survive restart');
  fs.writeFileSync(path.resolve(__dirname,'../rennes-directory-check.json'),JSON.stringify({reviewedAt:new Date().toISOString(),area:read.area},null,2)+'\n');
  console.log('NEW_PLACE_CHECK '+JSON.stringify({city:'Rennes',frequencies:read.area.stations.length,cached:read.cached}));
  }
  remaining=library.local().length;if(!remaining)throw Error('No '+cityName+' streams resolved');
  protocol.handle('ytmamp-media',createRadioMediaHandler((id)=>library.stations.get(id)));
  window=new BrowserWindow({show:false,webPreferences:{preload:path.join(__dirname,'radio-check-preload.js'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
  await window.loadFile(path.join(__dirname,'radio-check.html'));
 }catch(error){finish(error);}
});
