# Còpia de seguretat del perfil

El botó de còpia de seguretat del footer, al costat de la versió, obre un únic diàleg compartit pel generador i el catàleg. **Exporta** descarrega un fitxer JSON amb totes les dades d’usuari, sense separar plantilles i peus. El fitxer no s’envia a cap servidor.

Inclou el full actual, el seu punt de restabliment, les plantilles personals, les suggerides ocultes, els peus desats amb imatges, mides i disposicions, l’idioma preferit, els estils de text per defecte, la darrera secció de configuració oberta i l’exclusió voluntària de l’analítica. No inclou dades d’altres aplicacions, historial de desfer/refer, zoom temporal ni marcadors tècnics de notificacions. Les imatges són dins del mateix fitxer; no cal copiar fitxers addicionals.

**Importa** llegeix localment un fitxer de fins a 16 MiB. La còpia es valida abans de canviar cap dada: format, esquema, estructura, límits, tots els valors i integritat de les imatges. No es retallen biblioteques ni s’eliminen opcions malmeses silenciosament. El resum mostra data, versió del web i recomptes de plantilles i peus. Restaurar requereix prémer **Restaura la còpia**; cancel·lar o tancar el diàleg descarta la selecció.

La restauració **substitueix** les dades pròpies d’aquest navegador i origen. Exporta primer el perfil actual si el vols conservar. Les claus d’altres aplicacions i les dades tècniques no gestionades es mantenen. S’obre el generador amb el full importat, sense el hash d’una plantilla anterior, i les altres pestanyes del mateix origen actualitzen el perfil. El punt de restabliment viatja separat del full modificat, de manera que Restableix continua recuperant la plantilla inicial.

Abans d’aplicar la còpia es comprova que l’emmagatzematge permet escriure. Si una escriptura falla, es recuperen tots els valors anteriors. Si el navegador també bloqueja aquesta recuperació, el diàleg conserva en memòria un perfil anterior exportable i n’avisa: utilitza Exporta abans de tancar la pestanya. El fitxer d’importació es conserva al teu dispositiu.

La importació mai reactiva les estadístiques si aquest navegador o el perfil importat les havien excloses. Aquesta preferència es pot modificar expressament des del diàleg del projecte. DNT i GPC depenen del navegador i continuen aplicant-se independentment de la còpia.

El format inicial és `pentagrama-user-backup`, `schemaVersion: 1`, amb `appVersion`, `createdAt` i `data`. El codi de validació i restauració és a `docs/user-backup.js`. Un esquema futur no reconegut es rebutja per evitar perdre dades. Les còpies amb aquest format són portables entre els dominis i navegadors on s’utilitzi una versió compatible de Pentagrama.

## Esquema 2 (2.7.0)

Afegeix `footerStyle` i `footerAlign` als ajustos, peus desats i preferències tipogràfiques. L’importador continua acceptant l’esquema 1 i afegeix exclusivament aquests valors per defecte on no existien; la resta de dades es valida sense canvis ni truncaments. Les còpies noves declaren l’esquema 2.
