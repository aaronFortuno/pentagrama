export function previewDescription(settings, t, number = String) {
  const s = settings, parts = [t(s.orientation), t(s.mode === 'blocks' ? 'blocks' : s.group ? 'groupEvery' : 'none', { n: s.group })];
  parts.push(t('margins') + ': ' + [['marginTop', s.marginTop], ['marginBottom', s.marginBottom], [s.duplex.enabled ? 'marginInside' : 'marginLeft', s.marginLeft], [s.duplex.enabled ? 'marginOutside' : 'marginRight', s.marginRight]].map(([label, value]) => t(label) + ' ' + number(value) + ' mm').join(', '));
  if (s.mode === 'blocks') parts.push(s.blocks.map((block, index) => t('block', { n: index + 1 }) + ': ' + number(block.count) + ', ' + t('inside') + ' ' + number(block.inside) + ' mm').join('; '));
  if (s.notes.enabled) parts.push(t('notesArea') + ': ' + number(s.notes.percent) + '%, ' + t(s.notes.position === 'top' ? 'notesTop' : 'notesBottom') + ', ' + t('notes_' + s.notes.pattern));
  if (s.pageText.nameDate) parts.push(t('nameDate'));
  if (s.pageText.title.trim()) parts.push(t('pageTitle') + ': ' + s.pageText.title);
  if (s.pageText.instructions.trim()) parts.push(t('pageInstructions') + ': ' + s.pageText.instructions);
  if (s.pageText.firstPageOnly && s.duplex.enabled && (s.pageText.nameDate || s.pageText.title || s.pageText.instructions)) parts.push(t('pageHeader') + ': ' + t('firstPageOnly'));
  if (s.pageText.footer.trim()) parts.push(t('customFooter') + ': ' + s.pageText.footer);
  if (s.pageText.footerImage) parts.push(t('footerImageSettings'));
  if (s.source) parts.push(t('source'));
  if (s.reference) parts.push(t('reference'));
  return parts.join('. ') + '.';
}

// Coalesce edits instead of reading every intermediate step of a slider or word.
export function createPreviewAnnouncer(output, { delay = 700, schedule = setTimeout, cancel = clearTimeout } = {}) {
  let previous, timer;
  return message => {
    if (message === previous) return;
    const initial = previous === undefined; previous = message; cancel(timer);
    if (!initial) timer = schedule(() => { output.textContent = message; }, delay);
  };
}
