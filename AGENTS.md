# Instruccions del projecte

## Comprovació dels canvis

En els projectes remots, si s’han comprovat els canvis en local, no repeteixis la comprovació al web remot. La revisió remota la farà l’usuari manualment i comunicarà qualsevol problema. Aquesta instrucció no impedeix publicar els canvis autoritzats.

## Novetats de cada versió

Cada nova versió publicada del web ha de reflectir els canvis al diàleg de novetats que s’obre des del número de versió al centre del footer. És un requisit del projecte: no n’hi ha prou amb actualitzar `CHANGELOG.md`.

El resum ha de ser breu, concís i entenedor per a l’usuari: procura dedicar entre una i tres línies a cada versió. Evita detalls interns d’implementació i repeticions. Ha d’incloure la data real de publicació i estar disponible en tots els idiomes del web.

L’historial del footer comença a **2.0.0**, per decisió editorial. Les versions 1.x es consulten a través de l’enllaç al changelog complet i no s’han de tornar a incorporar al popup. A partir de 2.0.0, conserva cada versió anterior com una entrada pròpia, amb número, data i resum; en publicar-ne una de nova, trasllada l’anterior a `history` de `src/release.json`, sense perdre les entrades 2.x existents. El footer ha de continuar sent ràpid de llegir; `CHANGELOG.md` conserva totes les versions i l’explicació exhaustiva de les modificacions.

En preparar una versió, actualitza `package.json`, la data i les claus del resum a `src/release.json`, els textos corresponents a `docs/i18n.js` i l’historial detallat a `CHANGELOG.md`. Executa `node tools/version-assets.mjs` per regenerar les pàgines i `docs/release.js`; comprova que el número, la data i el resum del footer corresponen a la versió que publiques. No editis manualment aquests fitxers generats.

Consulta el procediment complet a [documentation/deployment.md](documentation/deployment.md).
