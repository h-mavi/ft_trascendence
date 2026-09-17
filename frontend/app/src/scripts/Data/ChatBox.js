import { reactive, computed }	from "vue";
import { localPlayers, MACRO }	from "./Variables";


/** @typedef {{ id: number, author: string, text: string, time: number }} ChatMessages */

/**
 * I messaggi della chat di partita, dal piu' vecchio al piu' recente è Reattiva quindi
 * il pannello si aggiorna da solo.
 * @type {{ messages: ChatMessages[] }}
 */
export const	chat = reactive({ messages: [] });

/** Progressivo per la key del ciclo di rendering: serve solo a distinguere due messaggi uguali. */
let				nextId = 1;

/**
 * Accoda un messaggio alla chat e tiene la lista dentro il tetto di MACRO.MAX_MESSAGES.
 *
 * Senza autore il messaggio e' del server: il default vale quando il parametro manca, il
 * secondo ripiego quando arriva esplicitamente nullo o vuoto.
 *
 * Il taglio parte dalla testa, quindi quando la chat e' piena sono i messaggi piu' vecchi
 * a sparire.
 *
 * @param	{string | null}	text		Testo del messaggio
 * @param	{string | null}	[author]	Nome di chi scrive, assente per i messaggi di sistema
 * @returns	{boolean}					true se il messaggio e' entrato, false se era vuoto
 */
export function pushMessage(text, author = MACRO.SERVER_AUTHOR)
{
	if (!text)
		return (false);
	chat.messages.push({
		id: nextId++,
		author: author === "GMU(Generale Matsuda Usushi)" ?  "Matsuda" : author || MACRO.SERVER_AUTHOR,
		text: text,
		time: Date.now(),
	})
	if (chat.messages.length > MACRO.MAX_MESSAGES)
		chat.messages.splice(0, chat.messages.length - (MACRO.MAX_MESSAGES - 1));
	return (true);
}

const	teamByName = computed(() => {
	const	map = new Map();

	for (const player of localPlayers.values())
		map.set(player.name, player.team);
	return (map);
});

/**
 * Dice al pannello il colore del msg:
 *  server rosso
 *  player -> teamByname
 *
 * @param	{string | null}	author		Nome di chi ha scritto
 * @returns	{{kind: "server"|"player", team: string|null}}	Come mostrare il messaggio
 */
export function resolveAuthor(author)
{
	if (!author || author === MACRO.SERVER_AUTHOR)
		return ({ kind:"server", team: null });
	return ({ kind: "player", team: teamByName.value.get(author) ?? null });
}

/** Svuota la chat e riporta il progressivo a uno. La chiama clearMatchStorage(). */
export function clearMessages()
{
	chat.messages.length = 0;
	nextId = 1
}
