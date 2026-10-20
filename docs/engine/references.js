import { DEFAULTS, DEFAULT_MARGINS } from './constants.js?v=2.1.2';
import { normalizeSettings } from './settings.js?v=2.1.2';

const styles = { single: 'S', double: 'D', dashed: 'H' }, connections = { none: 'N', solid: 'S', dashed: 'D' };
const clefCodes = { none: 'N', treble: 'G', bass: 'F', alto: 'A', tenor: 'T' };
const patternCode = pattern => pattern.length ? pattern.map(type => type === null ? 'I' : clefCodes[type]).join('') : '0';
const fromCode = (codes, code) => Object.keys(codes).find(key => codes[key] === code);

export function encodeReference(value) {
  const s = normalizeSettings(value);
  const customMargins = Object.entries(DEFAULT_MARGINS).some(([key, value]) => s[key] !== value);
  const margins = customMargins ? `-M${[s.marginTop, s.marginRight, s.marginBottom, s.marginLeft].join('.')}` : '';
  const prefix = `P${s.duplex.enabled ? 7 : s.clefs.enabled || s.barlines.enabled && s.barlines.thicknessMode === 'staff' ? 6 : s.barlines.enabled ? 5 : customMargins ? 4 : s.topSpace ? 3 : 2}-${s.paper === 'LETTER' ? 'LT' : s.paper}-${s.orientation === 'landscape' ? 'L' : 'P'}-I${Math.round(s.lineSpacing * 10)}-T${Math.round(s.thickness * 100)}${s.topSpace ? `-H${s.topSpace}` : ''}${margins}`;
  const distribution = s.mode === 'simple' ? `-N${s.count}-G${s.group}-E${Math.round(s.spacing * 10)}` : `-S${s.systems}-J${Math.round(s.systemGap * 10)}-B${s.blocks.map(b => `${b.count}.${Math.round(b.inside * 10)}.${Math.round(b.after * 10)}`).join('_')}`;
  const bars = s.barlines;
  const clefs = s.clefs, key = clefs.enabled ? `-K${clefs.mode === 'uniform' ? 'U' : 'P'}.${clefCodes[clefs.type]}${clefs.mode === 'pattern' ? s.mode === 'simple' ? `.S.${patternCode(clefs.pattern)}` : `.B.${s.blocks.map(block => patternCode(block.clefs || [])).join('_')}` : ''}` : '';
  return `${prefix}${distribution}${bars.enabled ? `-V${bars.measures}.${styles[bars.style]}.${bars.thicknessMode === 'staff' ? 'A' : Math.round(bars.thickness * 100)}.${connections[bars.connect]}` : ''}${key}${s.duplex.enabled ? `-D${s.duplex.firstPageOnly ? 'F' : 'A'}.${s.duplex.mirrorMargins ? 'M' : 'N'}` : ''}`;
}

