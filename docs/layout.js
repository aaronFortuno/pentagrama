import { FOOTER_FONT } from './vendor/footer-font-metrics.js?v=1.7.1';

export const PAPER_SIZES = Object.freeze({ A4: [210, 297], A3: [297, 420], LETTER: [215.9, 279.4] });
export const SERVICE_ADDRESS = 'pentagrama.page';
export const FOOTER_GRAY = 166;
export const FOOTER_SIZE = 2.2;
export const DEFAULTS = Object.freeze({ count: 9, group: 3, spacing: 2.2, thickness: 0.12, reference: false, source: false, paper: 'A4', orientation: 'portrait', lineSpacing: 2, topSpace: 0, mode: 'simple', systems: 1, systemGap: 18, blocks: [] });
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const round = v => Math.round(v * 10) / 10;
const numeric = (v, fallback, min, max) => clamp(Number.isFinite(Number(v)) && v !== null && v !== '' ? Number(v) : fallback, min, max);

export function normalizeSettings(value = {}) {
  if (!value || typeof value !== 'object') value = {};
  const count = Math.round(numeric(value.count, 9, 1, 64));
  let group = Math.round(numeric(value.group, 3, 0, 63));
  if (group < 2 || group >= count) group = 0;
  const blocks = Array.isArray(value.blocks) ? value.blocks.slice(0, 24).filter(b => b && typeof b === 'object').map(b => ({
    label: typeof b.label === 'string' ? b.label.trim().slice(0, 60) : '',
    count: Math.round(numeric(b.count, 2, 1, 32)), inside: round(numeric(b.inside, 8, 1, 40)), after: round(numeric(b.after, 14, 1, 60)),
  })) : [];
  return {
    count, group, spacing: round(numeric(value.spacing, 2.2, 1.2, 4)), thickness: Math.round(numeric(value.thickness, 0.12, 0.05, 0.5) * 100) / 100,
    reference: value.reference === true, source: value.source === true, paper: Object.hasOwn(PAPER_SIZES, value.paper) ? value.paper : 'A4', orientation: value.orientation === 'landscape' ? 'landscape' : 'portrait',
    lineSpacing: round(numeric(value.lineSpacing, 2, 1, 4)), topSpace: Math.round(numeric(value.topSpace, 0, 0, 100)), mode: value.mode === 'blocks' ? 'blocks' : 'simple', systems: Math.round(numeric(value.systems, 1, 1, 8)), systemGap: round(numeric(value.systemGap, 18, 1, 60)),
    blocks: blocks.length ? blocks : value.mode === 'blocks' ? [{ label: '', count: 4, inside: 12, after: 14 }, { label: '', count: 2, inside: 6, after: 14 }] : [],
  };
}

export function pageDimensions(value) {
  const s = normalizeSettings(value); const [short, long] = PAPER_SIZES[s.paper];
  return s.orientation === 'landscape' ? { width: long, height: short } : { width: short, height: long };
}

export function encodeReference(value) {
  const s = normalizeSettings(value);
  const prefix = `P${s.topSpace ? 3 : 2}-${s.paper === 'LETTER' ? 'LT' : s.paper}-${s.orientation === 'landscape' ? 'L' : 'P'}-I${Math.round(s.lineSpacing * 10)}-T${Math.round(s.thickness * 100)}${s.topSpace ? `-H${s.topSpace}` : ''}`;
  return s.mode === 'simple' ? `${prefix}-N${s.count}-G${s.group}-E${Math.round(s.spacing * 10)}` : `${prefix}-S${s.systems}-J${Math.round(s.systemGap * 10)}-B${s.blocks.map(b => `${b.count}.${Math.round(b.inside * 10)}.${Math.round(b.after * 10)}`).join('_')}`;
}

