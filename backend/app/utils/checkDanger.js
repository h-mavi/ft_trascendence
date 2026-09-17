// @ts-check

import { eMatchPresets } from "../Macro/enums.js";
import { render } from "../test/render.js";

//SECTION - checkDanger function
/*
	list of exports:
	-	isDangerous:		checks if a piece is in danger.
	-	checkKingDanger:	checks if the currentPlayer king is in danger.
*/

/** @typedef {import("../Classes/Chess/match.js").Match} Match */
/** @typedef {import("../Classes/Chess/Pieces/pieces.js").Piece} Piece */

/**
 * checks if a piece is in danger.
 * if saveInfoBool is true, the danger info are saved into the Match object.
 * @param {Match} match
 * @param {Set<string> | undefined} setZones dangerZone to check
 * @param {string | undefined} team enumTeam to the piece to check
 * @param {boolean} saveInfoBool
 * @param {string} pieceCoord
 */
let isDangerous = (match, setZones, team, saveInfoBool=false, pieceCoord=match.cursor.square) =>
{
	let	board;
	let	dangerCoord = "";

	board = match.board;
	if (setZones == undefined)
		return false;
	if (team == undefined)
		throw ("isDangerous: team undefined");
	for (let x of setZones)
	{
		if (!match.board.get(x).piece)
			return (false);
		if (match.board.get(x)?.piece?.team != team)
		{//@ts-ignore
			if (match.settings.players.allies == true && match.board.get(x)?.piece?.team == match[team].ally)
				continue ;
			dangerCoord = x;
			break ;
		}
	}
	if (!dangerCoord)
		return false;
	if (!saveInfoBool)
		return true;
	let	dangerSquare;

	dangerSquare = match.board.get(dangerCoord);
	if (dangerSquare.targetZones.has(pieceCoord))
		match.lastMenace = {from: dangerCoord, mid: "", to: pieceCoord};
	else
	{
		for (const [midPos, boostTargets] of dangerSquare.boostedTargetZones)
		{
			if (boostTargets.has(pieceCoord) == false)
				continue ;
			match.lastMenace = {from: dangerCoord, mid: midPos, to: pieceCoord};
			return true;
		}
		render(match);
		throw (`isDangerous, menace save: invalid targets`);
	}
	return true;
}

/**
 * checks if the currentPlayer king is in danger.
 * @param {Match} match 
 * @param {string} team
 */
function checkKingDanger(match, team=match.currentPlayer.team)
{
	let	kingSquare;
	let	kingCoord;

	//@ts-ignore
	kingCoord = match[team].King;
	if (typeof(kingCoord) != "string")
		return (console.error(`checkKingDanger ${team} does not exist`), false);
	kingSquare = match.board.get(kingCoord);
	return (isDangerous(match, kingSquare.dangerZones, team));
}

export {isDangerous, checkKingDanger};