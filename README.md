# Pentagrama

Un full en blanc per a la teva música. Paper pautat a mida, previsualització en directe i impressió neta.

**[Obre el web](https://pentagrama.page/)**

## El teu full

- **A3, A4 i Letter**, en vertical o horitzontal.
- **Gruix de línia** de 0,05 a 0,50 mm.
- **Espai intern del pentagrama** d’1 a 4 mm entre línies.
- **Espai superior extra** de 0 a 100 mm, afegit al marge habitual de 21 mm, per escriure a mà títol, autor o anotacions. El valor inicial de 0 manté els fulls anteriors.
- **Distribució senzilla**: d’1 a 64 pentagrames, sense agrupar o agrupats de 2 en 2, de 3 en 3, etc. L’espai disponible es reparteix automàticament.
- **Distribució per blocs**: fins a 24 blocs amb nom, nombre de pentagrames, distància entre pentagrames i espai fins al bloc següent. Es pot repetir el conjunt d’1 a 8 vegades, amb un espai entre conjunts propi. Els noms dels blocs només serveixen per configurar-los i no s’imprimeixen.
- **Referència opcional al peu** per recuperar la geometria exacta del full.
- **Adreça del web opcional al peu esquerre**, desactivada per defecte, per recordar on s’ha creat el full.
- **Enllaç compartible** que conserva la distribució i els noms dels blocs.

El nombre de pentagrames que hi cap depèn del format, l’espai entre línies, l’espai superior reservat i la distribució. Si una configuració no hi cap, el web avisa i desactiva la impressió. **Ajusta al full** fa un ajust explícit: en mode senzill redueix el nombre de pentagrames; en mode blocs redueix els espais i, si és necessari, l’espai entre línies. Conserva l’espai superior extra. Els controls mostren els valors resultants. Si tampoc no hi cap amb les mides mínimes, cal reduir manualment el nombre de pentagrames, blocs o repeticions.

El sidebar combina format i orientació en una fila, amb icones Lucide, i mostra quantitat i agrupació en paral·lel. Els valors de gruix, espai entre línies, separació relativa entre grups i espai superior es poden escriure directament o modificar amb el lliscador. El multiplicador entre grups és respecte de l’espai normal entre pentagrames.

En pantalles tàctils, els lliscadors esperen que s’aixequi el dit per confirmar un toc. Un gest horitzontal ajusta el valor en directe, mentre que un gest vertical permet desplaçar la pàgina sense modificar-lo. Si el navegador cancel·la l’ajust, es recupera el valor inicial. El ratolí i el teclat mantenen el comportament natiu. Els botons segmentats destaquen la selecció amb fons verd i una marca als modes de distribució.

En mode blocs les distàncies són exactes en mil·límetres, entre l’última línia d’un pentagrama i la primera del següent. El conjunt queda centrat dins de l’espai disponible, després de reservar l’espai superior extra. Els camps sense efecte s’oculten: separació interna d’un bloc amb un sol pentagrama, espai després de l’últim bloc i separació entre conjunts quan només n’hi ha un. Els valors es conserven i reapareixen quan tornen a ser aplicables.

## Previsualitzar i imprimir

La capçalera reuneix el títol i el selector d’idioma en una sola fila. Manté la mateixa distribució d’amplada fins als 760 px, sense un canvi intermedi als 1200 px. El títol i la descripció s’oculten a 760 px o menys, quan el web passa a la distribució mòbil. **Imprimeix**, fix a dalt del panell de configuració, espera que les fonts estiguin carregades i obre el diàleg habitual del navegador. Des d’aquest diàleg també pots desar el full com a PDF. Tria el mateix format de paper i escala 100 %; desactiva les capçaleres i els peus del navegador si estan actius.

Els controls **+**, **−** i la icona d’ajust amplien la previsualització fins al 400 % o tornen a mostrar el full sencer. El percentatge apareix temporalment quan canvies el zoom. La icona d’ajust gira segons l’orientació del paper. Quan està ampliat, arrossega’l amb el ratolí o amb un dit per explorar-lo. També pots ampliar amb Ctrl + roda (Cmd + roda a macOS). Amb el focus al full, les tecles + i − amplien o redueixen, les fletxes el desplacen i 0 o Inici ajusten el full. El zoom només afecta la vista en pantalla.

Si fas scroll sobre el full sense el modificador, apareix breument un avís que recorda Ctrl + roda, o ⌘ + roda a macOS. El scroll normal permet continuar desplaçant la pàgina en mòbil.

Per defecte, el full només conté les línies. A **Peu del full** pots activar **Adreça del web** perquè aparegui `pentagrama.page` a l’esquerra, i **Referència** perquè aparegui el codi de configuració a la dreta. Cada opció té una fila amb ajuda breu i l’interruptor a la dreta. Són independents i estan desactivades inicialment; les referències llargues es reparteixen en línies sense ocupar l’espai de l’adreça. Els dos textos utilitzen **Noto Serif Thin, pes 100 i mida 2,2 mm**, en gris suau (`#a6a6a6`). La font és local i les amplades reals dels caràcters es comparteixen entre la previsualització i el PDF vectorial. El PDF incrusta la font i conserva el text seleccionable; els fulls sense peus no inclouen cap font al PDF vectorial. No s’hi afegeixen notes, claus, silencis, armadures, barres de compàs ni noms d’instruments.

## Plantilles sense compte

El tirador **Plantilles** de la dreta obre un panell superposat, amb desplaçament propi. Tirador i contingut comparteixen un únic moviment. Una sola fila superior reuneix desar, compartir el full actual i tancar. Les plantilles es mostren en una graella de dues columnes, amb miniatures que omplen l’amplada interior de la targeta; els fulls verticals queden retallats per sota. El nom és visible, i els detalls i les accions apareixen en passar-hi per sobre o donar-hi focus amb el teclat. En dispositius tàctils, les accions són visibles directament. Cada targeta permet compartir aquella plantilla sense aplicar-la al full actual. El panell es tanca amb el tirador, la creu o Esc.

Inclou models per a piano, coral SATB, iniciació, trio, SATB amb piano i orquestra en A3. El model orquestral és una proposta editable amb 23 pentagrames distribuïts en sis blocs.

- **Desa plantilla** guarda una còpia de la configuració amb el nom que triïs en aquest navegador.
- Pots eliminar plantilles pròpies i ocultar qualsevol plantilla suggerida.
- **Restableix les plantilles per defecte** recupera les suggerides, conservant les pròpies i la configuració actual.

L’emmagatzematge és local: no se sincronitza entre dispositius i es pot perdre si s’esborren les dades del navegador. Pots conservar un enllaç compartit o una referència com a còpia. Si el navegador impedeix desar plantilles, el web ho indica i manté els canvis només durant la sessió.

## Referències

Les referències **P1** de la primera versió continuen funcionant i recuperen el mateix full A4.

El desplegable **Codi de configuració** reuneix les dues accions: copiar el codi del full actual i, a sota, **Recupera una configuració** per enganxar-hi un codi desat o imprès. El codi complet i el formulari queden visibles només quan s’obre aquest únic desplegable.

Les referències **P2** incorporen format, orientació, espai entre línies i distribució:

- `P2-A3-L-I20-T12-N9-G3-E22`: A3 horitzontal, interlineat de 2 mm, gruix de 0,12 mm, 9 pentagrames agrupats de 3 en 3 i separació relativa de 2,2×.
- `P2-A4-P-I20-T12-S2-J180-B4.120.140_2.60.140`: dos conjunts SATB + piano; 12 mm entre les quatre veus, 14 mm fins al piano, 6 mm entre els dos pentagrames de piano i 18 mm entre conjunts.

Quan hi ha espai superior extra, es genera una referència **P3** amb el camp `H` en mil·límetres: `P3-A4-P-I20-T12-H30-N9-G3-E22` reserva 30 mm addicionals a dalt. Els codis P1 i P2 continuen recuperant el mateix full, sense espai addicional. Les plantilles desades i els enllaços compartits també conserven aquest valor.

Les referències impreses codifiquen la geometria. Els enllaços compartits també conserven els noms dels blocs, dins del fragment de l’adreça (`#`), sense enviar-los al servidor. L’activació dels peus és una preferència local: recuperar una referència o obrir un enllaç no activa l’adreça del web.

## Idiomes

Català, castellà, anglès, alemany, francès, italià, portuguès i neerlandès. Quan encara no s’ha triat cap idioma, es consulten les preferències del navegador i es reconeixen variants regionals, com `de-AT` o `pt-BR`. Si no hi ha cap idioma compatible, s’utilitza l’anglès. La icona Lucide d’idiomes obre un menú amb l’estil del web i cadascun dels vuit idiomes una sola vegada, sense una entrada «Automàtic» addicional. L’idioma actual es distingeix amb fons verd i una marca. El menú segueix el patró de botó de menú de WAI-ARIA: fletxes, Inici, Fi i inicials per navegar; Retorn o espai per triar; Esc per tancar i tornar a la icona. Tab continua la navegació habitual. L’ajuda de la icona indica l’idioma actual i la tria manual queda guardada al navegador.

Les traduccions són a `docs/i18n.js`; cada missatge té una entrada per idioma. Les proves comproven que no faltin missatges ni variables. Aquesta versió comparteix una sola adreça web: les pàgines indexables per idioma es poden afegir en una fase posterior de SEO.

## Value for Value

El peu obre un petit diàleg amb la història del projecte i l’adreça Lightning `aptswim903@walletofsatoshi.com` per a aportacions voluntàries. El web permet copiar-la; no es connecta a cap cartera ni processa pagaments. La informació de suport no apareix als fulls ni als PDF.

El mateix diàleg enllaça al repositori per fer-ne forks o proposar pull requests i inclou els crèdits de [Lucide](https://lucide.dev/), la llibreria d’icones utilitzada. El subconjunt de 19 SVG es distribueix a `docs/vendor/lucide.js`, amb la procedència fixada a un commit i la llicència completa a `docs/vendor/lucide-LICENSE.txt`. No requereix CDN ni connexions externes en carregar el web. Per actualitzar-lo explícitament: `node tools/vendor-lucide.mjs`, seguit de la preparació de versió dels recursos. El mateix comandament accepta un SHA de commit com a argument per reproduir una versió concreta.

El diàleg també acredita [Noto Serif](https://github.com/notofonts/latin-greek-cyrillic), sota SIL OFL 1.1. El subconjunt ASCII del pes Thin 100 es distribueix localment: WOFF2 per al navegador, TrueType per incrustar al PDF i les mateixes mètriques per ajustar els peus. La procedència i la llicència són a `docs/vendor/noto-serif-SOURCE.md` i `docs/vendor/noto-serif-OFL.txt`. Per regenerar-lo, `tools/vendor-footer-font.py` requereix Python amb `fonttools` i `brotli`; aquestes eines no són dependències del web ni de les proves habituals.

Les transicions comparteixen `--motion-duration` (220 ms) i `--motion-ease` a `docs/style.css`, inclosos els diàlegs, el menú d’idiomes, el desplegable de configuració i la reordenació de targetes. La preferència de moviment reduït les desactiva. Els diàlegs es tanquen amb animació des de la creu, Cancel·la, Esc o el fons exterior, i retornen el focus al control que els ha obert.

## Estadístiques

El web utilitza **Umami Cloud Hobby** per comptar visites i quatre accions: petició d’impressió, aplicació i desament persistent de plantilles, i petició de compartir. Només la petició d’impressió incorpora format, mode de distribució i idioma; les plantilles es distingeixen per categoria, sense noms personals.

`docs/analytics.js` filtra totes les peticions abans d’enviar-les: elimina el fragment dels enllaços compartits, els camps lliures, els noms i els identificadors de plantilles personals. Del referent només conserva l’origen; dels paràmetres de campanya només admet `utm_source`, `utm_medium` i `utm_campaign` amb valors simples. No utilitza cookies ni identificadors propis per seguir persones entre webs. Les peticions d’impressió no confirmen una impressió física, un PDF desat o el resultat del diàleg.

L’analítica només es carrega a `pentagrama.page`, de manera asíncrona. Si falla o queda bloquejada, el generador i la impressió continuen funcionant. Respecta Do Not Track i Global Privacy Control. A **Sobre el projecte · V4V → Privadesa i estadístiques** es poden excloure les visites d’aquest navegador; la preferència es desa localment amb la clau `umami.disabled`. Aquesta opció permet que les proves del creador no alterin el seguiment habitual.

Panell privat del propietari: [Pentagrama a Umami](https://cloud.umami.is/analytics/eu/websites/20ee7f51-6ba8-4486-86a5-f347851105b2). El seu identificador públic és al meta `umami-website-id` de l’HTML; no és una credencial d’accés al panell.

Search Console es configura amb la propietat de domini `pentagrama.page` i el TXT de verificació del compte del propietari. El mapa del lloc és **https://pentagrama.page/sitemap.xml**. Les dades de Search Console expliquen aparicions i clics a Google; les d’Umami, l’ús del web. Els panells poden trigar a mostrar informació i no representen un recompte exacte de persones.

## Publicar a GitHub Pages

El web està a `docs/` i no necessita compilació ni instal·lació de dependències.

1. A **Settings → Pages**, selecciona **Deploy from a branch**.
2. Tria **main** i **/docs**.
3. A **Custom domain**, desa **pentagrama.page**. El fitxer `docs/CNAME` conserva aquest domini en les publicacions següents.
4. A Spaceship, conserva els servidors DNS `launch1.spaceship.net` i `launch2.spaceship.net` i configura aquests registres a **Advanced DNS**:

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

   Utilitza el TTL predeterminat. Substitueix els registres d’aparcament que entrin en conflicte amb `@` o `www`; conserva els registres de correu i verificació que hi pugui haver. El CNAME de `www` apunta al compte de GitHub, sense `/pentagrama`.

5. Quan GitHub hagi validat els DNS i emès el certificat, activa **Enforce HTTPS**. La propagació i el certificat poden trigar fins a 24 hores.

El web es publica a **https://pentagrama.page/**. GitHub redirigeix l’adreça anterior **https://aaronfortuno.github.io/pentagrama/** i, amb aquests DNS, **https://www.pentagrama.page/** al domini principal.

Les plantilles i les preferències desades al navegador pertanyen a cada origen. Les de l’adreça anterior no es transfereixen automàticament al domini nou; conserva les plantilles importants amb els seus enllaços compartits o codis de configuració abans de canviar-hi.

Referència: [configuració de dominis propis a GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

Les actualitzacions a `main` es publiquen automàticament. Les rutes són relatives i permeten utilitzar un subdirectori o un domini propi.

Abans de publicar una versió, actualitza `version` a `package.json` i executa `node tools/version-assets.mjs`. Això afegeix la versió a les adreces dels estils i dels mòduls perquè el navegador carregui junts els recursos de la mateixa versió. No compila ni afegeix dependències.

## Desenvolupament i comprovacions

Amb Node.js 22 o posterior, sense necessitat d’executar `npm install`:

```sh
npm run dev
```

Obre **http://127.0.0.1:4173/pentagrama/**.

```sh
npm test
```

Les proves comproven compatibilitat P1, formats i orientacions, distribucions vàlides i desbordaments, blocs desiguals, referències P2, enllaços amb noms Unicode, PDF vectorial, plantilles locals, cobertura de les vuit traduccions i gestos dels lliscadors: toc, desplaçament vertical, ajust horitzontal, cancel·lació i passos fraccionaris.

Fitxers principals:

- `docs/layout.js`: mesures, distribució, referències i SVG.
- `docs/preview.js`: zoom i límits del desplaçament, independents de les mesures d’impressió.
- `docs/pdf.js`: generador vectorial conservat com a mòdul intern; la interfície utilitza el diàleg d’impressió.
- `docs/library.js`: plantilles suggerides i gestió de les personals.
- `docs/i18n.js`: idiomes, detecció i missatges.
- `docs/icons.js`: ús del subconjunt local d’icones Lucide.
- `docs/motion.js`: transicions compartides de diàlegs, menú, desplegable i targetes.
- `docs/touch-range.js`: gestos tàctils dels lliscadors sense interferir amb el desplaçament vertical.
- `docs/app.js`: interfície i persistència local.

## Llicència

GNU General Public License, versió 3. Consulta [LICENSE](LICENSE), conservada del repositori original.
