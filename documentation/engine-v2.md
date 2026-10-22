# Motor v2 · 2.0.0

Motor incorporat a la versió estable **2.0.0**, desenvolupat inicialment a `codex/v2-modular-engine` a partir de **1.17.2** (`db130fe`). Separa la geometria i les sortides de la interfície, conserva els fulls existents i afegeix claus i compassos opcionals.

## Recorregut del document

`configuració → model normalitzat → distribució física → escena vectorial → SVG / impressió / PDF`

La geometria es calcula en mil·límetres. Els renderitzadors consumeixen una escena amb primitives i propietaris semàntics; no tornen a distribuir els pentagrames. El zoom continua sent una transformació de pantalla, sense efectes sobre les dimensions impreses.

| Mòdul a `docs/engine/` | Responsabilitat |
|---|---|
| `constants.js`, `settings.js` | Formats, valors inicials i normalització de les opcions existents |
| `references.js` | Codis P1–P9 i fragments d’enllaços compartits |
| `model.js` | Pàgines, conjunts, blocs i pentagrames amb identitats |
| `page-layout.js`, `fit.js` | Distribució física i ajust explícit quan el contingut no hi cap |
| `footers.js`, `typography.js` | Peus opcionals i mesures tipogràfiques |
| `page-text-settings.js`, `page-text.js` | Textos normalitzats, idiomes de nom/data, composició de capçalera i reserva física |
| `notes.js` | Reserva de notes, normalització i patrons físics de línies, quadrícula i punts |
| `page-font.js`, `page-font-pdf.js` | Mètriques Unicode, salts de línia i recursos PDF amb text recuperable |
| `document.js`, `scene.js` | Composició del document i escena comuna en mm |
| `clefs.js`, `path-data.js` | Resolució dels patrons, límits dels glifs, traçats vectorials i validació compartida |
| `barlines.js` | Límits dels compassos, traços dobles, patrons discontinus i unions dins de cada bloc |
| `svg.js`, `print.js`, `pdf.js` | Sortides vectorials i pàgines d’impressió |
| `index.js` | API pública per a consumidors del motor |

`docs/layout.js` i `docs/pdf.js` conserven l’API anterior com a adaptadors. Les plantilles, les guies i els codis guardats no necessiten migració. `docs/app.js` utilitza directament `createDocument()`, `renderSvgPage()` i `renderPrintDocument()`; evita importar l’índex complet perquè la font del PDF no es carregui a l’inici de la interfície.

## API i pàgines

```js
import { createDocument, renderSvgPage, renderPrintDocument, createPdfDocument } from './docs/engine/index.js';

// Qualsevol configuració de la versió 1 continua sent un document d’un full.
const single = createDocument({ paper: 'A4', count: 9, group: 0 });
const svg = renderSvgPage(single.pages[0]);
const printableHtml = renderPrintDocument(single);
const pdfBytes = createPdfDocument(single);

// Infraestructura per a futures opcions de primera pàgina i doble cara.
const score = createDocument({
  schemaVersion: 2,
  settings: { paper: 'A4', count: 9 },
  pages: [
    { id: 'front', settings: { topSpace: 30 } },
    { id: 'back' },
  ],
});
```

El límit és de 32 pàgines. Cada pàgina hereta les opcions comunes i aplica les seves excepcions. `normalizeDocument()` retorna còpies independents i és idempotent. Un document creat també es pot tornar a passar a `createDocument()`. La interfície actual configura **un full d’una o dues cares**. Sense pàgines explícites, `duplex.enabled` genera anvers i revers; les pàgines explícites de l’API no es dupliquen.

`document.valid` indica si totes les pàgines hi caben. El SVG pot mostrar una pàgina amb desbordament perquè la interfície n’informi; impressió i PDF rebutgen el document complet si alguna pàgina no és vàlida. No s’exporten documents parcials. Les pàgines d’impressió comparteixen exactament el SVG del preview; cada secció declara el seu format físic. El PDF admet diverses pàgines i comparteix la font incrustada entre elles.

## Identitats semàntiques

