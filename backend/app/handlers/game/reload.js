//@ts-check
import { enumNames } from "../../Macro/enums.js";
import { jsonParser } from "../../utils/response.js";
import { isOneOf } from "../../utils/string.js";
import { clientBoard } from "./utils.js";

/**
 * 
 * @param {import("../../Classes/Chess/match.js").Match} match
 * @param {import("../../Classes/endPoint/result.js").Result} result
 * @param {string} team
 */
export function reload(match, result, team)
{
	let	yourTurnBool;
	let	lastMovedPiece;

	if (match.timer && match.timer.start != 0)
		match.currentPlayer.time = match.timer.time - (Date.now() - match.timer.start);
	// @ts-ignore
	result.board = clientBoard(match, true, true);//@ts-ignore
	result.history = match.history.clientEvents;
	result.team = team;
	if (result.team == undefined)
		result.team = "spectating";
	yourTurnBool = team == match.currentPlayer.team; 
	if (yourTurnBool && match.moves != 0)//@ts-ignore
		result.secondMove = true;
	else//@ts-ignore
		result.secondMove = false;
	result.usedBoost = "";
	if (yourTurnBool && match.moves != 0)
	{
		lastMovedPiece = match.board._data.get(match.history.Last().to)?.piece;
		if (lastMovedPiece && lastMovedPiece.isBoostedBool == true &&
		isOneOf(lastMovedPiece.type, enumNames.BASTARDS, enumNames.MINOTAURUS, enumNames.CHAMPION))
		{
			result.usedBoost = match.history.Last().to;//@ts-ignore
			result.oldBoosted = jsonParser(match.history.Last().pieceBoosterTargetZones);
		}
	}
}