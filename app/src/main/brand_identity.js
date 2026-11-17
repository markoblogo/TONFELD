const fs=require('node:fs');
const path=require('node:path');
function configureBrandIdentity(app) {
    const current=app.getPath('userData');const parent=app.getPath('appData');
    const defaults=['TONFELD','tonfeld','YTMamp','ytmamp'].map(n=>path.join(parent,n));
    // Preserve explicitly supplied test/development profiles. Never copy or rename user files.
    if(defaults.includes(current)) {
        const prior=['YTMamp','ytmamp'].map(n=>path.join(parent,n)).find(p=>fs.existsSync(path.join(p,'settings.json')));
        const profile=prior || (fs.existsSync(current) ? current : path.join(parent,'ytmamp'));
        fs.mkdirSync(profile,{recursive:true});app.setPath('userData',profile);
    }
    app.setName?.('TONFELD');
    return app.getPath('userData');
}
module.exports={configureBrandIdentity};
