// @ts-check
//SECTION - external libraries
import fs from "fs";
//SECTION - backend cute stuff >3
import { globals } from "../Classes/Globals/globals.js";
import { historyRestore } from "../utils/history.js";
import {HISTORY_FILE, HISTORY_PATH} from "../Macro/macro.js";
import { colors as color } from "./colorsOld.js";
import { testerEnum as MSG } from "./enumsTest.js";
import {boardStringify} from "./render.js";
import { Match } from "../Classes/Chess/match.js";
import { includesOneOf } from "../utils/string.js";

//@ts-ignore
/** @typedef {import ("../../history/HISTORY.json")} historyData */

let	currMatch = "";
let	errorFlag = 0;

function testerMain()
{
	let	matchName;
	let	matchPath;

	console.debug = console.log;
	console.log = () => {};
	globals.matches.set("0", new Match());
	matchName = process.argv.at(2);
	if (!matchName)
		return (execAllTests());
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
	execTest(matchPath);
	process.exit(errorFlag);
}

testerMain();


function execAllTests()
{
	for (const file of fs.readdirSync(HISTORY_PATH))
	{
		currMatch = file;
		if (includesOneOf(file, "todo", "TODO", HISTORY_FILE))
		{
			testerTodo();
			continue ;
		}
		execTest(`${HISTORY_PATH}${file}`);
	}
	process.exit(errorFlag);
}

/**
 * 
 * @param {string} matchPath 
 * @returns 
 */
function execTest(matchPath)
{
	/** @type {historyData}*/
	let	history;
	let	match;
	let	board;
	let	boards;

	match = globals.getDebugMatch();
	if (!match)
	{
		testerFail(MSG.INVALID_MSG, "you need to set up DEBUG to true to use localTester");
		process.exit();
	}
	try
	{
		history = JSON.parse(fs.readFileSync(matchPath, 'utf-8'));
		if (history.victory == undefined)
			return (testerFail(MSG.INVALID_JSON));
		historyRestore(match, matchPath);
		board = boardStringify(match);
	}
	catch(err)
	{
		if (typeof(err) == "string")
			gameFail(err);
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
	else if (history.victory && !match.victory)
		return (gameFail(MSG.WIN_MISS, history.victory));
	else if (!history.victory && match.victory)
		return (gameFail(MSG.WIN_WRONG));
	else if (history.victory != match.victory)
		return (gameFail(MSG.WIN_PLAYER), match.victory);
	success();
}


function success()
{
	console.debug(`${currMatch}: ${MSG.RESULT_OK}`);
}

/**
 * called when this tester fails
 * @param {string} msg 
 * @param {string} p1 
 * @param {string} p2 
 */
function testerFail(msg, p1="", p2="")
{
	console.debug(`${currMatch}: ${MSG.RESULT_ERROR}`);
	fail(msg, p1, p2);
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

/**
 * 
 * @param {string} msg 
 * @param {string} p1 
 * @param {string} p2 
 */
function fail(msg, p1, p2)
{
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
	if (!correct)
		return ({correct: "", wrong: wrong});
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