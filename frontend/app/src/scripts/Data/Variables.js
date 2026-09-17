// SECTION - LE VARIABILI GLOBALI
import { boardConverter, getLocalPlayers }	from "../Helper/RenderUtils.js";
import { reactive, ref }					from "vue";
import { clearMatchStorage } 				from "./Archi.js";

/**
 * @typedef {Object} Piece
 * @property {string}  type           Tipo del pezzo (es. "King", "Bastards", ...)
 * @property {string}  team           Squadra del pezzo (es. "white" | "black")
 * @property {boolean} isBoostedBool  Se il pezzo è potenziato
 * @property {number}  price          Costo del potenziamento
 * @property {boolean} dragging       Se il pezzo è in trascinamento
 */

/**
 * Una casella della scacchiera vista dal client.
 *
 * Tiene insieme due cose di natura diversa. Da una parte i dati che arrivano dal server e
 * che a ogni update vengono rimpiazzati: il pezzo che ci sta sopra e le zone raggiungibili,
 * normali e potenziate. Dall'altra i flag di interfaccia, che il server non conosce e non
 * manda mai, e che descrivono solo cosa sta facendo il giocatore davanti allo schermo:
 *
 * - highlight e boostedHighlight: la casella e' raggiungibile dal pezzo selezionato, con
 *   il movimento normale o con quello potenziato
 * - useAbilityBool: la casella e' l'ancora di un'abilita' armata
 * - clicked: e' la casella appena cliccata
 * - inCheck e selected: lavorano in coppia per il lampeggio delle caselle sotto scacco,
 *   il template accende il colore quando i due valori sono diversi
 *
 * Questa doppia natura e' il motivo per cui updateLocalBoard() aggiorna le caselle sul
 * posto invece di ricrearle: sostituire l'oggetto butterebbe via i flag locali.
 *
 * targetZones e boostedTargetZones diventano Set e Map perche' il resto del codice ci
 * interroga con .has(); dal payload arriverebbero come array e oggetti.
 */
export class Square {
	/**
	 * @param {string}              id						coordinate della casella nella scacchiera seconod notazine scacchistica
	 * @param {Piece|null}          piece					oggetto piece con tutte le info del pezzo
	 * @param {Iterable<string>}    [targetZones]			tutte le caselle che il pezzo in questa casella sta minacciando
	 * @param {Iterable<any>}       [boostedTargetZones]	tutte le caselle che il pezzo in questa casella minaccia quando il pezzo è boostato
	 */
	constructor(id, piece, targetZones = [], boostedTargetZones = {}) {
		this.id 				= id;
		this.piece 				= piece;
		this.highlight			= false;
		this.boostedHighlight	= false;
		this.useAbilityBool		= false;	
		this.selected			= false;
		this.inCheck			= false;
		this.clicked			= false;
		this.targetZones		= new Set(targetZones);
		this.boostedTargetZones	= new Map(boostedTargetZones);
	}
}

/**
 * @typedef {Object} DragInfo
 * @property {string}  src         	Path dell'immagine del pezzo trascinato
 * @property {number}  size        	Lato in px del pezzo trascinato
 * @property {number}  x           	Coordinata X del cursore
 * @property {number}  y           	Coordinata Y del cursore
 * @property {string}  from        	Id della casella di partenza
 * @property {boolean} [hideSource] Se nascondere il pezzo nella casella di partenza
 * @property {boolean} boosted		Se il pezzo draggato è boostato
 * @property {boolean} armed		Se il pezzo draggato sta usanto abilità
 */

/**
 * @typedef {Object} CapturedCount Contatore dei pezzi catturati per il display sotto il nome
 * @property {number} Bastards
 * @property {number} Minotaurus
 * @property {number} Valkirya
 * @property {number} Jester
 * @property {number} Champion
 */

