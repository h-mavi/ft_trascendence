//@ts-check

import { globals } from "../Classes/Globals/globals.js";
import { postNotification } from "../query/notifyQuery.js";

/** @typedef {import("../websocket/handlers/tournament").dbUser} dbUser*/

/**
 * 
 * @param {string} title 
 * @param {string} description 
 * @param {dbUser} user
 * @param {dbUser | null} sender 
 * @returns 
 */
export async function notify(title, description, user, sender)
{
	const id_sender = sender? sender.id_user : null;
	const destSock = globals.clientMap.get(user.id_user);
	const dataDb = 
	{
		id_sender: id_sender,
		id_user: user.id_user,
		title: title,
		description: description,
		creation_date: new Date
	};
	const dataSocket = 
	{
		title: title,
		description: description,
		id_user: user.id_user,
		sender: 
		{
			id_sender: id_sender,
			username: sender ? sender.username : "server",
		},
		creation_date: new Date
	};

	try 
	{
		const notification = await postNotification(dataDb);
		if (destSock && notification)
			destSock.socket.emit(`notification`, dataSocket);
	}
	catch (error) 
	{
		console.log("Error: ", error);
	}
}

/* 	{
	 title: notification.title, description: notification.description,
			sender: { 
				"id_user": notification.users_notifications_id_senderTousers.id_user,
				"username": notification.users_notifications_id_senderTousers.username
			},
			creation_date: notification.creation_date 
	}); */