# Pentagrama

Un full en blanc per a la teva música. Web en català per crear i imprimir fulls A4 de pentagrames, amb previsualització en directe.

**[Obre el web](https://aaronfortuno.github.io/pentagrama/)**

## Què pots ajustar

- El gruix de les línies: de 0,05 a 0,50 mm.
- La quantitat de pentagrames: d’1 a 24 per pàgina.
- L’agrupació: de 2 en 2, de 3 en 3, de 4 en 4, etc., o amb espai uniforme.
- La separació extra entre blocs: d’1,2 a 4 vegades l’espai habitual.
- Una referència opcional al peu que permet recuperar exactament la plantilla.

El full imprès només conté els pentagrames i, si l’actives, la referència. Sense notes, silencis, claus, armadures, línies de compàs ni marques d’aigua. El navegador conserva la configuració localment quan l’emmagatzematge està disponible.

## Imprimir o desar un PDF

Prem **Imprimeix el full** i tria una impressora o l’opció de desar com a PDF. Per respectar les mides, selecciona A4 vertical i escala 100 %. Desactiva les capçaleres i els peus de pàgina del navegador perquè no hi apareguin l’adreça web, el títol o la data.

## Recuperar una plantilla

Per exemple, `P1-N9-G3-E22-T12` representa 9 pentagrames, grups de 3, separació de 2,2× i gruix de 0,12 mm. La versió P1 fixa A4 vertical, marges i espai de línia. Enganxa el codi a **Recupera una configuració** per recuperar el mateix dibuix. El peu es pot mostrar o ocultar independentment.

## Publicar a GitHub Pages

El web està a `docs/` i no necessita cap compilació, instal·lació de dependències ni servei extern.

1. A **Settings → Pages**, selecciona **Deploy from a branch**.
2. Tria la branca **main** i la carpeta **/docs**; desa la configuració.
3. GitHub publicarà el web a **https://aaronfortuno.github.io/pentagrama/**.

Les modificacions que es pugin a `main` es publicaran automàticament. El fitxer `docs/.nojekyll` indica que els fitxers s’han de servir directament.

Totes les rutes del web són relatives: es pot allotjar en un subdirectori com `/pentagrama/` o a l’arrel d’un domini propi. Per a un altre allotjament estàtic, copia el contingut de `docs/` a la carpeta pública del servidor.

## Desenvolupament local

Amb Node.js 22 o posterior:

```sh
npm run dev
```

Obre **http://127.0.0.1:4173/pentagrama/**. La previsualització local utilitza el mateix subdirectori que GitHub Pages. No cal executar `npm install`.

```sh
npm test
```

Les proves comproven totes les quantitats i agrupacions admeses, els límits de la pàgina, la separació entre blocs, les referències reproduïbles i l’absència de text al full net.

## Fitxers

- `docs/`: el web publicable, amb HTML, CSS i JavaScript sense dependències.
- `tests/`: proves de la distribució dels pentagrames i de les referències.
- `tools/serve.mjs`: servidor local per fer proves.
- `LICENSE`: la llicència GNU GPL v3 del projecte, conservada del repositori original.

## Llicència

Aquest projecte es distribueix sota la **GNU General Public License, versió 3**. Consulta el text complet a [LICENSE](LICENSE).
