# Canvis

## 2.0.0-alpha.1 · 2026-10-19

- Primera versió experimental de la branca `codex/v2-modular-engine`, desenvolupada en una còpia de treball separada de `main` i sense canvis a pentagrama.page.
- Motor dividit en configuració, referències P1–P4, distribució física, peus, estructura del document, escena vectorial, SVG, impressió i PDF. Els punts d’entrada anteriors es conserven com a adaptadors compatibles.
- Model de document amb pàgines, conjunts, blocs i pentagrames identificables. La geometria i les primitives es calculen una vegada i alimenten la previsualització, la impressió i el PDF.
- La interfície utilitza el motor nou amb les mateixes opcions i aparença. Es conserven les plantilles suggerides i personals, els ajustos locals, els codis compartits, Restableix i l’historial de desfer/refer.
- Infraestructura interna preparada per a documents de diverses pàgines i exportació vectorial amb fonts compartides. Aquesta versió encara no afegeix controls de doble cara, claus ni línies de compàs.
- Proves de paritat amb una còpia fixada del motor 1.17.2: configuració, geometria, referències, SVG i PDF. Proves addicionals d’identitats, documents de diverses pàgines, models invàlids i versions preliminars.
- Generació i invalidació de memòria cau dels mòduls recursiva, suport de versions preliminars i resum del footer als deu idiomes.
- Paquet experimental independent per al repositori auxiliar `pentagrama-preview`, sense domini propi, indexació ni analítica de producció; documentació del motor, els contractes d’identitat i el procediment de publicació.

## 1.17.2 · 2026-10-18

- «Espai superior extra» passa a formar part de «Marges»: dos camps inicials per als marges horitzontals i verticals, i una vista de quatre camps per ajustar cada costat de manera independent. Els valors s’expressen en mm, amb passos d’1 mm.
- Es conserven els marges inicials de 18 mm als laterals i 21 mm a dalt i a baix. L’espai superior extra se suma al marge superior per reservar lloc per al títol o l’autor.
- Les configuracions asimètriques es mostren amb els quatre camps. Tornar a la vista per eixos conserva els valors diferents fins que s’edita el camp corresponent.
- Marges incorporats a la previsualització, la impressió, el PDF vectorial, les plantilles desades, la persistència local, Restableix i l’historial de desfer/refer.
- Referències P4 per als marges personalitzats, amb compatibilitat completa amb els codis P1, P2 i P3 i la geometria de les plantilles existents. Els peus opcionals s’alineen amb els marges i es reserva espai quan cal per evitar que se superposin als pentagrames.
- A la guia de plantilles, capçalera i peu queden sempre visibles en escriptori i tauleta; només el contingut central té desplaçament, amb la barra d’estil terracota del projecte. En mòbil es conserva el desplaçament natural de la pàgina.
- Capçalera i peu extrets a components de font propis i compartits entre l’editor i la guia; es mantenen els diàlegs comuns de V4V, privadesa i versions.
- Etiquetes i resum als deu idiomes, i proves de geometria, formats, referències, persistència, desfer/refer i compatibilitat amb plantilles anteriors.

## 1.17.1 · 2026-10-18

- Favicon publicat com a PNG de 96 × 96 píxels en una adreça estable i rastrejable, en lloc de l’SVG incrustat en una URL de dades. Es conserva el mateix pentagrama blanc sobre fons terracota.
- Declaració compartida per la portada, els deu idiomes i les guies de plantilles. Font vectorial conservada a `src/favicon.svg`.
- Resum de versió traduït als deu idiomes i historial anterior conservat. La icona als resultats de cerca depèn del processament posterior de Google.

## 1.17.0 · 2026-10-18

