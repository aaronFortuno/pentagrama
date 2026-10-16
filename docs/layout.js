export const DEFAULTS = Object.freeze({ count: 9, group: 3, spacing: 2.2, thickness: 0.12, reference: false });
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function normalizeSettings(value = {}) {
  const number = (key) => Number.isFinite(Number(value[key])) ? Number(value[key]) : DEFAULTS[key];
  const count = clamp(Math.round(number('count')), 1, 24);
  let group = Math.round(number('group'));
  if (group < 2 || group >= count) group = 0;
  return {
    count, group,
    spacing: Math.round(clamp(number('spacing'), 1.2, 4) * 10) / 10,
    thickness: Math.round(clamp(number('thickness'), 0.05, 0.5) * 100) / 100,
    reference: value.reference === true,
  };
}

export function encodeReference(value) {
  const s = normalizeSettings(value);
  return `P1-N${s.count}-G${s.group}-E${Math.round(s.spacing * 10)}-T${Math.round(s.thickness * 100)}`;
}

export function decodeReference(text) {
  const match = /^P1-N(\d{1,2})-G(\d{1,2})-E(\d{2})-T(\d{1,2})$/i.exec(text.trim());
  if (!match) throw new Error('La referència no és vàlida. Exemple: P1-N9-G3-E22-T12.');
  const [, n, g, e, t] = match.map((item, index) => index ? Number(item) : item);
  if (n < 1 || n > 24 || (g !== 0 && (g < 2 || g >= n)) || e < 12 || e > 40 || t < 5 || t > 50) {
    throw new Error('La referència conté valors fora de rang. Revisa el codi.');
  }
  return normalizeSettings({ count: n, group: g, spacing: e / 10, thickness: t / 100 });
}

export function createLayout(value) {
  const s = normalizeSettings(value);
  const top = 21, bottom = 276, staffHeight = 8, lineSpacing = 2;
  const boundaries = s.group ? Math.floor((s.count - 1) / s.group) : 0;
  const gapUnits = s.count - 1 + boundaries * (s.spacing - 1);
  const gap = gapUnits > 0 ? (bottom - top - s.count * staffHeight) / gapUnits : 0;
  const staves = [];
  let y = s.count === 1 ? (top + bottom - staffHeight) / 2 : top;
  for (let i = 0; i < s.count; i++) {
    staves.push(Array.from({ length: 5 }, (_, line) => y + line * lineSpacing));
    y += staffHeight + gap * (s.group && (i + 1) % s.group === 0 ? s.spacing : 1);
  }
  return { ...s, staves, boundaries, gap };
}

export function renderSheet(value) {
  const layout = createLayout(value);
  const lines = layout.staves.flatMap(staff => staff.map(y => `<line x1="18" x2="192" y1="${y.toFixed(5)}" y2="${y.toFixed(5)}"/>`)).join('');
  const footer = layout.reference ? `<text x="192" y="287" text-anchor="end" font-family="Arial, sans-serif" font-size="2" fill="#747474">${encodeReference(layout)}</text>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="210mm" height="297mm" viewBox="0 0 210 297" aria-hidden="true"><g fill="none" stroke="#000" stroke-width="${layout.thickness}">${lines}</g>${footer}</svg>`;
}
