/**
 * VM Error Monitor & Alarm System
 * Tracks and reports errors with alarm tags for critical issues
 */

class VMErrorMonitor {
    constructor() {
        this.errors = [];
        this.alarms = {
            CRITICAL: [],
            WARNING: [],
            INFO: []
        };
        this.listeners = [];
        this.setupGlobalErrorHandlers();
    }

    // Alarm tag definitions
    static ALARM_TAGS = {
        // CRITICAL - System failures
        V86_LOAD_FAIL: {
            level: 'CRITICAL',
            tag: '🚨 [V86_LOAD_FAIL]',
            message: 'V86 emulator failed to load',
            recovery: 'Refresh page or check internet connection'
        },
        VM_CRASH: {
            level: 'CRITICAL',
            tag: '🚨 [VM_CRASH]',
            message: 'Virtual machine crashed',
            recovery: 'Restart VM'
        },
        MEMORY_ERROR: {
            level: 'CRITICAL',
            tag: '🚨 [MEMORY_ERROR]',
            message: 'Out of memory',
            recovery: 'Reduce memory allocation or close other tabs'
        },
        BIOS_MISSING: {
            level: 'CRITICAL',
            tag: '🚨 [BIOS_MISSING]',
            message: 'BIOS files not found',
            recovery: 'Check BIOS file paths'
        },

        // WARNING - Degraded functionality
        CDN_SLOW: {
            level: 'WARNING',
            tag: '⚠️ [CDN_SLOW]',
            message: 'CDN response slow',
            recovery: 'Using fallback CDN'
        },
        ISO_NOT_FOUND: {
            level: 'WARNING',
            tag: '⚠️ [ISO_NOT_FOUND]',
            message: 'ISO file not accessible',
            recovery: 'Check ISO file URL'
        },
        KEYBOARD_ERROR: {
            level: 'WARNING',
            tag: '⚠️ [KEYBOARD_ERROR]',
            message: 'Keyboard input not working',
            recovery: 'Click on VM screen to focus'
        },
        NETWORK_ERROR: {
            level: 'WARNING',
            tag: '⚠️ [NETWORK_ERROR]',
            message: 'Network connectivity issue',
            recovery: 'Check internet connection'
        },

        // INFO - Non-critical issues
        V86_VERSION: {
            level: 'INFO',
            tag: 'ℹ️ [V86_VERSION]',
            message: 'V86 version mismatch',
            recovery: 'Update may be available'
        },
        BROWSER_COMPAT: {
            level: 'INFO',
            tag: 'ℹ️ [BROWSER_COMPAT]',
            message: 'Browser compatibility warning',
            recovery: 'Use Chrome/Firefox for best results'
        }
    };

