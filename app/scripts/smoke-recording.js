const {app,dialog}=require('electron'); const assert=require('node:assert/strict'); const fs=require('node:fs');const os=require('node:os');const path=require('node:path');
require('electron').shell.openExternal=async()=>{};
const directory=fs.mkdtempSync(path.join(os.tmpdir(),'ytmamp-mic-smoke-'));const output=path.join(directory,'microphone.wav');
app.setPath('userData',directory);app.setLoginItemSettings=()=>{};app.commandLine.appendSwitch('mute-audio');app.disableHardwareAcceleration();
process.env.BRIDGE_TOKEN='recording-fixture';process.env.INTEGRATION_PORT='24884';
for(const key of ['INTEGRATION_HOST','LASTFM_ENABLED','LASTFM_API_KEY','LASTFM_API_SECRET','LASTFM_SESSION_KEY'])delete process.env[key];
dialog.showSaveDialog=async()=>({canceled:false,filePath:output});
let finished=false;const timeout=setTimeout(()=>finish(Error('Recording smoke timed out')),30000);
function finish(error){if(finished)return;finished=true;clearTimeout(timeout);console.log(error?'RECORDING_DESKTOP_SMOKE FAIL: '+error.stack:'RECORDING_DESKTOP_SMOKE PASS: generated microphone, PCM worklet, pause/resume, source cancellation, saved WAV and compact controls');fs.rmSync(directory,{recursive:true,force:true});app.exit(error?1:0);}
async function wait(fn,label){const until=Date.now()+7000;while(Date.now()<until){if(await fn())return;await new Promise(r=>setTimeout(r,40));}throw Error('Timed out: '+label);}
app.on('browser-window-created',(_e,window)=>window.webContents.once('did-finish-load',()=>setTimeout(async()=>{
 const evaluate=(code)=>window.webContents.executeJavaScript(code,true);
 try {
  await evaluate(`window.fixtureContext=new AudioContext({sampleRate:48000});window.fixtureTone=fixtureContext.createOscillator();window.fixtureOutput=fixtureContext.createMediaStreamDestination();fixtureTone.connect(fixtureOutput);fixtureTone.start();fixtureContext.resume();navigator.mediaDevices.getUserMedia=async()=>fixtureOutput.stream;`);
  await evaluate('document.getElementById("radio-record").click()');
  await wait(()=>evaluate('document.body.classList.contains("recording-active")'),'microphone starts');
  await wait(()=>fs.readdirSync(directory).some(n=>n.endsWith('.wav')&&fs.statSync(path.join(directory,n)).size>44),'PCM arrives');
  await evaluate('document.getElementById("radio-record-pause").click()');
  await wait(()=>evaluate('document.getElementById("radio-record-pause").textContent==="REC"'),'pause');
  const file=fs.readdirSync(directory).find(n=>n.endsWith('.wav'));const size=fs.statSync(path.join(directory,file)).size;
  await new Promise(r=>setTimeout(r,300));assert.equal(fs.statSync(path.join(directory,file)).size,size);
  await evaluate('document.getElementById("radio-record-pause").click()');await wait(()=>fs.statSync(path.join(directory,file)).size>size,'resume');
  for(const zoom of [0.75,1,1.25,1.5]){window.webContents.setZoomFactor(zoom);window.setContentSize(Math.round(360*zoom),Math.round(116*zoom));await new Promise(r=>setTimeout(r,40));assert.equal(await evaluate(`(()=>{const box=document.getElementById('container').getBoundingClientRect();return ['radio-record-pause','radio-record-stop','volume-slider'].every(id=>{const r=document.getElementById(id).getBoundingClientRect();return r.width>0&&r.right<=box.right+1&&r.bottom<=box.bottom+1;});})()`),true);}
  // A source change must stop microphone capture, finalize the recording and save it.
  await evaluate('window.electronAPI.setSource("ytm")');await wait(()=>fs.existsSync(output),'save on source change');
  const bytes=fs.readFileSync(output);assert.equal(bytes.readUInt32LE(24),48000);assert.equal(bytes.readUInt32LE(40),bytes.length-44);assert.ok(bytes.subarray(44).some(v=>v!==0));
  assert.equal(await evaluate('fixtureOutput.stream.getTracks().every(t=>t.readyState==="ended")'),true);
  finish();
 }catch(error){finish(error);}
},100)));
require('../src/main/main');
