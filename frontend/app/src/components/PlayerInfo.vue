<script setup>
	import UserAvatar from '@/components/UserAvatar.vue';
	import { DOMPlayer, getBotImage, localInfo }				from '@/scripts/Data/Variables';
	import { computed }							from 'vue';
	import	TimerClock							from "./TimerClock.vue"
	import	CapturedPieces						from "./CapturedPieces.vue"
	import	TagTitle							from "./TagTitle.vue"

	const prop = defineProps({
  		p: Number,
		pos: {type: String, default: 'bottom'}
	});
	const	player	= computed(() => DOMPlayer(prop.p)),
			playing	= computed(() => player.value.isPlaying),
			running	= computed(() => playing.value && localInfo.matchStarted && !localInfo.victory),
			active	= computed(() => playing.value && !localInfo.victory),
			up		= prop.pos === 'top',
			down	= prop.pos === 'bottom';

	const nameSize = computed(() => {
		let len = player.value.name.length;
		if (len <= 14)  { return 'large'; }
		if (len > 14 && len <= 24)  { return 'medium'; }
		return '13px';
	});

	const avatar = computed(() => {
		const p = player.value;
		if (!p)
			return (null);
		return (localInfo.aiGame ? getBotImage(p.name) : p.image);
	})

</script>

<template>
	<div class="wrap w-150" 
		v-bind:class="{
		'rounded-t-md':up,
		'rounded-b-md':down,
		'is-turn':playing,
		'pos-up':up,
		'pos-down':down}">

		<!--NOTE - il tag del titolo e' gia' agganciato: comparira' da solo appena il
		match state portera' player.title, come lo porta gia' l'utente fuori dalla partita.-->
		<div class="relative shrink-0 dim" v-bind:class="{ 'dim-off':!playing }">
			<UserAvatar :src="avatar"
				alt="User Icon" class="rounded-full object-cover size-18.75 stretch 0" />
			<TagTitle v-if="player?.title" :title="player.title" class="text-[10px] py-0.75 absolute -bottom-1 -right-6"/>
		</div>

		<div class="shrink-0 dim" v-bind:class="{'dim-off':!playing}">
			<b><h1 class="max-w-56 overflow-hidden text-ellipsis"
					:style="{ fontSize: nameSize }">
					{{ player.name }}<span v-if="player.elo != null" class="text-text-default"> [{{ player.elo }}]</span>
				</h1></b>
			<div class="flex">
				<h2>Points: {{ player.nPoints }}</h2>
				<p class="text-text-last mx-2">|</p>
				<CapturedPieces :player="player"/>
			</div>
		</div>
		<TimerClock :millis="player.time" :go="running" :active="active" :team="player.team" class="ml-auto"/>
	</div>
</template>

<style scoped>
	.wrap {
		display: flex;
		flex-direction: row;
		z-index: 5;
		position: relative;
		background-color: #2c2c2c;
		align-self: center;
		user-select: none;
		padding: 1.5%;
		box-shadow: 0 0 0 0 transparent;
		transition: box-shadow .4s ease;
	}

	.wrap.pos-down.is-turn {
		box-shadow: 0 2px 25px 5px rgba(255, 255, 255, 0.297);
	}

	.wrap.pos-up.is-turn {
		box-shadow: 0 -2px 25px 5px rgba(255, 255, 255, 0.297);
	}

	.wrap.is-turn::after { opacity: 1; }

	.dim {
		transition: opacity .4s ease;
	}
	.dim-off {
		opacity: .4;
	}

	h1 {
		color: var(--color-text-default);
		padding: 3px;
		padding-left: 8px;
	}

	h2 {
		color: var(--color-text-default);
		font-size: large;
		padding-left: 8px;
	}

	button {
		display: flex;
		position: relative;
		gap: 4px;
		height: 55%;
		padding: 10px;
		margin-left: 5px;
		border-radius: 16px;
	}
</style>