/**
 * @property {string|null}						clickedId			Id della casella cliccata adesso
 * @property {string|null}						lastClickedId		Id della casella cliccata in precedenza
 * @property {boolean}							secondTurn			Se il giocatore ha ancora la seconda parte del turno
 * @property {boolean}							secondMove			Se la mossa in corso è la seconda del turno
 * @property {string}							usingAbility		Tipo del pezzo che sta usando l'abilità ("" = nessuna)
 * @property {boolean}							hasBoostedPiece		Se il giocatore di turno ha almeno un pezzo già potenziato in board
 * @property {Map<string, Set<string>>|null}	savedBoostedMap		Zone di movimento potenziato salvate per la seconda mossa
 * @property {string|null}						state				Stato della partita lato client (es. "classic" | "reload")
 * @property {DragInfo|null}					drag				Info del pezzo attualmente trascinato
 * @property {string|null}						goatId				Id della casella del Bastards da promuovere
 * @property {string|null}						matchId				Id della partita in corso
 * @property {string|null}						myTeam				Squadra del giocatore locale (es. "white" | "black")
 * @property {string|null}						victory				Squadra vincitrice, null se la partita è in corso
 * @property {string|null}						pending				Variabile utilizzata nel template di actionbuttons per richiesta di giveup o pareggio
 * @property {"sent"|"received"|null}			drawOffer			Trattativa sul pareggio: 'sent' l'ho offerto io, 'received' me l'ha offerto l'avversario
 * @property {boolean}							matchStarted 		Se la partita è iniziata (il timer parte alla prima mossa del bianco)
 * @property {Set<string>}						lastMovesSquares	Id delle caselle coinvolte nell'ultima mossa
 * @property {Function|null}					blinking 			Callback per fermare il lampeggio delle caselle sotto scacco
 * @property {boolean}							aiGame				Flag utilizzata durante il redirect su playpage per sapere se si vuole fare una partita con l'ai
 * @property {Object<string, CapturedCount>} 	capturedP			Pezzi catturati, contati per squadra e per tipo
 */
class metaInfo {
	constructor() {
		this.clickedId			= null;
		this.lastClickedId		= null;
		this.secondTurn			= false;
		this.secondMove			= false;
		this.usingAbility		= "";
		this.hasBoostedPiece	= false;
		this.savedBoostedMap	= null;
		this.drag				= null;
		this.goatId				= null;
		this.matchId			= null;
		this.myTeam				= null;
		this.victory			= null;
		this.pending			= null;
		this.drawOffer			= null;
		this.matchStarted		= false;
		this.lastMovesSquares	= new Set();
		this.blinking			= null;
		this.aiGame				= false;
		this.capturedP			= {	white: { Bastards: 0, Minotaurus: 0, Valkirya: 0, Jester: 0, Champion: 0},
									black: { Bastards: 0, Minotaurus: 0, Valkirya: 0, Jester: 0, Champion: 0} };
	}
}

/**
 * Tutto cio' che riguarda l'interazione del giocatore con la partita: cosa ha cliccato,
 * cosa sta trascinando, quale abilita' ha armato, a che punto e' il turno. Reattiva, quindi
 * i componenti si ridisegnano da soli quando cambia. spreadDemocracy() e' la funzione che
 * la riporta allo stato di riposo.
 * @type {metaInfo}
 */
export let localInfo = reactive(new metaInfo());

/**
 * Il pezzo aperto nel codex, la schermata che ne mostra abilita' e movimenti. Vive fuori
 * dalla partita: e' consultabile anche senza un match in corso, per questo non sta dentro
 * localInfo. A null quando il codex e' chiuso.
 */
export const codexPiece = ref(null);

/**
 * L'ultimo payload di partita validato, cosi' come e' arrivato dal server. E' la sorgente
 * da cui vengono ricavate localBoard e localPlayers, e non va letta direttamente per
 * disegnare: serve come riferimento grezzo. Non e' reattiva, si sostituisce in blocco
 * passando da startLocalMatchState(). A null finche' non arriva la prima partita.
 */
export let localMatchState = null;

/**
 * La scacchiera: id della casella -> oggetto Square. E' la struttura su cui lavora tutto il
 * gioco, dal rendering al calcolo degli highlight.
 *
 * Viene riempita una volta sola da initLocalBoard(), che ne fissa la geometria; da li' in
 * poi gli update cambiano il contenuto delle caselle ma mai il loro insieme. Essendo
 * reattiva, toccare una singola casella basta a far ridisegnare quella casella.
 * @type {Map<string, Square>}
 */
export let localBoard = reactive(new Map());

/**
 * I giocatori della partita: sigla di slot ("p1".."p4") -> oggetto giocatore. Gli slot vuoti
 * non entrano affatto nella mappa, quindi la sua size dice se il match e' a due o a quattro.
 * Le chiavi restano le sigle e non i nomi, perche' e' lo slot a dire da che parte della
 * board si gioca.
 * @type {Map<string, Object>}
 */