export function decodeReference(text) {
  if (typeof text !== 'string' || text.length > 600) throw new Error('invalidRef');
  const code = text.trim().toUpperCase();
  const old = /^P1-N(\d{1,2})-G(\d{1,2})-E(\d{2})-T(\d{1,2})$/.exec(code);
  if (old) {
    const [, n, g, e, t] = old.map((v, i) => i ? Number(v) : v);
    if (n < 1 || n > 24 || (g !== 0 && (g < 2 || g >= n)) || e < 12 || e > 40 || t < 5 || t > 50) throw new Error('invalidRef');
    return normalizeSettings({ ...DEFAULTS, count: n, group: g, spacing: e / 10, thickness: t / 100 });
  }
  const match = /^P([23])-(A4|A3|LT)-(P|L)-I(\d{2})-T(\d{1,2})(?:-H(\d{1,3}))?-(.+)$/.exec(code);
  if (!match) throw new Error('invalidRef');
  const [, version, paper, orientation, interline, thickness, topSpace, suffix] = match;
  if ((version === '3') !== (topSpace !== undefined)) throw new Error('invalidRef');
  let raw = { ...DEFAULTS, paper: paper === 'LT' ? 'LETTER' : paper, orientation: orientation === 'L' ? 'landscape' : 'portrait', lineSpacing: Number(interline) / 10, thickness: Number(thickness) / 100, topSpace: Number(topSpace || 0) };
  const simple = /^N(\d{1,2})-G(\d{1,2})-E(\d{2})$/.exec(suffix);
  const complex = /^S([1-8])-J(\d{2,3})-B([\d._]+)$/.exec(suffix);
  if (simple) raw = { ...raw, count: Number(simple[1]), group: Number(simple[2]), spacing: Number(simple[3]) / 10 };
  else if (complex) {
    const parts = complex[3].split('_');
    if (parts.length > 24 || parts.some(p => !/^\d{1,2}\.\d{2,3}\.\d{2,3}$/.test(p))) throw new Error('invalidRef');
    raw = { ...raw, mode: 'blocks', systems: Number(complex[1]), systemGap: Number(complex[2]) / 10, blocks: parts.map(p => { const [count, inside, after] = p.split('.').map(Number); return { label: '', count, inside: inside / 10, after: after / 10 }; }) };
  } else throw new Error('invalidRef');
  const normalized = normalizeSettings(raw);
  if (encodeReference(normalized) !== code) throw new Error('invalidRef');
  return normalized;
}

export function encodeShareHash(value) {
  const s = normalizeSettings(value), reference = encodeReference(s);
  return s.mode === 'blocks' ? `${reference}~${encodeURIComponent(JSON.stringify(s.blocks.map(b => b.label)))}` : reference;
}

export function decodeShareHash(hash) {
  if (typeof hash !== 'string' || hash.length > 20000) throw new Error('invalidRef');
  const separator = hash.indexOf('~');
  const settings = decodeReference(decodeURIComponent(separator < 0 ? hash : hash.slice(0, separator)));
  if (separator >= 0 && settings.mode === 'blocks') {
    const labels = JSON.parse(decodeURIComponent(hash.slice(separator + 1)));
    if (!Array.isArray(labels) || labels.length !== settings.blocks.length || labels.some(label => typeof label !== 'string' || label.length > 60)) throw new Error('invalidRef');
    settings.blocks.forEach((block, index) => { block.label = labels[index]; });
  }
  return normalizeSettings(settings);
}

export function createLayout(value) {
  const s = normalizeSettings(value); const { width, height } = pageDimensions(s);
  const top = 21 + s.topSpace, bottom = height - 21, available = bottom - top, staffHeight = s.lineSpacing * 4;
  const count = s.mode === 'blocks' ? s.systems * s.blocks.reduce((n, b) => n + b.count, 0) : s.count;
  let needed, gap = 0, positions = [];
  if (s.mode === 'simple') {
    const boundaries = s.group ? Math.floor((count - 1) / s.group) : 0, units = count - 1 + boundaries * (s.spacing - 1);
    needed = count * staffHeight + units;
    gap = units ? Math.max(1, (available - count * staffHeight) / units) : 0;
    let y = count === 1 ? (top + bottom - staffHeight) / 2 : top;
    for (let i = 0; i < count; i++) { positions.push(y); y += staffHeight + gap * (s.group && (i + 1) % s.group === 0 ? s.spacing : 1); }
  } else {
    const systemHeight = s.blocks.reduce((sum, b, i) => sum + b.count * staffHeight + (b.count - 1) * b.inside + (i < s.blocks.length - 1 ? b.after : 0), 0);
    needed = s.systems * systemHeight + (s.systems - 1) * s.systemGap;
    let y = top + Math.max(0, (available - needed) / 2);
    if (count <= 256) for (let system = 0; system < s.systems; system++) {
      for (let i = 0; i < s.blocks.length; i++) {
        const b = s.blocks[i];
        for (let staff = 0; staff < b.count; staff++) { positions.push(y); y += staffHeight + (staff < b.count - 1 ? b.inside : 0); }
        if (i < s.blocks.length - 1) y += b.after;
      }
      if (system < s.systems - 1) y += s.systemGap;
    }
  }
  return { ...s, width, height, top, bottom, available, needed, count, gap, staves: positions.map(y => Array.from({ length: 5 }, (_, i) => y + i * s.lineSpacing)), valid: needed <= available + 1e-6 && count <= 256, overflow: Math.max(0, needed - available) };
}

