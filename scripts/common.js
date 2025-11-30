// Konomi IgnAIte - Common Utilities
// Shared functions across all modules

const K = {
  // DOM helpers
  $: (q) => document.querySelector(q),
  $$: (q) => document.querySelectorAll(q),
  el: (tag, attrs = {}, children = []) => {
    const e = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'style' && typeof v === 'object') {
        Object.assign(e.style, v);
      } else if (k.startsWith('on')) {
        e.addEventListener(k.slice(2).toLowerCase(), v);
      } else {
        e.setAttribute(k, v);
      }
    });
    children.forEach(c => e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
    return e;
  },

  // Data parsing
  csv: (s, hasHeader = true) => {
    const lines = s.trim().split('\n');
    if (!hasHeader) return lines.map(l => l.split(','));
    const headers = lines[0].split(',');
    return lines.slice(1).map(l => {
      const vals = l.split(',');
      return headers.reduce((o, h, i) => (o[h] = vals[i], o), {});
    });
  },
  json: (s) => { try { return JSON.parse(s); } catch { return null; } },

  // String helpers
  fmt: (t, d) => t.replace(/\{(\w+)\}/g, (_, k) => d[k] ?? ''),
  slug: (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  cap: (s) => s.charAt(0).toUpperCase() + s.slice(1),

  // Storage
  get: (k, def = null) => { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
  del: (k) => localStorage.removeItem(k),

  // Fetch helpers
  async load(url, type = 'json') {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load ${url}`);
    return type === 'json' ? res.json() : res.text();
  },
  async loadCSV(url) {
    const text = await this.load(url, 'text');
    return this.csv(text);
  },

  // Event helpers
  on: (el, ev, fn) => el.addEventListener(ev, fn),
  off: (el, ev, fn) => el.removeEventListener(ev, fn),
  emit: (el, ev, detail = {}) => el.dispatchEvent(new CustomEvent(ev, { detail })),

  // Time helpers
  debounce: (fn, ms = 300) => {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  },
  throttle: (fn, ms = 100) => {
    let t = 0;
    return (...a) => { const now = Date.now(); if (now - t >= ms) { t = now; fn(...a); } };
  },
  sleep: (ms) => new Promise(r => setTimeout(r, ms)),

  // Color helpers
  colors: {
    running: '#10b981',
    stopped: '#6b7280',
    fault: '#ef4444',
    alarm: '#f59e0b',
    primary: '#f97316',
    bg: '#0d1117',
    card: '#161b22',
    border: '#30363d',
    text: '#c9d1d9'
  },

  // Format helpers
  fmtNum: (n, d = 2) => Number(n).toFixed(d),
  fmtPct: (n) => (n * 100).toFixed(1) + '%',
  fmtBytes: (b) => {
    const u = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    while (b >= 1024 && i < u.length - 1) { b /= 1024; i++; }
    return b.toFixed(1) + ' ' + u[i];
  },
  fmtTime: (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  },

  // Tag path helpers
  tagPath: (area, type, id, prop) => `[${area}]${type}/${id}/${prop}`,
  parseTag: (path) => {
    const m = path.match(/\[([^\]]+)\]([^/]+)\/([^/]+)\/(.+)/);
    return m ? { area: m[1], type: m[2], id: m[3], prop: m[4] } : null;
  },

  // PLC address helpers
  plcAddr: (area, byte, bit = null) => bit !== null ? `${area}:${byte}/${bit}` : `${area}:${byte}`,
  parsePLC: (addr) => {
    const m = addr.match(/([A-Z]+):(\d+)(?:\/(\d+))?/);
    return m ? { area: m[1], byte: +m[2], bit: m[3] ? +m[3] : null } : null;
  }
};

// Export
if (typeof module !== 'undefined') module.exports = K;
if (typeof window !== 'undefined') window.K = K;
