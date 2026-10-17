export const LANGUAGES = Object.freeze({ ca: 'Català', en: 'English', es: 'Español', de: 'Deutsch', fr: 'Français', it: 'Italiano', pt: 'Português', nl: 'Nederlands' });
const locales = Object.keys(LANGUAGES);
// One row per message. Keep all eight translations together when adding a key.
const rows = `
title|Pentagrama · El teu paper pautat|Pentagrama · Your manuscript paper|Pentagrama · Tu papel pautado|Pentagrama · Dein Notenpapier|Pentagrama · Votre papier à musique|Pentagrama · La tua carta pentagrammata|Pentagrama · O teu papel de música|Pentagrama · Jouw muziekpapier
tagline|Un full en blanc. Totes les possibilitats.|A blank page. Every possibility.|Una hoja en blanco. Todas las posibilidades.|Ein leeres Blatt. Alle Möglichkeiten.|Une page blanche. Toutes les possibilités.|Un foglio bianco. Tutte le possibilità.|Uma folha em branco. Todas as possibilidades.|Een leeg vel. Alle mogelijkheden.
intro|Espai per a la teva|Space for your|Espacio para tu|Raum für deine|De la place pour votre|Spazio per la tua|Espaço para a tua|Ruimte voor jouw
music|música.|music.|música.|Musik.|musique.|musica.|música.|muziek.
description|Paper pautat a mida, sense marques d’aigua.|Custom manuscript paper, without watermarks.|Papel pautado a medida, sin marcas de agua.|Notenpapier nach Maß, ohne Wasserzeichen.|Du papier à musique sur mesure, sans filigrane.|Carta pentagrammata su misura, senza filigrane.|Papel de música à medida, sem marcas de água.|Muziekpapier op maat, zonder watermerken.
print|Imprimeix el full|Print sheet|Imprimir la hoja|Blatt drucken|Imprimer la feuille|Stampa il foglio|Imprimir a folha|Blad afdrukken
pdf|Descarrega PDF|Download PDF|Descargar PDF|PDF herunterladen|Télécharger le PDF|Scarica PDF|Descarregar PDF|PDF downloaden
settings|El teu full|Your sheet|Tu hoja|Dein Blatt|Votre feuille|Il tuo foglio|A tua folha|Jouw blad
reset|Restableix|Reset|Restablecer|Zurücksetzen|Réinitialiser|Ripristina|Repor|Herstellen
paper|Format del paper|Paper size|Formato del papel|Papierformat|Format du papier|Formato carta|Formato do papel|Papierformaat
orientation|Orientació|Orientation|Orientación|Ausrichtung|Orientation|Orientamento|Orientação|Oriëntatie
portrait|Vertical|Portrait|Vertical|Hochformat|Portrait|Verticale|Vertical|Staand
landscape|Horitzontal|Landscape|Horizontal|Querformat|Paysage|Orizzontale|Horizontal|Liggend
thickness|Gruix de les línies|Line thickness|Grosor de las líneas|Linienstärke|Épaisseur des lignes|Spessore delle linee|Espessura das linhas|Lijndikte
thin|Fines|Thin|Finas|Fein|Fines|Sottili|Finas|Dun
thick|Gruixudes|Thick|Gruesas|Kräftig|Épaisses|Spesse|Grossas|Dik
lineSpacing|Espai intern del pentagrama|Staff line spacing|Espaciado interno del pentagrama|Abstand der Notenlinien|Interligne de la portée|Interlinea del pentagramma|Espaçamento das linhas da pauta|Afstand tussen notenlijnen
lineSpacingHint|Distància entre dues línies del mateix pentagrama.|Distance between two lines within a staff.|Distancia entre dos líneas del mismo pentagrama.|Abstand zwischen zwei Linien einer Notenzeile.|Distance entre deux lignes d’une même portée.|Distanza tra due linee dello stesso pentagramma.|Distância entre duas linhas da mesma pauta.|Afstand tussen twee lijnen van dezelfde notenbalk.
distribution|Distribució|Layout|Distribución|Anordnung|Disposition|Disposizione|Distribuição|Indeling
simple|Senzilla|Simple|Sencilla|Einfach|Simple|Semplice|Simples|Eenvoudig
blocks|Per blocs|By blocks|Por bloques|Nach Blöcken|Par blocs|Per blocchi|Por blocos|Per blok
staves|Pentagrames per pàgina|Staves per page|Pentagramas por página|Notenzeilen pro Seite|Portées par page|Pentagrammi per pagina|Pautas por página|Notenbalken per pagina
decrease|Un pentagrama menys|One fewer staff|Un pentagrama menos|Eine Notenzeile weniger|Une portée de moins|Un pentagramma in meno|Menos uma pauta|Een notenbalk minder
increase|Un pentagrama més|One more staff|Un pentagrama más|Eine Notenzeile mehr|Une portée de plus|Un pentagramma in più|Mais uma pauta|Een notenbalk meer
group|Agrupació|Grouping|Agrupación|Gruppierung|Regroupement|Raggruppamento|Agrupamento|Groepering
none|Sense agrupar|No grouping|Sin agrupar|Ohne Gruppierung|Sans regroupement|Senza gruppi|Sem agrupamento|Geen groepering
groupEvery|De {n} en {n}|Groups of {n}|De {n} en {n}|Gruppen mit {n}|Par groupes de {n}|Gruppi di {n}|Grupos de {n}|Groepen van {n}
groupSpace|Espai entre grups|Space between groups|Espacio entre grupos|Abstand zwischen Gruppen|Espace entre groupes|Spazio tra i gruppi|Espaço entre grupos|Afstand tussen groepen
compact|Més junt|Closer|Más junto|Enger|Plus serré|Più vicino|Mais junto|Dichterbij
wide|Més separat|Further apart|Más separado|Weiter|Plus espacé|Più distante|Mais afastado|Verder uit elkaar
blockHint|Combina blocs amb espais diferents. Els noms no s’imprimeixen.|Combine blocks with different spacing. Names are not printed.|Combina bloques con distintos espacios. Los nombres no se imprimen.|Blöcke mit eigenen Abständen kombinieren. Namen werden nicht gedruckt.|Combinez des blocs aux espacements différents. Les noms ne sont pas imprimés.|Combina blocchi con spazi diversi. I nomi non vengono stampati.|Combina blocos com espaços diferentes. Os nomes não são impressos.|Combineer blokken met eigen afstanden. Namen worden niet afgedrukt.
block|Bloc {n}|Block {n}|Bloque {n}|Block {n}|Bloc {n}|Blocco {n}|Bloco {n}|Blok {n}
blockName|Nom del bloc|Block name|Nombre del bloque|Blockname|Nom du bloc|Nome del blocco|Nome do bloco|Bloknaam
blockCount|Pentagrames|Staves|Pentagramas|Notenzeilen|Portées|Pentagrammi|Pautas|Notenbalken
inside|Entre pentagrames (mm)|Between staves (mm)|Entre pentagramas (mm)|Zeilenabstand (mm)|Entre portées (mm)|Tra pentagrammi (mm)|Entre pautas (mm)|Tussen balken (mm)
after|Espai després (mm)|Gap after (mm)|Espacio después (mm)|Abstand danach (mm)|Espace après (mm)|Spazio dopo (mm)|Espaço depois (mm)|Afstand erna (mm)
addBlock|Afegeix un bloc|Add a block|Añadir bloque|Block hinzufügen|Ajouter un bloc|Aggiungi blocco|Adicionar bloco|Blok toevoegen
moveUp|Mou amunt|Move up|Mover arriba|Nach oben|Monter|Sposta su|Mover para cima|Omhoog
moveDown|Mou avall|Move down|Mover abajo|Nach unten|Descendre|Sposta giù|Mover para baixo|Omlaag
remove|Elimina|Remove|Eliminar|Entfernen|Supprimer|Elimina|Eliminar|Verwijderen
systems|Repeticions del conjunt|System repetitions|Repeticiones del conjunto|Wiederholungen des Systems|Répétitions du système|Ripetizioni del sistema|Repetições do sistema|Herhalingen van het systeem
systemGap|Espai entre conjunts (mm)|Gap between systems (mm)|Espacio entre conjuntos (mm)|Systemabstand (mm)|Espace entre systèmes (mm)|Spazio tra i sistemi (mm)|Espaço entre sistemas (mm)|Afstand tussen systemen (mm)
oneStaff|1 pentagrama|1 staff|1 pentagrama|1 Notenzeile|1 portée|1 pentagramma|1 pauta|1 notenbalk
staffCount|{n} pentagrames|{n} staves|{n} pentagramas|{n} Notenzeilen|{n} portées|{n} pentagrammi|{n} pautas|{n} notenbalken
reference|Referència al peu|Reference in footer|Referencia al pie|Referenz im Fußbereich|Référence en pied de page|Riferimento a piè di pagina|Referência no rodapé|Referentie onderaan
referenceHint|Per tornar a crear exactament el mateix full.|To recreate exactly the same sheet.|Para recrear exactamente la misma hoja.|Um genau dasselbe Blatt wiederherzustellen.|Pour recréer exactement la même feuille.|Per ricreare esattamente lo stesso foglio.|Para recriar exatamente a mesma folha.|Om precies hetzelfde blad te maken.
copy|Copia|Copy|Copiar|Kopieren|Copier|Copia|Copiar|Kopiëren
restore|Recupera una configuració|Restore a layout|Recuperar una configuración|Anordnung wiederherstellen|Restaurer une configuration|Recupera una configurazione|Recuperar uma configuração|Indeling herstellen
restoreHint|Enganxa una referència P1 o P2.|Paste a P1 or P2 reference.|Pega una referencia P1 o P2.|Eine P1- oder P2-Referenz einfügen.|Collez une référence P1 ou P2.|Incolla un riferimento P1 o P2.|Cola uma referência P1 ou P2.|Plak een P1- of P2-referentie.
apply|Aplica|Apply|Aplicar|Anwenden|Appliquer|Applica|Aplicar|Toepassen
invalidRef|La referència no és vàlida. Revisa el codi.|Invalid reference. Please check the code.|La referencia no es válida. Revisa el código.|Ungültige Referenz. Bitte den Code prüfen.|Référence invalide. Vérifiez le code.|Riferimento non valido. Controlla il codice.|Referência inválida. Verifica o código.|Ongeldige referentie. Controleer de code.
restored|Configuració recuperada.|Layout restored.|Configuración recuperada.|Anordnung wiederhergestellt.|Configuration restaurée.|Configurazione recuperata.|Configuração recuperada.|Indeling hersteld.
copied|Copiat al porta-retalls.|Copied to clipboard.|Copiado al portapapeles.|In die Zwischenablage kopiert.|Copié dans le presse-papiers.|Copiato negli appunti.|Copiado para a área de transferência.|Gekopieerd naar het klembord.
manualCopy|Pots seleccionar i copiar el text.|You can select and copy the text.|Puedes seleccionar y copiar el texto.|Du kannst den Text auswählen und kopieren.|Vous pouvez sélectionner et copier le texte.|Puoi selezionare e copiare il testo.|Podes selecionar e copiar o texto.|Je kunt de tekst selecteren en kopiëren.
resetDone|S’ha restablert el full inicial.|Default sheet restored.|Se ha restablecido la hoja inicial.|Standardblatt wiederhergestellt.|La feuille initiale a été restaurée.|Foglio iniziale ripristinato.|A folha inicial foi reposta.|Standaardblad hersteld.
preview|PREVISUALITZACIÓ|PREVIEW|VISTA PREVIA|VORSCHAU|APERÇU|ANTEPRIMA|PRÉ-VISUALIZAÇÃO|VOORBEELD
live|En directe|Live|En directo|Live|En direct|In tempo reale|Em direto|Live
templates|Plantilles|Templates|Plantillas|Vorlagen|Modèles|Modelli|Modelos|Sjablonen
saveTemplate|Desa plantilla|Save template|Guardar plantilla|Vorlage speichern|Enregistrer le modèle|Salva modello|Guardar modelo|Sjabloon opslaan
share|Comparteix aquesta plantilla|Share this layout|Compartir esta plantilla|Diese Vorlage teilen|Partager cette configuration|Condividi questa configurazione|Partilhar este modelo|Deze indeling delen
suggested|Suggerides|Suggested|Sugeridas|Vorschläge|Suggestions|Suggeriti|Sugeridos|Voorgesteld
yours|Les teves plantilles|Your templates|Tus plantillas|Deine Vorlagen|Vos modèles|I tuoi modelli|Os teus modelos|Jouw sjablonen
emptySaved|Desa una configuració i la tindràs aquí.|Save a layout and find it here.|Guarda una configuración y la tendrás aquí.|Speichere eine Anordnung, um sie hier zu finden.|Enregistrez une configuration pour la retrouver ici.|Salva una configurazione e la troverai qui.|Guarda uma configuração para a encontrares aqui.|Sla een indeling op om die hier terug te vinden.
restoreDefaults|Restableix les plantilles per defecte|Restore default templates|Restablecer plantillas predeterminadas|Standardvorlagen wiederherstellen|Restaurer les modèles par défaut|Ripristina i modelli predefiniti|Repor os modelos predefinidos|Standaardsjablonen herstellen
defaultsRestored|Plantilles suggerides recuperades. Les teves es conserven.|Suggested templates restored. Yours are kept.|Plantillas sugeridas recuperadas. Las tuyas se conservan.|Vorschläge wiederhergestellt. Deine Vorlagen bleiben erhalten.|Suggestions restaurées. Vos modèles sont conservés.|Modelli suggeriti ripristinati. I tuoi sono conservati.|Modelos sugeridos repostos. Os teus são mantidos.|Voorgestelde sjablonen hersteld. Jouw sjablonen blijven behouden.
templateRemoved|Plantilla eliminada de la llista.|Template removed from the list.|Plantilla eliminada de la lista.|Vorlage aus der Liste entfernt.|Modèle retiré de la liste.|Modello rimosso dall’elenco.|Modelo removido da lista.|Sjabloon uit de lijst verwijderd.
templateSaved|Plantilla desada en aquest navegador.|Template saved in this browser.|Plantilla guardada en este navegador.|Vorlage in diesem Browser gespeichert.|Modèle enregistré dans ce navigateur.|Modello salvato in questo browser.|Modelo guardado neste navegador.|Sjabloon opgeslagen in deze browser.
localHint|Desades en aquest navegador, sense compte.|Saved in this browser, without an account.|Guardadas en este navegador, sin cuenta.|In diesem Browser gespeichert, ohne Konto.|Enregistrés dans ce navigateur, sans compte.|Salvati in questo browser, senza account.|Guardados neste navegador, sem conta.|Opgeslagen in deze browser, zonder account.
noStorage|El navegador no permet desar-ho. Els canvis només duraran aquesta sessió.|Browser storage is unavailable. Changes will last for this session only.|El navegador no permite guardar. Los cambios solo durarán esta sesión.|Speichern nicht möglich. Änderungen bleiben nur für diese Sitzung erhalten.|Le stockage est indisponible. Les modifications dureront seulement cette session.|Salvataggio non disponibile. Le modifiche dureranno solo per questa sessione.|O armazenamento não está disponível. As alterações duram apenas nesta sessão.|Opslaan is niet beschikbaar. Wijzigingen blijven alleen deze sessie bewaard.
libraryFull|Has arribat al límit de 50 plantilles desades.|You have reached the limit of 50 saved templates.|Has alcanzado el límite de 50 plantillas guardadas.|Das Limit von 50 gespeicherten Vorlagen ist erreicht.|La limite de 50 modèles enregistrés est atteinte.|Hai raggiunto il limite di 50 modelli salvati.|Atingiste o limite de 50 modelos guardados.|Je hebt de limiet van 50 opgeslagen sjablonen bereikt.
saveTitle|Desa la teva plantilla|Save your template|Guardar tu plantilla|Deine Vorlage speichern|Enregistrer votre modèle|Salva il tuo modello|Guardar o teu modelo|Jouw sjabloon opslaan
name|Nom de la plantilla|Template name|Nombre de la plantilla|Vorlagenname|Nom du modèle|Nome del modello|Nome do modelo|Naam van het sjabloon
nameExample|Per exemple, Coral amb piano|For example, Choir with piano|Por ejemplo, Coral con piano|Zum Beispiel Chor mit Klavier|Par exemple, Chœur et piano|Per esempio, Coro con pianoforte|Por exemplo, Coro com piano|Bijvoorbeeld Koor met piano
save|Desa|Save|Guardar|Speichern|Enregistrer|Salva|Guardar|Opslaan
cancel|Cancel·la|Cancel|Cancelar|Abbrechen|Annuler|Annulla|Cancelar|Annuleren
close|Tanca|Close|Cerrar|Schließen|Fermer|Chiudi|Fechar|Sluiten
language|Idioma|Language|Idioma|Sprache|Langue|Lingua|Idioma|Taal
automatic|Automàtic|Automatic|Automático|Automatisch|Automatique|Automatico|Automático|Automatisch
footer|El paper és teu. La música, també.|The paper is yours. So is the music.|El papel es tuyo. La música, también.|Das Papier gehört dir. Die Musik auch.|Le papier est à vous. La musique aussi.|La carta è tua. Anche la musica.|O papel é teu. A música também.|Het papier is van jou. De muziek ook.
about|Sobre el projecte · V4V|About · V4V|Sobre el proyecto · V4V|Über das Projekt · V4V|À propos · V4V|Il progetto · V4V|Sobre o projeto · V4V|Over het project · V4V
aboutTitle|Un petit espai per a la música|A small space for music|Un pequeño espacio para la música|Ein kleiner Raum für Musik|Un petit espace pour la musique|Un piccolo spazio per la musica|Um pequeno espaço para a música|Een kleine plek voor muziek
story|Pentagrama neix d’una necessitat senzilla: imprimir paper pautat flexible, ràpid i sense publicitat al full. Fet per poder escriure música amb llibertat.|Pentagrama started with a simple need: flexible manuscript paper, quick to print and free of advertising on the sheet. Made for writing music freely.|Pentagrama nace de una necesidad sencilla: imprimir papel pautado flexible, rápido y sin publicidad en la hoja. Hecho para escribir música con libertad.|Pentagrama entstand aus einem einfachen Wunsch: flexibles Notenpapier, schnell gedruckt und ohne Werbung auf dem Blatt. Für freies musikalisches Schreiben.|Pentagrama est né d’un besoin simple : du papier à musique flexible, rapide à imprimer et sans publicité sur la feuille. Pour écrire la musique librement.|Pentagrama nasce da un bisogno semplice: carta pentagrammata flessibile, veloce da stampare e senza pubblicità sul foglio. Per scrivere musica in libertà.|O Pentagrama nasceu de uma necessidade simples: papel de música flexível, rápido de imprimir e sem publicidade na folha. Para escrever música com liberdade.|Pentagrama begon met een eenvoudige behoefte: flexibel muziekpapier, snel afgedrukt en zonder reclame op het blad. Om vrij muziek te kunnen schrijven.
v4v|El projecte és gratuït i segueix la filosofia Value for Value: si et resulta útil i vols donar-hi suport, pots fer un microdonatiu voluntari per Lightning. Recomanar-lo també ajuda.|This project is free and follows Value for Value: if it helps you and you want to support it, you can send a voluntary microdonation over Lightning. Recommending it helps too.|El proyecto es gratuito y sigue la filosofía Value for Value: si te resulta útil y quieres apoyarlo, puedes hacer un microdonativo voluntario por Lightning. Recomendarlo también ayuda.|Das Projekt ist kostenlos und folgt Value for Value: Wenn es dir hilft, kannst du es freiwillig mit einer kleinen Lightning-Spende unterstützen. Weiterempfehlen hilft ebenfalls.|Ce projet est gratuit et suit la philosophie Value for Value : s’il vous est utile, vous pouvez le soutenir par un microdon volontaire via Lightning. Le recommander aide aussi.|Il progetto è gratuito e segue Value for Value: se ti è utile, puoi sostenerlo con una microdonazione volontaria tramite Lightning. Anche consigliarlo aiuta.|O projeto é gratuito e segue a filosofia Value for Value: se te for útil, podes apoiar com um microdonativo voluntário por Lightning. Recomendá-lo também ajuda.|Dit project is gratis en volgt Value for Value: als het je helpt, kun je het vrijwillig steunen met een kleine Lightning-donatie. Aanbevelen helpt ook.
lightningHint|Copia aquesta adreça a la teva cartera Lightning.|Copy this address into your Lightning wallet.|Copia esta dirección en tu cartera Lightning.|Kopiere diese Adresse in deine Lightning-Wallet.|Copiez cette adresse dans votre portefeuille Lightning.|Copia questo indirizzo nel tuo portafoglio Lightning.|Copia este endereço para a tua carteira Lightning.|Kopieer dit adres naar je Lightning-wallet.
clean|Només el teu paper. Cap marca d’aigua.|Only your paper. No watermarks.|Solo tu papel. Sin marcas de agua.|Nur dein Papier. Ohne Wasserzeichen.|Votre papier, sans filigrane.|Solo la tua carta. Nessuna filigrana.|Só o teu papel. Sem marcas de água.|Alleen jouw papier. Geen watermerken.
printHint|Imprimeix al 100 % i desactiva les capçaleres i els peus del navegador.|Print at 100% and disable browser headers and footers.|Imprime al 100 % y desactiva las cabeceras y los pies del navegador.|Mit 100 % drucken und Browser-Kopf- und Fußzeilen ausschalten.|Imprimez à 100 % et désactivez les en-têtes et pieds du navigateur.|Stampa al 100% e disattiva intestazioni e piè di pagina del browser.|Imprime a 100 % e desativa cabeçalhos e rodapés do navegador.|Druk af op 100% en schakel browserkop- en voetteksten uit.
fitWarning|Aquesta distribució no cap al full. Redueix els espais, la mida o el nombre de pentagrames.|This layout does not fit. Reduce spacing, staff size or the number of staves.|Esta distribución no cabe. Reduce los espacios, el tamaño o el número de pentagramas.|Diese Anordnung passt nicht. Abstände, Größe oder Zeilenzahl reduzieren.|Cette disposition ne tient pas. Réduisez les espaces, la taille ou le nombre de portées.|Questa disposizione non entra. Riduci spazi, dimensioni o numero di pentagrammi.|Esta disposição não cabe. Reduz os espaços, o tamanho ou o número de pautas.|Deze indeling past niet. Verklein afstanden, balkgrootte of het aantal balken.
fit|Ajusta al full|Fit to sheet|Ajustar a la hoja|An Blatt anpassen|Ajuster à la feuille|Adatta al foglio|Ajustar à folha|Aanpassen aan blad
layoutInvalid|Cal ajustar la distribució abans d’exportar.|Adjust the layout before exporting.|Ajusta la distribución antes de exportar.|Vor dem Export die Anordnung anpassen.|Ajustez la disposition avant l’export.|Adatta la disposizione prima di esportare.|Ajusta a disposição antes de exportar.|Pas de indeling aan voor het exporteren.
presetBlank|Clàssica · 9 pentagrames|Classic · 9 staves|Clásica · 9 pentagramas|Klassisch · 9 Notenzeilen|Classique · 9 portées|Classico · 9 pentagrammi|Clássico · 9 pautas|Klassiek · 9 notenbalken
presetPiano|Piano|Piano|Piano|Klavier|Piano|Pianoforte|Piano|Piano
presetChoir|Coral SATB|SATB choir|Coro SATB|SATB-Chor|Chœur SATB|Coro SATB|Coro SATB|SATB-koor
presetLarge|Iniciació · pentagrames grans|Beginners · large staves|Iniciación · pentagramas grandes|Einstieg · große Notenzeilen|Débutants · grandes portées|Principianti · pentagrammi grandi|Iniciação · pautas grandes|Beginners · grote notenbalken
presetTrio|Trio|Trio|Trío|Trio|Trio|Trio|Trio|Trio
presetChoirPiano|Coral SATB amb piano|SATB choir with piano|Coro SATB con piano|SATB-Chor mit Klavier|Chœur SATB et piano|Coro SATB con pianoforte|Coro SATB com piano|SATB-koor met piano
presetOrchestra|Orquestra · A3|Orchestra · A3|Orquesta · A3|Orchester · A3|Orchestre · A3|Orchestra · A3|Orquestra · A3|Orkest · A3
woodwinds|Fustes|Woodwinds|Maderas|Holzbläser|Bois|Legni|Madeiras|Houtblazers
brass|Metalls|Brass|Metales|Blechbläser|Cuivres|Ottoni|Metais|Koperblazers
percussion|Percussió|Percussion|Percusión|Schlagwerk|Percussions|Percussioni|Percussão|Slagwerk
harp|Arpa|Harp|Arpa|Harfe|Harpe|Arpa|Harpa|Harp
strings|Cordes|Strings|Cuerdas|Streicher|Cordes|Archi|Cordas|Strijkers
`;

export const messages = Object.fromEntries(locales.map(locale => [locale, {}]));
for (const row of rows.trim().split('\n')) {
  const [key, ...translations] = row.split('|');
  if (translations.length !== locales.length || translations.some(text => !text)) throw new Error(`Incomplete translations: ${key}`);
  locales.forEach((locale, index) => { messages[locale][key] = translations[index]; });
}
export function detectLanguage(preferred, browserLanguages = []) {
  if (Object.hasOwn(LANGUAGES, preferred)) return preferred;
  for (const language of browserLanguages) { const base = String(language).toLowerCase().split(/[-_]/)[0]; if (Object.hasOwn(LANGUAGES, base)) return base; }
  return 'en';
}
export function translate(locale, key, variables = {}) {
  const message = messages[locale]?.[key] ?? messages.en[key] ?? key;
  return message.replace(/\{(\w+)\}/g, (match, variable) => String(variables[variable] ?? match));
}
