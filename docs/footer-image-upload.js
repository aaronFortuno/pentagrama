import { RASTER_LIMITS, rasterImage } from './engine/raster-image.js?v=2.6.0';

export function rasterFileType(bytes) {
  if (bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71) return 'image/png';
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'image/jpeg';
  if (String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP') return 'image/webp';
  return null;
}
export async function importFooterImage(file) {
  if (!file || file.size > 12 * 1024 * 1024 || !rasterFileType(new Uint8Array(await file.slice(0, 16).arrayBuffer()))) throw new Error('footerImageInvalid');
  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width * bitmap.height > 40000000) throw new Error('footerImageInvalid');
    let scale = Math.min(1, RASTER_LIMITS.side / Math.max(bitmap.width, bitmap.height), Math.sqrt(RASTER_LIMITS.pixels / (bitmap.width * bitmap.height)));
    const canvas = document.createElement('canvas');
    for (let attempt = 0; attempt < 10; attempt++) {
      canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext('2d'); context.imageSmoothingQuality = 'high'; context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const data = canvas.toDataURL('image/png');
      if (data.length <= Math.ceil(RASTER_LIMITS.bytes / 3) * 4 + 22 && rasterImage(data)) return { data, name: file.name.replace(/\.[^.]*$/, '').slice(0, 80), height: 8, placement: 'before', align: 'bottom' };
      scale *= .75;
    }
    throw new Error('footerImageInvalid');
  } finally { bitmap.close(); }
}
