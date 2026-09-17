//@ts-check

//SECTION - connection functions
/*
	list of exports:
	FUNCTIONS
	-	websocketConnectionHandler:	handles the socket setup/reconnection
*/

import { DEBUG_WEBSOCKETS } from "../../Macro/macro.js";
import { sockio } from "../websocket.js";
import { globals } from "../../Classes/Globals/globals.js";
import { SocketInfo } from "../../Classes/Globals/socketInfo.js";
import { announceMeOnline } from "../onlineStatus.js";
import { enumSocketState } from "../../Macro/enums.js";
import { MatchMaking } from "./MatchMaking.js";
import { gameMessage, getReconnectTime, roomMessage } from "../utils.js";

/**
 * 
 * @param {import("socket.io").Socket} socket 
 * @param {Array<*>} friendsId
 */
async function websocketConnectionHandler(socket, friendsId)
{
	let user;
	let	socketData;

	if (DEBUG_WEBSOCKETS == true)
	user = socket.handshake.auth;
	else//@ts-ignore
		user = socket.request.user;
	if (!user)
		return null;
	globals.ClearTimer(user.id_user);
	socketData = globals.clientMap.get(user.id_user);
	if (socketData?.reconnectBool == true || socketData?.state)
		await handleReconnect(user, socketData, socket);
	else
		await firstConnection(user, socket, friendsId);
	if (DEBUG_WEBSOCKETS == true)
		return (user);
	try {
		friendsId = await announceMeOnline(sockio, user, globals.clientMap);
	} catch (error) {
		console.error("Server error loading friends:", error);
	}
	return (user);
}

/** 
 * @param {import("socket.io").Socket} socket
 * @param {import("../../Classes/Chess/player.js").dbUser} user
 * */
async function websocketDisconnectionHandler(socket, user) 
{
	let socketData;
	const	msgDisconnect = "setting reconnection timeout for user";

	socket.on('disconnect', async () => 
	{
		clearTimeout(globals.timers.get(user.id_user));
		socketData = globals.clientMap.get(user.id_user);
		if (!socketData)
			return (console.error("ERROR: invalid socket during disconnect"));
		socketData.reconnectBool = true;
		//NOTE - after SOCKET_RECONNECT_TIMER, user is considered disconnected
		console.log(`${msgDisconnect} ${user.id_user}`);
		gameMessage(socketData.matchData?.matchId, `${msgDisconnect} ${user.username}`);
		globals.timers.set(user.id_user, setTimeout(
		handleLogout, getReconnectTime(socketData.state), socket, user));
	});
	socket.on('logout', async () => 
	{
		handleLogout(socket, user);
	});
}

//SECTION - utils

/**
 * 
 * @param {*} user 
 * @param {*} socket 
 * @param {Array<*>} friendsId
 */
async function firstConnection(user, socket, friendsId)
{
	console.log("A new user connected with id ", user.id_user);
	globals.clientMap.set(user.id_user, new SocketInfo(socket));
}

/**
 * 
 * @param {*} dbUser 
 * @param {SocketInfo} socketData 
 * @param {*} newSocket 
 */
function handleReconnect(dbUser, socketData, newSocket)
{
	const	msgReconnect = "reconnect user";
	let		matchId;

	console.log(`${msgReconnect} ${dbUser.id_user}...`);
	socketData.reconnectBool = false;
	if (socketData.socket.id != newSocket.id)
	{
		socketData.socket.removeAllListeners();
		socketData.socket.disconnect();
	}//@ts-ignore
	socketData.socket = null;
	console.log(`data: => ${JSON.stringify(socketData, null, 2)}`);
	socketData.socket = newSocket;
	if (socketData.state == enumSocketState.MATCHMAKING)
		return (MatchMaking(dbUser));
	else if (socketData.state == enumSocketState.PLAYING)
	{
		matchId = socketData.GetmatchId();
		if (!matchId)
			return (console.log("ERROR: data for player are lost! OH NO!"));
		gameMessage(matchId, `${msgReconnect} ${dbUser?.username}`);
		socketData.socket.join(`match_${matchId}`);
	}
}

/** 
 * 
 * @param {import("socket.io").Socket} socket
 * @param {import("../../Classes/Chess/player.js").dbUser} user
 * */
function handleLogout(socket, user)
{
		let		result;
		let		socketData;
		const 	msgLogout = `has disconnected`;

		socketData = globals.clientMap.get(user.id_user);
		if (!socketData)
			return (console.log(`disconnect: socketData is empty`));
		globals.ClearTimer(user.id_user);
		console.log(`${user?.id_user} ${msgLogout}`);
		globals.RemoveFromAllQueues(user.id_user);
		result = globals.DeletePlayer(socketData.matchData?.matchId, socketData.matchData?.team);
		if (socketData.matchData)
			roomMessage(`match_${socketData.GetmatchId()}`, `game`, result);
		gameMessage(socketData.matchData?.matchId, `${user?.username} ${msgLogout}`);
		result = globals.LeaveRoom(socketData, user.id_user);
		if (socketData.roomData)
			roomMessage(`room_${socketData.roomData.id}`, "leave_room", result);
		globals.clientMap.delete(user.id_user);
		for (const id of socketData.friendsId)
		{
			const friendSock = globals.clientMap.get(id);
			if (friendSock)
				sockio.to(friendSock.socket.id).emit('friend:offline', { userId: user.id_user });
		}
		socket.emit("rip");//NOTE - avvisa frontend che socket e morto
}

export {websocketConnectionHandler, websocketDisconnectionHandler};