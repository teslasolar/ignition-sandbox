// Konomi IgnAIte - Main Entry Point
// Unified loader for all system components

const IgnAIte = {
  version: '1.2.0',
  modules: {},
  ready: false,

  // Initialize entire system
  async init(config = {}) {
    console.log(`Konomi IgnAIte v${this.version} initializing...`);
    const start = performance.now();

    try {
      // Load common utilities
      await this.loadScript('scripts/common.js');
      this.modules.utils = window.K;

      // Load PLC system
      if (config.plc !== false) {
        await this.loadScript('plc/plc-loader.js');
        this.modules.plc = window.PLCLoader;
        await this.modules.plc?.init();
      }

      // Load VM system
      if (config.vm !== false) {
        await this.loadScript('vm/boot/fast-boot.js');
        await this.loadScript('vm/images/image-loader.js');
        await this.loadScript('vm/lib/integration.js');
        this.modules.fastBoot = window.FastBoot;
        this.modules.imageLoader = window.ImageLoader;
        this.modules.vmIntegration = window.VMIntegration;
        await this.modules.fastBoot?.init();
        await this.modules.imageLoader?.init();
      }

      // Load Tag system
      if (config.tags !== false) {
        await this.loadScript('tags/tag-utils.js');
        await this.loadScript('tags/plc-bridge.js');
        this.modules.tagUtils = window.TagUtils;
        this.modules.tagBridge = window.TagPLCBridge;
      }

      // Load Screen renderer
      if (config.screens !== false) {
        await this.loadScript('screens/renderer.js');
        await this.loadScript('templates/views/view-renderer.js');
        this.modules.screenRenderer = window.ScreenRenderer;
        this.modules.viewRenderer = window.ViewRenderer;
      }

      this.ready = true;
      const loadTime = (performance.now() - start).toFixed(0);
      console.log(`IgnAIte ready in ${loadTime}ms`);

      // Dispatch ready event
      window.dispatchEvent(new CustomEvent('ignaite:ready', { detail: this }));

      return this;
    } catch (err) {
      console.error('IgnAIte init failed:', err);
      throw err;
    }
  },

  // Load script helper
  loadScript(src) {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
  },

  // Quick access methods
  get plc() { return this.modules.plc; },
  get vm() { return this.modules.vmIntegration; },
  get tags() { return this.modules.tagUtils; },
  get K() { return this.modules.utils; },

  // Boot VM with kernel
  async bootVM(kernelId = 'minimal') {
    if (!this.modules.fastBoot) throw new Error('VM not initialized');
    return this.modules.fastBoot.boot(this.modules.vmIntegration?.vm, kernelId);
  },

  // Start PLC
  startPLC() {
    return this.modules.plc?.run();
  },

  // Stop PLC
  stopPLC() {
    return this.modules.plc?.stop();
  },

  // Load L5K program
  async loadProgram(path) {
    if (!this.modules.plc) throw new Error('PLC not initialized');
    return this.modules.plc.loadProgram(path);
  },

  // Load tag instances
  async loadTags(type, csvPath) {
    if (!this.modules.tagUtils) throw new Error('Tags not initialized');
    return this.modules.tagUtils.loadInstances(type, csvPath);
  },

  // Render view
  async renderView(viewId, container) {
    if (!this.modules.viewRenderer) throw new Error('Views not initialized');
    await this.modules.viewRenderer.loadViews('templates/views/views.csv');
    return this.modules.viewRenderer.render(viewId, container);
  },

  // Get system status
  getStatus() {
    return {
      version: this.version,
      ready: this.ready,
      modules: Object.keys(this.modules),
      plc: this.modules.plc?.getStatus(),
      vm: this.modules.vmIntegration?.getStatus()
    };
  }
};

// Auto-init on DOM ready if data-auto-init present
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('[data-ignaite-auto]')) {
    IgnAIte.init();
  }
});

// Export
if (typeof module !== 'undefined') module.exports = IgnAIte;
if (typeof window !== 'undefined') window.IgnAIte = IgnAIte;
