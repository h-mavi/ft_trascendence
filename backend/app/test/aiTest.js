// @ts-check
//SECTION - external libraries
import fs from "fs";
//SECTION - backend cute stuff >3
import { globals } from "../Classes/Globals/globals.js";
import { historyRestore } from "../utils/history.js";
import {AI_PROFILE_PATH, DEBUG_AI_TRAINING, HISTORY_DEFAULT, HISTORY_FILE, HISTORY_PATH} from "../Macro/macro.js";
import { testerEnum as MSG } from "./enumsTest.js";
import { Match } from "../Classes/Chess/match.js";
import { includesOneOf } from "../utils/string.js";
import { AI } from "../Classes/Chess/AI.js";
import { AIexecuteTurn } from "../GameLogic/aiTurn.js";
import { init } from "../handlers/game/init.js";
import { boardStringify, render } from "./render.js";
import { colors } from "./colorsOld.js";
import { AIprofiles, eEvents } from "../Macro/enums.js";
import { endTurn } from "../handlers/game/endTurn.js";
import { jsonSafeParse } from "../utils/response.js";
import { AItraining } from "../Classes/Chess/AIprofiles/training.js";

const TEST_PATH = `${HISTORY_PATH}`;
const DEFAULT_AI = AIprofiles.FIRST_AI;
const DEFAULT_AI2 = AIprofiles.FIRST_AI;
const FRESH_GAMES = !DEBUG_AI_TRAINING ? 3 : +Infinity;

//@ts-ignore
/** @typedef {import ("../../history/HISTORY.json")} historyData */

let	currMatch = "";
let	renderOutput = "";
let	currMatchData = new Match();
let	errorFlag = 0;
let aiType = "";
let aiType2 = "";

function testerMain()
{
	let	matchName;
	let	matchPath;

	console.debug = console.log;
	console.log = () => {};
	if (DEBUG_AI_TRAINING)
		console.debug = () => {};
	globals.matches.set("0", new Match());
	aiType = getAiType(process.argv[2]);
	aiType2 = getAiType(process.argv[3]);
	if (!aiType)
	{
		aiType = DEFAULT_AI;
	}
	if (!aiType2)
	{
		aiType = DEFAULT_AI2;
	}
	return (execAllTests());
}

testerMain();


function execAllTests()
{
	for (let i = 0; i != FRESH_GAMES; i++)
	{
		currMatch = "fresh " + i;
		execTest(null);
		globals.matches.delete("0");
		globals.matches.set("0", new Match());//@ts-ignore
		currMatchData = null;
	}
	for (const file of fs.readdirSync(TEST_PATH))
	{
		currMatch = file;
		if (includesOneOf(file, "todo", "TODO", HISTORY_FILE, "four"))
		{
			testerTodo();
			continue ;
		}
		execTest(`${TEST_PATH}${file}`);
	}
	process.exit(errorFlag);
}

/**
 * 
 * @param {string | null} matchPath 
 * @returns 
 */
function execTest(matchPath=null)
{
	let	match;
	let	time;
	let	i;

	match = globals.getDebugMatch();
	if (!match)
	{
		testerFail(MSG.INVALID_MSG, "you need to set up DEBUG to true to use localTester");
		process.exit();
	}
	try
	{
		if (!matchPath)
		{
			match = new Match();
			init(match);
		}
		else
			match = loadHistory(matchPath);
		currMatchData = match;
		if (!includesOneOf(match.history.Last().type, eEvents.EndTurn, "Empty") && endTurn(match, false).status != 200)
		{
			console.debug(`${currMatch}: ${MSG.RESULT_IGNORED}`);
			return ;
		}
		match.currentPlayer.ai = new AI(aiType);
		match.NextPlayer().ai = new AI(aiType2);
		match.aiBool = true;
		i = 0;
		if (DEBUG_AI_TRAINING)
			console.warn(`Executing test "${currMatch}"`);
		time = Date.now();
		while (!match.victory)
		{
			console.debug(`Executing test "${currMatch}", move ${i++}`);
			match.cursor.square = "";
			render(match, [], "", false, console.debug);
			AIexecuteTurn(match);
		}
		AItraining(match);
		console.warn(`${colors.red}${match.victory} has won.${colors.reset}`);
		console.warn(`time: ${Date.now() - time} ms`)
		render(match, [], "", false, console.debug);
		console.warn("\n\n====================\n\n");
	}
	catch(err)
	{
		console.warn(err);
		if (!err)
			err = "MISSING";
		else if (typeof(err) != "string")
			err = JSON.stringify(err, jsonSafeParse);//@ts-ignore
		gameFail(err);
	}
}

