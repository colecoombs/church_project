const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, 'app.log');
const errorLogFile = path.join(logsDir, 'error.log');

/**
 * Logger utility
 */
class Logger {
    constructor() {
        this.stream = {
            write: (message) => {
                this.info(message.trim());
            }
        };
    }

    log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level: level.toUpperCase(),
            message,
            data
        };

        const logLine = JSON.stringify(logEntry) + '\n';
        
        // Console output
        console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
        if (data) {
            console.log(data);
        }

        // File output
        fs.appendFileSync(logFile, logLine);
        
        // Error file for errors and warnings
        if (level === 'error' || level === 'warn') {
            fs.appendFileSync(errorLogFile, logLine);
        }
    }

    info(message, data = null) {
        this.log('info', message, data);
    }

    warn(message, data = null) {
        this.log('warn', message, data);
    }

    error(message, data = null) {
        this.log('error', message, data);
    }

    debug(message, data = null) {
        if (process.env.NODE_ENV !== 'production') {
            this.log('debug', message, data);
        }
    }
}

const logger = new Logger();

module.exports = { logger };