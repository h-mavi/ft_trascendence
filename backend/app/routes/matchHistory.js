
import * as lib from "../lib/lib.js";
import { jsonResponse } from "../utils/response.js";
import { checkJwt } from "../utils/auth.js";
import { log } from "../utils/log.js";
import { response } from "express";
import { match } from "node:assert";
import { matches_round } from "../generated/prisma/index.js";
import { query } from "../lib/query.js";
const { matchHistoryQuery } = query;
export const matchHistoryRouter = lib.include.express.Router();

// NOTE /api/matchesHistory

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * NOTE: trova la history delle partite dello user loggato
 */
matchHistoryRouter.get('/', checkJwt, async (req, res) => {
	try {
		const matches = await matchHistoryQuery.getAllUserMatches(req.user.id_user);
		return res.status(200).json(jsonResponse.ResponseSuccess({ "matches": matches }));
	} catch (error) {
		console.log("Error: ", error);
		return res.status(500).json(jsonResponse.ResponseError("Server error retrieving user matches history"));
	}
});

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * NOTE: trova la history delle partite dello user preso da param `id`
 */
matchHistoryRouter.get('/user/:id', checkJwt, async (req, res) => {
	try {
		const matches = await matchHistoryQuery.getAllUserMatches(req.params.id);
		return res.status(200).json(jsonResponse.ResponseSuccess({ "matches": matches }));
	} catch (error) {
		console.log("Error: ", error);
		return res.status(500).json(jsonResponse.ResponseError("Server error retrieving user matches history"));
	}
});
