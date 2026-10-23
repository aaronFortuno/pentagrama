import test from 'node:test';
import assert from 'node:assert/strict';
import { createDocument, renderSvgPage, renderPrintDocument, createPdfDocument } from '../docs/engine/index.js';
import { normalizeSettings, encodeReference, encodeShareHash, decodeShareHash, footerLines, FOOTER_SIZE, footerTextWidth } from '../docs/layout.js';
import { pageTextWidth } from '../docs/engine/page-font.js';
import { rasterImage, rasterPixels, normalizeFooterImage, RASTER_LIMITS } from '../docs/engine/raster-image.js';
import { rasterFileType } from '../docs/footer-image-upload.js';
import { normalizeFooterLibrary, saveFooter, deleteFooter, footerSnapshot } from '../docs/footer-library.js';
import { addTemplate, normalizeLibrary } from '../docs/library.js';
import { createSettingsHistory } from '../docs/settings-history.js';
import { createResetBaseline } from '../docs/settings-baseline.js';
import { pngFixture } from './fixtures/footer-image.mjs';

const data = pngFixture(), image = { data, name: 'Escola', height: 12 }, near = (a, b) => assert.ok(Math.abs(a - b) < 1e-5, `${a} != ${b}`);
test('bounded PNGs preserve every RGB and alpha sample through all five PNG filters', () => {
  for (let filter = 0; filter <= 4; filter++) for (const channels of [3, 4]) {
    const source = pngFixture(12, 6, undefined, filter, channels), asset = rasterImage(source);
    assert.ok(asset); assert.equal(rasterImage(source), asset);
    const { rgb, alpha } = rasterPixels(asset);
    for (let y = 0; y < 6; y++) for (let x = 0; x < 12; x++) {
      assert.deepEqual([...rgb.subarray((y * 12 + x) * 3, (y * 12 + x + 1) * 3)], [x * 19, y * 37, 100]);
      assert.equal(alpha[y * 12 + x], channels === 3 || (x + y) % 3 ? 255 : 0);
    }
  }
});

test('image normalization rejects external, vector, damaged and oversized payloads and bounds options', () => {
  for (const value of [null, '', 'https://example.org/logo.png', 'data:image/svg+xml,<svg/>', data.slice(0, -6), 'data:image/png;base64,' + 'a'.repeat(200000)]) {
    assert.equal(rasterImage(value), null);
  }
  const damaged = Buffer.from(data.split(',')[1], 'base64'); damaged[damaged.length - 1] ^= 1;
  assert.equal(rasterImage('data:image/png;base64,' + damaged.toString('base64')), null);
  assert.equal(rasterImage(pngFixture(1025, 1)), null);
  assert.equal(rasterImage(pngFixture(12, 6, undefined, 5)), null);
  assert.equal(normalizeFooterImage({ ...image, height: 90, placement: 'evil', align: 'evil' }).height, 18);
  assert.equal(normalizeFooterImage({ ...image, height: -1 }).height, 3);
  assert.equal(normalizeFooterImage({ ...image, height: 8.2 }).height, 8);
  assert.equal(normalizeFooterImage(image).placement, 'before');
  assert.equal(normalizeFooterImage({ data: 'https://example.org' }), null);
  for (const [bytes, type] of [[[137,80,78,71], 'image/png'], [[255,216,255], 'image/jpeg'], [[82,73,70,70,0,0,0,0,87,69,66,80], 'image/webp'], [[60,115,118,103], null]]) assert.equal(rasterFileType(Uint8Array.from(bytes)), type);
});

