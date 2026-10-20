// View coordinates only: zoom and pan never change the printable geometry.
export const MIN_ZOOM = 1, MAX_ZOOM = 4;

export function previewView(page, viewport, zoom = 1, pan = { x: 0, y: 0 }, { fitWidth = false } = {}) {
  const level = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
  const width = Math.max(0, viewport.width), height = Math.max(0, viewport.height);
  const scale = (fitWidth ? width / page.width : Math.min(width / page.width, height / page.height)) * level;
  const paperWidth = page.width * scale, paperHeight = page.height * scale;
  const maxX = Math.max(0, (paperWidth - width) / 2), maxY = Math.max(0, (paperHeight - height) / 2);
  return { zoom: level, width: paperWidth, height: paperHeight, canPan: maxX > 0 || paperHeight > height,
    x: Math.max(-maxX, Math.min(maxX, pan.x)),
    y: fitWidth ? Math.max(Math.min(0, height - paperHeight), Math.min(0, pan.y)) : Math.max(-maxY, Math.min(maxY, pan.y)) };
}

export function spreadMode({ width, height }) {
  return width <= 760 ? 'peek' : height > width ? 'column' : 'row';
}

// A spread is one navigable surface. Physical page sizes never change here.
export function spreadView(pages, viewport, zoom = 1, pan = { x: 0, y: 0 }, { mode = 'row', fitWidth = false } = {}) {
  const width = Math.max(0, viewport.width), height = Math.max(0, viewport.height);
  if (pages.length === 1) {
    const view = previewView(pages[0], viewport, zoom, pan, { fitWidth });
    return { ...view, left: (width - view.width) / 2 + view.x,
      top: (fitWidth ? 0 : (height - view.height) / 2) + view.y,
      pages: [{ left: 0, top: 0, width: view.width, height: view.height }] };
  }
  const level = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom)), gap = 8;
  const vertical = mode === 'column', peek = mode === 'peek';
  const physicalWidth = vertical ? Math.max(...pages.map(page => page.width)) : pages.reduce((sum, page) => sum + page.width, 0) + gap * (pages.length - 1);
  const physicalHeight = vertical ? pages.reduce((sum, page) => sum + page.height, 0) + gap * (pages.length - 1) : Math.max(...pages.map(page => page.height));
  const scale = (peek ? width * .86 / pages[0].width : Math.min(width / physicalWidth, height / physicalHeight)) * level;
  const spreadWidth = physicalWidth * scale, spreadHeight = physicalHeight * scale;
  const maxX = Math.max(0, (spreadWidth - width) / 2), maxY = Math.max(0, (spreadHeight - height) / 2);
  const x = peek ? Math.max(Math.min(0, width - spreadWidth), Math.min(0, pan.x)) : Math.max(-maxX, Math.min(maxX, pan.x));
  const y = peek ? Math.max(Math.min(0, height - spreadHeight), Math.min(0, pan.y)) : Math.max(-maxY, Math.min(maxY, pan.y));
  let offset = 0;
  const frames = pages.map(page => {
    const frame = { left: vertical ? (physicalWidth - page.width) * scale / 2 : offset * scale,
      top: vertical ? offset * scale : 0, width: page.width * scale, height: page.height * scale };
    offset += (vertical ? page.height : page.width) + gap; return frame;
  });
  return { zoom: level, width: spreadWidth, height: spreadHeight, x, y,
    left: (peek ? 0 : (width - spreadWidth) / 2) + x, top: (peek ? 0 : (height - spreadHeight) / 2) + y,
    canPan: maxX > .01 || maxY > .01, pages: frames };
}
