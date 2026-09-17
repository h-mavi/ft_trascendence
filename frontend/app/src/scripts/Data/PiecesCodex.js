// SECTION - I DATI STATICI DEL KING'S CODEX
//
// Il codex e' la schermata che spiega i pezzi: per ognuno mostra come muove, come cambia
// una volta potenziato, e alcune situazioni disegnate su una griglia di anteprima.
//
// qui costruisco una o più scacchiere per spiegare le abilità dei pezzi, con costruzione 
// dinamica di frecce punti di cattura e pezzi alleati e non, la costruzione è diversa da 
// quella della scacchiera, mi sono ispirato alla compilazione dello schermo di openGL
//
// Le coordinate sono offset dal centro della griglia, non caselle della scacchiera: y
// negativo punta verso il lato avversario.

//direzioni base, dy negativo = verso alto
const ORTHO		= [[ 0,-1], [ 0, 1], [-1, 0], [ 1, 0]];
const DIAG		= [[-1,-1], [ 1,-1], [-1, 1], [ 1, 1]];
const STAR		= [...ORTHO, ...DIAG];
const KNIGHT	= [[ 1, 2], [ 2, 1], [ 2,-1], [ 1,-2], [-1,-2], [-2,-1], [-2, 1], [-1, 2]];

//raggio della griglia di anteprima: 2 -> 5x5 con il pezzo al centro
export const CODEX_RADIUS = 2;

//helper per scrivere le scene in modo compatto.
//role decide solo con che colore viene disegnata l'icona, non la logica.
const self	= (x, y, opts = {})			=> ({ x, y, role: 'self',		...opts });
const ally	= (x, y, type, opts = {})	=> ({ x, y, role: 'ally',	type,	...opts });
const enemy	= (x, y, type, opts = {})	=> ({ x, y, role: 'enemy',	type,	...opts });
const ghost	= (x, y, opts = {})			=> ({ x, y, role: 'self',	ghost: true,	...opts });


/**
 * @typedef {Object} CodexPattern
 * @property {number[][]}   dirs		Direzioni (dx, dy) in cui il pezzo si muove
 * @property {boolean}      slide		Se scorre lungo la direzione o fa un passo solo
 * @property {number[][]}   [capture]	Direzioni in cui mangia soltanto (es. il Bastards)
 */

/**
 * @typedef {Object} CodexActor
 * @property {number}  x		Offset dal centro della griglia
 * @property {number}  y		Offset dal centro, negativo = verso l'avversario
 * @property {string}  [type]	Tipo del pezzo, default: il pezzo a cui appartiene la entry
 * @property {string}  [role]	'self' | 'ally' | 'enemy', decide il colore dell'icona
 * @property {boolean} [ghost]	Traccia della casella di partenza, non blocca i pattern
 */

/**
 * @typedef {Object} CodexMark
 * @property {number} x
 * @property {number} y
 * @property {string} [kind]	'move' (default) | 'capture'
 */

/**
 * @typedef {Object} CodexArrow
 * @property {number[]} from	[x, y] di partenza
 * @property {number[]} to		[x, y] di arrivo
 */

/**
 * @typedef {Object} CodexScene
 * @property {string}        [caption]		Riga di testo sotto la griglia
 * @property {CodexActor[]}  actors			Pezzi da mettere sulla griglia
 * @property {CodexMark[]}   [marks]		Caselle segnate a mano
 * @property {CodexPattern}  [pattern]		Pattern espanso automaticamente
 * @property {number}        [patternFrom]	Indice dell'attore da cui parte il pattern, default 0
 * @property {CodexArrow[]}  [arrows]		Frecce disegnate sopra la griglia
 */


/**
 * @typedef {Object} CodexEntry
 * @property {string}            name			Nome mostrato nel codex
 * @property {CodexPattern}      move			Movimento non potenziato
 * @property {CodexPattern|null} boost			Movimento potenziato, null se il boost non cambia pattern
 * @property {string}            [baseTitle]	Titolo della mossa base, in testa alla descrizione
 * @property {string}            [boostTitle]	Titolo del potenziamento
 * @property {string}            [baseText]		Cosa fa il pezzo da base
 * @property {string}            [boostText]		Cosa fa il potenziamento
 * @property {CodexScene[]}      [baseScenes]	Scene disegnate a mano, hanno la precedenza su move
 * @property {CodexScene[]}      [boostScenes]	Scene disegnate a mano, hanno la precedenza su boost

 */

/**
 * Il contenuto del codex, descrive le scene che vengono popolate in base all'oggetto
 * @type {Object<string, CodexEntry>}
 */