- Guia de plantilles i fitxes de coral amb piano i orquestra integrades amb la identitat del generador: mateix logotip, marges, tipografia, capçalera i peu.
- Capçalera, diàlegs de V4V, privadesa i historial de versions generats a partir de la mateixa font localitzada que la pàgina principal. Comportament dels diàlegs compartit perquè les futures versions es reflecteixin a tot el web.
- Selector d’idioma compacte amb el mateix menú, transicions de 220 ms i navegació per teclat. El canvi d’idioma conserva la fitxa de plantilla i desa la preferència del navegador.
- Introducció més breu, graella adaptable i targetes més compactes, amb enllaços accessibles i icones Lucide. Eliminades les files d’idiomes i les explicacions redundants que desplaçaven les plantilles cap avall.
- Fitxes amb dades a l’esquerra i una mostra del full ajustada a l’alçada de la finestra a la dreta. En mòbil, contingut en una columna i targetes horitzontals en pantalles estretes.
- Es conserven els títols i continguts HTML indexables, URL pròpies, enllaços d’idiomes, sitemap i configuració exacta de cada plantilla en obrir el generador.
- Resum de versió als deu idiomes i comprovacions de la font compartida, diàlegs, navegació localitzada i unicitat dels identificadors a totes les pàgines de guia.

## 1.16.0 · 2026-10-18

- Separat el selector «Senzilla / Per blocs» de la zona que es desplaça: queda sempre visible, mentre els blocs i els seus paràmetres tenen desplaçament intern en escriptori. Es conserva el desplaçament natural de la pàgina en mòbil.
- Etiquetes abreujades als camps de blocs i repeticions, amb les descripcions completes disponibles per a lectors de pantalla i al títol dels camps. Les unitats «mm» apareixen dins dels controls.
- Controls numèrics unificats amb fletxes Lucide petites, tons terracota, indicació de focus del grup i desactivació als límits. Es conserven les dreceres de teclat i l’historial de desfer/refer.
- Increments relatius d’1 mm a l’espai entre pentagrames, després dels blocs i entre conjunts. Les plantilles i els codis amb valors fraccionaris conserven la seva precisió; també es poden introduir decimals manualment. El gruix, l’interlineat i el multiplicador d’agrupació mantenen els seus passos fins.
- Graella de tres camps estable a tots els blocs: «Després» es mostra desactivat a l’últim bloc i l’espai interior es desactiva quan només hi ha un pentagrama.
- Marges laterals ampliats al sidebar i a les zones amb desplaçament per evitar tallar les vores de focus, els camps de configuració i els extrems dels lliscadors.
- En finestres d’escriptori molt baixes es reserva una alçada mínima útil per a la distribució i es permet desplaçar el lateral, evitant que el selector se superposi amb altres seccions.
- Selector de paper propi, amb l’estil dels menús del web, transicions compartides de 220 ms i navegació amb fletxes, Inici/Fi, cerca per inicial, selecció i Escape. El menú queda fora del contenidor amb desplaçament per no retallar-ne les vores.
- Botons d’orientació amb la mateixa unió recta, alçada interior i estat actiu que el selector de distribució, inclosos els estats de focus i de passar-hi el punter.
- Resum i etiquetes als deu idiomes, proves dels passos numèrics i conservació de les plantilles i referències anteriors.

## 1.15.4 · 2026-10-18

- Corregit «Restableix»: recupera la configuració de partida de la plantilla oberta des de la guia, un enllaç compartit, la biblioteca personal o un codi de configuració, en lloc de tornar sempre al full global.
- Punt de partida separat de les edicions i de l’historial de desfer i refer, amb còpies independents dels blocs, noms i preferències del peu. Restablir continua sent una acció reversible.
- En aplicar o desar una plantilla, l’URL recull la seva configuració de partida. La plantilla de partida es conserva al navegador juntament amb els ajustos, també quan es reprèn una sessió sense fragment a l’URL.
- Canvis de fragment i navegació enrere/endavant coherents amb la plantilla de l’adreça; canviar només l’idioma conserva les edicions. Els codis invàlids no substitueixen l’últim punt de partida vàlid.
- Primer accés amb 9 pentagrames sense agrupar. Es conserven els ajustos previs dels usuaris i la plantilla de trio 3+3+3 continua disponible al lateral.
- Proves de regressió per a totes les plantilles de la guia, plantilles personals, persistència del punt de partida, blocs, preferències del peu, codis invàlids i restabliment reversible; resum del footer als deu idiomes.

## 1.15.3 · 2026-10-18

