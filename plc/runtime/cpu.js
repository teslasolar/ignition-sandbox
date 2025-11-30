// PLC CPU - Ladder Logic Executor
// Konomi IgnAIte Virtual PLC

class PLCCPU {
  constructor(memory, io) {
    this.memory = memory;
    this.io = io;
    this.program = [];
    this.scanTime = 0;
    this.scanCount = 0;
    this.mode = 'STOP'; // STOP, RUN, PROGRAM, FAULT
    this.faultCode = 0;
    this.watchdog = 1000; // ms
  }

  // Load compiled program
  load(program) {
    this.program = program;
    this.scanCount = 0;
    this.faultCode = 0;
    this.mode = 'PROGRAM';
  }

  // Start execution
  run() {
    if (this.mode === 'FAULT') return false;
    if (this.program.length === 0) {
      this.fault(1, 'No program loaded');
      return false;
    }
    this.mode = 'RUN';
    return true;
  }

  // Stop execution
  stop() {
    this.mode = 'STOP';
  }

  // Execute one scan cycle
  scan() {
    if (this.mode !== 'RUN') return;

    const startTime = performance.now();

    try {
      // Input scan
      this.io.readInputs(this.memory);

      // Execute program
      for (const rung of this.program) {
        this.executeRung(rung);
      }

      // Output scan
      this.io.writeOutputs(this.memory);

      this.scanCount++;
      this.scanTime = performance.now() - startTime;

      // Watchdog check
      if (this.scanTime > this.watchdog) {
        this.fault(2, 'Watchdog timeout');
      }
    } catch (err) {
      this.fault(99, err.message);
    }
  }

  // Execute single rung
  executeRung(rung) {
    // Evaluate conditions (AND logic across rung)
    let rungState = true;

    for (const condition of rung.conditions) {
      const bitValue = this.readBit(condition.address);

      switch (condition.instruction) {
        case 'XIC': // Examine If Closed
          rungState = rungState && bitValue;
          break;
        case 'XIO': // Examine If Open
          rungState = rungState && !bitValue;
          break;
      }
    }

    // Execute action based on rung state
    if (rung.action) {
      this.executeAction(rung.action, rungState);
    }
  }

  // Execute output action
  executeAction(action, rungState) {
    switch (action.instruction) {
      case 'OTE': // Output Energize
        this.writeBit(action.address, rungState);
        break;
      case 'OTL': // Output Latch
        if (rungState) this.writeBit(action.address, true);
        break;
      case 'OTU': // Output Unlatch
        if (rungState) this.writeBit(action.address, false);
        break;
      case 'TON': // Timer On-Delay
        this.executeTimer(action, rungState, 'TON');
        break;
      case 'TOF': // Timer Off-Delay
        this.executeTimer(action, rungState, 'TOF');
        break;
      case 'CTU': // Count Up
        this.executeCounter(action, rungState, 'CTU');
        break;
      case 'CTD': // Count Down
        this.executeCounter(action, rungState, 'CTD');
        break;
      case 'RES': // Reset
        this.resetTimerCounter(action.address);
        break;
    }
  }

  // Timer execution
  executeTimer(action, rungState, type) {
    const timer = this.memory.getTimer(action.address);

    if (type === 'TON') {
      if (rungState) {
        if (!timer.EN) {
          timer.EN = true;
          timer.TT = true;
        }
        timer.ACC += this.scanTime;
        if (timer.ACC >= timer.PRE) {
          timer.DN = true;
          timer.TT = false;
          timer.ACC = timer.PRE;
        }
      } else {
        timer.EN = false;
        timer.TT = false;
        timer.DN = false;
        timer.ACC = 0;
      }
    }

    this.memory.setTimer(action.address, timer);
  }

  // Counter execution
  executeCounter(action, rungState, type) {
    const counter = this.memory.getCounter(action.address);

    if (type === 'CTU') {
      if (rungState && !counter.CU) {
        counter.ACC++;
        if (counter.ACC >= counter.PRE) {
          counter.DN = true;
        }
      }
      counter.CU = rungState;
    }

    this.memory.setCounter(action.address, counter);
  }

  // Reset timer/counter
  resetTimerCounter(address) {
    if (this.memory.timers[address]) {
      this.memory.timers[address].ACC = 0;
      this.memory.timers[address].DN = false;
    }
    if (this.memory.counters[address]) {
      this.memory.counters[address].ACC = 0;
      this.memory.counters[address].DN = false;
    }
  }

  // Read bit from memory
  readBit(address) {
    return this.memory.readBit(address.area, address.byte, address.bit);
  }

  // Write bit to memory
  writeBit(address, value) {
    this.memory.writeBit(address.area, address.byte, address.bit, value);
  }

  // Enter fault state
  fault(code, message) {
    this.mode = 'FAULT';
    this.faultCode = code;
    this.faultMessage = message;
    console.error(`PLC FAULT ${code}: ${message}`);
  }

  // Clear fault
  clearFault() {
    if (this.mode === 'FAULT') {
      this.mode = 'STOP';
      this.faultCode = 0;
      this.faultMessage = '';
    }
  }

  // Get status
  getStatus() {
    return {
      mode: this.mode,
      scanTime: this.scanTime.toFixed(2),
      scanCount: this.scanCount,
      faultCode: this.faultCode,
      faultMessage: this.faultMessage || ''
    };
  }
}

// Export
if (typeof module !== 'undefined') module.exports = PLCCPU;
if (typeof window !== 'undefined') window.PLCCPU = PLCCPU;
