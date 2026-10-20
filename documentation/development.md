# Desenvolupament

Pentagrama és un web estàtic d’HTML, CSS i JavaScript amb mòduls ES. No necessita servidor d’aplicacions ni dependències d’npm. Una eina petita de Node genera les pàgines traduïdes; els fitxers generats es versionen a `docs/` i es poden publicar directament.

El catàleg públic i les guies de coral amb piano i orquestra A3 es generen amb `tools/build-template-pages.mjs` durant el mateix procés. Les geometries i miniatures provenen de `DEFAULT_TEMPLATES` a `docs/library.js`, igual que el sidebar; no s’han de mantenir còpies dels ajustos a les pàgines. Els textos són a `docs/i18n.js`. Cada idioma disposa de `/templates/`, `/templates/choir-piano/` i `/templates/orchestra-a3/` sota la seva ruta. Les pàgines resultants i `docs/assets/templates/` són generats.

El favicon es publica a `docs/favicon.png` (PNG, 96 × 96 píxels), amb la font vectorial a `src/favicon.svg`. La declaració de `src/index.html` es comparteix amb totes les pàgines generades. Mantén estable la ruta del PNG perquè els cercadors el puguin rastrejar i reutilitzar.

## Treballar en local

Amb Node.js 22 o posterior, des de l’arrel del repositori:

```sh
npm run dev
```

Obre http://127.0.0.1:4173/pentagrama/. El servidor serveix `docs/` sota aquest subdirectori, com en una publicació de projecte a GitHub Pages.

Per executar les proves:

```sh
npm test
```

Les proves cobreixen la geometria dels fulls, els desbordaments, les referències de configuració, el PDF vectorial, les plantilles locals, les traduccions, els gestos dels lliscadors i el filtre d’analítica. No cal executar `npm install`.

## Organització del codi

| Fitxer o directori | Funció |
|---|---|
| `src/index.html`, `docs/style.css` | Estructura comuna, estils i impressió |
| `docs/index.html`, `docs/{idioma}/index.html` | Pàgines generades, amb text traduït i metadades abans d’executar JavaScript |
| `docs/app.js` | Interfície i persistència local |
| `docs/settings-history.js` | Historial temporal de configuracions i dreceres de teclat |
| `docs/settings-baseline.js` | Punt de partida independent per restablir una plantilla sense perdre’n la configuració original |
| `docs/number-input.js`, `docs/select-control.js` | Controls numèrics amb unitats i selector de paper accessible, amb el temps d’animació compartit |
| `docs/clefs-control.js` | Claus comunes i excepcions per posició, amb patrons associats als blocs |
| `docs/notes-control.js`, `docs/page-text-control.js` | Adaptadors de la zona híbrida de notes i de la capçalera/peu amb alineació independent |
| `docs/barlines-control.js` | Controls opcionals i homogenis dels compassos, sense lògica geomètrica |
| `docs/layout.js`, `docs/pdf.js` | Adaptadors compatibles amb els punts d’entrada de la versió 1 |
| `docs/engine/` | Motor modular: configuració, document, geometria, escena vectorial, SVG, impressió i PDF |
| `docs/preview.js` | Zoom i desplaçament de la previsualització |
| `docs/library.js` | Plantilles suggerides i personals |
| `docs/i18n.js` | Traduccions, detecció i selecció d’idioma |
| `docs/language-routing.js`, `tools/build-locales.mjs` | Adreces per idioma i generació de l’HTML i el sitemap |
| `docs/motion.js`, `docs/touch-range.js` | Transicions i gestos tàctils |
| `docs/logo-note.js` | Trajectòria, deformació i control de la nota del logotip |
| `docs/glockenspiel.js`, `docs/vendor/glock/` | Reproductor del logotip i gravacions locals amb procedència i llicència |
| `docs/melodies.js`, `docs/melody-player.js` | Catàleg de fragments i reproducció sincronitzada amb el rellotge d’àudio |
| `docs/melody-discovery.js`, `docs/wordmark.js` | Descoberta, canvi del títol i diàleg musical |
| `docs/icons.js`, `docs/vendor/` | Icones, fonts i llicències de tercers |
| `docs/engine/pdf.js` | Generador vectorial intern de documents; la interfície utilitza el diàleg d’impressió |
| `docs/analytics.js` | Càrrega i filtratge de l’analítica de producció |
| `src/release.json`, `docs/release.js` | Data i resum editorial; metadades generades amb la versió de `package.json` |
| `src/support.json`, `tools/lightning.mjs` | Destinació única de suport, codificació LNURL i QR vectorial |
| `tests/`, `tools/` | Proves i eines de desenvolupament |

