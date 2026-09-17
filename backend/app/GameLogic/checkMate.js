// @ts-check

//SECTION - checkMate functions
/*
	list of exports:
	-	checkMateCheckAll: checks if every active player is in check/staleMate
	-	checkLostAll: checks if someone has lost (without deleting the player)
*/

import { Result } from "../Classes/endPoint/result.js";
import { enumNames } from "../Macro/enums.js";
import { Match } from "../Classes/Chess/match.js";
import { isDangerous } from "../utils/checkDanger.js";
import { movePiece, getDirection } from "../utils/movePiece.js";
import { Square } from "../Classes/Chess/chessBoard.js";
import { pathFinding } from "./pathFinding.js";
import { simulation, simulationGlobal } from "./simulation.js";
import { getLegalMoves } from "./checkLegalMoves.js";
import {preset} from "../Classes/Chess/Pieces/preset.js";
import { render } from "../test/render.js";
import { Piece } from "../Classes/Chess/Pieces/pieces.js";

/**
 * checks if a player is in checkMate
 * @param {Match} match
 * @param {string} kingCoord
 */
function CheckMateCheck(match, kingCoord=match.currentPlayer.King)
{
	let threat = new Set;
	let kingSquare;
	let enemySquare;
	let enemyCoord;
	let	stopBool;
	let team;

	kingSquare = match.board.get(kingCoord);
	if (!kingSquare || !kingSquare.piece)
		throw (`missing king for team`);
	team = kingSquare.piece.team;
	if (!isDangerous(match, kingSquare.dangerZones, team))
		return false;
	if (canDodge(match, kingSquare) == true)
		return false;
	enemyCoord = findThreats(match, threat, kingSquare, team);
	if (threat.size == 2 && doubleSave(match, threat))
		return true;
	if (threat.size >= 2)
		return true;
	if (!enemyCoord)
		return false;
	enemySquare = match.board.get(enemyCoord);
	if (isDangerous(match, enemySquare.dangerZones, enemySquare.piece?.team))
		return (cantMovePiece(match, enemyCoord, enemySquare, kingCoord));
	stopBool = isStoppable(match, kingCoord, enemyCoord);
	return (!stopBool);
}

/**
 * checks if every active player is in check/staleMate
 * @param {Match} match 
 * @param {Result | null} result
 */
function checkMateCheckAll(match, result)
{
	let currTeam;

	currTeam = match.currentPlayer.team;
	match.endTurn();
	while (currTeam != match.currentPlayer.team)
	{
		if (CheckMateCheck(match))
		{
			match.PlayerLost(result);//@ts-ignore
		}
		match.endTurn();
	}
	// @ts-ignore
	if (match.playerNum == 1)
		return (match.CheckMate(result), true);//@ts-ignore
	if (getLegalMoves(match, match.currentPlayer.next, false) == true)
	{
		return (match.DrawMatch(result, "Spare"), true);
	}
	while (currTeam != match.currentPlayer.team)
		match.endTurn();
	return (false);
}

/**
 * checks if someone has lost (without deleting the player)
 * @param {Match} match 
 */
function checkLostAll(match)
{
	let	lostTeam;
	let	currTeam;

	lostTeam = "";
	currTeam = match.currentPlayer.team;
	do
	{
		if (CheckMateCheck(match))
		{
			lostTeam = match.currentPlayer.team;
		}
		match.endTurn();
	}
	while (currTeam != match.currentPlayer.team)
	return (lostTeam);
}

/*

*/

/**
 * Checks if a piece that is menacing the king can be eaten
 * @param {Match} match
 * @param {string} kingSquare 
 * @param {string} enemyCoord 
 * @param {Square | null} enemySquare
 * @param {boolean} recBool
 * @param {boolean} simBool
 * @param {Piece | null | undefined} kingPiece
 * @returns {boolean} 
 */
