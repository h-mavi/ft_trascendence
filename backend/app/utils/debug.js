//@ts-check

import { Match } from "../Classes/Chess/match.js";

let	DEBUGCOUNT = 
{findBoostedPiece: 0};

/**
 * DEBUG: re-find the boostedPiece if it gets lost
 * @param {Match} match 
 * @param {string} team 
 */
function findBoostedPiece(match, team=match.currentPlayer.team)
{
	let	player;

	debugPrint(`findBoostedPiece`);
	player = match.GetPlayer(team);
	player.boostedPiece = "";
	for (const [key, square] of match.board)
	{
		if (!square.piece?.isBoostedBool || square.piece?.team != team)
			continue ;
		player.boostedPiece = key;
		return ;
	}
}

/**
 * 
 * @param {string} param
 */
function debugPrint(param)
{
	//@ts-ignore
	DEBUGCOUNT[param]++;
	console.debug(`DEBUG function: ${param} called.`);
	console.debug(`Error summary: ${JSON.stringify(DEBUGCOUNT, null, 2)}`);
}

export {findBoostedPiece};