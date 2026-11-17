const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('stationCheck',{stations:()=>ipcRenderer.invoke('live-stations'),alternative:(id)=>ipcRenderer.invoke('live-alternative',id),report:(value)=>ipcRenderer.send('live-station-result',value)});
