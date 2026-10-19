const escape = text => String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');

export function renderSvgPage(page) {
  if (page.scene.some(element => !['line', 'text'].includes(element.kind))) throw new Error('unsupportedSceneElement');
  const { width, height } = page.frame;
  const lines = page.scene.filter(element => element.kind === 'line').map(line => `<line x1="${line.x1}" x2="${line.x2}" y1="${line.y1.toFixed(5)}" y2="${line.y2.toFixed(5)}"${line.strokeWidth !== page.layout.thickness ? ` stroke-width="${line.strokeWidth}"` : ''}/>`).join('');
  const texts = page.scene.filter(element => element.kind === 'text').map(text => {
    const color = `#${text.gray.toString(16).repeat(3)}`;
    return `<text x="${text.x}" y="${text.y}" text-anchor="${text.anchor}" font-family="'Pentagrama Footer',serif" font-size="${text.fontSize}" font-weight="100" style="font-kerning:none;font-variant-ligatures:none" fill="${color}">${escape(text.text)}</text>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}mm" height="${height}mm" viewBox="0 0 ${width} ${height}" aria-hidden="true"><g fill="none" stroke="#000" stroke-width="${page.layout.thickness}">${lines}</g>${texts}</svg>`;
}
