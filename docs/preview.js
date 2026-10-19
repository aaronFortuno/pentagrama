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