Una pàgina conté `systems` (conjunts), cada conjunt conté `blocks`, i cada bloc conté `staves`. El mode senzill genera un conjunt per pentagrama o grup; el mode per blocs genera un conjunt per repetició. La geometria de cada entitat es resol una vegada i les primitives indiquen `ownerId`.

Les identitats es delimiten pel pare, per exemple `front/systems/opening/blocks/voices/staves/soprano`. No provenen de coordenades ni de noms escrits per l’usuari. L’adaptador actual genera identificadors deterministes segons la posició. Un futur editor estructural ha de conservar les identitats explícites juntament amb les entitats que mou:

```js
{
  id: 'front',
  settings: { mode: 'blocks', systems: 1, blocks: [{ count: 4, inside: 12, after: 8 }] },
  identities: {
    systems: [{
      id: 'opening',
      blocks: [{ id: 'voices', staves: [
        { id: 'soprano' }, { id: 'alto' }, { id: 'tenor' }, { id: 'bass' },
      ] }],
    }],
  },
}
```

Els IDs locals han de començar amb una lletra i tenir fins a 80 caràcters alfanumèrics, guió o subratllat. Els duplicats dins del mateix àmbit es rebutgen. Canviar marges o espais no altera les identitats; reordenar blocs amb els seus IDs dins del mateix conjunt tampoc. Moure una entitat a un altre pare canvia la ruta qualificada. L’API encara no ofereix ordres d’edició estructural: aquest contracte evita confondre identitats deterministes amb un historial d’edició.

## Paritat i comprovació

`tests/fixtures/v1-layout.mjs` i `v1-pdf.mjs` són còpies fixades de 1.17.2, conservades només com a oracle de proves. No es publiquen al web. `tests/engine.test.mjs` compara 276 casos (plantilles, sis formats/orientacions, peus, marges i casos pseudoaleatoris reproduïbles): normalització, geometria, ajust, referències, enllaços, SVG i PDF. Per als casos vàlids, SVG i PDF coincideixen byte a byte amb la versió estable.

Les proves també cobreixen jerarquia, identitats, independència dels objectes, normalització repetida, documents amb formats diferents, exportació incompleta rebutjada, versions preliminars i imports amb invalidació de memòria cau. Es mantenen les proves existents de plantilles, persistència, restabliment, desfer/refer, idiomes, gestos i melodies. Els camps nous amb les línies de compàs desactivades es projecten fora de la comparació estructural amb v1; SVG, PDF i codis es continuen comparant byte a byte.

## Línies de compàs

`settings.barlines` conté `{ enabled, measures, style, thicknessMode, thickness, connect }`. Els valors inicials són `false`, `4`, `single`, `staff`, `0.16` i `none`. `barlineThickness(settings)` resol el gruix: en mode `staff` segueix `settings.thickness`; `custom` utilitza el valor absolut. Els objectes antics amb gruix explícit i sense mode es normalitzen com a `custom`, per preservar-ne la impressió. El valor absolut inactiu es conserva localment però no forma part del codi amb `A`. `measures` admet 1–16, `style` és `single`, `double` o `dashed`, `thickness` admet 0,05–0,60 mm i `connect` és `none`, `solid` o `dashed`. El model normalitzat sempre en retorna una còpia independent. Les excepcions parcials per pàgina conserven els altres camps heretats del document.

Cada pentagrama té `measures` divisions iguals, inclosa la frontera final, sense línia al començament. El traç final s’alinea per dins del marge dret. Les dobles són dos traços del mateix gruix; no són una barra final de traç gruixut. Els patrons discontinus són físics (1 mm de traç i 0,7 mm de buit) i s’apliquen de la mateixa manera a SVG i PDF. Els renderitzadors no calculen cap posició musical.

Cada primitiva té `role: 'barline'`, `measure`, `part: 'staff' | 'connection'`, `strokeWidth` i `dash`. Els segments dins dels pentagrames pertanyen al pentagrama; les unions entre ells pertanyen al bloc. Els límits semàntics impedeixen unir blocs o conjunts diferents. Les unions discontínues es poden combinar amb traços continus als pentagrames.

