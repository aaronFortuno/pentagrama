# Motor v2 · 2.0.0

Motor incorporat a la versió estable **2.0.0**, desenvolupat inicialment a `codex/v2-modular-engine` a partir de **1.17.2** (`db130fe`). Separa la geometria i les sortides de la interfície, conserva els fulls existents i afegeix claus i compassos opcionals.

## Recorregut del document

`configuració → model normalitzat → distribució física → escena vectorial → SVG / impressió / PDF`

La geometria es calcula en mil·límetres. Els renderitzadors consumeixen una escena amb primitives i propietaris semàntics; no tornen a distribuir els pentagrames. El zoom continua sent una transformació de pantalla, sense efectes sobre les dimensions impreses.

| Mòdul a `docs/engine/` | Responsabilitat |
|---|---|
| `constants.js`, `settings.js` | Formats, valors inicials i normalització de les opcions existents |
| `references.js` | Codis P1–P6 i fragments d’enllaços compartits |
| `model.js` | Pàgines, conjunts, blocs i pentagrames amb identitats |
| `page-layout.js`, `fit.js` | Distribució física i ajust explícit quan el contingut no hi cap |
| `footers.js`, `typography.js` | Peus opcionals i mesures tipogràfiques |
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

1. Incorporar capçalera escolar i peu personalitzat a la geometria i l’escena comunes.
2. Ampliar el tractament del text abans d’incorporar contingut lliure i logotips.
3. Valorar altres tipus de barra, la línia inicial o excepcions per pentagrama només si els casos d’ús ho justifiquen. La primera configuració de compassos ja és homogènia i no incorpora edició local de cada línia.

No hi ha encara dades de notes, pulsacions ni edició de partitures. Les primitives desconegudes fallen explícitament fins que cada sortida les admeti. Les futures opcions han d’actualitzar el model i la geometria compartits abans d’afegir controls; no han de dibuixar elements exclusius del preview.

La [publicació experimental](deployment.md#previsualització-de-la-branca-2x) utilitza un paquet separat. La versió estable es publica des de `main` després de la revisió local.
