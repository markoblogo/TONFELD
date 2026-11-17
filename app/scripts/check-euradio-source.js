// Bounded integration diagnostic for one unresolved public station, without saving HTML or audio.
const {getBytes}=require('../src/main/radio_network');
(async()=>{
 const origin='https://euradio.fr';const signal=AbortSignal.timeout(25000);
 const read=async(url)=>(await getBytes(url,{signal,maxBytes:1024*1024})).bytes.toString('utf8').replace(/&quot;/g,'"').replace(/&#039;/g,"'").replace(/\\\//g,'/');
 const html=await read(origin+'/');
 const scripts=[...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi)].map(m=>new URL(m[1],origin)).filter(u=>u.origin===origin).slice(-3);
 for(const [url,code] of [[origin+'/',html],...await Promise.all(scripts.map(async u=>[u.href,await read(u.href)]))]){
  const addresses=[...new Set([...code.matchAll(/https?:\/\/[^\s"'<>`\\]+/g)].map(m=>m[0]).filter(v=>/stream|icecast|\.mp3|\.aac/i.test(v)&&!/podcast|transistor|podtrac/.test(v)))].slice(0,25);
  const routes=[...new Set([...code.matchAll(/["']([^"'\n]{0,100}(?:stream|live|flux)[^"'\n]{0,100})["']/gi)].map(m=>m[1]).filter(v=>v.length<140))].slice(0,15);
  console.log('EURADIO_PUBLIC_SOURCE '+JSON.stringify({url,addresses,routes}));
 }
})().catch(error=>console.log('EURADIO_SOURCE_UNAVAILABLE '+error.message));
