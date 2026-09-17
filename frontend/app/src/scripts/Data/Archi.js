import { initLocalBoard, localMatchState, 
		 localBoard, localPlayers,
		 startLocalMatchState, localInfo,
		 currentPlayer, emptyCapturedPieces, 
		 debug, isMatchLoaded}					from "./Variables.js";
import { checkEndTurn, hasPlayerBoostedPiece, 
		 checkUpgrade, setVictory, 
		 assignLastMoveSquares,
		 spreadDemocracy, 
		 isDragInvalidated}						from "./utils/ArchiUtils.js";
import { beginPendingAbility } 					from "../Helper/abilityMovement.js";
import { clearHistory } 						from "./History.js";
import { clearMessages } 						from "./ChatBox.js";
import 												 "./SocketListen.js"

//SECTION - INIT FUNCTIONS
/**
 * Verifica e approva il payload di partita ricevuto dal server e lo normalizza nella forma
 * { p1, p2, p3, p4, board? } che verra' salvata in localMatchState.
 *
 * Le partite a 2 giocatori arrivano senza p3/p4: i due slot mancanti escono a null.
 * La board puo' mancare solo durante la seconda parte del turno (localInfo.secondTurn),
 * quando il server manda il solo aggiornamento dei giocatori: in quel caso la chiave
 * board non viene inclusa nel risultato, cosi' chi chiama sa di non doverla aggiornare.
 *
 * I campi extra del raw (id, team, victory, ...) non vengono copiati: chi chiama
 * li legge direttamente dal payload originale.
 *
 * @param	{Object}	rawJson		Payload grezzo del match arrivato dal server
 * @returns	{{p1: Object, p2: Object, p3: Object|null, p4: Object|null, board: Object}}
 *			Stato di partita validato e normalizzato
 * @throws	{Error}		Se il root non e' un oggetto, se board non e' una mappa di
 *						caselle, o se mancano i giocatori attesi per il tipo di partita
 */
function  validateReceivedMatch(rawJson)
{
	if (!rawJson || typeof rawJson !== "object" || Array.isArray(rawJson))
		throw new Error("Payload non valido: root deve essere un oggetto.");

	const	has_p1 = Object.prototype.hasOwnProperty.call(rawJson, "p1"),
			has_p2 = Object.prototype.hasOwnProperty.call(rawJson, "p2"),
			has_p3 = Object.prototype.hasOwnProperty.call(rawJson, "p3"),
			has_p4 = Object.prototype.hasOwnProperty.call(rawJson, "p4"),
			has_board = Object.prototype.hasOwnProperty.call(rawJson, "board");

	if (has_board && (!rawJson.board || typeof rawJson.board !== "object" || Array.isArray(rawJson.board)))
		throw new Error("[validateReceivedMatch]: Payload non valido: board deve essere un oggetto mappa.");

	if (!has_p3 && !has_p4)
	{
		if ((!has_p1 || !has_p2 || (!has_board && !localInfo.secondTurn)))
			throw new Error("[validateReceivedMatch]: 2 Players: Payload non valido: servono players e board.");
		if (has_board)
			return { p1: rawJson.p1, p2: rawJson.p2, p3: null, p4: null, board: rawJson.board };
		else
			return { p1: rawJson.p1, p2: rawJson.p2, p3: null, p4: null };
	}
	else
	{
		if (!has_p1 || !has_p2 || !has_p3 || !has_p4 || (!has_board && !localInfo.secondTurn))
			throw new Error("[validateReceivedMatch]: Payload non valido: servono players e board.");
		if (has_board)
			return { p1: rawJson.p1, p2: rawJson.p2, p3: rawJson.p3, p4: rawJson.p4, board: rawJson.board };
		else
			return { p1: rawJson.p1, p2: rawJson.p2, p3: rawJson.p3, p4: rawJson.p4	};
	}
}

/**
 * Costruisce da zero lo stato locale di una partita nuova: e' il punto d'ingresso
 * chiamato da typeInit() quando il socket annuncia un match appena creato.
 *
 * matchId e myTeam finiscono anche in sessionStorage per
 * sopravvivere a un refresh della pagina, dove li recupera reloadMatchState().
 *
 * @param	{Object}	raw			Payload del match dal server: i giocatori e la board
 *									piu' i campi id, team e victory
 * @returns	{void}
 */
