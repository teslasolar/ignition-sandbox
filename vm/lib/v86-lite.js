/**
 * v86-lite: Lightweight Linux VM Simulator
 * A custom implementation that simulates a Linux environment in the browser
 * without requiring actual x86 emulation.
 */

class V86Lite {
    constructor(config) {
        this.config = config;
        this.screen = config.screen_container;
        this.memory = config.memory_size || 256 * 1024 * 1024;
        this.running = false;
        this.bootTime = null;
        this.listeners = {};

        // Virtual filesystem
        this.fs = new VirtualFS();

        // Virtual terminal
        this.terminal = null;
        this.inputBuffer = '';
        this.cursorVisible = true;
        this.cursorInterval = null;

        // Environment
        this.env = {
            USER: 'root',
            HOME: '/root',
            PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
            SHELL: '/bin/sh',
            TERM: 'linux',
            PWD: '/root',
            HOSTNAME: 'sandbox'
        };
        this.cwd = '/root';
        this.history = [];
        this.historyIndex = 0;

        // Ignition state
        this.ignition = {
            installed: false,
            running: false,
            version: '8.1.33',
            port: 8088
        };

        if (config.autostart) {
            setTimeout(() => this.boot(), 100);
        }
    }

    add_listener(event, callback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(data));
        }
    }

    async boot() {
        this.createScreen();
        this.emit('emulator-ready', {});

        // Simulate boot sequence
        await this.bootSequence();

        this.running = true;
        this.bootTime = Date.now();
        this.emit('emulator-started', {});

        // Start terminal
        this.startTerminal();
    }

    createScreen() {
        this.screen.innerHTML = '';
        this.screen.style.cssText = `
            background: #000;
            color: #aaa;
            font-family: 'Perfect DOS VGA 437', 'Consolas', 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.2;
            padding: 10px;
            overflow-y: auto;
            height: 100%;
            white-space: pre-wrap;
            word-wrap: break-word;
        `;

        this.terminal = document.createElement('div');
        this.terminal.id = 'v86-terminal';
        this.screen.appendChild(this.terminal);

        // Capture keyboard input
        this.screen.tabIndex = 0;
        this.screen.addEventListener('keydown', (e) => this.handleKeydown(e));
        this.screen.addEventListener('click', () => this.screen.focus());
    }

    async bootSequence() {
        const bootMessages = [
            { text: 'SeaBIOS (version 1.16.0)', delay: 50 },
            { text: '', delay: 20 },
            { text: 'Booting from Hard Disk...', delay: 100 },
            { text: '', delay: 50 },
            { text: '[    0.000000] Linux version 5.15.0-sandbox (gcc 11.2.0)', delay: 30 },
            { text: '[    0.000000] Command line: tsc=reliable mitigations=off console=tty0', delay: 20 },
            { text: '[    0.000000] BIOS-provided physical RAM map:', delay: 20 },
            { text: `[    0.000000]  BIOS-e820: [mem 0x0000000000000000-0x${(this.memory/1024/1024).toString(16)}fffffff] usable`, delay: 20 },
            { text: '[    0.004000] CPU: x86_64 (emulated)', delay: 30 },
            { text: `[    0.008000] Memory: ${Math.floor(this.memory/1024/1024)}MB available`, delay: 30 },
            { text: '[    0.012000] Initializing virtual filesystem...', delay: 40 },
            { text: '[    0.016000] NET: Registered protocol family 2', delay: 30 },
            { text: '[    0.020000] virtio_net: eth0: MAC 52:54:00:12:34:56', delay: 30 },
            { text: '[    0.024000] Freeing unused kernel memory: 1024K', delay: 40 },
            { text: '[    0.028000] Run /init as init process', delay: 50 },
            { text: '', delay: 30 },
            { text: 'Starting sandbox init...', delay: 100 },
            { text: 'Mounting filesystems... done', delay: 80 },
            { text: 'Starting networking... done', delay: 80 },
            { text: 'Setting hostname: sandbox', delay: 50 },
            { text: '', delay: 30 },
            { text: 'Welcome to Ignition Sandbox Linux', delay: 100, color: '#0f0' },
            { text: '', delay: 50 }
        ];

        for (const msg of bootMessages) {
            this.write(msg.text + '\n', msg.color);
            await this.sleep(msg.delay);
        }
    }

    startTerminal() {
        this.showPrompt();
        this.startCursorBlink();
        this.screen.focus();
    }

    showPrompt() {
        const user = this.env.USER;
        const host = this.env.HOSTNAME;
        const dir = this.cwd === this.env.HOME ? '~' : this.cwd;
        const prompt = user === 'root' ? '#' : '$';
        this.write(`\x1b[32m${user}@${host}\x1b[0m:\x1b[34m${dir}\x1b[0m${prompt} `, null, false);
        this.inputStart = this.terminal.textContent.length;
    }

    startCursorBlink() {
        if (this.cursorInterval) clearInterval(this.cursorInterval);
        this.cursor = document.createElement('span');
        this.cursor.textContent = '█';
        this.cursor.style.animation = 'blink 1s step-end infinite';
        this.terminal.appendChild(this.cursor);

        // Add blink animation
        if (!document.getElementById('v86-cursor-style')) {
            const style = document.createElement('style');
            style.id = 'v86-cursor-style';
            style.textContent = '@keyframes blink { 50% { opacity: 0; } }';
            document.head.appendChild(style);
        }
    }

    write(text, color = null, newline = true) {
        if (this.cursor) this.cursor.remove();

        const span = document.createElement('span');
        if (color) span.style.color = color;

        // Parse ANSI color codes
        text = this.parseAnsi(text);
        span.innerHTML = text;

        this.terminal.appendChild(span);
        this.screen.scrollTop = this.screen.scrollHeight;

        if (this.running) {
            this.terminal.appendChild(this.cursor);
        }
    }

    parseAnsi(text) {
        const colors = {
            '30': '#000', '31': '#a00', '32': '#0a0', '33': '#a50',
            '34': '#00a', '35': '#a0a', '36': '#0aa', '37': '#aaa',
            '90': '#555', '91': '#f55', '92': '#5f5', '93': '#ff5',
            '94': '#55f', '95': '#f5f', '96': '#5ff', '97': '#fff',
            '0': null
        };

        return text.replace(/\x1b\[(\d+)m/g, (match, code) => {
            if (code === '0') return '</span>';
            const color = colors[code];
            return color ? `<span style="color:${color}">` : '';
        });
    }

    handleKeydown(e) {
        if (!this.running) return;

        e.preventDefault();

        switch (e.key) {
            case 'Enter':
                this.write('\n', null, false);
                this.executeCommand(this.inputBuffer);
                this.inputBuffer = '';
                break;

            case 'Backspace':
                if (this.inputBuffer.length > 0) {
                    this.inputBuffer = this.inputBuffer.slice(0, -1);
                    this.redrawInput();
                }
                break;

            case 'ArrowUp':
                if (this.historyIndex > 0) {
                    this.historyIndex--;
                    this.inputBuffer = this.history[this.historyIndex] || '';
                    this.redrawInput();
                }
                break;

            case 'ArrowDown':
                if (this.historyIndex < this.history.length) {
                    this.historyIndex++;
                    this.inputBuffer = this.history[this.historyIndex] || '';
                    this.redrawInput();
                }
                break;

            case 'Tab':
                // Simple tab completion
                const parts = this.inputBuffer.split(' ');
                const last = parts[parts.length - 1];
                const completions = this.getCompletions(last);
                if (completions.length === 1) {
                    parts[parts.length - 1] = completions[0];
                    this.inputBuffer = parts.join(' ');
                    this.redrawInput();
                }
                break;

            case 'c':
                if (e.ctrlKey) {
                    this.write('^C\n');
                    this.inputBuffer = '';
                    this.showPrompt();
                    return;
                }
                // Fall through
            default:
                if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                    this.inputBuffer += e.key;
                    this.write(e.key, null, false);
                }
        }
    }

    redrawInput() {
        if (this.cursor) this.cursor.remove();

        // Remove current input
        const text = this.terminal.textContent;
        const promptEnd = text.lastIndexOf('$ ') + 2;

        // Find and remove text after prompt
        const nodes = Array.from(this.terminal.childNodes);
        let found = false;
        for (let i = nodes.length - 1; i >= 0; i--) {
            const node = nodes[i];
            if (node.textContent && node.textContent.includes('$ ')) {
                node.textContent = node.textContent.substring(0, node.textContent.lastIndexOf('$ ') + 2);
                found = true;
                break;
            } else if (!found) {
                node.remove();
            }
        }

        this.write(this.inputBuffer, null, false);
    }

    getCompletions(prefix) {
        const commands = Object.keys(this.commands);
        const files = this.fs.list(this.cwd);
        const all = [...commands, ...files];
        return all.filter(c => c.startsWith(prefix));
    }

    async executeCommand(input) {
        const cmd = input.trim();
        if (!cmd) {
            this.showPrompt();
            return;
        }

        this.history.push(cmd);
        this.historyIndex = this.history.length;

        const [name, ...args] = this.parseArgs(cmd);

        if (this.commands[name]) {
            try {
                const result = await this.commands[name].call(this, args);
                if (result) this.write(result + '\n');
            } catch (e) {
                this.write(`${name}: ${e.message}\n`, '#f55');
            }
        } else if (this.fs.exists(this.resolvePath(name)) && this.fs.get(this.resolvePath(name)).executable) {
            this.write(`Executing ${name}...\n`, '#0ff');
        } else {
            this.write(`-sh: ${name}: command not found\n`, '#f55');
        }

        this.showPrompt();
    }

    parseArgs(cmd) {
        const args = [];
        let current = '';
        let inQuote = false;
        let quoteChar = '';

        for (const char of cmd) {
            if ((char === '"' || char === "'") && !inQuote) {
                inQuote = true;
                quoteChar = char;
            } else if (char === quoteChar && inQuote) {
                inQuote = false;
            } else if (char === ' ' && !inQuote) {
                if (current) args.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        if (current) args.push(current);

        return args;
    }

    resolvePath(path) {
        if (!path) return this.cwd;
        if (path === '~') return this.env.HOME;
        if (path.startsWith('~/')) return this.env.HOME + path.slice(1);
        if (path.startsWith('/')) return path;
        if (path === '.') return this.cwd;
        if (path === '..') {
            const parts = this.cwd.split('/').filter(Boolean);
            parts.pop();
            return '/' + parts.join('/');
        }
        return this.cwd === '/' ? '/' + path : this.cwd + '/' + path;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    stop() {
        this.running = false;
        if (this.cursorInterval) clearInterval(this.cursorInterval);
        this.write('\n\nSystem halted.\n', '#f55');
    }

    restart() {
        this.terminal.innerHTML = '';
        this.inputBuffer = '';
        this.boot();
    }

    keyboard_send_text(text) {
        for (const char of text) {
            if (char === '\n') {
                this.handleKeydown({ key: 'Enter', preventDefault: () => {} });
            } else {
                this.handleKeydown({ key: char, preventDefault: () => {} });
            }
        }
    }

    // Commands
    commands = {
        help: () => `Available commands:
  help              Show this help message
  clear             Clear the screen
  echo [text]       Display text
  pwd               Print working directory
  cd [dir]          Change directory
  ls [dir]          List directory contents
  cat [file]        Display file contents
  mkdir [dir]       Create directory
  touch [file]      Create empty file
  rm [file]         Remove file
  cp [src] [dst]    Copy file
  mv [src] [dst]    Move file
  env               Show environment variables
  export VAR=val    Set environment variable
  uname [-a]        System information
  date              Show current date/time
  uptime            Show system uptime
  free              Show memory usage
  df                Show disk usage
  ps                Show processes
  top               Show system monitor
  ifconfig          Show network interfaces
  ping [host]       Ping a host
  wget [url]        Download file
  curl [url]        Fetch URL
  tar               Archive utility
  ignition          Ignition Gateway control
  history           Show command history
  exit              Exit shell`,

        clear: function() {
            this.terminal.innerHTML = '';
            return null;
        },

        echo: (args) => args.join(' '),

        pwd: function() { return this.cwd; },

        whoami: function() { return this.env.USER; },

        cd: function(args) {
            const target = args[0] || this.env.HOME;
            const path = this.resolvePath(target);
            if (!this.fs.exists(path)) throw new Error(`${target}: No such directory`);
            if (!this.fs.isDir(path)) throw new Error(`${target}: Not a directory`);
            this.cwd = path;
            this.env.PWD = path;
            return null;
        },

        ls: function(args) {
            let showAll = false;
            let showLong = false;
            let target = '.';

            for (const arg of args) {
                if (arg === '-a' || arg === '-la' || arg === '-al') showAll = true;
                if (arg === '-l' || arg === '-la' || arg === '-al') showLong = true;
                if (!arg.startsWith('-')) target = arg;
            }

            const path = this.resolvePath(target);
            if (!this.fs.exists(path)) throw new Error(`${target}: No such file or directory`);

            let items = this.fs.list(path);
            if (!showAll) items = items.filter(i => !i.startsWith('.'));

            if (showLong) {
                return items.map(name => {
                    const fullPath = path === '/' ? '/' + name : path + '/' + name;
                    const entry = this.fs.get(fullPath);
                    const type = entry?.type === 'dir' ? 'd' : '-';
                    const perms = entry?.executable ? 'rwxr-xr-x' : 'rw-r--r--';
                    const size = entry?.content?.length || 0;
                    return `${type}${perms} 1 root root ${String(size).padStart(6)} Jan  1 00:00 ${name}`;
                }).join('\n');
            }

            return items.map(name => {
                const fullPath = path === '/' ? '/' + name : path + '/' + name;
                return this.fs.isDir(fullPath) ? `\x1b[34m${name}/\x1b[0m` : name;
            }).join('  ');
        },

        cat: function(args) {
            if (!args[0]) throw new Error('missing operand');
            const path = this.resolvePath(args[0]);
            if (!this.fs.exists(path)) throw new Error(`${args[0]}: No such file`);
            if (this.fs.isDir(path)) throw new Error(`${args[0]}: Is a directory`);
            return this.fs.get(path).content;
        },

        mkdir: function(args) {
            if (!args[0]) throw new Error('missing operand');
            const path = this.resolvePath(args[0]);
            if (this.fs.exists(path)) throw new Error(`${args[0]}: File exists`);
            this.fs.mkdir(path);
            return null;
        },

        touch: function(args) {
            if (!args[0]) throw new Error('missing operand');
            const path = this.resolvePath(args[0]);
            if (!this.fs.exists(path)) {
                this.fs.write(path, '');
            }
            return null;
        },

        rm: function(args) {
            if (!args[0]) throw new Error('missing operand');
            const path = this.resolvePath(args[0]);
            if (!this.fs.exists(path)) throw new Error(`${args[0]}: No such file`);
            this.fs.remove(path);
            return null;
        },

        cp: function(args) {
            if (args.length < 2) throw new Error('missing destination');
            const src = this.resolvePath(args[0]);
            const dst = this.resolvePath(args[1]);
            if (!this.fs.exists(src)) throw new Error(`${args[0]}: No such file`);
            const content = this.fs.get(src).content;
            this.fs.write(dst, content);
            return null;
        },

        mv: function(args) {
            this.commands.cp.call(this, args);
            this.commands.rm.call(this, [args[0]]);
            return null;
        },

        env: function() {
            return Object.entries(this.env).map(([k, v]) => `${k}=${v}`).join('\n');
        },

        export: function(args) {
            const match = args.join('').match(/^(\w+)=(.*)$/);
            if (!match) throw new Error('invalid syntax');
            this.env[match[1]] = match[2];
            return null;
        },

        uname: function(args) {
            if (args.includes('-a')) {
                return 'Linux sandbox 5.15.0-sandbox #1 SMP x86_64 GNU/Linux';
            }
            return 'Linux';
        },

        date: () => new Date().toString(),

        uptime: function() {
            const secs = Math.floor((Date.now() - this.bootTime) / 1000);
            const mins = Math.floor(secs / 60);
            const hours = Math.floor(mins / 60);
            return ` ${new Date().toLocaleTimeString()} up ${hours}:${String(mins % 60).padStart(2, '0')}, 1 user, load average: 0.00, 0.00, 0.00`;
        },

        free: function() {
            const total = Math.floor(this.memory / 1024);
            const used = Math.floor(total * 0.3);
            const free = total - used;
            return `              total        used        free      shared  buff/cache   available
Mem:       ${total}      ${used}      ${free}           0       ${Math.floor(used/2)}      ${free + Math.floor(used/2)}
Swap:            0           0           0`;
        },

        df: () => `Filesystem     1K-blocks    Used Available Use% Mounted on
/dev/root         256000   64000    192000  25% /
devtmpfs          128000       0    128000   0% /dev
tmpfs             128000       0    128000   0% /tmp`,

        ps: () => `  PID TTY          TIME CMD
    1 ?        00:00:00 init
    2 ?        00:00:00 [kthreadd]
   10 tty1     00:00:00 sh
   ${Math.floor(Math.random() * 100) + 100} tty1     00:00:00 ps`,

        top: function() {
            const uptime = Math.floor((Date.now() - this.bootTime) / 1000);
            return `top - ${new Date().toLocaleTimeString()} up ${Math.floor(uptime/60)} min,  1 user,  load average: 0.00, 0.00, 0.00
Tasks:   4 total,   1 running,   3 sleeping,   0 stopped,   0 zombie
%Cpu(s):  0.3 us,  0.1 sy,  0.0 ni, 99.6 id,  0.0 wa,  0.0 hi,  0.0 si
MiB Mem :    ${Math.floor(this.memory/1024/1024)} total,    ${Math.floor(this.memory/1024/1024*0.7)} free,    ${Math.floor(this.memory/1024/1024*0.2)} used,    ${Math.floor(this.memory/1024/1024*0.1)} buff
MiB Swap:      0 total,      0 free,      0 used.    ${Math.floor(this.memory/1024/1024*0.8)} avail

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
    1 root      20   0    1024    512    256 S   0.0   0.1   0:00.01 init
   10 root      20   0    2048   1024    512 S   0.0   0.2   0:00.05 sh`;
        },

        ifconfig: () => `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 10.0.2.15  netmask 255.255.255.0  broadcast 10.0.2.255
        inet6 fe80::5054:ff:fe12:3456  prefixlen 64  scopeid 0x20<link>
        ether 52:54:00:12:34:56  txqueuelen 1000  (Ethernet)
        RX packets 1234  bytes 123456 (120.5 KiB)
        TX packets 567  bytes 56789 (55.4 KiB)

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1000  (Local Loopback)`,

        ping: async function(args) {
            if (!args[0]) throw new Error('missing host');
            const host = args[0];
            this.write(`PING ${host} (93.184.216.34) 56(84) bytes of data.\n`);
            for (let i = 0; i < 3; i++) {
                await this.sleep(100);
                const time = (10 + Math.random() * 5).toFixed(1);
                this.write(`64 bytes from 93.184.216.34: icmp_seq=${i+1} ttl=56 time=${time} ms\n`);
            }
            return `\n--- ${host} ping statistics ---\n3 packets transmitted, 3 received, 0% packet loss, time 2003ms`;
        },

        wget: async function(args) {
            if (!args[0]) throw new Error('missing URL');
            const url = args[0];
            const filename = url.split('/').pop() || 'index.html';
            this.write(`--${new Date().toISOString()}--  ${url}\n`);
            this.write(`Resolving ${new URL(url).hostname}... 93.184.216.34\n`);
            this.write(`Connecting to ${new URL(url).hostname}|93.184.216.34|:443... connected.\n`);
            this.write(`HTTP request sent, awaiting response... 200 OK\n`);
            this.write(`Length: 1234 (1.2K) [text/html]\n`);
            this.write(`Saving to: '${filename}'\n\n`);
            await this.sleep(500);
            this.write(`${filename}          100%[===================>]   1.21K  --.-KB/s    in 0s\n\n`);
            this.fs.write(this.resolvePath(filename), `<!-- Downloaded from ${url} -->\n<html><body>Sample content</body></html>`);
            return `${new Date().toISOString()} (1.21 KB/s) - '${filename}' saved [1234/1234]`;
        },

        curl: async function(args) {
            if (!args[0]) throw new Error('missing URL');
            return `<!DOCTYPE html>\n<html>\n<head><title>Example</title></head>\n<body>\n<h1>Example Domain</h1>\n<p>This domain is for use in examples.</p>\n</body>\n</html>`;
        },

        tar: (args) => {
            if (args.includes('--help') || args.length === 0) {
                return 'Usage: tar [options] [archive] [files]\nOptions: -c create, -x extract, -v verbose, -f file, -z gzip';
            }
            return 'tar: simulated operation complete';
        },

        ignition: async function(args) {
            const subcmd = args[0] || 'help';

            switch (subcmd) {
                case 'help':
                    return `Ignition Gateway Control

Usage: ignition <command>

Commands:
  status    Show gateway status
  start     Start the gateway
  stop      Stop the gateway
  restart   Restart the gateway
  install   Install Ignition Gateway
  logs      Show gateway logs
  config    Show configuration`;

                case 'status':
                    if (!this.ignition.installed) {
                        return '\x1b[33mIgnition Gateway is not installed.\x1b[0m\nRun: ignition install';
                    }
                    if (this.ignition.running) {
                        return `\x1b[32mIgnition Gateway ${this.ignition.version} is RUNNING\x1b[0m
Web Interface: http://localhost:${this.ignition.port}
Status: Active (running)
Memory: 384MB / 512MB
Uptime: ${Math.floor((Date.now() - this.ignition.startTime) / 1000)}s`;
                    }
                    return `\x1b[31mIgnition Gateway ${this.ignition.version} is STOPPED\x1b[0m\nRun: ignition start`;

                case 'start':
                    if (!this.ignition.installed) {
                        throw new Error('Ignition not installed. Run: ignition install');
                    }
                    if (this.ignition.running) {
                        return 'Gateway is already running.';
                    }
                    this.write('Starting Ignition Gateway...\n');
                    await this.sleep(500);
                    this.write('Initializing modules...\n');
                    await this.sleep(300);
                    this.write('Starting web server on port 8088...\n');
                    await this.sleep(200);
                    this.ignition.running = true;
                    this.ignition.startTime = Date.now();
                    return '\x1b[32mIgnition Gateway started successfully.\x1b[0m\nWeb UI: http://localhost:8088';

                case 'stop':
                    if (!this.ignition.running) {
                        return 'Gateway is not running.';
                    }
                    this.write('Stopping Ignition Gateway...\n');
                    await this.sleep(300);
                    this.ignition.running = false;
                    return '\x1b[33mIgnition Gateway stopped.\x1b[0m';

                case 'restart':
                    await this.commands.ignition.call(this, ['stop']);
                    await this.sleep(200);
                    return await this.commands.ignition.call(this, ['start']);

                case 'install':
                    if (this.ignition.installed) {
                        return 'Ignition Gateway is already installed.';
                    }
                    this.write('\x1b[36mInstalling Ignition Gateway...\x1b[0m\n\n');
                    this.write('Downloading Ignition-linux-64-8.1.33.zip...\n');
                    for (let i = 0; i <= 100; i += 10) {
                        await this.sleep(100);
                        const bar = '█'.repeat(i/5) + '░'.repeat(20 - i/5);
                        this.write(`\r[${bar}] ${i}%`);
                    }
                    this.write('\n\nExtracting files...\n');
                    await this.sleep(300);
                    this.write('Configuring gateway...\n');
                    await this.sleep(200);
                    this.write('Setting up database...\n');
                    await this.sleep(200);
                    this.write('Creating system service...\n');
                    await this.sleep(100);

                    this.ignition.installed = true;
                    this.fs.mkdir('/opt/ignition');
                    this.fs.write('/opt/ignition/ignition.sh', '#!/bin/bash\n# Ignition control script');
                    this.fs.mkdir('/opt/ignition/data');
                    this.fs.mkdir('/opt/ignition/logs');

                    return `\n\x1b[32mInstallation complete!\x1b[0m

Ignition Gateway ${this.ignition.version} has been installed to /opt/ignition

To start the gateway:
  ignition start

Web interface will be available at:
  http://localhost:8088

Default credentials:
  Username: admin
  Password: password`;

                case 'logs':
                    if (!this.ignition.installed) throw new Error('Ignition not installed');
                    return `[${new Date().toISOString()}] INFO  Gateway - Gateway starting
[${new Date().toISOString()}] INFO  Gateway - Loading modules
[${new Date().toISOString()}] INFO  Gateway - Web server started on port 8088
[${new Date().toISOString()}] INFO  Gateway - Gateway startup complete`;

                case 'config':
                    return `Ignition Gateway Configuration
==============================
Version: ${this.ignition.version}
Install Path: /opt/ignition
Data Path: /opt/ignition/data
HTTP Port: 8088
HTTPS Port: 8043
Gateway Network Port: 8060`;

                default:
                    throw new Error(`Unknown command: ${subcmd}`);
            }
        },

        history: function() {
            return this.history.map((cmd, i) => `  ${i + 1}  ${cmd}`).join('\n');
        },

        exit: function() {
            this.write('logout\n');
            this.stop();
            return null;
        }
    };
}

// Virtual Filesystem
class VirtualFS {
    constructor() {
        this.files = {
            '/': { type: 'dir', children: ['bin', 'etc', 'home', 'opt', 'root', 'tmp', 'usr', 'var', 'proc', 'sys', 'dev'] },
            '/bin': { type: 'dir', children: ['sh', 'ls', 'cat', 'echo'] },
            '/bin/sh': { type: 'file', content: '#!/bin/sh', executable: true },
            '/etc': { type: 'dir', children: ['passwd', 'hosts', 'hostname', 'os-release'] },
            '/etc/passwd': { type: 'file', content: 'root:x:0:0:root:/root:/bin/sh' },
            '/etc/hosts': { type: 'file', content: '127.0.0.1\tlocalhost\n::1\t\tlocalhost' },
            '/etc/hostname': { type: 'file', content: 'sandbox' },
            '/etc/os-release': { type: 'file', content: 'NAME="Ignition Sandbox Linux"\nVERSION="1.0"\nID=sandbox\nPRETTY_NAME="Ignition Sandbox Linux 1.0"' },
            '/home': { type: 'dir', children: ['user'] },
            '/home/user': { type: 'dir', children: ['.bashrc'] },
            '/home/user/.bashrc': { type: 'file', content: 'export PS1="\\u@\\h:\\w\\$ "' },
            '/opt': { type: 'dir', children: [] },
            '/root': { type: 'dir', children: ['.bashrc', '.profile'] },
            '/root/.bashrc': { type: 'file', content: 'export PS1="\\u@\\h:\\w# "\nalias ll="ls -la"' },
            '/root/.profile': { type: 'file', content: '# Root profile' },
            '/tmp': { type: 'dir', children: [] },
            '/usr': { type: 'dir', children: ['bin', 'lib', 'share'] },
            '/usr/bin': { type: 'dir', children: [] },
            '/usr/lib': { type: 'dir', children: [] },
            '/usr/share': { type: 'dir', children: [] },
            '/var': { type: 'dir', children: ['log', 'tmp'] },
            '/var/log': { type: 'dir', children: ['messages'] },
            '/var/log/messages': { type: 'file', content: 'System started.' },
            '/var/tmp': { type: 'dir', children: [] },
            '/proc': { type: 'dir', children: ['cpuinfo', 'meminfo', 'version'] },
            '/proc/cpuinfo': { type: 'file', content: 'processor\t: 0\nvendor_id\t: GenuineIntel\nmodel name\t: Virtual CPU\ncpu MHz\t\t: 2000.000' },
            '/proc/meminfo': { type: 'file', content: 'MemTotal:       262144 kB\nMemFree:        196608 kB\nMemAvailable:   229376 kB' },
            '/proc/version': { type: 'file', content: 'Linux version 5.15.0-sandbox' },
            '/sys': { type: 'dir', children: [] },
            '/dev': { type: 'dir', children: ['null', 'zero', 'random', 'tty'] }
        };
    }

    exists(path) {
        return !!this.files[path];
    }

    isDir(path) {
        return this.files[path]?.type === 'dir';
    }

    get(path) {
        return this.files[path];
    }

    list(path) {
        const entry = this.files[path];
        if (!entry || entry.type !== 'dir') return [];
        return entry.children || [];
    }

    mkdir(path) {
        const parent = path.substring(0, path.lastIndexOf('/')) || '/';
        const name = path.split('/').pop();

        this.files[path] = { type: 'dir', children: [] };
        if (this.files[parent]) {
            this.files[parent].children.push(name);
        }
    }

    write(path, content) {
        const parent = path.substring(0, path.lastIndexOf('/')) || '/';
        const name = path.split('/').pop();

        this.files[path] = { type: 'file', content };
        if (this.files[parent] && !this.files[parent].children.includes(name)) {
            this.files[parent].children.push(name);
        }
    }

    remove(path) {
        const parent = path.substring(0, path.lastIndexOf('/')) || '/';
        const name = path.split('/').pop();

        delete this.files[path];
        if (this.files[parent]) {
            this.files[parent].children = this.files[parent].children.filter(c => c !== name);
        }
    }
}

// Compatibility wrapper - makes V86Lite work like V86Starter
window.V86Starter = V86Lite;
