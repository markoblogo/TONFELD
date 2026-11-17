const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const os=require('node:os');const path=require('node:path');
const {configureBrandIdentity}=require('../src/main/brand_identity');
test('TONFELD reuses the original profile and keeps explicit alternate profiles untouched',t=>{
 const parent=fs.mkdtempSync(path.join(os.tmpdir(),'tonfeld-profile-'));t.after(()=>fs.rmSync(parent,{recursive:true,force:true}));
 const old=path.join(parent,'YTMamp');fs.mkdirSync(old);fs.writeFileSync(path.join(old,'settings.json'),'{"bridgeAuthToken":"fixture"}');
 let profile=path.join(parent,'TONFELD');let name='';const app={getPath:k=>k==='appData'?parent:profile,setPath:(_k,p)=>{profile=p;},setName:n=>{name=n;}};
 assert.equal(configureBrandIdentity(app),old);assert.equal(name,'TONFELD');assert.equal(fs.readFileSync(path.join(old,'settings.json'),'utf8'),'{"bridgeAuthToken":"fixture"}');
 profile=path.join(parent,'custom-profile');assert.equal(configureBrandIdentity(app),profile);
});
