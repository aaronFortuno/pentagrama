import { DEFAULT_PAGE_TEXT } from './page-text-settings.js?v=2.2.0';
export { DEFAULT_PAGE_TEXT };

export const PAPER_SIZES = Object.freeze({ A4: [210, 297], A3: [297, 420], LETTER: [215.9, 279.4] });
export const SERVICE_ADDRESS = 'pentagrama.page';
export const FOOTER_GRAY = 166;
export const FOOTER_SIZE = 2.2;
export const DEFAULT_MARGINS = Object.freeze({ marginTop: 21, marginRight: 18, marginBottom: 21, marginLeft: 18 });
export const DEFAULT_BARLINES = Object.freeze({ enabled: false, measures: 4, style: 'single', thicknessMode: 'staff', thickness: 0.16, connect: 'none' });
export const DEFAULT_CLEFS = Object.freeze({ enabled: false, type: 'treble', mode: 'uniform', pattern: Object.freeze([]) });
export const DEFAULT_DUPLEX = Object.freeze({ enabled: false, firstPageOnly: true, mirrorMargins: false });
export const DEFAULTS = Object.freeze({ count: 9, group: 0, spacing: 2.2, thickness: 0.12, reference: false, source: false, paper: 'A4', orientation: 'portrait', lineSpacing: 2, topSpace: 0, ...DEFAULT_MARGINS, mode: 'simple', systems: 1, systemGap: 18, blocks: [], barlines: DEFAULT_BARLINES, clefs: DEFAULT_CLEFS, duplex: DEFAULT_DUPLEX, pageText: DEFAULT_PAGE_TEXT });
