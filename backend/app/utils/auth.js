
import * as lib from "../lib/lib.js";
import * as usersUtils from "./users.js"
import { query } from "../lib/query.js";
import ms from "ms";
import { jsonResponse } from "../utils/response.js";
import { createTestAccount } from "nodemailer";
const { usersQuery } = query;
const { jwt } = lib.auth;
const { redis } = lib.conn;
const { crypto } = lib.conn;

export const cookiesOpt = {
	httpOnly: true,
	secure: process.env.NODE_ENV === 'production',
	sameSite: 'strict'
}

// NOTE: check jwt valido, altrimenti ritorno "token invalido"
// se token scaduto -> sotto /refresh genero altro token di rinnovo + token jwt e invalido quello precedente
export const checkJwt = async (req, res, next) => {
	const token = req.cookies?.jwt_token;
	if (!token)
		return res.status(401).json(jsonResponse.ResponseError("Token not found"));
	try {
		// controllo se il token e ancora in blacklist dal logout
		if (await redis.get(`blacklist:${token}`))
			return res.status(401).json(jsonResponse.ResponseError("User not autorized"));
		req.user = jwt.verify(token, process.env.JWT_SECRET); 
		next();
	} catch (error){
		if (error.name == "TokenExpiredError")
			return res.status(401).json(jsonResponse.ResponseError("Token expired"));
		return res.status(403).json(jsonResponse.ResponseError("Invalid token"));
	}
};

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const createJwt = async (req, res) => {
	const token = jwt.sign(
		{ id_user: req.user.id_user, username: req.user.username },
		process.env.JWT_SECRET,
		{ expiresIn: process.env.JWT_TTL }
	);
	const ttl = ms(process.env.REFRESH_TTL) / 1000;
	const refreshToken = crypto.randomUUID();
	await redis.set(
		`refresh:${refreshToken}`,
		JSON.stringify({
			"userId": req.user.id_user,
			"used": false
		}),
		'EX', ttl
	);
	res.cookie('jwt_token', token, { ...cookiesOpt, maxAge: ms(process.env.JWT_TTL) + 720000 }); // setting cookies for jwt
	res.cookie('refresh_token', refreshToken, { ...cookiesOpt, maxAge: ms(process.env.REFRESH_TTL),	path: '/auth/refresh' }); // setting cookies for refresh token
}

/** 
 * @typedef {{ "userId": Number, "used": Boolean }} token 
*/
export async function revokeTokenSessions(userId) {
	const keys = await redis.keys('refresh:*');
	for (const key of keys)
	{
		const val = await redis.get(key);
		if (!val)
			continue ;
		/** @type {token} data */
		const data = JSON.parse(val);
		if (data.userId == userId)
			await redis.del(key)
	}
}

/**
 * 
 * @param {String} username 
 * @param {String} email 
 * @param {String} password 
 * @returns {String}
 */
export const validateInputRegister = (username, email, password) => {
	if (!username || username.length < 4)
		return ("Username too short");
	if (!email || !usersUtils.checkEmail(email))
		return ("Invalid email format");
	if (!password || !usersUtils.checkPassword(password))
		return ("Invalid password format");
	return ("OK");
}

/**
 * 
 * @param {String} username 
 * @param {String} email 
 * @returns 
 */
export const validateUser = async (username, email) => {
	const userEmail = await usersQuery.getUserByEmail
	const user = await prisma.users.findFirst({
		where: {
			OR: [
				{ username: username },
				{ email: email }
			]
		}
	});
	if (user)
		return (false);
	return (true);
}

const OTP_TTL = Number(process.env.OTP_TTL) // 5 minuti
const MAX_TRY = Number(process.env.OTP_MAX_TRY) // 5

function generateOtp() {
	return crypto.randomInt(100000, 999999).toString();
}

export async function createOtp(id_user) {
	const otp = generateOtp();
	const key = `otp:${id_user}`;

	await redis.set(key, otp, 'EX',  OTP_TTL);
	await redis.set(`otp_attempts:${id_user}`, 0, 'EX', OTP_TTL);

	return (otp);
}

export async function verifyOtp(id_user, otp) {
	const key = `otp:${id_user}`;
	const keyAttempts = `otp_attempts:${id_user}`;
	const stored = await redis.get(key);
	if (!stored)
		return ({ success: false, message: 'OTP expired or not valid' });
	const attempts = parseInt(await redis.get(keyAttempts) || '0', 10);
	if (attempts >= MAX_TRY) {
		await redis.del(key);
		return ({ success: false, message: 'Too many attempts' });
	}
	if (Number(stored) !== Number(otp)) {
		await redis.incr(keyAttempts);
		return ({ success: false, message: 'Invalid OTP' });
	}
	await redis.del(key);
	await redis.del(keyAttempts);
	return ({ success: true });
}