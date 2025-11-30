// L5K Parser - Generates AST from tokens
// Konomi IgnAIte Virtual PLC

class L5KParser {
  constructor(tokens) {
    this.tokens = tokens.filter(t => t.type !== 'NL' && t.type !== 'COMMENT');
    this.pos = 0;
    this.ast = { type: 'Program', routines: [], tags: [] };
  }

  parse() {
    while (!this.isEOF()) {
      const token = this.current();

      if (token.type === 'KEYWORD') {
        switch (token.value) {
          case 'ROUTINE':
            this.ast.routines.push(this.parseRoutine());
            break;
          case 'DATA':
            this.ast.tags.push(...this.parseData());
            break;
          default:
            this.advance();
        }
      } else {
        this.advance();
      }
    }

    return this.ast;
  }

  parseRoutine() {
    this.expect('KEYWORD', 'ROUTINE');
    const name = this.expect('IDENT').value;
    const rungs = [];

    while (!this.isEOF() && !(this.current().type === 'KEYWORD' && this.current().value === 'END_ROUTINE')) {
      if (this.current().type === 'INSTR') {
        rungs.push(this.parseRung());
      } else {
        this.advance();
      }
    }

    this.expect('KEYWORD', 'END_ROUTINE');
    return { type: 'Routine', name, rungs };
  }

  parseRung() {
    const conditions = [];
    let action = null;

    while (this.current().type === 'INSTR') {
      const instr = this.current().value;
      this.advance();

      if (!this.isEOF() && this.current().type === 'IDENT') {
        const tag = this.current().value;
        this.advance();

        const node = { instruction: instr, tag };

        // Check for timer/counter parameters
        if (['TON', 'TOF', 'RTO', 'CTU', 'CTD'].includes(instr)) {
          node.params = this.parseInstructionParams();
        }

        if (['XIC', 'XIO'].includes(instr)) {
          conditions.push(node);
        } else {
          action = node;
        }
      }
    }

    return { type: 'Rung', conditions, action };
  }

  parseInstructionParams() {
    const params = {};
    // Simple param parsing: look for numeric values
    while (this.current().type === 'NUM') {
      const val = this.current().value;
      this.advance();
      if (!params.preset) params.preset = val;
      else if (!params.accum) params.accum = val;
    }
    return params;
  }

  parseData() {
    this.expect('KEYWORD', 'DATA');
    const tags = [];

    while (!this.isEOF() && !(this.current().type === 'KEYWORD' && this.current().value === 'END_DATA')) {
      if (this.current().type === 'IDENT') {
        tags.push(this.parseTag());
      } else {
        this.advance();
      }
    }

    this.expect('KEYWORD', 'END_DATA');
    return tags;
  }

  parseTag() {
    const name = this.expect('IDENT').value;
    this.expect('COLON');
    const dataType = this.expect('KEYWORD').value;
    this.expect('ASSIGN');

    // Parse address: I:0/0 or O:0/0
    const area = this.expect('IDENT').value;
    this.expect('COLON');
    const byte = this.expect('NUM').value;
    this.expect('SLASH');
    const bit = this.expect('NUM').value;

    return { type: 'Tag', name, dataType, address: { area, byte, bit } };
  }

  current() {
    return this.tokens[this.pos] || { type: 'EOF' };
  }

  advance() {
    return this.tokens[this.pos++];
  }

  expect(type, value) {
    const token = this.current();
    if (token.type !== type || (value && token.value !== value)) {
      throw new Error(`Expected ${type}${value ? ` '${value}'` : ''}, got ${token.type} '${token.value}'`);
    }
    return this.advance();
  }

  isEOF() {
    return this.pos >= this.tokens.length || this.current().type === 'EOF';
  }
}

// Export
if (typeof module !== 'undefined') module.exports = L5KParser;
if (typeof window !== 'undefined') window.L5KParser = L5KParser;
