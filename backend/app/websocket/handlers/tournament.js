// @ts-check

import { Match } from "../../Classes/Chess/match.js";
import { Tournament } from "../../Classes/Chess/tournament.js";
import { Result } from "../../Classes/endPoint/result.js";
import { globals } from "../../Classes/Globals/globals.js";
import { Room } from "../../Classes/Globals/room.js";
import { SocketInfo } from "../../Classes/Globals/socketInfo.js";
import { init } from "../../handlers/game/init.js";
import { query } from "../../lib/query.js";
import { eMatchPresets, enumSocketState } from "../../Macro/enums.js";
import { isBusy, roomMessage } from "../utils.js";
import { bindPlayersToMatch } from "./MatchMaking.js";
const { tournamentsQuery, gameQuery } = query;

/** @typedef {import("../../Classes/Chess/player.js").dbUser} dbUser */
/** @typedef {import("socket.io").Socket} Socket */


/**
 * 
 * @param {{name: string, maxPlayers: number}} req 
 * @param {Socket} socket
 * @param {dbUser} user 
 */
export async function createTournamentRoomHandler(req, socket, user)
{
	let	socketData;
	let room;
	let	result;

	try
	{
		socketData = globals.clientMap.get(user.id_user);
		if (!socketData)
			throw (`create_tournament: socketData is empty`);
		if (isBusy(user.id_user) == true)
			result = new Result().Error("You are already doing something", 400);
		else
		{
			room = new Room(user.id_user, req?.maxPlayers, req?.name);
			globals.rooms.set(room.cryptId, room);
			socket.join(`tournament_${room.id}`);
			if (socketData)
				socketData.state = enumSocketState.JOIN_TOURNAMENT;
			room.tournamentId = (await query.tournamentsQuery.createTournament(req.name, user.id_user)).id_tournament;
			console.log("createTournament =>	query createTournament");
			query.tournamentsQuery.addPlayersToTournament(room.tournamentId, [user.id_user]);
			console.log("createTournament =>	query addPlayers");
			result = new Result().Success();//@ts-ignore
			result.tournament_pwd = room.cryptId;//@ts-ignore
			result.tournament_id = room.tournamentId;
		}
	}
	catch (error)
	{
		result = new Result().Error(String(error), 500);
	}
	return (result);
}

/**
 * 
 * @param {{tournament_pwd: string}} req 
 * @param {Socket} socket
 * @param {dbUser} user 
 */
export async function joinTournamentRoomHandler(req, socket, user)
{
	let	result;
	let	room;
	let	socketData;

	room = globals.rooms.get(req?.tournament_pwd);
	if (!room)
		result = new Result().Error(`tournament ${req?.tournament_pwd} does not exist`, 400);
	else if (isBusy(user.id_user) == true)
		result = new Result().Error("You are already doing something", 400);
	else
	{
		result = room.addPlayer(user.id_user);
		socket.join(`tournament_${room.id}`);
		socketData = globals.clientMap.get(user.id_user);
		if (!socketData)
			throw (`joinTournamentRoomHandler: socketData not found`);
		await query.tournamentsQuery.addPlayersToTournament(room.tournamentId, [user.id_user]);
		console.log("joinTournament =>	query addPlayers");
		roomMessage(`tournament_${room.id}`, `join_player`, result);
		socketData.state = enumSocketState.JOIN_TOURNAMENT;
		socketData.tournamentData = 
		{
			id: room.tournamentId,
			matchId: "",//@ts-ignore
			me: null,//@ts-ignore
			opponent: null,
			ready: false
		};
	}
	if (room && result.status == 200 && room.players.size == room.maxPlayers)
		initTournament(room);
	return (result);
}

/**
 * 
 * @param {{DEBUG: boolean}} req 
 * @param {Socket} socket
 * @param {dbUser} user 
 */
export async function startRoundHandler(req, socket, user)
{
	let result;
	let	tournament;
	const socketData = globals.clientMap.get(user.id_user);

	if (req?.DEBUG == true)
		tournament = globals.tournamentMap.get(0);
	else if (!socketData || !socketData.tournamentData)
		return (new Result().Error("Can't find myself or tournament I've joined", 404));
	else
		tournament = globals.tournamentMap.get(socketData?.tournamentData?.id);
	if (!tournament)
		return (new Result().Error("Tournament doesn't exist", 500));
	if (tournament.adminId != user.id_user)
		return (new Result().Error("You must be admin to start the round", 401));
	if (tournament.activeMatches != 0)
		return (new Result().Error(`There are ${tournament.activeMatches} active matches`, 409));
	console.log("startRound: proviamo a iniziarli tutti dai..");
	await tournament.initAllMatches();
	result = new Result().Success();
	roomMessage(`tournament_${tournament.id}`, "start_round", result);
	console.log("do roba al frontend");
	console.log({data: tournament.userIds[tournament.round], roundId: tournament.round});
	roomMessage(`tournament_${tournament.id}`, "update_tournament", {data: tournament.userIds[tournament.round], roundId: tournament.round});
	return (result);
}

