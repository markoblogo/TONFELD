const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'../..');const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const app=read('app/package.json'),lock=read('app/package-lock.json'),extension=read('extension/manifest.json');
const versions=[app.version,lock.version,lock.packages[''].version,extension.version];
if(versions.some(v=>v!==app.version))throw Error('App, lockfile and companion versions differ');
if(process.env.GITHUB_REF_TYPE==='tag' && process.env.GITHUB_REF_NAME!=='v'+app.version)throw Error('Release tag differs from package version');
if(app.build.productName!=='TONFELD'||extension.name!=='TONFELD'||app.build.appId!=='com.antonbiletskiy.ytmamp')throw Error('Brand or upgrade identity mismatch');
console.log('TONFELD '+app.version+': app, companion, tag and upgrade identity consistent');
