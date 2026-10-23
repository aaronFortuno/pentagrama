# Canvis

## 2.7.0 · 2026-10-23

- El text personalitzat del peu reutilitza el panell de format del títol i les instruccions: tres tipografies locals, mida de 6 a 48 punts, negreta, cursiva, subratllat i alineació. Un engranatge al costat del camp obre el flotant amb el mateix moviment, teclat i tancament exterior.
- Les preferències de format del peu es recorden al navegador. Plantilles personals, biblioteca de peus, desfer/refer, restabliment i còpies de seguretat conserven el format i l’alineació. Els enllaços compartits retenen el format del text, sense incloure logotips; el codi imprès continua descrivint només el layout.
- Diagrames de posició amb un rectangle i línies de text substitueixen els botons llargs: quatre disposicions en una fila i tres alineacions verticals. Noms accessibles i ajudes traduïdes mantenen el significat de cada acció.
- La geometria compartida de previsualització, impressió i PDF mesura cada variant tipogràfica, reserva l’espai necessari i ajusta el bloc dins de la banda lliure sense trepitjar l’adreça ni la referència. El format inicial i els fulls anteriors mantenen el mateix aspecte.
- Esquema de còpia de seguretat 2 amb importació compatible de les còpies 1 de la 2.6.0. Migració limitada als dos nous valors de format, mantenint la validació estricta de la resta. Textos de novetats als deu idiomes i proves de compatibilitat, geometria i renderització.

## 2.6.0 · 2026-10-23

- Un únic accés de còpia de seguretat al centre del footer, al costat de la versió, compartit entre generador i catàleg. Diàleg amb exportació i importació de tot el perfil, sense separar plantilles i peus. Icones existents de Lucide, moviment de 220 ms, controls accessibles i disposició mòbil.
- Fitxer JSON amb format i esquema versionats, versió del web i data. Inclou plantilles personals i suggerides ocultes, biblioteca de peus amb imatges i disposició, full actual, punt de restabliment independent, preferències tipogràfiques, idioma, secció del sidebar i exclusió voluntària de l’analítica. No exporta altres dades de l’origen, historial d’accions ni indicadors tècnics d’avisos.
- Importació local limitada a 16 MiB amb descodificació UTF-8 estricta, comprovació de format, esquema, estructura i tots els valors normalitzats. Els logotips passen la mateixa validació PNG del motor. Camps desconeguts, plantilles duplicades, dades incompletes, límits excedits o recursos malmesos es rebutgen abans de tocar les dades actuals; no s’accepten retalls ni ajustos silenciosos.
- Resum previ amb data, versió i recomptes de plantilles i peus. Confirmació explícita de substitució, amb exportació de les dades actuals disponible abans de restaurar. Cancel·lar o tancar el diàleg invalida la importació pendent.
- Restauració de les claus pròpies amb comprovació prèvia d’accés i recuperació dels valors anteriors si falla un desament. Si el navegador també bloqueja la recuperació, el perfil anterior es manté en memòria per poder-lo exportar. Les claus alienes es conserven. La restauració mai reactiva l’analítica si el navegador o la còpia l’havien exclosa; DNT i GPC continuen aplicant.
- En acabar es torna al generador en l’idioma adequat i sense el hash antic, conservant el full importat i el seu punt de restabliment. Un marcador de canvi actualitza les altres pestanyes obertes del mateix origen. Cap fitxer, imatge o dada personal s’envia a un servidor i no s’afegeixen esdeveniments d’analítica.
- Textos i resum de novetats als deu idiomes, historial anterior conservat i documentació del format i l’ús. Proves de perfil complet, imatges, valors invàlids, compatibilitat d’esquema, límits, errors de quota, recuperació, privadesa i coherència entre pàgines.

## 2.5.0 · 2026-10-22

- Imatge opcional al peu personalitzat, sola o amb text. Càrrega local de PNG, JPEG i WebP, inclosos PNG transparents, conservant color i proporcions. SVG queda fora d’aquesta primera versió. No es transmeten imatges ni noms de fitxer.
- Controls discrets dins de Peu de pàgina: afegir o canviar imatge, miniatura, configuració i eliminació. Panell flotant de 220 ms amb alçada de 3 a 18 mm, imatge davant, darrere, damunt o sota del text i alineació vertical superior, central o inferior en una fila compartida. Tancament exterior, Escape, canvi de secció o menú, scroll exterior i canvi de mida; focus de retorn accessible i moviment reduït.
- Amplada màxima de 65 mm i alçada màxima de 18 mm, amb reducció proporcional segons l’espai útil. L’adreça del servei i el codi mantenen les seves bandes i línies de base; el bloc personalitzat s’ajusta entre elles sense superposicions. El motor reserva espai per sobre del peu abans de distribuir pentagrames o anotacions, també amb marges petits, reflectits i doble cara.
- Una sola escena física per a SVG, impressió i PDF. El PDF incrusta color RGB i màscara de transparència, comprimits sense pèrdua i reutilitzats entre pàgines. No depèn de connexions, fonts o imatges remotes; la impressió espera que la imatge estigui descodificada. Els fulls sense imatge mantenen la sortida anterior.
- Biblioteca local de fins a vuit peus: desa text, imatge, mida i disposició, sense copiar la capçalera ni el layout. Aplicació a una altra plantilla, deduplicació, eliminació individual o de tota la biblioteca i sincronització entre pestanyes. Els errors d’emmagatzematge s’indiquen sense donar per confirmat un desament.
- Les plantilles personals, desfer/refer i restabliment conserven les imatges. L’estat local de navegació les manté en recarregar una plantilla personal, sense introduir-les a l’URL. Els enllaços compartits i el codi imprès exclouen la imatge; l’editor ho explica i la còpia de l’enllaç també ho recorda.
- Importació limitada a fitxers de 12 MB i 40 megapíxels: reescalat a un màxim de 1.024 píxels de costat i 524.288 píxels totals, nova codificació PNG sense metadades i reducció fins a 96 KiB. El motor valida signatura, dimensions, CRC, canals, filtres, mida descomprimida i checksum abans d’acceptar el recurs. URLs externes, vectors i PNG malmesos es descarten.
- fflate 0.8.2 servida localment, amb llicència MIT, crèdit al diàleg del projecte i eina de provisió amb SHA-512 fixat. Icona image-plus oficial de la mateixa revisió de Lucide; eina de provisió d’icones actualitzada per conservar tot el conjunt existent.
- Controls, ajudes, errors i resum del footer als deu idiomes. Historial anterior conservat, documentació del funcionament local i proves de geometria, transparència, PDF, validació, compatibilitat, biblioteca i persistència. L’analítica no afegeix esdeveniments ni dades de la imatge.

