# Pentagrama

Paper pautat a mida per escriure música a mà. Configura el full, comprova’l en directe i imprimeix-lo net, sense marques d’aigua.

**[Obre Pentagrama →](https://pentagrama.page/)**

> Aquesta branca (`codex/v2-modular-engine`) prepara **2.0.0-alpha.1**. La versió estable continua a `main`. La [previsualització experimental](https://aaronfortuno.github.io/pentagrama-preview/) es publica en un repositori auxiliar, sense modificar pentagrama.page. Vegeu el [motor v2](documentation/engine-v2.md).

## Què hi pots fer

- Preparar fulls **A3, A4 i Letter**, en vertical o horitzontal.
- Ajustar el nombre de pentagrames, el gruix de les línies, l’interlineat i l’espai superior.
- Agrupar pentagrames o crear blocs amb separacions diferents, per exemple per a veus i piano o famílies instrumentals.
- Partir de plantilles suggerides, desar-ne de pròpies i compartir configuracions amb un enllaç.
- Desfer i refer els canvis de configuració amb les fletxes o les dreceres de teclat.
- Explorar el full amb zoom i imprimir-lo o desar-lo com a PDF des del diàleg del navegador.

Per defecte, el full només conté les línies dels pentagrames. Pots afegir-hi voluntàriament una referència de configuració o l’adreça del web al peu.

És gratuït i no requereix compte. Les plantilles pròpies es desen en aquest navegador, sense sincronització entre dispositius. La interfície està disponible en català, castellà, anglès, alemany, francès, italià, portuguès, neerlandès, euskara i galego.

## Desenvolupament local

Web estàtic d’HTML, CSS i JavaScript, sense instal·lació de dependències. Les pàgines dels idiomes disponibles es generen des d’una sola estructura i es conserven a `docs/`, llestes per publicar. Amb **Node.js 22 o posterior**, des de l’arrel del repositori:

```sh
npm run dev
```

Obre **http://127.0.0.1:4173/pentagrama/**. Per executar les proves:

```sh
npm test
```

El web publicable és a `docs/`; l’estructura comuna, a `src/index.html`; les proves, a `tests/`, i les eines de manteniment, a `tools/`. Després de canviar l’estructura o les traduccions, executa `npm run build:locales` per regenerar les pàgines. Cada idioma disposa d’una adreça pròpia, com `/ca/`, `/en/` o `/fr/`.

## Documentació i contribucions

- [Desenvolupament](documentation/development.md): estructura del codi, configuracions, traduccions i recursos de tercers.
- [Motor v2](documentation/engine-v2.md): model del document, renderització compartida, compatibilitat i següents passos.
- [Desplegament](documentation/deployment.md): versions, GitHub Pages i domini propi.
- [Analítica i privadesa](documentation/analytics.md): què es mesura i com excloure les visites pròpies.
- [Historial de canvis](CHANGELOG.md).

Les propostes, els avisos d’errors i les contribucions són benvinguts a les [issues](https://github.com/aaronFortuno/pentagrama/issues) i els [pull requests](https://github.com/aaronFortuno/pentagrama/pulls).

## Llicència i suport

Codi obert sota [GNU GPL v3](LICENSE). Les icones [Lucide](docs/vendor/lucide-LICENSE.txt) i la font [Noto Serif](docs/vendor/noto-serif-OFL.txt) conserven les seves llicències.

El projecte segueix la filosofia **Value for Value**. Pots donar-hi suport recomanant-lo, contribuint-hi o fent una aportació voluntària des de «Sobre el projecte · V4V» al web.
