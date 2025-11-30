// VM Integration Layer - Unified interface for all VM components
// Konomi IgnAIte

const VMIntegration = {
  vm: null,
  plc: null,
  plcInterface: null,
  kernelLoader: null,
  bridge: null,

  // Initialize all components
  async init(config = {}) {
    console.log('Initializing VM Integration...');

    // Load PLC components
    if (window.PLCMemory) {
      this.plc = {
        memory: new PLCMemory(),
        io: window.PLCIO ? new PLCIO() : null,
        cpu: window.PLCCPU ? new PLCCPU(null, null) : null
      };
      if (this.plc.cpu) {
        this.plc.cpu.memory = this.plc.memory;
        this.plc.cpu.io = this.plc.io;
      }
    }

    // Load kernel loader
    if (window.KernelLoader) {
      this.kernelLoader = new KernelLoader();
    }

    // Initialize VM-PLC interface
    if (window.VMPLCInterface && this.plc) {
      this.plcInterface = new VMPLCInterface(this.vm, this.plc);
    }

    // Initialize gateway bridge
    if (window.GatewayBridge && this.plc) {
      this.bridge = new GatewayBridge(this.plc, null);
    }

    return this;
  },

  // Boot VM with kernel
  async bootKernel(kernelId = 'minimal') {
    if (!this.kernelLoader) {
      throw new Error('Kernel loader not available');
    }

    const image = await this.kernelLoader.createImage(kernelId);
    console.log(`Kernel '${kernelId}' loaded (${image.length} bytes)`);

    // If v86 emulator available, boot it
    if (this.vm?.loadBootSector) {
      await this.vm.loadBootSector(image);
    }

    return image;
  },

  // Start PLC
  startPLC() {
    if (this.plc?.cpu) {
      this.plc.cpu.run();
      return true;
    }
    return false;
  },

  // Stop PLC
  stopPLC() {
    if (this.plc?.cpu) {
      this.plc.cpu.stop();
      return true;
    }
    return false;
  },

  // Run single PLC scan
  scanPLC() {
    if (this.plc?.cpu) {
      this.plc.cpu.scan();
    }
  },

  // Connect VM to PLC
  connectVMPLC() {
    if (this.plcInterface) {
      return this.plcInterface.init();
    }
    return false;
  },

  // Get full status
  getStatus() {
    return {
      vm: this.vm ? 'loaded' : 'not loaded',
      plc: {
        memory: this.plc?.memory ? 'ready' : 'not ready',
        cpu: this.plc?.cpu?.getStatus() || null,
        io: this.plc?.io?.getStatus() || null
      },
      vmPLC: this.plcInterface?.getInfo() || null,
      kernel: this.kernelLoader?.current || null
    };
  },

  // Read PLC tag
  readTag(area, address, bit = null) {
    if (!this.plc?.memory) return null;
    if (bit !== null) {
      return this.plc.memory.readBit(area, address, bit);
    }
    return this.plc.memory.data[area]?.[address];
  },

  // Write PLC tag
  writeTag(area, address, value, bit = null) {
    if (!this.plc?.memory) return false;
    if (bit !== null) {
      this.plc.memory.writeBit(area, address, bit, value);
    } else if (this.plc.memory.data[area]) {
      this.plc.memory.data[area][address] = value;
    }
    return true;
  }
};

// Export
if (typeof module !== 'undefined') module.exports = VMIntegration;
if (typeof window !== 'undefined') window.VMIntegration = VMIntegration;
