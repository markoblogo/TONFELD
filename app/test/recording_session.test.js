const test = require('node:test'); const assert = require('node:assert/strict');
const fs = require('node:fs'); const os = require('node:os'); const path = require('node:path');
const { RadioRecorder } = require('../src/main/radio_recorder');
const { RecordingSession } = require('../src/main/recording_session');
const { validateMessage } = require('../src/main/ws_bridge');
function fixture(t) { const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ytmamp-rec-session-')); const recorder=new RadioRecorder({directory:dir}); const session=new RecordingSession(recorder); t.after(()=>{session.cancel();fs.rmSync(dir,{recursive:true,force:true});}); return {dir,recorder,session}; }
test('microphone recording requires its requested session and never accepts radio or stale capture samples', (t)=>{
    const {recorder,session}=fixture(t); const id=session.prepare('local','Microphone');
    assert.throws(()=>session.begin('local','bad')); session.begin('local',id);
    const samples=new Float32Array([0.5,-0.5,1,-1]);
    assert.equal(session.chunk('radio',id,samples.buffer),false); assert.equal(session.chunk('local','old',samples.buffer),false);
    assert.equal(session.chunk('local',id,samples.buffer),true); assert.equal(recorder.bytes,8);
    session.pause(); assert.equal(session.chunk('local',id,samples.buffer),false); session.pause(); session.cancel();
    assert.equal(recorder.pending.bytes,8); assert.equal(session.chunk('local',id,samples.buffer),false);
});
test('YT requests wait for browser capture and emit stop on cancellation without creating a silent recording', (t)=>{
    const {session,recorder}=fixture(t); const control=[];session.on('control',(v)=>control.push(v));
    const id=session.prepare('ytm','Sample'); assert.equal(recorder.recording,null); assert.equal(control.length,0);
    assert.throws(()=>session.prepare('radio','Other')); session.cancel(); assert.equal(recorder.pending,null);assert.equal(control.at(-1).active,false);
    assert.throws(()=>session.begin('ytm',id));
    const next=session.prepare('ytm','Sample');session.begin('ytm',next);assert.equal(control.at(-1).active,true);
    session.pause(); assert.equal(control.at(-1).paused,true); session.cancel();assert.equal(control.at(-1).active,false);
});
test('bridge accepts only bounded PCM capture envelopes with explicit session and sequence',()=>{
    const chunk={v:1,type:'ytm-record',action:'chunk',session:'a'.repeat(32),sequence:0,data:Buffer.from(new Float32Array([0,0]).buffer).toString('base64')};
    assert.equal(validateMessage(chunk),true);
    for(const change of [{session:''},{sequence:-1},{data:'not base64!'},{data:'a'.repeat(90000)},{action:'start-system-recording'}]) assert.equal(validateMessage({...chunk,...change}),false);
});
test('periodic recording status messages do not drop partial PCM worklet buffers',()=>{
    const vm=require('node:vm');const packets=[];let Processor;
    const context=vm.createContext({Float32Array,AudioWorkletProcessor:class{constructor(){this.port={postMessage:(data)=>packets.push(data)};}},registerProcessor:(_name,Type)=>{Processor=Type;}});
    vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../src/renderer/radio_capture.js'),'utf8'),context);
    const processor=new Processor();const input=new Float32Array(128).fill(0.25);
    for(let i=0;i<32;i++){processor.port.onmessage({data:true});processor.process([[input,input]]);}
    assert.equal(packets.length,1);assert.equal(packets[0].byteLength,32768);assert.ok(new Float32Array(packets[0]).every(v=>v===0.25));
});
