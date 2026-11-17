const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
function fixture(){const data={};const sent=[];const internal=[];const listeners=[];let tabURL='https://music.youtube.com/watch?v=test';let captures=0;let offscreen=0;
 const chrome={runtime:{id:'test-extension',getURL:(p)=>'chrome-extension://test-extension/'+p,getContexts:async()=>[],onMessage:{addListener:(f)=>listeners.push(f)},sendMessage:async(v)=>{internal.push(v);return{ok:true};}},storage:{session:{get:async()=>({...data}),set:async(v)=>Object.assign(data,v)}},action:{setBadgeText:async()=>{},setBadgeBackgroundColor:async()=>{},openPopup:async()=>{}},tabs:{query:async()=>[{id:1,windowId:2,url:tabURL}],update:async()=>{}},windows:{update:async()=>{}},offscreen:{createDocument:async()=>{offscreen++;}},tabCapture:{getMediaStreamId:async()=>{captures++;return'opaque-stream';}}};
 const c=vm.createContext({chrome,console,Date,WebSocket:{OPEN:1},isAuthenticated:true,socket:{readyState:1,bufferedAmount:0,send:(v)=>sent.push(JSON.parse(v))}});
 vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../../extension/src/capture_background.js'),'utf8'),c);return{c,data,sent,internal,listeners,setTab:(v)=>tabURL=v,captures:()=>captures,offscreen:()=>offscreen};}
test('YT capture requires a desktop request and the active YT Music tab, and locks concurrent starts',async()=>{
 const f=fixture();await assert.rejects(vm.runInContext('startTabRecording()',f.c),/desktop player first/);
 await vm.runInContext('receiveCaptureRequest({session:"a".repeat(32)})',f.c);
 const calls=await Promise.allSettled([vm.runInContext('startTabRecording()',f.c),vm.runInContext('startTabRecording()',f.c)]);
 assert.equal(calls.filter(v=>v.status==='fulfilled').length,1);assert.equal(f.captures(),1);assert.equal(f.offscreen(),1);assert.equal(f.data.captureState,'recording');
 await vm.runInContext('captureControl({type:"capture-control",session:"a".repeat(32),active:false})',f.c);assert.equal(f.data.captureRequest,null);assert.equal(f.internal.at(-1).type,'control');
});
test('non-YTM tabs and content-script messages cannot start or inject tab audio',async()=>{
 const f=fixture();await vm.runInContext('receiveCaptureRequest({session:"a".repeat(32)})',f.c);f.setTab('https://example.org');
 await assert.rejects(vm.runInContext('startTabRecording()',f.c),/active tab/);assert.equal(f.captures(),0);
 let replied=false;f.listeners[0]({type:'capture_start'},{id:'test-extension',tab:{id:1},url:'chrome-extension://test-extension/popup/popup.html'},()=>replied=true);assert.equal(replied,false);
 f.listeners[0]({target:'ytmamp-desktop',session:'a'.repeat(32),action:'chunk',data:'AAAA'},{id:'other-extension',url:'chrome-extension://test-extension/capture.html'},()=>replied=true);assert.equal(replied,false);
});
