//SECTION - websocket main file
/*
	list of exports:
	OBJECTS:
	-	sockio: the websocket server.
*/

import * as lib from "../lib/lib.js";
import { DEBUG_WEBSOCKETS, MATCH_RECONNECT_TIMER, SOCKET_RECONNECT_TIMER, TOURNAMENT_WAIT_TIMER} from "../Macro/macro.js";
import { query } from "../lib/query.js";
import { websocketConnectionHandler, websocketDisconnectionHandler } from "./handlers/connection.js";
import { routesMatchMaking } from "./routes/routesMatchMaking.js";
import { routesGame } from "./routes/routesGame.js";
import { routesTournament } from "./routes/routesTournaments.js";

/** @typedef {import("../Classes/Globals/socketInfo.js").SocketInfo} Socket */

export const sockio = new lib.include.SocketIO(lib.include.server, {
	cors: {
		origin: lib.ALLOWED_URL,
		methods: ["GET", "POST"],
		credentials: true
	},
	connectionStateRecovery: {} // se il client si disconnette temporaneamente gli arrivano gli eventi alla riconnessione, senza vengono persi
});

//NOTE - ⚠️senza questo le connessioni websockets non sono sicure!
//NOTE - ⚠️	https://www.youtube.com/watch?v=SgR8NAkQ3cc&themeRefresh=1
// middleware aunteticazione websocket
sockio.engine.use(async (req, res, next) => {
	const firstConn = req._query.sid === undefined;
	if (!firstConn)
		return next();
	//NOTE - questa macro (settata di default a false, abilitata da .env)
	//			permette di avere user fasulli per testare il matchmaking
	if (DEBUG_WEBSOCKETS == true)
		return (next());
	const cookies = lib.include.parse(req.headers.cookie || "");
	const token = cookies.jwt_token;
	if (!token)
		return next(new Error("User not authorized"));
	if (await lib.include.redis.get(`blacklist:${token}`))
		return next(new Error("User not authorized"));
	try {
		req.user = lib.auth.jwt.verify(token, process.env.JWT_SECRET);
	} catch (error) {
		console.log("error: ", error);
		return next(new Error("User not authorized"));
	}
	req.user = await query.usersQuery.getUserById(req.user.id_user);
	next();
});

sockio.on('connection', async (socket) => 
{
	let	user;

	user = await websocketConnectionHandler(socket);
	if (!user)
		return ;
	routesMatchMaking(socket, user);
	routesGame(socket, user);
	routesTournament(socket, user);
	websocketDisconnectionHandler(socket, user);
	socket.emit('ready');
});