export const PIECES_CODEX = Object.freeze({
	King: {
		name:		"King",
		move:		{ dirs: STAR, slide: false },
		boost:		null,
		baseTitle:	"MOSSA BASE DEGLI SCACCHI",
		baseText:	"Si muove di una sola casella per volta, in tutte e otto le direzioni.\nCattura allo stesso modo, spostandosi sulla casella del pezzo avversario.",
		boostText:	"Potenzia a tuo rischio e pericolo.",
	},
	Champion: {
		name:		"Champion",
		move:		{ dirs: STAR, slide: true },
		boost:		{ dirs: STAR, slide: true },
		baseTitle:	"MOSSA BASE DEGLI SCACCHI",
		baseText:	"Scorre quanto vuole lungo le otto direzioni, ortogonali e diagonali.\nSi ferma sul primo pezzo che incontra e lo cattura se e' avversario.",
		boostTitle: "GIURAMENTO",
		boostText:	"Si sposta di una mossa classica di scacchi ma attenzione, se ci si muove in una casella minacciata da un pezzo\
					 avversario la mossa boostata si interrompe\nLa seconda mossa è esattamente uguale alla prima senza le limitazioni",
		baseScenes: [
			{
				caption:	"Le otto linee del Champion: ognuna continua finche' non trova un pezzo o il bordo.",
				actors:		[ self(0, 0) ],
				arrows:		[
					{ from: [0, 0], to: [ 0, -2] },
					{ from: [0, 0], to: [ 0,  2] },
					{ from: [0, 0], to: [-2,  0] },
					{ from: [0, 0], to: [ 2,  0] },
					{ from: [0, 0], to: [ 2,  2] },
					{ from: [0, 0], to: [-2, -2] },
					{ from: [0, 0], to: [ 2, -2] },
					{ from: [0, 0], to: [-2,  2] },
				],
			},
		],

		boostScenes: [
			{
				caption:	"1. Una mossa normale, lungo una qualsiasi delle sue linee.",
				actors:		[ self(-2, 2) ],
				arrows:		[ { from: [-2, 2], to: [0, 0] } ],
			},
			{
				caption:	"2. Dalla casella d'arrivo riparte con una mossa intera.",
				actors:		[ self(0, 0), ghost(-2, 2) ],
				pattern:	{ dirs: STAR, slide: true },
			},
		],
	},
	Minotaurus: {
		name:		"Minotaurus",
		move:		{ dirs: ORTHO, slide: true },
		boost:		{ dirs: ORTHO, slide: true },
		baseTitle:	"MOSSA BASE DEGLI SCACCHI",
		baseText:	"Scorre quanto vuole su righe e colonne, mai in diagonale.\nSi ferma sul primo pezzo che incontra e lo cattura se e' avversario.",
		boostTitle:	"BERSERK",
		boostText:	"Due catture in un turno, ma solo se entrambe catturano un pezzo.\nDalla casella della preda riparte per catturare di nuovo.\nSe una seconda preda non c'e', il boost non parte.",
		baseScenes: [
			{
				caption:	"Le quattro linee ortogonali: avanti, indietro e sui due lati.",
				actors:		[ self(0, 0) ],
				arrows:		[
					{ from: [0, 0], to: [ 0, -2] },
					{ from: [0, 0], to: [ 0,  2] },
					{ from: [0, 0], to: [-2,  0] },
					{ from: [0, 0], to: [ 2,  0] },
				],
			},
		],

		boostScenes: [
			{
				caption:	"1. La prima mossa e' una cattura.",
				actors:		[ self(-2, 0), enemy(0, 0, "Bastards") ],
				marks:		[ { x: 0, y: 0, kind: 'capture' } ],
				arrows:		[ { from: [-2, 0], to: [0, 0] } ],
			},
			{
				caption:	"2. Dalla preda riparte solo per catturare ancora: nessuna casella vuota e' un arrivo valido.",
				actors:		[
					self(0, 0),
					ghost(-2, 0),
					enemy(0, -2, "Bastards"),
					enemy(2,  0, "Jester"),
				],
				arrows: 	[
					{from: [0, 0], to: [0, -2]},
					{from: [0, 0], to: [2, 0]}
				],
				marks:		[
					{ x: 0, y: -2, kind: 'capture' },
					{ x: 2, y:  0, kind: 'capture' },
				],
			},
		],
	},
	Jester: {
		name:		"Jester",
		move:		{ dirs: KNIGHT, slide: false },
		boost:		{ dirs: KNIGHT, slide: false },
		baseTitle:	"MOSSA BASE DEGLI SCACCHI",
		baseText:	"Salto a \"L\": due caselle in una direzione e una in quella perpendicolare.\nE' l'unico pezzo che scavalca: chi sta in mezzo non lo ferma.",
		boostTitle:	"SCHERZO",
		boostText:	"Mossa singola effetto pac-man, ma su zone extra concesse dall'abilità che\
					 permettono al jester di sbucare dalla parte opposta della\
					 scacchiera se si \"salta\" fuori.\nIl movimento rimane sempre ad L ma\
					 per ogni casella del movimento hai la possibilità di saltare",
		baseScenes: [
			{
				caption:	"Le otto L partono da qui, ma dal bordo solo quattro restano dentro la scacchiera.",
				actors:		[ self(0, 2) ],
				marks:		[
					{ x:-1, y: 0,	kind: "capture"},
					{ x:-2, y: 1,	kind: "capture"},
					{ x:1, y: 0,	kind: "capture"},
					{ x:2, y: 1,	kind: "capture"},
				]
			},
		],

		boostScenes: [
			{
				caption:	"Il cavallo fa una mossa che sembra farlo andare fuori dalla scacchiera ma sbuca dal lato opposto.",
				actors:		[ self(-1, 0) ],
				arrows:		[
					{ points: [ [-1, 0], [-3.4, 0] ] },
					{ points: [ [3.4, 0], [2, 0], [2, -1] ] }
				]
			},
			{
				caption:	"Questa è la mossa più potente del cavallo, warp alla destra della scacchiera per sbucare a sinistra e poi warp verso il basso per sbucare in cima",
				actors:		[ self(1, 2) ],
				arrows:		[
					{ points: [ [1, 2], [2, 2] ] },
					{ points: [ [1, 2], [3.4, 2] ] },
					{ points: [ [-3.4, 2], [-2, 2], [-2, 3.4] ] },
					{ points: [ [-3.4, 2], [-2, 2] ]},
					{ points: [ [-2, -3.4], [-2, -2] ] },
				],
				marks: [
					{ x:-2, y:-2, kind: "capture"},
				]
			},
		],
	},
	Valkirya: {
		name:		"Valkirya",
		move:		{ dirs: DIAG, slide: true },
		boost:		{ dirs: DIAG, slide: true },
		baseTitle:	"MOSSA BASE DEGLI SCACCHI",
		baseText:	"Si muove solo in diagonale di tante caselle quanto vuoi\nMangia pezzi lungo la diagonale muovendosi",
		boostTitle: "LANCIO",
		boostText:	"Cattura senza movimento in una mossa singola che permette di catturare un pezzo avversario senza\
					 muovere la valkirya stessa.\n Salta un solo pezzo qualsiasi lungo il suo raggio d'azione, alleato o avversario",
		baseScenes: [
			{
				caption:	"Le quattro diagonali: scorre finche' non incontra un pezzo e lo cattura se e' avversario.",
				actors:		[ self(0, 0) ],
				arrows:		[
					{ from: [0, 0], to: [2, 2] }, 
					{ from: [0, 0], to: [-2, -2] },
					{ from: [0, 0], to: [2, -2] },
					{ from: [0, 0], to: [-2, 2] },
				],
			},
		],

		boostScenes: [
			{
				caption:	"La Valkirya resta ferma e cattura a distanza. A sinistra scavalca l'alleato e prende il pezzo dietro di lui.",
				actors:		[
					self(0, 0),
					ally(-1, -1, "Bastards"),
					enemy(-2, -2, "Bastards"),
					enemy(-2, 2, "Jester"),
					enemy(1, -1, "Bastards"),
				],
				marks:		[
					{ x: -2, y: -2, kind: 'capture' },
					{ x:  1, y: -1, kind: 'capture' },
					{ x:  -2, y: 2, kind: 'capture' },
				],
			},
		],
	},
	Bastards: {
		name:		"Bastards",
		move:		{ dirs: [[0,-1]], slide: false, capture: [[-1,-1], [1,-1]] },
		boost:		{ dirs: [[0,-1], [0,-2]], slide: false, capture: [[-1,-1], [1,-1]] },
		baseTitle:	"MOSSA BASE DEGLI SCACCHI",
		baseText:	"Si muove solo in avanti \nAvanza di una casella. \nDue se non si e' ancora mosso.\nMangia 1 casella in diagonale in avanti.",
		boostTitle:	"INVESTITURA",
		boostText:	"Due mosse in un turno\n1. Un movimento classico del pedone\
					\n 2. Nello stesso turno muove anche un pezzo che era accanto alla casella di partenza, con le sue mosse classiche..",
		baseScenes: [
			{
				caption:	"Avanza dritto di una casella, due se non si e' ancora mosso; in diagonale ci va solo per catturare.",
				actors:		[ self(0, 1) ],
				marks:		[
					{ x:  0, y:  0 },
					{ x:  0, y: -1 },
					{ x: -1, y:  0, kind: 'capture' },
					{ x:  1, y:  0, kind: 'capture' },
				],
			},
		],

		boostScenes: [
			{
				caption:	"1. Il Bastard potenziato fa la sua mossa normale,\
							 qui l'avanzata doppia.",
				actors:		[ self(0, 1), ally(1, 1, "Valkirya") ],
				arrows:		[ { from: [0, 1], to: [0, -1] } ],
			},
			{
				caption:	"2. Ora posso muovere un pezzo vicino alla casella di partenza.",
				actors:			[ self(0, -1), ally(1, 1, "Valkirya"), ghost(0, 1) ],
				pattern:		{ dirs: DIAG, slide: true },
				patternFrom:	1,	
				arrows:			[ { from: [1, 1], to: [-1, -1] } ],
			},
		],
	},
});
