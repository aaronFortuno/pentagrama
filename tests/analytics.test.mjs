import test from 'node:test';
import assert from 'node:assert/strict';
import { createAnalytics, sanitizePayload } from '../docs/analytics.js';

const website = '00000000-0000-4000-8000-000000000001';
function environment(hostname = 'pentagrama.page') {
  const stored = new Map(), scripts = [], calls = [];
  return {
    location: { hostname }, navigator: {}, scripts, calls,
    localStorage: { getItem: key => stored.get(key), setItem: (key, value) => stored.set(key, value), removeItem: key => stored.delete(key) },
    document: { createElement: () => ({ dataset: {} }), head: { append: script => scripts.push(script) } },
    umami: { track: (...args) => calls.push(args) },
  };
}

test('analytics strips private shared configurations, names and arbitrary properties from every payload', () => {
  const payload = { website, url: '/?note=PRIVATE&utm_source=community&utm_campaign=launch_satb#P3~PRIVATE', title: 'PRIVATE', referrer: 'https://school.example/private?name=PRIVATE#PRIVATE', language: 'ca-ES', screen: '1280x720', distinctId: 'PRIVATE', name: 'print_requested', data: { paper: 'A3', mode: 'blocks', language: 'ca', templateName: 'PRIVATE', blocks: [{ label: 'PRIVATE' }] } };
  const safe = sanitizePayload('event', payload);
  assert.equal(safe.url, '/?utm_source=community&utm_campaign=launch_satb');
  assert.equal(safe.referrer, 'https://school.example');
  assert.deepEqual(safe.data, { paper: 'A3', mode: 'blocks', language: 'ca' });
  assert.equal(JSON.stringify(safe).includes('PRIVATE'), false);
  assert.equal(sanitizePayload('identify', payload), false);
  assert.equal(sanitizePayload('event', { ...payload, name: 'PRIVATE' }), false);
  assert.equal(sanitizePayload('event', { ...payload, url: 'https://other.example/PRIVATE' }), false);
  assert.equal(sanitizePayload('event', { ...payload, website: 'invalid' }), false);
});

test('tracking loads once in production and respects opt-out, Do Not Track and Global Privacy Control', () => {
  const env = environment(), analytics = createAnalytics(env);
  assert.equal(analytics.init(website), true); assert.equal(analytics.init(website), true);
  assert.equal(env.scripts.length, 1); assert.equal(env.scripts[0].async, true);
  assert.equal(env.scripts[0].dataset.excludeHash, 'true');
  assert.equal(env.pentagramaBeforeSend('event', { website, url: '/#PRIVATE' }).url, '/');
  for (const hostname of ['localhost', '127.0.0.1', 'aaronfortuno.github.io']) {
    const local = environment(hostname); assert.equal(createAnalytics(local).init(website), false); assert.equal(local.scripts.length, 0);
  }
  for (const preference of [{ doNotTrack: '1' }, { globalPrivacyControl: true }]) {
    const privateEnv = environment(); Object.assign(privateEnv.navigator, preference);
    assert.equal(createAnalytics(privateEnv).init(website), false); assert.equal(privateEnv.scripts.length, 0);
  }
  analytics.setExcluded(true);
  assert.equal(analytics.track('print_requested', { paper: 'A4' }), false);
  assert.equal(env.pentagramaBeforeSend('event', { website, url: '/' }), false);
  assert.equal(createAnalytics(env).excluded(), true);
  analytics.setExcluded(false); assert.equal(analytics.excluded(), false);
});

test('blocked or failing analytics never throws and only bounded event properties can leave the app', async () => {
  const env = environment(), analytics = createAnalytics(env);
  assert.equal(analytics.track('print_requested'), false);
  analytics.init(website);
  analytics.track('template_saved', { kind: 'personal', name: 'PRIVATE', id: 'PRIVATE' });
  assert.deepEqual(env.calls, [['template_saved', { kind: 'personal' }]]);
  env.umami = undefined; assert.equal(analytics.track('print_requested'), false);
  env.umami = { track: () => { throw new Error('blocked'); } }; assert.equal(analytics.track('print_requested'), false);
  env.umami = { track: () => Promise.reject(new Error('blocked')) }; assert.equal(analytics.track('print_requested'), true);
  await new Promise(resolve => setTimeout(resolve, 0));
  env.localStorage.setItem = () => { throw new Error('storage disabled'); };
  assert.equal(analytics.setExcluded(true), false); assert.equal(analytics.excluded(), true);
  assert.equal(analytics.track('share_requested'), false);
});