test('image and text respect page edges, reference and source slots in every format and arrangement', () => {
  for (const paper of ['A4','A3','LETTER']) for (const orientation of ['portrait','landscape']) for (const placement of ['before','after','above','below']) for (const align of ['top','middle','bottom']) for (const reference of [false,true]) for (const source of [false,true]) {
    const s = normalizeSettings({ paper, orientation, count: 4, reference, source, marginLeft: 39, marginRight: 18, pageText: { footer: 'Escola de Música · Aula Oberta', footerImage: { ...image, placement, align, height: 18 } }, duplex: { enabled: true, mirrorMargins: true } });
    const doc = createDocument(s); assert.ok(doc.valid);
    for (const page of doc.pages) {
      const rows = footerLines(page.settings, page.referenceSettings), picture = rows.find(e => e.kind === 'image'), custom = rows.find(e => e.role === 'custom-footer');
      const customWidth = pageTextWidth(custom.text, custom.fontSize), customLeft = custom.x - customWidth / 2, customRight = custom.x + customWidth / 2;
      assert.ok(picture.width <= RASTER_LIMITS.width && picture.height <= RASTER_LIMITS.height);
      near(picture.width / picture.height, 2);
      assert.ok(picture.x >= page.layout.left && picture.x + picture.width <= page.layout.right + 1e-6);
      assert.ok(customLeft >= page.layout.left && customRight <= page.layout.right + 1e-6);
      assert.ok(picture.y > page.layout.staves.at(-1)[4] + 2.9);
      assert.ok(picture.y + picture.height < page.frame.height);
      for (const row of rows.filter(e => !e.role)) {
        const width = footerTextWidth(row.text, row.fontSize ?? FOOTER_SIZE);
        if (row.anchor === 'start') assert.ok(row.x + width < Math.min(picture.x, customLeft));
        else assert.ok(row.x - width > Math.max(picture.x + picture.width, customRight));
      }
      if (placement === 'before') assert.ok(picture.x + picture.width < customLeft);
      if (placement === 'after') assert.ok(customRight < picture.x);
      if (placement === 'above') assert.ok(picture.y + picture.height < custom.y - custom.fontSize);
      if (placement === 'below') assert.ok(custom.y < picture.y);
    }
  }
});

test('image-only, tall and wide marks scale without disturbing other footer baselines', () => {
  for (const [width, height] of [[1,100], [100,1], [20,20]]) for (const footer of ['', 'Text molt llarg · '.repeat(8)]) {
    const doc = createDocument({ count: 3, marginLeft: 80, marginRight: 80, marginBottom: 1, source: true, reference: true, pageText: { footer, footerImage: { data: pngFixture(width,height), height: 18 } } });
    assert.ok(doc.valid); const page = doc.pages[0], rows = footerLines(page.settings), picture = rows.find(e=>e.kind==='image');
    assert.ok(picture.x >= 80 && picture.x + picture.width <= 130);
    assert.ok(picture.height <= 18);
    const original = footerLines({ ...page.settings, pageText: { footer: 'Text' } });
    for (const row of rows.filter(e=>!e.role)) near(row.y, original.find(e=>e.anchor===row.anchor && !e.role).y);
  }
});

test('SVG, print and PDF embed the same color image, with one shared RGB object and alpha mask across both sides', () => {
  const doc = createDocument({ pageText: { footer: 'Escola de Música', footerImage: image }, duplex: { enabled: true } });
  assert.ok(doc.valid); const pdf = new TextDecoder().decode(createPdfDocument(doc)), points = n => (n * 72 / 25.4).toFixed(5);
  assert.equal((pdf.match(/\/Subtype \/Image/g) || []).length, 2);
  assert.equal((pdf.match(/\/SMask /g) || []).length, 1);
  assert.ok(pdf.includes('/ColorSpace /DeviceRGB')); assert.ok(pdf.includes('/ColorSpace /DeviceGray'));
  for (const page of doc.pages) {
    const item = page.scene.find(e=>e.kind==='image'), svg = renderSvgPage(page);
    assert.ok(svg.includes(`<image href="${data}" x="${item.x}" y="${item.y}" width="${item.width}" height="${item.height}"`));
    assert.ok(renderPrintDocument(doc).includes(svg));
    assert.ok(pdf.includes(`q ${points(item.width)} 0 0 ${points(item.height)} ${points(item.x)} ${points(page.frame.height-item.y-item.height)} cm /Im1 Do Q`));
  }
  const xref = Number(/startxref\n(\d+)/.exec(pdf)[1]); assert.equal(pdf.slice(xref, xref+4), 'xref');
});

