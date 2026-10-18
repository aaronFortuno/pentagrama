import { analytics } from './analytics.js?v=1.17.1';
import { iconMarkup } from './icons.js?v=1.17.1';
import { openDialog, closeDialog, bindAnimatedDetails } from './motion.js?v=1.17.1';

// Shared footer behavior for the editor and the static template guide.
export function bindSiteDialogs({ t, copy, toast }) {
  const $ = id => document.getElementById(id);
  for (const [button, dialog, content] of [
    ['about-button', 'about-dialog', '.about-content'],
    ['version-button', 'version-dialog', '.release-timeline'],
  ]) $(button).addEventListener('click', () => {
    openDialog($(dialog)); $(dialog).querySelector(content).scrollTop = 0;
  });
  $('analytics-excluded').checked = analytics.userExcluded();
  $('analytics-browser-preference').hidden = !analytics.browserPrivacyEnabled();
  $('analytics-excluded').addEventListener('change', event => {
    const persisted = analytics.setExcluded(event.target.checked);
    event.target.checked = analytics.userExcluded();
    if (!event.target.checked) analytics.init(document.querySelector('meta[name="umami-website-id"]')?.content);
    if (!persisted) toast(t('analyticsPreferenceTemporary'));
  });
  let copyTimer;
  $('copy-lightning').addEventListener('click', async () => {
    if (!await copy($('lightning-address').textContent)) return;
    const button = $('copy-lightning'); button.innerHTML = iconMarkup('check'); button.classList.add('copied');
    $('lightning-copy-status').textContent = t('copied'); clearTimeout(copyTimer);
    copyTimer = setTimeout(() => { button.innerHTML = iconMarkup('copy'); button.classList.remove('copied'); $('lightning-copy-status').textContent = ''; }, 1800);
  });
  document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => closeDialog($(button.dataset.close))));
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.addEventListener('cancel', event => { event.preventDefault(); closeDialog(dialog); });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(dialog);
    });
  });
  document.querySelectorAll('.privacy-details').forEach(details => bindAnimatedDetails(details));
}