function isStoppable(match, kingSquare, enemyCoord, enemySquare=null, recBool=false, simBool=false, kingPiece=null)
{
	let	square;
	let	dir;
	let	guardianSquare;
	let	guardianPiece;
	let	normalSaveBool = false;
	let	allyGuardianCoord = "";
	let	influenceCoords;
	let	startPos;
	let	tmpCursor;

	tmpCursor = match.cursor.square;
	match.cursor.square = enemyCoord;
	match.currentPlayer.guardianPieces.clear();
	if (!enemySquare)
		enemySquare = match.board.get(enemyCoord);
	if (!kingPiece)
		kingPiece = match.board.get(kingSquare).piece;
	if (!enemySquare || !kingPiece)
		throw ("given to isStoppable an invalid position");
	if (!enemySquare.piece)
		throw ("isStoppable: enemy undefined");
	if (enemySquare.piece.type == enumNames.JESTER || 
	enemySquare.piece.type == enumNames.BASTARDS || 
	(enemySquare.piece.type == enumNames.VALKIRYA && 
	enemySquare.piece.isBoostedBool == true) ||
	match.board.get(kingSquare)?.targetZones.has(enemyCoord))
		return (match.cursor.square = tmpCursor, false);
	else if ((enemySquare.piece.type == enumNames.CHAMPION) && enemySquare.piece.isBoostedBool && !recBool)
		return (match.cursor.square = tmpCursor, canStopTheChampion(match, kingSquare, enemySquare, enemyCoord));
	dir = getDirection(match, kingSquare, enemyCoord);
	if (enemySquare.piece.type == enumNames.MINOTAURUS && enemySquare.piece.isBoostedBool && !enemySquare.targetZones.has(kingSquare))
	{
		for (let [key, val] of enemySquare.boostedTargetZones)
		{
			if (val.has(kingSquare))
			{
				dir = getDirection(match, kingSquare, key);
				break ;
			}
		}
	}
	startPos = match.cursor.square;
	while (match.cursor.square != kingSquare)
	{
		allyGuardianCoord = "";
		square = match.board.get(match.cursor.square);
		if (square.piece && startPos != match.cursor.square)
		{
			if (enemySquare.boostedTargetZones.has(match.cursor.square) == false)
				return (match.cursor.square = tmpCursor, true);
			if (recBool)
				return (match.cursor.square = tmpCursor, true);
			return (match.cursor.square = tmpCursor, isStoppable(match, kingSquare, match.cursor.square, enemySquare, true));
		}
		if (!square.dangerZones)
			continue ;
		influenceCoords = match.board.influenceMap.get(match.cursor.square);
		if (!influenceCoords)
			continue ;
		influenceCoords = structuredClone(influenceCoords);
		for (let x of influenceCoords)
		{
			guardianSquare = match.board.get(x);
			guardianPiece = guardianSquare.piece;
			if (!guardianPiece)
				throw (`isStoppable: guardian of ${match.cursor.square} in ${x} missing`);
			if (guardianPiece.type == enumNames.BASTARDS && !guardianSquare.targetZones.has(match.cursor.square))
				continue ;
			if (x == kingSquare)
				continue ;
			if (guardianPiece.team != kingPiece.team)
			{
				if  (!match.settings.players.allies || guardianPiece.team != match.currentPlayer.ally || match.currentPlayer.next != enemySquare.piece?.team)
					continue ;
				else
					allyGuardianCoord = x;
			}
			let	guardianBoostedSave = false;
			let	guardianRegularSave = false;

			if (guardianSquare.targetZones.has(match.cursor.square) && square.piece == null && !checkDir(match, kingSquare, x, enemyCoord))
			{
				guardianRegularSave = true;
			}
			for (let [key, val] of guardianSquare.boostedTargetZones)
			{
				if (val.has(match.cursor.square))
				{
					guardianBoostedSave = true;
					break ;
				}
			}
			if (guardianRegularSave)
			{
				if (/* !simBool ||  */simulation([x, match.cursor.square], match, null) == true)
					normalSaveBool = true;
			}
			if (guardianBoostedSave)
			{
				if (/* !simBool ||  */simulation([x, match.cursor.square], match, null) == true)
					match.currentPlayer.guardianPieces.add({coord: x, target: match.cursor.square});
			}
		}
		if (!movePiece(match, dir.diffCol, dir.diffRow))
		{
			if (enemySquare.boostedTargetZones.has(match.cursor.square) == false)
				return (match.cursor.square = tmpCursor, true);
			if (recBool)
				return (match.cursor.square = tmpCursor, true);
			return (isStoppable(match, kingSquare, match.cursor.square, enemySquare, true));
		}
	}
	if (normalSaveBool == true || match.currentPlayer.guardianPieces.size > 0)
	{
		if (allyGuardianCoord)//@ts-ignore
			match[match.currentPlayer.ally].allieGuardianCoord = allyGuardianCoord;
		return (match.cursor.square = tmpCursor, true);
	}
	return (match.cursor.square = tmpCursor, false);
}

/**
 * 
 * @param {Match} match 
 * @param {string} king 
 * @param {string} guard 
 * @param {string} enemy 
 */