/**
 * 
 * @param {Room} room 
 */
export async function initTournament(room)
{
	let tournament;

	try
	{
		console.log("initTournament: proviamo a crearlo dai..");
		tournament = new Tournament(room.name, room.matchType, room.maxPlayers);
		tournament.id = room.tournamentId;
		tournament.adminId = room.ownerId;
		globals.tournamentMap.set(tournament.id, tournament);
		tournament.startUserIds = new Set(room.players);
		tournament.userIds[0] = new Array();
		tournament.userIds[0] = Array.from(room.players);
		console.log("THE 84 TENKAICHI TOURNAMENT WILL START!!!");
		console.log(tournament.userIds);
		tournament.RNGplayer();
		console.log(tournament.userIds);
		roomMessage(`tournament_${tournament.id}`, "start_tournament", new Result().Success());
		tournament.nextRound();
		console.log("giving frontend pairings data");
		console.log(tournament.userIds[tournament.round - 1]);
		console.log(tournament.userIds[tournament.round]);
	}
	catch(error)
	{
		//FIXME - mandare 500 server error via websockets
		console.log("ERROR: cannot init tournament. info:");
		console.error(error);
	}
}

/*
	OK-	admin: voglio fare torneo
	OK-	e possibile creare il torneo
	OK-	prendiamo id torneo da db
	OK-	settiamo nella map tornei id torneo =>	oggetto
	OK-	avvisiamo e diamo dati del pairing iniziale
	OK-	socketData: salvare =>	{id_torneo, me: ...}
	OK-	aspettare entrambi pronti
	OK-	appena entrambi pronti: match
	OK-	quando finisce match, aggiornare torneo db
	OK-	quando finisce match, aggiornare torneo oggetto
*/

/**
 * @param {Set<number>} players 
 * @param {string} matchId
 * @param {number} tournamentId
 * @param {Map<number, number>} userIdIndexMap
 * @param {string} matchType 
 */
export async function createMatchTournament(players, matchId, tournamentId, userIdIndexMap, matchType=eMatchPresets.ClassicTwoPlayers)
{
	let	match;
	let	result;
	let	preset;

	preset = matchType;
	match = new Match(preset);
	match.tournament = tournamentId;
	result = init(match, preset);
	match.settings.room.isRanked = false;
	await gameQuery.openMatch(match);
	globals.lastMatchId = matchId;
	globals.matches.set(globals.lastMatchId, match);
	//@ts-ignore
	result.id = match.id;
	await bindPlayersToMatch(match, players, result, userIdIndexMap);
	console.log("CREAZIONE MATCH: ♟️");
	return (match);
}

/**
 * 
 * @param {Match} match 
 * @param {boolean} drawBool
 */
export async function updateTournament(match, drawBool)
{
	let	tournament;
	let matchNum;
	/** @type {Map<number, number>} */
	let	userIdIndexMap;
	let userSet = new Set();

	tournament = globals.tournamentMap.get(match.tournament);
	if (!tournament)
		return (console.error(`update tournament: id ${match.tournament} invalid.`), null);
	if (drawBool)
	{
		userIdIndexMap = new Map();
		match.users.forEach((v) => 
		{
			userSet.add(v.id_user);//@ts-ignore
			userIdIndexMap.set(v.id_user, v.tour_index);
		});
		createMatchTournament(userSet, match.id, tournament.id, userIdIndexMap);
		return ;
	}
	if (!tournament.userIds[tournament.round + 1])
		tournament.userIds[tournament.round + 1] = new Array();
	//@ts-ignore
	matchNum = tournament.userIds[tournament.round].indexOf((match.GetPlayer(match.vic).tournament_index));//@ts-ignore
	tournament.userIds[tournament.round + 1][matchNum / 2] = match[match.victory].tournament_index;
	tournament.activeMatches--;
	roomMessage(`tournament_${tournament.id}`, "update_tournament", {data: tournament.userIds[tournament.round + 1], roundId: tournament.round + 1});
	if (tournament.activeMatches == 0)
		tournament.nextRound();
	if (tournament.checkFinish())
		endTournament(tournament);
}

/**
 * 
 * @param {Tournament} tournament 
 */
function endTournament(tournament)
{
	tournament.first = tournament.userIds[tournament.round][0];
	tournament.second = tournament.userIds[tournament.round - 1][0] != tournament.first? tournament.userIds[tournament.round - 1][0] : tournament.userIds[tournament.round - 1][1];
	for (let x of tournament.userIds[tournament.round - 2])
	{
		if (x != tournament.first && x != tournament.second)
			tournament.third.push(x);
	}
	//@ts-ignore
	roomMessage(`tournament_${tournament.id}`, "tournament_FINE", {fine: "si", log: new Result().Success().log});
	query.tournamentsQuery.updateTournamentStatus(tournament.id, 'closed');
}
