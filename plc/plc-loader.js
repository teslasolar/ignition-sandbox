// PLC Loader - Unified PLC system initialization
// Konomi IgnAIte

const PLCLoader = {
  components: {},
  initialized: false,

  // Load all PLC components
  async init() {
    if (this.initialized) return this;

    // Load scripts dynamically
    const scripts = [
      'compiler/lexer.js',
      'compiler/parser.js',
      'compiler/codegen.js',
      'runtime/cpu.js',
      'runtime/io.js',
      'runtime/memory.js',
      'gateway-bridge.js'
    ];

    for (const src of scripts) {
      await this.loadScript(`plc/${src}`);
    }

    // Initialize components
    this.components = {
      memory: new (window.PLCMemory || PLCMemory)(),
      io: new (window.PLCIO || PLCIO)(),
      cpu: null,
      bridge: null
    };

    this.components.cpu = new (window.PLCCPU || PLCCPU)(
      this.components.memory,
      this.components.io
    );

    this.components.bridge = new (window.GatewayBridge || GatewayBridge)(
      { memory: this.components.memory, cpu: this.components.cpu },
      null
    );

    this.initialized = true;
    console.log('PLC system initialized');
    return this;
  },

  // Load script helper
  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  },

  // Compile L5K program
  compile(source) {
    const lexer = new (window.L5KLexer || L5KLexer)(source);
    const tokens = lexer.tokenize();

    const parser = new (window.L5KParser || L5KParser)(tokens);
    const ast = parser.parse();

    const codegen = new (window.L5KCodeGen || L5KCodeGen)(ast);
    const code = codegen.generate();

    return { tokens, ast, code };
  },

  // Load and compile L5K file
  async loadProgram(path) {
    const res = await fetch(path);
    const source = await res.text();
    return this.compile(source);
  },

  // Run PLC
  run() {
    return this.components.cpu?.run();
  },

  // Stop PLC
  stop() {
    this.components.cpu?.stop();
  },

  // Single scan
  scan() {
    this.components.cpu?.scan();
  },

  // Get status
  getStatus() {
    return {
      initialized: this.initialized,
      cpu: this.components.cpu?.getStatus(),
      io: this.components.io?.getStatus()
    };
  },

  // Read I/O
  readInput(byte, bit) {
    return this.components.memory?.readBit('I', byte, bit);
  },

  writeOutput(byte, bit, value) {
    this.components.memory?.writeBit('O', byte, bit, value);
  },

  // Toggle input (for simulation)
  toggleInput(byte, bit) {
    const current = this.readInput(byte, bit);
    this.components.memory?.writeBit('I', byte, bit, !current);
  }
};

// Export
if (typeof module !== 'undefined') module.exports = PLCLoader;
if (typeof window !== 'undefined') window.PLCLoader = PLCLoader;
