import { updateMatchState, reloadMatchState, 
		 initLocalMatchState }							from "./Archi.js";
import { localInfo,  debug, isMatchLoaded, 
		 getCheckSquares }								from "./Variables.js";
import { stopBlinking, handleErrors, playMoveAudio }	from "./utils/socketListenUtils.js";
import { clearHighlight, refreshDragHighlight, 
		 setCheckSquare }								from "../Events/utils/HighlightUtils.js";
import { spreadDemocracy, setVictory } 					from "./utils/ArchiUtils.js";
import { pushTurn, reloadHistory } 						from "./History.js";
import { pushMessage } 									from "./ChatBox.js";
import { playAudio } 									from "../Helper/generalUtils.js";
import router 											from "@/router/index.js";

/**
 * Aggancia al socket il listener sull'evento "game" su cui arrivano tutti gli aggiornamenti
 * relativi alla partiuta
 *
 * L'ordine dei controlli prima dello switch conta:
 * - i messaggi di chat escono subito, non sono eventi di gioco e non devono fermare il
 *   lampeggio dello scacco ne' passare dal controllo di stato
 * - stopBlinking() spegne il lampeggio precedente: qualunque cosa sia arrivata, la
 *   segnalazione di prima e' vecchia
 * - un log diverso da 200 e' un rifiuto del server e finisce in handleErrors(), mai negli
 *   handler di aggiornamento
 * - la presenza di un id, o il tipo init, vuol dire partita nuova: va riconosciuta prima
 *   dello switch, altrimenti il default la tratterebbe come una mossa
 *
 * Nello switch il default non e' un caso di scarto ma la strada normale: le mosse arrivano
 * con tipi diversi (move, moveboost, trans...) e finiscono tutte in typeMoveUpdate().
 *
 * @param	{Object}	socket		Il socket di gioco gia' connesso
 * @returns	{void}
 */
export function listenGameSocket(socket)
{
	socket.on("game", (raw) => {
		debug("[socketgame] ricevuta risposta di tipo:", raw.type, raw);

		if (raw.type === "msg")
			return (pushMessage(raw.msg, raw.author));
		stopBlinking();
		if (raw.log?.status != 200)
			return (handleErrors(raw));
		if (raw.id !== undefined || raw.type === "init")
			return (typeInit(raw));
		if (!raw.type)
			return;

		switch (raw.type)
		{
			case "reload":			typeReload(raw);		break;
			case "giveup":			typeGiveUp(raw);		break;
			case "draw":			typeDraw(raw);			break;
			case "timeout":			typeTimeout(raw);		break;
			case "simulate_boost":	typeSimulateBoost(raw);	break;
			case "history":			typeHistory(raw);		break;
			default:				typeMoveUpdate(raw);	break;
		}
	});
}

/**
 * Entra in una partita appena creata: monta lo stato locale, suona l'ingresso e porta il
 * giocatore sulla pagina di gioco.
 *
 * La rotta si sceglie dalla presenza di p3: con quattro giocatori serve la board a croce,
 * altrimenti quella classica peccato che la partia classica sia l'unica variante che esiste HEHE. 
 * Si usa replace() e non push() perche' tornare indietro alla pagina da cui
 *  si aspettava il match non avrebbe senso a partita iniziata per via dei controlli che faccio
 * che ti ributterebbero diretto sulla pagina di gioco, darebbe come l'impressione che le
 * frecce non funzionino.
 *
 * @param	{Object}	raw			Payload della partita nuova
 * @returns	{void}
 */
function typeInit(raw)
{
	debug("[socket game]: New game trovato!");
	initLocalMatchState(raw);
	playAudio("begin");
	router.replace({name: raw.p3 ? "GameFour" : "game" });
}

/**
 * Chiude la partita dopo un abbandono, sullo schermo di entrambi i giocatori.
 *
 * Chi ha abbandonato si riconosce dal confronto fra la squadra vincitrice e la propria: lo
 * stesso payload arriva a tutti, e ognuno ne ricava la propria parte.
 *
 * @param	{Object}	raw			Payload di abbandono, con la squadra vincitrice
 * @returns	{void}
 */
function typeGiveUp(raw)
{
	debug("[giveup]: ricevuto giveup");
	const iWon = raw.victory === localInfo.myTeam;
	const iGaveUp = !iWon;

	setVictory(raw.victory, iWon);
	if (iGaveUp)
		playAudio("giveup");
	spreadDemocracy();
}