export function initLocalMatchState(raw)
{
	try
	{
		const validated = validateReceivedMatch(raw);
		startLocalMatchState(validated);
	
		initLocalBoard(localMatchState?.board);
		initLocalPlayers();
		spreadDemocracy();
	
		localInfo.matchId = raw.id;
		localInfo.myTeam = raw.team;
		debug("il mio team :", localInfo.myTeam);
		setVictory(raw.victory, false);
		localInfo.matchStarted = false;	//il timer non parte finché il bianco non ha mosso
	
		if (localInfo.myTeam)
			sessionStorage.setItem("match:myTeam", localInfo.myTeam);
		if (raw.id !== undefined && raw.id !== null)
			sessionStorage.setItem("match:id", raw.id);
	}
	catch(err) { debug("[initLocalMatchState]: Errore di init del Match!" + err); }
}

/**
 * Aggiorna la mappa reattiva localPlayers leggendo i giocatori da localMatchState
 * già validato in precedenza
 *
 * Parte da una clear(): la mappa viene ricostruita da zero, mai aggiornata a pezzi.
 * Gli slot a null (p3 e p4 nelle partite 1v1) vengono saltati, quindi localPlayers
 * contiene solo i giocatori realmente in campo e la sua size dice se il match e' a 2
 * o a 4. Le chiavi restano le sigle "p1".."p4", non i nomi dei giocatori.
 *
 * hasPlayerBoostedPiece() ricalcola localInfo.hasBoostedPiece guardando se il giocatore
 * di turno ha almeno un pezzo potenziato in board.
 *
 * @returns	{void}
 * @throws	{Error}		Se uno slot giocatore atteso e' assente da localMatchState
 *						o non e' un oggetto
 */
function initLocalPlayers()
{
	const players_list = ["p1", "p2", "p3", "p4"];

	localPlayers.clear();
	players_list.forEach((player) => {
		const has = Object.prototype.hasOwnProperty.call(localMatchState, player);
		const wrong_type = typeof localMatchState[player] !== "object";

		if (localMatchState[player] === null) { return; }
		if (!has)		{ throw new Error(`[initLocalPlayers]: Player ${player} object absent!`); }
		if (wrong_type)	{ throw new Error(`[initLocalPlayers]: Player ${player} a wrong type!`); }

		localPlayers.set(player, localMatchState[player]);
	});

	hasPlayerBoostedPiece(currentPlayer());
}
//!SECTION

//SECTION - UPDATE FUNCTIONS

/**
 * aggiorna sul posto le caselle e i giocatori esistenti, cosi' la
 * reattivita' di Vue ridisegna solo quello che e' cambiato davvero.
 *
 * L'oggetto outcome serve a playMoveAudio() per scegliere quale suono sparare
 *
 * Ignoro l'update se lo stato locale è vuoto con una guardia
 * tipo un messaggio arriva prima dell'init o dopo un cambio pagina
 *
 * si azzera il drag, si aggiorna l'esito, si guarda se il turno e' finito PRIMA di sovrascrivere
 * localMatchState ,* poi si aggiornano board e giocatori.
 *
 * @param	{Object}	nextRaw		Payload di aggiornamento dal server: i giocatori, la
 *									board e victory
 * @returns	{{moved: boolean, captured: boolean, transformed: boolean, profit: boolean}|undefined} info per audio
 */
export function updateMatchState(nextRaw)
{
	const outcome = { moved: false, captured: false, transformed: false, profit: false };
	if (!isMatchLoaded())
	{
		debug("[updateMatchState]: stato locale vuoto, update ignorato");
		return;
	}
	try 
	{
		const validated = validateReceivedMatch(nextRaw);
		
		if (isDragInvalidated(validated))
			localInfo.drag = null;
		
		setVictory(nextRaw.victory);
		checkEndTurn(validated);
		startLocalMatchState(validated);
		if (validated.board)
			updateLocalBoard(validated, outcome);
		checkUpgrade();
		updateLocalPlayers(validated, outcome);
	} 
	catch(err) { debug("[updateLocalMatchState]: Errore di update del Match!\n" + err); }
	return (outcome);
}

