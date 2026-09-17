
import * as lib from "../lib/lib.js";
import bcrypt from "bcryptjs"
import { checkInputs, checkEmail, checkPassword, 
	checkUsername, uploadAvatar, deleteOldAvatar } from "../utils/users.js";
import { checkJwt } from "../utils/auth.js";
import { jsonResponse } from "../utils/response.js"
import { log } from "../utils/log.js"
import { colors } from "../utils/colors.js";
import { query } from "../lib/query.js";
import { sendEmail } from "../lib/emailSender.js";
import { prisma } from "../lib/prisma.js";
import fs from 'fs/promises';
const { redis } = lib.conn;
const { multer, sharp, path } = lib.include;
const { usersQuery } = query;
export const usersRouter = lib.include.express.Router();

// SECTION: multer setup
const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
	fileFilter: (req, file, cb) => {
		const typeAllowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
		if (!typeAllowed.includes(file.mimetype))
			return cb(new Error('Invalid file type'));
		cb(null, true);
	}
});
const uploadMiddleware = upload.single('avatar');

// NOTE: route /api/users/

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * NOTE: solo user loggati, ricerca tutti gli utenti con query su username
*/
usersRouter.get("/", checkJwt, async (req, res) => {
	try {
		const { username } = req.query;
		const users = username ? await usersQuery.findUserByUsername(username) : await usersQuery.getAllUsers();
		if (users && users.length > 0)
			return res.status(200).json(jsonResponse.ResponseSuccess({ "users": users }));
		return res.status(404).json(jsonResponse.ResponseError("Users not found"));
	} catch (error) {
		// printLog(`User not found due to a server error: ${error.name}`, colors.brightRed);
		return res.status(500).json(jsonResponse.ResponseError("Server error"));
	}
});

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * NOTE: solo user loggati, ricerca tutti gli utenti con query su username
*/
usersRouter.get("/me", checkJwt, async (req, res) => {
	try {
		const user = await usersQuery.getMe(req.user.id_user);
		if (user)
			return res.status(200).json(jsonResponse.ResponseSuccess({ "user": user }));
		return res.status(404).json(jsonResponse.ResponseError("User not found"));
	} catch (error) {
		// printLog(`User not found due to a server error: ${error.name}`, colors.brightRed);
		return res.status(500).json(jsonResponse.ResponseError("Server error"));
	}
});

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * NOTE: solo user loggati, ricerca tutti gli utenti con query su username
*/
usersRouter.get('/leaderboard', async (req, res) => {
	try {
		const list = await usersQuery.getLeaderboard();
		if (list)
			return res.status(200).json(jsonResponse.ResponseSuccess({ "list": list }));
		return res.status(400).json(jsonResponse.ResponseError("Not much users for leaderboard"));
	} catch (error) {
		console.log("Error: ", error);
		return res.status(500).json(jsonResponse.ResponseError("Server error while retrieving leaderboard"));
	}
});

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * NOTE: solo user loggati, ricerca tutti gli utenti con query su username
*/
usersRouter.get('/username/:username', checkJwt, async (req, res) => {
	try {
		const user = await usersQuery.getUserByUsername(req.params.username);
		if (user)
			return res.status(200).json(jsonResponse.ResponseSuccess({ "user": user }));
		return res.status(404).json(jsonResponse.ResponseError("User not found"));
	} catch (error) {
		console.log("Error: ", error);
		return res.status(500).json(jsonResponse.ResponseError("Server error"));
	}
})

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * NOTE: solo user loggati, ricerca per id
*/
usersRouter.get("/:id", checkJwt, async (req, res) => {
	try {
		const { id } = req.params;
		const user = await usersQuery.getUserById(id);
		if (user)
			return res.status(200).json(jsonResponse.ResponseSuccess({ "user": user }));
		return res.status(404).json(jsonResponse.ResponseError("User not found"));
	} catch (error) {
		// printLog(`User not found due to a server error: ${error.name}`, colors.brightRed);
		return res.status(500).json(jsonResponse.ResponseError("Server error"));
	}
});

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * NOTE: solo user loggati, delete su utente richiedente
*/
usersRouter.delete("/", checkJwt, async (req, res) => {
	try {
		const user = await usersQuery.deleteUserById(req.user.id_user);
		if (user)
		{
			// printLog(`User ${user.username} successfully deleted`, colors.brightYellow);
			return res.status(204).send();
		}
		return res.status(404).json(jsonResponse.ResponseError("User not found"));
	} catch (error) {
		if (error.code === 'P2025')
			return res.status(404).json(jsonResponse.ResponseError("User not found"));
		// printLog(`User not found due to a server error: ${error.name}`, colors.brightRed);
		return res.status(500).json(jsonResponse.ResponseError("Server error"));
	}
});

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * NOTE: solo user loggati, patch su utente richiedente
*/
usersRouter.patch("/", checkJwt, uploadMiddleware, async (req, res) => {
	try {
		if (req.body.preset && req.file)
			return res.status(400).json(jsonResponse.ResponseError("Invalid request, preset and avatar are both present"));
		const { username } = req.body;
		if (username && !checkUsername(username))
			return res.status(400).json(jsonResponse.ResponseError("Invalid username format"));
		if (req.body.avatar == "")
		{
			req.body.image = null;
			await deleteOldAvatar(req.user.id_user);
		}
		else {
			delete req.body.image; // cancello il campo image dal body che viene passato (la vera immagine (avatar) non si trova li)
			if (req.body.preset) {
				req.body.image = path.join(`/media/presetIcon/${req.body.preset}.PNG`);
				await deleteOldAvatar(req.user.id_user);
			}
			else if (req.file)
				req.body.image = await uploadAvatar(req);
		}
		const user = await usersQuery.updateUserFieldsById(req.user.id_user, req.body);
		delete(user.password);
		return res.status(200).json(jsonResponse.ResponseSuccess({ "user": user }));
	} catch (error) {
		console.log("error: ", error);
		if (error.code === 'P2002')
			return res.status(404).json(jsonResponse.ResponseError("Username already taken"));
		return res.status(500).json(jsonResponse.ResponseError("Server error changing user params"));
	}
});

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * NOTE: invio link per mail allo user che vuole resettare la password
*/
// usersRouter.patch('/forgotPassword', async (req, res) => {
// 	try {
// 		const { username } = req.body;
// 		const user = await usersQuery.getUserByUsername(username);
// 		if (user) {
// 			const resetToken = crypto.randomBytes(32).toString('hex');
// 			const hashToken = crypto.createHash('sha256').update(resetToken).digest('hex');
// 			await redis.set(`resetPwd:${hashToken}`, user.id_user, 'EX', 900);
// 			const link = `http://edraccan-transcendence.duckdns.org/updatePassword?token=${resetToken}`;
// 			await sendEmail({ to: user.email, subject: 'Link for resetting password', body: `${link}`}); // da mettere html con dentro link per reset password
// 		}
// 		return res.status(200).json(jsonResponse.ResponseSuccess({  }));
// 	} catch (error) {
		
