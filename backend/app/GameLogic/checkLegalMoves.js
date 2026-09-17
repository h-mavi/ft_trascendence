//@ts-check

//SECTION - checkLegalMoves function
/*
	list of exports:
	-	getLegalMoves:	returns an array of valid moves for a player
*/

import { Square } from "../Classes/Chess/chessBoard.js";
import { Player } from "../Classes/Chess/player.js";
import { arrayNamesDoubleMove, enumNames } from "../Macro/enums.js";
import { isDangerous } from "../utils/checkDanger.js";
import { isOneOf } from "../utils/string.js";
import { render } from "../test/render.js";
import { simulation } from "./simulation.js";
import { movePiece } from "../utils/movePiece.js";

/** @typedef {import("../Classes/Chess/match").Match} Match*/
/** @typedef {{from: string, to: string}} Move */
/** @typedef {{move: Move | null, moveBoost: Move | null, transform: string, boost: string, canEat?: boolean, attacker?: number, eaten?: number}} Turn */


/**
 * returns an array of valid moves for a player.
 * the array elements are formatted as: {from: coord, to: coord}.
 * @param {Match} match 
 * @param {string} team
 * @returns {Array<Turn>}
 * */
export function getLegalMoves(match, team=match.currentPlayer.team, infoBool=true)
{
	let	targetSquare;
	/** @type {Map<string, Set<string>>} */
	let	legalMovesMap = new Map();
	/** @type {Map<string, Set<string>>} */
	let	legalMovesEatMap = new Map();
	/** @type {Map<string, Set<string>>} */
	let	legalBoostedMovesMap = new Map();
	/** @type {Map<string, Set<string>>} */
	let	legalBoostedMovesEatMap = new Map();
	/** @type {Array<Turn>} */
	let	legalMovesArray = new Array();
	/** @type {Player} */
	let	player;
	let	bastardStrongBoostSet;
	let tmp;

	for (const [coord, square] of match.board)
	{
		if (square.piece?.type == enumNames.KING)
			tmp = structuredClone(square.targetZones);
		else
			tmp = square.targetZones;
		if (square.piece?.team != team)
			continue ;
		for (const targetCoord of tmp)
		{
			targetSquare = match.board.get(targetCoord);
			if (targetSquare.piece?.team == square.piece?.team)
				continue ;
			if (square.piece?.type == enumNames.KING)
			{
				if (isDangerous(match, targetSquare.dangerZones, square.piece?.team))
					continue ;
			}
			if (infoBool == false)
			{
				if (square.piece.type != enumNames.KING)//@ts-ignore
					return false;
				else
				{
					let currTeam = match.currentPlayer.team;
					match.endTurn();
					if (targetSquare.piece && targetSquare.piece?.team == match.board.get(coord).piece?.team)
						continue ;
					if (simulation([coord, targetCoord], match) == true)
					{
						while (currTeam != match.currentPlayer.team)
							match.endTurn();//@ts-ignore
						return false;
					}
					while (currTeam != match.currentPlayer.team)
						match.endTurn();
				}
			}
			if (targetSquare.piece)
			{
				if (legalMovesEatMap.has(coord) == false)
					legalMovesEatMap.set(coord, new Set());
				legalMovesEatMap.get(coord)?.add(targetCoord);//@ts-ignore
				legalMovesArray.canEat = true;
			}
			else
			{
				if (legalMovesMap.has(coord) == false)
					legalMovesMap.set(coord, new Set());
				legalMovesMap.get(coord)?.add(targetCoord);
			}
		}
		if (square.piece.isBoostedBool == false)
			continue ;
		if (square.piece.type == enumNames.BASTARDS)
		{
			for (const target of square.targetZones)
			{
				if (!checkBoostedMoves(match, legalMovesArray, legalBoostedMovesEatMap, legalBoostedMovesMap, infoBool, coord, square, target))//@ts-ignore
					return (false);
			}
		}
		else
		{
			for (const [target, set] of square.boostedTargetZones)
			{
				if (target == coord)
				{
					for (const target1 of set)
					{
						if (!checkBoostedMoves(match, legalMovesArray, legalBoostedMovesEatMap, legalBoostedMovesMap, infoBool, coord, square, target1))//@ts-ignore
							return (false);
					}
					break ;
				}
				if (!checkBoostedMoves(match, legalMovesArray, legalBoostedMovesEatMap, legalBoostedMovesMap, infoBool, coord, square, target))//@ts-ignore
					return (false);
			}
		}
	}
	if (infoBool == false)//@ts-ignore
		return (true);
	player = match.GetPlayer(team);
	bastardStrongBoostSet = getStrongBastardsBoost(match, team);
	for (const [coord, targetSet] of legalMovesEatMap)
	{
		for (const targetCoord of targetSet)
			pushChildMoves(match, player, legalMovesArray, bastardStrongBoostSet, {from: coord, to: targetCoord}, false, true);
	}
	for (const [coord, targetSet] of legalMovesMap)
	{
		for (const targetCoord of targetSet)
			pushChildMoves(match, player, legalMovesArray, bastardStrongBoostSet, {from: coord, to: targetCoord});
	}
	for (const [coord, targetSet] of legalBoostedMovesEatMap)
	{
		for (const targetCoord of targetSet)
			pushChildMoveBoosts(match, player, legalMovesArray, bastardStrongBoostSet, {from: coord, to: targetCoord}, true);
	}
	for (const [coord, targetSet] of legalBoostedMovesMap)
	{
		for (const targetCoord of targetSet)
			pushChildMoveBoosts(match, player, legalMovesArray, bastardStrongBoostSet, {from: coord, to: targetCoord});
	}
	legalMovesArray.sort(optimizeSort);
	return (legalMovesArray);
}

