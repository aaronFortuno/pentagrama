import { FOOTER_GRAY, FOOTER_SIZE } from './constants.js?v=2.1.2';
import { footerLines } from './footers.js?v=2.1.2';
import { createBarlines } from './barlines.js?v=2.1.2';
import { createClefs } from './clefs.js?v=2.1.2';

// A physical, renderer-independent display list. Both SVG and PDF consume
// these exact coordinates; renderers do not calculate staff positions.
export function createScene(layout, systems, pageId, referenceSettings) {
  const staves = systems.flatMap(system => system.blocks.flatMap(block => block.staves));
  const elements = layout.staves.flatMap((staff, index) => staff.map((y, lineIndex) => ({
    id: `${staves[index].id}/line-${lineIndex + 1}`, kind: 'line', ownerId: staves[index].id,
    x1: layout.left, x2: layout.right, y1: y, y2: y, stroke: '#000', strokeWidth: layout.thickness,
  })));
  elements.push(...createBarlines(layout, systems), ...createClefs(layout, systems));
  footerLines(layout, referenceSettings).forEach((footer, index) => elements.push({
    id: `${pageId}/footers/footer-${index + 1}`, kind: 'text', ownerId: pageId, ...footer,
    fontSize: FOOTER_SIZE, gray: FOOTER_GRAY,
  }));
  return elements;
}