/**
 * Gestisce il pareggio, dall'offerta alla risposta.
 *
 * Tre strade: 
 * 	Se il payload porta un esito la trattativa e' finita con un si'
 *  Se invece porta un'offerta e questo client e' quello che l'ha mandata dato
 *  che l'offerta viene mandata a tutti isocket nella room della partita
 * In tutti gli altri casi l'offerta arriva dall'avversario, oppure e' stata ritirata.
 *
 * Chi legge drawOffer sono i bottoni di partita, per sapere se mostrare "attendi risposta"
 * o "accetta / rifiuta".
 *
 * @param	{Object}	raw			Payload di pareggio: draw per l'offerta, victory per l'esito
 * @returns	{void}
 */
function typeDraw(raw)
{
	if (raw.victory)
	{
		setVictory(raw.victory);
		spreadDemocracy();
		return;
	}
	if (raw.draw === true && localInfo.drawOffer === 'sent')
		return (playAudio("askdraw"));
	localInfo.drawOffer = (raw.draw === true) ? "received" : null;
	if (localInfo.drawOffer === "received")
		playAudio("recdraw");
}

/**
 * Rimette il giocatore dentro una partita gia' in corso dopo un refresh: stato, cronologia
 * delle mosse e caselle sotto scacco.
 *
 * Se lo stato locale c'e' gia' il payload viene lasciato cadere, può succedere 
 * e l'ho messo come protezione. 
 *
 * @param	{Object}	raw			Payload di reload, con partita, cronologia e stato di scacco
 * @returns	{void}
 */
function typeReload(raw)
{
	if (isMatchLoaded())
	{
		debug("[reload]: state già presente nel mounted");
		return;
	}
	reloadMatchState(raw);
	typeHistory(raw);
	setCheckSquare(getCheckSquares(raw));
}

/**
 * Chiude la partita quando scade il tempo di un giocatore.
 *
 * L'esito lo decide il server e arriva gia' pronto indicato nella variabile victory 
 * del payload.
 *
 * @param	{Object}	raw			Payload di timeout, con la squadra vincitrice se c'e'
 * @returns	{void}
 */
function typeTimeout(raw)
{
	debug("[socket game -> timeout]: tempo scaduto, victory =", raw.victory);
	if (raw.victory)
		setVictory(raw.victory);
	else
		debug("[socket game -> timeout]: come mai victory è vuoto?", raw.victory);
	spreadDemocracy();
}

//futuro sviluppo, va convertito da ack a qui nel listen
function typeSimulateBoost(raw)
{
	debug("{socket game [simu_boost]}: payload richiesta simulate boots");
	if (raw.log.status !== 200)
	{
		playAudio("checkboost");
		debug("ma non è possibile");
	}
}

/**
 * Ricezione dei vari turni da displayare nella history che seguono il formato
 * stabilito di un array in cui buttare ogni mossa con un push.
 * I turni derivano dal sistema di history del backend che si aggiorna ad ogni mossa fattta
 * 
 * Dato che questa funzione viene chiamata sia nel caso di un push che nel caso di un
 * reload della history la funzione gestisce entrambi i casi basandosi sul type del
 * parametro passato
 *
 * @param	{Object}	raw			Payload con il campo history, array di turni o turno singolo
 * @returns	{void}
 */
function typeHistory(raw)
{
	debug("{socket game [history]}: ricevuti turni");
	if (Array.isArray(raw.history))
		reloadHistory(raw.history);
	else if (raw.history)
		pushTurn(raw.history);
	else
		debug("{socket game [history]}: nessun turno nel payload", raw);
}

/**
 * Gestione del default del switch case grosso, qui passano tutte le risposte che necessitano
 * solo di un update della board.
 * Non ha nomi specifici dato che le mosse hanno type vari in base a mosse boost e non
 *
 * @param	{Object}	raw			Payload di update della board
 * @returns	{void}
 */
function typeMoveUpdate(raw)
{
	const outcome = updateMatchState(raw);

	if (raw.history)
		pushTurn(raw.history);
	clearHighlight();
	refreshDragHighlight();

	setCheckSquare(getCheckSquares(raw));
	if (localInfo.victory)
		return;
	playMoveAudio(raw, outcome, getCheckSquares(raw));
}