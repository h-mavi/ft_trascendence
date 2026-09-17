
import * as lib from "../../lib/lib.js";
import { createJwt } from "../../utils/auth.js";
import { jsonResponse } from "../../utils/response.js";
const { passport } = lib.auth;
export const OAuthRouter = lib.include.express.Router();

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
function passportHandler(req, res, next) {
	passport.authenticate('google', {session: false}, (err, user) => {
		if (err) {
			console.log("Error: ", err);
			return res.status(500).json(jsonResponse.ResponseError("Server error checking for user"));
		}
		if (!user)
			return res.status(401).json(jsonResponse.ResponseSuccess("Google authentication failed"));
		req.user = user;
		next();
	})(req, res, next);
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
// FIXME - da sostituire http con https una volta messi i cert
OAuthRouter.get("/google_login", passport.authenticate('google', { scope: ['profile', 'email'] }));

OAuthRouter.get("/google_login/callback",
	passportHandler,
	async (req, res) => {
		try {
			const user = req.user;
			await createJwt(req, res);
			return res.redirect("https://localhost:8000");
		} catch (error) {
			console.log("Error: ", error);
			return res.redirect("https://localhost:8000");
		}
});
