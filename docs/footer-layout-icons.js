// Arrangement diagrams use the same stroke and geometry conventions as Lucide.
// The rectangle is the image; the two strokes represent the footer text.
export function footerLayoutIcon(position) {
  const picture = (x, y, width = 10, height = 14) => `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="1.5"/>`;
  const text = (x, y, width = 10) => `<path d="M${x} ${y}h${width}m-${width} 4h${width * .7}"/>`;
  const shapes = {
    before: () => picture(3, 9) + text(18, 14),
    after: () => text(3, 14) + picture(19, 9),
    above: () => picture(10, 3, 12, 10) + text(8, 20, 16),
    below: () => text(8, 5, 16) + picture(10, 18, 12, 10),
    top: () => picture(3, 7, 10, 18) + text(18, 7),
    middle: () => picture(3, 7, 10, 18) + text(18, 14),
    bottom: () => picture(3, 7, 10, 18) + text(18, 21),
  };
  return `<svg class="footer-layout-icon" width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${shapes[position]()}</svg>`;
}