export function decodeReference(text) {
  if (typeof text !== 'string' || text.length > 1600) throw new Error('invalidRef');
  const code = text.trim().toUpperCase();
  const old = /^P1-N(\d{1,2})-G(\d{1,2})-E(\d{2})-T(\d{1,2})$/.exec(code);
  if (old) {
    const [, n, g, e, t] = old.map((v, i) => i ? Number(v) : v);
    if (n < 1 || n > 24 || (g !== 0 && (g < 2 || g >= n)) || e < 12 || e > 40 || t < 5 || t > 50) throw new Error('invalidRef');
    return normalizeSettings({ ...DEFAULTS, count: n, group: g, spacing: e / 10, thickness: t / 100 });
  }
  const match = /^P([234567])-(A4|A3|LT)-(P|L)-I(\d{2})-T(\d{1,2})(?:-H(\d{1,3}))?(?:-M(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3}))?-(.+)$/.exec(code);
  if (!match) throw new Error('invalidRef');
  const [, version, paper, orientation, interline, thickness, topSpace, marginTop, marginRight, marginBottom, marginLeft, tail] = match;
  if (version === '2' && (topSpace !== undefined || marginTop !== undefined) || version === '3' && (topSpace === undefined || marginTop !== undefined) || version === '4' && marginTop === undefined) throw new Error('invalidRef');
  let raw = { ...DEFAULTS, paper: paper === 'LT' ? 'LETTER' : paper, orientation: orientation === 'L' ? 'landscape' : 'portrait', lineSpacing: Number(interline) / 10, thickness: Number(thickness) / 100, topSpace: Number(topSpace || 0) };
  if (marginTop !== undefined) Object.assign(raw, { marginTop: Number(marginTop), marginRight: Number(marginRight), marginBottom: Number(marginBottom), marginLeft: Number(marginLeft) });
  let suffix = tail, clefPatterns;
  if (version === '7') {
    const sides = /^(.*)-D([FA])\.([MN])$/.exec(suffix);
    if (!sides) throw new Error('invalidRef');
    suffix = sides[1]; raw.duplex = { enabled: true, firstPageOnly: sides[2] === 'F', mirrorMargins: sides[3] === 'M' };
  }
  if ((version === '6' || version === '7') && suffix.includes('-K')) {
    const key = /^(.*)-K([UP])\.([NGFAT])(?:\.([SB])\.([INGFAT0_]+))?$/.exec(suffix);
    if (!key || (key[2] === 'P') !== Boolean(key[4])) throw new Error('invalidRef');
    suffix = key[1]; raw.clefs = { enabled: true, type: fromCode(clefCodes, key[3]), mode: key[2] === 'P' ? 'pattern' : 'uniform' };
    if (key[4]) clefPatterns = { mode: key[4], values: key[5].split('_').map(chunk => chunk === '0' ? [] : [...chunk].map(code => code === 'I' ? null : fromCode(clefCodes, code))) };
  }
  if (version === '5' || (version === '6' || version === '7') && suffix.includes('-V')) {
    const bars = /^(.*)-V(\d{1,2})\.([SDH])\.(A|\d{1,2})\.([NSD])$/.exec(suffix);
    if (!bars || version === '5' && bars[4] === 'A') throw new Error('invalidRef');
    suffix = bars[1]; raw.barlines = { enabled: true, measures: Number(bars[2]), style: fromCode(styles, bars[3]), thicknessMode: bars[4] === 'A' ? 'staff' : 'custom', ...(bars[4] === 'A' ? {} : { thickness: Number(bars[4]) / 100 }), connect: fromCode(connections, bars[5]) };
  }
  const simple = /^N(\d{1,2})-G(\d{1,2})-E(\d{2})$/.exec(suffix);
  const complex = /^S([1-8])-J(\d{2,3})-B([\d._]+)$/.exec(suffix);
  if (simple) raw = { ...raw, count: Number(simple[1]), group: Number(simple[2]), spacing: Number(simple[3]) / 10 };
  else if (complex) {
    const parts = complex[3].split('_');
    if (parts.length > 24 || parts.some(p => !/^\d{1,2}\.\d{2,3}\.\d{2,3}$/.test(p))) throw new Error('invalidRef');
    raw = { ...raw, mode: 'blocks', systems: Number(complex[1]), systemGap: Number(complex[2]) / 10, blocks: parts.map(p => { const [count, inside, after] = p.split('.').map(Number); return { label: '', count, inside: inside / 10, after: after / 10 }; }) };
  } else throw new Error('invalidRef');
  if (clefPatterns) {
    if (raw.mode === 'blocks') {
      if (clefPatterns.mode !== 'B' || clefPatterns.values.length !== raw.blocks.length) throw new Error('invalidRef');
      raw.blocks.forEach((block, index) => { block.clefs = clefPatterns.values[index]; });
    } else {
      if (clefPatterns.mode !== 'S' || clefPatterns.values.length !== 1) throw new Error('invalidRef');
      raw.clefs.pattern = clefPatterns.values[0];
    }
  }
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
