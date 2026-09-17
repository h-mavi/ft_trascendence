
import * as lib from "../lib/lib.js";
import {gameHttpHandler} from "../handlers/game/Game.js";
export const gameRouter = lib.include.express.Router();

gameRouter.post("/", gameHttpHandler);
