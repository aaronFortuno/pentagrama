# Motor v2 · 2.0.0-alpha.1

Primera etapa de la branca `codex/v2-modular-engine`, basada en **1.17.2** (`db130fe`). L’objectiu és separar el motor de la interfície sense canviar els fulls que ja funcionen. La publicació estable i la branca `main` es mantenen independents.

## Recorregut del document

`configuració → model normalitzat → distribució física → escena vectorial → SVG / impressió / PDF`

La geometria es calcula en mil·límetres. Els renderitzadors consumeixen una escena amb primitives i propietaris semàntics; no tornen a distribuir els pentagrames. El zoom continua sent una transformació de pantalla, sense efectes sobre les dimensions impreses.

| Mòdul a `docs/engine/` | Responsabilitat |
|---|---|
| `constants.js`, `settings.js` | Formats, valors inicials i normalització de les opcions existents |
| `references.js` | Codis P1–P4 i fragments d’enllaços compartits |
| `model.js` | Pàgines, conjunts, blocs i pentagrames amb identitats |
| `page-layout.js`, `fit.js` | Distribució física i ajust explícit quan el contingut no hi cap |
| `footers.js`, `typography.js` | Peus opcionals i mesures tipogràfiques |
| `document.js`, `scene.js` | Composició del document i escena comuna en mm |
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

El límit és de 32 pàgines. Cada pàgina hereta les opcions comunes i aplica les seves excepcions. `normalizeDocument()` retorna còpies independents i és idempotent. Un document creat també es pot tornar a passar a `createDocument()`. La interfície actual continua configurant **un sol full**; aquesta etapa no afegeix controls nous.

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

Les proves també cobreixen jerarquia, identitats, independència dels objectes, normalització repetida, documents amb formats diferents, exportació incompleta rebutjada, versions preliminars i imports amb invalidació de memòria cau. Es mantenen les proves existents de plantilles, persistència, restabliment, desfer/refer, idiomes, gestos i melodies.

## Següents ampliacions

1. Incorporar primera pàgina i doble cara a la interfície utilitzant les pàgines i excepcions del model.
2. Afegir claus homogènies com a dades dels pentagrames, amb una capa de glifs musicals i espai reservat al començament de la pauta.
3. Afegir compassos i connexions de grup calculats a partir dels límits dels blocs; ampliar l’escena i els dos renderitzadors amb proves compartides.

No hi ha encara dades de notes, pulsacions ni edició de partitures. Les primitives desconegudes fallen explícitament fins que cada sortida les admeti. Les futures opcions han d’actualitzar el model i la geometria compartits abans d’afegir controls; no han de dibuixar elements exclusius del preview.

La [publicació experimental](deployment.md#previsualització-de-la-branca-2x) utilitza un paquet separat. Integrar la branca a `main` queda per a una revisió posterior.
