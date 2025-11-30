// Gateway Bridge - Connects Virtual PLC to Ignition Gateway
// Konomi IgnAIte Virtual PLC

class GatewayBridge {
  constructor(plc, gateway) {
    this.plc = plc;
    this.gateway = gateway;
    this.tagMappings = [];
    this.pollInterval = null;
    this.connected = false;
    this.stats = {
      reads: 0,
      writes: 0,
      errors: 0
    };
  }

  // Initialize connection to gateway
  async connect(config = {}) {
    this.config = {
      host: config.host || 'localhost',
      port: config.port || 8088,
      pollRate: config.pollRate || 100,
      deviceName: config.deviceName || 'VirtualPLC',
      ...config
    };

    try {
      // In browser environment, use WebSocket or fetch to gateway
      // For now, simulate connection
      this.connected = true;
      console.log(`Gateway Bridge connected to ${this.config.host}:${this.config.port}`);
      return true;
    } catch (err) {
      this.stats.errors++;
      console.error('Gateway connection failed:', err);
      return false;
    }
  }

  // Disconnect from gateway
  disconnect() {
    this.stopPolling();
    this.connected = false;
    console.log('Gateway Bridge disconnected');
  }

  // Add tag mapping: PLC address <-> Gateway tag path
  addTagMapping(plcAddress, gatewayPath, options = {}) {
    this.tagMappings.push({
      plc: plcAddress,        // e.g., { area: 'I', byte: 0, bit: 0 }
      gateway: gatewayPath,   // e.g., '[VirtualPLC]StartButton'
      direction: options.direction || 'read', // 'read', 'write', 'both'
      scale: options.scale || 1,
      offset: options.offset || 0,
      dataType: options.dataType || 'BOOL'
    });
  }

  // Load tag mappings from configuration
  loadMappings(mappings) {
    this.tagMappings = mappings.map(m => ({
      plc: m.plc,
      gateway: m.gateway,
      direction: m.direction || 'read',
      scale: m.scale || 1,
      offset: m.offset || 0,
      dataType: m.dataType || 'BOOL'
    }));
  }

  // Start polling/sync
  startPolling() {
    if (this.pollInterval) return;

    this.pollInterval = setInterval(() => {
      this.sync();
    }, this.config.pollRate);

    console.log(`Polling started at ${this.config.pollRate}ms`);
  }

  // Stop polling
  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  // Sync PLC <-> Gateway
  sync() {
    if (!this.connected || !this.plc) return;

    for (const mapping of this.tagMappings) {
      try {
        if (mapping.direction === 'read' || mapping.direction === 'both') {
          this.readFromPLC(mapping);
        }
        if (mapping.direction === 'write' || mapping.direction === 'both') {
          this.writeToGateway(mapping);
        }
      } catch (err) {
        this.stats.errors++;
      }
    }
  }

  // Read value from PLC
  readFromPLC(mapping) {
    const { area, byte, bit } = mapping.plc;
    let value;

    if (mapping.dataType === 'BOOL') {
      value = this.plc.memory.readBit(area, byte, bit);
    } else if (mapping.dataType === 'INT') {
      value = this.plc.memory.getInt(area, byte);
      value = value * mapping.scale + mapping.offset;
    } else if (mapping.dataType === 'REAL') {
      value = this.plc.memory.getFloat(byte);
      value = value * mapping.scale + mapping.offset;
    }

    this.stats.reads++;
    return { path: mapping.gateway, value, quality: 'Good' };
  }

  // Write value to gateway (simulated)
  writeToGateway(mapping) {
    const value = this.readFromPLC(mapping);

    // In real implementation, send to gateway via OPC-UA or API
    // For simulation, emit event
    if (this.onTagUpdate) {
      this.onTagUpdate(value);
    }

    this.stats.writes++;
  }

  // Handle write from gateway to PLC
  handleGatewayWrite(tagPath, value) {
    const mapping = this.tagMappings.find(m => m.gateway === tagPath);
    if (!mapping || mapping.direction === 'read') return false;

    const { area, byte, bit } = mapping.plc;

    if (mapping.dataType === 'BOOL') {
      this.plc.memory.writeBit(area, byte, bit, !!value);
    } else if (mapping.dataType === 'INT') {
      const scaled = (value - mapping.offset) / mapping.scale;
      this.plc.memory.setInt(area, byte, Math.round(scaled));
    } else if (mapping.dataType === 'REAL') {
      const scaled = (value - mapping.offset) / mapping.scale;
      this.plc.memory.setFloat(byte, scaled);
    }

    return true;
  }

  // Generate Ignition tag export
  generateTagExport() {
    const tags = this.tagMappings.map(m => ({
      name: m.gateway.split('/').pop(),
      tagType: 'OpcTag',
      valueSource: 'opc',
      opcItemPath: `ns=1;s=${this.config.deviceName}/${m.plc.area}:${m.plc.byte}/${m.plc.bit}`,
      opcServer: 'Ignition OPC UA Server',
      dataType: m.dataType === 'BOOL' ? 'Boolean' : m.dataType === 'INT' ? 'Int2' : 'Float4',
      value: m.dataType === 'BOOL' ? false : 0
    }));

    return { tags };
  }

  // Get bridge status
  getStatus() {
    return {
      connected: this.connected,
      config: this.config,
      mappings: this.tagMappings.length,
      stats: this.stats
    };
  }
}

// Export
if (typeof module !== 'undefined') module.exports = GatewayBridge;
if (typeof window !== 'undefined') window.GatewayBridge = GatewayBridge;