export let localPlayers = reactive(new Map());

/** La board formattata per il template: righe e colonne nell'ordine in cui vanno disegnate. */
export const DOMBoard = () => boardConverter();

/** Il giocatore dello slot richiesto, nella forma che serve al template. */
export const DOMPlayer = (p) => getLocalPlayers(p);

/** Azzeratore del counter dei pezzi mangiati */
export const emptyCapturedPieces = () => ({Bastards: 0, Minotaurus: 0, Valkirya: 0, Jester: 0, Champion: 0}); 

/** L'oggetto del giocatore da client. */
export const myPlayer = () => [...localPlayers.values()].find(p => p.team === localInfo.myTeam) ?? null;

/** Tocca al giocatore di questo client. */
export const isMyTurn = () => myPlayer()?.isPlaying === true;

/** Checker se c'e` una partita caricata nello stato locale */
export const isMatchLoaded = () => !!localMatchState && localBoard.size > 0 && localPlayers.size > 0;

/** Il giocatore di turno, che sui client avversari NON coincide con myPlayer(). */
export const currentPlayer = () => [...localPlayers.values()].find(p => p.isPlaying === true) ?? null;

/** Checker se il giocatore del client ha i punti necessari per potenziare il pezzo passato come argomento. */
export const canAfford = (piece) => {
	const points = myPlayer()?.nPoints;
	return (typeof points === "number" && typeof piece?.price === "number" && points >= piece.price);
};

/** La casella ha un'abilita' armata: abilita' in corso, casella d'ancora e pezzo potenziato. */
export const isAbilityArmed = (square) => localInfo.usingAbility !== "" && square?.useAbilityBool === true && square?.piece?.isBoostedBool === true;

/** Funzione che ripopola il matchstate con lo state passato come argomento */
export function startLocalMatchState(newMatchState) {
	localMatchState = newMatchState;
}

/** Il payload segnala scacco o scaccomatto: si legge dalla maschera dei bit di eSpecialMoves. */
export const isCheck = (raw) => Boolean(Number(raw.mask) & CHECK_MASK);

/** Le caselle da far lampeggiare per lo scacco se il player fa una mossa invalida per via di uno scacco, null se il payload non ne segnala. */
export const getCheckSquares = (raw) => (isCheck(raw) && raw.spreadDEMOCRACY) ? raw.spreadDEMOCRACY : null;

/**
 * Costruisce localBoard da zero a partire dalla board del payload: una Square per casella,
 * con targetZones e boostedTargetZones riportate da array/oggetti a Set e Map di Set.
 *
 * @param	{Object}	boardData		La board grezza del payload, id casella -> dati casella
 * @returns	{void}
 * @throws	{Error}		Se localMatchState non e' ancora stato valorizzato
 */
export function initLocalBoard(boardData)
{
	if (!localMatchState)
		throw new Error("[initLocalBoard]: Match non inizializzato: chiama prima initLocalMatchState().");
	localBoard.clear();
	clearMatchStorage();
	localInfo.lastMovesSquares = new Set();
	if (boardData && typeof boardData === 'object') {
		Object.entries(boardData).forEach(([squareId, squareData]) => {

				const targetZones = new Set(Array.isArray(squareData.targetZones)
					? squareData.targetZones
					: [])
				
				const boostedTargetZones = new Map(
				  Object.entries(squareData.boostedTargetZones || {}).map(([key, value]) => {
					return [key, new Set(Array.isArray(value) ? value : [])];
				  })
				);

				const square = new Square(
				squareId,
				squareData.piece || null,
				targetZones,
				boostedTargetZones
			);
			localBoard.set(squareId, square);
		});
	}
}

/** Il div che contiene la scacchiera nel DOM, ancora per i listener globali di drag e click. */
export function getRootDiv() {
	return document.getElementById("board");
}

/** Colonne della scacchiera classica 8x8. */
export const FILES_TWO = ["a", "b", "c", "d", "e", "f", "g", "h"];

/** Colonne della scacchiera a quattro giocatori, 14x14. mai usate :.c */
export const FILES_FOUR = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n"];

/**
 * I quattro angoli 3x3 che la board a quattro giocatori non usa: esistono nella griglia ma
 * il template li rende invisibili, per dare alla scacchiera la forma a croce.
 */
