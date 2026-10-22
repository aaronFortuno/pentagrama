import { zlibSync } from '../../docs/vendor/fflate.js';
import { pngCRC } from '../../docs/engine/raster-image.js';

export function pngFixture(width = 12, height = 6, color = (x, y) => [x * 19, y * 37, 100, (x + y) % 3 ? 255 : 0], filter = 0, channels = 4) {
  const chunk = (type, data) => {
    const bytes = new Uint8Array(data.length + 12), view = new DataView(bytes.buffer); view.setUint32(0, data.length);
    bytes.set(new TextEncoder().encode(type), 4); bytes.set(data, 8); view.setUint32(data.length + 8, pngCRC(bytes.subarray(4, data.length + 8))); return bytes;
  };
  const header = new Uint8Array(13), view = new DataView(header.buffer); view.setUint32(0, width); view.setUint32(4, height); header[8] = 8; header[9] = channels === 4 ? 6 : 2;
  const stride = width * channels, raw = new Uint8Array(height * (stride + 1)); let previous = new Uint8Array(stride);
  for (let y = 0; y < height; y++) {
    const row = new Uint8Array(stride); for (let x = 0; x < width; x++) row.set(color(x, y).slice(0, channels), x * channels);
    raw[y * (stride + 1)] = filter;
    for (let x = 0; x < stride; x++) {
      const left = x >= channels ? row[x - channels] : 0, up = previous[x], corner = x >= channels ? previous[x - channels] : 0;
      const p = left + up - corner, pa = Math.abs(p - left), pb = Math.abs(p - up), pc = Math.abs(p - corner);
      const predictor = filter === 1 ? left : filter === 2 ? up : filter === 3 ? (left + up) >>> 1 : filter === 4 ? pa <= pb && pa <= pc ? left : pb <= pc ? up : corner : 0;
      raw[y * (stride + 1) + x + 1] = row[x] - predictor;
    }
    previous = row;
  }
  const parts = [Uint8Array.of(137, 80, 78, 71, 13, 10, 26, 10), chunk('IHDR', header), chunk('IDAT', zlibSync(raw)), chunk('IEND', new Uint8Array())];
  const bytes = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0)); let offset = 0; for (const part of parts) { bytes.set(part, offset); offset += part.length; }
  return 'data:image/png;base64,' + Buffer.from(bytes).toString('base64');
}
