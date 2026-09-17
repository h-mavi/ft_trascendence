// @ts-check
//SECTION - external libraries
import fs from "fs";
import { exec, execSync } from "child_process";
//SECTION - backend cute stuff >3
import { globals } from "../Classes/Globals/globals.js";
import { historyRestore } from "../utils/history.js";
import {HISTORY_FILE, HISTORY_PATH} from "../Macro/macro.js";
import {eEvents} from "../Macro/enums.js";
import { colors as color } from "./colorsOld.js";
import { testerEnum as MSG, curlCmd, curlCmdInit } from "./enumsTest.js";
import {boardStringify} from "./render.js";
import { Match } from "../Classes/Chess/match.js";
import {jsonParser} from "../utils/response.js";
import {render} from "./render.js";
import { coordNormify } from "../Classes/Chess/cursor.js";
import { includesOneOf } from "../utils/string.js";

//@ts-ignore
/** @typedef {import ("../../history/HISTORY.json")} historyData */
/** @typedef {import ("../Classes/Chess/chessBoard.js").ChessBoard} ChessBoard */
/** @typedef {import ("../Classes/Chess/history.js").HistoryEvent} HistoryEvent */
/** @typedef {{board: ChessBoard, log: {msg: string, status: number}}} BackResponse*/

const curlWaitTimeMs = 0;
let	currMatch = "";
let	errorFlag = 0;
let	fData = {};
let	BData = {};
let	msgErr = "";
let	currEvent = {};
let	currSquare = "";
let	fPiece = "";
let	bPiece = "";
let	colorON = color.bold;
let	colorOFF = color.reset;
let	rateSuccess = {success: 0, tests: 0};

async function testerMain()
{
	let	matchName;
	let	matchPath;

	globals.matches.set("0", new Match());
	matchName = process.argv.at(2);
	if (!matchName)
		return (await execAllTests());
	if (matchName.endsWith(".json") == false)
		matchName = matchName + ".json";
	currMatch = matchName;
	if (matchName.indexOf("..") != -1)
		return (testerFail(MSG.INVALID_DIR));
	matchPath = `${HISTORY_PATH}${matchName}`;
	if (!matchPath)
		return (testerFail(MSG.INVALID_PATH, matchPath));
	if (fs.existsSync(matchPath) == false)
		return (testerFail(MSG.INVALID_PATH, matchPath));
	await execTest(matchPath);
	process.exit(errorFlag);
}

await testerMain();

async function execAllTests()
{
	console.log = () => {};
	for (const file of fs.readdirSync(HISTORY_PATH))
	{
		rateSuccess.tests++;
		currMatch = file;
		if (includesOneOf(file, "todo", "TODO", HISTORY_FILE))
		{
			testerTodo();
			continue ;
		}
		await execTest(`${HISTORY_PATH}${file}`);
	}
	console.debug(`Win rate: ${rateSuccess.success}/${rateSuccess.tests}`)
	process.exit(errorFlag);
}

/**
 * 
 * @param {string} matchPath 
 * @returns 
 */
async function execTest(matchPath)
{
	/** @type {historyData}*/
	let	history;
	let	match;
	let	board;
	let	boards;

	match = globals.getDebugMatch();
	if (!match)
	{
		testerFail(MSG.INVALID_MSG, "you need to set up DEBUG to true to use curlTester");
		process.exit();
	}
	try
	{
		history = JSON.parse(fs.readFileSync(matchPath, 'utf-8'));
		if (history.victory == undefined)
			return (testerFail(MSG.INVALID_JSON));
		// @ts-ignore
		match.Reset(history.matchSettings);
		if (await executeEvents(match, history) == false)
			return ;
	}
	catch(err)
	{
		if (typeof(err) == "string")
			curlFail();
		else//@ts-ignore
			testerFail(MSG.INVALID_MSG, err);
		return ;
	}
	board = boardStringify(match);
	if (history.finalBoard != board)
	{
		boards = highLightBoardDiff(history.finalBoard, board);
		return (gameFail(MSG.BOARD, boards.correct, boards.wrong));
	}
	success();
}

/**
 * 
 * @param {Match} match 
 * @param {historyData} history 
 */