export const HIDDEN = new Set( [ "a14", "b14", "c14", "a13", "b13", "c13", "a12", "b12", "c12",
				 				 "l14", "m14", "n14", "l13", "m13", "n13", "l12", "m12", "n12",
								 "a3", "b3", "c3", "a2", "b2", "c2", "a1", "b1", "c1",
								 "l3", "m3", "n3", "l2", "m2", "n2", "l1", "m1", "n1"] );

/**
 * Le flag di configurazione del client, lette a runtime da chi le usa.
 * AUDIO e DEBUG accendono suoni e log, AUDIOSET e PIECESET scelgono il set di suoni e di
 * skin fra quelli presenti in assets/, BOOSTMORPH fa cambiare aspetto ai pezzi potenziati,
 * le MAX_ mettono il tetto a numero e lunghezza dei messaggi di chat.
 */
export let MACRO = Object ({
	"AUDIO"			: true,
	"DEBUG"			: false,
	//"LOL" | "CLASSIC"
	"AUDIOSET"		: "CLASSIC",
	//"CLASSIC" | "FANCY" | "GOLD" | "HERALD" | "ROYAL" | "BOOSTED"
	"PIECESET"		: "FANCY",
	"BOOSTMORPH"	: true,
	"MAX_MESSAGES" 	: 100,
	"SERVER_AUTHOR" : "server",
	"MAX_MSG_LEN"	: 200,
});

/**
 * Le mosse speciali segnalate dal server in raw.mask. Sono bit e non valori: un solo numero
 * puo' portare piu' segnalazioni insieme, e si leggono con l'AND bit a bit, cub3d insegna.
 */
export const eSpecialMoves = Object.freeze({
	NONE: 0,
	CASTLING: 1 << 0,
	TRANSFIGURATION: 1 << 1,
	ENDGAME: 1 << 2,
	CHECK: 1 << 3,
	CHECKMATE: 1 << 4
});

/** I tipi di stanza richiedibili al matchmaking. */
export const eRoomType = Object.freeze({
	PRIVATE: 'private',
	FRIENDLY: 'friendly',
	RANKED: 'ranked',
	ARENA: 'arena',
});

/** La squadra scelta in fase di creazione partita, random compreso. */
export const eSide = Object.freeze({
	WHITE: 'white',
	BLACK: 'black',
	RANDOM: 'random',
});

/** Maschera per isCheck(): scacco e scaccomatto insieme, perche' entrambi vanno segnalati a schermo. */
export const CHECK_MASK = eSpecialMoves.CHECK | eSpecialMoves.CHECKMATE;

//Elenco finto di modelli AI: con USE_STUB attivo fetchAiModels lo restituisce
//senza interpellare il back, per lavorare sulla PlayPage a server spento.
export const AI_MODELS_STUB = ["giorno", "giovanna", "giorno giovanna", "bond", "james bond", "nonna"];
export const USE_STUB = false;

//roba da non suonare sull'ack, o lo suona soketListen
//sull'update della board, o non hanno un suono associato.
export const BOARD_AUDIO = new Set(["move", "armability", "trans", "giveup",
									"moveboost", "history", "simulate_boost"]);

//NOTE - Vite risolve gli asset solo staticamente: si importa tutta la cartella
//audios/ e si sceglie il set a runtime in base a MACRO.AUDIOSET.
const AUDIO_FILES = import.meta.glob("../../assets/audios/*/*.mp3", { eager: true, query: "?url", import: "default" });

/** Nome del set scelto in MACRO -> cartella che lo contiene sotto assets/audios/. */
const AUDIOSET_DIRS = Object.freeze({ "LOL": "LolSet", "CLASSIC": "ClassicSet" });

//Chiave logica del suono -> nome del file, uguale in ogni set.
const AUDIO_FILENAMES = Object.freeze({
	"move":			"moving",
	"boost":		"boost",
	"armability":	"useability",
	"check":		"check",
	"lost":			"lost",
	"victory":		"victory",
	"draw":			"draw",
	"trans":		"transform",
	"endturn":		"endturn",
	"giveup":		"giveup",
	"recdraw":		"recdraw",
	"askdraw":		"askdraw",
	"checkboost":	"checkboost",
	"clicked":		"clicked",
	"badmove":		"badmove",
	"capture":		"capture",
	"begin":		"begin",
	"tap":			"buttontap",
	"magico":		"magico",
	"profit":		"profit",
});

