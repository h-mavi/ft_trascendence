import { localBoard, localInfo }	from "@/scripts/Data/Variables.js"
import { setHighlightTrue }			from "@/scripts/Events/utils/HighlightUtils.js";
import { clearHighlight }			from "@/scripts/Events/utils/HighlightUtils.js";

export const PIECES_HIGHLIGHT = Object.freeze ({
	"King" : KingAndBastardsHL,
	"Champion" : ChampAndMinoHL,
	"Jester" : JesterHL,
	"Valkirya" : ValkiryaHL,
	"Minotaurus" : ChampAndMinoHL,
	"Bastards" : KingAndBastardsHL,
});

function JesterHL(squareId)
{
	if (!squareId && localBoard.has(squareId))
		return;
	const square = localBoard.get(squareId);
	const useAbility = square.useAbilityBool && square.piece.isBoostedBool;
	const team = square.piece.team;
	const regularMoves = square.targetZones;
	const boostedMoves = square.boostedTargetZones.get(squareId);
	
	clearHighlight();
	if (useAbility && boostedMoves)
	{
		setHighlightTrue(regularMoves, "regular", team);
		setHighlightTrue(boostedMoves, "boosted", team);
	}
	else if (regularMoves)
		setHighlightTrue(regularMoves, "regular", team);
	else
		throw Error("[JesterHL]: qualcosa è andato storto");
}

function ValkiryaHL(squareId)
{
	if (!squareId && localBoard.has(squareId))
		return;
	const square = localBoard.get(squareId);
	const useAbility = square.useAbilityBool && square.piece.isBoostedBool;
	const team = square.piece.team;
	const regularMoves = square.targetZones;
	const boostedMoves = square.boostedTargetZones.get(squareId);
	
	clearHighlight();
	if (useAbility && boostedMoves)
		setHighlightTrue(boostedMoves, "boosted", team);
	else if (regularMoves)
		setHighlightTrue(regularMoves, "regular", team);
	else
		throw Error("[ValkiryaHL]: qualcosa è andato storto");
}

function KingAndBastardsHL(squareId)
{
	if (!squareId && localBoard.has(squareId))
		return;
	const square = localBoard.get(squareId);
	const useAbility = square.useAbilityBool && square.piece.isBoostedBool;
	const team = square.piece.team;
	const regularMoves = square.targetZones;
	const boostedMoves = square.boostedTargetZones.get(squareId);
	
	clearHighlight();
	if (useAbility && boostedMoves)
	{
		setHighlightTrue(regularMoves, "regular", team);
		setHighlightTrue(boostedMoves, "boosted", "both");
	}
	else if (regularMoves)
	{
		if (square.piece.type === "King") //highlight per l'arrocco
				regularMoves.forEach((highlight) => {
					const target = localBoard.get(highlight);

					if (!target?.piece || target.piece.type !== "Minotaurus")
						return;
					if (target.piece.team !== team || squareDistance(squareId, highlight) < 2)
						return;
					target.highlight = true;
				});
		setHighlightTrue(regularMoves, "regular", team);
	}
	else
		throw Error("[KingAndBastardsHL]: qualcosa è andato storto");
}

function ChampAndMinoHL(squareId)
{
	if (!squareId && localBoard.has(squareId))
		return;
	const square = localBoard.get(squareId);
	const useAbility = square.useAbilityBool && square.piece.isBoostedBool;
	const team = square.piece.team;
	const regularMoves = square.targetZones;
	const boostedMoves = new Map(square.boostedTargetZones);
	
	clearHighlight();
	if (useAbility && boostedMoves)
	{
		if (!localInfo.secondMove)
		{
			setHighlightTrue(regularMoves, "regular", team);
			// if (square.piece.type === "Minotaurus") //per le mosse boostate crazy del champ
				boostedMoves.forEach((targetSquares) => {
					setHighlightTrue(targetSquares, "boosted", team);
				});
		}
		else
			setHighlightTrue(localInfo.savedBoostedMap, "boosted", "both");
	}
	else if (regularMoves)
		setHighlightTrue(regularMoves, "regular", team);
	else
		throw Error("[ChampAndMinoHL]: qualcosa è andato storto");
}

function squareDistance(idA, idB)
{
	const colDiff = Math.abs(idA.charCodeAt(0) - idB.charCodeAt(0));
	const rowDiff = Math.abs(parseInt(idA.substring(1) - parseInt(idB.substring(1))));

	return (Math.max(colDiff, rowDiff));
}