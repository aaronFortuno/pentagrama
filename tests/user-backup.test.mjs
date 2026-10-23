import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { readUserProfile, createUserBackup, parseUserBackup, restoreUserBackup, PROFILE_KEYS, PROFILE_REVISION_KEY, BACKUP_MAX_BYTES } from '../docs/user-backup.js';
import { normalizeSettings } from '../docs/layout.js';
import { textPreferences } from '../docs/text-preferences.js';
import { LANGUAGES } from '../docs/i18n.js';
import { pngFixture } from './fixtures/footer-image.mjs';
const clone = value => JSON.parse(JSON.stringify(value));
function store(entries = []) {
  const data = new Map(entries);
  return { data, getItem: key => data.get(key) ?? null, setItem(key,value) { data.set(key,String(value)); }, removeItem(key) { data.delete(key); } };
}
function sample() {
  const image = { data: pngFixture(), name: 'Escola', height: 8, placement: 'before', align: 'bottom' };
  const settings = normalizeSettings({ count: 6, pageText: { nameDate: true, title: 'Música · Íñigo', footer: 'Escola', footerImage: image }, notes: { enabled: true } });
  return { settings, baseline: normalizeSettings({ count: 12, group: 2 }), templates: { hidden: ['trio'], saved: [{ id: 'school', name: 'Fitxa personal', settings }] }, footers: [{ id: 'logo', footer: 'Escola', footerImage: image }],
    preferences: { language: 'eu', sidebar: 'footer-settings', text: textPreferences({ titleStyle: { family: 'sans', bold: true } }), analyticsExcluded: false } };
}
const backup = () => createUserBackup(sample(), '2.6.0', new Date('2026-10-23T06:00:00Z'));
test('one portable backup contains the entire user profile including images and a separate reset baseline', () => {
  const value = backup(), decoded = parseUserBackup(JSON.stringify(value));
  assert.deepEqual(decoded.data, sample()); assert.equal(decoded.createdAt, '2026-10-23T06:00:00.000Z');
  const storage = store([['private_token','secret'],['another-app','untouched']]);
  restoreUserBackup(storage, decoded, 'restored');
  assert.deepEqual(readUserProfile(storage), sample()); assert.equal(storage.getItem(PROFILE_REVISION_KEY),'restored');
  assert.equal(storage.getItem('private_token'),'secret'); assert.equal(storage.getItem('another-app'),'untouched');
  assert.ok(!JSON.stringify(createUserBackup(readUserProfile(storage),'2.6.0')).includes('secret'));
  assert.notDeepEqual(decoded.data.settings, decoded.data.baseline);
});
test('export reads usable defaults and legacy settings while live edits can override persisted values', () => {
  const storage = store([[PROFILE_KEYS.settings,'{broken'],[PROFILE_KEYS.language,JSON.stringify('unknown')]]);
  assert.equal(readUserProfile(storage).settings.count,9);
  assert.equal(readUserProfile(storage).preferences.language,'auto');
  storage.removeItem(PROFILE_KEYS.settings); storage.setItem('pentagrama.settings.v1',JSON.stringify({count:7}));
  assert.equal(readUserProfile(storage).settings.count,7);
  assert.equal(readUserProfile(storage,{settings:{count:5}}).settings.count,5);
  assert.doesNotThrow(()=>readUserProfile({getItem(){throw Error('blocked');}}));
});
test('corrupt, incomplete, unknown and lossy backups are rejected before any data can be written', () => {
  for (const mutate of [
    v=>{v.format='other';}, v=>{delete v.data.footers;}, v=>{v.extra=true;}, v=>{v.data.extra=true;},
    v=>{v.data.settings.count=200;}, v=>{v.data.settings.pageText.footerImage.data='https://example.org/logo.png';},
    v=>{v.data.preferences.language='unknown';}, v=>{v.data.preferences.sidebar='unknown';},
    v=>{v.data.templates.saved.push(v.data.templates.saved[0]);}, v=>{v.data.footers.push(v.data.footers[0]);},
    v=>{v.data.templates.saved=Array.from({length:51},(_,i)=>({...v.data.templates.saved[0],id:'id'+i}));},
    v=>{v.data.footers=Array.from({length:9},(_,i)=>({...v.data.footers[0],id:'id'+i}));},
  ]) {
    const value=backup();mutate(value);const storage=store([['original','data']]);
    assert.throws(()=>restoreUserBackup(storage,value),/backupInvalid/);assert.deepEqual([...storage.data],[['original','data']]);
  }
  for(const text of ['{}','null','not json','{"__proto__":{"polluted":true}}',JSON.stringify({...backup(),data:{constructor:{}}})]) assert.throws(()=>parseUserBackup(text),/backupInvalid/);
  assert.throws(()=>parseUserBackup(JSON.stringify({...backup(),schemaVersion:2})),/backupUnsupported/);
  assert.throws(()=>parseUserBackup(' '.repeat(BACKUP_MAX_BYTES+1)),/backupInvalid/);
  assert.equal({}.polluted,undefined);
  assert.deepEqual(parseUserBackup('\uFEFF'+JSON.stringify(backup())).data,sample());
});
test('a partially failed restore rolls back every owned key and leaves unrelated browser data untouched', () => {
  const storage=store(Object.values(PROFILE_KEYS).map((key,i)=>[key,'previous-'+i]));storage.setItem('unrelated','keep');storage.setItem(PROFILE_REVISION_KEY,'old');
  const before=[...storage.data].sort();let writes=0,failed=false;const set=storage.setItem.bind(storage);
  storage.setItem=(key,value)=>{if(++writes===4&&!failed){failed=true;throw Error('quota');}set(key,value);};
  assert.throws(()=>restoreUserBackup(storage,backup(),'new'),/backupStorageError/);
  assert.deepEqual([...storage.data].sort(),before);
});
test('blocked storage is detected before removing anything and recovery failure retains an exportable original profile', () => {
  const storage=store();restoreUserBackup(storage,backup(),'old');const before=[...storage.data].sort();
  storage.setItem=()=>{throw Error('blocked');};
  assert.throws(()=>restoreUserBackup(storage,backup()),/backupStorageError/);assert.deepEqual([...storage.data].sort(),before);
  const second=store();restoreUserBackup(second,backup(),'old');const set=second.setItem.bind(second);let writes=0;
  second.setItem=(key,value)=>{if(++writes>1)throw Error('blocked');set(key,value);};
  let error;try{restoreUserBackup(second,backup());}catch(cause){error=cause;}
  assert.equal(error.message,'backupRecoveryError');assert.deepEqual(error.previousProfile,sample());
  assert.deepEqual(parseUserBackup(JSON.stringify(createUserBackup(error.previousProfile,'2.6.0'))).data,sample());
});
test('analytics exclusion stays enabled if either this browser or the backup opted out', () => {
  for(const current of [false,true])for(const imported of [false,true]){
    const storage=store(current?[[PROFILE_KEYS.excluded,'true']]:[]),value=backup();value.data.preferences.analyticsExcluded=imported;
    restoreUserBackup(storage,value);assert.equal(storage.getItem(PROFILE_KEYS.excluded)==='true',current||imported);
  }
});
test('every language shares one backup entry and dialog between the editor and the catalogue', async () => {
  for(const locale of Object.keys(LANGUAGES)){
    const editor=await readFile(new URL(`../docs/${locale}/index.html`,import.meta.url),'utf8');
    const catalogue=await readFile(new URL(`../docs/${locale}/templates/index.html`,import.meta.url),'utf8');
    for(const html of [editor,catalogue]){
      assert.equal((html.match(/id="backup-button"/g)||[]).length,1);
      assert.equal((html.match(/id="backup-dialog"/g)||[]).length,1);
      assert.ok(!html.includes('data-i18n="backupTitle"></h2>'));
    }
    assert.equal(editor.match(/<dialog id="backup-dialog"[\s\S]*?<\/dialog>/)[0],catalogue.match(/<dialog id="backup-dialog"[\s\S]*?<\/dialog>/)[0]);
  }
});
