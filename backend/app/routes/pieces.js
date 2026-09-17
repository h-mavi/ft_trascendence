
import * as lib from "../lib/lib.js";
import { query } from "../lib/query.js";
import { jsonResponse } from "../utils/response.js";
const { piecesQuery } = query;
export const piecesRouter = lib.include.express.Router();

// NOTE: /api/pieces
piecesRouter.get("/", async (req, res) => {
	try {
		const { name } = req.query;
		const pieces = name ? await piecesQuery.findPieceByName(name) : await piecesQuery.getAllPieces();
		if (pieces && pieces.length > 0)
			return res.status(200).json(jsonResponse.ResponseSuccess({ "pieces": pieces }));
		return res.status(404).json(jsonResponse.ResponseError("Pieces not found"));
	} catch (error) {
		console.log("Error: ", error);
		return res.status(500).json(jsonResponse.ResponseError("Server error searching pieces"));
	}
});

piecesRouter.get("/:id", async (req, res) => {
	try {
		const piece = await piecesQuery.getPieceById(req.params.id);
		if (piece)
			return res.status(200).json(jsonResponse.ResponseSuccess({ "piece": piece }));
		return res.status(404).json(jsonResponse.ResponseError("Piece not found"));
	} catch (error) {
		console.log("Error: ", error);
		return res.status(500).json(jsonResponse.ResponseError("Server error searching piece"));
	}
});
