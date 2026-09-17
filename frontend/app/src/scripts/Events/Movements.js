import { localBoard, localInfo, debug, isAbilityArmed}	from "@/scripts/Data/Variables";
import { clearHighlight }			from "@/scripts/Events/utils/HighlightUtils.js";
import { sendToBackend }			from "./BackLink.js";
import { PIECES_ABILITY } 			from "@/scripts/Helper/abilityMovement";
import { playAudio } from "../Helper/generalUtils.js";

const EMPTY_IMG = new Image();
EMPTY_IMG.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
EMPTY_IMG.decode?.().catch(() => {});

export function onDragStart(event, square)
{
	event.dataTransfer.setData('pieceId', `piece-${square.id}`);
	event.dataTransfer.setData('fromSquareId', square.id);
	event.dataTransfer.effectAllowed = "move";
	event.dataTransfer.setDragImage(EMPTY_IMG, 0, 0);

	localInfo.drag = {
		src:		event.target.src,
		size:		event.target.offsetWidth,
		x:			event.clientX,
		y:			event.clientY,
		from:		square.id,
		boosted:	square.piece?.isBoostedBool === true,
		armed:		isAbilityArmed(square),
	};

	localInfo.lastClickedId = event.target.parentNode.id;
	setTimeout(() => {
		if (localInfo.drag)
			localInfo.drag.hideSource = true;
	}, 0);
}

export async function onDrop(event, toSquare)
{
	event.preventDefault();

	const fromSquareId	= event.dataTransfer.getData('fromSquareId');
	const toSquareId	= toSquare.id;
	
	const isAbilityMove	= localBoard.get(fromSquareId).useAbilityBool || localInfo.secondMove;
	if (isAbilityMove)
	{
		await PIECES_ABILITY[localInfo.usingAbility](fromSquareId, toSquareId, "");
		return;
	}

	const isValidMove = fromSquareId !== toSquareId && localBoard.get(toSquareId).highlight;
	if (!isValidMove)
	{
		debug("[onDrop]: mossa non valida!");
		if (fromSquareId !== toSquareId)
			playAudio("badmove");
		return;
	}

	const moveAccepted = await sendToBackend(fromSquareId, toSquareId, true);
	if (moveAccepted)
	{
		clearHighlight();
		localInfo.usingAbility = "";
	}
}