function checkDir(match, king, guard, enemy)
{
	let rowK, rowE, rowG;
	let colK, colE, colG;
	let tmp;

	tmp = match.cursor.square;
	match.cursor.square = king;
	rowK = match.cursor.getRow();
	colK = match.cursor.getCol();
	match.cursor.square = enemy;
	rowE = match.cursor.getRow();
	colE = match.cursor.getCol();
	match.cursor.square = guard;
	rowG = match.cursor.getRow();
	colG = match.cursor.getCol();
	match.cursor.square = tmp;

	const dKr = rowK - rowE, dKc = colK - colE;
	const dGr = rowG - rowE, dGc = colG - colE;

	const cross = dKr * dGc - dKc * dGr;
	if (cross !== 0) return false;

	const dot = dKr * dGr + dKc * dGc;
	if (dot <= 0) return false;

	const distK2 = dKr * dKr + dKc * dKc;
	const distG2 = dGr * dGr + dGc * dGc;
	if (distG2 >= distK2) return false;

	return true;
}

/**
 * 
 * @param {Match} match
 * @param {string} startPos 
 * @param {string} target 
 * @returns 
 */
function canEat(match, startPos, target)
{
	match.cursor.set(startPos);
	match.cursor.setCol(match.cursor.getCol() - 1);
	if (match.cursor.square != target)
	{
		match.cursor.setCol(match.cursor.getCol() + 2);
		if (match.cursor.square != target)
		{
			match.cursor.set(startPos);
			return true;
		}
	}
	match.cursor.set(startPos);
	return false;
}

/**
 * 
 * @param {Match} match
 * @param {Set<string>} threat 
 */
function doubleSave(match, threat)
{
	let arr = Array.from(threat);
	let	square1;
	let	square2;

	square1 = match.board.get(arr[0]);
	if (!square1)
		return false;
	square2 = match.board.get(arr[1]);
	if (!square2)
		return false;
	for (let x of square1.dangerZones)
	{
		if (square2.dangerZones.has(x) && match.board.get(x)?.piece?.team != square1.piece?.team && match.board.get(x)?.piece?.isBoostedBool && 
		(match.board.get(x)?.piece?.type == enumNames.MINOTAURUS || match.board.get(x)?.piece?.type == enumNames.CHAMPION))
		{
			let threat = match.board.get(x);
			if (threat == undefined)
				return false;
			for (let [key, value] of threat.boostedTargetZones)
			{
				if ((key == arr[0] && value.has(arr[1])) || (key == arr[1] && value.has(arr[0])))
					return true;
			}
		}
		else if (match.board.get(x)?.piece?.team != square1.piece?.team && 
		match.board.get(x)?.piece?.isBoostedBool && match.board.get(x)?.piece?.type == enumNames.BASTARDS)
		{
			let startPos = x;
			if (canEat(match, x, arr[1]))
			{
				match.cursor.set(x);
				for (let {dx, dy} of preset.Champion.movement)
				{
					match.cursor.setCursor(match.cursor.getRow() + dx, match.cursor.getCol() + dy);
					if (match.board.has(match.cursor.square) && match.board.get(match.cursor.square)?.piece?.team != square1.piece?.team && match.board.get(match.cursor.square)?.targetZones.has(arr[1]))
						return true;
					match.cursor.set(startPos);
				}
			}
		}
		else if (match.board.get(x)?.piece?.team != square1.piece?.team)
		{
			let startPos = x;
			match.cursor.set(x);
			for (let {dx, dy} of preset.Champion.movement)
			{
				if (!movePiece(match, dy, dx))
				{
					match.cursor.set(x);
					continue ;
				}
				if (match.board.get(match.cursor.square)?.piece?.team != square1.piece?.team && match.board.get(match.cursor.square)?.targetZones.has(arr[1]) && (
					match.board.get(match.cursor.square)?.piece?.type == enumNames.BASTARDS && match.board.get(match.cursor.square)?.piece?.isBoostedBool == true && canEat(match, match.cursor.square, arr[0])))
					return true;
				match.cursor.set(startPos);
			}
		}
	}
	return false;
}

/**
 * can the king dodge?
 * @param {Match} match 
 * @param {Square} square 
 * @returns 
 */
