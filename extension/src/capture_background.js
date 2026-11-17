// Capture requires an explicit extension action on the active YouTube Music tab.
let captureStarting = false;
let captureRelayQueue = Promise.resolve();
async function receiveCaptureRequest(message) {
    if (!/^[a-f0-9]{32}$/.test(message.session || '')) return;
    await chrome.storage.session.set({ captureRequest: { session: message.session, until: Date.now() + 90000 }, captureState: 'requested' });
    await chrome.action.setBadgeText({ text: 'REC?' });
    const tabs = await chrome.tabs.query({ url: 'https://music.youtube.com/*' });
    if (tabs[0]) { await chrome.tabs.update(tabs[0].id, { active: true }); await chrome.windows.update(tabs[0].windowId, { focused: true }); }
    try { await chrome.action.openPopup(); } catch { /* Browser may require clicking the extension icon. Badge and desktop prompt remain. */ }
}
function sendCapture(message) {
    if (!isAuthenticated || !socket || socket.readyState !== WebSocket.OPEN || socket.bufferedAmount > 256 * 1024) throw new Error('Desktop recording connection unavailable.');
    socket.send(JSON.stringify({ type: 'ytm-record', v: 1, ...message }));
}
async function captureControl(message) {
    await chrome.runtime.sendMessage({ ...message, target: 'ytmamp-capture', type: 'control' }).catch(() => {});
    if (!message.active) { await chrome.storage.session.set({ captureState: 'idle', captureRequest: null }); await chrome.action.setBadgeText({ text: '' }); }
}
async function startTabRecording() {
    if (captureStarting) throw new Error('Recording is already starting.');
    captureStarting = true;
    let request;
    try {
        const stored = await chrome.storage.session.get(['captureRequest','captureState']); request = stored.captureRequest;
        if (!request || request.until < Date.now() || stored.captureState !== 'requested') throw new Error('Press REC in the desktop player first.');
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !/^https:\/\/music\.youtube\.com\//.test(tab.url || '')) throw new Error('Open YouTube Music in the active tab, then click the extension icon and START RECORDING.');
        await chrome.storage.session.set({ captureState: 'starting' });
        const contexts = await chrome.runtime.getContexts({ contextTypes: ['OFFSCREEN_DOCUMENT'] });
        if (!contexts.length) await chrome.offscreen.createDocument({ url: 'capture.html', reasons: ['USER_MEDIA'], justification: 'Capture only the YouTube Music tab explicitly selected by the user and send PCM to the paired desktop recorder.' });
        const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id });
        const result = await chrome.runtime.sendMessage({ target: 'ytmamp-capture', type: 'start', streamId, session: request.session });
        if (result?.error) throw new Error(result.error);
        await chrome.storage.session.set({ captureState: 'recording' });
        await chrome.action.setBadgeText({ text: 'REC' }); await chrome.action.setBadgeBackgroundColor({ color: '#b93526' });
    } catch (error) {
        if (request) { try { sendCapture({ session: request.session, action: 'error' }); } catch { /* desktop already gone */ } }
        await captureControl({ session: request?.session, active: false }); throw error;
    } finally { captureStarting = false; }
}
chrome.runtime.onMessage.addListener((message, sender, respond) => {
    // Web content and YTM content scripts cannot initiate capture or inject samples.
    if (sender.id !== chrome.runtime.id || sender.tab) return;
    if (message.type === 'capture_status' && sender.url === chrome.runtime.getURL('popup/popup.html')) {
        chrome.storage.session.get(['captureRequest','captureState']).then(respond); return true;
    }
    if (message.type === 'capture_start' && sender.url === chrome.runtime.getURL('popup/popup.html')) {
        startTabRecording().then(() => respond({ ok: true }), (e) => respond({ error: e.message })); return true;
    }
    if (message.target === 'ytmamp-desktop' && sender.url === chrome.runtime.getURL('capture.html')) {
        captureRelayQueue = captureRelayQueue.catch(() => {}).then(async () => {
            const { captureRequest } = await chrome.storage.session.get('captureRequest');
            if (!captureRequest || captureRequest.session !== message.session) throw new Error('Capture request ended.');
            sendCapture({ session: message.session, action: message.action, data: message.data, sequence: message.sequence });
            respond({ ok: true });
            if (['ended','error'].includes(message.action)) await captureControl({ session: message.session, active: false });
        }).catch(async (error) => { respond({ error: error.message }); await captureControl({ session: message.session, active: false }); });
        return true;
    }
});
