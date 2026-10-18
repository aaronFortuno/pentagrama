# Instruccions del projecte

## Novetats de cada versió

Cada nova versió publicada del web ha de reflectir els canvis al diàleg de novetats que s’obre des del número de versió al centre del footer. És un requisit del projecte: no n’hi ha prou amb actualitzar `CHANGELOG.md`.

El resum ha de ser breu, concís i entenedor per a l’usuari, amb un o pocs punts sobre les millores o correccions de la versió. Evita detalls interns d’implementació i repeticions. Ha d’incloure la data real de publicació i estar disponible als vuit idiomes del web.

En preparar una versió, actualitza `package.json`, la data i les claus del resum a `src/release.json`, els textos corresponents a `docs/i18n.js` i l’historial detallat a `CHANGELOG.md`. Executa `node tools/version-assets.mjs` per regenerar les pàgines i `docs/release.js`; comprova que el número, la data i el resum del footer corresponen a la versió que publiques. No editis manualment aquests fitxers generats.

Consulta el procediment complet a [documentation/deployment.md](documentation/deployment.md).
