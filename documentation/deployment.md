# Desplegament

El contingut publicable és a `docs/`, incloses les pàgines traduïdes ja generades. Es pot servir directament com a fitxers estàtics, sense executar cap eina al servidor.

## Publicació del projecte

La publicació actual utilitza GitHub Pages, amb la branca `main` i el directori `/docs`. Les actualitzacions d’aquesta branca es publiquen automàticament a https://pentagrama.page/.

Per preparar una versió del web:

1. Actualitza `version` a `package.json`, la data i les claus del resum a `src/release.json`, les traduccions corresponents a `docs/i18n.js` i les notes de `CHANGELOG.md`.
2. Executa `node tools/version-assets.mjs`.
3. Executa `npm test` i comprova al navegador els canvis d’interfície o d’impressió que hagis fet.
4. Publica els canvis a `main` i comprova el resultat de GitHub Pages.

L’eina de versionat afegeix la versió a les adreces dels estils i dels mòduls perquè el navegador carregui junts els recursos de la mateixa versió. També regenera `docs/index.html`, els vuit directoris d’idioma, `docs/sitemap.xml`, `docs/release.js` i el QR de suport a partir de les fonts de `src/` i les traduccions. El número de versió del peu i del diàleg sempre prové de `package.json`; la data i les novetats són editorials. No instal·la dependències. Els canvis exclusivament de documentació no necessiten incrementar la versió del web.

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

Les adreces d’idioma són directoris estàtics amb el seu `index.html`; GitHub Pages serveix `/en/`, `/ca/`, etc. sense regles de reescriptura. Les traduccions, els títols, les descripcions i els enllaços entre idiomes ja són presents a l’HTML. El sitemap enumera l’arrel i els vuit idiomes. La publicació facilita el rastreig, però la indexació i els terminis depenen dels cercadors.

L’analítica només s’activa al domini fixat a `docs/analytics.js`. Per mesurar una altra publicació cal configurar el domini i un identificador d’Umami propi, al meta `umami-website-id` de `docs/index.html`. Sense identificador vàlid no es carrega l’analítica. Vegeu [Analítica](analytics.md).

[Torna al README](../README.md)
