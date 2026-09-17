// @ts-check

//SECTION - boost function
/*
gameChecks, init
	list of exports:
	-	init:	init a match. The preset can be a matchSetting/a preset Str.
	the matchSetting json can be found in classes/Chess/match.js
	the preset strings can be found in Macro/enums.js 	
*/

import {Match} from "../../Classes/Chess/match.js";
import {clientBoard, Result} from "./utils.js";
import {initRng} from "../../utils/random.js";
import { CHESSBOARD_W, CHESSBOARD_H, AI_EVENTS } from "../../Macro/macro.js";
import * as creators from "../../GameLogic/createChessBoard.js";
import { MatchSettings, matchPresets } from "../../Classes/Chess/match.js";
import { isOneOf, strCount } from "../../utils/string.js";
import { AIprofilesArray, enumInitTeam } from "../../Macro/enums.js";
import { render } from "../../test/render.js";
import { aiSpeech } from "../../Classes/Chess/AIprofiles/speech.js";
import { profile } from "node:console";

/**
 * The Map board is added to result to be sent to the client. Steps:
 * 1) the property board is added to the result object
 * 2) JSON does not support Map. So we convert the Map board to an Object
 * @param {Match | null} match
 * @param {MatchSettings | number | string | null} preset other types for compatibility
 */
function init(match=null, preset=null)
{
	let	result;
	let	rng;
	let	seed;

	seed = null;
	if (typeof(preset) == "number")
	{
		seed = preset;
		preset = null;
	}
	else if (preset == null)
		seed = Math.floor(Math.random() * (1 << 30));
	if (preset == "")
		preset = null;
	result = new Result();
	if (match)
		match.Reset(preset);
	else
		match = new Match(preset);
	if (seed == null)
		seed = match.settings.board.seed;
	else
		match.settings.board.seed = seed;
	rng = initRng(seed);
	if (match.settings.board.start)
		creators.initSavedBoard(match);
	else if (seed == 0 || preset == null)
		creators.initClassicBoard(match);
	else
		creators.initRandomBoard(match, rng);
	aiSpeech(match, AI_EVENTS.startGame);
	aiSpeech(match, AI_EVENTS.startGame, [], false);
	result.status = 200;
	// @ts-ignore
	result.board = clientBoard(match, true);
	return (result);
}

/** 
 * 
 * @param {string} boardStr 
 * @param {MatchSettings | null} matchSettings */
function initFromStr(boardStr, matchSettings=null)
{
	let	firstLine;
	let	boardX;
	let	boardY;
	let	playerNum;

	if (matchSettings)
		return (init(null, matchSettings));
	firstLine = boardStr.substring(0, boardStr.indexOf("\n"));
	boardX = strCount(firstLine, "|") - 1;
	boardY = strCount(boardStr, "\n");
	playerNum = 2;
	if (isOneOf(boardStr, enumInitTeam.Green, enumInitTeam.Red, enumInitTeam.Yellow))
		playerNum = 4;
	matchSettings = new MatchSettings();
	matchSettings.board.heigth = boardY;
	matchSettings.board.width = boardX;
	matchSettings.players.number = playerNum;
	matchSettings.board.start = boardStr;
	return (init(null, matchSettings));
}

export {init, initFromStr};