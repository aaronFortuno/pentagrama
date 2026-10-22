import { normalizeDocument } from './model.js?v=2.4.1';
import { layoutPage } from './page-layout.js?v=2.4.1';
import { createScene } from './scene.js?v=2.4.1';

function bounds(staves, layout) {
  return staves.length ? { left: layout.left, right: layout.right, top: staves[0].lines[0], bottom: staves.at(-1).lines.at(-1) } : null;
}

export function createDocument(value) {
  const model = normalizeDocument(value);
  const pages = model.pages.map(page => {
    const layout = layoutPage(page.settings, { referenceSettings: page.referenceSettings }); let staffIndex = 0;
    const visibleLines = layout.staffIndices ? new Map(layout.staffIndices.map((index, visible) => [index, layout.staves[visible]])) : null;
    const systems = page.systems.map(system => {
      const blocks = system.blocks.map(block => {
        const staves = block.staves.map(staff => {
          const index = staffIndex++;
          return { ...staff, index, lines: (visibleLines ? visibleLines.get(index) : layout.staves[index]) || [] };
        });
        return { ...block, staves, bounds: bounds(staves.filter(staff => staff.lines.length), layout) };
      });
      return { ...system, blocks, bounds: bounds(blocks.flatMap(block => block.staves).filter(staff => staff.lines.length), layout) };
    });
    const scene = createScene(layout, systems, page.id, page.referenceSettings);
    return { id: page.id, settings: page.settings, layout, systems, scene, valid: layout.valid,
      ...(page.referenceSettings ? { referenceSettings: page.referenceSettings } : {}),
      frame: { width: layout.width, height: layout.height, content: { left: layout.left, right: layout.right, top: layout.top, bottom: layout.bottom } } };
  });
  return { schemaVersion: model.schemaVersion, pages, valid: pages.every(page => page.valid) };
}
