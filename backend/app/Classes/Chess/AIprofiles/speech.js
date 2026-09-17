//@ts-check

import { IS_CHILD_PROCESS } from "../../../Macro/macro.js";
import { getDotColor } from "../../../test/render.js";
import { gameMessage, roomMessage } from "../../../websocket/utils.js";

/** @typedef {import("../match").Match} Match */

/**
 * 
 * @param {Match} match 
 * @param {string} type the event to search in the speech.json
 * @param {Array<string> | boolean} vars vars[0] replaces $VAR1, vars[1] $VAR2...
 * @param {boolean} currPlayerBool true if AI is currentPlayer, else false
 */
export function aiSpeech(match, type, vars=[], currPlayerBool=true, oppoSpeechBool=false)
{
	let	player;
	let	ai;
	/** @type {Array<string>} */
	let	msgArray;
	let	msg;
	let	i;

	if (match.aiBool == false || match.aiSimulation == true)
		return ;
	if (typeof(vars) == "boolean")
	{
		currPlayerBool = vars;
		vars = [];
	}
	if (currPlayerBool == true)
		player = match.currentPlayer;
	else
		player = match.PrevPlayer();
	ai = player.ai;
	if (!ai || !ai.speechJSON)
		return (oppoSpeech(match, type, vars, currPlayerBool, oppoSpeechBool));//@ts-ignore
	msgArray = ai.speechJSON[type];
	if (!msgArray || msgArray.length == 0)
		return (oppoSpeech(match, type, vars, currPlayerBool, oppoSpeechBool));
	msg = msgArray[Math.floor(Math.random() * msgArray.length)];
	if (!msg)
		return (oppoSpeech(match, type, vars, currPlayerBool, oppoSpeechBool));
	i = 1;
	for (const variable of vars)
	{
		while (msg.includes(`$VAR${i}`))
			msg = msg.replace(`$VAR${i}`, variable);
		i++;
	}
	console.debug(`${ai.profile}${getDotColor(player.team)}: ${msg}`);
	gameMessage(match, msg, ai.profile, null);
	oppoSpeech(match, type, vars, currPlayerBool, oppoSpeechBool);
}

//SECTION - utils

/**
 * 
 * @param {Match} match 
 * @param {string} type the event to search in the speech.json
 * @param {Array<string> | boolean} vars vars[0] replaces $VAR1, vars[1] $VAR2...
 * @param {boolean} currPlayerBool true if AI is currentPlayer, else false
 * @param {boolean} oppoSpeechBool to avoid infinite loop
 */
function oppoSpeech(match, type, vars=[], currPlayerBool, oppoSpeechBool)
{
	if (oppoSpeechBool == true)
		return ;
	else if (type.includes("Me"))
		type = type.replace("Me", "Oppo");
	else if (type.includes("Oppo"))
		type = type.replace("Oppo", "Me");
	else
		return ;
	aiSpeech(match, type, vars, !currPlayerBool, true);
}
