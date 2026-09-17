
import { prisma } from "../lib/prisma.js"

/** @typedef {import("../Classes/Globals/socketInfo.js").SocketInfo} SocketInfo*/

/**
 * @param {import("socket.io").Server} sockio
 * @param {Map<number, SocketInfo>} clientMap
 */
export async function announceMeOnline(sockio, user, clientMap)
{
	let	socketData;
	let	friendsId = [];

	socketData = clientMap.get(user.id_user);
	if (!socketData)
		throw (`id_user does not exist yet`);
	const friends = await prisma.friendships.findMany({
		where: {
			OR: [
				{id_user1: user.id_user},
				{id_user2: user.id_user}
			],
			friend_status: 'accepted'
		}
	});
	friendsId = friends.map(f => {
		return f.id_user1 == user.id_user ? f.id_user2 : f.id_user1
	});
	for (const id of friendsId)
	{
		const friendSocket = clientMap.get(id);
		if (friendSocket)
		{
			sockio.to(friendSocket.socket.id).emit('friend:online', { userId: user.id_user }); // comunico all'amico (id) online che sono online
			socketData.socket.emit('friend:online', { userId: id }); // comunico a me stesso che quell'amico e online, altrimenti lo vedrei solo alla sua riconnessione
		}
	}
	socketData.socket.emit('friend:online', { userId: user.id_user }); // comunico a me stesso che sono online
	socketData.friendsId = friendsId;
	return friendsId;
}