/**
 * aggiorna localBoard con il payload pre validato e riporta in outcome cosa e' cambiato.
 *
 * Aggiorna le caselle sul posto invece di sostituirle: l'oggetto Square resta lo stesso,
 * si rimpiazzano solo piece, targetZones e boostedTargetZones. Serve a non perdere i
 * flag di interfaccia che vivono solo sul client (highlight, selected, inCheck, clicked)
 * e a non rompere i riferimenti reattivi che Vue ha gia' agganciato alle caselle.
 * Ignoro tutto ciò di cui non ho bisogno.
 *
 * Il payload è un JSON, quindi le zone di movimento sono array e oggetti: qui le riporto 
 * a Set e a Map di Set.
 *
 * Confrontanto ogni square con il suo precedente aggiorno le catture in capturedP  
 * e le trasformazioni dei bastards.
 *
 * Le caselle toccate dalla mossa finiscono in localInfo.lastMovesSquares per l'highlight
 * dell'ultima mossa. 
 * Aggiorno matchstarted alla non prima mossa del bianco.
 *
 * @param	{Object}	changes		Payload scacchiea validato
 * @param	{{moved: boolean, captured: boolean, transformed: boolean}} outcome Info per audio
 * @returns	{void}
 * @throws	{Error}		Se la board manca o non e' una mappa di caselle
 */
function updateLocalBoard(changes, outcome)
{
	if (!isMatchLoaded())
	{
		debug("[updateLocalBoard]: stato locale vuoto, update ignorato");
		return;
	}
	const board = changes.board;

	if (!board) { throw new Error("[updateLocalBoard]: Board expected but no object received!"); }
	if (typeof board !== "object" || Array.isArray(board))
		throw new Error("[updateLocalBoard]: Board format not valid!");

	const movedSquares = new Set();

	Object.entries(board).forEach(([squareKey, newSquare]) => {
		if (localBoard.has(squareKey))
		{
			newSquare.targetZones = new Set(Array.isArray(newSquare.targetZones) ? newSquare.targetZones : []);
			
			newSquare.boostedTargetZones = new Map(
				Object.entries(newSquare.boostedTargetZones || {}).map(
					([key, value]) => [key, new Set(Array.isArray(value) ? value : [])]
				)
			);
			const oldSquare = localBoard.get(squareKey);
			const oldPiece	= oldSquare?.piece;
			const newPiece	= newSquare.piece;
			
			assignLastMoveSquares(oldSquare, newSquare, movedSquares);

			oldSquare.piece = newSquare.piece;
			oldSquare.targetZones = newSquare.targetZones;
			oldSquare.boostedTargetZones = newSquare.boostedTargetZones;


			if (oldPiece && newPiece && oldPiece.team !== newPiece.team)
			{
				localInfo.capturedP[newPiece.team][oldPiece.type] += 1;
				outcome.captured = true;
			}
			else if (oldPiece && newPiece && oldPiece.type !== newPiece.type)
				outcome.transformed = true;
		}
	});
	if (movedSquares.size > 0)
	{
		localInfo.lastMovesSquares = movedSquares;
		localInfo.matchStarted = true;
		outcome.moved = true;
	}
}

/**
 * Aggiorna i giocatori in localPlayers coi dati del payload validato.
 *
 * Lo spread {...vecchio, ...nuovo} mergia le modifiche tra stato locale e payload
 * Alcuni
 *
 * @param	{Object}	changes		Payload validato con i cambiamenti
 * @param	{{profit: boolean}}	outcome	Info per audio, qui si scrive solo profit
 * @returns	{void}
 * @throws	{Error}		Se uno slot giocatore presente nel payload non e' un oggetto
 */
