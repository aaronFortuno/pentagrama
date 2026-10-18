# Melodies del logotip

Dotze fragments monòdics adaptats per a glockenspiel. No es distribueixen gravacions d’aquestes obres ni fitxers MIDI: les notes del catàleg utilitzen el mateix banc local de mostres VSCO 2 Community Edition, CC0. Les composicions són de domini públic; les fonts consultades i els crèdits de les edicions són a continuació.

| Fragment | Adaptació | Partitura consultada |
|---|---|---|
| Oda a l’alegria, Beethoven | Primera frase del tema, en sol major; ritme amb negra amb punt i corxera | [Mutopia 528](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=528), edició de Peter Chubb, domini públic |
| Für Elise, Beethoven | Nou primeres notes, amb re sostingut i nota final prolongada per tancar el fragment | [Mutopia 931](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=931), Stelios Samelis, domini públic |
| Minuet en sol, Petzold | Dos primers compassos, sense ornaments | [Mutopia 75](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=75), Allen Garvin, domini públic |
| A la cova del rei de la muntanya, Grieg | Dos compassos del motiu, transportats a sol menor per cabre al logotip | [Mutopia 1888](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1888), Coyau, domini públic |
| Ah, vous dirai-je, maman | Primera frase de la melodia tradicional utilitzada per Mozart a K. 265, transportada a sol | [Mutopia 2236](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=2236), Jeffrey Olson, domini públic |
| Cànon en re, Pachelbel | Quatre primers compassos de la veu del violí, amb la nota final prolongada | [Mutopia 2047](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=2047), Michael Fischer v. Mollard © 2015, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Adaptació monòdica per a aquest projecte |
| Cinquena simfonia, Beethoven | Dos motius inicials, transportats una quarta amunt, amb fermates prolongades | [Mutopia 941](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=941), Stelios Samelis / Johannes Heinecke, domini públic |
| Petita serenata nocturna, Mozart | Quatre primers compassos del primer moviment, amb els silencis; transport a la major i canvi d’octava | [Mutopia 900](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=900), edició anònima, domini públic |
| Marxa turca, Mozart | Anacrusi i tres compassos inicials, valors augmentats per al glockenspiel i final prolongat; sense ornaments | [Mutopia 108](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=108), Rune Zedeler i Chris Sawer, domini públic |
| Bourrée en mi menor, Bach | Anacrusi i dos compassos de BWV 996, transportats a la menor; nota final prolongada | [Mutopia 1743](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1743), Rudy Matela, domini públic |
| La primavera, Vivaldi | Anacrusi i dos compassos inicials; una octava avall, valors augmentats i final prolongat | [Mutopia 301](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=301), edició anònima © 2010, [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). Transcripció monòdica adaptada; la maquetació original no es distribueix |
| Ave Maria, Schubert | Dos primers compassos vocals, valors augmentats, sense notes d’ornament i amb final prolongat | [Mutopia 1054](https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=1054), Ph. Raynaud, domini públic |

La data i estrena de la Novena es contrasten amb [Beethoven-Haus Bonn](https://www.beethoven.de/en/news/view/5689797058232320/Besondere%2BSch%C3%A4tze). L’atribució del minuet a Petzold es contrasta amb la [Bibliothèque nationale de France](https://catalogue.bnf.fr/ark:/12148/cb39625474x), ja que la fitxa històrica de Mutopia encara l’atribueix a Bach. Els textos del popup són originals i expliquen breument l’obra i el motiu editorial de la tria.

## Afegir un fragment

`docs/melodies.js` conté identificador estable, compositor, obra, tempo, font, crèdit si cal i notes amb durades expressades en negres. `E5:0.5` és una corxera; `-:1` és un silenci d’una negra. El registre admès és mi4–fa5, amb sostinguts i bemolls explícits. `planMelody()` valida les dades i prepara salts continus que aterren als instants de la partitura. Els salts distribueixen les columnes esquerra, centre i dreta, sense perdre l’altura musical.

Cada fragment necessita quatre entrades als idiomes disponibles de `docs/i18n.js`: `melody_ID_label`, `melody_ID_title`, `melody_ID_story` i `melody_ID_reason`. El títol breu ha de cabre al lloc de «pentagrama». Manteniu els fragments curts, documenteu qualsevol transport o simplificació i enllaceu una font i la seva llicència.

## Reproducció i descoberta

`melody-player.js` prepara les mostres abans de començar i programa els sons amb 220 ms d’antelació sobre el rellotge d’àudio. La vista utilitza `getOutputTimestamp()` quan està disponible per seguir el so que arriba al dispositiu; no encadena temporitzadors ni acumula retard entre notes. Un fotograma molt tardà no reprodueix de cop les notes perdudes. `createLogoNote().takeControl()` permet dibuixar els salts musicals amb la mateixa física dels salts individuals, sense generar un segon so.

`melody-discovery.js` compta cinc clics consecutius, reiniciant el recompte després de 12 segons sense clicar. `createMelodyPicker()` barreja el catàleg des de la primera descoberta i l’esgota abans de tornar-lo a barrejar; impedeix repetir el mateix fragment al límit entre rondes. «Una altra melodia» comparteix el mateix selector, mentre que repetir no consumeix cap entrada.

Un clic a la nota durant la càrrega o reproducció atura la melodia. Obrir-ne o tancar-ne la història conserva la música. El primer botó del popup canvia entre aturar i tornar a escoltar; reproduir i passar a una altra melodia mantenen el diàleg obert. No s’inicia cap melodia automàticament ni en tornar a la pestanya. Les notes sostingudes i els silencis deixen la nota en repòs fins a un màxim de 700 ms abans del següent atac, sense salts excessivament lents ni canvi del ritme.

`wordmark.js` anima les lletres per separat; el punt vermell és un element persistent. El moviment reduït conserva el ritme musical i canvia la nota en el moment de l’aterratge, sense salts ni deformacions. Amagar la pàgina, sortir-ne o obrir la impressió cancel·la la reproducció pendent. Aquest estat és temporal i no modifica cap plantilla, referència, configuració d’impressió o dada d’analítica.

## Retrats

Les vuit il·lustracions de `docs/portraits/` són creacions contemporànies fetes amb l’eina integrada `image_gen`, en estil de linogravat sobre fons transparent. No es presenten com a gravats documentals. El retrat de Petzold és imaginat i s’indica explícitament al popup i al text alternatiu. Els altres són interpretacions de semblances conegudes, sense copiar un gravat concret.

Cada asset es conserva al projecte. [provenance.json](../docs/portraits/provenance.json) conté el conjunt exacte de prompts, el mode de generació i la referència d’estil compartida. Els PNG tenen canal alfa; el filtre de presentació els limita a tinta negra mantenint la transparència. La càrrega diferida evita baixar-los quan només s’utilitza el generador de fulls, i un error d’imatge no interromp la música ni la història. Aquestes imatges no arriben a la impressió del paper pautat.
