# Analítica i privadesa

La publicació de `pentagrama.page` utilitza Umami Cloud per conèixer l’abast i l’ús bàsic del generador. No utilitza cookies, gravacions de sessions, mapes de calor ni identificadors propis per seguir persones entre webs.

La finalitat és saber quines funcions resulten útils i orientar les millores futures.

Al diàleg V4V, el detall d’aquesta informació queda plegat sota «Privadesa i estadístiques», amb animació en obrir i tancar. L’interruptor d’exclusió es manté visible fora del desplegable.

## Què es mesura

A més de les visites, s’envien aquestes quatre accions:

| Esdeveniment | Moment | Propietats |
|---|---|---|
| `print_requested` | Després de validar el full i esperar les fonts, just abans d’obrir el diàleg d’impressió | Format de paper, mode senzill/blocs i idioma |
| `template_applied` | Aplicació d’una plantilla | Categoria suggerida/personal |
| `template_saved` | Desament persistent completat | Categoria personal |
| `share_requested` | Petició de compartir | Categoria actual/suggerida/personal |

Una petició d’impressió no confirma una impressió física o un PDF desat: el navegador també permet cancel·lar el diàleg. Compartir mesura la petició de còpia, no un enviament a una altra persona.

## Filtratge i exclusió

`docs/analytics.js` filtra les peticions abans d’enviar-les. Elimina el fragment de l’URL, els noms de blocs o plantilles, els camps lliures i els identificadors personals de plantilles. Del referent només conserva l’origen; dels paràmetres de campanya admet `utm_source`, `utm_medium` i `utm_campaign` amb valors simples.

Les estadístiques també inclouen informació bàsica de navegador, sistema, dispositiu, pantalla, idioma i ubicació aproximada. Segons la [documentació d’Umami](https://docs.umami.is/docs/metric-definitions), la IP de la connexió es processa per obtenir estadístiques, però no s’emmagatzema. Per això no s’afirma que el proveïdor no rebi mai cap IP ni que només es recullin clics.

L’script es carrega de manera asíncrona i només a `pentagrama.page`. Si falla o queda bloquejat, el generador i la impressió continuen funcionant. Respecta Do Not Track i Global Privacy Control.

El switch **Sobre el projecte · V4V → Privadesa i estadístiques → Exclou aquest navegador de les estadístiques** està desactivat per defecte. Si s’activa, la preferència es desa amb la clau local `umami.disabled` i només afecta aquell navegador i perfil. Les exclusions triades anteriorment es conserven.

El switch reflecteix només l’exclusió manual. Si el navegador envia Do Not Track o Global Privacy Control, l’analítica queda bloquejada igualment i el diàleg ho explica en un avís separat. Desactivar el switch no anul·la aquestes preferències del navegador. Si falla l’emmagatzematge, la tria manual es respecta durant la pàgina actual i es mostra un avís.

## Panells del propietari

- [Umami: visites](https://cloud.umami.is/analytics/eu/websites/20ee7f51-6ba8-4486-86a5-f347851105b2).
- [Umami: accions](https://cloud.umami.is/analytics/eu/websites/20ee7f51-6ba8-4486-86a5-f347851105b2/events).
- [Google Search Console](https://search.google.com/search-console?resource_id=sc-domain%3Apentagrama.page).

Els panells requereixen accés al compte del propietari. L’identificador d’Umami al meta `umami-website-id` de l’HTML és públic i no dona accés al panell.

Search Console mesura aparicions i clics a Google; Umami mesura visites i accions al web. La propietat de domini està verificada amb un TXT a Spaceship, que cal conservar. El sitemap és https://pentagrama.page/sitemap.xml i `docs/robots.txt` n’indica l’adreça.

Els informes poden trigar a mostrar dades i no representen un recompte exacte de persones. Amb poc volum, els recomptes absoluts són més útils que les variacions percentuals.

[Torna al README](../README.md)
