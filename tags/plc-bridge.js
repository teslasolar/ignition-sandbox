// Tag-PLC Bridge - Links tag instances to virtual PLC addresses
// Konomi IgnAIte

class TagPLCBridge {
  constructor() {
    this.tags = new Map();
    this.plc = null;
    this.subscriptions = [];
  }

  // Connect to virtual PLC
  connect(plc) {
    this.plc = plc;
    console.log('Tag bridge connected to PLC');
  }

  // Load tag instances from CSV
  async loadInstances(type, csvPath) {
    const res = await fetch(csvPath);
    const csv = await res.text();
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const tag = {};
      headers.forEach((h, idx) => tag[h] = values[idx]);
      tag.type = type;
      tag.value = this.getDefaultValue(type);
      this.tags.set(tag.id, tag);
    }

    return lines.length - 1;
  }

  // Get default value based on type
  getDefaultValue(type) {
    switch (type) {
      case 'pump': return { running: false, fault: false, amps: 0, speed: 0 };
      case 'tank': return { level: 0, high: false, low: false };
      case 'valve': return { open: false, closed: true, position: 0 };
      case 'sensor': return { value: 0, alarm: false };
      default: return {};
    }
  }

  // Parse PLC address (e.g., "I:0/0", "AI:0")
  parseAddress(addr) {
    const match = addr.match(/([A-Z]+):(\d+)(?:\/(\d+))?/);
    if (!match) return null;
    return {
      area: match[1],
      byte: parseInt(match[2]),
      bit: match[3] ? parseInt(match[3]) : null
    };
  }

  // Read tag value from PLC
  readTag(tagId) {
    const tag = this.tags.get(tagId);
    if (!tag || !this.plc) return null;

    const addr = this.parseAddress(tag.plc_addr || tag.plc_level);
    if (!addr) return tag.value;

    if (addr.bit !== null) {
      // Digital value
      return this.plc.memory.readBit(addr.area, addr.byte, addr.bit);
    } else {
      // Analog value
      return this.plc.memory.getInt(addr.area, addr.byte);
    }
  }

  // Write tag value to PLC
  writeTag(tagId, value) {
    const tag = this.tags.get(tagId);
    if (!tag || !this.plc) return false;

    const addr = this.parseAddress(tag.plc_addr);
    if (!addr) return false;

    if (addr.bit !== null) {
      this.plc.memory.writeBit(addr.area, addr.byte, addr.bit, !!value);
    } else {
      this.plc.memory.setInt(addr.area, addr.byte, value);
    }
    return true;
  }

  // Subscribe to tag changes
  subscribe(tagId, callback) {
    this.subscriptions.push({ tagId, callback });
  }

  // Update all subscribers
  update() {
    for (const sub of this.subscriptions) {
      const value = this.readTag(sub.tagId);
      sub.callback(sub.tagId, value);
    }
  }

  // Get all tags
  getAllTags() {
    return Array.from(this.tags.values());
  }

  // Get tags by type
  getTagsByType(type) {
    return this.getAllTags().filter(t => t.type === type);
  }

  // Export tag configuration for gateway
  exportForGateway() {
    return this.getAllTags().map(tag => ({
      name: tag.id,
      tagType: 'OpcTag',
      dataType: tag.plc_addr?.startsWith('AI') || tag.plc_level ? 'Int2' : 'Boolean',
      opcItemPath: `ns=1;s=VirtualPLC/${tag.plc_addr || tag.plc_level}`,
      metadata: {
        location: tag.location,
        type: tag.type
      }
    }));
  }
}

// Export
if (typeof module !== 'undefined') module.exports = TagPLCBridge;
if (typeof window !== 'undefined') window.TagPLCBridge = TagPLCBridge;
