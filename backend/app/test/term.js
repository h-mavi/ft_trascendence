//@ts-check
import {HISTORY_DEFAULT, HISTORY_FILE, HISTORY_PATH} from "../Macro/macro.js";
import {AIprofiles, eEvents} from "../Macro/enums.js";
import {movePiece} from "../utils/dangerUpdate.js";
import {isOneOf} from "../utils/string.js";
import {historyGetMatchState, historyRestore, historyRestoreFromDb} from "../utils/history.js";
import {error, move, boost, endTurn, init} from "../handlers/game/Game.js";
import {Result} from "../handlers/game/utils.js";
import {globals} from "../Classes/Globals/globals.js";

//NOTE - NON CANCELLARE!!!
//		senza term.js non apre le porte
import {oggettoVuotoPerFarFunzionareTermjsNONCANCELLARE} from "../main.js";
//NOTE - NON CANCELLARE!!!

import * as lib from "../lib/lib.js";
import {abort} from "node:process";
import {render, boardStringify} from "./render.js";
import readline from "node:readline";
import { makeTransfiguration } from "../handlers/game/transfiguration.js";
import { cmd } from "./enumsTest.js";
import { exec, execSync } from "node:child_process";
import { cancelEvent } from "../GameLogic/cancelEvent.js";
import { fakeBoost } from "../handlers/game/boost.js";
import { Match, MatchSettings } from "../Classes/Chess/match.js";
import { getLegalMoves } from "../GameLogic/checkLegalMoves.js";
import { AI } from "../Classes/Chess/AI.js";
import { initFromStr } from "../handlers/game/init.js";
import { AIexecuteTurn } from "../GameLogic/aiTurn.js";

const aiOppo = AIprofiles.HAL9000;
// const aiOppo = "";

//SECTION - main: inizializza e fa primo render, mette terminale in ascolto
function mainTerm()
{
	let	match;
	let	seed;
	let	time;

	console.time();
	console.profile();
	termInit();
	globals.matches.set("0", new Match());
	match = globals.getDebugMatch();
	if (!match)
		throw ("To use term.js, you need to set the DEBUG macro true");
	seed = lib.Macro.SEED;
	seed = "1v1";
	time = process.hrtime.bigint();
	init(match, seed);
	if (aiOppo)
	{
		match.NextPlayer().ai = new AI(aiOppo);
		match.aiBool = true;
	}
	console.log(`time to init: ${(process.hrtime.bigint() - time) / 1000n} microseconds`);
	match.cursor.square = match.currentPlayer.King;
	render(match);
	return (match);
}

let match = mainTerm();
let	helpBool = true;
let	mutex = false;
let	newType = "";
let	aiCanMove = false;

//SECTION - eventLoop: binda i tasti per fare cose

								let	TargetDangerSwitch = "None";
/** @type {Array<string>} */	let	selected = [];

