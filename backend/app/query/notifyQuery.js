
import { prisma } from "../lib/prisma.js";

export async function getAllNotifications (id) {
	const notif = await prisma.notifications.findMany({
		select: {
			id_notification: true,
			title: true,
			description: true,
			status: true,
			id_user: true,
			creation_date: true,
			users_notifications_id_senderTousers: {
				select: {
					id_user: true,
					username: true
				}
			}
		},
		where: { id_user: id },
		orderBy: {
			id_notification: 'desc'
		}
	});
	return notif.map(n => ({
		id_notification: n.id_notification,
		title: n.title,
		description: n.description,
		status: n.status,
		id_user: n.id_user,
		creation_date: n.creation_date.toISOString().split('T')[0],
		sender: n.users_notifications_id_senderTousers
			? { id_user: n.users_notifications_id_senderTousers.id_user, username: n.users_notifications_id_senderTousers.username }
			: null
	}));
}

export async function getFilteredNotifications (filter) {
	const notif = await prisma.notifications.findMany({
		where: filter,
		select: {
			id_notification: true,
			title: true,
			description: true,
			status: true,
			id_user: true,
			creation_date: true,
			users_notifications_id_senderTousers: {
				select: {
					id_user: true,
					username: true
				}
			}
		}
	});
	return notif.map(n => ({
		id_notification: n.id_notification,
		title: n.title,
		description: n.description,
		status: n.status,
		id_user: n.id_user,
		creation_date: n.creation_date.toISOString().split('T')[0],
		sender: n.users_notifications_id_senderTousers
			? { id_user: n.users_notifications_id_senderTousers.id_user, username: n.users_notifications_id_senderTousers.username }
			: null
	}));
}

export async function getNotificationById (id_user, id_notification) {
	const n = await prisma.notifications.findUnique({
		select: {
			id_notification: true,
			title: true,
			description: true,
			status: true,
			id_user: true,
			creation_date: true,
			users_notifications_id_senderTousers: {
				select: {
					id_user: true,
					username: true
				}
			}
		},
		where: {
			id_notification: Number(id_notification),
			id_user: Number(id_user)
		}
	});
	return ({
		id_notification: n.id_notification,
		title: n.title,
		description: n.description,
		status: n.status,
		id_user: n.id_user,
		creation_date: n.creation_date.toISOString().split('T')[0],
		sender: n.users_notifications_id_senderTousers
			? { id_user: n.users_notifications_id_senderTousers.id_user, username: n.users_notifications_id_senderTousers.username }
			: null
	});
}

/**
 * @param {{ id_sender: Number | null, id_user: Number, title: String,
 * description: String, creation_date: Date }} data
 */
export async function postNotification (data) {
	return await prisma.notifications.create({
		data: data,
		select: {
			id_notification: true,
			title: true,
			description: true,
			status: true,
			id_user: true,
			creation_date: true,
			users_notifications_id_senderTousers: {
				select: {
					id_user: true,
					username: true
				}
			}
		}
	});
}

/**
 * @param {Number} id_notification 
 */
export async function readNotifications (id_notification) {
	return await prisma.notifications.updateMany({
		data: {
			status: 'read'
		},
		where: {
			id_notification: Number(id_notification)
		}
	});
}
