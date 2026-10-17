import qrcode from './vendor/qrcode.cjs';

const alphabet = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
// Bech32 text encoding (BIP-173), with the longer payloads allowed by LUD-01.
export function encodeLnurl(url) {
  const words = []; let buffer = 0, bits = 0;
  for (const byte of new TextEncoder().encode(url)) {
    buffer = (buffer << 8) | byte; bits += 8;
    while (bits >= 5) { bits -= 5; words.push((buffer >>> bits) & 31); }
  }
  if (bits) words.push((buffer << (5 - bits)) & 31);
  const prefix = 'lnurl', expanded = [...prefix].map(c => c.charCodeAt(0) >>> 5).concat(0, [...prefix].map(c => c.charCodeAt(0) & 31));
  const generators = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
  let checksum = 1;
  for (const word of [...expanded, ...words, 0, 0, 0, 0, 0, 0]) {
    const top = checksum >>> 25; checksum = ((checksum & 0x1ffffff) << 5) ^ word;
    for (let i = 0; i < 5; i++) if ((top >>> i) & 1) checksum ^= generators[i];
  }
  checksum ^= 1;
  const check = Array.from({ length: 6 }, (_, i) => alphabet[(checksum >>> (5 * (5 - i))) & 31]).join('');
  return `${prefix}1${words.map(word => alphabet[word]).join('')}${check}`.toUpperCase();
}

export function lightningDetails(address) {
  if (typeof address !== 'string' || !/^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(address)) throw new Error('Invalid Lightning address');
  const [user, host] = address.split('@');
  const url = `https://${host}/.well-known/lnurlp/${user}`, payload = encodeLnurl(url);
  return { address, url, payload, href: `lightning:${payload}` };
}

export function lightningQr(payload) {
  const qr = qrcode(0, 'M'); qr.addData(payload, 'Alphanumeric'); qr.make();
  const count = qr.getModuleCount(), size = count + 8, paths = [];
  for (let row = 0; row < count; row++) for (let column = 0; column < count; column++) {
    if (qr.isDark(row, column)) paths.push(`M${column + 4} ${row + 4}h1v1h-1z`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="#fff"/><path d="${paths.join('')}" fill="#000"/></svg>\n`;
}