## 2.4.1 · 2026-10-22

- Miniatura de la fitxa amb espai per a anotacions a tota l’amplada disponible, amb el mateix retall vertical que les altres targetes, tant al catàleg públic com al sidebar de plantilles. S’elimina l’excepció que la reduïa per mostrar el full sencer.
- Totes les targetes del catàleg obren directament el configurador amb el preset i l’idioma corresponents, des de la imatge i des de l’enllaç de personalització. Les fitxes detallades anteriors es conserven per als enllaços existents i la cerca.
- Nom simplificat de la fitxa d’anotacions, sense «de música», també a les fitxes detallades i als deu idiomes.
- La fila de nom i data precedeix el títol i les instruccions al full i al sidebar. El motor compartit aplica aquest ordre a previsualització, impressió, PDF i miniatures, mantenint l’altura total reservada, les proporcions dels camps i els espais dels pentagrames.
- Resum del footer als deu idiomes i historial anterior conservat. Proves d’accés directe de totes les targetes, correspondència dels presets, ordre i coordenades dels camps als formats de paper i idiomes disponibles.

## 2.4.0 · 2026-10-22

- Format independent de títol i instruccions: mida en punts entre 6 i 48 pt, Noto Serif, Noto Sans o Editorial (basada en Lora), negreta, cursiva i subratllat. L’alineació esquerra/centre/dreta es mou al mateix panell per mantenir un sol botó discret de configuració al costat de cada camp. Els controls no apareixen en passar el ratolí ni mentre s’escriu.
- Panell flotant fora dels contenidors amb scroll per evitar retalls. Es posiciona dins de la pantalla en escriptori i mòbil, amb el mateix temps de transició de 220 ms i respecte per moviment reduït. Clic exterior, Escape, canvi de secció, altres menús, scroll exterior i canvi de mida el tanquen. Escape retorna el focus al botó.
- Opcions amb noms accessibles, estats actius i indicacions emergents localitzades als deu idiomes. Mostres tipogràfiques Aa, mida editable amb unitat pt i increments, icones oficials de Lucide per configuració i estils i botons d’alineació agrupats. No es canvia la mida dels camps d’edició segons la mida impresa.
- Preferències independents per navegador amb clau pentagrama.text-preferences.v1: només format i alineació, sense copiar els textos ni la fila de nom/data. S’apliquen a fulls nous i plantilles suggerides. Obrir un enllaç o una plantilla personal conserva el seu format propi i no modifica les preferències; canviar explícitament un format actualitza només la preferència corresponent.
- El motor mesura amplades i salt de línia amb les mètriques de la variant escollida. La capçalera reserva l’altura resultant, sense retallar títol o instruccions; si el full no hi cap, es manté la validació que bloqueja impressió i PDF. El subratllat és un traç vectorial amb la mateixa longitud i posició als tres renderitzats.
- Fonts servides localment: es conserva Noto Serif ExtraLight original i s’afegeixen onze variants reals de les tres famílies, incloses negreta i cursiva combinades. No hi ha peticions a serveis tipogràfics externs. El subconjunt modificat de Lora utilitza el nom propi Pentagrama Editorial, amb els crèdits originals conservats. Els subconjunts s’obtenen d’una revisió fixada de Google Fonts, amb hashes verificats, mètriques, llicències SIL OFL i una eina reproduïble. Noto Sans i Lora es referencien també al diàleg del projecte.
- PDF amb múltiples fonts Unicode incrustades segons les variants realment presents a cada document. Els ancoratges i les amplades coincideixen amb SVG i impressió; els estils no depenen de fonts instal·lades al sistema ni de simulacions de negreta o cursiva. Les dades de les fonts per al PDF no es carreguen al generador habitual.
- Restaurar una plantilla o un enllaç actualitza també el camp que tenia el focus, evitant que el text visible al sidebar quedi desfasat respecte del full.
- Plantilles, desfer/refer, punt de restabliment, doble cara i herència de pàgines explícites conserven estils independents. Els enllaços complets afegeixen dues tuples de format només quan cal; continuen acceptant els formats antics de sis i vuit camps. El codi de referència imprès continua excloent capçalera, peu i tot el format tipogràfic.
- Resum del footer als deu idiomes i historial anterior conservat. S’elimina la configuració de l’avís temporal de llançament 2.0.0, ja caducat. Proves de fonts, mides, variants, subratllats, alineacions, salts, desbordament, preferències, compatibilitat, persistència i coordenades compartides.


