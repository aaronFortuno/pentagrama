# Desplegament

El contingut publicable és a `docs/`, incloses les pàgines traduïdes ja generades. Es pot servir directament com a fitxers estàtics, sense executar cap eina al servidor.

La generació també prepara el catàleg de plantilles i les quatre fitxes detallades per idioma, les miniatures de `docs/assets/templates/` i les seves entrades al sitemap. Es reutilitzen els mateixos ajustos que al sidebar de l’editor.

La capçalera i el peu es defineixen una sola vegada a `src/components/site-header.html` i `src/components/site-footer.html`. `tools/site-shell.mjs` els incorpora a `src/index.html` durant la generació i adapta la navegació de la guia. Aquesta també reutilitza els diàlegs localitzats i carrega els estils comuns de `docs/style.css`. `docs/template-pages.css` només defineix la disposició pròpia del catàleg i les fitxes. El comportament de V4V, privadesa i versions es comparteix a `docs/site-chrome.js`: els canvis en aquests elements s’han de comprovar tant al generador com a la guia.

## Publicació del projecte

La versió estable **2.0.0** incorpora el motor modular i es publica a `main`. La branca `codex/v2-modular-engine` i el repositori auxiliar continuen disponibles per a futures proves.

La publicació actual utilitza GitHub Pages, amb la branca `main` i el directori `/docs`. Les actualitzacions d’aquesta branca es publiquen automàticament a https://pentagrama.page/.

Per preparar una versió del web:

**Cada nova versió ha d’actualitzar també el resum de novetats accessible des del footer.** Escriu un o pocs punts breus, concisos i orientats a l’usuari, amb la data de publicació i les traduccions als idiomes disponibles. Aquest resum complementa l’historial detallat de `CHANGELOG.md`; no el substitueix ni n’ha de copiar els detalls tècnics.

L’historial del popup comença a **2.0.0**. Les versions 1.x es conserven íntegrament a `CHANGELOG.md`, accessibles des de l’enllaç de la capçalera, però no es mostren al popup. Conserva les versions des de 2.0.0 a `history` de `src/release.json`, de més nova a més antiga, cadascuna amb número, data i resum propi d’aproximadament una a tres línies. En preparar una nova versió, incorpora l’anterior a l’historial abans de substituir-ne la data i el resum actuals. No agrupis entrades sota «versions anteriors». Mantén el detall complet de les modificacions a `CHANGELOG.md`.

1. Actualitza `version` a `package.json`, la data i les claus del resum a `src/release.json`, les traduccions corresponents a `docs/i18n.js` i les notes de `CHANGELOG.md`.
2. Executa `node tools/version-assets.mjs`.
3. Executa `npm test` i comprova al navegador els canvis d’interfície o d’impressió que hagis fet.
4. Publica els canvis a `main`. Si ja s’han comprovat en local, no repeteixis la comprovació al web remot: la farà l’usuari manualment i comunicarà qualsevol problema. La versió, la data i el resum del footer s’han de verificar durant la revisió local.

L’eina de versionat afegeix la versió a les adreces dels estils i dels mòduls perquè el navegador carregui junts els recursos de la mateixa versió. També regenera `docs/index.html`, els directoris d’idioma, `docs/sitemap.xml`, `docs/release.js` i el QR de suport a partir de les fonts de `src/` i les traduccions. El número de versió del peu i del diàleg sempre prové de `package.json`; la data i les novetats són editorials. No instal·la dependències. Els canvis exclusivament de documentació no necessiten incrementar la versió del web.

L’avís flotant és opcional: `announcement` a `src/release.json` conté una o dues claus de traducció breus. Es mostra un sol cop als navegadors amb configuració prèvia desada, al generador o la guia, amb una barra de 12 segons i pausa durant la lectura o amb la pestanya oculta. `announcementVersion` manté la identitat d’un mateix anunci entre versions de manteniment, sense tornar-lo a mostrar; `announcementUntil` en fixa la caducitat absoluta amb fus horari. L’anunci de la 2.0.0 expira el 22 d’octubre de 2026 a les 00:00 d’Europa/Berlín. En una versió sense avís, elimina els camps `announcement`, `announcementVersion` i `announcementUntil`; el resum del footer continua sent obligatori. Les preversions de la 2.0.0 s’agrupen sota la versió estable al footer i es conserven amb el seu detall a `CHANGELOG.md`.

## Previsualització de la branca 2.x