async function executeEvents(match, history)
{
	/** @type {BackResponse}*/
	let	res;
	let	backendBoard;
	let	settings;
	let	objectCmd = curlCmd;

	currEvent = {type: "init", from: "", to: "", counter: 0};
	settings = history.matchSettings;
	if (typeof(history.matchSettings) == "object")
	{
		settings = JSON.stringify(history.matchSettings);
		objectCmd = curlCmdInit;
	}
	else if (history.matchSettings == null)
		settings = "0";
	//@ts-ignore
	res = await curlSender("init", settings, "", objectCmd);
	updateBoard(match.board, res);
	backendBoard = await getBackBoard();
	if (cmpBoard(match.board, backendBoard) == false)
		return (curlFail());
	for (const event of history.events)
	{
		console.log(event);
		currEvent = event;
		if (event.counter == 66)
			console.log("66");
		if (event.from)
			event.from = coordNormify(event.from);
		if (event.to && event.type != "trans")
			event.to = coordNormify(event.to);
		res = await curlSender(event.type, event.from, event.to);
		updateBoard(match.board, res);
		backendBoard = await getBackBoard();
		if (cmpBoard(match.board, backendBoard) == false)
			return (curlFail());
	}
	currEvent = {type: "lastCheck"};
	if (cmpBoard(match.board, backendBoard) == false)
		return (curlFail());
	return (true);
}

//SECTION - tester utils


function success()
{
	console.debug(`${currMatch}: ${MSG.RESULT_OK}`);
	rateSuccess.success++;
}

/**
 * called when this tester fails
 * @param {string} msg 
 * @param {string} p1 
 * @param {string} p2 
 */
function testerFail(msg, p1="", p2="")
{
	console.debug(`${MSG.RESULT_ERROR}: riprova, ogni tanto curl si impalla`);
	//@ts-ignore
	console.debug(`${p1}`);
	process.exit();
	//fail(msg, p1, p2);
}

/**
 * called when a test is marked with todo
 */
function testerTodo()
{
	if (currMatch == HISTORY_FILE)
		console.debug(`${currMatch}: ${MSG.RESULT_IGNORED}`);
	else
		console.debug(`${currMatch}: ${MSG.RESULT_TODO}`);
}

/**
 * called when some test fails
 * @param {string} msg 
 * @param {string} p1 
 * @param {string} p2 
 */
function gameFail(msg, p1="", p2="")
{
	errorFlag = 1;
	console.debug(`${currMatch}: ${MSG.RESULT_FAIL}`);
	fail(msg, p1, p2);
}

function curlFail()
{
	errorFlag = 1;
	console.debug(`${currMatch}: ${MSG.RESULT_FAIL}`);
	console.debug(`${colorON}currEvent${colorOFF}: \n${jsonStr(currEvent)}`);
	console.debug(`${colorON}square${colorOFF}: ${currSquare}: ${msgErr}`);
	console.debug(`${colorON}frontend${colorOFF}, piece ${fPiece}: ${jsonStr(fData)}`);
	console.debug(`${colorON}backend${colorOFF}, piece ${bPiece}: ${jsonStr(BData)}`);
	return (false);
}

/**
 * 
 * @param {string} msg 
 * @param {string} p1 
 * @param {string} p2 
 */
function fail(msg, p1, p2)
{
	if (!msg.replace)
		console.error("fail error");
	if (p1)
		msg = msg.replace("$1", p1);
	if (p2)
		msg = msg.replace("$2", p2);
	console.debug(msg);
}

/**
 * 
 * @param {string} correct 
 * @param {string} wrong 
 */
function highLightBoardDiff(correct, wrong)
{
	let	diffIndex;

	diffIndex = 0;
	while (diffIndex < correct.length)
	{
		if (correct.at(diffIndex) != wrong.at(diffIndex))
			break ;
		++diffIndex;
	}
	correct = putColor(correct, diffIndex, color.green);
	wrong = putColor(wrong, diffIndex, color.red);
	return ({correct: correct, wrong: wrong});
}

/**
 * 
 * @param {string} str 
 * @param {number} i 
 * @param {string} col
 * @returns 
 */
function putColor(str, i, col)
{
	return (str.slice(0, i) + `${col}${str.at(i)}${color.reset}` + str.slice(i + 1, str.length)); 
}

/**
 * 
 * @param {number} milliseconds 
 */
async function msleep(milliseconds)
{
	return (new Promise(func => {setTimeout(func, milliseconds)}));
}

/**
 * 
 * @param {string} type 
 * @param {string | number} from 
 * @param {string | number} to 
 * @param {string} cmd
 * @return {Promise<BackResponse>}
 */