## 2.3.5 · 2026-10-21

- Analítica de configuracions mitjançant propietats dels esdeveniments existents, sense nous disparadors ni peticions per cada canvi de control. Les peticions d’impressió i els desaments personals inclouen format, mode, idioma i booleans per anotacions, doble cara, claus, compassos i nom/data.
- Les aplicacions de plantilles suggerides des del sidebar incorporen un identificador públic fix del catàleg. Les aplicacions de plantilles personals continuen indicant només la categoria personal, cosa que permet observar-ne la reutilització sense transmetre noms ni identificadors propis.
- El desament personal es continua comptant exclusivament després que l’emmagatzematge confirmi l’operació. Cancel·lar el diàleg, deixar el nom buit o un error de persistència no genera cap desament. El mateix esdeveniment incorpora el perfil de la configuració desada.
- A les peticions d’impressió s’indica si el navegador té alguna plantilla personal desada. La comprovació llegeix la biblioteca persistent localment; una lectura bloquejada o invàlida omet el valor, sense interpretar-la com una biblioteca buida ni interrompre la impressió. Un canvi en memòria sense persistir no es considera una plantilla desada.
- Filtre de sortida amb llista tancada d’identificadors suggerits i propietats booleanes estrictes, preservant explícitament tant true com false. Els textos de capçalera i peu, noms, codis, marges, quantitats i contingut de plantilles no s’envien. Es mantenen les exclusions, DNT/GPC, el filtratge d’URL i la desactivació en local i al web auxiliar.
- Textos de privadesa i resum de versió actualitzats als deu idiomes. La documentació d’analítica explica les propietats, com consultar-les a Umami, les limitacions dels recomptes d’accions i la distinció entre visites al catàleg i aplicacions des del sidebar. L’historial anterior del footer es conserva.
- Proves de totes les combinacions d’opcions, valors desactivats, rebuig de dades arbitràries, identificadors suggerits i personals, presència persistent, errors d’emmagatzematge i exclusions de privadesa.


## 2.3.4 · 2026-10-21

- Nova plantilla «Fitxa amb espai per a anotacions»: A4 amb nom i data, cinc pentagrames visibles sobre una base de nou i reserva inferior del 35% amb punts cada 8 mm. Manté els espais originals, el marge de separació i totes les opcions editables. No incorpora textos inventats, claus, compassos ni peus activats.
- La plantilla d’iniciació conserva sis pentagrames amb línies a 3 mm i incorpora nom i data en l’idioma triat, tant al sidebar com als enllaços compartits i les pàgines públiques.
- Orquestra A3 amb línies a 2 mm en lloc d’1,6 mm: manté 23 pentagrames i sis famílies, amb les separacions existents. La música ocupa 373 dels 378 mm útils, amb més llegibilitat i menys espai buit. Les altres plantilles i les còpies personals desades es conserven.
- «Guia de plantilles» passa a «Catàleg de plantilles», mantenint les adreces. Noves fitxes detallades d’iniciació i anotacions als deu idiomes, amb descripcions, paràmetres, enllaços d’edició i entrades al sitemap.
- Una sola font d’ajustos per a l’editor, el catàleg i les miniatures. Les miniatures amb nom i data es localitzen i incorporen la font local perquè l’SVG independent mantingui la tipografia correcta. Les adreces anteriors de miniatures es conserven.
- Els recomptes de targetes mostren els pentagrames visibles, també en plantilles personals amb reserva d’anotacions, en lloc del recompte original retallat.
- Resum del footer als deu idiomes, historial anterior preservat i proves de correspondència entre miniatures, idiomes, catàleg i configuracions d’edició, espai d’anotacions i ocupació del full orquestral. L’analítica no canvia en aquesta versió.


## 2.3.3 · 2026-10-20

- El ressalt de focus dels botons segmentats es dibuixa dins del seu contorn, amb la mateixa aparença a Senzilla / Per blocs, A dalt / A baix i Mateixa clau / Per posició. Els contenidors animats ja no en retallen els laterals. El focus de teclat continua visible.
- Amb peu personalitzat, els tres continguts comparteixen una línia de base estable: adreça del web a l’esquerra, text propi centrat i referència a la dreta. Activar un text ja no desplaça verticalment l’adreça ni genera files afegides.
- Càlcul físic d’amplades i espais entre continguts abans de renderitzar. El text propi es centra al full sempre que hi cap i s’ajusta dins de l’espai lliure si els altres peus són llargs. Els continguts que excedeixen l’espai redueixen la mida sense truncar-se, superposar-se ni passar a una altra fila. Els marges reflectits de doble cara s’apliquen a cada peu.
- El PDF respecta la mida efectiva també en mesurar i alinear la font antiga de les referències. SVG, impressió i PDF comparteixen coordenades i mides. Els fulls sense text de peu propi mantenen la sortida anterior.
- Cada grup de tres botons d’alineació de Títol i Instruccions es substitueix per un botó quadrat al costat del camp, de 36 px o 42 px en mòbil. Alterna esquerra, centre, dreta i torna a esquerra, amb les icones oficials de Lucide ja disponibles. El camp recupera amplada i manté tota l’àrea editable.
- El nom accessible i la indicació emergent del botó indiquen el camp, l’alineació actual i la següent, als deu idiomes. Teclat, desfer/refer, plantilles i enllaços mantenen els estats independents de títol i instruccions.
- Resum del footer als deu idiomes, historial anterior preservat i proves de peus en una fila, opcions combinades, contingut llarg, marges, doble cara i coordenades del PDF. Revisió local de ressalt i controls en escriptori i mòbil.


