import { normalizeSettings } from './settings.js?v=2.0.0-alpha.1';

export const DOCUMENT_SCHEMA_VERSION = 2;
export const MAX_DOCUMENT_PAGES = 32;
const validId = value => typeof value === 'string' && /^[A-Za-z][A-Za-z0-9_-]{0,79}$/.test(value);
function identity(value, fallback, used) {
  const id = value === undefined ? fallback : value;
  if (!validId(id) || used.has(id)) throw new Error('invalidDocumentIdentity');
  used.add(id); return id;
}

// IDs describe semantic entities, never coordinates or user-written labels.
// Callers can carry identities with a reordered block; the v1 adapter uses
// deterministic IDs until the interface gains its own structural editing.
function structure(settings, pageId, identities = {}) {
  const used = new Set([pageId]);
  const counts = settings.mode === 'blocks'
    ? Array.from({ length: settings.systems }, () => settings.blocks.map(block => block.count))
    : Array.from({ length: Math.ceil(settings.count / (settings.group || 1)) }, (_, index) => [Math.min(settings.group || 1, settings.count - index * (settings.group || 1))]);
  return counts.map((blocks, systemIndex) => {
    const supplied = identities.systems?.[systemIndex] || {};
    const systemId = `${pageId}/systems/${identity(supplied.id, `system-${systemIndex + 1}`, new Set())}`;
    if (used.has(systemId)) throw new Error('invalidDocumentIdentity'); used.add(systemId);
    return { id: systemId, blocks: blocks.map((count, blockIndex) => {
      const suppliedBlock = supplied.blocks?.[blockIndex] || {};
      const blockId = `${systemId}/blocks/${identity(suppliedBlock.id, `block-${blockIndex + 1}`, new Set())}`;
      if (used.has(blockId)) throw new Error('invalidDocumentIdentity'); used.add(blockId);
      const staves = Array.from({ length: count }, (_, staffIndex) => {
        const staffId = `${blockId}/staves/${identity(suppliedBlock.staves?.[staffIndex]?.id, `staff-${staffIndex + 1}`, new Set())}`;
        if (used.has(staffId)) throw new Error('invalidDocumentIdentity'); used.add(staffId);
        return { id: staffId };
      });
      return { id: blockId, label: settings.mode === 'blocks' ? settings.blocks[blockIndex].label : '', staves };
    }) };
  });
}

export function normalizeDocument(value = {}) {
  if (value?.schemaVersion !== undefined && value.schemaVersion !== DOCUMENT_SCHEMA_VERSION) throw new Error('unsupportedDocumentSchema');
  const explicit = value && Object.hasOwn(value, 'pages');
  const pages = explicit ? value.pages : [{ settings: value }];
  if (!Array.isArray(pages) || !pages.length || pages.length > MAX_DOCUMENT_PAGES) throw new Error('invalidDocumentPages');
  const used = new Set();
  return { schemaVersion: DOCUMENT_SCHEMA_VERSION, pages: pages.map((page, index) => {
    if (!page || typeof page !== 'object') throw new Error('invalidDocumentPage');
    const id = identity(page.id, `page-${index + 1}`, used);
    const settings = normalizeSettings(explicit ? { ...normalizeSettings(value.settings), ...page.settings } : page.settings);
    const localId = node => node.id.split('/').at(-1);
    const identities = page.identities || (Array.isArray(page.systems) ? { systems: page.systems.map(system => ({ id: localId(system), blocks: system.blocks.map(block => ({ id: localId(block), staves: block.staves.map(staff => ({ id: localId(staff) })) })) })) } : undefined);
    return { id, settings, systems: structure(settings, id, identities) };
  }) };
}
