<script setup>
	import { localInfo, localBoard, myPlayer, 
			 canAfford, 
			 isAbilityArmed}						from '@/scripts/Data/Variables.js';
	import { useAbility, sendEndTurn, shopAbility, 
			 sendGiveUp, showBoostedMovesHover,
			 showBoostedMovesLeave,  sendDraw}		from '@/scripts/Events/utils/GlobalUtils';
	import { computed, ref }						from 'vue'
	import { useI18n }								from 'vue-i18n';
	import { useClickOutside, playAudio }			from '@/scripts/Helper/generalUtils.js';
	import IconHourglass							from '@/components/icons/IconHourglass.vue';
	import IconLightning							from '@/components/icons/IconLightning.vue';
	import IconFlag									from './icons/IconFlag.vue';
	import IconHandshake							from './icons/IconHandshake.vue';
	import IconEnergyArrow							from './icons/IconEnergyArrow.vue';
	import IconCheck 								from './icons/IconCheck.vue';
	import IconCross 								from './icons/IconCross.vue';

	const { t, locale } = useI18n({ useScope: 'global' });
	const localPlayer			= computed(() => myPlayer());
	const myTurn				= computed(() => localPlayer.value?.isPlaying === true);
	const Piece					= computed(() => {
		if (!localInfo.clickedId)
			return null;
		return ( localBoard.get(localInfo.clickedId)?.piece ?? null);
	})
	const canUseAbility 		= computed(() => myTurn.value && Piece.value && Piece.value.isBoostedBool && Piece.value.team === localInfo.myTeam && !localInfo.secondTurn);
	const canBoost 				= computed(() => myTurn.value && Piece.value && !Piece.value.isBoostedBool && canAfford(Piece.value) && localInfo.secondTurn);
	const canEndTurn 			= computed(() => myTurn.value && localInfo.secondTurn);
	const panelEl 				= ref(null);
	const drawIncoming			= computed(() => localInfo.drawOffer === "received");
	const drawWaiting			= computed(() => localInfo.drawOffer === "sent");
	const drawArmed				= computed(() => drawIncoming.value || localInfo.pending === "draw");
	const giveUpArmed			= computed(() => localInfo.pending === "giveup");

	function askGiveUp()		{ localInfo.pending = (localInfo.pending === 'giveup') ? null : 'giveup'; }
	function askDraw()			{ localInfo.pending = (localInfo.pending === 'draw') ? null : 'draw'; }
	function cancelPending(event)
	{
		if (event?.target && !document.contains(event.target))
			return;
		localInfo.pending = null;
	}

	useClickOutside(panelEl, cancelPending, { when: () => localInfo.pending });

	function confirmGiveUp() 
	{
		localInfo.pending = null;
			sendGiveUp();
	}

	function confirmDraw()	{sendDraw(true);}

	function refuseDraw()
	{
		if (drawIncoming.value)
			sendDraw(false);
		else
			cancelPending();
	}

	const abilityArmed = computed(() => isAbilityArmed(localBoard.get(localInfo.clickedId)));

	//NOTE - un solo listener in capture sul wrapper: intercetta ogni bottone del pannello
	//prima che lo @click.stop di askDraw fermi la risalita dell'evento.
	function tap(event)
	{
		if (event.target?.closest?.("button"))
			playAudio("tap");
	}

</script>

