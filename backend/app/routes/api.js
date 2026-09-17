
import * as lib from "../lib/lib.js";
import { usersRouter } from "./users.js";
import { gameRouter } from "./game.js";
import { piecesRouter } from "./pieces.js";
import { notifyRouter } from "./notifications.js";
import { friendsRouter } from "./friendships.js";
import { preferencesRouter } from "./preferences.js";
import { matchHistoryRouter } from "./matchHistory.js";
import { tournamentsRouter } from "./tournaments.js";
export const apiRouter = lib.include.express.Router();

apiRouter.use("/users", usersRouter);
apiRouter.use("/game", gameRouter);
apiRouter.use("/pieces", piecesRouter);
apiRouter.use("/notifications", notifyRouter);
apiRouter.use("/friends", friendsRouter);
apiRouter.use("/preferences", preferencesRouter);
apiRouter.use('/matchesHistory', matchHistoryRouter);
apiRouter.use('/tournaments', tournamentsRouter);