Les preversions es poden preparar a `codex/v2-modular-engine` del repositori principal. GitHub Pages de producció llegeix `main:/docs`. Publicar una carpeta `/v2/` al mateix domini exigiria canviar aquesta branca; per mantenir-la intacta, el paquet de proves es publica a [aaronFortuno/pentagrama-preview](https://github.com/aaronFortuno/pentagrama-preview), branca `main`, arrel `/`, sense domini propi.

1. Prepara les metadades de la versió preliminar (per exemple, `2.0.0-alpha.1`) amb el mateix procediment de versions.
2. Executa `node tools/version-assets.mjs` i `npm test`; comprova la interfície i la impressió en local.
3. Executa `npm run build:preview`. Genera `dist/` amb els recursos estàtics, sense `CNAME`, sitemap ni identificador d’analítica. Totes les pàgines inclouen `noindex, nofollow` i `robots.txt` bloqueja el rastreig. Les canòniques continuen apuntant al web estable.
4. Desa i publica el codi **només a la branca experimental** del repositori principal.
5. Copia el contingut de `dist/` a un checkout separat del repositori auxiliar. Conserva-hi `.pentagrama-preview.json`, afegeix-hi la revisió del codi font (`sourceCommit`) i un README amb l’enllaç al codi font corresponent. Inclou `LICENSE` perquè el paquet també distribueix codi GPL. Publica sense forçar ni reescriure l’historial.
6. Pages ha de tenir com a origen `main:/`, sense `CNAME`. L’adreça prevista és https://aaronfortuno.github.io/pentagrama-preview/. La comprovació del web remot la fa l’usuari.

Per reproduir exactament el subdirectori de la previsualització en local (PowerShell):

```powershell
$env:PORT = '4176'
$env:SITE_DIRECTORY = 'dist'
$env:BASE_PATH = '/pentagrama-preview/'
node tools/serve.mjs
```

La biblioteca i els ajustos locals de la previsualització són independents dels de pentagrama.page perquè tenen un altre origen. `dist/` és generat i s’ignora a Git; el constructor només substitueix una carpeta marcada com a sortida pròpia. No copiïs el directori `.git` ni el repositori de desenvolupament al repositori auxiliar.

## Domini pentagrama.page

A **Settings → Pages**, la configuració és **Deploy from a branch**, branca **main**, carpeta **/docs**, domini propi **pentagrama.page** i **Enforce HTTPS** activat. `docs/CNAME` conserva el domini en les publicacions següents.

El domini es gestiona a Spaceship amb els servidors `launch1.spaceship.net` i `launch2.spaceship.net`. Els registres del servei són:

| Tipus | Nom | Valor |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| AAAA | @ | 2606:50c0:8000::153 |
| AAAA | @ | 2606:50c0:8001::153 |
| AAAA | @ | 2606:50c0:8002::153 |
| AAAA | @ | 2606:50c0:8003::153 |
| CNAME | www | aaronfortuno.github.io |

El CNAME de `www` apunta al compte de GitHub, sense `/pentagrama`. Cal conservar també el TXT de verificació de Search Console i qualsevol registre de correu o de verificació independent del web.

GitHub redirigeix l’adreça anterior https://aaronfortuno.github.io/pentagrama/ i el subdomini https://www.pentagrama.page/ al domini principal.

Les plantilles i preferències locals pertanyen a cada origen. En canviar de domini no es transfereixen automàticament: els enllaços compartits i els codis de configuració permeten conservar les plantilles importants.

Referència de GitHub: [gestió d’un domini propi](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

## Publicar una còpia en un altre domini

Les rutes dels recursos són relatives. Per publicar una còpia pròpia, adapta o elimina `docs/CNAME`, actualitza `homepage` a `package.json` i executa `node tools/version-assets.mjs`: les canòniques, els `hreflang` i el sitemap es generen amb aquesta adreça. Revisa també `docs/robots.txt` i l’adreça opcional impresa que defineix `docs/layout.js`.

Les adreces d’idioma són directoris estàtics amb el seu `index.html`; GitHub Pages serveix `/en/`, `/ca/`, etc. sense regles de reescriptura. Les traduccions, els títols, les descripcions i els enllaços entre idiomes ja són presents a l’HTML. El sitemap enumera l’arrel i els idiomes disponibles. La publicació facilita el rastreig, però la indexació i els terminis depenen dels cercadors.

L’analítica només s’activa al domini fixat a `docs/analytics.js`. Per mesurar una altra publicació cal configurar el domini i un identificador d’Umami propi, al meta `umami-website-id` de `docs/index.html`. Sense identificador vàlid no es carrega l’analítica. Vegeu [Analítica](analytics.md).

[Torna al README](../README.md)
