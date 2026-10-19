import { normalizeDocument } from './model.js?v=2.0.0-alpha.4';
import { layoutPage } from './page-layout.js?v=2.0.0-alpha.4';
import { createScene } from './scene.js?v=2.0.0-alpha.4';

function bounds(staves, layout) {
  return staves.length ? { left: layout.left, right: layout.right, top: staves[0].lines[0], bottom: staves.at(-1).lines.at(-1) } : null;
}

export function createDocument(value) {
  const model = normalizeDocument(value);
  const pages = model.pages.map(page => {
    const layout = layoutPage(page.settings); let staffIndex = 0;
    const systems = page.systems.map(system => {
      const blocks = system.blocks.map(block => {
        const staves = block.staves.map(staff => ({ ...staff, index: staffIndex, lines: layout.staves[staffIndex++] || [] }));
        return { ...block, staves, bounds: bounds(staves.filter(staff => staff.lines.length), layout) };
      });
      return { ...system, blocks, bounds: bounds(blocks.flatMap(block => block.staves).filter(staff => staff.lines.length), layout) };
    });
    const scene = createScene(layout, systems, page.id);
    return { id: page.id, settings: page.settings, layout, systems, scene, valid: layout.valid,
      frame: { width: layout.width, height: layout.height, content: { left: layout.left, right: layout.right, top: layout.top, bottom: layout.bottom } } };
  });
  return { schemaVersion: model.schemaVersion, pages, valid: pages.every(page => page.valid) };
}
