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
export function spreadView(pages, viewport, zoom = 1, pan = { x: 0, y: 0 }, { mode = 'row', fitWidth = false, labelHeight = 0 } = {}) {
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
  const labelsHeight = labelHeight * (vertical ? pages.length : 1);
  const scale = (peek ? width * .86 / pages[0].width : Math.min(width / physicalWidth, Math.max(0, height - labelsHeight) / physicalHeight)) * level;
  const spreadWidth = physicalWidth * scale, spreadHeight = physicalHeight * scale + labelsHeight;
  const maxX = Math.max(0, (spreadWidth - width) / 2), maxY = Math.max(0, (spreadHeight - height) / 2);
  // The front is the right-hand (odd) page. A zero pan fits that page on
  // mobile, leaving the back visible on its left; dragging right reveals it.
  const x = peek ? Math.max(0, Math.min(Math.max(0, spreadWidth - width), pan.x)) : Math.max(-maxX, Math.min(maxX, pan.x));
  const y = peek ? Math.max(Math.min(0, height - spreadHeight), Math.min(0, pan.y)) : Math.max(-maxY, Math.min(maxY, pan.y));
  let offset = 0;
  const frames = new Array(pages.length);
  const order = pages.map((_, index) => index);
  if (!vertical && pages.length === 2) order.reverse();
  order.forEach((pageIndex, index) => {
    const page = pages[pageIndex];
    const frame = { left: vertical ? (physicalWidth - page.width) * scale / 2 : offset * scale,
      top: (vertical ? offset * scale + index * labelHeight : 0) + labelHeight, width: page.width * scale, height: page.height * scale };
    offset += (vertical ? page.height : page.width) + gap; frames[pageIndex] = frame;
  });
  return { zoom: level, width: spreadWidth, height: spreadHeight, x, y,
    left: (peek ? width - spreadWidth : (width - spreadWidth) / 2) + x, top: (peek ? 0 : (height - spreadHeight) / 2) + y,
    canPan: maxX > .01 || maxY > .01, pages: frames };
}
