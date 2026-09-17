import { computePosition, offset, flip, shift, autoUpdate }	from "@floating-ui/dom";
import { localBoard, localInfo, currentPlayer,
		 MAGIC_NAMES, AUDIO_PATHS }				 			from "../Variables";
import { clearHighlight }									from "@/scripts/Events/utils/HighlightUtils.js";
import { playAudio } 										from "@/scripts/Helper/generalUtils";
import { useAuthStore } 									from "@/stores/auth.st";

let stopAutoUpdate = null;

/**
 * Funzione astratta che scorre la scacchiera e aggiorna la variabile in localinfo
 * che indica se il giocatore di cui è il turno ha un pezzo potenziato
 *
 * Con un giocatore nullo o senza squadra il flag resta a false e la board non viene
 * nemmeno scorsa: currentPlayer() torna null in mezzo a un cambio di turno o su uno
 * stato non ancora inizializzato, e li' la risposta giusta e' comunque "nessun boost".
 *
 * @param	{Object}	curP		Giocatore di cui controllare i pezzi, di solito quello di turno
 * @returns	{void}
 */
export function hasPlayerBoostedPiece (curP)
{
	localInfo.hasBoostedPiece = false;
	if (!curP || curP.team)
		return;
	localBoard.forEach(square => {
		if (square.piece && square.piece.isBoostedBool)
			if (square.piece.team === curP.team)
				localInfo.hasBoostedPiece = true;
	});
}

/**
 * Decide, guardando l'aggiornamento appena arrivato, se il turno e' passato all'avversario
 * o se lo stesso giocatore ha ancora la seconda meta' del suo turno.
 *
 * Confronta chi era di turno con chi lo e' nel payload il confronto usa il nome e
 * non l'oggetto dato che i giocatori del payload sono ricostruiti da
 * JSON a ogni messaggio, quindi due riferimenti allo stesso giocatore non sono mai lo
 * stesso oggetto.
 *
 * Stesso giocatore e partita ancora aperta significa secontTurn = true.
 * In ogni altro caso cambio di giocatore o partita finita, si passa da spreadDemocracy() che azzera
 * l'interazione per sicurezza dato che questa funzione viene sempre chiamata a fine turno.
 *
 * @param	{Object}	validated		Payload validato, da cui si legge chi ha isPlaying
 * @returns	{void}
 */
export function checkEndTurn(validated)
{
	let		newCurP;
	const	players_list = ["p1", "p2", "p3", "p4"];
	const	curP = currentPlayer();

	players_list.forEach((player) => {
		if (validated[player]?.isPlaying) { newCurP = validated[player]; };
	});

	if (!newCurP || !curP) 
		return (spreadDemocracy(!!localInfo.drag));

	if (curP.name === newCurP.name && !validated.victory)
		localInfo.secondTurn = true;
	else
		spreadDemocracy(!!localInfo.drag);
}

/**
 * Aggiorna la variabile localInfo.victory  con il valore che viene passato e in base
 * al valore suona con il mp3 giusto.
 *
 * Esce subito se l'esito non cambia. Serve piu' del risparmio: lo stesso esito puo'
 * arrivare in piu' messaggi di fila, e senza questo controllo il suono di vittoria
 * ripartirebbe a ogni update.
 *
 * Il parametro sound spegne l'audio quando l'esito viene solo ricostruito invece che
 * vissuto: init e reload lo passano a false, perche' rimontare una partita gia' decisa
 * non deve suonare come vincerla adesso. Anche azzerare l'esito e' sempre muto.
 *
 * @param	{string|null}	newValue	Valore con cui modofoicare localInfo.victory
 * @param	{boolean}		[sound]		Se accompagnare il cambio di esito con il suono
 * @returns	{void}
 */
export function setVictory(newValue, sound = true)
{
	const next = newValue || null;

	if (next === localInfo.victory)
		return;

	localInfo.victory = next;
	if (!sound || !next)
		return;

	if (next === "draw")
		playAudio("draw");
	else if (next === localInfo.myTeam)
	{
		const magic = MAGIC_NAMES.test(useAuthStore().username) && AUDIO_PATHS.magico;
		playAudio(magic ? "magico" : "victory");
	}
	else 
		playAudio("lost");
}

