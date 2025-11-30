// Image Loader - Lazy loading and caching for VM images
// Konomi IgnAIte

const ImageLoader = {
  db: null,
  dbName: 'ignite-vm-images',
  storeName: 'images',

  // Initialize IndexedDB
  async init() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.dbName, 1);

      req.onerror = () => reject(req.error);
      req.onsuccess = () => {
        this.db = req.result;
        resolve(this);
      };

      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
    });
  },

  // Image manifest - actual bootable images
  images: {
    // BIOS files (required for v86)
    'bios': {
      url: 'vm/images/seabios/bios.bin',
      size: 65536,
      type: 'bios',
      compressed: false,
      priority: 'critical'
    },
    'vgabios': {
      url: 'vm/images/seabios/vgabios.bin',
      size: 32768,
      type: 'vgabios',
      compressed: false,
      priority: 'critical'
    },

    // Boot sectors (512 bytes each)
    'boot-minimal': {
      url: 'vm/images/kernels/boot-minimal.bin',
      size: 512,
      type: 'bootsector',
      compressed: false,
      priority: 'critical',
      desc: 'Minimal boot - displays IgnAIte banner'
    },
    'boot-shell': {
      url: 'vm/images/kernels/boot-shell.bin',
      size: 512,
      type: 'bootsector',
      compressed: false,
      priority: 'high',
      desc: 'Interactive shell with keyboard input'
    },
    'boot-gateway': {
      url: 'vm/images/kernels/boot-gateway.bin',
      size: 512,
      type: 'bootsector',
      compressed: false,
      priority: 'high',
      desc: 'Gateway status display'
    },

    // Floppy disk images
    'ignaite-floppy': {
      url: 'vm/images/rootfs/ignaite.img',
      size: 1474560,
      type: 'fda',
      compressed: false,
      priority: 'medium',
      desc: 'IgnAIte OS 1.44MB floppy with FAT12 filesystem'
    }
  },

  // Check if image is cached
  async isCached(id) {
    if (!this.db) await this.init();

    return new Promise((resolve) => {
      const tx = this.db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const req = store.get(id);

      req.onsuccess = () => resolve(!!req.result);
      req.onerror = () => resolve(false);
    });
  },

  // Get cached image
  async getFromCache(id) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const req = store.get(id);

      req.onsuccess = () => resolve(req.result?.data);
      req.onerror = () => reject(req.error);
    });
  },

  // Save to cache
  async saveToCache(id, data) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const req = store.put({ id, data, cached: Date.now() });

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  // Load image with progress
  async load(id, onProgress) {
    const info = this.images[id];
    if (!info) throw new Error(`Unknown image: ${id}`);

    // Check cache first
    const cached = await this.getFromCache(id);
    if (cached) {
      console.log(`Image ${id} loaded from cache`);
      return new Uint8Array(cached);
    }

    // Download
    const res = await fetch(info.url);
    if (!res.ok) throw new Error(`Failed to download ${id}`);

    const reader = res.body.getReader();
    const chunks = [];
    let received = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      received += value.length;

      if (onProgress) {
        onProgress(received, info.size);
      }
    }

    // Combine chunks
    const data = new Uint8Array(received);
    let pos = 0;
    for (const chunk of chunks) {
      data.set(chunk, pos);
      pos += chunk.length;
    }

    // Decompress if needed
    const final = info.compressed ? await this.decompress(data) : data;

    // Cache
    await this.saveToCache(id, final.buffer);

    return final;
  },

  // Decompress gzip data
  async decompress(data) {
    if ('DecompressionStream' in window) {
      const ds = new DecompressionStream('gzip');
      const blob = new Blob([data]);
      const stream = blob.stream().pipeThrough(ds);
      const result = await new Response(stream).arrayBuffer();
      return new Uint8Array(result);
    }
    // Fallback: return as-is (would need pako or similar)
    return data;
  },

  // Preload critical images
  async preloadCritical() {
    const critical = Object.entries(this.images)
      .filter(([_, info]) => info.priority === 'critical')
      .map(([id]) => id);

    await Promise.all(critical.map(id => this.load(id)));
    console.log('Critical images preloaded');
  },

  // Get cache stats
  async getStats() {
    if (!this.db) await this.init();

    return new Promise((resolve) => {
      const tx = this.db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const req = store.getAll();

      req.onsuccess = () => {
        const items = req.result || [];
        resolve({
          count: items.length,
          totalSize: items.reduce((sum, i) => sum + (i.data?.byteLength || 0), 0),
          items: items.map(i => ({ id: i.id, size: i.data?.byteLength, cached: i.cached }))
        });
      };
    });
  },

  // Clear cache
  async clearCache() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const req = store.clear();

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  // Build v86 configuration for a specific boot profile
  async buildConfig(profile = 'minimal', options = {}) {
    const profiles = {
      'minimal': {
        bios: 'bios',
        vgabios: 'vgabios',
        boot: 'boot-minimal',
        memory: 16 * 1024 * 1024  // 16MB
      },
      'shell': {
        bios: 'bios',
        vgabios: 'vgabios',
        boot: 'boot-shell',
        memory: 32 * 1024 * 1024  // 32MB
      },
      'gateway': {
        bios: 'bios',
        vgabios: 'vgabios',
        boot: 'boot-gateway',
        memory: 32 * 1024 * 1024
      },
      'floppy': {
        bios: 'bios',
        vgabios: 'vgabios',
        fda: 'ignaite-floppy',
        memory: 64 * 1024 * 1024  // 64MB
      }
    };

    const p = profiles[profile] || profiles.minimal;
    const config = {
      memory_size: p.memory,
      vga_memory_size: 2 * 1024 * 1024,
      autostart: true,
      ...options
    };

    // Load BIOS files
    if (p.bios) {
      config.bios = { buffer: await this.load(p.bios) };
    }
    if (p.vgabios) {
      config.vga_bios = { buffer: await this.load(p.vgabios) };
    }

    // Load boot image
    if (p.boot) {
      const bootData = await this.load(p.boot);
      // Create a floppy image with boot sector
      const floppy = new Uint8Array(1474560);
      floppy.set(bootData, 0);
      config.fda = { buffer: floppy };
    } else if (p.fda) {
      config.fda = { buffer: await this.load(p.fda) };
    }

    return config;
  },

  // List available boot profiles
  getProfiles() {
    return [
      { id: 'minimal', name: 'Minimal Boot', desc: 'Quick boot banner display' },
      { id: 'shell', name: 'Interactive Shell', desc: 'Keyboard input shell' },
      { id: 'gateway', name: 'Gateway Display', desc: 'PLC/Gateway status' },
      { id: 'floppy', name: 'IgnAIte OS', desc: 'Full 1.44MB FAT12 floppy' }
    ];
  },

  // Get image info
  getImageInfo(id) {
    const img = this.images[id];
    if (!img) return null;
    return {
      id,
      ...img,
      sizeFormatted: this.formatSize(img.size)
    };
  },

  // Format bytes
  formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  },

  // List all available images
  listImages() {
    return Object.entries(this.images).map(([id, info]) => ({
      id,
      ...info,
      sizeFormatted: this.formatSize(info.size)
    }));
  }
};

// Export
if (typeof module !== 'undefined') module.exports = ImageLoader;
if (typeof window !== 'undefined') window.ImageLoader = ImageLoader;