process.stdin.on('keypress', (str, key) => 
{
	/** @type {Result}*/let	result;
	let	dx;
	let	dy;

	aiCanMove = !match.victory && !!match.currentPlayer.ai && match.history.Last().team != match.currentPlayer.team;
	if (key.name != cmd.CANCEL_EVENT && !(key.ctrl && key.name == "c") && aiCanMove)
	{
		execEvent(match, "", "");
	}
	match = globals.GetLastMatch();
	mutex = true;
	dx = 0;
	dy = 0;
	if ((key.ctrl && key.name == "c"))// || match.victory)
	{
		console.profileEnd();
		termCleanup(key.name);
	}
	console.clear();
	switch (key.name)
	{
		case (cmd.UP) : case (cmd.W) :
			dy += 1;
			break ;
		case (cmd.DOWN) : case (cmd.S) :
			dy -= 1;
			break ;
		case (cmd.LEFT) : case (cmd.A) :
			dx -= 1;
			break ;
		case (cmd.RIGHT) : case (cmd.D) :
			dx += 1;
			break ;
		case (cmd.GOTO_KING) :
			match.cursor.square = match.currentPlayer.King;
			break ;
		case (cmd.TARGET_DANGER_SWITCH) :
			if (TargetDangerSwitch == "None")
				TargetDangerSwitch = "Target";
			else if (TargetDangerSwitch == "Target")
				TargetDangerSwitch = "Danger";
			else if (TargetDangerSwitch == "Danger")
				TargetDangerSwitch = "Influence";
			else if (TargetDangerSwitch == "Influence")
				TargetDangerSwitch = "None";
			break ;
		case (cmd.END_TURN) :
			result = execEvent(match, eEvents.EndTurn);
			if (result.status != 200)
				return (saveWrongMove(match, result, eEvents.EndTurn));
			break ;
		case (cmd.BUY_BOOST) :
			selected[0] = match.cursor.square;
			result = execEvent(match, eEvents.Boost);
			if (result.status != 200)
				return (saveWrongMove(match, result, eEvents.Boost));
			selected = [];
			break ;
		case (cmd.USE_BOOST) :
			match.currentPlayer.useBoostBool = !match.currentPlayer.useBoostBool;
			break ;
		case (cmd.MOVE) :
			console.assert((selected.length < 2), "move array too large");
			selected.push(match.cursor.square);
			if (selected.length == 2)
			{
				console.clear();
				let	result = execEvent(match, eEvents.Move);
				if (result.status != 200 && match.currentPlayer.useBoostBool == true)
					return (saveWrongMove(match, result, eEvents.MoveBoost));
				else if (result.status != 200)
					return (saveWrongMove(match, result, eEvents.Move));
				selected = [];
			}
			break ;
		case (cmd.TRANSFORM):
			newType = getline("insert new piece type");
			result = execEvent(match, eEvents.Transform, newType);
			selected[0] = match.cursor.square;
			if (result.status != 200)
				return (saveWrongMove(match, result, eEvents.Transform));
			selected.pop();
			break ;
		case (cmd.SQUARE_INFO):
			let	squareCoord = undefined;
			let	square = undefined;

			while (square == undefined)
			{
				squareCoord = getline("insert VALID coord, empty for cursor...");
				if (!squareCoord)
					square = match.board.get(match.cursor.square);
				else
					square = match.board._data.get(squareCoord);
			}
			console.log(square);
			break ;
		case (cmd.HELP):
			helpBool = !helpBool;
			break ;
		case (cmd.LOAD_HISTORY):
		{
			let	name;

			name = getline(`name of the file? press enter for default name "${HISTORY_FILE}"`);
			if (!name)
				name = HISTORY_FILE;
			historyRestore(match, HISTORY_PATH + name);
			if (aiOppo)
			{
				match.NextPlayer().ai = new AI(aiOppo);
				match.aiBool = true;
			}
			break ;
		}
		case (cmd.CANCEL_EVENT):
		{
			let	filePath;

			filePath = "./test/re-zero-return-by-death.mp3";
			result = execEvent(match, "cancel");
			if (result.status != 200)
				return (error(null, result));
			if (lib.include.fs.existsSync(filePath))
				exec(`ffplay -nodisp -autoexit "${filePath}" || mpg123 "${filePath}" || cvlc --play-and-exit "${filePath}"`);
			break ;
		}
		case (cmd.FAKE_BOOST):
		{
			result = fakeBoost(match, match.cursor.square);
			console.log(result);
			break ;
		}
		case (cmd.SHOW_POSSIBILITIES):
		{
			let	moves;

			moves = getLegalMoves(match);
			lib.include.fs.writeFileSync("MOVES", JSON.stringify(moves, null, 2), "utf-8");
			console.log(`Mosse su file "MOVES". conteggio: ${moves.length}`);
			break ;
		}
	}
	if (isOneOf(key.name, cmd.MOVEMENTS) && !movePiece(match, dx, dy))
	{
		console.log("lol no");
	}
	print(key.name);
	mutex = false;
});

//SECTION - utils

/**
 * 
 * @param {Match} match 
 * @param {string} eventType 
 * @param {string} newPieceType 
 */
function execEvent(match, eventType, newPieceType="")
{
	let	result;

	try
	{
		if (!eventType)
			return (AIexecuteTurn(match), new Result().Success());
		switch (eventType)
		{
			case (eEvents.Move): case (eEvents.MoveBoost):
				result = move(match, selected[0], selected[1], match.currentPlayer.useBoostBool);
				break ;
			case (eEvents.Boost):
				result = boost(match, match.cursor.square);
				break ;
			case (eEvents.EndTurn):
				result = endTurn(match);
				break ;
			case (eEvents.Transform):
				result = makeTransfiguration(match, match.cursor.square, newPieceType);
				break ;
			case ("cancel"):
				result = cancelEvent(match);
				break ;
			default:
				throw (`eventType ${eventType} unknown`);
		}
		aiCanMove = !match.victory && !!match.currentPlayer.ai && match.history.Last().team != match.currentPlayer.team;
		if (aiCanMove)
			console.log(`Press any key except "${cmd.CANCEL_EVENT}" to let the AI move..`);
		return (result);
	}
	catch(err)
	{//@ts-ignore
		console.log(err?.stack);
		console.error("GAME CRASHED.");
		console.error(err);
		console.profileEnd();
		termCleanup("");
	}
	process.exit(1);
}

