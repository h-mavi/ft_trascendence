//@ts-check

import { randomInt } from "crypto";
import { getLegalMoves } from "../../GameLogic/checkLegalMoves.js";
import { checkLostAll } from "../../GameLogic/checkMate.js";
import { AIprofilesArray, eTeam, enumNames } from "../../Macro/enums.js";
import { render } from "../../test/render.js";
import { cancelTurn, execTurn } from "../../utils/AI.js";
import { checkKingDanger, isDangerous } from "../../utils/checkDanger.js";
import { getBestNumber } from "../../utils/math.js";
import { rngProportional } from "../../utils/random.js";
import { AIProfileConstructor } from "./AIprofiles/constructors.js";
import fs from "fs";
import { isOneOf } from "../../utils/string.js";
import { DEBUG_AI_TRAINING, SEED } from "../../Macro/macro.js";
import { gameMessage } from "../../websocket/utils.js";
import { DangerUpdate } from "../../utils/dangerUpdate.js";
import { refreshCastling } from "../../GameLogic/Castling.js";

/** @typedef {import("./match.js").Match} Match*/
/** @typedef {{from: string, to: string}} Move */
/** @typedef {{move: Move | null, moveBoost: Move | null, transform: string, boost: string, canEat?: boolean}} Turn */
/** @typedef {{score: number, index: number}} Eval */

/** @type {null | string} */
let DEBUGresultBUFFER = "";
let DEB = 0;

/*

	g1: win {t1, t2, t3} => {b1, b2, b3} 
	g2: lost {t1, t2, t3} => {b1, b2, b3}

	g1-t3 =>	g1-b3 (+1)	
	g1-t2 =>	g1-b2 (+0.95)
	g1-t1 =>	g1-b1 (+0.90)

	g2-t3 =>	g2-b3 (-1)
	g2-t2 =>	g2-b2 (-0.95)
	g2-t1 =>	g2-b1 (-0.90)

	x migliori
	{
		b1: {scores: [80, -500], count: 1}
		b2: {scores: [80, -500], count: 1}
	}
*/

/** @template T */
export class AI
{
	/** @param {string | null} profile */
	constructor(profile=null)
	{
		/** @type {(match: Match, ai: AI<*>, turns: Array<Turn>) => number} */
		this.Eval = () => {return (0);};
		/** @type {(match: Match, ai: AI<*>) => void} */
		this.Simulate = () => {};
		/** @type {(match: Match, ai: AI<*>) => void} */
		this.Cancel = () => {};
		/** @type {T}*/
		this.data;
		let	i = (Math.floor(Math.random() * 10000)) % AIprofilesArray.length;
		if (!profile)
			profile = AIprofilesArray[i];
		this.profile = profile;
		this.difficulty = "easy";
		/** @type {null | import("./AIprofiles/speech.json")} */
		this.speechJSON = null;
		this.defeatStatus = 0;//@ts-ignore
		this.memory = null;
		this.quiescenceDepth = -2;
		this.evalSimulation = false;
		this.depth = 2;
		console.log(`A new opponent has spawned: ${profile}... fear its power!`);
		AIProfileConstructor(this);
	}
};

//SECTION - utils

/**
 * 
 * @param {Match} match 
 * @return {{Turn: Turn, Score: number}} match 
 */
