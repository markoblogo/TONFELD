const { getBytes } = require('./radio_network');
const fmCatalog = require('./fm_catalog');
const ROOT = 'https://www.arcom.fr/radio-et-audio-numerique/radio-fm-dab/';
const normalize = (v) => String(v || '').normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^a-z0-9]/g,'');
function text(html) { return html.replace(/<[^>]*>/g,' ').replace(/&#(?:x([a-f0-9]+)|(\d+));/gi,(_,h,d)=>String.fromCodePoint(Math.min(0x10ffff,parseInt(h||d,h?16:10)))).replace(/&amp;/g,'&').replace(/&apos;|&#039;/g,"'").replace(/&quot;/g,'"').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim(); }
function pathFromAnchor(tag) {
    const encoded = /data-action-url="([A-Za-z0-9+/=]{1,3000})"/.exec(tag)?.[1];
    try { return encoded ? decodeURIComponent(Buffer.from(encoded,'base64').toString('utf8')) : /href="([^"<>]+)"/.exec(tag)?.[1]; } catch { return ''; }
}
function stationLinks(html) {
    const links=[];
    for (const match of html.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/gi)) {
        const tag=match[0]; const route=pathFromAnchor(tag);
        if (!/^\/radio-et-audio-numerique\/radio-fm-dab\/radios-detail\/[a-z0-9-]+$/.test(route||'')) continue;
        const band=[...tag.matchAll(/<span\b[^>]*>([\s\S]*?)<\/span>/gi)].map((m)=>text(m[1])).join(' ');
        if (!/(?:^|\s|·)FM(?:$|\s|·)/.test(band)) continue;
        const name=text(tag.replace(/<span\b[^>]*>[\s\S]*?<\/span>/gi,''));
        if (name && name.length<=200) links.push({name,url:'https://www.arcom.fr'+route});
    }
    return [...new Map(links.map((s)=>[s.url,s])).values()].slice(0,100);
}
function frequencies(html) {
    const found=[];
    for (const match of html.matchAll(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi)) {
        const row=match[0];
        if (!/\/emetteur\/[^"<>]*--fm(?:["?#]|$)/i.test(row)) continue;
        const cells=[...row.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)];
        const value=Number(/^(\d{2,3}(?:[.,]\d+)?)\s*MHz\b/i.exec(text(cells[0]?.[1]||''))?.[1]?.replace(',','.'));
        if (!(value>=87.5 && value<=108)) continue;
        found.push({frequency:value,quality:Number(/alt="[^"<>]*\b([1-5])\/5/.exec(row)?.[1]||0)});
    }
    return found.sort((a,b)=>b.quality-a.quality||a.frequency-b.frequency);
}
class FranceFrequencyProvider {
    constructor({ read }={}) { this.read=read || (async(url,signal)=>(await getBytes(url,{signal,maxBytes:1024*1024})).bytes.toString('utf8')); }
    async lookup(location) {
        if (location.countrycode!=='FR') throw new Error('Automatic frequency lookup currently supports France. Saved frequencies and the global station catalog remain available.');
        const signal=AbortSignal.timeout(45000);
        const label=location.seed?.label || location.label;
        if (!label || label==='Device location') throw new Error('macOS did not return a city. Retry device location.');
        let citySlug;
        if (location.seed?.id==='fr-nantes') citySlug='nantes-44200';
        else if (location.seed?.id==='fr-menton') citySlug='menton-06500';
        else {
            const index=await this.read(ROOT+'radios-ville',signal);
            for (const match of index.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/gi)) {
                const route=pathFromAnchor(match[0]);
                if (/^\/radio-et-audio-numerique\/radio-fm-dab\/radios-ville\/[a-z0-9-]+$/.test(route||'') && normalize(text(match[0]))===normalize(label)) { citySlug=route.split('/').at(-1); break; }
            }
        }
        if (!citySlug && /^\d{5}$/.test(location.postalCode || '')) citySlug = String(label).normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') + '-' + location.postalCode;
        if (!citySlug) throw new Error('No published city directory found for this place. The global station catalog remains available.');
        const source=ROOT+'radios-ville/'+citySlug;
        const links=stationLinks(await this.read(source,signal));
        if (!links.length) throw new Error('Frequency source did not return readable FM station records. Saved data is retained.');
        const stations=[]; const pending=[...links]; let failures=0;
        const known=[...(location.seed?.stations||[]),...fmCatalog.areas.flatMap((a)=>a.stations)];
        const localNames=new Set((location.seed?.stations||[]).map((s)=>s.name));
        const worker=async()=>{ while(pending.length && !signal.aborted) {
            const item=pending.shift();
            try {
                const values=frequencies(await this.read(item.url,signal)); const best=values[0];
                if (!best) { failures++; continue; }
                let prior=known.find((s)=>fmCatalog.matches(item,s)); let networkFallback=false;
                if (!prior && normalize(item.name).endsWith(normalize(label))) {
                    const network=['NRJ','Chérie FM','Nostalgie','RTL2','Europe 2','Fun Radio'].find((n)=>normalize(item.name).startsWith(normalize(n)));
                    if(network) { prior=known.find((s)=>normalize(s.name)===normalize(network)); networkFallback=true; }
                }
                // A national name must not inherit another city's regional aliases or preferred stream.
                const sameArea=prior && localNames.has(prior.name) && location.seed.stations.includes(prior);
                const priorAliases=(prior?.aliases||[]).filter((name)=>sameArea || !fmCatalog.regional({name},prior) || normalize(name)===normalize(item.name));
                const aliases=[...new Set([item.name,...(networkFallback ? [prior.name] : priorAliases),...(/^ici /i.test(item.name) ? [item.name.replace(/^ici /i,'France Bleu ')] : [])])].slice(0,20);
                // A locality-qualified official service may use its network online if no exact regional stream exists.
                const station={name:item.name,frequency:best.frequency,aliases,source:item.url,quality:best.quality};
                if (prior?.url && (sameArea || !prior.streamName || !fmCatalog.regional({name:prior.streamName},prior) || normalize(prior.streamName)===normalize(item.name))) { station.url=prior.url; if(prior.streamName) station.streamName=prior.streamName; }
                if (prior?.query) station.query=prior.query;
                else station.query=/^ici /i.test(item.name) ? item.name.replace(/^ici /i,'') : prior?.name||item.name;
                if (networkFallback) station.preferredAliases=[item.name]; else if (sameArea && prior?.preferredAliases) station.preferredAliases=prior.preferredAliases;
                if (/Nantes|Rennes|Pays de la Loire|Atlantique|Côte d.Azur/i.test(item.name)) station.preferredAliases=[item.name,...(station.preferredAliases||[])];
                stations.push(station);
            } catch { failures++; }
        }};
        await Promise.all([worker(),worker(),worker()]);
        if (!stations.length || stations.length<links.length*0.7) throw new Error('Frequency lookup was incomplete. Last good area data is retained.');
        // Retain unresolved members from the last reviewed seed, without retaining services absent from the new membership list.
        for (const item of links) if (!stations.some((s)=>normalize(s.name)===normalize(item.name))) {
            const prior=location.seed?.stations.find((s)=>fmCatalog.matches(item,s)); if(prior) stations.push({...prior});
        }
        // Cross-border and motorway reception in the owner's Menton selection supplements the French regulator's list.
        if(location.seed?.id==='fr-menton') for(const s of location.seed.stations) if((s.countrycode && s.countrycode!=='FR'||s.frequency===107.7) && !stations.some((v)=>fmCatalog.matches(v,s))) stations.push({...s});
        return {label,countrycode:'FR',stations:stations.sort((a,b)=>a.frequency-b.frequency),source,sourceUpdatedAt:null,partial:failures>0||pending.length>0,attribution:'Source: Arcom, indicative local FM coverage. Online streams checked separately.'};
    }
}
module.exports={FranceFrequencyProvider,stationLinks,frequencies,text};