test('images stay in personal templates, undo and reset while geometry and shared links exclude their contents', () => {
  const settings = normalizeSettings({ pageText: { title: 'Activitat', footer: 'Escola', footerImage: image } });
  const plain = normalizeSettings({ ...settings, pageText: { ...settings.pageText, footerImage: null } });
  assert.equal(encodeReference(settings), encodeReference(plain)); assert.equal(encodeShareHash(settings), encodeShareHash(plain));
  assert.deepEqual(decodeShareHash(encodeShareHash(settings)), plain);
  assert.equal(encodeShareHash({ pageText: { footerImage: image } }), encodeShareHash({}));
  const library = normalizeLibrary(addTemplate({}, { id: 'school', name: 'Escola', settings }));
  assert.deepEqual(library.saved[0].settings.pageText, settings.pageText);
  const history = createSettingsHistory(plain); history.record(settings); assert.deepEqual(history.undo(), plain); assert.deepEqual(history.redo(), settings);
  const baseline = createResetBaseline(settings); assert.deepEqual(baseline.restore(), settings);
  assert.ok(!encodeShareHash(settings).includes(data));
});

test('a logo-only PDF needs no text fonts and still exposes a complete image resource on every page', () => {
  const doc = createDocument({ pageText: { footerImage: image }, duplex: { enabled: true } });
  const pdf = new TextDecoder().decode(createPdfDocument(doc));
  assert.ok(doc.valid); assert.ok(!pdf.includes('/BaseFont'));
  assert.equal((pdf.match(/\/XObject << \/Im1 \d+ 0 R >>/g) || []).length, 2);
  assert.equal((pdf.match(/\/Im1 Do Q/g) || []).length, 2);
  assert.equal((pdf.match(/\/Subtype \/Image/g) || []).length, 2);
});

test('saved footers contain only footer options, deduplicate, validate, reuse and delete without changing originals', () => {
  const current = { title: 'Private task', nameDate: true, footer: 'Escola', footerImage: image };
  let library = saveFooter([], current, 'one');
  assert.deepEqual(Object.keys(library[0]), ['id','footer','footerImage','footerStyle','footerAlign']);
  assert.equal(saveFooter(library, current, 'two').length, 1);
  assert.deepEqual(footerSnapshot(library[0]), footerSnapshot(current));
  const original = JSON.stringify(library);
  assert.deepEqual(deleteFooter(library,'one'), []); assert.equal(JSON.stringify(library), original);
  assert.deepEqual(normalizeFooterLibrary([null, {id:'bad<>',footer:'text'}, {id:'none',footer:''}, ...library, ...library]), library);
  for (let i=2;i<=8;i++) library=saveFooter(library,{footer:'Footer '+i},'id'+i);
  assert.throws(()=>saveFooter(library,{footer:'Ninth'},'nine'),/footerLibraryFull/);
  assert.throws(()=>saveFooter([],{},'empty'),/emptyFooter/);
  assert.equal(normalizeFooterLibrary(JSON.parse(JSON.stringify(library))).length,8);
});


test('formatted image footers protect neighbouring bands and retain style in the footer library', () => {
  for(const placement of ['before','after','above','below'])for(const align of ['left','center','right'])for(const family of ['serif','sans','lora']){
    const options={footer:'Conservatori · Àlbum',footerStyle:{family,size:8,bold:true,italic:true,underline:true},footerAlign:align,footerImage:{...image,placement,height:18}};
    const doc=createDocument({count:4,source:true,reference:true,pageText:options,duplex:{enabled:true,mirrorMargins:true}});assert.ok(doc.valid);
    for(const page of doc.pages){
      const rows=footerLines(page.settings,page.referenceSettings),picture=rows.find(e=>e.kind==='image'),text=rows.find(e=>e.role==='custom-footer'),width=pageTextWidth(text.text,text.fontSize,text.fontFace);
      for(const outer of rows.filter(e=>!e.role)){
        const w=footerTextWidth(outer.text,outer.fontSize??FOOTER_SIZE);
        if(outer.anchor==='start')assert.ok(outer.x+w<Math.min(picture.x,text.x-width/2));
        else assert.ok(outer.x-w>Math.max(picture.x+picture.width,text.x+width/2));
      }
      assert.ok(rows.find(e=>e.role==='custom-footer-underline').y1<page.frame.height);
    }
    const saved=saveFooter([],options,'formatted');assert.deepEqual(footerSnapshot(saved[0]),footerSnapshot(options));
  }
});
