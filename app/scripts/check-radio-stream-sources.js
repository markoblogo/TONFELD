// Optional, bounded inspection of public player configuration. Never saves audio or HTML.
const {getBytes}=require('../src/main/radio_network');
(async()=>{
 for(const url of ['https://www.rcalaradio.com/','https://euradio.fr/','https://hitwest.ouest-france.fr/']) {
  try {
   const html=(await getBytes(url,{signal:AbortSignal.timeout(12000),maxBytes:1024*1024})).bytes.toString('utf8').replace(/\\\//g,'/').replace(/&amp;/g,'&');
   const addresses=[...new Set([...html.matchAll(/https?:\/\/[^\s"'<>\\]+/g)].map(m=>m[0]).filter(v=>/\.mp3\b|\.aac\b|icecast|infomaniak|revma|\/stream\//i.test(v)))].slice(0,40);
   console.log('PUBLIC_PLAYER_STREAMS '+JSON.stringify({source:url,addresses}));
  }catch(error){console.log('PUBLIC_PLAYER_UNAVAILABLE '+JSON.stringify({source:url,error:error.message}));}
 }
})().catch(error=>{console.error(error);process.exitCode=1;});