L’amplada mínima per compàs reserva el gruix del traç (i la separació doble si cal) més 1 mm lliure. Aquesta és una comprovació de no superposició, no una recomanació d’espai d’escriptura. Els casos més estrets es marquen com a invàlids; l’ajust explícit pot reduir-ne el nombre de compassos. La distribució vertical dels pentagrames es conserva, excepte si la referència opcional més llarga necessita espai addicional al peu.

`docs/barlines-control.js` només adapta els controls a la configuració. No calcula línies ni modifica el motor des del preview. Les plantilles, l’historial i el punt de restabliment conserven també els valors mentre l’opció és desactivada; els codis descriuen el full actiu i ometen els paràmetres inactius. `tests/barlines.test.mjs` comprova geometria, gruixos i patrons de les sortides per a tots els tipus i unions, formats i plantilles; també límits, P5, persistència, historial i herència entre pàgines.

## Claus i contorns musicals

`settings.clefs` conté `{ enabled:false, type:'treble', mode:'uniform', pattern:[] }`. Els tipus són `none`, `treble`, `bass`, `alto` i `tenor`. En mode `pattern`, cada entrada és un tipus o `null` per heretar el tipus comú. S’admeten fins a 64 posicions en el patró senzill; les posicions finals nul·les s’ometen. Si hi ha grups, es repeteix cada grup; sense grups s’aplica per índex al full. Els grups incomplets només utilitzen les posicions existents.

En mode blocs, cada objecte de `settings.blocks` pot tenir `clefs`, amb fins a 32 entrades del mateix format. Les excepcions viatgen amb el bloc quan s’intercanvien objectes i es repeteixen a cada conjunt. El selector de posició agrupa la informació en etiquetes amb el nom del bloc i el número de pentagrama, sense afegir cap editor de partitures. Les instantànies de plantilles, desfer/refer i Restableix són còpies completes, inclosos aquests arrays.

`clefForStaff()` és l’única resolució del tipus; el model semàntic l’incorpora a cada pentagrama. `clefMetrics()` reserva l’amplada de la clau més ampla i espai vertical fora de les cinc línies. `layout.musicLeft` només existeix quan cal reservar capçalera; totes les barres del full es distribueixen entre aquest punt i el marge dret. Els pentagrames sense clau conserven la mateixa amplada útil i alineació dels compassos.

Els punts d’ancoratge són sol a la segona línia des de baix, fa a la quarta i do a la tercera (alto) o quarta (tenor). Les dimensions s’escalen amb l’interlineat, sense un control addicional de mida. Es comproven marges i col·lisions verticals amb els límits reals dels glifs; l’ajust explícit dels blocs pot ampliar-ne les separacions mínimes. El patró discontinu i el gruix dels compassos són independents del farciment dels glifs.

