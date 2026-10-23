// Compare the configured structure with the actual scene, including both sides
// and every repetition. Do not infer cropping just from the reserved percentage.
export function notesUsage(document) {
  const pages = document.pages.map(page => ({ visible: page.layout.visibleCount ?? page.layout.count, total: page.layout.count }));
  const affected = pages.some(page => page.visible < page.total);
  const blockCounts = document.pages[0].settings.mode === 'blocks' ? document.pages[0].settings.blocks.map((block, index) => {
    const visible = document.pages.flatMap(page => page.systems.map(system => system.blocks[index].staves.filter(staff => staff.lines.length).length));
    return { total: block.count, min: Math.min(...visible), max: Math.max(...visible) };
  }) : [];
  return { pages, affected, blockCounts, blocksAffected: affected && blockCounts.some(block => block.min < block.total) };
}

export function notesFeedback(usage, t, number = String) {
  const count = page => t('notesVisibleCount', { visible: number(page.visible), total: number(page.total) });
  const different = usage.pages.length > 1 && usage.pages.some(page => page.visible !== usage.pages[0].visible || page.total !== usage.pages[0].total);
  const countText = different ? usage.pages.map((page, index) => t(index ? 'backSide' : 'frontSide') + ': ' + count(page)).join(' · ') : count(usage.pages[0]);
  const message = usage.affected ? t('notesCropHint', { count: countText }) + (usage.blocksAffected ? ' ' + t('notesBlocksAffected') : '') : '';
  const blocks = usage.blockCounts.map(block => block.min < block.total ? t('notesBlockHint', { visible: block.min === block.max ? number(block.min) : number(block.min) + '–' + number(block.max), total: number(block.total) }) : '');
  return { countText, message, blocks };
}