function getBestTurn(match)
{
	let	arrayTurns;
	let	depth;
	/** @type {Eval} */
	let	val = {};
	let	score;
	let newTurns;
	/** @type {Array<Eval>} */
	let bestTurns = new Array();
	let	bestTurnIdx;
	let playableTurn = new Array();
	let	ai;
	let	alpha;
	let	beta;

	const	DEBUGTEAM = match.currentPlayer.team;

	ai = match.currentPlayer.ai;
	if (!ai)
		throw (`getBestTurn: you are not a machine!`);
	match.simulationMap.clear();
	gameMessage(match, "Calculating best move...");
	alpha = -Infinity;
	beta = +Infinity;
	depth = ai.depth;
	if (DEBUG_AI_TRAINING)
		depth = 0;
	else if (isOneOf(enumNames.CHAMPION, match.GetBoostedPieceTypes()))
		depth -= 1;
	arrayTurns = getLegalMoves(match);
	for (let i = 0; i != arrayTurns.length; i++)
	{
		const turn = arrayTurns[i];
		if (match.currentPlayer.team == eTeam.White)
			alpha = getBestNumber([alpha, bestTurns[0]?.score, bestTurns[1]?.score], false);
		else if (match.currentPlayer.team == eTeam.Black)
			beta = getBestNumber([beta, bestTurns[0]?.score, bestTurns[1]?.score], true);
		if (!execTurn(match, turn))
			continue ;
		if (match.currentPlayer.team == DEBUGTEAM)
			throw (`AI: Team has NOT changed..`);
		playableTurn.push(turn);
		newTurns = getLegalMoves(match);
		if (ai.memory && match.zobristIndex in ai.memory && (!DEBUG_AI_TRAINING ||
		rngProportional(100, 50)))
		{
			score = ai.memory[match.zobristIndex][0];
		}
		else if (match.victory)
			score = victoryScore(match);
		else
			score = minMax(match, ai, newTurns, depth, [turn], alpha, beta);
		if (DEBUGresultBUFFER != null)
			DEBUGresultBUFFER += `|depth: ${depth}|val: ${score}|i: ${DEB++}|team: ${match.currentPlayer.team == eTeam.White ? "⚪" : "⚫️"}|\n`;
		val.index = i;
		val.score = score;
		if (match.currentPlayer.team == DEBUGTEAM)
			throw (`AI: Team has NOT changed..`);
		cancelTurn(match, turn);
		if (match.currentPlayer.team != DEBUGTEAM)
			throw (`AI: Team has changed..`);
		if (val.score == +Infinity)
		{
			if (match.currentPlayer.team == eTeam.Black)
				continue ;
			else
				return ({Turn: turn, Score: +Infinity});
		}
		else if (val.score == -Infinity)
		{
			if (match.currentPlayer.team == eTeam.White)
				continue ;
			else
				return ({Turn: turn, Score: -Infinity});
		}
		if (bestTurns.length <= 1)
		{
			bestTurns.push({score: val.score, index: val.index});
			continue ;
		}
		for (let i = 0; i != bestTurns.length; i++)
		{
			const x = bestTurns[i];

			if (match.currentPlayer.team == eTeam.Black && val.score < x.score)
			{
				bestTurns[i] = {score: val.score, index: val.index};
				break ;
			}
			else if (match.currentPlayer.team != eTeam.Black && val.score > x.score)
			{
				bestTurns[i] = {score: val.score, index: val.index};
				break ;
			}
		}
	}
	match.simulationMap.clear();
	if (DEBUGresultBUFFER)
	{
		fs.writeFileSync("AI_log", DEBUGresultBUFFER);
		DEBUGresultBUFFER = "";
		DEB = 0;
	}
	if (match.currentPlayer.team != DEBUGTEAM)
		throw (`AI: Team has changed..`);
	refreshCastling(match);
	if (bestTurns.length == 0)
	{//@ts-ignore
		ai.defeatStatus = 1;
		return ({Turn: playableTurn[Math.floor(Math.random() * 100000) % playableTurn.length], Score: 0});
	}
	if (bestTurns.length == 1)
		return ({Turn: arrayTurns[bestTurns[0].index], Score: bestTurns[0].score});
	if (match.currentPlayer.team == eTeam.Black)
	{
		bestTurns[0].score = -bestTurns[0].score;
		bestTurns[1].score = -bestTurns[1].score;
	}
	if (DEBUG_AI_TRAINING)
		bestTurnIdx = bestTurns[rngProportional(bestTurns[0].score, bestTurns[1].score)];
	else
		bestTurnIdx = bestTurns[0].score > bestTurns[1].score ? bestTurns[0] : bestTurns[1];
	return ({Turn: arrayTurns[bestTurnIdx.index], Score: bestTurnIdx.score});
}

/*

- eval: 			figli 0 mangiate
- quiescence: 		figli >= 1 mangiate
- arrayTurns(mosse):salvare bool array?
- turn:				turn.canEat

round 0 - eval	false
R0-1
R0-2
R0-3

round 0 - eval	true
R0-1 	scartate?
R0-2X	quiescence
R0-3 	scartate?

*/

/**
 * 
 * @param {Match} match 
 * @param {AI<null>} ai 
 * @param {Array<Turn>} arrayTurns 
 * @param {number} depth 
 * @param {Array<Turn>} pastTurns 
 * @param {number} alpha 
 * @param {number} beta 
 * @returns 
 */
