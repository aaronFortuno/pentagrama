# Melodies del logotip

Sis fragments monòdics adaptats per a glockenspiel. No es distribueixen gravacions d’aquestes obres ni fitxers MIDI: les notes del catàleg utilitzen el mateix banc local de mostres VSCO 2 Community Edition, CC0. Les composicions són de domini públic; les fonts consultades i els crèdits de les edicions són a continuació.

| Fragment | Adaptació | Partitura consultada |
|---|---|---|
| Oda a l’alegria, Beethoven | Primera frase del tema, en sol major; ritme amb negra amb punt i corxera | [Mutopia 528](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=528), edició de Peter Chubb, domini públic |
| Für Elise, Beethoven | Nou primeres notes, amb re sostingut i nota final prolongada per tancar el fragment | [Mutopia 931](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=931), Stelios Samelis, domini públic |
| Minuet en sol, Petzold | Dos primers compassos, sense ornaments | [Mutopia 75](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=75), Allen Garvin, domini públic |
| A la cova del rei de la muntanya, Grieg | Dos compassos del motiu, transportats a sol menor per cabre al logotip | [Mutopia 1888](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1888), Coyau, domini públic |
| Ah, vous dirai-je, maman | Primera frase de la melodia tradicional utilitzada per Mozart a K. 265, transportada a sol | [Mutopia 2236](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=2236), Jeffrey Olson, domini públic |
| Cànon en re, Pachelbel | Quatre primers compassos de la veu del violí, amb la nota final prolongada | [Mutopia 2047](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=2047), Michael Fischer v. Mollard © 2015, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Adaptació monòdica per a aquest projecte |

La data i estrena de la Novena es contrasten amb [Beethoven-Haus Bonn](https://www.beethoven.de/en/news/view/5689797058232320/Besondere%2BSch%C3%A4tze). L’atribució del minuet a Petzold es contrasta amb la [Bibliothèque nationale de France](https://catalogue.bnf.fr/ark:/12148/cb39625474x), ja que la fitxa històrica de Mutopia encara l’atribueix a Bach. Els textos del popup són originals i expliquen breument l’obra i el motiu editorial de la tria.

## Afegir un fragment

`docs/melodies.js` conté identificador estable, compositor, obra, tempo, font, crèdit si cal i notes amb durades expressades en negres. `E5:0.5` és una corxera; `-:1` és un silenci d’una negra. El registre admès és mi4–fa5, amb sostinguts i bemolls explícits. `planMelody()` valida les dades i prepara salts continus que aterren als instants de la partitura. Els salts distribueixen les columnes esquerra, centre i dreta, sense perdre l’altura musical.

Cada fragment necessita quatre entrades als vuit idiomes de `docs/i18n.js`: `melody_ID_label`, `melody_ID_title`, `melody_ID_story` i `melody_ID_reason`. El títol breu ha de cabre al lloc de «pentagrama». Manteniu els fragments curts, documenteu qualsevol transport o simplificació i enllaceu una font i la seva llicència.

## Reproducció i descoberta

`melody-player.js` prepara les mostres abans de començar i programa els sons amb 220 ms d’antelació sobre el rellotge d’àudio. La vista utilitza `getOutputTimestamp()` quan està disponible per seguir el so que arriba al dispositiu; no encadena temporitzadors ni acumula retard entre notes. Un fotograma molt tardà no reprodueix de cop les notes perdudes. `createLogoNote().takeControl()` permet dibuixar els salts musicals amb la mateixa física dels salts individuals, sense generar un segon so.

`melody-discovery.js` compta cinc clics consecutius, reiniciant el recompte després de 12 segons sense clicar. La primera descoberta és l’Oda a l’alegria; les següents recorren el catàleg. Un clic durant la càrrega o reproducció atura la melodia. Obrir-ne la història també l’atura. No s’inicia cap melodia automàticament ni en tornar a la pestanya.

`wordmark.js` anima les lletres per separat; el punt vermell és un element persistent. El moviment reduït conserva el ritme musical i canvia la nota en el moment de l’aterratge, sense salts ni deformacions. Amagar la pàgina, sortir-ne o obrir la impressió cancel·la la reproducció pendent. Aquest estat és temporal i no modifica cap plantilla, referència, configuració d’impressió o dada d’analítica.
