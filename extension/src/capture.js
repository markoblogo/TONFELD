let media; let context; let processor; let session = ''; let sequence = 0; let inFlight = 0;
async function stop() {
    const stream = media; media = null; session = ''; processor?.disconnect(); processor = null;
    stream?.getTracks().forEach((track) => track.stop());
    const audioContext = context; context = null; await audioContext?.close();
}
async function report(action, data, number) {
    const result = await chrome.runtime.sendMessage({ target: 'ytmamp-desktop', session, action, data, sequence: number });
    if (result?.error) throw new Error(result.error);
}
async function start(message) {
    if (media || context) throw new Error('A capture is already active.');
    session = message.session; sequence = 0; inFlight = 0;
    try {
        media = await navigator.mediaDevices.getUserMedia({ audio: { mandatory: { chromeMediaSource: 'tab', chromeMediaSourceId: message.streamId } }, video: false });
        context = new AudioContext({ sampleRate: 48000 });
        await context.audioWorklet.addModule('src/capture_worklet.js');
        const input = context.createMediaStreamSource(media);
        // tabCapture suppresses tab playback: reconnect it once for uninterrupted listening.
        input.connect(context.destination);
        processor = new AudioWorkletNode(context, 'radio-capture');
        const silence = context.createGain(); silence.gain.value = 0;
        input.connect(processor); processor.connect(silence); silence.connect(context.destination);
        const id = session;
        processor.port.onmessage = async ({ data }) => {
            if (!session || session !== id) return;
            if (inFlight >= 4) { await report('error').catch(() => {}); await stop(); return; }
            const number = sequence++; inFlight++;
            try { await report('chunk', btoa(String.fromCharCode(...new Uint8Array(data))), number); }
            catch { await stop(); }
            finally { inFlight--; }
        };
        media.getAudioTracks()[0].addEventListener('ended', () => { if (session === id) report('ended').catch(() => {}).finally(stop); }, { once: true });
        await context.resume(); await report('ready');
    } catch (error) { await stop(); throw error; }
}
chrome.runtime.onMessage.addListener((message, sender, respond) => {
    if (sender.id !== chrome.runtime.id || sender.tab || message.target !== 'ytmamp-capture') return;
    if (message.type === 'start') { start(message).then(() => respond({ ok: true }), (e) => respond({ error: e.message })); return true; }
    if (message.type === 'control' && (message.session === session || message.disconnect === true)) {
        if (!message.active) stop().catch(() => {}); else processor?.port.postMessage(!message.paused);
    }
});
