import { analytics } from './analytics.js?v=1.15.3';
import { bindAnimatedDetails } from './motion.js?v=1.15.3';

const excluded = document.getElementById('analytics-excluded');
excluded.checked = analytics.userExcluded();
document.getElementById('analytics-browser-preference').hidden = !analytics.browserPrivacyEnabled();
excluded.addEventListener('change', () => {
  const persisted = analytics.setExcluded(excluded.checked);
  excluded.checked = analytics.userExcluded();
  if (!persisted) {
    const hint = document.getElementById('analytics-exclude-hint'); hint.textContent = hint.dataset.temporary;
  }
  if (!excluded.checked) analytics.init(document.querySelector('meta[name="umami-website-id"]')?.content);
});
document.querySelectorAll('.guide-privacy').forEach(bindAnimatedDetails);
analytics.init(document.querySelector('meta[name="umami-website-id"]')?.content);