## 2.3.2 · 2026-10-20

- Apartat Espai per a anotacions, amb denominacions equivalents als idiomes on notes es podia confondre amb notes musicals. Etiquetes accessibles i indicacions de posició adaptades; les dades desades i els codis continuen sent compatibles.
- Vocabulari visual compartit per als sis apartats del sidebar: etiquetes en pes normal, subtítols en seminegreta, colors de text i ajuda homogenis, mides de lletra i espai entre etiqueta i camp unificats. Es conserven els títols principals destacats i el terracota de la secció oberta.
- Controls de 36 px en escriptori/tauleta i 42 px en mòbil, inclosos selectors de paper, agrupació, claus, compassos i pauta d’anotacions; reguladors numèrics, unitats, botons segmentats, orientació, doble cara i camps de text alineats. Les icones internes d’alineació segueixen la mateixa alçada exterior.
- Camps opcionals de claus, compassos i anotacions amb una classe comuna, 12 px de separació respecte de l’interruptor i el mateix ritme entre files. S’eliminen excepcions antigues que reduïen les mides dels selectors de notació o dels camps dels blocs.
- Selector d’agrupació amb el mateix desplegable accessible que la resta: transició de 220 ms, fletxes de teclat, Inici/Fi, cerca per inicial i Escape. Obrir-ne un tanca els altres; plantilles, recompte de base i desfer/refer mantenen la selecció sincronitzada.
- Colors neutres compartits en targetes de blocs i codi de configuració; pesos, unitats i fletxes incrementals consistents. Es manté la tipografia monoespai només als codis, per facilitar-ne la lectura i còpia. Els canvis afecten la interfície: no modifiquen la geometria ni la impressió del full.
- Resum del footer als deu idiomes, historial anterior preservat i revisió local dels sis apartats en escriptori i mòbil.


## 2.3.1 · 2026-10-20

- La reserva de notes retalla la distribució original del full: oculta automàticament els pentagrames que hi col·lideixen, començant per baix o per dalt segons la posició de les notes. Es conserven les coordenades, el gruix, la mida, l’espaiat intern, les separacions entre pentagrames, grups i blocs i el centrat original. No es comprimeix ni es redistribueix el contingut restant.
- Separació entre la música i la zona de notes equivalent al menor dels marges superior i inferior, incloent espai per als contorns de les claus i el gruix del traç. Substitueix la separació fixa de 6 mm de la 2.3.0.
- El recompte original es conserva com a configuració de base en plantilles, referències, historial i enllaços. En desactivar la reserva reapareixen tots els pentagrames. El resum del preview i les etiquetes accessibles mostren el nombre visible; l’apartat Pentagrames indica visibles / originals quan difereixen i el camp s’identifica com a Pentagrames de base.
- Ocultació sense renumerar les identitats: claus, patrons, agrupaments i unions de compàs romanen associats a les seves files originals, també quan es retalla per dalt o queda un grup parcial. No es dibuixen claus, compassos o unions dels pentagrames ocults. Cada cara calcula la seva reserva i recompte de forma independent.
- Espai addicional entre l’interruptor de reserva i els botons A dalt / A baix, sense afegir una fila. Es manté la transició de desplegat de 220 ms.
- Es conserva l’avís per a distribucions originals invàlides o si no queda cap pentagrama complet, evitant exportar un full sense música. Proves de retall progressiu, recuperació, marges asimètrics, identitats, patrons, blocs, doble cara, referències i sortides vectorials. Resum del footer als deu idiomes i historial complet preservat.


## 2.3.0 · 2026-10-20

- Full híbrid amb una zona de notes configurable a dalt o a baix, a baix per defecte. Reserva del 10% al 70% de la zona útil, sense ocupar marges, capçalera o peu, amb 6 mm de separació respecte de la música. Les opcions comencen desactivades.
- Pauta de notes en blanc, amb línies fines (8–12 mm), quadrícula o punts lleugers (6–10 mm). Punts i 40% de reserva com a proposta inicial, amb separació regulable. El nou apartat participa en el mateix acordió excloent i conserva la navegació compacta.
- Mòdul físic de notes compartit pels renderitzadors: mateixes coordenades en previsualització, impressió i PDF vectorial. Compatible amb marges reflectits, doble cara, espai superior, capçaleres, claus i compassos. Es manté l’avís de falta d’espai i l’ajust automàtic de distribució.
- Referències de geometria sense contingut ni opcions de capçalera o peu. Es conserven els paràmetres necessaris per reconstruir el layout, inclosos nombre i agrupació de pentagrames. La zona de notes afegeix només un sufix acotat de 8–9 caràcters (posició, percentatge, pauta i separació), sense hashes ni text codificat.
- Els codis antics P1–P8 continuen sent llegibles, també els P8 amb text. Aplicar un nou codi de geometria manté els textos actuals. Les plantilles, els enllaços compartits, desfer/refer i el punt de restabliment conserven la personalització completa i el full híbrid. Els enllaços anteriors amb noms de blocs continuen funcionant.
- Camps de títol, instruccions i peu amb suggeriments interiors i etiquetes accessibles. Alineació esquerra, centrada o dreta independent per al títol i les instruccions, amb icones oficials de Lucide. Títols de secció destacats i labels d’opció amb pes normal per millorar la jerarquia.
- Textos i resum del footer als deu idiomes, historial anterior preservat i verificació de compatibilitat, serialització, alineacions, patrons i exportació.