## Geometria i configuracions compartides

La branca 2.x es descriu a [engine-v2.md](engine-v2.md). `docs/app.js` obté un document amb `createDocument()` i en reutilitza la geometria per a la previsualització i la impressió. La interfície encara edita un sol full amb les opcions existents.

Les mides del full es calculen en mil·límetres. En mode blocs, la separació entre pentagrames es mesura de l’última línia d’un pentagrama a la primera del següent. En mode senzill, la separació entre grups és un multiplicador respecte de l’espai normal entre pentagrames. El zoom només modifica la vista en pantalla.

Les referències impreses codifiquen la geometria; els enllaços compartits també conserven els textos de capçalera i peu, les seves opcions i els noms dels blocs dins del fragment de l’adreça (`#`). Aquest contingut no s’envia al servidor. Els codis de geometria no inclouen cap camp de capçalera ni peu; aplicar-ne un conserva els textos actuals. Els P8 antics amb textos continuen sent llegibles. Mostrar l’adreça del web o la referència al peu és una preferència local, independent de recuperar una configuració.

El primer accés inicia un A4 amb 9 pentagrames sense agrupar; les sessions posteriors recuperen els ajustos locals. «Restableix» torna al punt de partida de la plantilla activa, separat de les edicions i de l’historial de desfer/refer. Aplicar una plantilla suggerida o personal, desar-ne una de nova, recuperar un codi o obrir un enllaç compartit estableix aquest punt de partida. Les edicions ordinàries i desfer/refer no el modifiquen.

Aplicar o desar una plantilla actualitza el fragment de l’URL amb `replaceState`, sense crear una entrada de navegació per cada selecció. El fragment conserva la plantilla original mentre se n’edita el full. El punt de partida també es desa a `pentagrama.settings-baseline.v1` per poder reprendre els ajustos locals i restablir-los correctament en una visita sense fragment. Els enllaços vàlids tenen prioritat sobre aquesta còpia; les preferències locals de peu es mantenen en importar-los, perquè no formen part del codi compartit. Es normalitzen còpies completes i independents, inclosos els blocs i els seus noms. La navegació entre adreces amb fragments diferents recarrega el punt de partida; canviar només d’idioma conserva les edicions en curs.

Es manté la compatibilitat amb els formats anteriors:

- **P1** recupera els fulls A4 de la primera versió.
- **P2** incorpora format, orientació, interlineat i distribució. Per exemple, `P2-A3-L-I20-T12-N9-G3-E22` indica A3 horitzontal, interlineat de 2 mm, gruix de 0,12 mm i 9 pentagrames agrupats de tres en tres amb separació relativa de 2,2×.
- **P3** afegeix l’espai superior extra amb el camp `H` en mil·límetres. `P3-A4-P-I20-T12-H30-N9-G3-E22` reserva 30 mm addicionals a dalt. Els codis P1 i P2 no reserven espai addicional.
- **P4** incorpora marges personalitzats amb `Msuperior.dret.inferior.esquerre`, en mm enters, i pot mantenir `H` per a l’espai superior extra. Per exemple, `P4-A4-P-I20-T12-H30-M16.28.16.10-N9-G0-E22`. Quan els marges són els originals (21, 18, 21, 18 mm), es continua generant P2 o P3; els codis anteriors conserven la geometria.
- **P5** afegeix compassos amb el sufix `-Vquantitat.tipus.gruix.unió`: tipus `S` (simple), `D` (doble), `H` (discontinu); gruix en centèsimes de mm; unió `N` (cap), `S` (contínua) o `D` (discontínua). Exemple: `P5-A4-P-I20-T12-N9-G3-E22-V4.S.16.D`. Els marges `M` i l’espai superior `H` són opcionals. Els fulls sense compassos continuen utilitzant P2–P4, i els codis antics els mantenen desactivats.