export function fitSettings(value) {
  let s = normalizeSettings(value); const l = createLayout(s);
  if (l.valid) return s;
  if (s.mode === 'simple') { while (s.count > 1 && !createLayout(s).valid) s = normalizeSettings({ ...s, count: s.count - 1 }); return s; }
  const gapCount = s.systems * s.blocks.reduce((sum, b, i) => sum + b.count - 1 + (i < s.blocks.length - 1 ? 1 : 0), 0) + s.systems - 1;
  const maximumLineSpace = Math.floor((l.available - gapCount) / (l.count * 4) * 10) / 10;
  if (maximumLineSpace < 1 || l.count > 256) return s;
  s = { ...s, lineSpacing: Math.min(s.lineSpacing, maximumLineSpace) };
  const scaled = multiplier => ({ ...s, systemGap: Math.max(1, Math.floor(s.systemGap * multiplier * 10) / 10), blocks: s.blocks.map(b => ({ ...b, inside: Math.max(1, Math.floor(b.inside * multiplier * 10) / 10), after: Math.max(1, Math.floor(b.after * multiplier * 10) / 10) })) });
  let low = 0, high = 1;
  for (let i = 0; i < 40; i++) { const mid = (low + high) / 2; if (createLayout(scaled(mid)).valid) low = mid; else high = mid; }
  return normalizeSettings(scaled(low));
}

export function footerTextWidth(text) {
  return [...text].reduce((sum, character) => sum + FOOTER_FONT.widths[character.charCodeAt(0) - 32], 0) * FOOTER_SIZE / 1000;
}

export function footerLines(value) {
  const s = normalizeSettings(value), { width, height } = pageDimensions(s);
  const source = s.source ? [{ text: SERVICE_ADDRESS, x: 18, y: height - 9, anchor: 'start' }] : [];
  if (!s.reference) return source;
  const reserved = s.source ? footerTextWidth(SERVICE_ADDRESS) + 8 : 0, available = width - 36 - reserved;
  const chunks = []; let line = '';
  for (const character of encodeReference(s)) {
    if (line && footerTextWidth(line + character) > available) { chunks.push(line); line = ''; }
    line += character;
  }
  if (line) chunks.push(line);
  return [...source, ...chunks.map((text, i) => ({ text, x: width - 18, y: height - 9 - (chunks.length - i - 1) * 2.9, anchor: 'end' }))];
}

export function renderSheet(value) {
  const l = createLayout(value);
  const lines = l.staves.flatMap(staff => staff.map(y => `<line x1="18" x2="${l.width - 18}" y1="${y.toFixed(5)}" y2="${y.toFixed(5)}"/>`)).join('');
  const footerColor = `#${FOOTER_GRAY.toString(16).repeat(3)}`;
  const footer = footerLines(l).map(f => `<text x="${f.x}" y="${f.y}" text-anchor="${f.anchor}" font-family="'Pentagrama Footer',serif" font-size="${FOOTER_SIZE}" font-weight="100" style="font-kerning:none;font-variant-ligatures:none" fill="${footerColor}">${f.text}</text>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${l.width}mm" height="${l.height}mm" viewBox="0 0 ${l.width} ${l.height}" aria-hidden="true"><g fill="none" stroke="#000" stroke-width="${l.thickness}">${lines}</g>${footer}</svg>`;
}
