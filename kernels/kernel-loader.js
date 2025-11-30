// Kernel Loader for Konomi IgnAIte
// Loads and assembles x86 kernels for v86-lite

class KernelLoader {
  constructor() {
    this.kernels = {
      minimal: { file: 'minimal.asm', size: 512, desc: 'Bare boot sector' },
      ignition: { file: 'ignition.asm', size: 512, desc: 'Gateway kernel' },
      full: { file: 'full.asm', size: 512, desc: 'Full OS with shell' }
    };
    this.current = null;
  }

  // List available kernels
  list() {
    return Object.entries(this.kernels).map(([id, k]) => ({
      id, ...k
    }));
  }

  // Load kernel source
  async loadSource(id) {
    const kernel = this.kernels[id];
    if (!kernel) throw new Error(`Unknown kernel: ${id}`);

    const response = await fetch(`kernels/${kernel.file}`);
    if (!response.ok) throw new Error(`Failed to load ${kernel.file}`);

    return await response.text();
  }

  // Simple x86 assembler for boot sectors
  // Supports basic instructions for demo
  assemble(source) {
    const binary = new Uint8Array(512);
    let offset = 0;

    const lines = source.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();

      // Skip comments and directives
      if (!trimmed || trimmed.startsWith(';') || trimmed.startsWith('[') || trimmed.startsWith('%')) continue;

      // Handle labels
      if (trimmed.endsWith(':')) continue;

      // Parse instructions (simplified)
      const parts = trimmed.split(/\s+/);
      const instr = parts[0].toLowerCase();

      // Basic instruction encoding
      switch (instr) {
        case 'cli': binary[offset++] = 0xFA; break;
        case 'sti': binary[offset++] = 0xFB; break;
        case 'hlt': binary[offset++] = 0xF4; break;
        case 'ret': binary[offset++] = 0xC3; break;
        case 'nop': binary[offset++] = 0x90; break;
        case 'xor':
          if (parts[1] === 'ax,' && parts[2] === 'ax') {
            binary[offset++] = 0x31; binary[offset++] = 0xC0;
          }
          break;
        case 'jmp':
          binary[offset++] = 0xEB; binary[offset++] = 0xFE; // infinite loop
          break;
        case 'db':
          // Data bytes - parse string or numbers
          const data = trimmed.substring(3).trim();
          if (data.startsWith("'")) {
            const str = data.slice(1, data.lastIndexOf("'"));
            for (const char of str) {
              binary[offset++] = char.charCodeAt(0);
            }
          }
          break;
        case 'times':
          // Fill with zeros until position
          break;
        case 'dw':
          if (parts[1] === '0xAA55') {
            binary[510] = 0x55;
            binary[511] = 0xAA;
          }
          break;
      }
    }

    // Ensure boot signature
    binary[510] = 0x55;
    binary[511] = 0xAA;

    return binary;
  }

  // Create bootable image
  async createImage(id) {
    const source = await this.loadSource(id);
    const binary = this.assemble(source);
    this.current = id;
    return binary;
  }

  // Get kernel info
  info(id) {
    return this.kernels[id] || null;
  }

  // Boot kernel in VM
  async boot(vm, id = 'minimal') {
    const image = await this.createImage(id);

    // If v86 instance, load boot sector
    if (vm && vm.loadBootSector) {
      await vm.loadBootSector(image);
    }

    return { kernel: id, image, size: image.length };
  }
}

// Export
if (typeof module !== 'undefined') module.exports = KernelLoader;
if (typeof window !== 'undefined') window.KernelLoader = KernelLoader;
