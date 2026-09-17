
import * as lib from "./lib/lib.js";
import { apiRouter } from "./routes/api.js";
import { authRouter } from "./routes/auth/auth.js";
import { OAuthRouter } from "./routes/auth/OAuth.js";
import { mediaRouter } from "./routes/media.js";
import { responseFormatter, jsonResponse } from "./utils/response.js";
import { colors, tag } from "./utils/colors.js";
import { log } from "./utils/log.js";
import { globals } from "./Classes/Globals/globals.js";
const passport = lib.auth;
import "./websocket/websocket.js";

const { ALLOWED_URL, PORT } = lib;
const { cors } = lib.auth;
const { cookieParser, app, server, multer } = lib.include;

// NOTE: serve per parsing delle richieste da frontend
// app.use(cors({
// 	origin: ALLOWED_URL,
// 	credentials: true,
// }));

// SECTION - app.use
app.use(cookieParser());
app.use(lib.include.express.static('public'));
app.use(lib.include.express.json());

// SECTION - app.set
app.set('json spaces', 2);
app.set('clientMap', globals.clientMap);

// SECTION - routes
log.info('Routes initilization...');
app.use("/api", apiRouter);
app.use("/auth", authRouter, OAuthRouter);
app.use('/media', mediaRouter);
log.ok(`Routes loaded`);

// global error middleware
app.use((err, req, res, next) => 
{
	let	formattedResponse;
	if (err instanceof multer.MulterError) {
		if (err.code === 'LIMIT_FILE_SIZE') {
			return res.status(400).json(jsonResponse.ResponseError("File too large, max 5MB"));
		}
		return res.status(400).json(jsonResponse.ResponseError(`Upload error: ${err.message}`));
	}
	if (err) {
		return res.status(400).json(jsonResponse.ResponseError(err.message));
	}
	console.error(err);
	if (typeof(err) == "object")
	{
		err = "unknown crash in chess engine";
		return res.status(500).json(responseFormatter(null, null, err, 500));
	}
	next();
});

// server confiuration with web socket
server.listen(PORT, () => {
	log.server(`Setting up server on port`, PORT);
});

server.on('listening', () => {
	log.banner(PORT)
});

server.on("error", (err) => {
	if (err.code === "EADDRINUSE") {
		log.err(`Server already in use on port ${PORT}`)
	} else {
		log.err(`Server error: ${err}`)
	}
	process.exit(1);
});


//NOTE - DO NOT TOUCH!!!
const oggettoVuotoPerFarFunzionareTermjsNONCANCELLARE = 42;
export {oggettoVuotoPerFarFunzionareTermjsNONCANCELLARE};
//NOTE - NON CANCELLARE!!!