/**
 * 
 * @param {string} matchPath 
 * @returns 
 */
function loadHistory(matchPath)
{
	let	match;

	match = new Match("1v1");
	historyRestore(match, matchPath);
	return (match);
}

/**
 * called when this tester fails
 * @param {string} msg 
 * @param {string} err
 */
function testerFail(msg="", err="")
{
	msg = `${currMatch}: ${msg? msg : MSG.RESULT_ERROR}`;
	fail(msg, err);
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
 */
function gameFail(msg)
{
	let	err;

	errorFlag = 1;
	err = `${currMatch}: ${MSG.RESULT_FAIL}`;
	console.debug(err);
	fail(msg, err);
}

/**
 * 
 * @param {string} msg 
 * @param {string} err 
 */
function fail(msg, err)
{
	if (typeof(err) != "string")
		err = JSON.stringify(err, jsonSafeParse, 2);
	if (typeof(msg) != "string")
		msg = JSON.stringify(err, jsonSafeParse, 2);
	currMatchData.timer = null;
	try
	{
		render(currMatchData, [], "", false, redirectRender);
	}
	catch(err)
	{}
	let	log = 
	{
		game: err,
		info: msg,
		render: renderOutput,
		aiWhite: currMatchData.white.ai?.profile,
		aiBlack: currMatchData.black.ai?.profile,
		events: JSON.stringify(currMatchData.history.events, jsonSafeParse, 2)
	};
	console.debug(`ERROR saved in: "test/log/${currMatch}_${Date.now()}.json".\n\n\n\n`);
	if (!fs.existsSync("test/log/"))
		fs.mkdirSync("test/log/", { recursive: true });
	fs.writeFileSync(`test/log/${currMatch}_${Date.now()}.json`, JSON.stringify(log, jsonSafeParse, 2), "utf-8");
	renderOutput = "";
}

/**
 * 
 * @param {String} str string from render function 
 */
function redirectRender(str)
{
	let	ansiIndex;
	let	ansiEndIndex;

	while ((ansiIndex = str.indexOf("\x1b[")) != -1)
	{
		ansiEndIndex = str.indexOf("m", ansiIndex);
		str = str.slice(0, ansiIndex) + str.slice(ansiEndIndex + 1);
	}
	renderOutput += `${str}\n`;
}

/**
 * 
 * @param {string | undefined} type 
 */
function getAiType(type="")
{
	if (!type)
		return (DEFAULT_AI);
//@ts-ignore
	if (AIprofiles[type])//@ts-ignore
		return (AIprofiles[type]);//@ts-ignore
	if (AIprofiles[type.toLocaleLowerCase()])//@ts-ignore
		return (AIprofiles[type.toLocaleLowerCase()]);//@ts-ignore
	if (AIprofiles[type.toLocaleUpperCase()])//@ts-ignore
		return (AIprofiles[type.toLocaleUpperCase()]);//@ts-ignore
	if (type && !AIprofiles[type.at(0)?.toUpperCase() + type.toLowerCase().slice(1)])//@ts-ignore
		return (AIprofiles[type.at(0)?.toUpperCase() + type.toLowerCase().slice(1)]);
	return (DEFAULT_AI);
}
