# Analítica i privadesa

La publicació de `pentagrama.page` utilitza Umami Cloud per conèixer l’abast i l’ús bàsic del generador. No utilitza cookies, gravacions de sessions, mapes de calor ni identificadors propis per seguir persones entre webs.

La finalitat és saber quines funcions resulten útils i orientar les millores futures.

Al diàleg V4V, un resum breu queda plegat sota «Privadesa i estadístiques», amb animació en obrir i tancar. L’interruptor d’exclusió es manté visible fora del desplegable. Els detalls tècnics de la mesura es documenten a continuació.

## Què es mesura

A més de les visites, es mantenen aquestes set accions:

| Esdeveniment | Moment | Propietats |
|---|---|---|
| `print_requested` | Després de validar el full i esperar les fonts, just abans d’obrir el diàleg d’impressió | Format, mode, idioma i perfil d’opcions; presència de plantilles personals desades |
| `template_applied` | Aplicació d’una plantilla des del sidebar | Categoria suggerida/personal; identificador fix només si és suggerida |
| `template_saved` | Desament persistent completat | Categoria personal, format, mode, idioma i perfil d’opcions |
| `share_requested` | Petició de compartir | Categoria actual/suggerida/personal |
| `logo_clicked` | Activació de la nota del logo amb ratolí, tacte o teclat, també quan atura un fragment | Cap propietat addicional |
| `melody_started` | El reproductor ha preparat l’àudio i comença un fragment | Identificador fix del fragment i origen: descoberta, repetició o fragment següent |
| `melody_info_opened` | Obertura del diàleg d’informació d’un fragment | Identificador fix del fragment |

Una petició d’impressió no confirma una impressió física o un PDF desat: el navegador també permet cancel·lar el diàleg. Compartir mesura la petició de còpia, no un enviament a una altra persona.

Des de **2.3.5**, imprimir i desar afegeixen propietats a la mateixa petició, sense nous disparadors. No s’envia cap esdeveniment en moure lliscadors, editar camps, obrir seccions o carregar la biblioteca personal.

### Opcions del full

Les propietats `paper` (`A3`, `A4`, `LETTER`), `mode` (`simple`, `blocks`) i `language` es complementen amb booleans explícits, inclòs `false` quan una opció no està activa:

| Propietat | Significat |
|---|---|
| `annotations` | Reserva d’espai per a anotacions |
| `duplex` | Dues cares |
| `clefs` | Claus activades |
| `barlines` | Línies de compàs activades |
| `name_date` | Fila de nom i data |
| `has_saved_templates` | El navegador té almenys una plantilla personal desada persistentment |

La presència de plantilles es comprova en demanar imprimir, llegint localment la biblioteca. Si l’emmagatzematge no es pot llegir, aquesta propietat s’omet: no es confon una situació desconeguda amb una biblioteca buida. En un desament confirmat sempre és `true`. No s’envien quantitats exactes, identificadors ni noms personals, ajustos detallats, textos, codis o contingut de la biblioteca.

En `template_applied`, la propietat `template` només admet els identificadors públics fixos `blank`, `piano`, `choir`, `large`, `annotations`, `trio`, `choir-piano` i `orchestra`, i només quan `kind=suggested`. Les plantilles personals només envien `kind=personal`. Les visites al catàleg i a les fitxes públiques continuen sent visites de pàgina; obrir-les no es compta com una aplicació des del sidebar.

### Com interpretar aquestes dades

- **Quines plantilles suggerides s’utilitzen:** a `template_applied`, filtra `kind=suggested` i consulta `template`.
- **Si es desen plantilles personals:** consulta `template_saved`. Es compta només després d’un desament confirmat, no en obrir el diàleg, cancel·lar-lo o trobar un error d’emmagatzematge.
- **Si es reutilitzen:** a `template_applied`, filtra `kind=personal`.
- **Si qui imprimeix ja té una biblioteca personal:** a `print_requested`, consulta `has_saved_templates`.
- **Quines opcions tenen ús final:** a `print_requested`, compara els valors `true` i `false` de cada opció. `template_saved` permet observar també les opcions que es volen conservar per més endavant.

A Umami aquestes dades es consulten a **Events → Properties**, filtrant l’esdeveniment corresponent. [Documentació de propietats d’esdeveniments](https://docs.umami.is/docs/event-data).

Els recomptes són accions, no persones úniques: un usuari pot desar o imprimir diverses vegades. La presència de plantilles descriu només el navegador en el moment de la petició, sense identificar l’usuari. Les propietats noves no es poden reconstruir per a esdeveniments anteriors a aquesta versió.

Les obertures de píndoles indiquen que s’ha obert el diàleg, no que s’hagi llegit ni durant quant de temps. Els inicis musicals només es compten quan el reproductor comença; un clic amb àudio no disponible no es compta com a inici. Les repeticions també són inicis i es distingeixen per l’origen. No es registren cada nota ni cada fotograma d’animació.

Per seguir l’ou de pasqua al panell d’esdeveniments, compara `logo_clicked`, `melody_started` i `melody_info_opened`; filtra per `melody` per veure els fragments. Són recomptes d’accions, no persones úniques ni una taxa de conversió automàtica. Les proves de configuració també poden aparèixer al panell.

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
