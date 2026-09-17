<script setup>
	import { ref, watch, nextTick }	from 'vue'
	import { chat, resolveAuthor }	from '@/scripts/Data/ChatBox';
	import { sendChatMsg }			from '@/scripts/Events/BackLink';
	import { useI18n }				from 'vue-i18n';
	import { MACRO }		 		from '@/scripts/Data/Variables';
	
	const { t } = useI18n();
	const listEl	= ref(null);
	const draft		= ref('');

	function onKeyDown(event)
	{
		if (event.key === 'Enter')
			send();
	}

	function send()
	{
		const text = draft.value.trim();

		if (!text)
			return;
		if (!sendChatMsg(text))
			return;
		draft.value = '';
	}

	function originClass(msg)
	{
		const origin = resolveAuthor(msg.author);

		if (origin.kind === 'server')
			return ('k-server');
		return (origin.team ? `t-${origin.team}` : '');
	}

	watch(() => chat.messages.at(-1)?.id, async () => {

		const el= listEl.value;

		if (!el)
			return;

		const	wasAtBottom = (el.scrollHeight - el.scrollTop - el.clientHeight) < 24;

		await nextTick();
		if (wasAtBottom)
			el.scrollTop = el.scrollHeight;
	})
</script>

<template>
	<div class="msgbox">
		<div ref="listEl" class="msglist">
			<p v-for="msg in chat.messages" :key="msg.id" class="line" v-bind:class="originClass(msg)">
				<span class="author">{{ msg.author }} :</span><span class="text text-xs">{{ msg.text }}</span>
			</p>
			<p v-if="!chat.messages.length" class="line empty">{{ t('game.ChessBoard.chatHistory') }}</p>
		</div>

		<div class="composer">
			<input v-model="draft"
					type="text"
					:maxlength="MACRO.MAX_MSG_LEN"
					:placeholder="t('game.ChessBoard.chatPrompt')"
					@keydown.stop="onKeyDown">
			<button type="button" :disabled="!draft.trim()" @click="send">{{ t('game.ChessBoard.send') }}</button>
		</div>
	</div>
</template>

<style scoped>
	.msgbox
	{
		display: flex;
		flex-direction: column;
		overflow: hidden;
		user-select:  none;
		border: 1px solid rgba(255, 255, 255, .35);
		border-radius: 10px;
	}

	.msglist
	{
		height: 6rem;
		overflow-y: auto;
		padding: .5rem .75rem;
	}

	.composer
	{
		display: flex;
		align-items: center;
		gap: .5rem;
		padding: .4rem .5rem;
		border-top: 1px solid rgba(255, 255, 255, .2);
		user-select: text;
	}

	.composer input
	{
		flex: 1;
		min-width: 0;
		border: none;
		outline: none;
		background: transparent;
		color: #e8e8e8;
		font-size: .9rem;
	}

	.composer input::placeholder { color: rgba(255, 255, 255, .35); }

	.composer button
	{
		flex-shrink: 0;
		padding: .15rem .6rem;
		border: 1px solid rgba(255, 255, 255, .35);
		border-radius: 6px;
		color: #e8e8e8;
		font-size: .8rem;
	}

	.composer button:disabled { opacity: .35; cursor:default }
	
	.line
	{
		--author-color: rgba(255, 255, 255, .35);

		display: flex;
		align-items: baseline;
		width: 100%;
		border-left: 4px solid var(--author-color);
		/* padding-left: .5rem; */
		color: #e8e8e8;
		font-size: 0.9rem;
		line-height: 1.25rem;
		text-align: left;
		user-select: text;
	}

	.line + .line {margin-top: .35rem;}

	.line.k-server	{ --author-color: #e57373; }
	.line.t-white	{ --author-color: #ededed; }
	.line.t-black	{ --author-color: #6b6b6b; }
	.line.t-red		{ --author-color: #d5493f; }
	.line.t-blue	{ --author-color: #4a7fd0; }
	.line.t-green	{ --author-color: #4fa564; }
	.line.t-yellow	{ --author-color: #d8b13c; }
	
	.author
	{
		flex: 0 0 auto;
		white-space: nowrap;
		color: var(--author-color);
		font-weight: 600;
		text-transform: uppercase;
		/* padding: .25rem; */
		margin-right: .5rem;
		margin-left: .5rem;
	}

	.text
	{
		flex: 1 1 auto;
		min-width: 0;
		word-break: break-word;
	}

	.line.empty
	{
		justify-content: center;
		border-left-color: transparent;
		color: rgba(255, 255, 255, .35);
		text-align: center;
	}

</style>
