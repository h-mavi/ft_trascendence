//@ts-check

import { matchMakingOpt } from "../../Classes/endPoint/matchInit.js";
import { Result } from "../../Classes/endPoint/result.js";
import { globals } from "../../Classes/Globals/globals.js";
import { AIprofilesArray, eMatchPresets, enumConnection, enumInitNames, enumSocketState, eChildEvents, AIprofiles } from "../../Macro/enums.js";
import { isOneOf } from "../../utils/string.js";
import { MatchMaking } from "../handlers/MatchMaking.js";
import { clientSetState, isBusy } from "../utils.js";
import { init } from "../../handlers/game/init.js";
import { Match, MatchSettings } from "../../Classes/Chess/match.js";
import { openMatch } from "../../query/gameQuery.js";

/** 
 * @param {import("socket.io").Socket} socket
 * @param {import("../../Classes/Chess/player.js").dbUser} user
 * */
export function routesMatchMaking(socket, user)
{
	let	socketData;

	socket.on('create_ai_match', async(/** @type {{profile: string, team: string | null}} */req, callback) => 
	{
		let result = new Result().Success();
		let resArray = new Array();
		let	matchId;
		let setting;
		let ChildId;
		let child;

		console.log(`entro create_ai_match`);
		socketData = globals.clientMap.get(user.id_user);
		if (!socketData)
			result = result.Error("Player data are lost", 500);
		if (isBusy(user.id_user))
			result.Error("Player is busy", 403, true);
		else if (!req || !req.profile) // @ts-ignore
			result.aiProfiles = AIprofilesArray;
		else if (AIprofilesArray.indexOf(req.profile) == -1)
			result.Error("Profile does not exist", 404);
		else
		{
			setting = new MatchSettings(eMatchPresets.ClassicTwoPlayers);
			setting.SetAiProfile(req.profile, req.team);
			ChildId = globals.LessBusyChild();
			child = globals.childMap.get(ChildId);
			if (!child)
				throw (`create_ai_match: child not found`);
			matchId = await openMatch();
			child?.matchSet.add(matchId);
			//FIXME - fare in un handler
			socketData.state = enumSocketState.PLAYING;
			socketData.aiMatchData = {ChildId: ChildId, matchId: matchId};
			socket.join(`match_${matchId}`);
			console.log("In ascolto su " + `match_${matchId}`);
			console.log(`adesso si spacca tutto`);
			child?.Send(eChildEvents.CreateMatch, setting, matchId, user.id_user);
		}
		console.log(`risposta ai match: ${JSON.stringify(result, null, 2)}`);
		if (typeof(callback) == 'function')
			callback(result);
		if (typeof(req) == 'function')//@ts-ignore
			req(result);
	});

	socket.on('find_match', async(/** @type {matchMakingOpt}*/options) => 
	{
		if (isBusy(user.id_user) == true)
		{
			socket.emit('error', new Result().Error("You are already doing something", 400));
			return ;
		}
		if (!options || !options.roomType || !options.matchType)
		{
			socket.emit('error', {log: {status: 403, msg: `bad options parameter: ${options}. expected: ${matchMakingOpt}`}});
			return ;
		}
		if (isOneOf(options.roomType, enumConnection.FRIENDLY, enumConnection.RANKED, enumConnection.ARENA))
			MatchMaking(user, options);
		else
			socket.emit('error', new Result().Error("Private rooms yet to be implemented", 400));
	});

	socket.on('cancel_match', async() => 
	{
		globals.RemoveFromAllQueues(user.id_user);
		clientSetState(user.id_user);
	});
}