## 2.2.0 · 2026-10-20

- Apartat Capçalera i peu de pàgina: títol, instruccions amb salts de línia, fila opcional per escriure nom i data, i peu de text personalitzat. Tots els camps són opcionals i buits per defecte. Els controls d’adreça del web i referència continuen disponibles.
- La fila de nom i data es localitza als deu idiomes del web. El nom ocupa aproximadament tres quartes parts de l’amplada útil i la data la resta, amb separació pròpia i línies fines per emplenar a mà. El contingut escrit per l’usuari es conserva literalment; només es tradueixen les etiquetes de nom/data.
- Mòduls separats de configuració, tipografia i composició física dels textos. El motor ajusta les línies llargues a l’amplada útil, reserva l’espai de capçalera i evita col·lisions amb pentagrames, claus i peu. L’espai superior extra actua com a mínim d’aquesta reserva, sense sumar dues vegades un espai ja previst per al títol. El document no s’imprimeix si alguna pàgina no hi cap.
- En doble cara, capçalera només a l’anvers per defecte, independent de l’espai superior extra. Es pot repetir a les dues cares; el peu personalitzat és comú a totes dues i segueix els marges reflectits. El text propi pot aparèixer sol o junt amb l’adreça i la referència, en files que no se superposen.
- Font local Noto Serif ExtraLight 200 per als textos nous, amb accents europeus, grec, ciríl·lic i puntuació. Mateixes mètriques i contorns a SVG, impressió i PDF; PDF Unicode amb font compartida incrustada, mapa de caràcters i text recuperable. La font i la sortida dels peus anteriors es mantenen intactes. Procedència fixada, checksum, llicència OFL i generador reproduïble.
- Codis P8 amb contingut UTF-8, majúscules/minúscules, paràgrafs, idioma de les etiquetes i opcions de capçalera. Compatibilitat P1–P7 preservada; biblioteca local, compartir, desfer/refer i restablir conserven els camps nous. Els codis impresos en diverses files també es poden enganxar amb salts de línia. Els textos no s’envien a l’analítica.
- Resum del footer als deu idiomes i historial anterior preservat. Proves de formats, idiomes, reserva d’espai, proporció nom/data, doble cara, referències, persistència, escapament, fonts i exportació. Paritat dels fulls anteriors comprovada sense opcions noves actives.

## 2.1.2 · 2026-10-20

- Vista de llibre homogènia en escriptori i tauleta, també en orientació vertical. L’ajust prioritza l’altura disponible de l’anvers i, quan les dues pàgines no hi caben, manté l’anvers sencer a la dreta amb el desbordament a l’esquerra. Si l’amplada és el límit, es conserva una part del revers visible. En mòbil es manté l’anvers al 86% de l’amplada útil.
- Etiquetes Senars · Anvers i Parells · Revers, sense numeració 1/2. Ombra central d’enquadernació discreta, coordinada amb el zoom i el desplaçament. Etiquetes i ombra pertanyen només a la previsualització: no alteren el document, les referències ni la impressió anvers–revers.
- Botó de doble cara amb mida exterior i espaiat homogenis amb els botons d’orientació, també en mòbil; icona a la mateixa escala i estats de color coherents. Es corregeix la regla genèrica que el reduïa a 30 px.
- Opció d’espai superior només a l’anvers integrada a la fila del títol i la mida, amb etiqueta visible Anvers i indicació completa accessible i emergent. Disponible sempre en doble cara, sense ocupar una fila pròpia.
- Resum del footer als deu idiomes, historial preservat i proves d’ajust, desbordament, desplaçament i recuperació de la vista en pantalles estretes i amples, sense modificar la geometria impresa.

## 2.1.1 · 2026-10-20

- Control de doble cara compacte amb la icona local Book Open de Lucide i indicador 1/2, a la mateixa fila que el format i l’orientació. Es retiren la fila Una cara / Dues cares, la indicació del diàleg d’impressió i l’interruptor independent d’enquadernació.
- Marges agrupats per eixos, amb Ajusta cada costat sempre disponible. En dues cares, la vista granular mostra Interior i Exterior i reflecteix automàticament els marges al revers. En una cara conserva Esquerre i Dret. Els codis P7 anteriors continuen sent llegibles; l’editor adapta els de dues cares a aquest criteri sense alterar el descodificador ni les pàgines explícites del motor.
- Previsualització de llibre: revers (2) a l’esquerra i anvers (1) a la dreta, amb anotacions discretes que no s’imprimeixen. La tauleta vertical manté l’anvers sobre el revers, identificats; en mòbil Ajusta enfoca l’anvers i deixa entreveure el revers a l’esquerra. Les etiquetes tenen espai reservat perquè no es retallin ni se superposin al paper. L’ordre d’impressió i PDF continua sent anvers–revers.
- Bloc Sobre l’autor · Aarón Fortuño al diàleg V4V, amb la fotografia aportada per l’autor al costat del text. Mides coordinades amb el QR en escriptori i mòbil, també a la guia de plantilles i als seus idiomes.
- Resum de la versió traduït als deu idiomes, historial anterior preservat i comprovacions de l’ordre visual, l’accés mòbil a les dues cares, la impressió i la compatibilitat de marges i referències.

