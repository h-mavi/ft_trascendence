
import * as lib from "../lib/lib.js";
import { jsonResponse } from "../utils/response.js";
import { checkJwt } from "../utils/auth.js";
import { log } from "../utils/log.js";
import { response } from "express";
import { prisma } from "../lib/prisma.js";
export const preferencesRouter = lib.include.express.Router();

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
preferencesRouter.get('/', checkJwt, async (req, res) => {
	try {
		const preferences = await prisma.preferences.findMany();
		return res.status(200).json(jsonResponse.ResponseSuccess(preferences));
	} catch (error) {
		console.log("Error: ", error);
		return res.status(500).json(jsonResponse.ResponseError("Server error retrieving preferences list"));
	}
});

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
preferencesRouter.get('/:id', checkJwt, async (req, res) => {
	try {
		const preferences = await prisma.preferences.findUnique({ where: { id_preference: Number(req.params.id) } });
		if (preferences)
			return res.status(200).json(jsonResponse.ResponseSuccess(preferences));
		return res.status(404).json(jsonResponse.ResponseError("Preference not found"));
	} catch (error) {
		console.log("Error: ", error);
		return res.status(500).json(jsonResponse.ResponseError("Server error retrieving preferences list"));
	}
});