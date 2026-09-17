import { localInfo, localBoard, currentPlayer, debug}	from "../Data/Variables.js";
import { setHighlightTrue, clearHighlight }		from "../Events/utils/HighlightUtils.js";
import { PIECES_HIGHLIGHT } 					from "./piecesHighlights.js";
import { sendToBackend }						from "../Events/BackLink.js";

const PIECES_ABILITY = Object.freeze ({
	"King" : moveKing,
	"Champion" : moveMinoNChamp,
	"Jester" : moveJesterNValkirya,
	"Valkirya" : moveJesterNValkirya,
	"Minotaurus" : moveMinoNChamp,
	"Bastards" : moveBastard,
	"": error,
});

async function moveBastard(fromId, toId, flag)
{
	if (!localInfo.secondMove)
	{
		const square = localBoard.get(fromId);
		const boostedZones = square.boostedTargetZones.get(fromId);
		const result = await sendToBackend(fromId, toId, true);
		if (result)
		{
			beginPendingAbility({
				pieceType:	localInfo.usingAbility,
				zones:		boostedZones,
				focusId:	flag === "click" ? toId : null,	
			})
			localBoard.get(fromId).useAbilityBool = false;
		}
		else
		{
			debug("[sendToBackend]: Mossa non valida");
			return;
		}
	}
	else
	{
		if (flag === "click")
			boostHlOnClick();
		if (localInfo.savedBoostedMap.has(toId) && flag === "click")
			return;
		else if (localInfo.savedBoostedMap.has(fromId) && localBoard.get(fromId).targetZones.has(toId))
		{
			const result = await sendToBackend(fromId, toId, true);
			if(!result)
				throw new Error("[bostedMovent]: invalid move");
			else
			{
				localInfo.secondMove = false;
				localInfo.usingAbility = "";
				localInfo.savedBoostedMap = null;
			}
		}
		else
			debug("[moveBastard]: seconda mossa scartata", fromId, toId);
	}
}

async function moveKing()
{
	debug("Va bene mavi, la smetto");
}

async function moveJesterNValkirya(fromId, toId)
{
	const square = localBoard.get(fromId);
	const boostedZones = square.boostedTargetZones.get(fromId);

	localInfo.savedBoostedMap = boostedZones;
	const result = await sendToBackend(fromId, toId, true);
	if (!result)
		throw new Error("[abilityMovement.js:moveJester]: invalid move!");
	else
	{
		localBoard.get(fromId).useAbilityBool = false;
		clearHighlight();
		localInfo.usingAbility = "";
	}
}

async function moveMinoNChamp(fromId, toId, flag)
{
	if (!localInfo.secondMove)
	{
		const square = localBoard.get(fromId);
		const boostedZones = square.boostedTargetZones.get(toId);
		const result = await sendToBackend(fromId, toId, true);
		if (result)
		{
			beginPendingAbility({
				pieceType:	localInfo.usingAbility,
				zones:		boostedZones,
				anchorId:	toId,
				focusId:	flag === "click" ? toId : null,
			})
			localBoard.get(fromId).usingAbility = false;
		}
		else
		{
			debug("[sendToBackend]: Prima mossa non valida");
			return;
		}
	}
	else
	{
		// if (!localInfo.savedBoostedMap.has(toId)) //onde evitare di aggiornare lasclicked e clicked quando non clicchi nelle caselle boosted
		// 	return;
		if (flag === "click")
			boostHlOnClick();
		if (localInfo.savedBoostedMap.has(toId))
		{
			debug(`from: ${fromId}, to: ${toId}`);
			const result = await sendToBackend(fromId, toId, true);
			if(!result)
				throw new Error("[bostedMovent]: Seconda mossa non valida");
			else
			{
				localBoard.get(fromId).useAbilityBool = false;
				localInfo.secondMove = false;
				localInfo.usingAbility = "";
				localInfo.savedBoostedMap = null;
			}
		}
	}
}

function error()
{
	throw new Error("[PIECES_ABILITY]: Qualcuno ha chiamato qualcosa che non esiste eh");
}

function boostHlOnClick()
{
	if (!localInfo.savedBoostedMap.has(localInfo.clickedId))
	{
		clearHighlight();
		if (["Bastards","King"].includes(localInfo.usingAbility))
		{
			setHighlightTrue(localInfo.savedBoostedMap, "boosted", "both");
			if (!localBoard.get(localInfo.lastClickedId)?.targetZones.has(localInfo.clickedId))
				localInfo.lastClickedId = localInfo.clickedId;
		}
		else
			setHighlightTrue(localInfo.savedBoostedMap, "boosted", currentPlayer().team);
		return;
	}
	if (localInfo.clickedId === localInfo.lastClickedId) 
	{
		clearHighlight();
		setHighlightTrue(localInfo.savedBoostedMap, "boosted", "both");
		localBoard.get(localInfo.clickedId).boostedHighlight = true;
		localInfo.lastClickedId = null;
		return;
	}
	// Queste righe erano troppo specifiche per la mossa del pedone.
	// dovrebbe valere anche per il re forse(?), boh, comunque l'avevo hardcodata troppo yayyyyyyy
	if (["Bastards","King"].includes(localInfo.usingAbility))
	{
		const piece = localBoard.get(localInfo.clickedId).piece.type;
		PIECES_HIGHLIGHT[piece](localInfo.clickedId);
		localBoard.get(localInfo.clickedId).boostedHighlight = true;
		localInfo.lastClickedId = localInfo.clickedId;
	}
}

function beginPendingAbility({pieceType, zones, anchorId = null, focusId = null})
{
	if (!pieceType || !zones || zones.size === 0)
		return (false);

	localInfo.usingAbility		= pieceType;
	localInfo.secondMove		= true;
	localInfo.savedBoostedMap	= zones;

	const anchorSquare = localBoard.get(anchorId);

	if (anchorId && anchorSquare)
		anchorSquare.useAbilityBool = true;
	if (focusId)
		localInfo.lastClickedId = focusId;

	setHighlightTrue(zones, "boosted", "both");
	return (true);
}

export { PIECES_ABILITY, beginPendingAbility };