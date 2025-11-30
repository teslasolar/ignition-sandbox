// PLC Memory - Data Tables
// Konomi IgnAIte Virtual PLC

class PLCMemory {
  constructor() {
    // Data areas (Allen-Bradley style)
    this.data = {
      I: new Uint8Array(256),   // Input image
      O: new Uint8Array(256),   // Output image
      B: new Uint8Array(256),   // Bit storage
      N: new Int16Array(256),   // Integer storage
      F: new Float32Array(64),  // Float storage
      AI: new Int16Array(32),   // Analog inputs
      AO: new Int16Array(16),   // Analog outputs
      ST: new Uint8Array(256)   // String storage
    };

    // Timer storage
    this.timers = {};

    // Counter storage
    this.counters = {};

    // Control storage
    this.controls = {};
  }

  // Bit operations
  readBit(area, byte, bit) {
    const data = this.data[area];
    if (!data || byte >= data.length) return false;
    return ((data[byte] >> bit) & 1) === 1;
  }

  writeBit(area, byte, bit, value) {
    const data = this.data[area];
    if (!data || byte >= data.length) return;
    if (value) data[byte] |= (1 << bit);
    else data[byte] &= ~(1 << bit);
  }

  // Integer operations
  getInt(area, address) {
    if (area === 'N') return this.data.N[address];
    if (area === 'AI') return this.data.AI[address];
    if (area === 'AO') return this.data.AO[address];
    return 0;
  }

  setInt(area, address, value) {
    if (area === 'N') this.data.N[address] = value;
    if (area === 'AI') this.data.AI[address] = value;
    if (area === 'AO') this.data.AO[address] = value;
  }

  // Float operations
  getFloat(address) {
    return this.data.F[address];
  }

  setFloat(address, value) {
    this.data.F[address] = value;
  }

  // Timer operations
  getTimer(address) {
    if (!this.timers[address]) {
      this.timers[address] = {
        PRE: 1000,  // Preset (ms)
        ACC: 0,     // Accumulated
        EN: false,  // Enable
        TT: false,  // Timer timing
        DN: false   // Done
      };
    }
    return this.timers[address];
  }

  setTimer(address, timer) {
    this.timers[address] = timer;
  }

  // Counter operations
  getCounter(address) {
    if (!this.counters[address]) {
      this.counters[address] = {
        PRE: 10,    // Preset
        ACC: 0,     // Accumulated
        CU: false,  // Count up enable
        CD: false,  // Count down enable
        DN: false,  // Done
        OV: false,  // Overflow
        UN: false   // Underflow
      };
    }
    return this.counters[address];
  }

  setCounter(address, counter) {
    this.counters[address] = counter;
  }

  // Control operations (for sequencers, etc.)
  getControl(address) {
    if (!this.controls[address]) {
      this.controls[address] = {
        LEN: 0,     // Length
        POS: 0,     // Position
        EN: false,  // Enable
        DN: false,  // Done
        ER: false,  // Error
        FD: false   // Found
      };
    }
    return this.controls[address];
  }

  setControl(address, control) {
    this.controls[address] = control;
  }

  // Bulk copy
  copyArea(srcArea, srcOffset, destArea, destOffset, length) {
    const src = this.data[srcArea];
    const dest = this.data[destArea];
    if (!src || !dest) return;

    for (let i = 0; i < length && srcOffset + i < src.length && destOffset + i < dest.length; i++) {
      dest[destOffset + i] = src[srcOffset + i];
    }
  }

  // Clear area
  clearArea(area) {
    if (this.data[area]) {
      this.data[area].fill(0);
    }
  }

  // Clear all
  clearAll() {
    Object.values(this.data).forEach(arr => arr.fill(0));
    this.timers = {};
    this.counters = {};
    this.controls = {};
  }

  // Export state
  exportState() {
    const state = {};
    for (const [key, arr] of Object.entries(this.data)) {
      state[key] = Array.from(arr);
    }
    state.timers = { ...this.timers };
    state.counters = { ...this.counters };
    state.controls = { ...this.controls };
    return state;
  }

  // Import state
  importState(state) {
    for (const [key, arr] of Object.entries(state)) {
      if (this.data[key] && Array.isArray(arr)) {
        this.data[key].set(arr);
      }
    }
    if (state.timers) this.timers = state.timers;
    if (state.counters) this.counters = state.counters;
    if (state.controls) this.controls = state.controls;
  }

  // Debug dump
  dump(area) {
    const data = this.data[area];
    if (!data) return 'Unknown area';

    let output = `${area} Memory Dump:\n`;
    for (let i = 0; i < Math.min(16, data.length); i++) {
      output += `${i.toString().padStart(3)}: ${data[i].toString(16).padStart(4, '0')} (${data[i]})\n`;
    }
    return output;
  }
}

// Export
if (typeof module !== 'undefined') module.exports = PLCMemory;
if (typeof window !== 'undefined') window.PLCMemory = PLCMemory;