## 2.1.0 · 2026-10-20

- Opció Una cara / Dues cares a Full, amb configuració compartida. El document de dues cares conté anvers i revers com a pàgines físiques independents del mateix format, tant en impressió com en PDF. Una indicació breu recorda seleccionar doble cara al diàleg d’impressió; el web no modifica les preferències de la impressora.
- Previsualització conjunta: fulls de costat en escriptori, apilats quan la pantalla no mòbil és vertical i de costat en mòbil. En mòbil, l’ajust inicial mostra l’anvers al 86% de l’amplada útil i una part del revers per suggerir el desplaçament horitzontal. Zoom, arrossegament i fletxes de teclat actuen sobre el conjunt; Ajusta recupera l’inici i l’escala segons la disposició.
- Espai superior extra aplicable només a l’anvers, per defecte, o a totes dues cares. Marges d’enquadernació opcionals: Interior i Exterior substitueixen Esquerre i Dret i s’intercanvien automàticament al revers, amb enquadernació a l’esquerra de l’anvers. La configuració original es conserva en alternar opcions.
- Mòdul de resolució de cares separat de la geometria física. Es conserven les pàgines explícites de l’API i la idempotència del document. Les referències impreses a totes dues cares recreen la mateixa plantilla completa, sense confondre els marges derivats del revers amb els ajustos originals.
- Codis P7 per a les dues cares, compatibles amb P1–P6. Les plantilles personals, els enllaços compartits, la persistència local, Restableix i desfer/refer conserven els ajustos conjunts. Els fulls d’una cara mantenen els codis i la sortida vectorial anteriors.
- Impressió bloquejada si alguna cara no hi cap; Ajusta al full comprova el document complet. Cap nom de cara, guia o marca de la previsualització s’afegeix als fulls impresos. Capçaleres escolars i peus personalitzats es mantenen com a ampliació posterior.
- Controls i resum del footer als deu idiomes. Comprovacions de tots els formats i orientacions, marges reflectits, espai superior, referències, persistència, exportació de dues pàgines, ajust i navegació de la previsualització. Es manté la paritat amb els fulls anteriors.

## 2.0.1 · 2026-10-19

- L’historial resumit del footer comença a la 2.0.0 i mostra només les versions d’aquesta nova etapa. Es retiren del popup les entrades 1.x, però totes les versions, dates i notes detallades continuen disponibles a CHANGELOG.md des de l’enllaç de la capçalera. Les actualitzacions futures afegiran la seva entrada resumida a partir d’aquest punt.
- Capçalera del diàleg de versions adaptada a mòbil: títol i enllaç en dues files alineades a l’esquerra, amb el botó de tancar separat a la dreta. Mida del títol protegida de la regla genèrica dels diàlegs per evitar salts i desalineacions; disposició d’escriptori conservada.
- L’avís de llançament es limita als navegadors amb configuració prèvia desada i caduca automàticament el 22 d’octubre de 2026 a les 00:00, hora d’Europa/Berlín (21 d’octubre a les 22:00 UTC). No es presenta en un primer accés ni quan no es pot determinar una visita anterior.
- La identitat de l’avís continua sent la 2.0.0 encara que la versió del web sigui 2.0.1: es mantenen el títol del llançament i la marca local de lectura, evitant un segon avís per aquesta correcció. Data de caducitat i identitat configurables des de les metadades de la versió.
- Política editorial documentada a AGENTS.md i desplegament, resum traduït als deu idiomes i comprovacions de l’historial abreujat, l’enllaç complet, la caducitat i la continuïtat de l’avís entre versions.

## 2.0.0 · 2026-10-19

- Primera versió estable del motor modular 2.x: configuració, document, geometria en mil·límetres i escena comuna per a SVG, impressió i PDF. Els fulls, les plantilles i les referències anteriors continuen sent compatibles; es conserven 276 casos de paritat amb la versió 1.17.2.
- Claus opcionals de sol, fa i do, comunes o amb patrons per posició dins de grups i blocs. Glifs vectorials Bravura amb llicència i mètriques locals. Línies de compàs simples, dobles o discontínues, quantitat configurable, gruix vinculat al pentagrama per defecte i unions limitades al mateix grup o bloc.
- Configuració agrupada en cinc categories, amb una sola secció oberta i memòria local de l’apartat. Menús, indicacions emergents, camps i transicions homogenis; idioma Carta localitzat i idiomes ordenats alfabèticament.
- Mòbil amb capçalera compacta, paper ajustat a l’amplada i ancorat a dalt, zoom i desplaçament independents de la impressió. Panell de configuració superposat, desplegable amb clic o arrossegament, i footer més compacte.
- Imprimir, desfer, refer i restablir sempre visibles a la capçalera mòbil, també amb el panell replegat. Les accions no desapareixen ni perden el focus en tancar la configuració i es poden utilitzar directament sobre el full complet.
- Avís flotant de la 2.0.0 amb dues línies de novetats i barra temporal de 12 segons. Un sol avís per versió i navegador, tancament manual, pausa independent amb cursor, focus o pestanya oculta, i obertura de l’historial de versions en clicar-lo. Respecta la reducció de moviment i funciona també a la guia, sense afectar la impressió.
- Novetats i avís als deu idiomes. Les preversions 2.0.0-alpha es presenten al footer com una única versió 2.0.0; el seu detall es conserva a continuació. Les versions estables anteriors mantenen les seves entrades individuals.
- Promoció de la branca 2.x a main després de les proves de motor, gestos, persistència, traduccions, novetats i revisió visual local. Es mantenen el domini, el sitemap, l’analítica i les llicències de producció.