- Diàleg «Sobre el projecte · V4V» més ample i compacte: els paràgrafs de presentació envolten un QR més petit i l’adreça Lightning queda a sota del text, amb la mateixa còpia ràpida.
- Informació distribuïda en dues columnes en pantalles amples: autor i privadesa a l’esquerra, codi obert i llibreries a la dreta. En pantalles estretes es reorganitza en una columna.
- Capçalera i botó de tancament fixos, amb desplaçament intern accessible amb teclat quan el contingut supera l’alçada disponible.
- En reobrir el diàleg es torna a la presentació inicial i al QR.
- Desplaçament de la pàgina de fons bloquejat mentre hi ha un diàleg obert, evitant una segona barra de desplaçament al mòbil.
- Barres de desplaçament fines en tons terracota als diàlegs i panells, amb tiradors arrodonits i sense botons de fletxa en navegadors compatibles amb la personalització WebKit.
- Resum de la versió traduït als deu idiomes i historial anterior conservat.

## 1.15.2 · 2026-10-18

- Nota breu sobre l’autor al diàleg «Sobre el projecte · V4V», amb la seva dedicació docent i la creació d’aplicacions educatives i altres projectes de codi obert.
- Enllaç al portfoli personal amb la iconografia existent, obertura en una pestanya nova i textos traduïts als deu idiomes.
- Resum del footer actualitzat, conservant l’entrada individual de la 1.15.1 i tot l’historial anterior.
- Procediment de validació documentat: després de comprovar els canvis en local, la revisió del web públic queda a càrrec de l’usuari.

## 1.15.1 · 2026-10-18

- Enllaç discret al changelog complet de GitHub, a la dreta del títol de l’historial de versions, amb obertura en una pestanya nova.
- Text traduït als deu idiomes i capçalera adaptable a pantalles estretes, mantenint el botó de tancament accessible.

## 1.15.0 · 2026-10-18

- Títols de cerca explícits als deu idiomes, centrats en els pentagrames en blanc per imprimir.
- Catàleg públic amb les set plantilles del lateral i pàgines específiques de coral SATB amb piano i d’orquestra A3, amb miniatures i enllaços per obrir la mateixa configuració al generador.
- HTML traduït, canòniques pròpies, alternatives hreflang, enllaços interns i sitemap amb les 41 pàgines del web. Les geometries es generen a partir de les plantilles existents, sense mantenir còpies de les configuracions.
- Analítica de clics al logo, inici real de fragments i obertura de les píndoles musicals, amb identificadors tancats i fonts de reproducció; es respecten les exclusions existents i no es recullen textos de l’usuari.
- Text breu de privadesa actualitzat, guia d’interpretació dels esdeveniments i resum de la versió als deu idiomes, conservant l’historial complet.
- Corregida la resolució de la carpeta pública del servidor local a Windows.

## 1.14.0 · 2026-10-18

- Traducció completa a euskara i galego: configuració, plantilles, ajuda, accessibilitat, privadesa, suport V4V, melodies i novetats de les versions.
- Pàgines pròpies `/eu/` i `/gl/`, detecció de variants regionals del navegador, deu opcions al selector, metadades traduïdes, enllaços `hreflang` recíprocs i sitemap actualitzat.
- Selector d’idiomes limitat a l’alçada disponible, amb desplaçament interior i seguiment del focus del teclat perquè totes les llengües siguin accessibles en pantalles baixes.
- El filtre d’analítica utilitza el catàleg compartit d’idiomes, mantenint la llista tancada de valors permesos sense haver-la de duplicar.
- Historial del footer ampliat a totes les versions documentades, des de la 1.0.0, amb número, data i un resum breu per a cadascuna. Les dates anteriors s’han contrastat amb l’historial de Git i s’han afegit també a aquest document.
- Resums de l’historial als deu idiomes, sense agrupar versions antigues. El popup conserva la capçalera i el botó de tancament mentre es desplaça el contingut, també amb teclat.
- Dates traduïdes preparades en generar les pàgines, per evitar que un navegador sense dades d’Intl per a euskara o galego les mostri en un altre idioma. Reobrir l’historial sempre torna a la versió més recent.
- Instruccions de manteniment actualitzades per conservar totes les entrades del footer i continuar ampliant aquest changelog amb el detall de cada versió.

## 1.13.0 · 2026-10-17

