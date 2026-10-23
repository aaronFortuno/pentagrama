# Accessibilitat

Aquesta revisió conserva les funcions i el disseny de Pentagrama.

- Tab i Majúscules+Tab recorren els controls. Els primers enllaços permeten saltar al contingut o al full. Les seccions es poden desplegar amb Enter o Espai.
- Els desplegables de configuració mantenen el focus al control i anuncien l’opció activa: fletxes, Inici/Final i inicials per explorar; Enter, Espai o Tab per confirmar; Escape per cancel·lar. El menú d’idiomes també admet fletxes, inicials i Escape.
- Els camps numèrics indiquen les unitats i admeten fletxes amunt/avall; els lliscadors mantenen la interacció nativa. No cal fer arrossegaments.
- Els flotants de format es tanquen amb Escape o continuant amb Tab més enllà del darrer control. El focus continua al costat del botó que els ha obert. Els diàlegs modals natius mantenen el focus al seu interior i el retornen en tancar.
- El full té una descripció textual complementària. Els canvis de distribució s’anuncien amb una pausa, sense llegir cada pas intermedi. Els avisos i errors continuen disponibles. El contingut d’SVG i PDF imprimible no canvia.
- La navegació del full respecta el zoom del navegador amb Ctrl/Command i els colors forçats del sistema tenen indicadors d’estat.

## Validació

Proves de comportament dels desplegables, ordre de focus dels flotants, avisos agrupats, descripcions als deu idiomes i destinacions del catàleg. Revisió manual local amb teclat, arbre d’accessibilitat i mides d’escriptori/mòbil. Aquesta comprovació no equival a una certificació WCAG ni substitueix una prova d’ús amb NVDA, VoiceOver o altres lectors de pantalla.

Referències: [patró combobox de WAI-ARIA](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/), [diàlegs modals](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).
