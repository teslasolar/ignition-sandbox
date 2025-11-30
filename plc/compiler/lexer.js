// L5K Lexer - Tokenizes Allen-Bradley Logix5000 programs
// Konomi IgnAIte Virtual PLC

class L5KLexer {
  constructor(source) {
    this.source = source;
    this.pos = 0;
    this.tokens = [];
  }

  static TokenTypes = {
    KEYWORD: 'KEYWORD',     // ROUTINE, END_ROUTINE, DATA, END_DATA
    INSTRUCTION: 'INSTR',   // XIC, XIO, OTE, OTL, OTU, TON, CTU, etc.
    IDENTIFIER: 'IDENT',    // Tag names, routine names
    NUMBER: 'NUM',          // Numeric literals
    COLON: 'COLON',
    ASSIGN: 'ASSIGN',       // :=
    SLASH: 'SLASH',
    NEWLINE: 'NL',
    COMMENT: 'COMMENT',
    STRING: 'STRING',
    EOF: 'EOF'
  };

  static Keywords = ['ROUTINE', 'END_ROUTINE', 'DATA', 'END_DATA', 'PROGRAM', 'END_PROGRAM', 'TASK', 'TAG', 'BOOL', 'INT', 'DINT', 'REAL', 'TIMER', 'COUNTER'];
  static Instructions = ['XIC', 'XIO', 'OTE', 'OTL', 'OTU', 'TON', 'TOF', 'RTO', 'CTU', 'CTD', 'RES', 'ADD', 'SUB', 'MUL', 'DIV', 'MOV', 'CMP', 'EQU', 'NEQ', 'GRT', 'LES', 'GEQ', 'LEQ', 'JSR', 'RET', 'JMP', 'LBL', 'AFI', 'NOP'];

  tokenize() {
    while (this.pos < this.source.length) {
      this.skipWhitespace();
      if (this.pos >= this.source.length) break;

      const char = this.source[this.pos];

      // Comment
      if (char === ';') {
        this.readComment();
        continue;
      }

      // Newline
      if (char === '\n') {
        this.tokens.push({ type: L5KLexer.TokenTypes.NEWLINE });
        this.pos++;
        continue;
      }

      // Symbols
      if (char === ':') {
        if (this.source[this.pos + 1] === '=') {
          this.tokens.push({ type: L5KLexer.TokenTypes.ASSIGN });
          this.pos += 2;
        } else {
          this.tokens.push({ type: L5KLexer.TokenTypes.COLON });
          this.pos++;
        }
        continue;
      }

      if (char === '/') {
        this.tokens.push({ type: L5KLexer.TokenTypes.SLASH });
        this.pos++;
        continue;
      }

      // String
      if (char === '"' || char === "'") {
        this.readString(char);
        continue;
      }

      // Number
      if (/[0-9]/.test(char)) {
        this.readNumber();
        continue;
      }

      // Identifier/Keyword/Instruction
      if (/[a-zA-Z_]/.test(char)) {
        this.readIdentifier();
        continue;
      }

      this.pos++;
    }

    this.tokens.push({ type: L5KLexer.TokenTypes.EOF });
    return this.tokens;
  }

  skipWhitespace() {
    while (this.pos < this.source.length && /[ \t\r]/.test(this.source[this.pos])) {
      this.pos++;
    }
  }

  readComment() {
    let value = '';
    this.pos++; // Skip ;
    while (this.pos < this.source.length && this.source[this.pos] !== '\n') {
      value += this.source[this.pos++];
    }
    this.tokens.push({ type: L5KLexer.TokenTypes.COMMENT, value: value.trim() });
  }

  readString(quote) {
    let value = '';
    this.pos++; // Skip opening quote
    while (this.pos < this.source.length && this.source[this.pos] !== quote) {
      value += this.source[this.pos++];
    }
    this.pos++; // Skip closing quote
    this.tokens.push({ type: L5KLexer.TokenTypes.STRING, value });
  }

  readNumber() {
    let value = '';
    while (this.pos < this.source.length && /[0-9.]/.test(this.source[this.pos])) {
      value += this.source[this.pos++];
    }
    this.tokens.push({ type: L5KLexer.TokenTypes.NUMBER, value: parseFloat(value) });
  }

  readIdentifier() {
    let value = '';
    while (this.pos < this.source.length && /[a-zA-Z0-9_]/.test(this.source[this.pos])) {
      value += this.source[this.pos++];
    }

    const upper = value.toUpperCase();
    if (L5KLexer.Keywords.includes(upper)) {
      this.tokens.push({ type: L5KLexer.TokenTypes.KEYWORD, value: upper });
    } else if (L5KLexer.Instructions.includes(upper)) {
      this.tokens.push({ type: L5KLexer.TokenTypes.INSTRUCTION, value: upper });
    } else {
      this.tokens.push({ type: L5KLexer.TokenTypes.IDENTIFIER, value });
    }
  }
}

// Export
if (typeof module !== 'undefined') module.exports = L5KLexer;
if (typeof window !== 'undefined') window.L5KLexer = L5KLexer;