/**
 * Volume per suono, tarato a orecchio set per set: gli mp3 non sono normalizzati fra loro.
 * I suoni non elencati suonano a volume pieno.
 */
const AUDIO_VOLUMES = Object.freeze({
	"LolSet": {
		"move":			0.84,
		"boost":		1,
		"armability":	0.77,
		"check":		0.76,
		"lost":			1.0,
		"victory":		0.9,
		"draw":			0.89,
		"trans":		0.8,
		"endturn":		0.89,
		"giveup":		0.75,
		"recdraw":		0.9,
		"askdraw":		0.89,
		"checkboost":	0.79,
		"clicked":		0.79,
		"badmove":		0.95,
		"capture":		0.92,
		"profit":		0.5,
	},

	"ClassicSet": {
		"begin":		0.51,
		"boost":		0.35,
		"capture":		1.0,
		"draw":			0.57,
		"endturn":		0.25,
		"lost":			1.0,
		"move":			0.59,
		"profit":		0.5,
		"recdraw":		0.66,
		"tap":			0.5,
		"victory":		1.0,
	},
});

/** Url dell'mp3 dentro il set richiesto, undefined se quel set non ha quel file. */
function audioFile(dir, name)
{
	return (AUDIO_FILES[`../../assets/audios/${dir}/${name}.mp3`]);
}

/**
 * Mappa "<chiave>" -> { path, playing, volume } per il set richiesto.
 * I suoni che il set non ha ancora restano fuori dalla mappa: playAudio
 * li segnala in console e tira dritto, come faceva con i path vuoti.
 * @param {string} set
 */
function buildAudioPaths(set)
{
	const dir = AUDIOSET_DIRS[set], volumes = AUDIO_VOLUMES[dir] ?? {}, paths = {};

	if (!dir)
		return (Object.freeze(paths));
	for (const [key, name] of Object.entries(AUDIO_FILENAMES))
	{
		const path = audioFile(dir, name);

		if (path)
			paths[key] = { path, playing: true, volume: volumes[key] ?? 1 };
	}
	return (Object.freeze(paths));
}

/** I suoni pronti all'uso per il set scelto in MACRO. Calcolata una volta al caricamento del modulo. */
export const AUDIO_PATHS = buildAudioPaths(MACRO.AUDIOSET);

/** console.log che parla solo in sviluppo: in produzione MACRO.DEBUG lo zittisce. */
export function debug(...args)
{
	if (MACRO.DEBUG)
		console.log(...args);
}

/**
 * Risposta alla domanda "sono in partita?" posta al server. UNKNOWN non e' un no: e' la
 * richiesta fallita, e va trattata diversamente dal sapere che partita non ce n'e'.
 */
export const ePlaying = Object.freeze({ YES: "yes", NO: "no", UNKNOWN: "unknown" });

export const MAGIC_NAMES = /^(magico|giorgio)/i;

//NOTE - Vite risolve gli asset solo staticamente: si importa tutta la cartella
//pieces/ e si sceglie il set a runtime in base a MACRO.PIECESET.
const PIECE_IMAGES = import.meta.glob("../../assets/pieces/*/*/*.png",
									  { eager: true, query: "?url", import: "default" });

/** Tipo di pezzo del gioco -> nome del png, che segue i nomi degli scacchi classici. */
const PIECE_FILES = Object.freeze({
	"King"			: "king",
	"Champion"		: "queen",
	"Jester"		: "knight",
	"Valkirya"		: "bishop",
	"Minotaurus"	: "rook",
	"Bastards"		: "pawn",
});

/** Le sei squadre possibili: due nella partita classica, quattro in piu' in quella a quattro. */
const PIECE_TEAMS = Object.freeze(["white", "black", "yellow", "blue", "red", "green"]);

/** Set su cui ricadere: e' l'unico completo di tutte e sei le squadre. */
const PIECESET_FALLBACK = "classic";

/** Set delle skin potenziate, usato solo se MACRO.BOOSTMORPH e' attivo. */
const BOOSTED_SET = "boosted";

/** Skin potenziate. Senza fallback di proposito: dove mancano si ricade sul set scelto dall'utente. */
const BOOSTED_IMG_PATH = buildImgPaths(BOOSTED_SET, null);