/**
 * Cerca un Bastards arrivato sull'ultima traversa e, se lo trova, apre il menu di
 * promozione ancorandolo alla sua casella.
 *
 * Il menu si apre solo sul client del giocatore che deve scegliere: gli avversari vedono
 * la board com'e' e aspettano il pezzo scelto nel prossimo update. 
 * È rimasto il calcolo che decideva su quale fila mostrare la selezione, è roba vecchia 
 * ma la nostalgia non ce lo fa togliere
 *
 * Trovato il pezzo, l'id finisce in localInfo.goatId, che e' cio' che il template usa per
 * mostrare menu e overlay, e secondTurn viene abbassato: finche' la promozione e' aperta
 * il giocatore non puo' fare altro, deve prima scegliere.
 *
 * Da li' in poi lavora Floating UI. computePosition calcola dove sta la casella, con flip
 * e shift che tengono il menu dentro la finestra, mentre top e left fissi ribaltano il
 * riquadro sopra o sotto la casella a seconda della traversa. autoUpdate ripete il calcolo
 * a ogni scroll o resize e restituisce la funzione per fermarlo, tenuta nel modulo in
 * stopAutoUpdate: quella precedente va sempre chiusa prima di aprirne un'altra, altrimenti
 * resterebbe un osservatore vivo su una casella che non serve piu'.
 *
 * @returns	{void}
 */
export function checkUpgrade()
{
	const	curP = currentPlayer();

	if (curP.team !== localInfo.myTeam)
		return;

	localBoard.forEach((square ,id) => {
		if (((id.charAt(1) === '1' && curP.team === "black") ||
			(id.charAt(1) === '8' && curP.team === "white")) &&
			square.piece && square.piece.type === "Bastards")
		{
			localInfo.goatId = id;
			localInfo.secondTurn = false;
			requestAnimationFrame(() => {
				const fromEl = document.getElementById(id);
				const menuEl = document.getElementById("choseMenu");

				if (!fromEl || !menuEl) { return; }

				function updatePosition() {
					computePosition(fromEl, menuEl, {
						middleware: [
							offset(6),
							flip(),
							shift({ padding: 5 })
						],
						strategy: 'fixed'
					})
					.then(({ x, y }) => {
						menuEl.style.position = 'fixed';
						menuEl.style.pointerEvents = 'auto';
						if (id.charAt(1) === '8')
						{
							menuEl.style.top = '-6px';
							menuEl.style.left = '0px';
						}
						else
						{
							menuEl.style.top = '-173px';
							menuEl.style.left = '-75px';
						}
						menuEl.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
					})
					.catch(console.error);
				}
				if (stopAutoUpdate) { stopAutoUpdate(); stopAutoUpdate = null; }
                stopAutoUpdate = autoUpdate(fromEl, menuEl, updatePosition);
			});
		}
	});
}

/**
 * Stacca l'osservatore di Floating UI che tiene il menu di promozione incollato alla sua
 * casella, e dimentica la funzione di stop.
 *
 * Chiudere il menu nascondendolo non basta: autoUpdate resta agganciato a scroll, resize e
 * ridimensionamenti dell'elemento anche quando il menu non si vede piu', e continuerebbe a
 * ricalcolare la posizione di un riquadro che non serve a nessuno.
 *
 * Chiamarla quando non c'e' niente da fermare e' innocuo, ed e' voluto: le due strade che
 * la usano non sanno se il menu fosse aperto. La prima e' la promozione andata a buon fine
 * in upgradeBastard(), la seconda e' spreadDemocracy(), che ripulisce tutto senza fare
 * distinzioni.
 *
 * @returns	{void}
 */
export function stopUpgradeMenu()
{
	if (stopAutoUpdate)
	{
		stopAutoUpdate();
		stopAutoUpdate = null;
	}
}