### 2.0.0-alpha.7 · 2026-10-19

- En mòbil, el full s’ajusta a tota l’amplada disponible i queda alineat a la part superior. Obrir o replegar la configuració ja no redueix la previsualització: el panell se superposa al paper. Ajusta recupera l’amplada i l’inici del full, també en horitzontal.
- Desplaçament del paper quan excedeix l’alçada disponible, inclòs el nivell inicial del 100%; es mantenen els límits, el zoom i la navegació amb teclat. Cap canvi a la geometria d’impressió ni a l’ajust complet del full en escriptori.
- La capçalera del panell permet obrir i tancar la configuració arrossegant amb ratolí o tacte, amb seguiment directe, llindar d’intenció, encaix animat de 220 ms i restauració si es cancel·la el gest. Els botons d’acció i els camps conserven els gestos propis; s’evita el segon canvi accidental pel clic final.
- Imprimir, desfer, refer i restablir comparteixen una sola fila amb El teu full i el control de replegar en mòbil. Imprimir mostra la icona amb nom accessible; les accions ocultes queden inerts. S’allibera l’antiga segona fila per a la configuració i es conserva la botonera d’escriptori.
- Footer mòbil de l’editor més compacte: s’oculta l’enllaç a la guia i s’equilibra la mida de la frase amb V4V, mantenint l’historial de versions. La guia conserva la seva navegació.
- Resum de novetats als deu idiomes i comprovacions locals de geometria, gestos, cancel·lació, zoom, controls i disposició responsive. Publicació només a la branca 2.x i al repositori auxiliar de proves.

### 2.0.0-alpha.6 · 2026-10-19

- Les categories obertes conserven la mida i el pes del títol, amb color terracota. S’eliminen el fons ressaltat i la vora lateral gruixuda; les alçades i els controls d’escriptori continuen iguals.
- Editor mòbil ajustat a l’alçada disponible, amb capçalera compacta i previsualització permanent. La configuració s’obre des d’una barra inferior en un panell flotant, amb una única zona de scroll intern i les accions d’imprimir, desfer, refer i restablir sempre accessibles a la part superior del panell.
- El full s’ajusta a l’espai lliure per damunt del panell i recupera l’espai en replegar-lo. Zoom i resum del full acompanyen el límit del panell. Tocar el paper o prémer Escape replega la configuració; aquesta primera pulsació no inicia un arrossegament del full.
- Controls ocults inerts per al teclat i els lectors de pantalla, indicador de desplegament i retorn de focus. Els menús de plantilles i configuració no es trepitgen; es respecten els diàlegs i els selectors abans de gestionar Escape.
- Mòdul independent de disposició mòbil, amb ajust a la mida disponible i al viewport visual quan apareix el teclat. Transicions comunes de 220 ms, canvi entre mòbil i escriptori sense deixar controls desactivats i guia de plantilles amb la navegació natural anterior.
- Controls nous i resum del footer als deu idiomes. Comprovacions locals de disposició mòbil, espai de previsualització i compatibilitat amb els fulls existents. Publicació limitada a la branca i al web de proves.

### 2.0.0-alpha.5 · 2026-10-19

- Indicacions emergents compartides pel generador i la guia, amb fons càlid, tipografia, vora i ombra pròpies i transicions de 220 ms. Se substitueixen els atributs title del navegador, inclosos els textos dinàmics de les melodies, els blocs i els marges; es conserven els noms accessibles.
- Aparició amb ratolí o focus de teclat, permanència quan el cursor passa sobre el text i tancament amb Escape, interacció, scroll o canvi de mida. No s’intercepten els gestos tàctils. Posicionament limitat a la pantalla i ús de la capa superior dins dels diàlegs, sense quedar retallades pel sidebar. Es respecten les descripcions accessibles prèvies i s’eviten repeticions del nom dels botons.
- Menú d’idiomes amb colors neutres i terracota, coherents amb els selectors i botons actius del web. Indicador d’obertura, selecció, focus, vora i ombra actualitzats; els menús de configuració comparteixen els mateixos tons.
- Idiomes ordenats alfabèticament pels noms propis que es mostren al menú, amb comparació lingüística segons l’idioma de la pàgina. L’ordre s’aplica a l’HTML estàtic, al canvi d’idioma sense recarregar i a les guies, sense alterar les columnes de les traduccions ni les rutes existents.
- Títols de les cinc categories una mica més grans i amb més pes. L’apartat obert es distingeix amb fons càlid suau, text terracota i una línia lateral; les capçaleres mantenen les alçades de 40/36/46 px i l’espai disponible per als controls.
- Resum de novetats als deu idiomes, comprovacions de límits de les indicacions i de l’ordre dels idiomes a les pàgines generades. Publicació només a la branca i al web experimentals.

### 2.0.0-alpha.4 · 2026-10-19

