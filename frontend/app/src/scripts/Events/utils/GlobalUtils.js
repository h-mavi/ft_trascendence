import { localInfo, localBoard, canAfford, debug}	from "@/scripts/Data/Variables";
import { PIECES_HIGHLIGHT }							from "@/scripts/Helper/piecesHighlights";
import { clearHighlight }							from "@/scripts/Events/utils/HighlightUtils.js";
import { stopUpgradeMenu }							from "@/scripts/Data/utils/ArchiUtils.js";
import { requestToBack }							from "@/scripts/Events/BackLink.js";
import { useSockStore }								from "../../../stores/sock.st";
import { playAudio, isTypingTarget }				from "@/scripts/Helper/generalUtils";
import { currentPlayer } 							from "@/scripts/Data/Variables";
import { isMyTurn } 								from "@/scripts/Data/Variables";

// ANCHOR USER INTERACTION FUNCTIONS

/**
 * Sposta la selezione su una casella e ne arma l'abilita'.
 * Deseleziona la casella precedente, perche' due pezzi armati insieme non hanno senso.
 * @param {string} squareId
 */
export function selectAbilitySquare(squareId)
{
	const square = localBoard.get(squareId);

	if (!square)
		return;

	const previous = localBoard.get(localInfo.lastClickedId);
	if (previous && previous.id !== squareId)
	{
		previous.clicked		= false;
		previous.useAbilityBool	= false;
	}

	localInfo.clickedId		= squareId;
	localInfo.lastClickedId	= squareId;
	square.clicked			= true;

	useAbility(squareId);
}

export function useAbility(targetId = null)
{
	const clickedId = targetId ?? localInfo.clickedId;
	const square 	= localBoard.get(clickedId);

	if (!square) { return; }

	if (square.useAbilityBool)
	{
		square.useAbilityBool = false;
		localInfo.usingAbility = "";
	}
	else 
	{ 
		square.useAbilityBool = true;
		localInfo.usingAbility = square.piece?.type ? square.piece.type : "";
		playAudio("armability");
		debug(`who the fuck i am: ${localInfo.usingAbility}`);
	}
	PIECES_HIGHLIGHT[square.piece.type](clickedId);
}

export function shopAbility(targetId = null)
{
	const squareId	= targetId ?? localInfo.clickedId;
	const Piece		= localBoard.get(squareId)?.piece;

	if (Piece?.team !== localInfo.myTeam)
		return;
	
	if (!Piece?.isBoostedBool && canAfford(Piece) && localInfo.secondTurn)
		requestToBack(squareId, null).then(
			function(value) {
			if (value) 
				clearHighlight();
			},
			function(value) {if (!value) { debug("Shop non completato correttamente"); }}
		);
}

export async function sendEndTurn()
{
	let response;

	response = await requestToBack(null, null);
	if (response) 
		clearHighlight();
	else
		debug("End turn non mandato correttamente");
}

export async function sendGiveUp()
{
	let response;

	response = await requestToBack(null, null, 'giveUp');
	if (response)
		clearHighlight();
	else
		debug("Give up non mandato correttamente");
}

export async function sendDraw(accepted) 
{
	localInfo.drawOffer = (accepted === true && localInfo.drawOffer !== "received") ? "sent" : null;
	localInfo.pending 	= null;

	if (!await requestToBack(null, null, "askdraw", accepted))
	{
		debug("Draw non mandato correttamente!");
		localInfo.drawOffer = null;
	}
}

export function upgradeBastard(newType)
{
	requestToBack(null, newType).then(
		function(value) {if (value) 
		{ 
			localInfo.goatId = null; 
			stopUpgradeMenu();
			clearHighlight(); 
		}},
		function(value) {if (!value) { debug("Mossa non valida"); }}
	);
}

//UTILS - GENERAL UTILS

export function moveDragClone(event)
{
	if (!localInfo.drag || (event.clientX === 0 && event.clientY === 0))
		return;
	localInfo.drag.x = event.clientX;
	localInfo.drag.y = event.clientY;
}