async function curlSender(type, from="", to="", cmd=curlCmd)
{
	let	resp;
	/** @type {BackResponse} */
	let	json;

	await msleep(curlWaitTimeMs);
	//@ts-ignore
	if (currEvent.useBoostBool && type == eEvents.Move)
		type = eEvents.MoveBoost;
	if (!from)
		from = "";
	if (!to)
		to = "";
	if (!cmd.replace)
		console.error("curlSender error");
	cmd = cmd.replace("$type", type);
	cmd = cmd.replace("$from", from.toString());
	cmd = cmd.replace("$to", to.toString());
	resp = execSync(cmd, {maxBuffer: 1 << 28}).toString();
	//@ts-ignore
	json = jsonParser(resp);
	if (json.log.status != 200)
	{
		if (json.log.msg == "Game Error: You need to move first")
			return (json);
		if (json.log.status == 500)
		{
			setError(json.log.msg);
			throw ("");
		}
		console.log(`ERROR(${json.log.status}) => ${json.log.msg}`);//@ts-ignore
		if (currEvent.error || currEvent.type == "endturn")
			return (json);
		setError(json.log.msg);
		throw ("");
	}
	return (json);
}

/**
 * 
 * @param {ChessBoard} board 
 * @param {BackResponse} updates 
 */
function updateBoard(board, updates)
{//@ts-ignore
	if (!updates || !updates.board || updates.ignoreBoard == true)
		return ;
	if (updates.board instanceof Map == false)
		return ;
	for (const [key, square] of updates.board)
	{
		board.set(coordNormify(key), square);
	}
}

async function getBackBoard()
{
	return (await curlSender("reload"));
}

/**
 * 
 * @param {ChessBoard} board 
 * @param {BackResponse} other 
 */
function cmpBoard(board, other)
{
	let	Fsquare;

	for (const [key, Bsquare] of other.board)
	{
		currSquare = key;
		Fsquare = board.get(coordNormify(key));//@ts-ignore
		fPiece = Fsquare.piece?.type; //@ts-ignore
		bPiece = Bsquare.piece?.type;
		if (!cmp(Fsquare.targetZones, Bsquare.targetZones, MSG.BOARD_TARGET))
			return (false);
		if (!cmp(Fsquare.boostedTargetZones, Bsquare.boostedTargetZones, MSG.BOARD_BOOST, true))
			return (false);
		if (Fsquare.piece && !Bsquare.piece)
			return (setError(MSG.PIECE, Fsquare.piece, Bsquare.piece));
		if (!Fsquare.piece && Bsquare.piece)
			return (setError(MSG.PIECE, Fsquare.piece, Bsquare.piece));
		if (!Fsquare.piece || !Bsquare.piece)
			continue ;
		if (Fsquare.piece.type != Bsquare.piece.type)
			return (setError(MSG.PIECE_TYPE, Fsquare.piece, Bsquare.piece));
		if (Fsquare.piece?.team != Bsquare.piece?.team)
			return (setError(MSG.PIECE_TEAM, Fsquare.piece, Bsquare.piece));
		if (Fsquare.piece.pos != Bsquare.piece.pos)
			return (setError(MSG.PIECE_POS, Fsquare.piece, Bsquare.piece));
		if (Fsquare.piece.isBoostedBool != Bsquare.piece.isBoostedBool)
			return (setError(MSG.PIECE_BOOST, Fsquare.piece, Bsquare.piece));	
	}
	return (true);
}

/**
 * 
 * @param {Set<*> | Map<*, *>} fZone
 * @param {Set<*> | Map<*, *>} bZone 
 * @param {string} errMsg
 * @param {boolean | null} recBool
 */
function cmp(fZone, bZone, errMsg, recBool=false)
{
	let	s1;
	let	s2;

	//@ts-ignore
	s1 = fZone.size != undefined ? fZone.size: fZone.length;
	//@ts-ignore
	s2 = bZone.size != undefined ? bZone.size: bZone.length;
	if (s1 != s2)
		return (setError(errMsg, fZone, bZone));
	if (recBool)
	{
		for (const [key, boostVal] of bZone)
		{//@ts-ignore
			if (cmp(fZone.get(key), boostVal, errMsg) == false)
				return (setError(errMsg, fZone, bZone));
			return (true);
		}
	}
	for (const val of fZone)
	{
		if (bZone.has(val) == false)
			return (setError(errMsg, fZone, bZone));
	}
	return (true);
}

/**
 * 
 * @param {object} data 
 */
function jsonStr(data)
{
	return (JSON.stringify(jsonParser(data), null, 2));
}

/**
 * 
 * @param {string} msg 
 * @param {*} frontData 
 * @param {*} backData 
 */
function setError(msg, frontData=null, backData=null)
{
	msgErr =  msg;
	fData = frontData;
	BData = backData;
	return (false);
}