/**
 * Guarda una singola casella prima e dopo l'aggiornamento e, se il pezzo che ci sta sopra
 * e' cambiato, ne aggiunge l'id all'insieme delle caselle toccate dall'ultima mossa.
 * Questo al fine di ottenere un set con le due caselle che rappresentano l'ultima mossa
 * di modo da rentere più facile al giocatore cosa è stato mosso dall'avversario
 *
 * @param	{Square}	oldSquare		La casella locale, ancora com'era prima dell'update
 * @param	{Square}	newSquare		La stessa casella nel payload appena arrivato
 * @param	{Set<string>} newSet		Parametro di uscita: raccoglie gli id delle caselle
 *										toccate, riempito una casella per volta dal chiamante
 * @returns	{void}
 */
export function assignLastMoveSquares(oldSquare, newSquare, newSet)
{
	const oldPiece	 = oldSquare.piece;
	const newPiece	 = newSquare.piece;
	const oldPSignat = oldPiece ? oldPiece.team + ":" + oldPiece.type : null;
	const newPSignat = newPiece ? newPiece.team + ":" + newPiece.type : null;
	const isOldEmpty = oldPSignat === null;
	const isNewEmpty = newPSignat === null;

	if (!isOldEmpty && isNewEmpty)
		newSet.add(oldSquare.id);
	if (isOldEmpty && !isNewEmpty)
		newSet.add(oldSquare.id);
	if (!isOldEmpty && !isNewEmpty && oldPSignat !== newPSignat)
		newSet.add(oldSquare.id);
}

/**
 * Helper per evitare che un update della scacchiera rimuova un drag fatto partire dalla mossa
 * predcedente all'update.
 *
 * Quindi restituisce falsa solo se la casella di partenza cambia contenuto, che è
 * l'unico caso in cui dovresi annullare il dratg perchè il pezzo appunto è stato 
 * cambiato di posto dal server
 *
 * @param	{Object}	changes		Payload validato
 * @returns	{boolean}	true se il drag in corso non ha piu' senso
 */
export function isDragInvalidated(changes)
{
	const from = localInfo.drag?.from;

	if (!from)
		return (false);

	
	if (!changes.board || !(from in changes.board))
		return (false);
	
	const nextPiece = changes.board?.[from]?.piece;
	const oldPiece = localBoard.get(from)?.piece;

	return (nextPiece?.type !== oldPiece?.type || nextPiece?.team !== oldPiece?.team);
}

/**
 * PER LA DEMOCRAZIA
 * @returns	{void}
 */
export function spreadDemocracy(keepDrag = false)
{
	localInfo.clickedId			= null;
	localInfo.lastClickedId		= null;
	localInfo.usingAbility		= "";
	localInfo.savedBoostedMap	= null;
	localInfo.secondTurn		= false;
	localInfo.secondMove		= false;
	localInfo.pending			= null;
	localInfo.drawOffer			= null;
	localInfo.goatId			= null;
	if (!keepDrag)
		localInfo.drag			= null;
	
	stopUpgradeMenu();
	localBoard.forEach(square => {
		if (square.useAbilityBool)
			square.useAbilityBool = false;
	});
	if (!keepDrag)
		clearHighlight();
} 
//  Azzera tutto lo stato di interazione del client: selezione, abilita' armata, seconda
//  mossa, trascinamento, trattative in corso e menu di promozione, piu' gli highlight e i
//  flag useAbilityBool sparsi per la board. Il nome e' uno scherzo, la funzione e' il
//  bottone rosso: dopo, il giocatore si ritrova davanti una scacchiera pulita.
//  Serve ovunque il filo del turno si spezzi e non abbia senso portarsi dietro cio' che il
//  giocatore stava facendo: il turno passa all'avversario, un errore invalida la mossa in
//  corso, il tempo scade, qualcuno abbandona, oppure comincia una partita nuova.
//  Tocca solo lo stato di interazione. Board, giocatori, esito, pezzi catturati e caselle
//  dell'ultima mossa non vengono sfiorati: quelli descrivono la partita, non cio' che il
//  giocatore stava facendo con il mouse.