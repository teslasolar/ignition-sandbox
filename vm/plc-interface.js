// VM-PLC Interface - Connects x86 VM to Virtual PLC
// Konomi IgnAIte

class VMPLCInterface {
  constructor(vm, plc) {
    this.vm = vm;
    this.plc = plc;
    this.ioBase = 0x300;  // I/O port base address
    this.irq = 5;
    this.connected = false;
  }

  // Initialize interface
  init() {
    if (!this.vm || !this.plc) return false;

    // Register I/O port handlers with VM
    this.registerPorts();
    this.connected = true;
    console.log('VM-PLC interface initialized at I/O base 0x' + this.ioBase.toString(16));
    return true;
  }

  // Register I/O ports
  registerPorts() {
    // Port 0x300: Digital inputs (read)
    // Port 0x301: Digital outputs (write)
    // Port 0x302-0x303: Analog input (read, 16-bit)
    // Port 0x304-0x305: Analog output (write, 16-bit)
    // Port 0x306: Status/Control register
    // Port 0x307: Command register

    const ports = {
      [this.ioBase]: { read: () => this.readDigitalInputs(), write: null },
      [this.ioBase + 1]: { read: () => this.readDigitalOutputs(), write: (v) => this.writeDigitalOutputs(v) },
      [this.ioBase + 2]: { read: () => this.readAnalogInput(0) & 0xFF, write: null },
      [this.ioBase + 3]: { read: () => (this.readAnalogInput(0) >> 8) & 0xFF, write: null },
      [this.ioBase + 4]: { read: null, write: (v) => this.writeAnalogLow(v) },
      [this.ioBase + 5]: { read: null, write: (v) => this.writeAnalogHigh(v) },
      [this.ioBase + 6]: { read: () => this.getStatus(), write: (v) => this.setControl(v) },
      [this.ioBase + 7]: { read: null, write: (v) => this.execCommand(v) }
    };

    // If VM has port registration, use it
    if (this.vm.registerPort) {
      for (const [port, handlers] of Object.entries(ports)) {
        this.vm.registerPort(parseInt(port), handlers.read, handlers.write);
      }
    }

    return ports;
  }

  // Read digital inputs from PLC
  readDigitalInputs() {
    if (!this.plc?.memory) return 0;
    return this.plc.memory.data.I[0];
  }

  // Read digital outputs from PLC
  readDigitalOutputs() {
    if (!this.plc?.memory) return 0;
    return this.plc.memory.data.O[0];
  }

  // Write digital outputs to PLC
  writeDigitalOutputs(value) {
    if (!this.plc?.memory) return;
    this.plc.memory.data.O[0] = value & 0xFF;
  }

  // Read analog input
  readAnalogInput(channel) {
    if (!this.plc?.memory) return 0;
    return this.plc.memory.data.AI[channel] || 0;
  }

  // Analog output buffer
  analogBuffer = { low: 0, high: 0 };

  writeAnalogLow(value) {
    this.analogBuffer.low = value & 0xFF;
  }

  writeAnalogHigh(value) {
    this.analogBuffer.high = value & 0xFF;
    // Write full 16-bit value to PLC
    const fullValue = this.analogBuffer.low | (this.analogBuffer.high << 8);
    if (this.plc?.memory) {
      this.plc.memory.data.AO[0] = fullValue;
    }
  }

  // Status register
  getStatus() {
    let status = 0;
    if (this.connected) status |= 0x01;           // Bit 0: Connected
    if (this.plc?.cpu?.mode === 'RUN') status |= 0x02;  // Bit 1: PLC Running
    if (this.plc?.cpu?.faultCode) status |= 0x80;       // Bit 7: Fault
    return status;
  }

  // Control register
  setControl(value) {
    if (value & 0x01) this.plc?.cpu?.run();   // Bit 0: Start PLC
    if (value & 0x02) this.plc?.cpu?.stop();  // Bit 1: Stop PLC
    if (value & 0x80) this.plc?.cpu?.clearFault(); // Bit 7: Clear fault
  }

  // Command execution
  execCommand(cmd) {
    switch (cmd) {
      case 0x00: // NOP
        break;
      case 0x01: // Single scan
        this.plc?.cpu?.scan();
        break;
      case 0x02: // Reset memory
        this.plc?.memory?.clearAll();
        break;
      case 0x10: // Trigger IRQ (if VM supports)
        if (this.vm.triggerIRQ) this.vm.triggerIRQ(this.irq);
        break;
    }
  }

  // Disconnect
  disconnect() {
    this.connected = false;
  }

  // Get interface status
  getInfo() {
    return {
      connected: this.connected,
      ioBase: '0x' + this.ioBase.toString(16),
      irq: this.irq,
      plcMode: this.plc?.cpu?.mode || 'UNKNOWN'
    };
  }
}

// Export
if (typeof module !== 'undefined') module.exports = VMPLCInterface;
if (typeof window !== 'undefined') window.VMPLCInterface = VMPLCInterface;
