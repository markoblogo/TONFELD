(async()=>{
 const api=window.stationCheck;const pending=await api.stations();
 async function decode(id){return new Promise(resolve=>{const audio=new Audio();audio.muted=true;audio.crossOrigin='anonymous';let done=false;const finish=(ok)=>{if(done)return;done=true;clearTimeout(timer);audio.pause();audio.removeAttribute('src');audio.load();resolve(ok);};const timer=setTimeout(()=>finish(false),8000);audio.addEventListener('timeupdate',()=>{if(audio.currentTime>0.02)finish(true);});audio.addEventListener('error',()=>finish(false));audio.src='ytmamp-media://radio-check/'+id;audio.play().catch(()=>finish(false));});}
 const worker=async()=>{while(pending.length){const station=pending.shift();const attempts=[];let id=station.id;let decoded=false;for(let i=0;i<3&&id;i++){attempts.push(id);if(await decode(id)){decoded=true;break;}id=await api.alternative(id);}api.report({...station,decoded,attempts});}};
 await Promise.all([worker(),worker(),worker()]);
})();