- **P6** incorpora el gruix vinculat dels compassos (`A` en lloc del gruix absolut del sufix `V`) i les claus: `-KU.G` aplica la mateixa clau; `-KP.G.S.IIF` defineix un patró senzill amb les dues primeres posicions heretades i fa a la tercera; `-KP.G.B.IIIF_IF` defineix patrons per als blocs. `G`, `F`, `A`, `T` i `N` són sol, fa, do alto, do tenor i cap; `I` hereta la clau comuna. `0` representa un patró buit i `_` separa blocs. Els patrons nuls finals s’ometen. Ex.: `P6-A4-P-I20-T12-N9-G3-E22-V4.S.A.D-KP.G.S.IIF`. Els camps de codi admeten fins a 1.600 caràcters; els codis descriuen les opcions actives, i les plantilles locals conserven també les inactives.

## Traduccions

Els missatges són a `docs/i18n.js`, amb una entrada per idioma. Les proves comproven que no faltin claus ni variables. La detecció inicial consulta les preferències del navegador, reconeix variants regionals i utilitza l’anglès si no troba cap idioma compatible. La tria manual es desa localment.

Cada idioma té una URL estable: `/ca/`, `/en/`, `/es/`, `/de/`, `/fr/`, `/it/`, `/pt/`, `/nl/`, `/eu/` i `/gl/`. Aquest idioma explícit preval sobre la preferència desada i la del navegador. L’arrel `/` manté la detecció automàtica i és l’alternativa `x-default`, sense redireccions obligatòries. El selector conté enllaços reals; en activar-los normalment, actualitza l’adreça i els textos sense recarregar la pàgina, conservant l’historial i la configuració. Enrere i endavant respecten l’idioma de cada adreça.

Edita `src/index.html` o `docs/i18n.js` i executa `node tools/build-locales.mjs` per regenerar les pàgines de tots els idiomes i el sitemap. `node tools/version-assets.mjs` també ho fa després de versionar els recursos. No editis manualment l’HTML de `docs/`. Cada pàgina inclou una canònica pròpia, els enllaços `hreflang` recíprocs i `x-default`, amb URLs absolutes a partir de `homepage` de `package.json`. Els recursos relatius també funcionen sota un subdirectori de GitHub Pages.

Les traduccions noves han de cobrir tots els missatges, inclosos els noms i textos de les melodies, les etiquetes accessibles i tot l’historial de versions. Conserva exactament les variables com `{n}`, `{name}` i `{version}`. Les proves validen la cobertura, les variables, les rutes i la detecció de variants regionals, com `eu-FR` i `gl-ES`. El selector limita l’alçada i desplaça només la llista, mantenint visible l’opció enfocada amb teclat. Una revisió de parlants nadius ajuda a polir els matisos i la terminologia musical.

## Desfer i refer

Les fletxes de la fila «El teu full» recuperen fins a cent canvis durant la sessió de la pàgina. Les instantànies inclouen totes les opcions del full, els blocs i els seus noms. L’aplicació de plantilles, l’ajust al full, la recuperació de codis i el restabliment també es poden desfer. Un arrossegament complet o una edició continuada d’un camp compten com un sol pas. Un canvi nou després de desfer descarta el futur abandonat; una renderització sense canvis conserva refer.

Les dreceres són Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z i Ctrl+Y. Els camps d’edició de text i els diàlegs conserven les dreceres natives. El zoom, l’idioma, els desplegables i la gestió de la biblioteca no formen part de l’historial de configuració. Es persisteixen la configuració actual i el seu punt de partida; recarregar la pàgina comença un historial de desfer/refer nou.

