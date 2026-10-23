import { openDialog } from './motion.js?v=2.7.1';
import { RELEASE } from './release.js?v=2.7.1';
import { detectLanguage } from './i18n.js?v=2.7.1';
import { BACKUP_MAX_BYTES, PROFILE_REVISION_KEY, PROFILE_KEYS, readUserProfile, createUserBackup, parseUserBackup, restoreUserBackup } from './user-backup.js?v=2.7.1';

export function bindUserBackup({ t, getProfile }) {
  const $ = id => document.getElementById(id), dialog = $('backup-dialog'), file = $('backup-file'), status = $('backup-status');
  let pending, recoveryProfile, generation = 0;
  const storage = () => window.localStorage;
  function navigate(profile) {
    const locale = detectLanguage(profile.preferences.language, navigator.languages || [navigator.language]);
    location.replace(new URL(`${locale}/`, new URL('./', import.meta.url)));
  }
  function reset() { generation++; pending = undefined; $('backup-review').hidden = true; $('backup-restore').disabled = true; status.textContent = ''; file.value = ''; }
  function error(key) { status.textContent = t(key); status.classList.add('error'); }
  $('backup-button').addEventListener('click', () => { reset(); openDialog(dialog); });
  $('backup-export').addEventListener('click', () => {
    try {
      const profile = recoveryProfile || (getProfile ? getProfile() : readUserProfile(storage()));
      const backup = createUserBackup(profile, RELEASE.version), text = JSON.stringify(backup, null, 2);
      parseUserBackup(text);
      const url = URL.createObjectURL(new Blob([text], { type: 'application/json' })), link = document.createElement('a');
      link.href = url; link.download = `pentagrama-${backup.createdAt.slice(0, 10)}.json`; link.hidden = true;
      document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 10000);
      status.classList.remove('error'); status.textContent = t('backupExported');
    } catch { error('backupExportError'); }
  });
  $('backup-import').addEventListener('click', () => { reset(); file.click(); });
  file.addEventListener('change', async () => {
    const chosen = file.files?.[0]; if (!chosen) return; const request = ++generation;
    pending = undefined; $('backup-review').hidden = true; $('backup-restore').disabled = true;
    try {
      if (chosen.size > BACKUP_MAX_BYTES) throw new Error('backupInvalid');
      const verified = parseUserBackup(new TextDecoder('utf-8', { fatal: true }).decode(await chosen.arrayBuffer()));
      if (request !== generation || !dialog.open) return;
      pending = verified;
      const locale = document.documentElement.lang;
      $('backup-date').textContent = `${new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(pending.createdAt))} · ${pending.appVersion}`;
      $('backup-template-count').textContent = pending.data.templates.saved.length;
      $('backup-footer-count').textContent = pending.data.footers.length;
      status.textContent = ''; status.classList.remove('error'); $('backup-review').hidden = false; $('backup-restore').disabled = false;
      $('backup-restore').focus({ preventScroll: true });
    } catch (cause) { error(cause.message === 'backupUnsupported' ? cause.message : 'backupInvalid'); }
    finally { file.value = ''; }
  });
  $('backup-cancel-import').addEventListener('click', () => { reset(); $('backup-import').focus({ preventScroll: true }); });
  $('backup-restore').addEventListener('click', () => {
    if (!pending) return;
    $('backup-restore').disabled = true;
    try { navigate(restoreUserBackup(storage(), pending)); }
    catch (cause) { recoveryProfile = cause.previousProfile || recoveryProfile; error(['backupStorageError', 'backupRecoveryError'].includes(cause.message) ? cause.message : 'backupInvalid'); $('backup-restore').disabled = false; }
  });
  dialog.addEventListener('close', reset);
  dialog.addEventListener('cancel', reset);
  window.addEventListener('storage', event => {
    if (event.key !== PROFILE_REVISION_KEY || !event.newValue || event.newValue === 'probe') return;
    try { navigate(readUserProfile(storage())); } catch {}
  });
}
