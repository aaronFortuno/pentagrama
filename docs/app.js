import { DEFAULTS, normalizeSettings, encodeReference, decodeReference, renderSheet } from './layout.js';

const $ = (id) => document.getElementById(id);
const storageKey = 'pentagrama.settings.v1';
let settings = { ...DEFAULTS };
try { const saved = JSON.parse(localStorage.getItem(storageKey)); if (saved && typeof saved === 'object') settings = normalizeSettings(saved); } catch { /* The page also works with browser storage disabled. */ }
const caNumber = new Intl.NumberFormat('ca-ES', { maximumFractionDigits: 2 });
let toastTimer;

function toast(message) {
  $('toast').textContent = message;
  $('toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 3200);
}

function updateRange(element) {
  const progress = (Number(element.value) - Number(element.min)) / (Number(element.max) - Number(element.min)) * 100;
  element.style.setProperty('--progress', `${progress}%`);
}

function groupDescription() {
  if (!settings.group) return 'Espai uniforme entre tots els pentagrames.';
  const whole = Math.floor(settings.count / settings.group), remaining = settings.count % settings.group;
  return `${whole} ${whole === 1 ? 'bloc' : 'blocs'} de ${settings.group} pentagrames${remaining ? ` i un bloc de ${remaining}` : ''}.`;
}

function render() {
  settings = normalizeSettings(settings);
  $('thickness').value = settings.thickness;
  $('thickness-value').textContent = `${caNumber.format(settings.thickness)} mm`;
  $('staff-count').value = settings.count;
  $('decrease-count').disabled = settings.count <= 1;
  $('increase-count').disabled = settings.count >= 24;
  const select = $('group-size');
  select.replaceChildren(new Option('Sense agrupar', '0'));
  for (let i = 2; i < settings.count; i++) select.add(new Option(`De ${i} en ${i}`, String(i)));
  select.value = settings.group;
  select.disabled = settings.count < 3;
  $('group-spacing').value = settings.spacing;
  $('spacing-value').textContent = `${caNumber.format(settings.spacing)}×`;
  $('group-spacing-control').hidden = !settings.group;
  $('group-hint').textContent = groupDescription();
  $('show-reference').checked = settings.reference;
  const reference = encodeReference(settings);
  $('current-reference').textContent = reference;
  const sheet = renderSheet(settings);
  $('preview-paper').innerHTML = sheet;
  $('print-root').innerHTML = sheet;
  const groupText = settings.group ? `Grups de ${settings.group}` : 'Sense agrupar';
  $('layout-summary').textContent = `${settings.count} ${settings.count === 1 ? 'pentagrama' : 'pentagrames'} · ${groupText} · Línia de ${caNumber.format(settings.thickness)} mm`;
  $('preview-paper').setAttribute('aria-label', `Full A4 amb ${settings.count} pentagrames. ${groupDescription()} Gruix de ${caNumber.format(settings.thickness)} mil·límetres.${settings.reference ? ' Amb referència al peu.' : ''}`);
  updateRange($('thickness'));
  updateRange($('group-spacing'));
  try { localStorage.setItem(storageKey, JSON.stringify(settings)); } catch { /* Storage is optional. */ }
}

$('thickness').addEventListener('input', event => { settings.thickness = Number(event.target.value); render(); });
$('group-spacing').addEventListener('input', event => { settings.spacing = Number(event.target.value); render(); });
$('group-size').addEventListener('change', event => { settings.group = Number(event.target.value); render(); });
$('show-reference').addEventListener('change', event => { settings.reference = event.target.checked; render(); });
$('staff-count').addEventListener('input', event => {
  const value = Number(event.target.value);
  if (event.target.value !== '' && Number.isInteger(value) && value >= 1 && value <= 24) { settings.count = value; render(); }
});
$('staff-count').addEventListener('change', event => {
  if (event.target.value.trim() !== '' && Number.isFinite(Number(event.target.value))) settings.count = Number(event.target.value);
  render();
});
$('decrease-count').addEventListener('click', () => { settings.count--; render(); });
$('increase-count').addEventListener('click', () => { settings.count++; render(); });
$('reset-button').addEventListener('click', () => { settings = { ...DEFAULTS }; $('restore-message').textContent = ''; $('reference-input').value = ''; render(); toast('S’ha restablert el full inicial.'); });
$('restore-form').addEventListener('submit', event => {
  event.preventDefault();
  try {
    const restored = decodeReference($('reference-input').value);
    settings = { ...restored, reference: settings.reference };
    render();
    $('restore-message').textContent = 'Configuració recuperada.';
    $('restore-message').classList.remove('error');
    $('reference-input').removeAttribute('aria-invalid');
    toast('Ja tens el full amb aquesta configuració.');
  } catch (error) {
    $('restore-message').textContent = error.message;
    $('restore-message').classList.add('error');
    $('reference-input').setAttribute('aria-invalid', 'true');
  }
});
$('copy-reference').addEventListener('click', async () => {
  const reference = encodeReference(settings);
  try {
    await navigator.clipboard.writeText(reference);
    toast('Referència copiada.');
  } catch {
    $('restore-details').open = true;
    $('reference-input').value = reference;
    $('reference-input').focus();
    $('reference-input').select();
    toast('Selecciona i copia la referència.');
  }
});
$('print-button').addEventListener('click', () => {
  $('staff-count').blur();
  render();
  window.print();
});
window.addEventListener('beforeprint', render);
render();