- Sidebar reorganitzat en cinc apartats: Full, Pentagrames, Claus i compassos, Peu del full i Codi de configuració. El format, l’orientació, els marges i l’espai superior extra comparteixen Full; la distribució i el traç dels pentagrames comparteixen Pentagrames.
- Una sola fila fixa amb Imprimeix i les icones de desfer, refer i restablir, amb noms accessibles i indicacions en passar-hi per sobre. El títol El teu full es conserva per a lectors de pantalla. Amplada del sidebar lleugerament incrementada fins a 270–288 px en desktop/tablet.
- Un sol apartat obert alhora, inicialment Pentagrames. L’últim apartat obert o el tancament de tots es recorda localment, independentment de la plantilla, l’historial o el codi de configuració. Les capçaleres replegades mostren format i orientació, nombre de pentagrames i estat de la notació.
- L’apartat obert aprofita l’alçada restant. Els controls de distribució mantenen el selector Senzilla/Per blocs visible i una única zona de desplaçament per a continguts llargs, inclòs el traç. Full i notació utilitzen separacions interiors simples, sense nous desplegables ni scrolls imbricats; mòbil conserva el desplaçament natural.
- Format Letter localitzat a Carta i als equivalents dels deu idiomes en el selector, les dimensions, les miniatures, les descripcions accessibles i les guies. El valor intern LETTER i els codis anteriors es mantenen.
- Transicions de 220 ms, controls i geometria d’impressió preservats; els menús flotants es tanquen quan es canvia d’apartat. Resum de la versió traduït als deu idiomes i publicació limitada a la previsualització experimental.

### 2.0.0-alpha.3 · 2026-10-19

- El gruix dels compassos segueix per defecte el de les línies del pentagrama. «Auto» permet desvincular-lo i ajustar-lo en mm; tornar a activar-lo recupera el seguiment. Les configuracions antigues amb gruix absolut mantenen el resultat original.
- Claus opcionals de sol, fa i do en posició d’alto o tenor, amb opció «Cap». La vista «Mateixa clau» les aplica a tot el full; «Per posició» permet triar excepcions per a cada posició d’un grup, cada pentagrama d’un full sense grups o cada posició dins d’un bloc.
- Els patrons es repeteixen a cada grup o conjunt, inclosos els grups finals incomplets. Les claus particulars dels blocs viatgen amb el bloc quan se’n canvia l’ordre; no depenen del seu nom. Les posicions sense excepció hereten la clau comuna.
- Glifs vectorials extrets de Bravura sota SIL OFL 1.1, amb font, procedència fixada, checksum, mètriques oficials, eina de generació i llicència. Previsualització, impressió i PDF comparteixen els mateixos contorns, sense carregar cap font musical externa en obrir o imprimir el full.
- Espai reservat abans del primer compàs segons la clau més ampla. Les barres continuen alineades entre tots els pentagrames, inclosos els que no mostren clau. Les claus respecten els marges i l’espai superior extra; es detecten col·lisions verticals i l’ajust explícit respecta la separació mínima necessària.
- Codis P6 per a les claus i el gruix vinculat dels compassos, amb compatibilitat amb P1–P5. Plantilles, enllaços, persistència, Restableix i desfer/refer conserven les claus i les excepcions. Camps de codi ampliats per admetre patrons extensos.
- Desplegable compacte de claus, selectors de posició amb noms de bloc i menús dinàmics accessibles. Només un menú de configuració queda obert; la selecció visible segueix el focus en llistes llargues. Bravura afegida als crèdits de «Sobre el projecte».
- Opcions i resum del footer traduïts als deu idiomes. Proves de migració de gruixos, patrons, blocs reordenats, geometria, contorns SVG/PDF, marges, col·lisions, codis, historial i herència entre pàgines. Publicació només a la branca i al web experimentals.

### 2.0.0-alpha.2 · 2026-10-19

- Línies de compàs opcionals, desactivades per defecte i homogènies per a tots els pentagrames. Entre 1 i 16 compassos iguals per fila, amb una línia de tancament a la dreta i sense afegir cap línia d’obertura a l’esquerra.
- Tipus simple, doble o discontinu, amb gruix independent de les línies del pentagrama (0,05–0,60 mm). La línia final conserva el mateix tipus i tot el traç queda dins del marge dret.
- Unions opcionals contínues o discontínues entre pentagrames del mateix grup o bloc. No travessen la separació entre blocs, conjunts ni pàgines; els grups parcials i els blocs de veus i piano conserven els seus límits.
- Un únic desplegable al sidebar, amb activació, camps numèrics compactes amb unitats i selectors del mateix estil animat i accessible que el format de paper. Les unions queden desactivades quan no hi ha pentagrames agrupats. Els menús es tradueixen també quan es canvia l’idioma sense recarregar.
- Les opcions s’inclouen a les plantilles personals, la persistència local, Restableix i desfer/refer. Codis P5 per recrear i compartir els fulls amb compassos, inclosos marges i espai superior; els fulls sense compassos continuen generant P2–P4 i es mantenen els codis anteriors.
- Mòdul propi de geometria de compassos que alimenta l’escena vectorial comuna. SVG, impressió i PDF utilitzen els mateixos traços, gruixos i patrons de discontinuïtat. Les excepcions per pàgina hereten les altres opcions de compassos del document.
- Comprovació dels límits horitzontals en continguts molt estrets; «Ajusta al full» pot reduir el nombre de compassos sense alterar marges, tipus ni gruix. Un document invàlid no es pot imprimir ni exportar parcialment.
- Resum del footer als deu idiomes, documentació i proves de compatibilitat, geometria, sortides vectorials, referències, grups, blocs, plantilles, historial i documents de diverses pàgines. Publicació limitada a la branca experimental i al repositori auxiliar de previsualització.

### 2.0.0-alpha.1 · 2026-10-19

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