//SECTION - utils

/**
 * 
 * @param {Match} match
 * @param {Array<Turn>} legalMovesArray
 * @param {Map<string, Set<string>>} legalBoostedMovesMap 
 * @param {Map<string, Set<string>>} legalBoostedMovesEatMap
 * @param {boolean} infoBool
 * @param {string} coord 
 * @param {Square} square
 * @param {string} target
 * */
function checkBoostedMoves(match, legalMovesArray, legalBoostedMovesEatMap, legalBoostedMovesMap, infoBool, coord, square, target)
{
	let	tmpMap;
	let	targetSquare;

	targetSquare = match.board.get(target);
	if (targetSquare.piece?.team == square.piece?.team)
		return true;
	if (infoBool == false)
		return false;
	if (targetSquare.piece)
	{
		tmpMap = legalBoostedMovesEatMap;//@ts-ignore
		legalMovesArray.canEat = true;
	}
	else
		tmpMap = legalBoostedMovesMap;
	if (tmpMap.has(coord) == false)
		tmpMap.set(coord, new Set());
	tmpMap.get(coord)?.add(target);
	return true;
}

/**
 * returns an array of valid moves for a player.
 * the array elements are formatted as: {from: coord, to: coord}.
 * @param {Match} match 
 * @param {Player} player
 * @param {Array<Turn>} legalMovesArray
 * @param {Set<string>} bastardStrongBoostSet
 * @param {Move} move
 * @param {boolean} boostBool
 * @param {boolean} eatBool
 * */
function pushChildMoves(match, player, legalMovesArray, bastardStrongBoostSet, move, boostBool=false, eatBool=false)
{
	let	currTurn;

	if (boostBool == false)
		currTurn = {move: move, moveBoost: null, boost: "", transform: "", canEat: eatBool};
	else
		currTurn = {move: null, moveBoost: move, boost: "", transform: "", canEat: eatBool};
	addTransform(match, player, legalMovesArray, currTurn, move.to, match.board.get(move.from));
	formatMVV(match, currTurn);
	legalMovesArray.push(currTurn);
	if (currTurn.transform)
		return ;
	pushAllLegalBoost(match, player, legalMovesArray, currTurn, bastardStrongBoostSet);
}

/**
 * returns an array of valid moves for a player.
 * the array elements are formatted as: {from: coord, to: coord}.
 * @param {Match} match 
 * @param {Player} player
 * @param {Array<Turn>} legalMovesArray
 * @param {Set<string>} bastardStrongBoostSet
 * @param {Move} move
 * @param {boolean} eatBool
 * */
function pushChildMoveBoosts(match, player, legalMovesArray, bastardStrongBoostSet, move, eatBool=false)
{
	let	currTurn;
	let	boostedSquare;

	boostedSquare = null;
	if (player.boostedPiece != '')
		boostedSquare = match.board.get(player.boostedPiece);
	else
		return ;
	if (!boostedSquare?.piece)
		throw (`pushChildMoves: coord ${player.boostedPiece}, boostedSquare ${boostedSquare} has no piece`);
	if (!isOneOf(boostedSquare.piece.type, arrayNamesDoubleMove))
		return (pushChildMoves(match, player, legalMovesArray, bastardStrongBoostSet, move, true, eatBool));
	if (!match.board.get(move.from).boostedTargetZones.size)
		return ;
	if (boostedSquare.piece.type == enumNames.BASTARDS)
	{
		for (const [k, targetSet] of boostedSquare.boostedTargetZones)
		{
			for (const target of targetSet)
				pushSecondBastardMove(match, player, legalMovesArray, bastardStrongBoostSet, move, boostedSquare, target);
		}
		return ;
	}
	for (let [key, value] of match.board.get(move.from).boostedTargetZones)
	{
		for (let zone of value)
		{
			if (move.from == key || move.to == zone)
				continue ;
			if (move.to != key)
				continue ;
			currTurn = {move: move, moveBoost: {from: key, to: zone}, boost: "", transform: ""};
			formatMVV(match, currTurn);
			legalMovesArray.push(currTurn);
			pushAllLegalBoost(match, player, legalMovesArray, currTurn, bastardStrongBoostSet, true);
		}
	}
}

