
import * as lib from "../lib/lib.js";
import { checkJwt } from "../utils/auth.js";
import { jsonResponse } from "../utils/response.js"
const { path } = lib.include;
export const mediaRouter = lib.include.express.Router();

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * NOTE: endpoint per displayare immagine da frontend
*/
mediaRouter.get('/*folder', (req, res) => {
	const relPath = req.params.folder;
	const filePath = path.join(process.cwd(), 'media', ...relPath);
	const basePath = path.join(process.cwd(), 'media');
	if (!filePath.startsWith(basePath))
		return res.status(403).json(jsonResponse.ResponseError("Invalid path"));
	res.sendFile(filePath, (err) => {
		if (err)
			res.status(404).json(jsonResponse.ResponseError("Image not found"));
	})
});