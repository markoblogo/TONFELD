(() => {
    const api = window.electronAPI; const $ = (id) => document.getElementById(id);
    let source = 'local'; let state = {}; let busy = false; let stream; let context; let capture; let captureSession = ''; let generation = 0;
    const notice = (text) => { $('recording-notice').textContent = text; $('radio-record-controls').title = text; };
    const call = async (action, data) => { const result = await api.record(action, data); if (result?.error) throw new Error(result.error); return result; };
    function closeMicrophone() { generation++; stream?.getTracks().forEach((track) => track.stop()); stream = null; capture?.disconnect(); capture = null; context?.close().catch(() => {}); context = null; captureSession = ''; }
    function render() {
        $('radio-record').textContent = state.pending ? 'SAVE' : state.waiting ? 'CANCEL' : 'REC';
        $('radio-record').disabled = busy || state.active;
        $('radio-record').title = state.pending ? 'Save the unfinished recording' : source === 'local' ? 'Record microphone to WAV' : source === 'ytm' ? 'Record a sample from the YouTube Music tab' : 'Record radio to WAV';
        $('radio-record').setAttribute('aria-label', $('radio-record').title);
        $('radio-record').classList.toggle('recording', state.active && !state.paused);
        $('radio-record-pause').hidden = !state.active; $('radio-record-stop').hidden = !state.active;
        $('radio-record-pause').disabled = !state.active; $('radio-record-stop').disabled = !state.active;
        $('radio-record-pause').textContent = state.paused ? 'REC' : 'II';
        $('radio-record-pause').setAttribute('aria-label', state.paused ? 'Resume recording' : 'Pause recording');
        $('radio-record-stop').title = 'Stop recording and Save as';
        document.body.classList.toggle('recording-active', !!state.active);
        $('radio-pending').hidden = !state.pending;
        $('record-discard').hidden = !state.pending;
        $('radio-record-status').textContent = state.active ? (state.paused ? 'REC PAUSED ' : 'REC ') + Math.floor(state.seconds || 0) + 's' : state.message || '';
        if (state.active) notice((state.source === 'local' ? 'MIC' : state.source === 'ytm' ? 'YT' : 'RADIO') + (state.paused ? ' PAUSED' : ' REC') + ' ' + Math.floor(state.seconds || 0) + 's');
        else if (state.message) notice(state.message);
    }
    async function microphone() {
        const prepared = await call('prepare'); const ticket = ++generation;
        captureSession = prepared.session;
        try {
            const media = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }, video: false });
            if (ticket !== generation || source !== 'local') { media.getTracks().forEach((track) => track.stop()); return; }
            stream = media;
            context = new AudioContext({ sampleRate: 48000 });
            await context.audioWorklet.addModule('radio_capture.js');
            if (ticket !== generation || source !== 'local') { closeMicrophone(); return; }
            capture = new AudioWorkletNode(context, 'radio-capture');
            const silence = context.createGain(); silence.gain.value = 0;
            context.createMediaStreamSource(stream).connect(capture); capture.connect(silence); silence.connect(context.destination);
            const session = captureSession;
            capture.port.onmessage = ({ data }) => api.recordRadioChunk({ source: 'local', session, data });
            stream.getAudioTracks()[0].addEventListener('ended', () => { if (captureSession === session) call('stop').catch((e) => notice(e.message)); }, { once: true });
            await context.resume(); await call('start', { session });
            capture.port.postMessage(true);
        } catch (error) {
            closeMicrophone(); await call('cancel', {session:prepared.session}).catch(() => {});
            throw new Error(error.name === 'NotAllowedError' ? 'Microphone access denied. Allow YTMamp in macOS Privacy & Security / Microphone and retry.' : error.message);
        }
    }
    $('radio-record').addEventListener('click', async () => {
        if (busy) return; busy = true; render();
        try {
            if (state.pending) await call('save');
            else if (state.waiting) await call('cancel');
            else if (source === 'local') await microphone();
            else { if (source === 'radio' && !window.canRecordRadio()) throw new Error('Start a radio station before recording.'); await call('start'); }
        } catch (e) { notice(e.message); }
        finally { busy = false; render(); }
    });
    $('radio-record-pause').addEventListener('click', () => call('pause').catch((e) => notice(e.message)));
    $('radio-record-stop').addEventListener('click', () => { closeMicrophone(); call('stop').catch((e) => notice(e.message)); });
    $('radio-save').addEventListener('click', () => call('save').catch((e) => notice(e.message)));
    $('record-discard').addEventListener('click', () => call('discard').catch((e) => notice(e.message)));
    $('radio-discard').addEventListener('click', () => call('discard').catch((e) => notice(e.message)));
    api.onRadioRecording((value) => {
        state = value;
        if (value.source !== 'local' || !value.active && !value.waiting) closeMicrophone();
        capture?.port.postMessage(value.active && !value.paused && value.source === 'local'); render();
    });
    api.onSourceChange((value) => { source = value; closeMicrophone(); render(); });
    call('snapshot').then((value) => { state = value; render(); }).catch((e) => notice(e.message));
    render();
})();
