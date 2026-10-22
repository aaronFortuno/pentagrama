import { unzlibSync } from '../vendor/fflate.js?v=2.5.0';

export const RASTER_LIMITS = Object.freeze({ bytes: 98304, side: 1024, pixels: 524288, height: 18, width: 65 });
const prefix = 'data:image/png;base64,', cache = new Map(), pixels = new WeakMap();
const crcTable = Uint32Array.from({ length: 256 }, (_, n) => { for (let i = 0; i < 8; i++) n = n & 1 ? 0xedb88320 ^ n >>> 1 : n >>> 1; return n >>> 0; });
export function pngCRC(bytes) { let crc = 0xffffffff; for (const byte of bytes) crc = crcTable[(crc ^ byte) & 255] ^ crc >>> 8; return (crc ^ 0xffffffff) >>> 0; }
const invalid = () => { throw new Error('invalidFooterImage'); };

// Accept only bounded, self-contained PNGs. Uploads are decoded and re-encoded
// in the browser before they reach settings; SVG and external URLs never do.
export function rasterImage(data) {
  if (typeof data !== 'string' || !data.startsWith(prefix) || data.length > Math.ceil(RASTER_LIMITS.bytes / 3) * 4 + prefix.length) return null;
  if (cache.has(data)) return cache.get(data);
  try {
    const encoded = data.slice(prefix.length);
    if (encoded.length % 4 || !/^[A-Za-z0-9+/]*={0,2}$/.test(encoded)) invalid();
    const bytes = Uint8Array.from(atob(encoded), c => c.charCodeAt(0)), view = new DataView(bytes.buffer);
    if (bytes.length < 57 || bytes.length > RASTER_LIMITS.bytes || view.getUint32(0) !== 0x89504e47 || view.getUint32(4) !== 0x0d0a1a0a) invalid();
    let width, height, channels, end = false; const parts = [];
    for (let offset = 8; offset + 12 <= bytes.length;) {
      const length = view.getUint32(offset), finish = offset + 12 + length;
      if (finish > bytes.length || pngCRC(bytes.subarray(offset + 4, finish - 4)) !== view.getUint32(finish - 4)) invalid();
      const type = String.fromCharCode(...bytes.subarray(offset + 4, offset + 8));
      if (offset === 8 && type !== 'IHDR') invalid();
      if (type === 'IHDR') {
        if (width || length !== 13) invalid();
        width = view.getUint32(offset + 8); height = view.getUint32(offset + 12);
        const depth = bytes[offset + 16], color = bytes[offset + 17]; channels = color === 6 ? 4 : color === 2 ? 3 : 0;
        if (!width || !height || width > RASTER_LIMITS.side || height > RASTER_LIMITS.side || width * height > RASTER_LIMITS.pixels || depth !== 8 || !channels || bytes[offset + 18] || bytes[offset + 19] || bytes[offset + 20]) invalid();
      } else if (type === 'IDAT') parts.push(bytes.subarray(offset + 8, finish - 4));
      else if (type === 'IEND') { if (length || finish !== bytes.length) invalid(); end = true; }
      else if (type === 'tRNS' || type === 'acTL' || type[0] === type[0].toUpperCase()) invalid();
      offset = finish;
    }
    if (!end || !parts.length) invalid();
    const image = Object.freeze({ data, width, height });
    const compressed = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0)); let offset = 0;
    for (const part of parts) { compressed.set(part, offset); offset += part.length; }
    const expected = (width * channels + 1) * height;
    const raw = unzlibSync(compressed, { out: new Uint8Array(expected + 1) });
    if (raw.length !== expected) invalid();
    let a = 1, b = 0; for (const byte of raw) { a = (a + byte) % 65521; b = (b + a) % 65521; }
    const trailer = new DataView(compressed.buffer).getUint32(compressed.length - 4);
    if (((b << 16 | a) >>> 0) !== trailer) invalid();
    const rgb = new Uint8Array(width * height * 3), alpha = new Uint8Array(width * height), stride = width * channels;
    let previous = new Uint8Array(stride);
    for (let y = 0; y < height; y++) {
      const row = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)), filter = raw[y * (stride + 1)];
      if (filter > 4) invalid();
      for (let x = 0; x < stride; x++) {
        const left = x >= channels ? row[x - channels] : 0, up = previous[x], corner = x >= channels ? previous[x - channels] : 0;
        const p = left + up - corner, pa = Math.abs(p - left), pb = Math.abs(p - up), pc = Math.abs(p - corner);
        row[x] += filter === 1 ? left : filter === 2 ? up : filter === 3 ? (left + up) >>> 1 : filter === 4 ? pa <= pb && pa <= pc ? left : pb <= pc ? up : corner : 0;
      }
      for (let x = 0; x < width; x++) {
        const index = y * width + x; rgb.set(row.subarray(x * channels, x * channels + 3), index * 3); alpha[index] = channels === 4 ? row[x * channels + 3] : 255;
      }
      previous = row;
    }
    pixels.set(image, { rgb, alpha });
    if (cache.size >= 16) cache.delete(cache.keys().next().value);
    cache.set(data, image); return image;
  } catch { return null; }
}
export function rasterPixels(image) { const canonical = rasterImage(image?.data); if (!canonical) invalid(); return pixels.get(canonical); }

export function normalizeFooterImage(value) {
  const image = rasterImage(value?.data); if (!image) return null;
  const height = Number(value.height), name = typeof value.name === 'string' ? value.name.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 80) : '';
  return { data: image.data, name, height: Number.isFinite(height) ? Math.round(Math.max(3, Math.min(RASTER_LIMITS.height, height)) * 2) / 2 : 8,
    placement: ['before', 'after', 'above', 'below'].includes(value.placement) ? value.placement : 'before',
    align: ['top', 'middle', 'bottom'].includes(value.align) ? value.align : 'bottom' };
}