/** Immagini del bot presenti nella cartella pPicturesBot*/
const BOT_IMAGES = import.meta.glob("../../assets/pPicturesBot/*.png", { eager:true, query:"?url", import: "default" });

/**
 * Getter delle immagini di profilo dei bot in base al nome passato come argomento
 * @param {string} profile 
 * @returns Bot image
 */
export function getBotImage(profile) {
	return (BOT_IMAGES[`../../assets/pPicturesBot/${profile}.png`] ?? null);
}

/** Url del png di un pezzo dentro un set, undefined se quella combinazione non esiste. */
function pieceImg(set, team, type)
{
	return (PIECE_IMAGES[`../../assets/pieces/${set}/${team}/${PIECE_FILES[type]}.png`]);
}

/**
 * Mappa "<team><Tipo>" -> url del png, per il set richiesto.
 * Solo classic ha tutti e sei i team: per gli altri set i team mancanti
 * ricadono sul set di fallback invece di restare senza immagine.
 * Con fallback null le caselle mancanti restano "": serve al set boosted,
 * che deve ricadere sul set scelto dall'utente e non su classic.
 * @param {string} set
 * @param {string|null} [fallback]
 */
function buildImgPaths(set, fallback = PIECESET_FALLBACK)
{
	const paths = {}, dir = String(set).toLowerCase();

	for (const team of PIECE_TEAMS)
		for (const type of Object.keys(PIECE_FILES))
			paths[team + type] = pieceImg(dir, team, type)
							  ?? (fallback ? pieceImg(fallback, team, type) : null)
							  ?? "";
	return (Object.freeze(paths));
}

/** Le skin pronte all'uso per il set scelto in MACRO. Calcolata una volta al caricamento del modulo. */
export const IMG_PATHS = buildImgPaths(MACRO.PIECESET);

/**
 * Url dello skin di un pezzo. Con boosted a true e MACRO.BOOSTMORPH attivo
 * usa il set potenziato, ricadendo sul set corrente dove quello manca.
 * Prende team e type sciolti perche' il codex mostra la skin boosted in base
 * al tab selezionato, non allo stato reale del pezzo in board.
 * @param {string} team
 * @param {string} type
 * @param {boolean} boosted
 */
export const skinSrc = (team, type, boosted) => {
	const key = team + type;

	if (MACRO.BOOSTMORPH && boosted)
		return (BOOSTED_IMG_PATH[key] || IMG_PATHS[key] || "");
	return (IMG_PATHS[key] || "");
}

/** Scorciatoia di skinSrc() quando si ha in mano il pezzo: stringa vuota se la casella e' libera. */
export const pieceSrc = (piece) => piece ? skinSrc(piece.team, piece.type, piece.isBoostedBool) : "";

/**
 * Le opzioni con cui si chiede una partita al matchmaking: formato, tipo di stanza e le
 * impostazioni di dettaglio. Costruita senza argomenti restituisce la richiesta di default,
 * un'amichevole 1v1.
 */
export class matchMakingOpt
{
	/**
	* //FIXME - controllare parametri di cosa ci viene dato
	* @param {matchMakingOpt} options
	*/
	constructor(options)
	{
		/** @type {string} */				this.matchType = "1v1";
		/** @type {string} */				this.roomType = "friendly";
		/** @type {MatchSettings | null} */	this.matchSettings = null;
		if (!options)
			return ;
		this.matchType = options.matchType;
		this.roomType = options.roomType;
		this.matchSettings = options.matchSettings;
	}
}

/**
 * Salva l'ultima richiesta di partita fatta da PlayPage, così quando schiaccio
 * rivincita faccio la syessa
 *
 * @param	{string}	event		Evento socket usato ("find_match" o "create_ai_match")
 * @param	{Object}	payload		Il payload mandato con l'evento
 * @returns	{void}
 */
export function saveMatchRequest(event, payload)
{
	sessionStorage.setItem("match:lastRequest", JSON.stringify({ event, payload }));
}

/**
 * Rilegge l'ultima richiesta salvata da saveMatchRequest().
 *
 * @returns	{{event: string, payload: Object} | null}	null se non ce n'e' o se e' illeggibile
 */
export function loadMatchRequest()
{
	try { return (JSON.parse(sessionStorage.getItem("match:lastRequest"))); }
	catch { return (null); }
}