/**
 * returns an array of valid moves for a player.
 * the array elements are formatted as: {from: coord, to: coord}.
 * @param {Match} match 
 * @param {Player} player
 * @param {Array<Turn>} legalMovesArray
 * @param {Set<string>} bastardStrongBoostSet
 * @param {Move} move
 * @param {Square} bastardSquare
 * @param {string} secondCoord the second pieceCoord
 * */
function pushSecondBastardMove(match, player, legalMovesArray, bastardStrongBoostSet, move, bastardSquare, secondCoord)
{
	/** @type {Turn} */
	let	currTurn;
	let	secondSquare;
	let	targetSquare;
	let	dir;

	secondSquare = match.board.get(secondCoord);
	if (!secondSquare.piece)
		throw (`pushSecondBastardMove: no piece in coord "${secondCoord}"`);
	for (const target of secondSquare.targetZones)
	{
		targetSquare = match.board.get(target);
		if (!targetSquare.piece)
			continue ;
		if (targetSquare.piece.team == player.team)
			continue ;
		currTurn = {move: move, moveBoost: {from: secondCoord, to: target}, boost: "", transform: ""};
		formatMVV(match, currTurn);
		legalMovesArray.push(currTurn);
		pushAllLegalBoost(match, player, legalMovesArray, currTurn, bastardStrongBoostSet, true);
	}
	if (secondSquare.piece.type == enumNames.BASTARDS && !bastardSquare.influenceZones.has(secondCoord))
		return ;
	else if (secondSquare.piece.type != enumNames.BASTARDS && secondSquare.targetZones.has(move.from) == false)
		return ;
	//NOTE - movimenti fantasma senza pedone
	match.cursor.Save();
	match.cursor.set(secondCoord);
	dir = match.cursor.Diff(move.from, secondCoord);
	while (movePiece(match, dir.col, dir.row))
	{
		if (match.cursor.square == move.to)
			break ;
		targetSquare = match.board.get(match.cursor.square);
		if (!targetSquare.piece)
			continue ;
		if (match.cursor.square != move.from && targetSquare.piece.team == player.team)
			break ;
		currTurn = {move: move, moveBoost: {from: secondCoord, to: match.cursor.square}, boost: "", transform: ""};
		currTurn.canEat = true;
		formatMVV(match, currTurn);
		legalMovesArray.push(currTurn);
		pushAllLegalBoost(match, player, legalMovesArray, currTurn, bastardStrongBoostSet, true);
		break ;
	}
	match.cursor.Restore();
}

/**
 * 
 * @param {Match} match 
 * @param {Turn} currTurn 
 */
function formatMVV(match, currTurn)
{
	let tmp;
	let tmp2;

	if (!currTurn.canEat)
			return ;
	if (!currTurn.move && currTurn.moveBoost)
	{
		currTurn.attacker = match.board.get(currTurn.moveBoost.from).piece?.price;
		currTurn.eaten = match.board.get(currTurn.moveBoost.to).piece?.price;
	}
	else if (currTurn.move && !currTurn.moveBoost)
	{
		currTurn.attacker = match.board.get(currTurn.move.from).piece?.price;
		currTurn.eaten = match.board.get(currTurn.move.to).piece?.price;
	}
	else if (currTurn.move && currTurn.moveBoost)
	{
		if (currTurn.move.to != currTurn.moveBoost.from)
			return ;
		tmp = match.board.get(currTurn.move.to).piece;
		tmp2 = match.board.get(currTurn.moveBoost.to).piece;
		currTurn.attacker = match.board.get(currTurn.move.from).piece?.price;
		currTurn.eaten = 0;
		if (tmp2) //@ts-ignore
			currTurn.eaten += match.board.get(currTurn.moveBoost.to).piece?.price;
		if (tmp) //@ts-ignore
			currTurn.eaten += match.board.get(currTurn.move.to).piece?.price;
	}
}

/**
 * returns an array of valid moves for a player.
 * the array elements are formatted as: {from: coord, to: coord}.
 * TO OPTIMIZE AI speed, boosts are considered only when:
 * 1)	player has no boosted piece;
 * 2)	only the most expensive boost is considered
 * @param {Match} match 
 * @param {Player} player
 * @param {Array<Turn>} legalMovesArray
 * @param {Turn} currTurn
 * @param {Set<string>} bastardStrongBoostSet
 * @param {boolean} usedBoostBool
 * */
