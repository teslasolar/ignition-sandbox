// L5K Code Generator - Generates JavaScript runtime from AST
// Konomi IgnAIte Virtual PLC

class L5KCodeGen {
  constructor(ast) {
    this.ast = ast;
    this.output = [];
  }

  generate() {
    this.output = [];
    this.emitHeader();
    this.emitTags();
    this.emitRoutines();
    this.emitFooter();
    return this.output.join('\n');
  }

  emitHeader() {
    this.output.push('// Generated PLC Runtime');
    this.output.push('// Konomi IgnAIte L5K Compiler');
    this.output.push('');
    this.output.push('const PLC_Runtime = {');
    this.output.push('  memory: { I: new Uint8Array(256), O: new Uint8Array(256), B: new Uint8Array(256) },');
    this.output.push('  timers: {},');
    this.output.push('  counters: {},');
    this.output.push('  tags: {},');
    this.output.push('');
  }

  emitTags() {
    this.output.push('  // Tag Definitions');
    for (const tag of this.ast.tags) {
      const addr = `{ area: '${tag.address.area}', byte: ${tag.address.byte}, bit: ${tag.address.bit} }`;
      this.output.push(`  // ${tag.name}: ${tag.dataType} @ ${tag.address.area}:${tag.address.byte}/${tag.address.bit}`);
    }
    this.output.push('');

    // Generate tag map
    this.output.push('  tagMap: {');
    for (const tag of this.ast.tags) {
      this.output.push(`    '${tag.name}': { area: '${tag.address.area}', byte: ${tag.address.byte}, bit: ${tag.address.bit} },`);
    }
    this.output.push('  },');
    this.output.push('');

    // Helper functions
    this.output.push('  readBit(tag) {');
    this.output.push('    const t = this.tagMap[tag];');
    this.output.push('    if (!t) return false;');
    this.output.push('    return (this.memory[t.area][t.byte] >> t.bit) & 1;');
    this.output.push('  },');
    this.output.push('');
    this.output.push('  writeBit(tag, val) {');
    this.output.push('    const t = this.tagMap[tag];');
    this.output.push('    if (!t) return;');
    this.output.push('    if (val) this.memory[t.area][t.byte] |= (1 << t.bit);');
    this.output.push('    else this.memory[t.area][t.byte] &= ~(1 << t.bit);');
    this.output.push('  },');
    this.output.push('');
  }

  emitRoutines() {
    for (const routine of this.ast.routines) {
      this.output.push(`  // Routine: ${routine.name}`);
      this.output.push(`  ${routine.name}() {`);

      for (let i = 0; i < routine.rungs.length; i++) {
        const rung = routine.rungs[i];
        this.emitRung(rung, i);
      }

      this.output.push('  },');
      this.output.push('');
    }
  }

  emitRung(rung, index) {
    this.output.push(`    // Rung ${index}`);

    if (!rung.action) {
      this.output.push('    // (no action)');
      return;
    }

    // Build condition expression
    let condition = 'true';
    if (rung.conditions.length > 0) {
      const parts = rung.conditions.map(c => {
        if (c.instruction === 'XIC') return `this.readBit('${c.tag}')`;
        if (c.instruction === 'XIO') return `!this.readBit('${c.tag}')`;
        return 'true';
      });
      condition = parts.join(' && ');
    }

    // Emit action based on instruction
    const action = rung.action;
    switch (action.instruction) {
      case 'OTE':
        this.output.push(`    this.writeBit('${action.tag}', ${condition});`);
        break;
      case 'OTL':
        this.output.push(`    if (${condition}) this.writeBit('${action.tag}', 1);`);
        break;
      case 'OTU':
        this.output.push(`    if (${condition}) this.writeBit('${action.tag}', 0);`);
        break;
      case 'TON':
        this.emitTimer(action, condition, 'TON');
        break;
      case 'CTU':
        this.emitCounter(action, condition, 'CTU');
        break;
      default:
        this.output.push(`    // TODO: ${action.instruction} ${action.tag}`);
    }
  }

  emitTimer(action, condition, type) {
    const preset = action.params?.preset || 1000;
    this.output.push(`    // Timer ${type}: ${action.tag}`);
    this.output.push(`    if (!this.timers['${action.tag}']) this.timers['${action.tag}'] = { acc: 0, dn: false };`);
    this.output.push(`    const t_${action.tag} = this.timers['${action.tag}'];`);
    this.output.push(`    if (${condition}) {`);
    this.output.push(`      t_${action.tag}.acc += 100; // Scan time`);
    this.output.push(`      if (t_${action.tag}.acc >= ${preset}) t_${action.tag}.dn = true;`);
    this.output.push(`    } else {`);
    this.output.push(`      t_${action.tag}.acc = 0;`);
    this.output.push(`      t_${action.tag}.dn = false;`);
    this.output.push(`    }`);
  }

  emitCounter(action, condition, type) {
    const preset = action.params?.preset || 10;
    this.output.push(`    // Counter ${type}: ${action.tag}`);
    this.output.push(`    if (!this.counters['${action.tag}']) this.counters['${action.tag}'] = { acc: 0, dn: false, prev: false };`);
    this.output.push(`    const c_${action.tag} = this.counters['${action.tag}'];`);
    this.output.push(`    const cond_${action.tag} = ${condition};`);
    this.output.push(`    if (cond_${action.tag} && !c_${action.tag}.prev) {`);
    this.output.push(`      c_${action.tag}.acc++;`);
    this.output.push(`      if (c_${action.tag}.acc >= ${preset}) c_${action.tag}.dn = true;`);
    this.output.push(`    }`);
    this.output.push(`    c_${action.tag}.prev = cond_${action.tag};`);
  }

  emitFooter() {
    this.output.push('  // Main scan cycle');
    this.output.push('  scan() {');
    for (const routine of this.ast.routines) {
      this.output.push(`    this.${routine.name}();`);
    }
    this.output.push('  }');
    this.output.push('};');
    this.output.push('');
    this.output.push('// Export');
    this.output.push("if (typeof module !== 'undefined') module.exports = PLC_Runtime;");
    this.output.push("if (typeof window !== 'undefined') window.PLC_Runtime = PLC_Runtime;");
  }
}

// Export
if (typeof module !== 'undefined') module.exports = L5KCodeGen;
if (typeof window !== 'undefined') window.L5KCodeGen = L5KCodeGen;
