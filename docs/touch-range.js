// Let vertical touch gestures scroll without a native range jumping on touch-down.
export function rangeValueAt(input, clientX) {
  const { left, width } = input.getBoundingClientRect(), thumb = Math.min(14, width);
  const min = Number(input.min || 0), max = Number(input.max || 100), step = Number(input.step) || 1;
  const ratio = Math.max(0, Math.min(1, (clientX - left - thumb / 2) / Math.max(1, width - thumb)));
  return Math.max(min, Math.min(max, Number((min + Math.round(ratio * (max - min) / step) * step).toFixed(8))));
}

export function bindTouchRange(input) {
  let gesture;
  const setValue = value => {
    if (Number(input.value) === Number(value)) return;
    input.value = value; input.dispatchEvent(new Event('input', { bubbles: true }));
  };
  input.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch') return;
    event.preventDefault(); if (!event.isPrimary) return;
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, value: input.value, intent: 'pending' };
    input.setPointerCapture(event.pointerId);
  });
  input.addEventListener('pointermove', event => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const x = Math.abs(event.clientX - gesture.x), y = Math.abs(event.clientY - gesture.y);
    if (gesture.intent === 'pending' && Math.max(x, y) >= 8) {
      if (y >= x) gesture.intent = 'scroll';
      else if (x >= y * 1.35) { gesture.intent = 'adjust'; input.focus({ preventScroll: true }); }
    }
    if (gesture.intent === 'adjust') setValue(rangeValueAt(input, event.clientX));
  });
  input.addEventListener('pointerup', event => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const current = gesture; gesture = undefined;
    const tap = current.intent === 'pending' && Math.hypot(event.clientX - current.x, event.clientY - current.y) < 8;
    if (tap || current.intent === 'adjust') {
      input.focus({ preventScroll: true }); setValue(rangeValueAt(input, event.clientX));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  const cancel = event => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const value = gesture.value; gesture = undefined; setValue(value);
  };
  input.addEventListener('pointercancel', cancel);
  input.addEventListener('lostpointercapture', cancel);
  input.addEventListener('click', event => { if (event.pointerType === 'touch') event.preventDefault(); });
}
