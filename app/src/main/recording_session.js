const { EventEmitter } = require('node:events');
const crypto = require('node:crypto');

// One disk writer, pinned to one explicitly requested source and one capture lifetime.
class RecordingSession extends EventEmitter {
    constructor(recorder) {
        super(); this.recorder = recorder; this.source = ''; this.session = ''; this.request = null; this.timer = null;
        recorder.on('status', (state) => {
            this.emit('status', { ...state, source: this.source, session: this.session, waiting: !!this.request });
            if (this.source === 'ytm' && !this.request) this.emit('control', { session: this.session, active: state.active, paused: state.paused });
        });
    }
    prepare(source, name) {
        if (!['local', 'radio', 'ytm'].includes(source)) throw new Error('Unknown recording source.');
        if (this.request || this.recorder.recording || this.recorder.pending) throw new Error('Finish, save or discard the previous recording first.');
        this.source = source; this.session = crypto.randomBytes(16).toString('hex');
        this.request = { source, name, until: Date.now() + (source === 'ytm' ? 90000 : 30000) };
        this.timer = setTimeout(() => this.cancel('Recording request expired. Press REC to retry.'), source === 'ytm' ? 90000 : 30000); this.timer.unref?.();
        this.recorder.publish(source === 'ytm' ? 'Open the YTMamp browser extension on YouTube Music and press START RECORDING.' : 'Allow microphone access to start the dictaphone.');
        return this.session;
    }
    begin(source, session) {
        if (!this.request || this.source !== source || this.session !== session || this.request.until < Date.now()) throw new Error('Recording request expired or source changed.');
        const { name } = this.request; this.request = null; clearTimeout(this.timer); this.timer = null;
        try { this.recorder.start(name); } catch (error) { this.recorder.publish(error.message); throw error; }
    }
    chunk(source, session, data) {
        return source === this.source && session === this.session && this.recorder.chunk(data);
    }
    pause() { this.recorder.togglePause(); }
    cancel(message = '') {
        clearTimeout(this.timer); this.timer = null; this.request = null;
        if (this.recorder.recording) this.recorder.stop(message); else this.recorder.publish(message);
        if (this.source === 'ytm') this.emit('control', { session: this.session, active: false, paused: false });
        this.session = '';
    }
}
module.exports = { RecordingSession };