    // Setup global error handlers
    setupGlobalErrorHandlers() {
        // Catch unhandled errors
        window.addEventListener('error', (event) => {
            this.handleError({
                type: 'GLOBAL_ERROR',
                message: event.message,
                filename: event.filename,
                line: event.lineno,
                column: event.colno,
                error: event.error
            });
        });

        // Catch promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                type: 'PROMISE_REJECTION',
                reason: event.reason,
                promise: event.promise
            });
        });

        // Monitor console errors
        const originalError = console.error;
        console.error = (...args) => {
            this.handleConsoleError(args);
            originalError.apply(console, args);
        };
    }

    // Main error handler
    handleError(errorData) {
        const timestamp = new Date().toISOString();
        const error = {
            timestamp,
            ...errorData
        };

        this.errors.push(error);

        // Detect alarm type
        const alarm = this.detectAlarmType(error);
        if (alarm) {
            this.triggerAlarm(alarm, error);
        }

        // Notify listeners
        this.notifyListeners(error);
    }

    // Detect which alarm to trigger
    detectAlarmType(error) {
        const errorStr = JSON.stringify(error).toLowerCase();

        // V86 Load failures
        if (errorStr.includes('v86starter') && errorStr.includes('undefined')) {
            return VMErrorMonitor.ALARM_TAGS.V86_LOAD_FAIL;
        }
        if (errorStr.includes('v86') && errorStr.includes('failed to load')) {
            return VMErrorMonitor.ALARM_TAGS.V86_LOAD_FAIL;
        }

        // Memory errors
        if (errorStr.includes('out of memory') || errorStr.includes('memory')) {
            return VMErrorMonitor.ALARM_TAGS.MEMORY_ERROR;
        }

        // BIOS errors
        if (errorStr.includes('bios') || errorStr.includes('seabios')) {
            return VMErrorMonitor.ALARM_TAGS.BIOS_MISSING;
        }

        // Network errors
        if (errorStr.includes('network') || errorStr.includes('fetch')) {
            return VMErrorMonitor.ALARM_TAGS.NETWORK_ERROR;
        }

        // ISO errors
        if (errorStr.includes('iso') || errorStr.includes('cdrom')) {
            return VMErrorMonitor.ALARM_TAGS.ISO_NOT_FOUND;
        }

        // VM crash
        if (errorStr.includes('crash') || errorStr.includes('segfault')) {
            return VMErrorMonitor.ALARM_TAGS.VM_CRASH;
        }

        return null;
    }

    // Trigger an alarm
    triggerAlarm(alarmTag, error) {
        const alarm = {
            ...alarmTag,
            timestamp: new Date().toISOString(),
            error: error
        };

        this.alarms[alarmTag.level].push(alarm);

        // Display alarm
        this.displayAlarm(alarm);

        // Log to console with color
        const colors = {
            CRITICAL: 'color: red; font-weight: bold;',
            WARNING: 'color: orange; font-weight: bold;',
            INFO: 'color: blue;'
        };

        console.log(
            `%c${alarm.tag} ${alarm.message}`,
            colors[alarm.level]
        );
        console.log(`Recovery: ${alarm.recovery}`);
        console.log('Error details:', error);
    }

    // Display alarm in UI
    displayAlarm(alarm) {
        // Create or get alarm container
        let container = document.getElementById('error-alarms');
        if (!container) {
            container = document.createElement('div');
            container.id = 'error-alarms';
            container.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                width: 400px;
                z-index: 10000;
                font-family: monospace;
            `;
            document.body.appendChild(container);
        }

        // Create alarm element
        const alarmEl = document.createElement('div');
        alarmEl.className = `alarm alarm-${alarm.level.toLowerCase()}`;
        alarmEl.style.cssText = `
            background: ${alarm.level === 'CRITICAL' ? '#ff4444' :
                         alarm.level === 'WARNING' ? '#ff9944' : '#4499ff'};
            color: white;
            padding: 12px;
            margin: 5px 0;
            border-radius: 6px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease-out;
        `;

        alarmEl.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">
                ${alarm.tag} ${alarm.message}
            </div>
            <div style="font-size: 12px; opacity: 0.9;">
                ${alarm.recovery}
            </div>
            <div style="font-size: 10px; opacity: 0.7; margin-top: 5px;">
                ${alarm.timestamp}
            </div>
        `;

        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = `
            position: absolute;
            top: 5px;
            right: 5px;
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 18px;
        `;
        closeBtn.onclick = () => alarmEl.remove();
        alarmEl.style.position = 'relative';
        alarmEl.appendChild(closeBtn);

        container.appendChild(alarmEl);

        // Auto-remove after 30 seconds for non-critical
        if (alarm.level !== 'CRITICAL') {
            setTimeout(() => alarmEl.remove(), 30000);
        }
    }

    // Handle console errors
    handleConsoleError(args) {
        const errorStr = args.join(' ');
        this.handleError({
            type: 'CONSOLE_ERROR',
            message: errorStr,
            args: args
        });
    }

    // Check specific conditions
    checkV86Status() {
        if (typeof V86Starter === 'undefined' && typeof V86 === 'undefined') {
            this.triggerAlarm(VMErrorMonitor.ALARM_TAGS.V86_LOAD_FAIL, {
                message: 'Neither V86Starter nor V86 constructor found'
            });
            return false;
        }
        return true;
    }

    checkBIOSFiles() {
        const biosUrls = [
            '/images/seabios/seabios.bin',
            '/images/seabios/vgabios.bin'
        ];

        biosUrls.forEach(url => {
            fetch(window.location.origin + '/ignition-sandbox/vm' + url)
                .then(response => {
                    if (!response.ok) {
                        this.triggerAlarm(VMErrorMonitor.ALARM_TAGS.BIOS_MISSING, {
                            message: `BIOS file not found: ${url}`,
                            status: response.status
                        });
                    }
                })
                .catch(error => {
                    this.triggerAlarm(VMErrorMonitor.ALARM_TAGS.BIOS_MISSING, {
                        message: `Failed to check BIOS: ${url}`,
                        error: error.message
                    });
                });
        });
    }

    // Add listener for errors
    addListener(callback) {
        this.listeners.push(callback);
    }

    // Notify all listeners
    notifyListeners(error) {
        this.listeners.forEach(callback => {
            try {
                callback(error);
            } catch(e) {
                console.error('Error in listener:', e);
            }
        });
    }

    // Get alarm summary
    getAlarmSummary() {
        return {
            critical: this.alarms.CRITICAL.length,
            warning: this.alarms.WARNING.length,
            info: this.alarms.INFO.length,
            total: this.errors.length
        };
    }

    // Clear alarms
    clearAlarms(level = null) {
        if (level) {
            this.alarms[level] = [];
        } else {
            this.alarms = { CRITICAL: [], WARNING: [], INFO: [] };
        }
    }

    // Export error log
    exportErrorLog() {
        const log = {
            timestamp: new Date().toISOString(),
            summary: this.getAlarmSummary(),
            alarms: this.alarms,
            errors: this.errors
        };
        return JSON.stringify(log, null, 2);
    }
}

// Initialize error monitor
const vmErrorMonitor = new VMErrorMonitor();

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Export for use
window.VMErrorMonitor = VMErrorMonitor;
window.vmErrorMonitor = vmErrorMonitor;

// Perform initial checks
setTimeout(() => {
    console.log('[ErrorMonitor] Performing initial checks...');
    vmErrorMonitor.checkV86Status();
    vmErrorMonitor.checkBIOSFiles();
}, 2000);

console.log('[ErrorMonitor] VM Error Monitor initialized with alarm tags');
console.log('[ErrorMonitor] Alarm types:', Object.keys(VMErrorMonitor.ALARM_TAGS));