function updateLocalPlayers(changes, outcome)
{
	if (!isMatchLoaded())
	{
		debug("[updateLocalPlayers]: stato locale vuoto, update ignorato");
		return;
	}
	const players_list = ["p1", "p2", "p3", "p4"];

	players_list.forEach((player) => {
		const has = Object.prototype.hasOwnProperty.call(changes, player);
		const wrong_type = typeof changes[player] !== "object";

		if (!has || changes[player] === null)
			return;
		if (wrong_type) 
			throw new Error(`[updateLocalPlayers]: Player ${player} wrong type!`);

		const oldPoints	= localPlayers.get(player)?.nPoints;
		const merged	= {...localPlayers.get(player), ...changes[player]};

		if (merged.team === localInfo.myTeam && merged.nPoints > oldPoints)
			outcome.profit = true;
		localPlayers.set(player, merged);
	});

	hasPlayerBoostedPiece(currentPlayer());
}
//!SECTION

/**
 * Ripopola localMatchState con i dati di una partita in cui partecipa lo user dopo 
 * un refresh della pagina.
 *
 * Dopo un F5 la memoria del browser e' vuota: myTeam ricade su sessionStorage se il
 * payload non lo porta, e matchId viene riletto solo da li'. I due valori vanno riscritti
 * dopo initLocalBoard(), che al suo interno passa da clearMatchStorage() e li cancella.
 * 
 * @param	{Object}	raw			Payload di reload: giocatori e board piu' team, victory,
 *									secondMove, pending, aiGame, usedBoost e oldBoosted
 * @returns	{void}
 */
export function reloadMatchState(raw)
{
	try
	{
		const validated = validateReceivedMatch(raw);
		startLocalMatchState(validated);
	
		initLocalBoard(localMatchState?.board);
		initLocalPlayers();
		setVictory(raw.victory, false);
	
		localInfo.myTeam			= raw.team ?? sessionStorage.getItem("match:myTeam");	
		localInfo.matchId			= sessionStorage.getItem("match:id");
		localInfo.matchStarted		= true;
		localInfo.secondTurn		= raw.secondMove ?? false;
		localInfo.drawOffer 		= raw.pending === true ? true : false;
		localInfo.aiGame			= raw.aiGame;
	
		restorePendingAbility(raw);
	
		if (localInfo.myTeam)
			sessionStorage.setItem("match:myTeam", localInfo.myTeam);
	}
	catch (err) { debug("[reloadMatchState]: Errore di update del Match!\n" + err); }

}

/**
 * Gestione del reload quando viene fatto nel bel mezzo di un secondTurn quando 
 * la seconda mossa non è ancora stata fatta
 *
 * Leggendo usedBoost dal payload si capisce se il pezzo ha utilizzato l'abilità oppure
 * l'ha lasciata armata ed è in attesa.
 * Leggendo la mappa oldBoost so quali zone vanno highlightate con useBilityBool nel caso
 * il pezzo abbia l'abilità armata.
 * Il Bastards e' l'eccezione: passa con anchorId a null, cosi' la sua casella non viene
 * marcata con useAbilityBool dato che la sua seconda mossa parte da un altro pezzo e non
 * da se stesso
 * 
 * Se anche solo una delle info manca resetto lo stado dell'uso abilità a zero per sicurezza.
 *
 * @param	{Object}	raw			Payload di reload, da cui si leggono usedBoost e oldBoosted
 * @returns	{void}
 */
function restorePendingAbility(raw)
{
	const anchorId	= raw.usedBoost || null;
	const zones		= Object.values(raw.oldBoosted || {})[0];
	const pieceType	= anchorId ? localBoard.get(anchorId)?.piece?.type : null;

	if (!anchorId || !pieceType || !Array.isArray(zones) || zones.length === 0)
	{
		localInfo.usingAbility		= "";
		localInfo.secondMove		= false;
		localInfo.savedBoostedMap 	= null;
		return;
	}

	beginPendingAbility({
		pieceType,
		zones:		new Set(zones),
		anchorId:	pieceType === "Bastards" ? null : anchorId,
		focusId:	anchorId,
	})
}

/**
 * Reset totale delle variabili locali legate ad una partita in corso
 *
 * @returns	{void}
 */
export function clearMatchStorage()
{
	sessionStorage.removeItem("match:id");
	sessionStorage.removeItem("match:myTeam");
	localInfo.capturedP = { 
		white: emptyCapturedPieces(), 
		black: emptyCapturedPieces() 
	};

	clearHistory();
	clearMessages();
}
