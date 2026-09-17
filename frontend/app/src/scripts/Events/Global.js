import { usingAbility, checkPermision, 
		checkForHighlightMove, 
		moveDragClone, onKeydown }							from "./utils/GlobalUtils.js";
import { rightClickSelect, highlightOnClick,
		highlightOnDrag, clearHighlight }					from "./utils/HighlightUtils.js";
import { localInfo, getRootDiv, localBoard, debug }			from "@/scripts/Data/Variables";
import { PIECES_ABILITY } 									from "@/scripts/Helper/abilityMovement";
import { sendToBackend }									from "./BackLink.js";

// ANCHOR EVENT-LISTENERS FUNCTIONS

export function globalEvents()
{
	const ROOT_DIV = getRootDiv();
	// ROOT_DIV.setAttribute('tabindex', '0'); --> concetti molto interessanti
	// ROOT_DIV.focus();

	const	onClick = async function (event) {
			if (!checkPermision(event))
			{
				clearHighlight(); 
				return;
			}	
			debug(`CID: ${localInfo.clickedId}, LCID: ${localInfo.lastClickedId}`);
			if (checkForHighlightMove()) 
			{
				debug("dentro check");
				if (usingAbility())
				{
					debug(`Boosted Piece: ${localInfo.usingAbility}`);
					await PIECES_ABILITY[localInfo.usingAbility](localInfo.lastClickedId, localInfo.clickedId, "click");
					return;
				}
				sendToBackend(localInfo.lastClickedId, localInfo.clickedId); 
			}
			else
				highlightOnClick(event);
		},

		onMouseDown = function (event) {
			rightClickSelect(event);
		},

		onDragStart = function (event)
		{
			if (((localInfo.secondMove && localInfo.savedBoostedMap && 
				localInfo.savedBoostedMap.has(event.target.parentNode.id)) || !localInfo.secondTurn) && localBoard.get(event.target.parentNode.id)?.piece?.team === localInfo.myTeam)
				{
					debug("sono qui");				
					highlightOnDrag(event);
				}
		},

		onDrag = function(event) {
			moveDragClone(event);
		},

		onDragEnd = function()
		{
			clearHighlight("clicked");
			localInfo.drag = null;
		};

	ROOT_DIV.addEventListener("click", onClick);
    ROOT_DIV.addEventListener("mousedown", onMouseDown);
    ROOT_DIV.addEventListener("dragstart", onDragStart);
    ROOT_DIV.addEventListener("drag", onDrag);
    ROOT_DIV.addEventListener("dragend", onDragEnd);
	window.addEventListener("keydown", onKeydown);

	return function stopGlobalEvents()
    {
        ROOT_DIV.removeEventListener("click", onClick);
        ROOT_DIV.removeEventListener("mousedown", onMouseDown);
        ROOT_DIV.removeEventListener("dragstart", onDragStart);
        ROOT_DIV.removeEventListener("drag", onDrag);
        ROOT_DIV.removeEventListener("dragend", onDragEnd);
        window.removeEventListener("keydown", onKeydown);
    };
}