- Adreça Lightning presentada com a text seleccionable, amb una icona de còpia i confirmació discreta, sense camp aparentment editable ni instrucció redundant.
- QR vectorial integrat al diàleg V4V, generat localment a partir de la mateixa adreça mitjançant LNURL. Es pot escanejar o activar per obrir una cartera compatible.
- Versió discreta al centre del peu; en activar-la s’obre un diàleg amb la data i dos punts de resum, traduït als vuit idiomes i amb les transicions habituals.
- Versió compartida amb `package.json`, metadades editorials a `src/release.json` i destinació Lightning única a `src/support.json`.
- Generador QR de Kazuhiko Arase conservat amb llicència MIT i crèdit al projecte; s’utilitza només en preparar els fitxers estàtics.

## 1.12.0 · 2026-10-17

- Vuit adreces d’idioma indexables, amb HTML traduït abans de JavaScript, canònica pròpia, enllaços `hreflang` recíprocs, alternativa `x-default` i sitemap actualitzat.
- Selector d’idioma amb enllaços reals que conserva la configuració i l’historial en canviar de llengua sense recarregar; suport d’enrere/endavant i de publicacions en subdirectoris.
- Estructura comuna a `src/index.html` i generació de les pàgines amb Node, sense dependències noves. La publicació continua sent completament estàtica.
- Fletxes discretes de desfer i refer al costat d’«El teu full», amb etiquetes accessibles i dreceres Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z i Ctrl+Y.
- Historial de cent canvis de configuració durant la sessió, inclosos blocs, noms, peu, plantilles aplicades i restabliment. Cada arrossegament o edició continuada compta com un pas.
- Eliminat el missatge central redundant del peu del web; es conserven la frase de l’esquerra i V4V a la dreta.

## 1.11.0 · 2026-10-17

- La melodia continua en obrir la història. El popup permet aturar, repetir i descobrir un altre fragment sense tancar-se.
- Catàleg ampliat a dotze fragments, amb selecció aleatòria des de la primera descoberta, sense repeticions dins d’una ronda ni entre el final i l’inici de dues rondes.
- Vuit retrats contemporanis en estil de linogravat, negres sobre fons transparent, carregats només quan calen. El de Petzold s’identifica com a imaginat.
- Noves píndoles i textos dels retrats als vuit idiomes, amb partitures i procedència de les il·lustracions documentades.
- Notes llargues i silencis en repòs abans del salt següent, mantenint els instants musicals exactes.
- Eliminat el títol interior redundant d’espai superior extra; selectors d’orientació i distribució amb colors terracota coherents amb la resta de controls.

## 1.10.0 · 2026-10-17

- Ou de pasqua musical després de cinc clics al logotip, amb sis fragments breus de Beethoven, Petzold, Grieg, Mozart i Pachelbel.
- Melodies programades sobre el rellotge d’àudio, amb aterratges al temps exacte de cada nota, ritmes variables i alteracions correctes. Els salts individuals conserven el seu comportament.
- «Pentagrama» es replega lletra a lletra i es transforma en el títol breu de la melodia, mantenint el punt vermell.
- Títol clicable amb història, motiu de la tria i font de la partitura, traduïts als vuit idiomes. Permet repetir, descobrir una altra melodia o recuperar el nom del web.
- Clic a la nota per aturar, cancel·lació en amagar o imprimir la pàgina, moviment reduït i errors de càrrega gestionats sense reproduccions ajornades.
- Catàleg, planificador musical, reproductor i animació del títol en mòduls independents, amb proves de sincronització, cancel·lació i accessibilitat del moviment.

## 1.9.0 · 2026-10-17

- Sidebar amb cinc seccions replegables: distribució, línies del pentagrama, espai superior extra, peu del full i codi de configuració. La distribució s’obre d’entrada; el format i la impressió sempre són visibles.
- Obrir una secció replega l’anterior amb la transició compartida de 220 ms, també amb teclat i respectant el moviment reduït.
- Alçada del contingut ajustada a l’espai disponible: els blocs llargs es desplacen dins de la seva secció, mantenint accessibles les altres capçaleres.
- Espaiat més compacte en pantalles de poca alçada i comportament natural al mòbil, sense desplaçaments interiors.
- Nou títol de secció traduït als vuit idiomes, sense canvis a les plantilles ni a la impressió.

## 1.8.2 · 2026-10-17

- Resum de privadesa més breu als vuit idiomes, amb les accions explicades en línia i els detalls tècnics a la documentació.

