
import * as lib from "../lib/lib.js";
import { jsonResponse } from "../utils/response.js";
import { checkJwt } from "../utils/auth.js";
import { log } from "../utils/log.js";
import { globals } from '../Classes/Globals/globals.js';
import { query } from "../lib/query.js";
const { notifyQuery } = query;
export const notifyRouter = lib.include.express.Router();

/**
 * @param {import('express').Request} req
 */
function checkQueryParams(req) {
	const filter = {};
	const { id_user } = req.user;
	filter.id_user = id_user;
	/** @type {String} key */
	for (const [key, value] of Object.entries(req.query))
	{
		if (key === 'title')
			filter[key] = {contains: String(value), mode: 'insensitive'};
		else if (key === 'start_date')
			filter['creation_date'] = {...filter['creation_date'], gte: new Date(String(value))};
		else if (key === 'end_date')
			filter['creation_date'] = {...filter['creation_date'], lte: new Date(String(value))};
		else if (key === 'username')
			filter['users_notifications_id_senderTousers'] = {username: {contains: String(value), mode: 'insensitive'}};
		else
			filter[key] = value;
	}
	return (filter);
}

// NOTE: /api/notifications

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
notifyRouter.get("/", checkJwt, async (req, res) => {
	try {
		const filter = checkQueryParams(req);
		const notif = Object.keys(filter).length > 1 ? await notifyQuery.getFilteredNotifications(filter) : await notifyQuery.getAllNotifications(req.user.id_user);
		if (notif && notif.length > 0)
			return res.status(200).json(jsonResponse.ResponseSuccess({ "notifications": notif }));
		return res.status(404).json(jsonResponse.ResponseError("Notifications not found"));
	} catch (error) {
		console.log("error: ", error);
		return res.status(500).json(jsonResponse.ResponseError("Server error retrieving notifications"));
	}
});

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
notifyRouter.get("/:id", checkJwt, async (req, res) => {
	try {
		const notif = await notifyQuery.getNotificationById(req.user.id_user, req.params.id);
		if (notif)
			return res.status(200).json(jsonResponse.ResponseSuccess({ "notification": notif }));
		return res.status(404).json(jsonResponse.ResponseError("Notification not found"));
	} catch (error) {
		console.log("error: ", error);
		return res.status(500).json(jsonResponse.ResponseError("Server error retrieving notifications by id"));
	}
});

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
notifyRouter.post("/", checkJwt, async (req, res) => {
	try {
		const data = {};
		data.id_sender = req.user.id_user;
		data.creation_date = new Date();
		for (const [key, value] of Object.entries(req.body))
		{
			if (key === 'id_receiver')
				data['id_user'] = Number(value);
			else
				data[key] = value;
		}
		const notification = await notifyQuery.postNotification(data);
		const destSock = req.app.get('clientMap').get(data.id_user); // prendo il socket di riferimento all'id dello user
		if (destSock && notification)
			destSock.socket.emit(`notification`, { title: notification.title, description: notification.description,
				sender: { 
					"id_user": notification.users_notifications_id_senderTousers.id_user,
					"username": notification.users_notifications_id_senderTousers.username
				},
				creation_date: notification.creation_date });
		return res.status(204).send();
	} catch (error) {
		console.log("Error: ", error);
		if (error.code == 'P2002')
			return res.status(409).json(jsonResponse.ResponseError("Notification already exists"));
		return res.status(500).json(jsonResponse.ResponseError("Server error posting new notification"));
	}
});

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
notifyRouter.patch("/", async (req, res) => {
	try {
		const { id_notification } = req.body;
		const notification = await notifyQuery.readNotifications(id_notification);
		return res.status(204).send();
	} catch (error) {
		log.err(`Server error updating notifications: ${error.code}`);
		if (error.code == 'P2002')
			return res.status(409).json(jsonResponse.ResponseError("Notification doesn't exists"));
		return res.status(500).json(jsonResponse.ResponseError("Server error updating notifications"))
	}
});