/**
 * 
 * @param {string} key 
 * @returns 
 */
function print(key)
{
	console.log("\n\n\nrow", match.cursor.getRow(), ", col", match.cursor.getCol(), ", cursor", match.cursor.Normify(), `(${match.cursor.square})`);
	if (TargetDangerSwitch != "None")
		console.log(`Visualizing ${TargetDangerSwitch} zones`);
	render(match, selected, TargetDangerSwitch);
	console.log(`keypressed: ${key}`);
	console.log(`Commands summary: ${cmd.HELP}`);
	if (helpBool)
	{
		console.log(`"move: "${cmd.MOVE}"`);
		console.log(`buyBoost: "${cmd.BUY_BOOST}"`);
		console.log(`useBoost: "${cmd.USE_BOOST}"`);
		console.log(`dangerLightMode: "${cmd.TARGET_DANGER_SWITCH}"`);
		console.log(`endTurn "${cmd.END_TURN}"`);
		console.log(`transform "${cmd.TRANSFORM}"`);
		console.log(`square info "${cmd.SQUARE_INFO}"`);
		console.log(`restoreHistory "${cmd.LOAD_HISTORY}"`);
		console.log(`gotoKing "${cmd.GOTO_KING}"`);
		console.log(`cancelEvent "${cmd.CANCEL_EVENT}"`);
		console.log(`show Boost: "${cmd.FAKE_BOOST}"`);
		console.log(`show possibilities: "${cmd.SHOW_POSSIBILITIES}"`);
	}
}

function termInit()
{
	readline.emitKeypressEvents(process.stdin);

	if (process.stdin.isTTY)
	{
		process.stdin.setRawMode(true);
	}
	else
	{
		console.log("questo test funziona da terminale");
		abort();
	}
}

/**
 * 
 * @param {string} key 
 */
function termCleanup(key)
{
	const	buffer = Buffer.alloc(50);
	let		bRead;

	process.stdin.setRawMode(false);
	while (key != "y" && key != "n")
	{
		console.log("Save game in a backup file?[y;n]");
		bRead = lib.include.fs.readSync(1, buffer);
		key = buffer.toString('utf8', 0, bRead).trim().toLowerCase();
	}
	if (key == "y")
	{
		let	name;
		console.log("Choose name of the history file. empty = default name");
		bRead = lib.include.fs.readSync(1, buffer);
		name = buffer.toString('utf8', 0, bRead).trim().toLowerCase();
		if (!name)
			match.Log(HISTORY_FILE);
		else
			match.Log(name);
	}
	process.exit();
}

/**
 * 
 * @param {string} prompt 
 */
function getline(prompt)
{
	const 	buffer = Buffer.alloc(50);
	let		bRead;
	let		input;

	console.log(prompt);
	process.stdin.setRawMode(false);
	bRead = lib.include.fs.readSync(1, buffer);
	process.stdin.setRawMode(true);
	if (!bRead)
		return ("");
	input = buffer.toString('utf8', 0, bRead).trim();
	return (input);
}

/**
 * 
 * @param {Match} match
 * @param {Result} result
 * @param {string} type
 */
function saveWrongMove(match, result, type)
{
	if (type == eEvents.Move || type == eEvents.MoveBoost)
		match.history.UpdateMoves(match, match.board.get(selected[0]), selected, result, type == eEvents.MoveBoost);
	else if (type == eEvents.Boost)
		match.history.UpdateBoost(match, match.board.get(selected[0]), selected[0]);
	else if (type == eEvents.Transform)
		match.history.UpdateTransform(match, match.board.get(selected[0]), selected[0], newType);
	else if (type == eEvents.EndTurn)
		match.history.UpdateEndTurn(match);
	//@ts-ignore
	match.history.Last().error = true;
	selected = [];
	error(null, result);
	mutex = false;
}

const timerInterval = setInterval(() => 
{
	showTimer("0");
}, 1000);

/**
 * 
 * @param {string} id
 */
function showTimer(id)
{
	let	match;

	match = globals.matches.get(id);
	if (!match)
	{
		console.error("showTimer: match undefined");
		return ;
	}
	if (mutex == true)
		return ;
	if (match.timer)
		process.stdout.write(`\r⏳ "${match.timer.time - (Date.now() - match.timer.start)}"`);
}
