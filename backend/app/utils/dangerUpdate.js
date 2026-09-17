// @ts-check

//SECTION - dangerUpdate function
/*
	list of exports:
	-	dangerUpdate:			updates piece targets.
	-	dangerUpdateAll:		resets the board and calculates it from scratch.
	-	dangerUpdateMove:		update all squares influenced in a movement.
	-	dangerUpdateBastards:	hardcodes the targets of bastards.
*/

import { enumNames} from "../Macro/enums.js";
import { render } from "../test/render.js";
import { movePiece } from "./movePiece.js";

/**@typedef {import("../Classes/Chess/match.js").Match} Match*/
/**@typedef {import("../Classes/Chess/player.js").Player} Player*/
/**@typedef {import("../Classes/endPoint/result.js").Result} Result*/
/**@typedef {import("../Classes/Chess/Pieces/pieces.js").Piece} Piece*/

/**
 * updates piece targets.
 * @param {Match} match 
 * @param {string | null} pos
 * @param {boolean} ignoreBoostChampsBool
 * @param {boolean} castlingBool
 * @returns 
 */
let DangerUpdate = (match, pos=null, ignoreBoostChampsBool=true, castlingBool=false) =>
{
	let	piece;
	let	startPos;

	match.cursor.Save();
	if (pos != null)
		match.cursor.set(pos);
	else
		pos = match.cursor.square;
	match.board.updates.add(pos);
	startPos = match.cursor.square;
	match.board.ResetTargets(startPos);
	piece = match.board.get(match.cursor.square).piece;
	if (piece == null)
		return (match.cursor.Restore());
	piece.pos = pos;
	for (let {dx, dy} of piece.moveArray)
	{
		if (piece.type == enumNames.BASTARDS)
		{
			dangerUpdateBastards(match, dx, dy, piece);
			continue ;
		}
		while (movePiece(match, dy, dx))
		{ 
			match.board.AddInfluence(startPos, match.cursor.square);
			match.board.get(match.cursor.square).dangerZones.add(startPos);
			match.board.get(startPos).targetZones.add(match.cursor.square);
			if (piece.moveLongRangeDEBUG == false || match.board.get(match.cursor.square)?.piece != null || match.board.get(match.cursor.square)?.wallBool)
				break ;
		}
		match.cursor.square = startPos;
	}
	match.cursor.set(pos);
	match.board.get(pos).targetZones.delete(pos);
	match.board.get(pos).dangerZones.delete(pos);
	if (ignoreBoostChampsBool && piece.type == enumNames.CHAMPION && piece.isBoostedBool)
		return (match.cursor.Restore());
	if (piece.isBoostedBool == true)
	{//@ts-ignore
		match[piece.team].boostedPiece = pos;
		piece.moveFunction(match);
	}
	castlingUpdate(match, startPos, piece, castlingBool);
	match.board.get(pos).targetZones.delete(pos);
	match.board.get(pos).dangerZones.delete(pos);
	return (match.cursor.Restore());
}

/**
 * resets the board and calculates it from scratch.
 * @param {Match} match 
 */
function dangerUpdateAll(match)
{
	let	temp;
	let usedBoard;

	temp = match.cursor.square;
	usedBoard = match.board;
	for (let [pos, square] of usedBoard)
	{
		square.ClearZones();
	}
	for (let [pos, square] of usedBoard)
	{
		match.cursor.set(pos);
		if (square.piece && square.piece.isBoostedBool)
		{
			square.piece.moveFunction(match);
			continue ;
		}
		DangerUpdate(match);
	}
	match.cursor.set(temp);
}

/**
 * 
 * @param {Match} match 
 * @param {Array<string>} selected /* 0 = from, 1 = to
 * @param {boolean} castlingBool
 */
function dangerUpdateMoved(match, selected=[], castlingBool=false)
{
	if (selected.length != 2)
		throw ("dangerUpdateMoved must be called with two pieces: from, to"); 
	CheckInfluence(match, selected, castlingBool);
	DangerUpdate(match, selected[0], true, castlingBool);
	DangerUpdate(match, selected[1], true, castlingBool);
	updateBoostedChampions(match, selected);
}

/*		
	//NOTE - objects used by dangerUpdateBastards.

										dy/dx	dy/dx	dy/dx
	red/white: SOUTH, dy positivo  -->	1, 0	1,-1	1,1
	yellow/black: NORTH dy negativo		-1, 0	-1,-1	-1,1
	blue: WEST dx positivo				0, 1	-1,1	1,1
	green: EAST dx positivo				0, -1	-1,-1	1,-1
*/
let bastardMove = // aggiornato movimenti
{
	white: new Set(["1|0", "1|1", "1|-1"]),
	yellow: new Set(["1|0", "1|1", "1|-1"]),
	black: new Set(["-1|0", "-1|-1", "-1|1"]),
	red: new Set(["-1|0", "-1|-1", "-1|1"]),
	blue: new Set(["0|1", "-1|1", "1|1"]),
	green: new Set(["0|-1", "-1|-1", "1|-1"])
}

/**
 * hardcodes the targets of bastards.
 * 
 * @param {Match} match
 * @param {Number} dy
 * @param {Number} dx
 * @param {*} piece
 */
