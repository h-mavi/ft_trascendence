import { localInfo, localBoard, debug, isMyTurn}	from "@/scripts/Data/Variables";
import { playAudio } 								from "@/scripts/Helper/generalUtils";
import { PIECES_HIGHLIGHT }							from "@/scripts/Helper/piecesHighlights";

// UTILS - HIGHLIGHT AND SELECT FUNCTIONS

export function setHighlightTrue(toSet, flag, team)
{
	toSet.forEach((highlight) => {
		const square = localBoard.get(highlight);
		if (!square || square.id === localInfo.clickedId)
			return;

		const canHighlight = team === "both" || square.piece?.team !== team;
		if (!canHighlight)
			return;

		if (flag === "regular")
			square.highlight = true;
		else if (flag === "boosted")
			square.boostedHighlight = true;
		
	});
}

export function highlightOnClick(event)
{
	if (event.target.localName === "img")
	{
		if (localInfo.clickedId === localInfo.lastClickedId)
		{
			localBoard.get(localInfo.clickedId).clicked = false;
			clearHighlight();
			localInfo.lastClickedId = null;
			return;
		}
		if (localInfo.lastClickedId)
			localBoard.get(localInfo.lastClickedId).clicked = false;
		const piece = localBoard.get(localInfo.clickedId).piece.type;
		if (isMyTurn() && (!localInfo.secondTurn || localInfo.secondMove))
			PIECES_HIGHLIGHT[piece](localInfo.clickedId);
		localBoard.get(localInfo.clickedId).clicked = true;
		playAudio("clicked");
		localInfo.lastClickedId = localInfo.clickedId;
	}
	else
	{
		clearHighlight();
		localInfo.lastClickedId = null;
	}
}

export function highlightOnDrag(event)
{
	if (event.target.localName !== "img")
		return;

	const clickedId = event.target.parentNode.id;
	const Piece		= localBoard.get(clickedId)?.piece;

	if (clickedId != localInfo.lastClickedId)
		clearHighlight();

	 
	if (Piece?.team != localInfo.myTeam) 
		return;

	clearHighlight("clicked");
	if (isMyTurn())
	{
		PIECES_HIGHLIGHT[Piece.type](clickedId);
		if (localInfo.savedBoostedMap && localInfo.savedBoostedMap.has(clickedId))
		{
			localBoard.get(clickedId).boostedHighlight = true;
		}
	}
	localBoard.get(clickedId).clicked = true;
	playAudio("clicked");
}

export function rightClickSelect(event)
{
	if (event.button == 2)
	{
		event.preventDefault();
		if (!localInfo.secondMove)
			localInfo.lastClickedId = null;
		clearHighlight("highlight");
		let targetSquare;
		if (event.target.localName === "img")
		{
			targetSquare = localBoard.get(event.target.parentNode.id);
			debug(targetSquare.id);
		}
		else
		{	
			targetSquare = localBoard.get(event.target.id);
			debug(targetSquare.id);
		}

		//sul re sotto scacco il selected spegnerebbe il rosso: si lascia stare
		if (!targetSquare || targetSquare.inCheck)
			return;

		if (!targetSquare.selected)
			targetSquare.selected = true;
		else if (targetSquare.selected)
			targetSquare.selected = false;
	}
}

export function setCheckSquare(id)
{
	localBoard.forEach(square => {
		if (square.inCheck === true && square.id !== id)
			square.inCheck = false;
	});

	if (!id)
		return;

	const square = localBoard.get(id);
	if (square)
		square.inCheck = true;
	else
		debug("[setCheckSquare]: square non trovato ->", id);
}

export function clearHighlight(flag)
{
	localBoard.forEach(square => {
		if (square.selected === true && (flag === "selected" || flag === undefined))
			square.selected = false;
		if (square.inCheck === true && flag === "check")
			square.inCheck = false;
		if (square.clicked === true && (flag === "clicked" || flag === undefined))
			square.clicked = false;
		if (square.boostedHighlight === true && (flag === "boosted"))
			square.boostedHighlight = false;
		if ((square.highlight === true || square.boostedHighlight == true)&& (flag === "highlight" || flag === undefined))
			{
				square.highlight = false;
				square.boostedHighlight = false;
			}
	})
}

/**
 * Ricalcola gli highlight del pezzo che il giocatore sta trascinando qiuando la scacchiera
 * viene updatata mentre un giocatore sta facendo un drag.
 *
 * @returns	{void}
 */
export function refreshDragHighlight()
{
	const from	= localInfo.drag?.from;
	const piece	= localBoard.get(from)?.piece;

	if (!from || !piece || piece.team !== localInfo.myTeam || !isMyTurn())
		return;

	PIECES_HIGHLIGHT[piece.type]?.(from);
	localBoard.get(from).clicked = true;
}