Els tres contorns provenen de [Bravura](https://github.com/steinbergmedia/bravura), sota SIL OFL 1.1. `tools/vendor/bravura-source.json` fixa la revisió, les adreces oficials i el checksum del font de `tools/vendor/Bravura.otf`; el subconjunt de mètriques oficials dels tres glifs és a `tools/vendor/bravura_metadata.json`. `tools/extract-clefs.py` genera `docs/vendor/clef-glyphs.js` en unitats d’espai de pentagrama i comprova els límits contra les mètriques. La llicència i el copyright es distribueixen a `docs/vendor/bravura-OFL.txt`, amb enllaç al diàleg del projecte.

Només per regenerar aquests recursos, cal Python amb FontTools de `tools/requirements-glyphs.txt`. Es pot instal·lar a `tools/.glyph-deps/` (ignorat) amb `python -m pip install --target tools/.glyph-deps -r tools/requirements-glyphs.txt` i executar `python tools/extract-clefs.py`. No cal Python ni cap instal·lació per desenvolupar la interfície, provar el motor o servir el web. Els renderitzadors reben primitives `path` amb ordres M, L, C i Z en mm; SVG i PDF utilitzen els mateixos contorns i rebutgen ordres desconegudes o coordenades no finites. No es carrega ni s’incrusta un font musical al navegador o al PDF.

`tests/clefs.test.mjs` cobreix la font i la seva procedència, ancoratges, coordenades SVG/PDF, marges, espai de capçalera, col·lisions, grups parcials, blocs reordenats, patrons, persistència, P6 i herència entre pàgines. Es manté l’oracle binari per als fulls sense noves opcions.

## Dues cares · 2.1.0

`settings.duplex` conté `{ enabled:false, firstPageOnly:true, mirrorMargins:false }`. El mòdul `sides.js` deriva dues pàgines quan s’activa: l’anvers conserva els ajustos originals i el revers pot ometre `topSpace` i intercanviar `marginLeft`/`marginRight`. Amb marges reflectits, aquests camps representen interior/exterior del llibre, enquadernat a l’esquerra de l’anvers. Cap altre ajust canvia entre cares.

Des de la 2.1.1, l’editor aplica marges reflectits automàticament quan es trien dues cares: `bookMargins()` adapta els ajustos entrants, inclosos els codis P7 antics sense reflexió. L’API del motor continua admetent les dues variants. «Ajusta cada costat» controla només la granularitat dels camps, i els eixos agrupats continuen disponibles.

Les pàgines derivades conserven `referenceSettings`, una còpia de la plantilla compartida. La geometria del peu i la seva escena calculen el mateix codi de configuració per a totes dues cares; un codi imprès al revers també recupera el document complet. Les pàgines explícites continuen resolent les seves excepcions individualment.

Els codis P7 afegeixen `-DF.N`, `-DF.M`, `-DA.N` o `-DA.M`: F/A indica espai superior només al front o a totes dues cares, N/M indica marges normals o reflectits. El sufix segueix els compassos i les claus opcionals. Sense dues cares s’utilitzen els codis anteriors, i els ajustos inactius es conserven només a les instantànies locals.

`spreadView()` calcula la disposició de pantalla sense alterar cap dimensió impresa: vista de llibre en escriptori (revers a l’esquerra, anvers a la dreta), la mateixa vista horitzontal en tauleta, també vertical i fila parcial en mòbil. En aquesta última vista, cada pàgina ocupa inicialment el 86% de l’amplada útil; la transformació inicial enfoca l’anvers a la dreta i deixa entreveure el revers a l’esquerra. El conjunt comparteix zoom i desplaçament limitat als extrems dels fulls. En escriptori i tauleta l’ajust prioritza l’altura de l’anvers; si el conjunt és més ample que la vista, s’ancora a la dreta i es pot arrossegar fins al revers. Les anotacions Senars · Anvers i Parells · Revers tenen espai de pantalla reservat amb `labelHeight`, fora del paper. L’ombra central d’enquadernació també és exclusiva de la vista. Els índexs de les pàgines i l’ordre d’impressió continuen sent anvers–revers.

## Següents ampliacions

1. Valorar la inclusió de logotips propis sense perdre la sortida vectorial de la música.
2. Valorar altres tipus de barra, la línia inicial o excepcions per pentagrama només si els casos d’ús ho justifiquen. La primera configuració de compassos ja és homogènia i no incorpora edició local de cada línia.

No hi ha encara dades de notes, pulsacions ni edició de partitures. Les primitives desconegudes fallen explícitament fins que cada sortida les admeti. Les futures opcions han d’actualitzar el model i la geometria compartits abans d’afegir controls; no han de dibuixar elements exclusius del preview.

La [publicació experimental](deployment.md#previsualització-de-la-branca-2x) utilitza un paquet separat. La versió estable es publica des de `main` després de la revisió local.

## Capçalera i peu personalitzats · 2.2.0

`settings.pageText` conté `{ title:'', instructions:'', nameDate:false, firstPageOnly:true, language:'ca', footer:'', titleAlign:'left', instructionsAlign:'left' }`. Títol, instruccions i peu admeten 100, 500 i 160 caràcters, respectivament. Es normalitzen a Unicode NFC, sense controls; els espais finals es mantenen per no interrompre l’edició i els salts de paràgraf d’instruccions es conserven. Els camps buits no afegeixen primitives ni canvien el full anterior.

`headerContent()` reparteix títol, paràgrafs i fila de nom/data dins dels marges. Un 74% de l’amplada disponible entre camps es reserva al nom i un 26% a la data, separats per 8 mm. Les etiquetes impreses es resolen als deu idiomes, amb l’idioma actual de la interfície durant l’edició i l’idioma desat per a consumidors del motor. El contingut de l’usuari no es tradueix. La reserva superior és el màxim entre l’altura real de capçalera i l’espai superior extra; s’hi afegeix l’extensió de les claus.

La capçalera es pot ometre al revers, sense afectar el peu compartit ni l’opció independent de limitar l’espai superior extra a l’anvers. Les pàgines explícites hereten i poden sobreescriure parcialment `pageText`. El peu de text propi es reparteix en files independents de l’adreça i la referència; la seva altura es reserva abans dels pentagrames. Si no hi cap, impressió i PDF es bloquegen per a tot el document.

A la 2.2.0, P8 incorporava al final un bloc `-Q` amb una tupla JSON UTF-8 codificada en base64url (sensible a majúscules/minúscules). Conserva textos, paràgrafs, opcions i idioma. La resta de la geometria continua amb les regles P2–P7. El descodificador valida estructura, tipus, límits i representació canònica abans d’acceptar-la. Des de la 2.3.0 només es descodifica per compatibilitat: els nous codis exclouen qualsevol camp de capçalera o peu. Els dos peus d’un document de dues cares codifiquen els ajustos geomètrics comuns.

Els textos nous utilitzen Noto Serif ExtraLight 200, generada amb el mateix origen fixat que la font antiga. SVG i PDF comparteixen amplades, mides i salts de línia. El PDF incrusta un únic recurs Unicode Type0 amb el TrueType, `CIDToGIDMap` i `ToUnicode`; els accents i els textos són seleccionables i recuperables. La font ASCII Thin dels peus antics es manté sense canvis. Els programes binaris del PDF no formen part de les dependències inicials de la interfície. Els textos romanen al navegador i als enllaços creats expressament; l’analítica continua excloent fragments, noms i continguts.

## Full híbrid i codis de geometria · 2.3.0

`settings.notes` conté `{ enabled:false, position:'bottom', percent:40, pattern:'dots', spacing:8 }`. El percentatge es normalitza en passos del 5%, entre 10 i 70. La pauta és `blank`, `ruled`, `grid` o `dots`; separació de 8–12 mm per a línies i 6–10 mm per a quadrícula/punts. Les línies són de 0,08 mm i grises; els punts tenen radi de 0,16 mm. No hi ha contorn de la zona ni etiquetes impreses.

La reserva es calcula sobre l’altura útil després de marges, capçalera/espai superior i peu. Des de la 2.3.1, primer es calcula la distribució completa sense comprimir-la, i la reserva n’oculta les files que col·lideixen amb la zona de notes més el menor marge vertical. El costat musical inclou les extensions de les claus i el mig gruix del traç. No es mou ni es renumera cap pentagrama restant. El recompte original es conserva en els ajustos; desactivar la reserva recupera totes les files. Un full original invàlid o sense cap fila visible continua mostrant l’avís i bloqueja la impressió. La configuració és comuna a les dues cares, però cada cara calcula el seu espai útil. Les excepcions parcials de pàgina hereten els altres camps de notes.

`createNotes()` genera primitives `line` amb gris de traç i `circle` amb gris de farciment. SVG i PDF consumeixen les mateixes coordenades; el PDF dibuixa cada cercle amb quatre corbes cúbiques i restaura el negre quan hi ha línies musicals després de la pauta. Sense notes actives, la sortida antiga es manté byte a byte.

`encodeReference()` ignora tot `pageText`, `source` i `reference`. Es conserven nombre/agrupament perquè el codi permeti reconstruir el full sense deduir res de la imatge. Amb notes actives, P9 afegeix `-WB40.D8`: T/B per a posició, percentatge de dues xifres, B/R/G/D per a pauta i separació en mm. El sufix ocupa 8–9 caràcters. Els formats P1–P8 continuen sent llegibles i es valida la representació canònica després de normalitzar.

`encodeShareHash()` afegeix dades al fragment només quan cal. Sense textos manté el format anterior de noms de blocs. Amb textos utilitza un objecte JSON amb `b` (noms, si escau) i `t` (tupla UTF-8 base64url de `pageText`). La tupla antiga de sis camps es conserva per als textos sense alineació especial; dos camps finals opcionals guarden alineació de títol i instruccions. El descodificador accepta els enllaços anteriors. Això no és un codi imprès: la longitud del text lliure només afecta l’enllaç complet.

Aplicar un codi nou des del sidebar conserva `pageText` actual; importar un P8 antic amb textos recupera el contingut antic. Plantilles locals, historial i punt de restabliment continuen desant objectes complets. `tests/notes.test.mjs` cobreix reserva, marges, formats, doble cara, primitives, PDF, límits, codis, persistència i ajust; `tests/page-text.test.mjs` comprova també alineacions i compatibilitat P8.

A partir de la 2.3.1, `layout.count` conserva el nombre original, `visibleCount` indica el nombre dibuixat i `staffIndices` relaciona cada fila visible amb el seu índex original. El model semàntic conserva totes les files i dona `lines:[]` a les ocultes; així les identitats sobreviuen a canvis de reserva i a la normalització repetida. La referència continua descrivint la configuració original més la reserva. `notesGap` exposa el marge mínim i `baseNeeded` la necessitat vertical original. Les sortides només consumeixen les files visibles, mantenint claus i unions dins dels seus blocs.

## Peu horitzontal · 2.3.3

Amb `pageText.footer`, `footerLines()` distribueix adreça a l’esquerra, text propi al centre i codi a la dreta sobre la mateixa línia de base. L’adreça pot ocupar fins al 20% de l’amplada útil i la referència fins al 45%, amb 4 mm de separació màxima entre continguts. El text propi utilitza l’espai restant i es manté al centre del full quan hi cap; si cal, es desplaça dins del seu espai. Les mides s’ajusten a l’amplada mesurada, sense retallar textos ni afegir files. `footerTextWidth(text, size)` admet la mida efectiva; el PDF la utilitza també en l’ancoratge de referències reduïdes. Sense peu personalitzat, es conserva l’algoritme anterior per compatibilitat.


## Format de capçalera · 2.4.0

`pageText.titleStyle` i `instructionsStyle` contenen `{ family, size, bold, italic, underline }`. Famílies tancades `serif`, `sans`, `lora`; mida física en mm, de 2,12 a 16,93 (aprox. 6–48 pt), mostrada en punts al panell. Per compatibilitat, els valors inicials continuen sent exactament 6 mm per al títol i 3,2 mm per a les instruccions. Els estils són independents i la normalització sempre crea còpies. Les pàgines explícites hereten parcialment també els camps interns dels estils.

`page-font.js` resol la variant real i mesura amb els seus avanços sense kerning ni lligadures. La mateixa variant consta a la primitiva de text (`fontFace` només quan no és la font original). SVG aplica família/pes/cursiva locals; PDF incrusta només les variants utilitzades amb mapes Unicode i recursos diferents. El subratllat és una línia de la mateixa escena, ancorada segons la llargada física mesurada. La reserva de capçalera, els salts de línia i la validació de desbordament segueixen al motor.

La tupla compartida afegeix a les vuit posicions prèvies dues tuples opcionals `[family,size,bold,italic,underline]`. Només s’emeten si hi ha format diferent de l’original, i el descodificador continua acceptant sis i vuit camps sense modificar-ne la codificació. `encodeReference` continua ignorant tot `pageText`.

Les fonts són locals, amb mètriques separades dels programes PDF. Consulteu `docs/vendor/header-fonts-SOURCE.md` i `tools/vendor-header-fonts.py` per reproducció, revisió fixada i verificació de fonts i llicències.
