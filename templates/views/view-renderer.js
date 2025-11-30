// View Renderer - Renders views from CSV definitions
// Konomi IgnAIte

const ViewRenderer = {
  views: new Map(),
  layouts: {
    'grid-2x2': { cols: 2, rows: 2, gap: '15px' },
    'grid-3x2': { cols: 3, rows: 2, gap: '15px' },
    'grid-4x2': { cols: 4, rows: 2, gap: '15px' },
    'flow-h': { display: 'flex', direction: 'row', gap: '10px' },
    'flow-v': { display: 'flex', direction: 'column', gap: '10px' },
    'io-grid': { cols: 8, rows: 2, gap: '5px' }
  },

  // Load views from CSV
  async loadViews(csvPath) {
    const res = await fetch(csvPath);
    const csv = await res.text();
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const view = {};
      headers.forEach((h, idx) => view[h] = values[idx]);

      // Parse components
      view.componentList = view.components.split('|').map(c => {
        const [type, id] = c.split(':');
        return { type, id };
      });

      this.views.set(view.id, view);
    }
    return this.views.size;
  },

  // Render view to container
  render(viewId, container) {
    const view = this.views.get(viewId);
    if (!view) return null;

    container.innerHTML = '';
    container.className = 'view-container';

    // Apply layout
    const layout = this.layouts[view.layout] || this.layouts['grid-2x2'];

    if (layout.cols) {
      container.style.display = 'grid';
      container.style.gridTemplateColumns = `repeat(${layout.cols}, 1fr)`;
      container.style.gap = layout.gap;
    } else {
      container.style.display = layout.display;
      container.style.flexDirection = layout.direction;
      container.style.gap = layout.gap;
    }

    // Render components
    for (const comp of view.componentList) {
      const el = this.renderComponent(comp);
      container.appendChild(el);
    }

    return container;
  },

  // Render single component
  renderComponent(comp) {
    const el = document.createElement('div');
    el.className = `view-component view-${comp.type}`;
    el.dataset.type = comp.type;
    el.dataset.id = comp.id;

    // Style based on type
    const styles = {
      pump: { borderRadius: '50%', background: '#161b22', border: '2px solid #6b7280' },
      tank: { borderRadius: '4px', background: '#161b22', border: '2px solid #6b7280', minHeight: '100px' },
      valve: { borderRadius: '4px', background: '#161b22', border: '2px solid #6b7280' },
      sensor: { borderRadius: '4px', background: '#161b22', border: '1px solid #30363d' },
      di: { background: '#21262d', borderRadius: '4px' },
      do: { background: '#21262d', borderRadius: '4px' },
      ai: { background: '#21262d', borderRadius: '4px' },
      ao: { background: '#21262d', borderRadius: '4px' }
    };

    Object.assign(el.style, {
      padding: '15px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#c9d1d9',
      fontSize: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      ...styles[comp.type]
    });

    el.innerHTML = `
      <div style="font-weight:bold;color:#f97316">${comp.id}</div>
      <div style="font-size:10px;color:#8b949e">${comp.type}</div>
    `;

    return el;
  },

  // Get view list
  getViewList() {
    return Array.from(this.views.values()).map(v => ({
      id: v.id,
      name: v.name,
      layout: v.layout
    }));
  }
};

// Export
if (typeof module !== 'undefined') module.exports = ViewRenderer;
if (typeof window !== 'undefined') window.ViewRenderer = ViewRenderer;