function canDodge(match, square)
{
	let	coord;
	let	newSquare;
	let	safeSet = new Set();
	let	piece;
	let	kingTargets;

	piece = square.piece;
	if (!piece)
		throw (`canDodge: square ${square} has undefined piece`);
	match.cursor.Save();
	coord = piece.pos;
	kingTargets = structuredClone(square.targetZones);
	for (let newCoord of kingTargets)
	{
		newSquare = match.board.get(newCoord);
		if (!isDangerous(match, newSquare.dangerZones, piece.team) && (!newSquare.piece || newSquare.piece?.team != square.piece?.team))
			safeSet.add(newCoord);
	}
	for (let x of safeSet)
	{
		if (simulation([coord, x], match) == true)
			return (match.cursor.Restore(), true);
	}
	return (false);
}

/**
 * 
 * @param {Match} match 
 * @param {Set<string>} threat
 * @param {Square} square 
 * @param {string} team
 * @returns 
 */
function findThreats(match, threat, square, team)
{
	let	enemyCoord;

	enemyCoord = null;
	for (let x of square.dangerZones)
	{
		if (match.board.get(x).piece?.team != team)
		{
			enemyCoord = x;
			threat.add(enemyCoord);
		}
	}
	return (enemyCoord);
}

/**
 * if I eat the piece that is menacing the king, 
 * a new king menace will arise?
 * @param {Match} match 
 * @param {string} enemyCoord 
 * @param {Square} enemySquare 
 * @param {string} kingCoord
 */
function cantMovePiece(match, enemyCoord, enemySquare, kingCoord)
{
	let	guardianSquare;
	let	guardianPiece;
	let	threatSquare;
	let	threatPiece;
	let	canReachKing = null;
	let	ignoredCoords;
	let kingPiece;
	let	allyGuardianCoord = "";

	ignoredCoords = new Set();
	ignoredCoords.add(enemyCoord);
	kingPiece = match.board.get(kingCoord).piece;
	if (!kingPiece)
		throw ('kingPiece null');
	for (const kingGuardianCoord of enemySquare.dangerZones)
	{
		if (kingGuardianCoord == kingCoord)
			continue ;
		ignoredCoords.add(kingGuardianCoord);
		guardianSquare = match.board.get(kingGuardianCoord);
		guardianPiece = guardianSquare.piece; 
		if (!guardianPiece)
			throw ("checkMate, cantMovePiece: guardian piece undefined");
		if (guardianPiece.team != kingPiece.team)
		{
			if  (!match.settings.players.allies || guardianPiece.team != match.currentPlayer.ally || match.currentPlayer.next != enemySquare.piece?.team)
				continue ;
			else
				allyGuardianCoord = kingGuardianCoord;
		}
		//checking every guardian danger zone
		for (const threatCoord of guardianSquare.dangerZones)
		{
			if (threatCoord == enemyCoord)//we don't care of the starting threat
				continue ;
			threatSquare = match.board.get(threatCoord);
			threatPiece = threatSquare.piece;
			if (!threatPiece)
				throw ("checkMate, cantMovePiece: threat piece undefined");
			if (threatPiece.team == guardianPiece.team)
				continue ;
			if (threatPiece.type == enumNames.JESTER)//it jumps over pieces anyway
				continue ;
			if (threatPiece.moveLongRangeDEBUG == false)//guardian not important 
				continue ;
			canReachKing = pathFinding(match, threatCoord, kingCoord, ignoredCoords, threatSquare);
			if (canReachKing != null)
				break ;
		}
		if (!canReachKing)
			return (false);
		canReachKing = null;
		ignoredCoords.delete(kingGuardianCoord);
	}
	if (allyGuardianCoord)//@ts-ignore
		match[match.currentPlayer.ally].allieGuardianCoord = allyGuardianCoord;
	return (true);
}

/**
 * 
 * @param {Match} match
 * @param {string} kingCoord
 * @param {Square} enemySquare 
 * @param {string} enemyCoord
 * @return {boolean}
 */
function canStopTheChampion(match, kingCoord, enemySquare, enemyCoord)
{
	let kingSquare;
	let keySet = new Set();

	if (enemySquare.targetZones.has(kingCoord) && !isStoppable(match, kingCoord, enemyCoord, enemySquare, true))
		return (false);
	kingSquare = match.board.get(kingCoord);
	for (let [key, val] of enemySquare.boostedTargetZones)
	{
		if (val.has(kingCoord))
			keySet.add(key);
	}
	for (let key of keySet)
	{
		if (isStoppable(match, key, enemyCoord, enemySquare, true, true, kingSquare.piece))
			continue ;
		if (!isStoppable(match, kingCoord, key, enemySquare, true, true))
			return (simulationGlobal(match));
	}
	return (true);
}

export {checkMateCheckAll, checkLostAll};