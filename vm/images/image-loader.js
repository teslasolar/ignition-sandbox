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

  // Image manifest
  images: {
    'alpine': {
      url: 'https://example.com/alpine-3.18.img.gz',
      size: 52428800,  // 50MB
      compressed: true,
      priority: 'high'
    },
    'buildroot': {
      url: 'https://example.com/buildroot.img.gz',
      size: 20971520,  // 20MB
      compressed: true,
      priority: 'medium'
    },
    'ignition-kernel': {
      url: 'kernels/ignition.bin',
      size: 512,
      compressed: false,
      priority: 'critical'
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
  }
};

// Export
if (typeof module !== 'undefined') module.exports = ImageLoader;
if (typeof window !== 'undefined') window.ImageLoader = ImageLoader;
