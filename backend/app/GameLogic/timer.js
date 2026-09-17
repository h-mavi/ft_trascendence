// @ts-check

import { Result } from "../Classes/endPoint/result.js";
import { globals } from "../Classes/Globals/globals.js";
import { Match, Timer } from "../Classes/Chess/match.js";
import { clientSetState, roomMessage } from "../websocket/utils.js";
import { saveMatch } from "../utils/saveMatch.js";
import { responseFormatter, sendData } from "../utils/response.js";
import { eChildEvents, eEvents, enumSocketState } from "../Macro/enums.js";
import { closeMatch } from "../query/gameQuery.js";

/**
 * 
 * @param {Match} match 
 */
export function setTimerGame(match)
{
	let timeout;
	let start;
	let time;

	if (match.aiSimulation == true)
		return ;
	time = match.currentPlayer.time;
	/** @param {string} matchId */
	timeout = setTimeout((matchId) =>
	{
		let p;
		let result;
		let match = globals.matches.get(matchId);

		p = match?.currentPlayer;
		if (!match)
		{
			console.warn(`Warning: timer of game ${matchId}: already finish`);
			return ;
		}
		result = new Result();
		clientSetState(match.currentPlayer.dbTable?.id_user, enumSocketState.NAVIGATING);
		match.endTurn();
		result = match.PlayerLost(result, p);
		result = responseFormatter(match, result, null, null);
		result.type = "update";
		sendData(eChildEvents.Game, match.id, result);
		if (match.playerNum == 1)
		{
			result = match.CheckMate();
			result = responseFormatter(match, result, null, null);
			result.type = "update";
			sendData(eChildEvents.Game, match.id, result);
			for (const user of match.users)
				clientSetState(user.id_user, enumSocketState.NAVIGATING);
			if (match.victory != "" && match.id != "0")
				saveMatch(match);
		}
		else
		{
			setTimerGame(match);
		}
		return (result);
	}, time, match.id);
	start = Date.now();
	match.timer = new Timer(time, start, timeout);
	match.history.Last().time = time;
}