function dangerUpdateBastards(match, dy, dx, piece)
{
	let	target;
	let	startPos;
	let	targetPos;

	if (piece.type != enumNames.BASTARDS)
		return true;
	//@ts-ignore
	if (!bastardMove[piece.team])
		throw ("dangerUpdateBastards: unknown piece team");
	// @ts-ignore
	match.cursor.Save();
	startPos = match.cursor.square;
	if (match.cursor.moveRow(dy) == false)
		return (false);
	if (match.cursor.moveCol(dx) == false)
		return (match.cursor.Restore(), false);
	if (match.board.get(match.cursor.square).wallBool == true)
		return (match.cursor.Restore(), false);
	match.board.AddInfluence(startPos, match.cursor.square);//@ts-ignore
	if (!bastardMove[piece.team].has(`${dy}|${dx}`))
		return (match.cursor.Restore(), false);
	targetPos = match.cursor.square;
	target = match.board.get(targetPos).piece;
	if (dx != 0 && dy != 0)//NOTE - bastards moves diagonally
	{
		match.board.get(targetPos).dangerZones.add(startPos);
		match.cursor.Restore();
		if (!target || target.team == piece.team)
			return (false);
		match.board.get(startPos).targetZones.add(targetPos);
		return (true);
	}
	else if (target)//NOTE - bastards moves front
	{
		addLongBastardInfluence(match, dx, dy, startPos, piece);
		return (match.cursor.Restore(), false);
	}
	match.board.get(startPos).targetZones.add(targetPos);
	addLongBastardInfluence(match, dx, dy, startPos, piece);
	if (match.board.get(match.cursor.square).wallBool == true)
		return (match.cursor.Restore(), false);
	if (!piece.moveCount && !match.board.get(match.cursor.square).piece)
	{
		match.board.get(startPos).targetZones.add(match.cursor.square);
	}
	match.cursor.Restore();
	return (true);
}

//SECTION - utils

/**
 * 
 * @param {Match} match 
 * @param {number} dx 
 * @param {number} dy 
 * @param {string} startPos 
 * @param {Piece} piece
 */
function addLongBastardInfluence(match, dx, dy, startPos, piece)
{
	match.cursor.Restore();
	match.cursor.moveRow(dy + dy);
	match.cursor.moveCol(dx + dx);
	if (!piece.moveCount)
		match.board.AddInfluence(startPos, match.cursor.square);
}

/**
 * checks if any king castling needs an update
 * @param {Match} match 
 * @param {string} startPos 
 * @param {Piece} piece 
 * @param {boolean} castlingBool
 */
function castlingUpdate(match, startPos, piece, castlingBool)
{
	/** @type {Player} */
	let player;
	let	kingCoord;
	let	kingSquare;
	let	minoSquare;

	//@ts-ignore
	player = match[piece.team];
	kingCoord = player.King;
	kingSquare = match.board.get(kingCoord);
	if (piece.type == enumNames.KING && piece.moveCount == 0)
	{
		for (const x of player.castlingArray)
			kingSquare.targetZones.add(x);
	}
	else if (castlingBool == false)
		return ;
	else if (piece.type == enumNames.MINOTAURUS && piece.moveCount == 0)
	{
		player.castlingArray.delete(startPos);
		minoSquare = match.board.get(startPos); 
		if (minoSquare.targetZones.has(kingCoord) == false || 
		kingSquare.piece?.moveCount || piece.moveCount)
		{
			if (kingSquare.targetZones.has(startPos))
				match.board.updates.add(kingCoord);
			kingSquare.targetZones.delete(startPos);
			return ;
		}
		if (kingSquare.targetZones.has(startPos) == false)
			match.board.updates.add(kingCoord);
		player.castlingArray.add(startPos);
		kingSquare.targetZones.add(startPos);
	}
}

/**
 * 
 * @param {Match} match
 * @param {Array<string>} coords
 * @param {boolean} castlingBool
 */
function CheckInfluence(match, coords, castlingBool)
{
	let setInfluence;
	let tmpInfluenceDanger = [];
	let	i;

	for (const coord of coords)
	{
		setInfluence = match.board.influenceMap.get(coord);
		if (!setInfluence)
			throw (`dangerDelPiece: invalid coord ${coord}`);
		tmpInfluenceDanger.push(new Set(setInfluence));
	}
	i = 0;
	for (const set of tmpInfluenceDanger)
	{
		for (const influenceCoord of set)
		{
			DangerUpdate(match, influenceCoord, true, castlingBool);
		}
		++i;
	}
}

/**
 * if they need an update, it is done in boost order
 * @param {Match} match
 * @param {Array<string>} coords
 */
function updateBoostedChampions(match, coords=["", ""])
{
	let arr;
	let	piece;
	let	boostedChampsCoords;

	arr = match.GetBoostedPieceCoords(true, true);
	if (!arr)
		return ;
	boostedChampsCoords = [];
	//check if at least one boosted champion needs a refresh
	for (const x of arr)
	{
		piece = match.board.get(x).piece;
		if (!piece&& x == coords[0])
			piece = match.board.get(coords[1]).piece;
		if (!piece&& x == coords[1])
			piece = match.board.get(coords[0]).piece;
		if (!piece)
		{
			render(match, [], "", true, console.log);
			console.trace();
			throw (`updateBoostedChampions: piece in ${x} does not exist`);
		}
		if (piece.type != enumNames.CHAMPION || piece.isBoostedBool == false)
			continue ;
		boostedChampsCoords.push(x);
	}
	//resets all one of them
	for (const x of boostedChampsCoords)
	{
		DangerUpdate(match, x);
	}
	//recalculate them in boost order
	for (const x of boostedChampsCoords)
	{
		DangerUpdate(match, x, false);
	}
}

export {DangerUpdate, dangerUpdateAll, dangerUpdateMoved, dangerUpdateBastards, updateBoostedChampions, movePiece};