export function checkPermision(event)
{
	if (event.target.localName === "div")
		localInfo.clickedId = event.target.id;
	else									
		localInfo.clickedId = event.target.parentNode.id;
	
	if (localInfo.clickedId === "" || localInfo.clickedId === "board")
		return (false);

	const Square  = localBoard.get(localInfo.clickedId);
	const Piece   = Square?.piece;

	if (Square?.highlight || Square?.boostedHighlight) 
		return (true);

	if (Piece && Piece.team != localInfo.myTeam)
	{
		localInfo.lastClickedId = null;
		return false;
	}
	return (true);
}

export function checkForHighlightMove()
{	
	let bool;

	if (localInfo.secondTurn && ((localInfo.savedBoostedMap && 
		localInfo.savedBoostedMap.has(localInfo.clickedId)) ||
		localInfo.secondMove))
		bool = true;
	else
		bool =	localBoard.get(localInfo.clickedId).highlight ||
				localBoard.get(localInfo.clickedId).boostedHighlight;
	
	if (localInfo.clickedId !== localInfo.lastClickedId)
	{
		const square = localBoard.get(localInfo.lastClickedId);
		if (square?.piece && !["Bastards","King"].includes(square.piece.type) && !square.useAbilityBool)
			clearHighlight();
	}
	else { clearHighlight("selected"); }
	
	return(bool);
}

export function usingAbility()
{
	const lastSquare  = localBoard.get(localInfo.lastClickedId);
	const square      = localBoard.get(localInfo.clickedId);

	const lastUseAbility = lastSquare?.useAbilityBool && lastSquare?.piece?.isBoostedBool;
	const useAbility	 = square?.useAbilityBool && square.piece?.isBoostedBool;

	return (localInfo.usingAbility !== "" && ((localInfo.lastClickedId && (useAbility || lastUseAbility)) || localInfo.secondTurn));
}

export async function showBoostedMovesHover(fromId)
{
	const sockStore = useSockStore();
	if (!sockStore.socket)
		return;

	const response	= await sockStore.socket.emitWithAck('simulate_boost', { from: fromId, to: "" });
	const square	= localBoard.get(fromId);
	if (!square)
		return;
	debug(response);	
	if (response?.log?.status !== 200)
	{
		debug("[showBoostedMovesHover]: response status != 200!", response);
		return;
	}
	const futureBoostedZones = new Map(
		Object.entries(response.zones || {}).map(([key, value]) =>
			[key, new Set(Array.isArray(value) ? value : [])])
	);
	playAudio("checkboost");
	localInfo.savedBoostedMap = futureBoostedZones;
	for (let toHighlight of futureBoostedZones)
	{

		const isValkirya = localBoard.get(toHighlight[0]).piece.type === "Valkirya";
		const isJester = localBoard.get(toHighlight[0]).piece.type === "Jester";
		for (let id of toHighlight[1])
		{
			const piece = localBoard.get(id)?.piece;
			const pieceTeam = piece?.team;	
			if ((isValkirya || isJester) && pieceTeam === localInfo.myTeam)
			{
				debug("vediamo: ", pieceTeam !== localInfo.myTeam);
				continue;
			}
			else
				localBoard.get(id).boostedHighlight = true;
		}
	}
}

export async function showBoostedMovesLeave()
{
	clearHighlight("boosted");
}

export function blinkSquares(ids, { times = 3, interval = 300, delay = 300 } = {})
{
	const timers = [];

	[...ids].forEach((id, i) => {
		const square = localBoard.get(id);
		if (!square)
			return;

		timers.push(setTimeout(() => {
			let toggles = 0;
			square.selected = true;
			const blink = setInterval(() => {
				square.selected = !square.selected;
				if (++toggles >= times * 2)
				{
					clearInterval(blink);
					square.selected = false;
				}
			}, interval);
			timers.push(blink);
		}, i * delay));
	});

	return () => {
		timers.forEach(clearTimeout);
		[...ids].forEach(id => {
			const square = localBoard.get(id);
			if (square)
				square.selected = false;
		});
	};
}

export const onKeydown = async function (event) 
{
	if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || isTypingTarget(event.target))
		return;
	if (event.code === "Space" && localInfo.secondTurn)
	{
		event.preventDefault();
		await sendEndTurn();
	}	
	if (event.code === "Enter" && localBoard.get(localInfo.clickedId)?.piece?.team === currentPlayer().team)
		shopAbility();
	if (event.code === "ShiftLeft" && isMyTurn() && localBoard.get(localInfo.clickedId)?.piece?.isBoostedBool)
		useAbility();
}