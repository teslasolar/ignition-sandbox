// PLC I/O - Input/Output Simulation Layer
// Konomi IgnAIte Virtual PLC

class PLCIO {
  constructor() {
    // Simulated I/O modules
    this.inputModules = [
      { slot: 0, type: 'DI16', points: 16, data: new Uint16Array(1) },
      { slot: 1, type: 'AI8', points: 8, data: new Int16Array(8) }
    ];

    this.outputModules = [
      { slot: 2, type: 'DO16', points: 16, data: new Uint16Array(1) },
      { slot: 3, type: 'AO4', points: 4, data: new Int16Array(4) }
    ];

    // Simulation sources
    this.simulations = {};
    this.callbacks = { input: [], output: [] };
  }

  // Read all inputs into memory
  readInputs(memory) {
    // Digital inputs -> I:0.x
    const di = this.inputModules[0];
    memory.data.I.set(new Uint8Array(di.data.buffer), 0);

    // Analog inputs -> AI:0.x
    const ai = this.inputModules[1];
    for (let i = 0; i < ai.points; i++) {
      memory.setInt('AI', i * 2, ai.data[i]);
    }

    // Notify callbacks
    this.callbacks.input.forEach(cb => cb(memory));
  }

  // Write all outputs from memory
  writeOutputs(memory) {
    // Digital outputs <- O:0.x
    const doMod = this.outputModules[0];
    doMod.data.set(new Uint16Array(memory.data.O.buffer.slice(0, 2)), 0);

    // Analog outputs <- AO:0.x
    const aoMod = this.outputModules[1];
    for (let i = 0; i < aoMod.points; i++) {
      aoMod.data[i] = memory.getInt('AO', i * 2);
    }

    // Notify callbacks
    this.callbacks.output.forEach(cb => cb(memory));
  }

  // Set digital input bit
  setDigitalInput(slot, bit, value) {
    const mod = this.inputModules.find(m => m.slot === slot && m.type.startsWith('DI'));
    if (mod && bit < mod.points) {
      if (value) mod.data[0] |= (1 << bit);
      else mod.data[0] &= ~(1 << bit);
    }
  }

  // Get digital output bit
  getDigitalOutput(slot, bit) {
    const mod = this.outputModules.find(m => m.slot === slot && m.type.startsWith('DO'));
    if (mod && bit < mod.points) {
      return (mod.data[0] >> bit) & 1;
    }
    return 0;
  }

  // Set analog input
  setAnalogInput(slot, channel, value) {
    const mod = this.inputModules.find(m => m.slot === slot && m.type.startsWith('AI'));
    if (mod && channel < mod.points) {
      mod.data[channel] = Math.max(-32768, Math.min(32767, Math.round(value)));
    }
  }

  // Get analog output
  getAnalogOutput(slot, channel) {
    const mod = this.outputModules.find(m => m.slot === slot && m.type.startsWith('AO'));
    if (mod && channel < mod.points) {
      return mod.data[channel];
    }
    return 0;
  }

  // Add simulation source
  addSimulation(name, config) {
    this.simulations[name] = {
      type: config.type || 'sine',
      slot: config.slot,
      channel: config.channel,
      min: config.min || 0,
      max: config.max || 32767,
      period: config.period || 10000,
      phase: 0
    };
  }

  // Update simulations
  updateSimulations(deltaTime) {
    for (const [name, sim] of Object.entries(this.simulations)) {
      sim.phase = (sim.phase + deltaTime) % sim.period;
      const t = sim.phase / sim.period;

      let value;
      switch (sim.type) {
        case 'sine':
          value = sim.min + (sim.max - sim.min) * (Math.sin(t * Math.PI * 2) + 1) / 2;
          break;
        case 'ramp':
          value = sim.min + (sim.max - sim.min) * t;
          break;
        case 'square':
          value = t < 0.5 ? sim.max : sim.min;
          break;
        case 'random':
          value = sim.min + Math.random() * (sim.max - sim.min);
          break;
        default:
          value = sim.min;
      }

      this.setAnalogInput(sim.slot, sim.channel, value);
    }
  }

  // Register callback
  onInput(callback) {
    this.callbacks.input.push(callback);
  }

  onOutput(callback) {
    this.callbacks.output.push(callback);
  }

  // Get I/O status
  getStatus() {
    return {
      inputs: this.inputModules.map(m => ({
        slot: m.slot,
        type: m.type,
        data: Array.from(m.data)
      })),
      outputs: this.outputModules.map(m => ({
        slot: m.slot,
        type: m.type,
        data: Array.from(m.data)
      }))
    };
  }
}

// Export
if (typeof module !== 'undefined') module.exports = PLCIO;
if (typeof window !== 'undefined') window.PLCIO = PLCIO;
