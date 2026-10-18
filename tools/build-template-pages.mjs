import { mkdir, writeFile } from 'node:fs/promises';
import { LANGUAGES, translate } from '../docs/i18n.js';
import { DEFAULT_TEMPLATES, suggestedTemplateSettings } from '../docs/library.js';
import { createLayout, renderSheet, encodeShareHash } from '../docs/layout.js';
import { RELEASE } from './site-data.mjs';
import { escapeHTML as escape } from './html.mjs';

const root = new URL('../', import.meta.url);
export const TEMPLATE_GUIDES = Object.freeze([
  { id: 'choir-piano', slug: 'choir-piano', prefix: 'guideChoir' },
  { id: 'orchestra', slug: 'orchestra-a3', prefix: 'guideOrchestra' },
]);
export const templatePath = (locale, guide) => `${locale}/templates/${guide ? `${guide.slug}/` : ''}`;
export function templateEditorURL(locale, template, homepage) {
  const settings = suggestedTemplateSettings(template, (key, values) => translate(locale, key, values));
  const url = new URL(`${locale}/`, homepage); url.hash = encodeShareHash(settings);
  return url;
}

export function renderTemplatePage(locale, homepage, guide) {
  const t = (key, values) => escape(translate(locale, key, values));
  const site = new URL(homepage), path = templatePath(locale, guide), url = new URL(path, site);
  const title = t(guide ? `${guide.prefix}Title` : 'catalogTitle');
  const description = t(guide ? `${guide.prefix}Description` : 'catalogIntro');
  const route = code => templatePath(code, guide);
  const links = Object.entries(LANGUAGES).map(([code, name]) => `<a href="./${route(code)}" lang="${code}" hreflang="${code}"${locale === code ? ' aria-current="page"' : ''}>${escape(name)}</a>`).join('');
  const alternates = Object.keys(LANGUAGES).map(code => `<link rel="alternate" hreflang="${code}" href="${escape(new URL(route(code), site).href)}">`).join('\n');
  const facts = template => {
    const settings = suggestedTemplateSettings(template, key => translate(locale, key)), layout = createLayout(settings);
    return `${settings.paper === 'LETTER' ? 'Letter' : settings.paper} · ${t('staffCount', { n: layout.count })} · ${t('lineSpacing')}: ${new Intl.NumberFormat(locale).format(settings.lineSpacing)} mm`;
  };
  const editorLink = template => escape(`./${locale}/${templateEditorURL(locale, template, homepage).hash}`);
  const card = template => {
    const detail = TEMPLATE_GUIDES.find(item => item.id === template.id);
    return `<article class="guide-card"><a class="guide-card-image" href="${detail ? `./${templatePath(locale, detail)}` : editorLink(template)}"><img src="./assets/templates/${template.id}.svg?v=${RELEASE.version}" alt="${t(template.key)}" width="420" height="594" loading="lazy"></a><div class="guide-card-copy"><h2>${t(template.key)}</h2><p class="guide-facts">${facts(template)}</p><a class="guide-link" href="${detail ? `./${templatePath(locale, detail)}` : editorLink(template)}">${t(detail ? 'viewTemplate' : 'openTemplate')} <span aria-hidden="true">→</span></a></div></article>`;
  };
  let content;
  if (guide) {
    const template = DEFAULT_TEMPLATES.find(item => item.id === guide.id), settings = suggestedTemplateSettings(template, key => translate(locale, key));
    const blockRows = settings.blocks.map((block, index) => `<div><dt>${escape(block.label || translate(locale, 'block', { n: index + 1 }))}</dt><dd>${t('staffCount', { n: block.count })}${block.count > 1 ? ` · ${t('inside')}: ${new Intl.NumberFormat(locale).format(block.inside)}` : ''}</dd></div>`).join('');
    content = `<div class="guide-detail"><section class="guide-intro"><a class="guide-eyebrow" href="./${templatePath(locale)}">${t('templateGuide')}</a><h1>${title}</h1><p class="guide-lead">${description}</p><a class="guide-button" href="${editorLink(template)}">${t('openTemplate')} <span aria-hidden="true">→</span></a><p>${t(`${guide.prefix}Body`)}</p><p class="guide-facts">${facts(template)}</p><dl class="guide-blocks">${blockRows}<div><dt>${t('systems')}</dt><dd>${settings.systems}</dd></div></dl><p class="guide-note">${t('guideBlank')}</p></section><figure class="guide-sheet"><img src="./assets/templates/${template.id}.svg?v=${RELEASE.version}" alt="${title}" width="420" height="594"><figcaption>${t(template.key)}</figcaption></figure></div><section class="guide-how"><h2>${t('guideHowTitle')}</h2><p>${t('guideHow')}</p><a class="guide-link" href="./${templatePath(locale)}">${t('templateGuide')} <span aria-hidden="true">→</span></a></section>`;
  } else {
    content = `<section class="guide-heading"><h1>${title}</h1><p class="guide-lead">${description}</p><p>${t('guideBlank')}</p></section><div class="guide-grid">${DEFAULT_TEMPLATES.map(card).join('')}</div><section class="guide-how"><h2>${t('guideHowTitle')}</h2><p>${t('guideHow')}</p></section>`;
  }
  return `<!doctype html>
<!-- Generated from DEFAULT_TEMPLATES and docs/i18n.js by tools/build-template-pages.mjs. -->
<html lang="${locale}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#f6f5f1"><meta name="umami-website-id" content="20ee7f51-6ba8-4486-86a5-f347851105b2"><base href="${'../'.repeat(guide ? 3 : 2)}"><title>${title} · Pentagrama</title><meta name="description" content="${description}"><link rel="canonical" href="${escape(url.href)}">${alternates}<link rel="alternate" hreflang="x-default" href="${escape(new URL(route('en'), site).href)}"><link rel="stylesheet" href="./template-pages.css?v=${RELEASE.version}"><script type="module" src="./template-pages.js?v=${RELEASE.version}"></script></head>
<body><div class="guide-shell"><header class="guide-header"><a class="guide-brand" href="./${locale}/">pentagrama<span>.</span></a><a class="guide-link" href="./${locale}/">${t('guideBack')} <span aria-hidden="true">↗</span></a></header><nav class="guide-languages" aria-label="${t('language')}">${links}</nav><main>${content}</main><footer class="guide-footer"><p>${t('footer')}</p><details class="guide-privacy"><summary>${t('analyticsTitle')} <span aria-hidden="true">⌄</span></summary><p>${t('analyticsInfo')}</p><p>${t('analyticsPrivacy')}</p><label class="guide-exclusion"><span>${t('analyticsExclude')}</span><input id="analytics-excluded" type="checkbox" aria-describedby="analytics-exclude-hint"></label><small id="analytics-exclude-hint" data-temporary="${t('analyticsPreferenceTemporary')}">${t('analyticsExcludeHint')}</small><p id="analytics-browser-preference" hidden>${t('analyticsBrowserPreference')}</p></details></footer></div></body></html>\n`;
}

export async function buildTemplatePages(homepage) {
  const directory = new URL('docs/assets/templates/', root); await mkdir(directory, { recursive: true });
  for (const template of DEFAULT_TEMPLATES) {
    await writeFile(new URL(`${template.id}.svg`, directory), renderSheet({ ...template.settings, source: false, reference: false }));
  }
  const urls = [];
  for (const locale of Object.keys(LANGUAGES)) for (const guide of [undefined, ...TEMPLATE_GUIDES]) {
    const path = templatePath(locale, guide), directory = new URL(`docs/${path}`, root);
    await mkdir(directory, { recursive: true });
    await writeFile(new URL('index.html', directory), renderTemplatePage(locale, homepage, guide));
    urls.push(new URL(path, homepage));
  }
  return urls;
}