<template>
	<div class="wrapper" v-if="localPlayer" @click.capture="tap">
		<div class="top-row">
			<button class="action-btn" 		
				v-bind:class="[
				canUseAbility ? 'on' : 'off',
				abilityArmed ? 'armed bg-[#d8ae26] hover:bg-[#ebbd27]'
							 : 'bg-[#1f9db7] hover:bg-[#29aec9]'
				]"
				@click="useAbility()">
				<IconEnergyArrow class="icon"/>
				<b>{{ abilityArmed ? t('game.ChessBoard.buttons.abilityOn') : t('game.ChessBoard.buttons.useAbility') }}</b>
			</button>
		</div>

		<span class="msgs">THEN</span>

		<div class="mid-row">
			<button class="action-btn end-turn bg-blue-500 hover:bg-[#3b89ff]"
				v-bind:class="canEndTurn ? 'on' : 'off'"
				@click="sendEndTurn()">
				<IconHourglass class="icon"/>
				<b :class="{ 'text-[.95rem] whitespace-nowrap' : locale == 'it' }">{{ t('game.ChessBoard.buttons.endTurn') }}</b>
			</button>

			<span class="msgs">OR</span>

			<button class="action-btn bg-emerald-600 hover:bg-[#01a76f]"
				v-bind:class="canBoost ? 'on' : 'off'"
				@click="shopAbility()"
				@mouseenter="showBoostedMovesHover(localInfo.clickedId)"
				@mouseleave="showBoostedMovesLeave()">
				<IconLightning class="icon"/>
				<b :class="{ 'text-[.85rem] whitespace-nowrap' : locale == 'it' }">{{ t('game.ChessBoard.buttons.boostPiece') }}</b>
			</button>
		</div>
		
		<div class="bottom-section" ref="panelEl">
			<div class="btm-row">
				<div class="give-up">
					<button v-if="!giveUpArmed"
							class="on action-btn bg-[#d63134] hover:bg-[#e2292c]"
							@click="askGiveUp()">
						<IconFlag class="icon"/>
						<b>{{ t('game.ChessBoard.buttons.giveUp') }}</b>
					</button>
					<div v-else class="action-btn split">
						<button class="half yes" title="Confermo" @click="confirmGiveUp()">
							<IconCheck class="icon"/>
						</button>
						<span class="divider"></span>
						<button class="half no" title="Annullo" @click="cancelPending()">
							<IconCross class="icon"/>
						</button>
					</div>
				</div>
				<div class="draw">
					<button v-if="!drawArmed"
							class="action-btn on bg-[#c78a19] hover:bg-[#d69317]"
							v-bind:class="drawWaiting ? 'waiting' : 'on'"
							@click.stop="askDraw()">
						<IconHandshake class="icon"/>
						<b>{{ drawWaiting ? t('game.ChessBoard.buttons.waiting') : t('game.ChessBoard.buttons.askDraw') }}</b>
					</button>
					<div v-else class="action-btn split" v-bind:class="{ incoming: drawIncoming}">
						<button class="half yes" title="Pareggio sì" @click="confirmDraw()">
							<IconCheck class="icon"/>
						</button>
						<span class="divider"/>
						<button class="half no" title="Pareggio no" @click="refuseDraw()">
							<IconCross class="icon"/>
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
	.wrapper
	{
		display: flex;
		flex-direction: column;
		gap: 12px;
		width: 100%;
		user-select: none;
		z-index: 10;
	}

	.top-row,
	.mid-row
	{
		display: flex;
		align-items: stretch;
		justify-content: center;
		gap: 12px;
		width: 100%;
		margin: 0 auto;		
	}

	.top-row > .action-btn,
	.mid-row > .action-btn
	{
		flex: 1 1 0;
		min-width: 0;
	}

	.bottom-section
	{
		position: relative;
	}

	.btm-row
	{
		display: flex;
		align-items: stretch;
		justify-content: center;
		gap: 12px;
		width: 100%;
		margin: 0 auto;
		margin-top: 10%;
	}

	.give-up,
	.draw
	{
		display: flex;
		flex: 1 1 0;
		min-width: 0;
		font-size: .85rem;
	}

	.give-up > .action-btn,
	.draw > .action-btn
	{
		flex: 1 1 0;
		min-width: 0;
		gap: 10px;
	}

	.msgs
	{
		flex: 0 0 auto;
		align-self: center;
		color: var(--color-text-default);
		font-size: .8rem;
		font-weight: 700;
		letter-spacing: .08rem;
	}

	.action-btn
	{
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 12px;
		border-radius: 8px;
		color: var(--color-text-default);
		transition: opacity .3s ease-in-out, filter .3s ease-in-out, transform .2s ease-in-out;
	}

	.icon
	{
		flex: 0 0 auto;
		font-size: 1.25em;
	}

	.action-btn.on
	{
		opacity: 1;
		filter: grayscale(0);
		cursor: pointer;
		pointer-events: auto;
	}

	.action-btn.on:hover{
		transform: translateY(-2px) scale(1.05);
	}

	.action-btn.on:active
	{
		transform: scale(.96);
		transition-duration: .05s;
	}

	.action-btn.off
	{
		opacity: .4;
		filter: grayscale(1);
		pointer-events: none;
	}

	.action-btn.armed
	{
		color: var(--color-text-default);
		animation: armed-pulse 1.4s ease-out infinite;
	}

	.action-btn.armed .icon { animation: armed-throb .7s ease-in-out infinite alternate; }

	.action-btn.waiting
	{
		opacity: 4;
		filter: grayscale(.5);
		pointer-events: none;
		animation: armed-pulse 1.4s ease-in-out infinite;
		background: rgb(94, 94, 221);
	}

	.action-btn.waiting .icon { animation: armed-throb .7s ease-in-out infinite alternate;}

	.action-btn.split
	{
		padding: 0;
		overflow: hidden;
		gap: 0;
		align-items: stretch;
		background: rgba(20, 20, 20, .85);
		box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .18);
	}

	.action-btn.split.incoming
	{
		animation: armed-pulse 1.4s ease-out infinite;
	}

	.half
	{
		display: flex;
		flex: 1 1 0;
		align-items: center;
		justify-content: center;
		padding: 12px 0;
		cursor: pointer;
		transition: background-color .2s ease-in-out, transform .2s ease-in-out;
	}

	.half.yes { color: rgb(52, 211, 153); }
	.half.no  { color: rgb(248, 113, 113); }

	.half.yes:hover { background: rgba(116, 228, 11, 0.30); }
	.half.no:hover  { background: rgba(218, 12, 12, 0.30); }

	.half:active { transform: scale(.94); }

	.half .icon { font-size: 1.25rem; }

	.divider
	{
		flex: 0 0 1px;
		align-self: stretch;
		background-color: rgba(255, 255, 255, .25);
	}

	@keyframes armed-pulse
	{
		0%		{ box-shadow: 0 0 0 0 rgba(249, 115, 22, .65); }
		70%		{ box-shadow: 0 0 0 12px rgba(249, 115, 22, 0); }
		100%	{ box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); }
	}

	@keyframes armed-throb
	{
		from	{ transform: scale(1); }
		to		{ transform: scale(1.2); }
	}
</style>