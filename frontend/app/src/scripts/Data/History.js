import { reactive } from "vue";

// Questo deve essere l'oggetto che viene restituito come risposta a chiammata su evento history
// rappresenta l'ultimo turno che è stato completato.
// In caso di reload vorrei che il payload di history rappresentasse tutta la partita suddivisa
// in turni così. 
// {
//   "turn": 12, //numero del turno
//   "team": "white", //colore
//   "time": 284, //tempo che è durato il turno
//   "actions": [ //azioni presenti durante il turno in ordine di esecuzione. mossa, (seconda mossa), potenziamento oppure solo giveup, draw, lost.
// 	{
// 		"type": "move",
// 		"counter": 23, 
// 		"piece": "Bastards",
// 		"from": "a4", "to": "c4",
// 		"transformed_into": "Valkirya",
// 		"captured_piece": "Bastards",
// 	},
// 	// { seconda mossa se esiste },
//     { 
// 		"type": "boost",
// 		"counter": 25,
// 		"piece": "Champion",
//     	"from": "f4", "to": "",
// 	}
//   ]
// }

/** @typedef {import("../Helper/Historyutils.js").TurnVM}	TurnVM */

/**
 * La cronologia della partita, un elemento per turno e sempre in ordine di turno crescente.
 * Reattiva: il pannello della history si ridisegna da solo a ogni turno che entra.
 * @type {Array<TurnVM>}
 */
export const localHistory = reactive([]);

/**
 * Inserisce un turno nella cronologia tenendola in ordine, qualunque cosa arrivi.
 *
 * Tre casi:
 * 	Il turno esiste gia' e viene sostituito: capita perche' un turno si aggiorna
 * 	 mentre e' in corso, prima la mossa e poi il potenziamento. 
 * 	E' nuovo e piu' recente di tutti, e allora si accoda. 
 * 	Oppure e' arrivato in ritardo, e va infilato al suo posto 
 * 	 prima del primo turno con numero maggiore.
 *
 * @param	{*}		raw			Turno grezzo dal server
 * @returns	{boolean}	true se il turno e' entrato, false se il payload era da scartare
 */
export function pushTurn(raw)
{
	const turn = normalizeTurn(raw);

	if (!turn)
		return (false);
	const i					= localHistory.findIndex(t => t.turn === turn.turn);
	const empty				= !localHistory.length;
	const newTurnIsToPush	= turn.turn > localHistory[localHistory.length - 1]?.turn;
	if (i !== -1)
		localHistory[i] = turn;
	else if ( empty || newTurnIsToPush )
		localHistory.push(turn);
	else
		localHistory.splice(localHistory.findIndex(t => t.turn > turn.turn), 0, turn);

	return (true);
}

/**
 * Rifa la cronologia da zero con la partita intera, come dopo un refresh.
 *
 * Svuota prima di riempire: senza, i turni si sommerebbero a quelli gia' presenti. Ogni
 * turno passa comunque da pushTurn(), quindi validazione e ordinamento restano gli stessi.
 *
 * @param	{Array<*>}	list		I turni della partita, dal payload di reload
 * @returns	{void}
 */
export function reloadHistory(list)
{
	localHistory.splice(0);
	if (Array.isArray(list))
		list.forEach(pushTurn);
}

/** Svuota la cronologia. La chiama clearMatchStorage() quando si lascia o si cambia partita. */
export function clearHistory()
{
	localHistory.splice(0);
}

/**
 * Fa passare un turno solo se e' disegnabile, altrimenti lo scarta.
 *
 * Numero del turno e lista delle azioni sono necessarie e non consider il turno
 * se mancano scrivendolo in console. 
 * Per la squadra e durata invece mi arrangio, cosi' un campo mancante non lascia un buco a schermo.
 *
 * I campi delle azioni arrivano gia' nella forma attesa dal pannello e vengono lasciati
 * come sono: il server li riempie sempre tutti, con stringa vuota dove il dato non
 * si applica.
 *
 * @param	{*}	raw			Turno grezzo dal server
 * @returns	{TurnVM|null}	Il turno normalizzato, null se il payload non e' utilizzabile
 */
function normalizeTurn(raw)
{
	if (!raw || typeof raw !== "object" || !Number.isInteger(raw.turn) || !Array.isArray(raw.actions))
		return (console.warn("[History]: turno scartato, payload non valido", raw), null);

	return ({
		turn:		raw.turn,
		team:		raw.team ?? "???",
		time:		Number(raw.time) || 0,
		actions:	raw.actions.filter(a => a && a.type),
	});
}
