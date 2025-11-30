// UDT Parser - Parse .udt format to JSON
// Format: @id|name|ver|cat >prop|type|def|req ~tag|type|desc|unit|min|max =state|color|border|blink

function parseUDT(text) {
  const udt = { id: '', name: '', version: '', category: '', props: [], tags: [], states: [] };
  text.split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const parts = line.substring(1).split('|');
    switch (line[0]) {
      case '@': // UDT header
        [udt.id, udt.name, udt.version, udt.category] = parts;
        break;
      case '>': // Property
        udt.props.push({ name: parts[0], type: parts[1], default: parts[2], required: parts[3] === '1' });
        break;
      case '~': // Tag
        udt.tags.push({ name: parts[0], type: parts[1], desc: parts[2], unit: parts[3], min: parts[4], max: parts[5] });
        break;
      case '=': // State
        udt.states.push({ name: parts[0], color: parts[1], border: parts[2], blink: parts[3] === '1' });
        break;
    }
  });
  return udt;
}

function udtToJSON(udt) { return JSON.stringify(udt, null, 2); }

function jsonToUDT(json) {
  const u = typeof json === 'string' ? JSON.parse(json) : json;
  let out = `@${u.id}|${u.name}|${u.version}|${u.category}\n`;
  u.props?.forEach(p => out += `>${p.name}|${p.type}|${p.default || ''}|${p.required ? 1 : 0}\n`);
  u.tags?.forEach(t => out += `~${t.name}|${t.type}|${t.desc || ''}|${t.unit || ''}|${t.min || ''}|${t.max || ''}\n`);
  u.states?.forEach(s => out += `=${s.name}|${s.color}|${s.border}|${s.blink ? 1 : 0}\n`);
  return out;
}

if (typeof module !== 'undefined') module.exports = { parseUDT, udtToJSON, jsonToUDT };
