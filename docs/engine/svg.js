import { validatePath } from './path-data.js?v=2.3.1';
const escape = text => String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');

export function renderSvgPage(page) {
  if (page.scene.some(element => !['line', 'text', 'path', 'circle'].includes(element.kind))) throw new Error('unsupportedSceneElement');
  const { width, height } = page.frame;
  const lines = page.scene.filter(element => element.kind === 'line').map(line => `<line x1="${line.x1}" x2="${line.x2}" y1="${line.y1.toFixed(5)}" y2="${line.y2.toFixed(5)}"${line.gray !== undefined ? ` stroke="rgb(${line.gray},${line.gray},${line.gray})"` : ''}${line.strokeWidth !== page.layout.thickness ? ` stroke-width="${line.strokeWidth}"` : ''}${line.dash?.length ? ` stroke-dasharray="${line.dash.join(' ')}"` : ''}/>`).join('');
  const texts = page.scene.filter(element => element.kind === 'text').map(text => {
    const color = `#${text.gray.toString(16).repeat(3)}`;
    return `<text x="${text.x}" y="${text.y}" text-anchor="${text.anchor}" font-family="'${text.font === 'page' ? 'Pentagrama Text' : 'Pentagrama Footer'}',serif" font-size="${text.fontSize}" font-weight="${text.font === 'page' ? 200 : 100}" style="font-kerning:none;font-variant-ligatures:none" fill="${color}">${escape(text.text)}</text>`;
  }).join('');
  const paths = page.scene.filter(element => element.kind === 'path').map(path => `<path d="${validatePath(path.commands).map(([op, ...values]) => op + values.map(value => Number(value.toFixed(6))).join(' ')).join('')}" fill="#000"/>`).join('');
  const dots = page.scene.filter(element => element.kind === 'circle').map(dot => `<circle cx="${dot.x}" cy="${dot.y}" r="${dot.radius}" fill="rgb(${dot.gray},${dot.gray},${dot.gray})"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}mm" height="${height}mm" viewBox="0 0 ${width} ${height}" aria-hidden="true"><g fill="none" stroke="#000" stroke-width="${page.layout.thickness}">${lines}</g>${paths}${dots}${texts}</svg>`;
}
