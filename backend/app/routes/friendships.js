
import * as lib from "../lib/lib.js";
import { jsonResponse } from "../utils/response.js";
import { checkJwt } from "../utils/auth.js";
import { log } from "../utils/log.js";
import { query } from "../lib/query.js";
const { friendsQuery } = query;
export const friendsRouter = lib.include.express.Router();


// NOTE: /api/friends

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
friendsRouter.get('/', checkJwt, async (req, res) => {
	try {
		const friendships = await friendsQuery.getAllUserFriendships(req.user.id_user);
		return res.status(200).json(jsonResponse.ResponseSuccess({ friendship: friendships }));
	} catch (error) {
		console.log("Error: ", error);
		return res.status(500).json(jsonResponse.ResponseError("Server error retrieving user friendships"));
	}
});

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * NOTE: riprende le amicizie di un utente preso tramite id
 */
friendsRouter.get('/:id', checkJwt, async (req, res) => {
	try {
		const userFriendships = await friendsQuery.getUserFriendsById(req.params.id);
		return res.status(200).json(jsonResponse.ResponseSuccess({ friendship: userFriendships }));
	} catch (error) {
		console.log("Error: ", error);
		return res.status(500).json(jsonResponse.ResponseError("Server error retrieving another user's friendships"));
	}
});

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
friendsRouter.post('/', checkJwt, async (req, res) => {
	try {
		const newFriendship = await friendsQuery.sendFriendship(req.user.id_user, req.body.id_friend);
		return res.status(200).json(jsonResponse.ResponseSuccess({ new_friend: newFriendship }));
	} catch (error) {
		if (error.code == 'P2002')
			return res.status(409).json(jsonResponse.ResponseError("Friendship already exists or pending"));
		console.log("Error: ", error);
		return res.status(500).json(jsonResponse.ResponseError("Server error sending new friendships"));
	}
})

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
friendsRouter.delete('/', checkJwt, async (req, res) => {
	try {
		await friendsQuery.removeFriendship(req.user.id_user, req.body.id_friend);
		return res.status(204).send();
	} catch (error) {
		if (error.code == 'P2025')
			return res.status(404).json(jsonResponse.ResponseError("Friendship not found"));
		return res.status(500).json(jsonResponse.ResponseError("Server error deleting friendships"));
	}
})

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
friendsRouter.patch('/', checkJwt, async (req, res) => {
	try {
		const updatedFriend = await friendsQuery.updateFriendship(req.user.id_user, req.body.id_friend);
		return res.status(200).json(jsonResponse.ResponseSuccess({ updated_friendship: updatedFriend }));
	} catch (error) {
		if (error.code == 'P2025')
			return res.status(409).json(jsonResponse.ResponseError("Friendship not found or already accepted"));
		return res.status(500).json(jsonResponse.ResponseError("Server error updating friendship"));
	}
})
