// Tag Utilities - UDT parsing and tag management
// Konomi IgnAIte

const TagUtils = {
  udts: new Map(),
  instances: new Map(),
  properties: { states: {}, alarms: {}, units: {} },

  // Load UDT from .udt file
  async loadUDT(path) {
    const res = await fetch(path);
    const text = await res.text();
    return this.parseUDT(text);
  },

  // Parse UDT format
  parseUDT(text) {
    const lines = text.trim().split('\n');
    const udt = { id: '', name: '', version: '', category: '', params: [], props: [], states: [] };

    for (const line of lines) {
      const l = line.trim();
      if (!l || l.startsWith('#')) continue;

      if (l.startsWith('@')) {
        // Header: @id|name|version|category
        const [id, name, ver, cat] = l.slice(1).split('|');
        Object.assign(udt, { id, name, version: ver, category: cat });
      } else if (l.startsWith('>')) {
        // Parameter: >name|type|default|required
        const [name, type, def, req] = l.slice(1).split('|');
        udt.params.push({ name, type, default: def, required: req === '1' });
      } else if (l.startsWith('~')) {
        // Property: ~name|type|desc|unit|min|max
        const [name, type, desc, unit, min, max] = l.slice(1).split('|');
        udt.props.push({ name, type, desc, unit, min: +min || 0, max: +max || 100 });
      } else if (l.startsWith('=')) {
        // State: =name|fg|bg|priority
        const [name, fg, bg, pri] = l.slice(1).split('|');
        udt.states.push({ name, fg, bg, priority: +pri || 0 });
      }
    }

    this.udts.set(udt.id, udt);
    return udt;
  },

  // Load instances from CSV
  async loadInstances(type, csvPath) {
    const res = await fetch(csvPath);
    const csv = await res.text();
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',');

    const instances = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const inst = { type };
      headers.forEach((h, idx) => inst[h] = values[idx]);
      instances.push(inst);
      this.instances.set(inst.id, inst);
    }
    return instances;
  },

  // Load properties from CSV
  async loadProperties(csvPath) {
    const res = await fetch(csvPath);
    const csv = await res.text();
    const lines = csv.trim().split('\n');

    for (let i = 1; i < lines.length; i++) {
      const [type, key, value, color] = lines[i].split(',');
      if (type === 'state') this.properties.states[key] = { value: +value, color };
      else if (type === 'alarm') this.properties.alarms[key] = { priority: +value, color };
      else if (type === 'unit') this.properties.units[key] = value;
    }
    return this.properties;
  },

  // Create tag instance from UDT
  createInstance(udtId, id, overrides = {}) {
    const udt = this.udts.get(udtId);
    if (!udt) return null;

    const instance = {
      id,
      type: udtId,
      name: overrides.name || id,
      values: {}
    };

    // Initialize properties with defaults
    for (const prop of udt.props) {
      instance.values[prop.name] = overrides[prop.name] ??
        (prop.type === 'bool' ? false : prop.type === 'float' ? 0.0 : 0);
    }

    this.instances.set(id, instance);
    return instance;
  },

  // Get tag value
  getValue(tagId, prop) {
    const inst = this.instances.get(tagId);
    return inst?.values?.[prop];
  },

  // Set tag value
  setValue(tagId, prop, value) {
    const inst = this.instances.get(tagId);
    if (inst?.values) {
      inst.values[prop] = value;
      return true;
    }
    return false;
  },

  // Get state color
  getStateColor(state) {
    return this.properties.states[state]?.color || '#6b7280';
  },

  // Format value with unit
  formatValue(value, unit) {
    const unitStr = this.properties.units[unit] || unit || '';
    return `${value} ${unitStr}`.trim();
  },

  // Get all instances of type
  getInstancesByType(type) {
    return Array.from(this.instances.values()).filter(i => i.type === type);
  },

  // Export instances as JSON
  exportInstances() {
    return Object.fromEntries(this.instances);
  }
};

// Export
if (typeof module !== 'undefined') module.exports = TagUtils;
if (typeof window !== 'undefined') window.TagUtils = TagUtils;
