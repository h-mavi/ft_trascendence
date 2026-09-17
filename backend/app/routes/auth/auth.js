
import * as lib from "../../lib/lib.js";
import bcrypt from "bcryptjs";
import { createJwt, checkJwt, revokeTokenSessions, 
	validateInputRegister, validateUser, cookiesOpt,
	createOtp, verifyOtp } from "../../utils/auth.js";
import { jsonResponse } from "../../utils/response.js";
import { colors } from "../../utils/colors.js";
import { log } from "../../utils/log.js";
import { query } from "../../lib/query.js";
import { globals } from "../../Classes/Globals/globals.js";
const { usersQuery } = query;
const { fs, logfd } = lib.include;
const { crypto, redis, sendEmail, bodyOTP, bodyRegistration } = lib.conn;
export const authRouter = lib.include.express.Router();

// NOTE: route /auth

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
authRouter.post("/login", async (req, res) => {
	try {
		const { username, password } = req.body;
		if (!username || !password)
			return (res.status(400).json(jsonResponse.ResponseError("Missing credentials")));
		const user = await usersQuery.getUserWithPwd(username);
		if (!user || !(await bcrypt.compare(password, user.password)))
		{
			log.warn(`Access denied to user ${colors.bold(username)}`);
			return res.status(401).json(jsonResponse.ResponseError("Invalid credentials"));
		}
		delete(user.password);
		req.user = user;
		if (user.mfa)
		{
			const otp = await createOtp(user.id_user);
			sendEmail({ to: user.email, subject: 'One Time Password', body: bodyOTP(user.username, otp)})
				.catch(err => log.warn(`OTP email to ${user.username} failed: ${err.message}`));
			return res.status(200).json(jsonResponse.ResponseSuccess({ id_user: user.id_user, message: "OTP sent by email", Expiration: `${process.env.OTP_TTL / 60} min` }));
		}
		if (globals.clientMap.get(user.id_user))
		{
			console.log("User already logged in");
			return res.status(409).json(jsonResponse.ResponseError("User already logged in"));
		}
		log.ok(`User ${req.user.username} correctly logged in`);
		await createJwt(req, res);
		return res.status(200).json(jsonResponse.ResponseSuccess({ "user": user }));
	} catch (error) {
		console.log("Error: ", error);
		return res.status(500).json(jsonResponse.ResponseError("Server error checking for user"));
	}
});

authRouter.post('/verifyOtp', async (req, res) => {
	try {
		const { id_user, otp } = req.body;
		const user = await usersQuery.getUserById(id_user);
		const result = await verifyOtp(id_user, otp);
		if (!result.success)
			return res.status(401).json(jsonResponse.ResponseError(result.message));
		if (user.password)
			user.setpwd = true;
		delete(user.password);
		req.user = user;
		await createJwt(req, res);
		return res.status(200).json(jsonResponse.ResponseSuccess({ "user": user }));
	} catch (error) {
		console.log("Error: ", error);
		return res.status(500).json(jsonResponse.ResponseError("Server error checking for user"));
	}
})

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
authRouter.post("/register", async (req, res) => {
	try {
		const { name, surname, username, email, password, nationality } = req.body;
		const inputs = validateInputRegister(username, email, password);
		if (inputs != "OK")
			return res.status(400).json(jsonResponse.ResponseError(inputs));
		if (!(await validateUser(username, email)))
			return res.status(409).json(jsonResponse.ResponseError("User already exists"));
		const hashedPwd = await bcrypt.hash(password, parseInt(lib.Macro.HASH_SALT));
		const user = await usersQuery.createUser(name, surname, username, hashedPwd, email, nationality);
		// await sendEmail({ to: user.email, subject: "Welcome to ChessZ", body: bodyRegistration(user.username)} );
		if (user.password)
			user.setpwd = true;
		delete(user.password);
		req.user = user;
		await createJwt(req, res);
		return res.status(201).json(jsonResponse.ResponseSuccess({ "user": user }));
	} catch (error) {
		console.log("Error: ", error);
		return res.status(500).json(jsonResponse.ResponseError("Server error creating user"));
	}
});

// NOTE: da controllare se mandare user come parametro finale o se recuperare solo id dal refresh token
/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
authRouter.post("/refresh", async (req, res) => {
	try {
		const { refresh_token } = req.cookies;
		if (!refresh_token)
			return res.status(403).json(jsonResponse.ResponseError("Missing refresh token"));
		const { user } = req.body; // serve per il rinnovo del jwt che riprende user.id_user e user.username
		const refToken = await redis.get(`refresh:${refresh_token}`);
		if (!refToken)
			return res.status(403).json(jsonResponse.ResponseError("Invalid or expired token"));
		/** @type {token} rawToken */
		const rawToken = JSON.parse(refToken);
		if (rawToken.used == true)
		{
			revokeTokenSessions(rawToken.userId)
			return res.status(403).json(jsonResponse.ResponseError("Token already used"));
		}
		req.user = user;
		await redis.set(
			`refresh:${refresh_token}`,
			JSON.stringify({ ...rawToken, used: true }),
			'KEEPTTL'
		);
		await createJwt(req, res);
		await redis.del(`refresh:${refresh_token}`);
		return res.status(200).send();
	} catch (error) {
		// printLog(`User couldn't refresh token due server error: ${error.name}`, colors.brightYellow);
		return res.status(500).json(jsonResponse.ResponseError("Server error refreshing token"));
	}
});

authRouter.post("/logout", checkJwt, async (req, res) => {
	try {
		const refreshToken = req.cookies.refresh_token;
		const jwtToken = req.cookies.jwt_token;
		const { id_user } = req.user;
		await redis.del(`refresh:${id_user}`);
		const now = Math.floor(Date.now() / 1000); // metto in blacklist il jwt per il tempo di vita residua
		const ttlJwt = req.user.exp - now;
		if (ttlJwt > 0)
			await redis.set(`blacklist:${jwtToken}`, '1', 'EX', ttlJwt);
		res.clearCookie('jwt_token', cookiesOpt);
		res.clearCookie('refresh_token', { ...cookiesOpt, path: '/auth/refresh'});
		return res.status(200).json(jsonResponse.ResponseSuccess({ logout: "ok" }));
	} catch (error) {
		console.log("Error: ", error);
		// printLog(`User couldn't logout due server error: ${error.name}`, colors.brightYellow);
		return res.status(403).json(jsonResponse.ResponseError("Server error logging out user"));
	}
});

authRouter.post("/forceLogout", async (req, res) => {
	try {
		const { id_user } = req.body;
		await redis.del(`refresh:${id_user}`);
		res.clearCookie('jwt_token', cookiesOpt);
		res.clearCookie('refresh_token', { ...cookiesOpt, path: '/auth/refresh'});
		return res.status(200).json(jsonResponse.ResponseSuccess({ logout: "ok" }));
	} catch (error) {
		console.log("Error: ", error);
		// printLog(`User couldn't logout due server error: ${error.name}`, colors.brightYellow);
		return res.status(500).json(jsonResponse.ResponseError("Server error logging out user"));
	}
})