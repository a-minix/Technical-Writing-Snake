class Logger {
    constructor() {
        this.logLevel = localStorage.getItem('LOG_LEVEL') || 'INFO';
        this.levels = {
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3
        };
    }

    debug(...args) {
        if (this.levels[this.logLevel] <= this.levels.DEBUG) {
            console.log('[DEBUG]', ...args);
        }
    }

    info(...args) {
        if (this.levels[this.logLevel] <= this.levels.INFO) {
            console.log('[INFO]', ...args);
        }
    }

    warn(...args) {
        if (this.levels[this.logLevel] <= this.levels.WARN) {
            console.warn('[WARN]', ...args);
        }
    }

    error(...args) {
        if (this.levels[this.logLevel] <= this.levels.ERROR) {
            console.error('[ERROR]', ...args);
        }
    }
}

export default new Logger();
