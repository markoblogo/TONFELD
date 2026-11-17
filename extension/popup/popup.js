const led = document.getElementById('status-led');
const statusDisplay = document.getElementById('status-status');
const hintMain = document.getElementById('hint-main');
const hintSub = document.getElementById('hint-sub');
const btnYtm = document.getElementById('btn-ytm');
const btnShow = document.getElementById('btn-show');
const btnConnect = document.getElementById('btn-connect');
const btnDisconnect = document.getElementById('btn-disconnect');
const btnInstall = document.getElementById('btn-install');
const checkAuto = document.getElementById('check-auto');
const checkAutoShow = document.getElementById('check-autoshow');
const bridgeTokenInput = document.getElementById('bridge-token');
const btnSaveToken = document.getElementById('btn-save-token');

function updateUI() {
    chrome.runtime.sendMessage({ type: 'get_status' }, (response) => {
        if (!response) return;

        // Load sync settings
        chrome.storage.sync.get({ autoConnect: true, autoShow: true, bridgeAuthToken: '' }, (data) => {
            checkAuto.checked = data.autoConnect;
            checkAutoShow.checked = data.autoShow;
            bridgeTokenInput.value = data.bridgeAuthToken || '';
        });

        if (response.connected) {
            led.className = 'connected';
            statusDisplay.innerText = 'CONNECTED';
            hintMain.innerText = 'System active';
            hintSub.innerText = 'Now playing...';

            btnShow.disabled = false;
            if (response.windowVisible) {
                btnShow.innerText = 'HIDE PLAYER';
                btnShow.dataset.cmd = 'hideWindow';
            } else {
                btnShow.innerText = 'SHOW PLAYER';
                btnShow.dataset.cmd = 'showWindow';
            }

            btnConnect.style.display = 'none';
            btnDisconnect.style.display = 'block';
        } else if (response.waiting) {
            led.className = 'waiting';
            statusDisplay.innerText = 'SEARCHING...';
            hintMain.innerText = 'Attempting connection';
            hintSub.innerText = 'Ensure the app is running';
            btnShow.disabled = true;
            btnConnect.style.display = 'none';
            btnDisconnect.style.display = 'block'; // Allow canceling search
        } else {
            led.className = '';
            statusDisplay.innerText = 'OFFLINE';
            hintMain.innerText = 'App not running';
            hintSub.innerText = 'Start YTMamp';
            btnShow.disabled = true;
            btnConnect.style.display = 'block';
            btnDisconnect.style.display = 'none';
        }
    });
}

// Initial update
updateUI();
setInterval(updateUI, 1000);

checkAuto.onchange = (e) => {
    const val = e.target.checked;
    chrome.storage.sync.set({ autoConnect: val }, () => {
        chrome.runtime.sendMessage({ type: 'toggle_auto', value: val });
    });
};

checkAutoShow.onchange = (e) => {
    const val = e.target.checked;
    chrome.storage.sync.set({ autoShow: val });
};

btnYtm.onclick = () => {
    chrome.runtime.sendMessage({ type: 'open_ytm' });
};

btnShow.onclick = () => {
    const cmd = btnShow.dataset.cmd || 'showWindow';
    chrome.runtime.sendMessage({ type: 'cmd', cmd: cmd, v: 1 });
};

btnConnect.onclick = () => {
    chrome.runtime.sendMessage({ type: 'manual_connect' });
    updateUI();
};

btnDisconnect.onclick = () => {
    chrome.runtime.sendMessage({ type: 'manual_disconnect' });
    updateUI();
};

btnSaveToken.onclick = () => {
    chrome.runtime.sendMessage({ type: 'set_bridge_token', token: bridgeTokenInput.value });
};

btnInstall.onclick = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('help.html') });
};

const recordButton = document.getElementById('btn-record');
const recordHint = document.getElementById('record-hint');
async function updateCaptureUI() {
    const value = await chrome.runtime.sendMessage({ type: 'capture_status' });
    recordButton.hidden = !value?.captureRequest || value.captureState !== 'requested';
    if (!recordButton.hidden) recordHint.textContent = 'Record audio from the active YouTube Music tab. Pause and STOP are in the desktop player.';
    else if (value?.captureState === 'recording') recordHint.textContent = 'Recording YouTube Music. Use desktop STOP to save WAV.';
}
recordButton.addEventListener('click', async () => {
    recordButton.disabled = true;
    try {
        const result = await chrome.runtime.sendMessage({ type: 'capture_start' });
        if (result?.error) throw new Error(result.error);
        recordHint.textContent = 'Recording started. Use the player to pause or stop.';
    } catch (error) { recordHint.textContent = error.message; }
    finally { recordButton.disabled = false; }
});
updateCaptureUI().catch(() => {});

setInterval(() => updateCaptureUI().catch(() => {}), 1000);
