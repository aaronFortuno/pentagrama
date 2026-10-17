# Desenvolupament

Pentagrama és un web estàtic d’HTML, CSS i JavaScript amb mòduls ES. No necessita servidor d’aplicacions ni dependències d’npm. Una eina petita de Node genera les pàgines traduïdes; els fitxers generats es versionen a `docs/` i es poden publicar directament.

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
| `docs/layout.js` | Mesures, distribució, referències i SVG |
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
| `docs/pdf.js` | Generador vectorial intern; la interfície utilitza el diàleg d’impressió |
| `docs/analytics.js` | Càrrega i filtratge de l’analítica de producció |
| `tests/`, `tools/` | Proves i eines de desenvolupament |

## Geometria i configuracions compartides

Les mides del full es calculen en mil·límetres. En mode blocs, la separació entre pentagrames es mesura de l’última línia d’un pentagrama a la primera del següent. En mode senzill, la separació entre grups és un multiplicador respecte de l’espai normal entre pentagrames. El zoom només modifica la vista en pantalla.

Les referències impreses codifiquen la geometria; els enllaços compartits també conserven els noms dels blocs dins del fragment de l’adreça (`#`). Aquests noms no s’envien al servidor. Mostrar l’adreça del web o la referència al peu és una preferència local, independent de recuperar una configuració.

Es manté la compatibilitat amb els formats anteriors:

- **P1** recupera els fulls A4 de la primera versió.
- **P2** incorpora format, orientació, interlineat i distribució. Per exemple, `P2-A3-L-I20-T12-N9-G3-E22` indica A3 horitzontal, interlineat de 2 mm, gruix de 0,12 mm i 9 pentagrames agrupats de tres en tres amb separació relativa de 2,2×.
- **P3** afegeix l’espai superior extra amb el camp `H` en mil·límetres. `P3-A4-P-I20-T12-H30-N9-G3-E22` reserva 30 mm addicionals a dalt. Els codis P1 i P2 no reserven espai addicional.

## Traduccions

Els missatges són a `docs/i18n.js`, amb una entrada per idioma. Les proves comproven que no faltin claus ni variables. La detecció inicial consulta les preferències del navegador, reconeix variants regionals i utilitza l’anglès si no troba cap idioma compatible. La tria manual es desa localment.

Cada idioma té una URL estable: `/ca/`, `/en/`, `/es/`, `/de/`, `/fr/`, `/it/`, `/pt/` i `/nl/`. Aquest idioma explícit preval sobre la preferència desada i la del navegador. L’arrel `/` manté la detecció automàtica i és l’alternativa `x-default`, sense redireccions obligatòries. El selector conté enllaços reals; en activar-los normalment, actualitza l’adreça i els textos sense recarregar la pàgina, conservant l’historial i la configuració. Enrere i endavant respecten l’idioma de cada adreça.

Edita `src/index.html` o `docs/i18n.js` i executa `node tools/build-locales.mjs` per regenerar les nou pàgines i el sitemap. `node tools/version-assets.mjs` també ho fa després de versionar els recursos. No editis manualment l’HTML de `docs/`. Cada pàgina inclou una canònica pròpia, els vuit enllaços `hreflang` recíprocs i `x-default`, amb URLs absolutes a partir de `homepage` de `package.json`. Els recursos relatius també funcionen sota un subdirectori de GitHub Pages.

## Desfer i refer

Les fletxes de la fila «El teu full» recuperen fins a cent canvis durant la sessió de la pàgina. Les instantànies inclouen totes les opcions del full, els blocs i els seus noms. L’aplicació de plantilles, l’ajust al full, la recuperació de codis i el restabliment també es poden desfer. Un arrossegament complet o una edició continuada d’un camp compten com un sol pas. Un canvi nou després de desfer descarta el futur abandonat; una renderització sense canvis conserva refer.

Les dreceres són Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z i Ctrl+Y. Els camps d’edició de text i els diàlegs conserven les dreceres natives. El zoom, l’idioma, els desplegables i la gestió de la biblioteca no formen part de l’historial de configuració. Només es persisteix la configuració actual; recarregar la pàgina comença un historial nou.

## Sidebar i desplegables

El format del paper i la impressió es mantenen visibles. `#settings-accordion` conté cinc desplegables natius; només la distribució s’obre inicialment. `bindAnimatedDetails()` retorna `setOpen()` i accepta `onOpen` per replegar els altres desplegables amb la mateixa transició, sense interferir amb els detalls de privadesa del diàleg V4V. El contingut replegat queda inert i els canvis ràpids reprenen l’animació des de la posició actual.

Un `ResizeObserver` reserva l’alçada de totes les capçaleres i limita el contingut obert a l’espai restant. En pantalles baixes o configuracions amb molts blocs, només es desplaça aquest contingut. Al mòbil s’elimina aquest límit i la pàgina conserva el desplaçament natural. L’estat dels desplegables no forma part de la configuració del full, de les referències ni de les plantilles desades.

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

**VSCO 2 Community Edition:** tres gravacions reals de glockenspiel sota CC0, amb procedència i procés de preparació a [glock/SOURCE.md](../docs/vendor/glock/SOURCE.md). Les mostres MP3 sumen uns 243 kB i es reprodueixen amb Web Audio natiu. El codi compensa la petita desviació d’afinació de l’instrument i aplica la transposició de dues octaves: E4–F5 escrit sona E6–F7. LAME s’utilitza només per preparar els recursos; no es distribueix ni es carrega al navegador.

La preparació de versions i la publicació es descriuen a [Desplegament](deployment.md).

[Torna al README](../README.md)