// 	}
// });

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * NOTE: cambio password con token dentro a link inviato via mail
*/
usersRouter.patch('/updatePassword', async (req, res) => {
	try {
		const { username, password } = req.body;
		if (!checkPassword(password))
			return res.status(400).json(jsonResponse.ResponseError("Invalid password format"));
		const user = await usersQuery.updateUserPasswordByUsername(username, await bcrypt.hash(password, parseInt(lib.Macro.HASH_SALT)))
		if (user)
			return res.status(204).send();
		return res.status(404).json(jsonResponse.ResponseError("User not found"));
	} catch (error) {
		if (error.code == 'P2025')
			return res.status(409).json(jsonResponse.ResponseError("User not found"));
		log.err("Server error changing password");
		return res.status(500).json(jsonResponse.ResponseError("Server error changing user password"));
	}
});

usersRouter.patch('/loggedUpdatePassword', checkJwt, async (req, res) => {
	try {
		const { password } = req.body;
		if (!checkPassword(password))
			return res.status(400).json(jsonResponse.ResponseError("Invalid password format"));
		const user = await usersQuery.updateUserPasswordById(req.user.id_user, await bcrypt.hash(password, parseInt(lib.Macro.HASH_SALT)))
		if (user)
			return res.status(200).json(jsonResponse.ResponseSuccess({ "user": user }));
		return res.status(404).json(jsonResponse.ResponseError("User not found"));
	} catch (error) {
		if (error.code == 'P2025')
			return res.status(409).json(jsonResponse.ResponseError("User not found"));
		console.log("Error: ", error);
		return res.status(500).json(jsonResponse.ResponseError("Server error changing user password"));
	}
});
