import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULTS, normalizeSettings, encodeReference, decodeReference, createLayout, renderSheet } from '../docs/layout.js';

test('every permitted layout fits A4, with exactly five lines per staff and proportional group gaps', () => {
  for (let count = 1; count <= 24; count++) {
    for (let group = 0; group < count; group++) {
      for (const spacing of [1.2, 2.2, 4]) {
        const layout = createLayout({ ...DEFAULTS, count, group, spacing });
        assert.equal(layout.staves.length, count);
        layout.staves.forEach(staff => {
          assert.equal(staff.length, 5);
          assert.ok(staff[0] >= 21 - 1e-8);
          assert.ok(staff[4] <= 276 + 1e-8);
          for (let i = 1; i < 5; i++) assert.ok(Math.abs(staff[i] - staff[i - 1] - 2) < 1e-8);
        });
        for (let i = 1; i < count; i++) {
          const actual = layout.staves[i][0] - layout.staves[i - 1][4];
          const expected = layout.gap * (layout.group && i % layout.group === 0 ? spacing : 1);
          assert.ok(actual > 0);
          assert.ok(Math.abs(actual - expected) < 1e-8);
        }
      }
    }
  }
});

test('references recreate the exact layout across all valid settings', () => {
  for (let count = 1; count <= 24; count++) for (let group = 0; group < count; group++) {
    for (const thickness of [0.05, 0.12, 0.5]) for (const spacing of [1.2, 2.2, 4]) {
      const original = normalizeSettings({ count, group, thickness, spacing });
      assert.deepEqual(decodeReference(encodeReference(original)), original);
    }
  }
});

test('invalid references are rejected rather than silently changing the layout', () => {
  for (const code of ['', 'P2-N9-G3-E22-T12', 'P1-N25-G3-E22-T12', 'P1-N9-G9-E22-T12', 'P1-N9-G1-E22-T12', 'P1-N9-G3-E41-T12', 'P1-N9-G3-E22-T4', '<script>']) {
    assert.throws(() => decodeReference(code));
  }
  assert.equal(encodeReference(decodeReference('  p1-n9-g3-e22-t12  ')), 'P1-N9-G3-E22-T12');
});

test('printed sheet has only staff lines unless the optional reference is enabled', () => {
  const clean = renderSheet(DEFAULTS);
  assert.equal((clean.match(/<line /g) || []).length, 45);
  assert.equal((clean.match(/<text /g) || []).length, 0);
  assert.ok(!/pentagrama|http|watermark/i.test(clean.replace('http://www.w3.org/2000/svg', '')));
  const annotated = renderSheet({ ...DEFAULTS, reference: true });
  assert.equal((annotated.match(/<text /g) || []).length, 1);
  assert.ok(annotated.includes(encodeReference(DEFAULTS)));
  assert.ok(annotated.includes('width="210mm" height="297mm"'));
});
