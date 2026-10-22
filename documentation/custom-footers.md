# Peus personalitzats

A **Capçalera i peu de pàgina → Peu de pàgina**, el text és opcional i es pot combinar amb una imatge. **Afegeix una imatge** accepta PNG, JPEG i WebP de fins a 12 MB; PNG i WebP poden conservar transparència. La càrrega es processa íntegrament al navegador i la imatge no es puja a cap servidor.

La roda de configuració de la miniatura permet triar alçada (3–18 mm), imatge davant, darrere, damunt o sota del text, i alineació vertical quan comparteixen fila. El màxim d’amplada és 65 mm, amb proporcions conservades i reducció addicional segons l’espai disponible. No hi ha eines de retall ni d’edició de la imatge. Per imprimir només un logotip, deixa buit el text.

L’adreça del servei i la referència mantenen les seves bandes laterals. La combinació personal ocupa l’espai central que queda i el motor reserva l’altura necessària abans de distribuir els pentagrames. SVG, impressió i PDF reutilitzen les mateixes coordenades. El PDF incrusta RGB i una màscara de transparència, sense dependre d’un recurs extern.

**Peus desats** permet conservar fins a vuit combinacions de text, imatge, mida i disposició, i aplicar-les a qualsevol full. Els peus no inclouen la capçalera, el format del paper ni la resta del layout. Es poden eliminar individualment o tots alhora; això no altera les còpies que ja formen part d’una plantilla personal o del full actual. Les dades pertanyen a cada navegador i origen. El mode privat, l’eliminació de dades del navegador o un límit d’emmagatzematge poden impedir-ne la conservació; els desaments fallits s’indiquen.

Les plantilles personals i desfer/refer conserven la imatge. L’entrada local de l’historial del navegador recorda el peu actual i el del punt de restabliment per recuperar-los en recarregar, mantenint diferenciats el full modificat i la plantilla inicial. **Els enllaços compartits exclouen sempre la imatge**, i el codi imprès continua descrivint només la geometria. Per reutilitzar el logotip en un altre navegador, cal tornar-lo a carregar.

Internament, la imatge es torna a codificar com un PNG sense metadades, amb un màxim de 1.024 píxels de costat, 524.288 píxels totals i 96 KiB. El reescalat manté les proporcions i pot reduir més les fotografies amb molt detall. Les imatges originals no es desen. El motor valida dimensions, integritat i dades descomprimides abans d’acceptar el PNG. No s’accepten URLs externes ni SVG en aquesta primera iteració.

La biblioteca de peus utilitza `pentagrama.footers.v1`. Les imatges de les plantilles personals són instantànies independents, perquè eliminar un peu de la biblioteca no en trenqui l’aparença. Les preferències tipogràfiques de títol i instruccions no incorporen el peu ni les seves imatges. L’analítica no transmet logotips, noms de fitxer, textos ni configuracions de peu.

La compressió PNG/PDF utilitza [fflate 0.8.2](https://github.com/101arrowz/fflate), distribuïda localment sota MIT i fixada amb SHA-512 a `tools/vendor-raster.mjs`. Les icones continuen sent de Lucide. Les llicències i els enllaços es troben també al diàleg del projecte.