## Suport i versió

L’adreça Lightning és a `src/support.json`. La preparació dels idiomes en deriva el text visible, el vincle `lightning:` i un QR LNURL en majúscules amb quatre mòduls de marge blanc. El QR es genera amb la còpia local MIT de [QR Code Generator](https://github.com/kazuhikoarase/qrcode-generator), a `tools/vendor/qrcode.cjs`; no es carrega aquesta llibreria al navegador ni es consulta cap servidor de QR. La revisió d’origen és a `tools/vendor/qrcode-source.json`. El mateix SVG es conserva a `docs/assets/lightning-qr.svg` i s’integra al diàleg, sense peticions de xarxa. Els formats segueixen [LUD-16](https://github.com/lnurl/luds/blob/luds/16.md) i [LUD-01](https://github.com/lnurl/luds/blob/luds/01.md).

La versió del peu obre l’historial amb una entrada concisa per versió: número, data localitzada i resum d’una a tres línies. `src/release.json` defineix la versió actual i `history` conserva totes les anteriors, sense agrupacions. El número actual s’obté de `package.json` i s’integra a l’HTML i a `docs/release.js` en regenerar les pàgines. Les dates es formaten en UTC durant la generació i es conserven a `RELEASE_DATES` per idioma; així mantenen la llengua correcta encara que el navegador no tingui totes les dades d’Intl disponibles. La capçalera del diàleg es manté visible; només es desplaça la cronologia, que també rep focus per consultar-la amb teclat. Cap d’aquests elements apareix al full imprès. Els resums no substitueixen el detall de `CHANGELOG.md`.

## Sidebar i desplegables

El format del paper i la impressió es mantenen visibles. `#settings-accordion` conté set desplegables natius; només la distribució s’obre inicialment. `bindAnimatedDetails()` retorna `setOpen()` i accepta `onOpen` per replegar els altres desplegables amb la mateixa transició, sense interferir amb els detalls de privadesa del diàleg V4V. El contingut replegat queda inert i els canvis ràpids reprenen l’animació des de la posició actual.

Un `ResizeObserver` reserva l’alçada de totes les capçaleres i limita el contingut obert a l’espai restant. En pantalles baixes o configuracions amb molts blocs, només es desplaça aquest contingut. Al mòbil s’elimina aquest límit i la pàgina conserva el desplaçament natural. L’estat dels desplegables no forma part de la configuració del full, de les referències ni de les plantilles desades.

La distribució té una estructura pròpia dins del desplegable: `.distribution-mode` queda fora de `.distribution-scroll`, que conté els paràmetres i els blocs. El límit d’alçada inclou el selector fix; els marges interiors reserven espai per a les vores de focus i la barra de desplaçament. Tots els blocs conserven tres camps, amb els espais no aplicables desactivats.

En escriptori es reserva un mínim de 100 px per al contingut obert a més de les capçaleres. Quan l’alçada de la finestra no ho permet, el lateral exterior pot desplaçar-se per evitar superposicions. En mòbil es manté l’alçada natural del contingut.

`enhanceNumberInputs()` conserva els inputs numèrics natius i hi afegeix fletxes Lucide coherents, fora de l’etiqueta del camp. Les fletxes petites no afegeixen passos al tabulador; el camp accepta les tecles amunt/avall i manté la seva descripció completa. Els espais de blocs utilitzen `step="any"` i `data-increment="1"`: així una plantilla amb 7,3 mm continua sent vàlida i passa a 8,3 mm en augmentar-la, sense arrodoniments implícits. La normalització del layout continua admetent dècimes. Els controls fins mantenen els seus passos originals i cada clic incremental és una acció reversible.

`bindSelectControl()` sincronitza el botó de format amb el select intern, inclosos canvis procedents de plantilles, desfer/refer i restablir. El menú es col·loca al `body`, es posiciona al costat del botó i utilitza `showPopover()` amb els mateixos 220 ms i la preferència de moviment reduït. Admet fletxes, Inici/Fi, selecció amb Enter/Espai, Escape, tabulador i cerca per inicial. Obrir paper, un selector de compassos o claus, o idioma tanca els altres menús; desplaçar la pàgina o canviar-ne la mida tanca el menú de paper.

## Nota del logotip

Les melodies, les fonts i el procediment per ampliar el catàleg s’expliquen a [melodies.md](melodies.md).

`docs/logo-note.js` és independent del generador de fulls. Calcula una trajectòria parabòlica amb gravetat constant i deforma el cap de nota abans de l’impuls i en aterrar. El petit rebot perd altura i acaba amb una oscil·lació amortida. Tot es dibuixa amb transformacions dels dos grups SVG; les línies del logotip i el layout del web es mantenen fixos.

L’animació utilitza el temps de `requestAnimationFrame`, no el nombre de fotogrames, i té un ritme físic propi d’aproximadament un segon. Les transicions ordinàries de la interfície conserven els 220 ms. La preferència `prefers-reduced-motion` canvia directament la posició, sense salt. Amagar la pàgina acaba el moviment sense un contacte ajornat ni salts pendents; no hi ha activació automàtica.

`createLogoNote(button)` retorna `jumpTo({ column, step }, { duration })` i `destroy()`. Les columnes són 0–2 i els passos diatònics 0–8, d’E4 a F5 en clau de sol. Sense destí explícit, `jumpTo()` tria una posició aleatòria diferent de l’actual. Durant un salt només es conserva l’última petició pendent. `duration` és opcional i es mesura en mil·lisegons (160–5000); escala totes les fases i la gravetat per conservar la mateixa trajectòria i deformació. Els clics normals mantenen la durada original.

El botó emet tres esdeveniments que es propaguen pel DOM:

- `pentagrama:note-start`: inici del gest, on un futur mòdul de so pot preparar el context d’àudio.
- `pentagrama:note-land`: primer contacte amb el destí, una vegada per salt; el rebot no el repeteix.
- `pentagrama:note-rest`: repòs final; `detail.cancelled` indica si s’ha aturat en amagar la pàgina o reduir el moviment.

Tots inclouen `detail.note` (`column`, `step`, `x`, `y`, `pitch`, `midi`), `sequence`, `reducedMotion` i `timing` (`duration`, `touchdown`). Això permet vincular-hi el so o un controlador de melodies sense modificar la física.

`connectLogoSound(button)` connecta els esdeveniments amb `createGlockenspiel()`. L’AudioContext es crea o reprèn dins del clic; passar per sobre, tocar o donar focus només anticipa la descàrrega de les mostres, sense crear àudio ni reproduir-lo. El so es dispara una vegada al primer contacte, conservant la cua real de la gravació. Si la mostra encara no està disponible, no es reprodueix tard després del contacte. Amb moviment reduït, el canvi de posició és immediat i l’últim toc deliberat pot sonar quan acabi de carregar. Amagar la pàgina descarta peticions pendents i atura els sons actius amb un esvaïment breu.

El reproductor exposa `prepare(midi)`, `play(midi, { when, volume })`, `currentTime`, `warm()`, `unlock()`, `stopAll()` i `destroy()`. `when` utilitza segons del rellotge de l’AudioContext: un futur controlador de melodies ha de programar les entrades amb aquest rellotge i ajustar els salts perquè `touchdown` hi coincideixi, sense alterar el ritme amb temporitzadors acumulatius. `pentagrama:note-sound` comunica una reproducció iniciada (`note`, `sequence`, `time`). La polifonia es limita a vuit cues i un compressor suau protegeix els solapaments.

El catàleg de melodies, el llindar de clics, la transformació del nom i el diàleg de context es poden gestionar en un controlador separat. La versió actual afegeix el so als salts individuals i prepara el temps musical; no inicia seqüències automàtiques.

Les proves comproven les posicions musicals, la continuïtat entre fases, els límits del cap de nota deformat per a totes les combinacions, els clics ràpids, diferents ritmes de fotogrames, el moviment reduït i la neteja dels recursos.

Referències: [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame) i [preferència de moviment reduït](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion).

## Recursos de tercers

Les icones i les fonts es distribueixen localment, sense CDN.

**Lucide:** `docs/vendor/lucide.js` conté el subconjunt d’icones i el commit d’origen. La llicència és a [lucide-LICENSE.txt](../docs/vendor/lucide-LICENSE.txt). Per actualitzar-lo:

```sh
node tools/vendor-lucide.mjs
```

El comandament també accepta un SHA de commit com a argument per reproduir una versió concreta.

**Noto Serif Thin:** el navegador i el generador de PDF comparteixen les mètriques del subconjunt de la font. La procedència, el comandament de regeneració i la llicència són a [noto-serif-SOURCE.md](../docs/vendor/noto-serif-SOURCE.md) i [noto-serif-OFL.txt](../docs/vendor/noto-serif-OFL.txt). La regeneració requereix Python amb `fonttools` i `brotli`; no són dependències del web ni de les proves habituals.

**Noto Serif ExtraLight:** els textos personalitzats de capçalera i peu utilitzen la mateixa família, amb pes 200 i un subconjunt europeu que inclou accents, grec, ciríl·lic i puntuació. La procedència i el checksum són a [page-font-SOURCE.md](../docs/vendor/page-font-SOURCE.md). `python tools/vendor-page-font.py` genera WOFF2, programa TrueType i mètriques des de la revisió oficial fixada. Utilitza `tools/.glyph-deps`, instal·lable amb `python -m pip install --target tools/.glyph-deps -r tools/requirements-glyphs.txt`. No modifica la font ASCII antiga: els PDF existents mantenen la paritat. La interfície només carrega el programa PDF quan s’importa el generador; el navegador serveix el WOFF2 local quan hi ha textos nous.

**VSCO 2 Community Edition:** tres gravacions reals de glockenspiel sota CC0, amb procedència i procés de preparació a [glock/SOURCE.md](../docs/vendor/glock/SOURCE.md). Les mostres MP3 sumen uns 243 kB i es reprodueixen amb Web Audio natiu. El codi compensa la petita desviació d’afinació de l’instrument i aplica la transposició de dues octaves: E4–F5 escrit sona E6–F7. LAME s’utilitza només per preparar els recursos; no es distribueix ni es carrega al navegador.

La preparació de versions i la publicació es descriuen a [Desplegament](deployment.md).

[Torna al README](../README.md)

## Estil compartit del sidebar · 2.3.2

Els sis desplegables utilitzen les variables locals de `.settings`: `--settings-control-height` (36 px, 42 px en mòbil), `--settings-label-size` (11/12 px), `--settings-value-size` (12 px), `--settings-hint-size` (10/11 px), `--settings-label-gap` (6 px), `--settings-gap` (14 px) i `--settings-control-border`. Les etiquetes són de pes 400 i els subtítols de 600. Cal reutilitzar aquests valors quan s’afegeixi una opció, sense tornar a reduir tipografia o alçades en un submenú concret.

La classe `settings-fields` comparteix estructura i espaiat dels camps opcionals de claus, compassos i anotacions. `bindSelectControl()` controla també l’agrupació. Els menús són exclusius entre si, es posicionen fora de la zona amb scroll i mantenen el mateix temps de transició. Els colors de selecció, focus i ajuda són comuns; el codi monoespai i les icones compactes de gestió conserven les seves funcions específiques. A la interfície el nom és Espai per a anotacions; els identificadors interns `notes` es mantenen per compatibilitat amb les plantilles i referències existents.

Des de la 2.3.3, el focus dels grups `.segmented` és interior (`outline-offset:-2px`), de manera que no depèn del padding dels contenidors animats amb overflow ocult. L’alineació de títol i instruccions utilitza `.alignment-cycle`: un botó quadrat independent per camp, amb estat guardat als mateixos paràmetres `pageText`. `bindPageTextControl()` en renova la icona i el text accessible localitzat després d’editar, desfer, recuperar una plantilla o canviar d’idioma.