## 1.8.1 · 2026-10-17

- Detalls de privadesa plegats inicialment dins del diàleg V4V, amb l’interruptor d’exclusió sempre visible.
- Desplegament i plegament amb la mateixa animació suau que la resta del web i respecte pel moviment reduït.

## 1.8.0 · 2026-10-17

- So de glockenspiel real a cada primer aterratge del logotip, amb mostres de VSCO 2 Community Edition sota CC0 i crèdits al diàleg del projecte.
- Petit banc local de tres mostres, uns 243 kB en total, amb afinació compensada, transposició pròpia de l’instrument i inici de la gravació ajustat al contacte visual.
- Àudio activat pel clic, toc o teclat, sense reproducció automàtica ni interruptor addicional. Les cues s’aturen en amagar la pàgina.
- Reproductor independent amb càrrega reutilitzable, polifonia limitada i programació per temps d’àudio, preparat per a les melodies futures.
- Durada dels salts configurable sense alterar la trajectòria ni l’afinació; l’animació dels clics conserva el ritme anterior.
- Proves del banc, afinació, càrrega, sincronització, errors, moviment reduït i durades musicals.

## 1.7.1 · 2026-10-17

- Exclusió manual d’analítica desactivada per defecte i independent de Do Not Track i Global Privacy Control.
- Explicació als vuit idiomes de les visites, les quatre accions mesurades, les dades tècniques i el tractament de la IP.
- Preferència manual respectada durant la sessió encara que falli l’emmagatzematge local.

## 1.7.0 · 2026-10-17

- Nota interactiva al logotip: anticipació, deformació, impuls, trajectòria amb gravetat, compressió d’aterratge, rebot petit i repòs.
- Destinacions aleatòries entre tres columnes i les línies i espais del pentagrama, sense repetir la posició anterior.
- Icona amb botó propi, accessible amb ratolí, dit i teclat; el nom del web conserva l’enllaç d’inici.
- Mòdul independent amb esdeveniments d’inici, contacte i repòs, i dades de la nota de destí preparades per al so i les melodies futures.
- Un únic salt pendent per als clics ràpids, moviment reduït respectat i cancel·lació quan s’amaga la pàgina.
- Proves de trajectòria, continuïtat, límits de la icona i cicle de vida de l’animació.

## 1.6.0 · 2026-10-17

- Nota del logotip més petita, ovalada i inclinada.
- Lliscadors tàctils sense canvis en tocar-los per iniciar un desplaçament vertical: toc confirmat en aixecar el dit, ajust horitzontal en directe i recuperació del valor si es cancel·la el gest.
- Menú d’idiomes amb estil propi, selecció marcada, navegació amb teclat i transicions d’obertura i tancament.
- Diàlegs V4V, de desar i de còpia, i desplegable de configuració amb la mateixa animació de 220 ms i respecte pel moviment reduït.
- Selecció més clara als botons d’orientació i distribució, amb fons verd i marca de confirmació als modes.
- Panell de plantilles i tirador units en una sola transició, sense reordenació de targetes en obrir-lo.
- Miniatures ampliades fins a l’amplada interior de les targetes, retallant la part inferior quan cal.
- Cinc proves noves per als gestos i els límits dels lliscadors.

## 1.5.3 · 2026-10-17

- Estadístiques bàsiques amb Umami: visites, peticions d’impressió i accions de plantilles.
- Filtre que exclou noms, fragments de configuració i camps lliures abans d’enviar dades.
- Informació de privadesa als vuit idiomes i exclusió d’aquest navegador des de «Sobre el projecte».
- Analítica independent de la impressió, amb respecte per Do Not Track i Global Privacy Control.
- Mapa del lloc i robots.txt per al domini propi.

## 1.5.2 · 2026-10-17

- Domini propi `pentagrama.page` a GitHub Pages, amb adreça canònica i configuració DNS documentada.
- Adreça opcional al peu dels fulls actualitzada al domini propi.

## 1.5.1 · 2026-10-17