function pushAllLegalBoost(match, player, legalMovesArray, currTurn, bastardStrongBoostSet, usedBoostBool=false)
{
	/** @type {{coord: string, price: number} | null} */
	let	bestBoost = null;
	let	points;
	let	from;
	let	to;
	let	toPiece;

	from = currTurn.move? currTurn.move.from : currTurn.moveBoost?.from;
	to = currTurn.moveBoost? currTurn.moveBoost.to : currTurn.move?.to;//@ts-ignore
	toPiece = match.board.get(to).piece;
	points = player.nPoints + (toPiece && toPiece.team != player.team ? toPiece?.price : 0); 
	if (points == 0)
		return ;
	for (const [coord, square] of match.board)
	{
		if (coord == from)
			continue ;
		if (coord == to)//@ts-ignore
			toPiece = match.board.get(from).piece;
		else
			toPiece = square.piece;
		if (!toPiece)
			continue ;
		if (toPiece.team != player.team)
			continue ;
		if (toPiece.type == enumNames.KING)
			continue ;
		if (toPiece.price > points)
			continue ;
		if (toPiece.type == enumNames.KING)
			continue ;
		if (coord == player.boostedPiece || (coord == to && from == player.boostedPiece))
			continue ;
		if (toPiece.type == enumNames.BASTARDS && !bastardStrongBoostSet.has(coord))
			continue ;
		if (!bestBoost || toPiece.price > bestBoost.price)
			bestBoost = {coord: coord, price: toPiece.price};
		else if (toPiece.type == enumNames.JESTER && toPiece.moveCount == 0)
		{
			pushOneBoost(coord, legalMovesArray, currTurn);
		}
	}
	if (!bestBoost)
		return ;
	pushOneBoost(bestBoost.coord, legalMovesArray, currTurn);
}

/**
 * returns an array of valid moves for a player.
 * the array elements are formatted as: {from: coord, to: coord}.
 * TO OPTIMIZE AI speed, boosts are considered only when:
 * 1)	player has no boosted piece;
 * 2)	only the most expensive boost is considered
 * @param {string} coord
 * @param {Array<Turn>} legalMovesArray
 * @param {Turn} currTurn
 * */
function pushOneBoost(coord, legalMovesArray, currTurn)
{
	let	turnWithBoost;

	turnWithBoost = structuredClone(currTurn);
	if (coord != turnWithBoost.move?.from && coord != turnWithBoost.moveBoost?.from)
		turnWithBoost.boost = coord;
	else if (turnWithBoost.moveBoost)
		turnWithBoost.boost = turnWithBoost.moveBoost.to;
	else //@ts-ignore
		turnWithBoost.boost = turnWithBoost.move.to;
	legalMovesArray.push(turnWithBoost);
}

/**
 * returns an array of valid moves for a player.
 * the array elements are formatted as: {from: coord, to: coord}.
 * @param {Match} match 
 * @param {Player} player
 * @param {Array<Turn>} legalMovesArray
 * @param {Turn} currTurn
 * @param {string} destCoord
 * @param {Square} square
 * */
function addTransform(match, player, legalMovesArray, currTurn, destCoord, square)
{
	let	bastardEdgeBool;
	let edgeBool;

	match.cursor.Save();
	match.cursor.set(destCoord);
	if (!square.piece)
		throw ("");
	edgeBool = match.cursor.EdgeCheck(player.team);
	bastardEdgeBool = square.piece.type == enumNames.BASTARDS && edgeBool;
	match.cursor.Restore();
	if (!bastardEdgeBool)
		return false;
	currTurn.transform = enumNames.CHAMPION;
	return true;
}

/**
 * 
 * @param {Match} match 
 * @param {string} team 
 */
function getStrongBastardsBoost(match, team)
{
	/** @type {Set<string>} */
	let	set = new Set;
	let	allySquare;

	for (const [coord, square] of match.board)
	{
		if (square.piece?.team != team)
			continue ;
		if (square.piece.type != enumNames.BASTARDS)
			continue ;
		if (square.piece.moveCount == 0)
			continue ;
		if (square.targetZones.size == 0)
			continue ;
		for (const allyCoord of square.influenceZones)
		{
			allySquare = match.board.get(allyCoord);
			if (allySquare.piece?.team != team)
				continue ;
			if (allySquare.piece.type == enumNames.BASTARDS)
				continue ;
			if (square.targetZones.has(allyCoord) && square.targetZones.size == 1)
				continue ;
			set.add(coord);
			break ;
		}
	}
	return (set);
}

/**
 * 
 * @param {Turn} turn1 
 * @param {Turn} turn2 
 */
function optimizeSort(turn1, turn2)
{
	if (!turn1.attacker && !turn2.attacker)
		return 0;
	else if (!turn1.attacker)
		return 1;
	else if (!turn2.attacker)
		return -1;//@ts-ignore
    return (turn2.eaten - turn2.attacker) - (turn1.eaten - turn1.attacker);
}
