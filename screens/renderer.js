// Screen Renderer - Unified component rendering
// Konomi IgnAIte

const ScreenRenderer = {
  components: new Map(),
  symbols: new Map(),
  states: {
    running: '#10b981',
    stopped: '#6b7280',
    fault: '#ef4444',
    alarm: '#f59e0b',
    open: '#10b981',
    closed: '#ef4444'
  },

  // Load components from CSV
  async loadComponents(csvPath) {
    const res = await fetch(csvPath);
    const csv = await res.text();
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const comp = {};
      headers.forEach((h, idx) => comp[h] = values[idx]);
      comp.width = parseFloat(comp.width);
      comp.height = parseFloat(comp.height);
      this.components.set(comp.id, comp);
    }
    return this.components.size;
  },

  // Load symbols from CSV
  async loadSymbols(csvPath) {
    const res = await fetch(csvPath);
    const csv = await res.text();
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
      // Handle SVG containing commas
      const match = lines[i].match(/^([^,]+),([^,]+),([^,]+),([^,]+),([^,]+),(.+)$/);
      if (match) {
        const sym = {
          id: match[1],
          name: match[2],
          category: match[3],
          width: parseFloat(match[4]),
          height: parseFloat(match[5]),
          svg: match[6]
        };
        this.symbols.set(sym.id, sym);
      }
    }
    return this.symbols.size;
  },

  // Render component to canvas/container
  renderComponent(id, container, options = {}) {
    const comp = this.components.get(id);
    if (!comp) return null;

    const el = document.createElement('div');
    el.className = 'screen-component';
    el.dataset.type = id;
    el.dataset.tag = options.tagPath || '';

    const state = options.state || 'stopped';
    const color = this.states[state] || comp.fill;

    el.style.cssText = `
      position: absolute;
      left: ${(options.x || 0) * 100}%;
      top: ${(options.y || 0) * 100}%;
      width: ${comp.width * 100}%;
      height: ${comp.height * 100}%;
      background: ${comp.fill};
      border: 2px solid ${color};
      border-radius: ${comp.shape === 'circle' ? '50%' : '4px'};
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${color};
      font-size: 12px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s;
    `;

    el.textContent = options.label || comp.name.charAt(0);
    el.title = options.label || comp.name;

    if (container) container.appendChild(el);
    return el;
  },

  // Render symbol with SVG
  renderSymbol(id, container, options = {}) {
    const sym = this.symbols.get(id);
    if (!sym) return null;

    const el = document.createElement('div');
    el.className = 'screen-symbol';
    el.dataset.type = id;

    el.style.cssText = `
      position: absolute;
      left: ${(options.x || 0) * 100}%;
      top: ${(options.y || 0) * 100}%;
      width: ${sym.width * 100}%;
      height: ${sym.height * 100}%;
    `;

    el.innerHTML = sym.svg;
    el.title = options.label || sym.name;

    if (container) container.appendChild(el);
    return el;
  },

  // Update component state
  updateState(element, state) {
    const color = this.states[state] || '#6b7280';
    element.style.borderColor = color;
    element.style.color = color;

    if (state === 'fault') {
      element.classList.add('blink');
    } else {
      element.classList.remove('blink');
    }
  },

  // Create screen from layout definition
  renderScreen(layout, container) {
    container.innerHTML = '';
    container.style.position = 'relative';

    for (const item of layout.components || []) {
      if (item.symbol) {
        this.renderSymbol(item.symbol, container, item);
      } else {
        this.renderComponent(item.type, container, item);
      }
    }

    return container;
  },

  // Export screen as JSON
  exportScreen(container) {
    const components = [];
    container.querySelectorAll('[data-type]').forEach(el => {
      components.push({
        type: el.dataset.type,
        x: parseFloat(el.style.left) / 100,
        y: parseFloat(el.style.top) / 100,
        tagPath: el.dataset.tag || ''
      });
    });
    return { components };
  }
};

// Add blink animation
const style = document.createElement('style');
style.textContent = `
  .screen-component.blink { animation: blink 0.5s infinite; }
  @keyframes blink { 50% { opacity: 0.5; } }
`;
document.head.appendChild(style);

// Export
if (typeof module !== 'undefined') module.exports = ScreenRenderer;
if (typeof window !== 'undefined') window.ScreenRenderer = ScreenRenderer;