- Peus impresos amb Noto Serif Thin, pes 100, servida localment i acreditada amb la llicència OFL.
- Font incrustada al PDF vectorial, text seleccionable i ajust de línies segons les amplades reals dels caràcters.
- Selector natiu d’idiomes darrere d’una icona Lucide, amb vuit opcions úniques i detecció inicial del navegador conservada.
- Eliminat l’ajust d’amplada als 1200 px; mateixa distribució d’escriptori fins al pas a mòbil als 760 px.
- Còpia i recuperació del codi reunides en un únic desplegable.

## 1.5.0 · 2026-10-17

- Sidebar compacte: format i orientació en una fila, quantitat i agrupació en paral·lel i controls relacionats reunits.
- Valors editables al costat dels lliscadors, mantenint la previsualització immediata i les unitats.
- «Peu del full» amb etiquetes curtes, ajuda conservada i interruptors alineats a la dreta.
- Camps sense efecte ocults en mode blocs, conservant els valors per quan tornin a ser aplicables.
- Espai superior extra de 0 a 100 mm, amb avís de desbordament i ajust que conserva aquesta reserva.
- Referències P3 per conservar l’espai superior, compatibles amb els codis P1 i P2 anteriors, les plantilles locals i els enllaços compartits.
- Traduccions actualitzades als vuit idiomes i dues icones Lucide d’orientació.

## 1.4.1 · 2026-10-17

- Nota de full net al centre del peu del web, amb la mida original i sense ocupar el final de la configuració.
- Opcions d’adreça i referència impreses en dues columnes, amb el text d’ajuda simplificat.
- Codi de configuració dins d’un desplegable amb explicació de còpia i recuperació.
- Textos del peu imprès en un gris més suau, compartit per la previsualització i el PDF.

## 1.4.0 · 2026-10-17

- Icones Lucide uniformes, servides localment amb les llicències ISC i MIT conservades.
- Enllaços al repositori i als crèdits de les llibreries dins de «Sobre el projecte».
- Un únic canvi entre distribució d’escriptori i mòbil, als 760 px.
- Capçalera de plantilles en una sola fila i targetes en graella de dues columnes.
- Compartició individual de qualsevol plantilla sense aplicar-la al full actual.
- Controls de zoom amb icones centrades, percentatge temporal i icona d’ajust orientada segons el full.
- Transicions de 220 ms compartides entre panell, targetes, avisos i zoom, amb respecte pel moviment reduït.

## 1.3.0 · 2026-10-17

- Avís breu de Ctrl + roda (⌘ a macOS) quan es fa scroll sense modificador sobre el full.
- Capçalera en una sola fila, amb títol i descripció ocults a 800 px o menys.
- Botó d’imprimir fix a la part superior de la configuració, visible durant el desplaçament.
- Peu del web: «La música és teva. El paper, també.», amb les vuit traduccions actualitzades.
- Adreça del web opcional al peu esquerre del full, desactivada per defecte i independent de la referència de la dreta.

## 1.2.0 · 2026-10-17

- Capçalera compacta amb títol, descripció, idioma i un únic botó d’imprimir que obre el diàleg del navegador.
- Més espai per al full, sense franja introductòria, etiquetes redundants ni instruccions sota la previsualització.
- Panell de plantilles superposat a tota l’alçada de l’espai de treball, amb tirador lateral i gestió de desar, compartir i restaurar.
- Zoom de la previsualització fins al 400 %, arrossegament amb ratolí o dit i retorn a la vista del full sencer.
- Distribució de capçalera i selector d’idioma revisada en tauletes i mòbils.

## 1.1.0 · 2026-10-17

- Full sencer visible a l’escriptori, amb panells laterals de desplaçament independent.
- Formats A3, A4 i Letter, en les dues orientacions.
- Espai ajustable entre les cinc línies del pentagrama.
- Mode per blocs amb separacions pròpies en mil·límetres i repetició de conjunts.
- Plantilles suggerides i personals al navegador, sense compte; restauració independent de les suggerides.
- Descàrrega de PDF vectorial local i compartició discreta per enllaç.
- Vuit idiomes amb detecció automàtica i preferència manual.
- Diàleg V4V amb història del projecte i adreça Lightning.
- Referències P2 i compatibilitat amb les referències P1 existents.

## 1.0.0 · 2026-10-16

- Full A4 amb gruix, nombre de pentagrames i agrupació ajustables.
- Previsualització en directe, impressió neta i referència opcional al peu.
