# Tags

Ignition tag provider with UDT support.

## Structure
- `udt/` - User Defined Types (.udt format)
- `instances/` - Tag instances
- `properties/` - Shared configs

## .udt Format
Token-efficient line-based format:
```
@id|name|version|category
>prop|type|default|required
~tag|type|desc|units|min|max
=state|color|border|blink
```

## Usage
```js
const udt = parseUDT(await fetch('tags/udt/pump.udt'))
```
