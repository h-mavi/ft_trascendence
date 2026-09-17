import { ePlaying, localBoard, localInfo, debug, 
		 myPlayer, BOARD_AUDIO,
		 AI_MODELS_STUB, USE_STUB }				from "@/scripts/Data/Variables";
import { getTarget }								from "./utils/MovementUtils.js";
import { useSockStore } 							from "../../stores/sock.st.js";
import { playAudio } 								from "../Helper/generalUtils.js";

export async function sendToBackend(fromId, toId, flag)
{
	const	TargetZone = getTarget(fromId, toId);

	if (fromId && fromId !== toId && TargetZone)
	{
		const promise = await requestToBack(fromId, toId);
		if (promise)
			if (flag)
				return (true);
		else
			if (flag)
				return (false);
	}
}

export async function requestToBack(fromSquare, toSquare, opType, drawValue)
{
	const sockStore = useSockStore();
	let type;
	let payload;

	if (opType === "showBoost")
		{type = "simulate_boost"; toSquare = "";}
	else if (opType === "history")
		{type = "history"; fromSquare = ""; toSquare = "";}
	else if (opType === "giveUp")
		{type = "giveup"; fromSquare = ""; toSquare = ""; }
	else if (opType === "askdraw")
		{
			type = "draw";
			payload = { type, draw: drawValue === true};
			debug("ecco cosa mando: ", payload, type, payload.draw);
		}
	else if (fromSquare === null && toSquare === null && localInfo.secondTurn)
		{type = "endturn"; fromSquare = ""; toSquare = ""; }
	else if (fromSquare && toSquare === null)
		{type = "boost"; toSquare = ""; }
	else if (fromSquare == null && toSquare)
		{type = "trans"; fromSquare = localInfo.goatId; localInfo.goatId = null; }
	else if (fromSquare && toSquare && ((localInfo.secondMove && localInfo.secondTurn) || localBoard.get(fromSquare).useAbilityBool))
		{type = "moveboost";}
	else {type = "move";}

	if (!payload)
		payload = { type, from: fromSquare, to: toSquare };

	return new Promise((resolve) => {
		if (!sockStore.socket)
		{
			debug("[BackLink.js:65 -> requestToBack()]: socket non connesso");	
			resolve(false);
		}
		const timeout = setTimeout(() => resolve(false), 5000);
		sockStore.socket?.emit("game", payload, (result) => {
			clearTimeout(timeout);
			const ok = result?.log?.status === 200;

			resolve(ok);
			//NOTE - i rifiuti li suona handleErrors() sul payload d'errore: qui
			//suonerebbero una seconda volta sopra il primo.
			if (ok && !BOARD_AUDIO.has(type))
				playAudio(type === "draw" ? "" : type);
		});
	});
}

export async function fetchAiModels()
{
	if (USE_STUB)
		return (AI_MODELS_STUB);

	const sockStore = useSockStore();

	if (!sockStore.socket)
	{
		debug("[BackLink -> fetchAiModels()] socket non connesso");
		return ([]);
	}

	if (!await waitForSocketToBeReady())
	{
		debug("[BackLink -> fetchAiModels()] socket mai connesso");
		return ([]);
	}

	try {
		const answer = await sockStore.socket.timeout(5000).emitWithAck('create_ai_match', {});
		return (Array.isArray(answer?.aiProfiles) ? answer.aiProfiles : []);
	}
	catch {
		debug("[BackLink -> fetchAiModels()] nessuna risposta dal back");
		return ([]);
	}
}


function waitForSocketToBeReady(ms = 5000)
{
	const sockStore = useSockStore();
	if (!sockStore.socket)
		return (Promise.resolve(false));

	if (sockStore.socketReady)
		return (Promise.resolve(true));

	return new Promise((resolve) => {
		const done = (ok) => {
			clearTimeout(timer);
			sockStore.socket?.off('ready', onReady);
			resolve(ok);
		}
		const onReady = () => done(true);
		const timer = setTimeout(() => done(false), ms);
		sockStore.socket?.once('ready', onReady);
	});
}

/**
 * Chiede al back se questo client è dentro una partita.
 * Il payload {} serve a far finire l'ack in seconda posizione lato server.
 * @returns {Promise<"yes"|"no"|"unknown">}
 */
export async function amIPlaying()
{
	const sockStore = useSockStore();

	if (!sockStore.socket)
		return (ePlaying.UNKNOWN);

	if (!await waitForSocketToBeReady())
	{
		debug("[BackLink] -> [amIPlaying]: socket mai connesso");
		return (ePlaying.UNKNOWN);
	}
	try {
		const resp = await sockStore.socket.timeout(3000).emitWithAck("amiplaying", {});
		return (resp === true ? ePlaying.YES : ePlaying.NO);
	}
	catch {
		debug("[BackLink] -> [amIPlaying]: nessuna risposta dal back");
		return (ePlaying.UNKNOWN);
	}
}

export function reloadMatch()
{
	debug("chiamata di reload!");
	const sockStore = useSockStore();
	if (!sockStore.socket)
		return (Promise.resolve(false));

	return new Promise((resolve) =>
	{
		let retryId = null;
		let done	= false;

		const emit = () => {
			sockStore.socket?.emit("game", {
				type: "reload",
				from: sessionStorage.getItem("match:myTeam"),
				to: ""
			});
		};

		const finish = (ok) => {
			if (done)
				return;
			done = true;
			clearTimeout(timeout);
			clearInterval(retryId);
			sockStore.socket?.off("game", onResponse);
			sockStore.socket?.off("connect", start);
			resolve(ok);
		};

		const onResponse = (raw) => {
			if (raw?.type === "reload")
				return finish(raw?.log?.status === 200);
			if (raw?.log?.status && raw.log.status !== 200)
			{
				debug("[reload] il back rifiuta:", raw.log.msg);
				return finish(false);
			}
		};

		const start = () => {
			let tries = 0;
			emit();
			retryId = setInterval(() => {
				if(++tries >= 4)
					return (finish(false));
				emit();
			}, 1000);
		};

		const timeout = setTimeout(() => finish(false), 6000);

		sockStore.socket?.on("game", onResponse);

		if (sockStore.socket?.connected)
			start();
		else
			sockStore.socket?.once("connect", start);
	});
}

/**
 * @param {string} msg
 * @returns {boolean} false se il socket non è disponibile
 */
export function sendChatMsg(msg)
{
	const sockStore = useSockStore();
	const author	= myPlayer()?.name;

	if (!sockStore.socket)
	{
		debug("[BackLink.js -> sendChatMsg()]: socket non connesso");
		return (false);
	}
	sockStore.socket?.emit("gameMsg", { author: author ?? "", msg: msg });
	return (true);
}