function minMax(match, ai, arrayTurns, depth, pastTurns, alpha, beta)
{//@ts-ignore
	let	newTurns;
	let val;
	let	lostTeam;
	let	score;

	score = match.simulationMap.get(match.zobristIndex);
	if (score)
	{
		return (score);
	}
	//NOTE = quiescence check
	//@ts-ignore
	if ((depth == ai.quiescenceDepth) || (depth <= 0 && !arrayTurns.canEat))
		return (evalScore(match, ai, pastTurns));
	lostTeam = checkLostAll(match);
	if (lostTeam)
		return (evalScore(match, ai, pastTurns, lostTeam));
	if (match.currentPlayer.team == eTeam.White)
	{
		let maxEval = undefined;
		let i = -1;
		for (const turn of arrayTurns)
		{
			++i;
			if (depth <= 0 && (turn.canEat == false || !checkEatChain(match, turn)))
				continue ;
			if (execTurn(match, turn, pastTurns) == false)
				continue ;
			newTurns = getLegalMoves(match);
			pastTurns.push(turn);
			ai.Simulate(match, ai);
			if (ai.memory && match.zobristIndex in ai.memory && (!DEBUG_AI_TRAINING ||
			rngProportional(100, 50)))
			{
				val = ai.memory[match.zobristIndex][0];
			}
			else if (match.victory)
				val = victoryScore(match);
			else //@ts-ignore
				val = minMax(match, ai, newTurns, depth - 1, pastTurns, alpha, beta);
			if (val == undefined)
			{
				cancelTurn(match, turn);
				continue ;
			}
			if (DEBUGresultBUFFER != null)
				DEBUGresultBUFFER += `|depth: ${depth}|val: ${val}|i: ${DEB++}|team: ${match.currentPlayer.team == eTeam.White ? "⚪" : "⚫️"}|\n`;
			if (maxEval == undefined)
				maxEval = -Infinity;
			ai.Cancel(match, ai);
			pastTurns.pop();
			maxEval = Math.max(val, maxEval);
			cancelTurn(match, turn);
			if (maxEval == +Infinity)
				break ;
			alpha = Math.max(maxEval, alpha);
			if (beta <= alpha)
				break ;
		}
		if (maxEval == undefined)
			return (evalScore(match, ai, pastTurns));
		return (maxEval);
	}
	else
	{
		let minEval = undefined;
		let i = -1;
		for (const turn of arrayTurns)
		{
			++i;
			if (depth <= 0 && (turn.canEat == false || !checkEatChain(match, turn)))
				continue ;
			if (execTurn(match, turn, pastTurns) == false)
				continue ;
			newTurns = getLegalMoves(match);
			pastTurns.push(turn);
			ai.Simulate(match, ai);//@ts-ignore
			if (ai.memory&& match.zobristIndex in ai.memory && (!DEBUG_AI_TRAINING ||
			rngProportional(100, 50)))
			{
				val = ai.memory[match.zobristIndex][0];
			}
			else if (match.victory)
				val = victoryScore(match);
			else //@ts-ignore
				val = minMax(match, ai, newTurns, depth - 1, pastTurns, alpha, beta);
			if (val == undefined)
			{
				cancelTurn(match, turn);
				continue ;
			}
			if (minEval == undefined)
				minEval = Infinity;
			ai.Cancel(match, ai);
			pastTurns.pop();
			minEval = Math.min(val, minEval);
			cancelTurn(match, turn);
			if (DEBUGresultBUFFER != null)
				DEBUGresultBUFFER += `|depth: ${depth}|val: ${val}|i: ${DEB++}|team: ${match.currentPlayer.team == eTeam.White ? "⚪" : "⚫️"}|\n`;
			if (minEval == -Infinity)
				break ;
			beta = Math.min(minEval, beta);
			if (beta <= alpha)
				break ;
		}
		if (minEval == undefined)
			return (evalScore(match, ai, pastTurns));
		return (minEval);
	}
}

/**
 * 
 * @param {Match} match 
 * @param {Turn} turn 
 */
function checkEatChain(match, turn)
{
	let piece;
	let targetSquare;
	let pointWin;

	//@ts-ignore
	targetSquare = match.board._data.get(turn.move?.to);
	if (!targetSquare?.piece)
		return false;//@ts-ignore
	piece = match.board.get(turn.move.from).piece;
	pointWin = targetSquare.piece.price;
	if (isDangerous(match,targetSquare.dangerZones, match.NextPlayer().team))//@ts-ignore
		pointWin -= piece?.price;
	return pointWin > 1;
}

/**
 * 
 * @param {Match} match 
 * @param {AI<null>} ai 
 * @param {Array<Turn>} turns 
 * @param {string} lostTeam
 * @returns 
 */
function evalScore(match, ai, turns, lostTeam="")
{
	let	score;

	if (lostTeam == match.currentPlayer.team)
		score = match.currentPlayer.team == eTeam.Black? +Infinity : -Infinity;
	else if (lostTeam)
		score = match.currentPlayer.team == eTeam.Black? -Infinity : +Infinity;
	else
		score = ai.Eval(match, ai, turns);
	if (score != +Infinity && score != -Infinity && match.currentPlayer.team == eTeam.Black)
		score = -score;
	match.simulationMap.set(match.zobristIndex, score);
	return (score);
}

/**
 * 
 * @param {Match} match 
 */
function victoryScore(match)
{
	let tmp;

	if (match.victory == "draw")
		return (match.victory = "", 0);
	tmp = match.victory;
	match.victory = "";
	return (tmp == eTeam.White ? +Infinity : -Infinity);
}

export {getBestTurn};