<script setup>
	//@ts-nocheck
	import IconEsoteric											from './icons/IconEsoteric.vue';
	import { localBoard, localInfo, skinSrc, codexPiece }		from '@/scripts/Data/Variables.js';
	import { computed, ref, watch }								from 'vue';
	import { PIECES_CODEX }										from '@/scripts/Data/PiecesCodex.js';
	import MoveGrid												from './MoveGrid.vue';
	import IconCoins											from './icons/IconCoins.vue';

	const piece = codexPiece;
	watch(() => localInfo.lastClickedId, (id) => {
		const selected = localBoard.get(id)?.piece;
		if (selected && selected.team === localInfo.myTeam)
		{
			piece.value = selected;
			return;
		}
		const clicked = localBoard.get(localInfo.clickedId)?.piece;
		if (id === null && clicked?.team === localInfo.myTeam)
			piece.value = null;
	});

	const tab			= ref('base');
	const piecePath 	= computed(() => piece.value ? skinSrc(piece.value.team, piece.value.type, tab.value === 'boost') : "");
	const entry			= computed(() => piece.value ? PIECES_CODEX[piece.value.type] ?? null : null);
	const shownTitle	= computed(() => tab.value === 'base' ? entry.value?.baseTitle : entry.value?.boostTitle);
	const shownText		= computed(() => tab.value === 'base' ? entry.value?.baseText : entry.value?.boostText);
	const descLines		= computed(() => {
		const lines = (shownText.value ?? '')
			.split('\n')
			.map(l => l.trim())
			.filter(Boolean)
			.map(text => ({ text, step: /^\d+[.)]/.test(text) }));

		const bullet = lines.length > 1 && lines.every(l => !l.step);

		return (lines.map(l => ({ ...l, bullet })));
	});
	const shownScenes	= computed(() => {
		if (!entry.value)
			return ([]);

		const scenes = tab.value === 'base' ? entry.value.baseScenes : entry.value.boostScenes;
		if (scenes?.length)
			return (scenes);

		const pattern = tab.value === 'base' ? entry.value.move : entry.value.boost;
		if (!pattern)
			return ([]);
		return ([{
			actors:	[ { x:0, y:0, role: 'self' } ],
			pattern,
		}])
	});

	const enemyTeam		= computed(() => piece.value?.team === 'black' ? 'white' : 'black');
	const iconFor		= (actor) => {
		const team = actor.role === 'enemy' ? enemyTeam.value : piece.value?.team;
		const type = actor.type ?? piece.value?.type;
		return (skinSrc(team, type, actor.role === 'self' && tab.value === 'boost'));
	}

	watch(piece, () => tab.value = 'base');
</script>

<template>
	<div class="wrap">

		<div class="flex flex-col">
			<div class="title">
				<IconEsoteric class="codex-svg"/>
				<h1 class="title-txt">
					<span class="title-top">KING'S</span>
					<span class="ml-[50%]">CODEX</span>
				</h1>
			</div>
			<hr class="w-[110%] self-center text-text-last mt-1.5 mx-4">

			<div class="metadata" :class="{ 'invisible' : !piece }">
				<div class="mb-8 mt-10">
					<div class="page-head">
						<img v-if="piecePath" :src="piecePath" alt="" :draggable="false" class="piece-icon">
						<div class="head-info">
							<h2 class="font-[1000] transform: uppercase">{{ entry?.name ?? piece?.type  }}</h2>
							<span class="text-lg flex flex-row items-center gap-2">
								<IconCoins/> {{ piece?.price }}
							</span>
						</div>
					</div>
				</div>
				<div class="moves">
					<div class="flex w-full">
						<button type="button" class="tab" :class="{ active: tab === 'base' }" @click="tab = 'base'">Base</button>
						<button type="button" class="tab" :class="{ active: tab === 'boost' }" :disabled="!entry?.boost && !entry?.boostScenes?.length" @click="tab = 'boost'">Boost</button>
					</div>
					<div class="move-info">
						<h3 v-if="shownTitle" class="move-title">{{ shownTitle }}</h3>
						<div v-if="descLines.length" class="move-desc">
							<p v-for="(line, i) in descLines" :key="i" class="move-line" :class="{ step: line.step, bullet: line.bullet }">{{ line.text }}</p>
						</div>
					</div>
					<div class="scenes">
						<figure v-for="(scene, i) in shownScenes" :key="i" class="scene">
							<MoveGrid :scene="scene" :variant="tab === 'base' ? 'regular' : 'boosted'" :resolve-icon="iconFor"/>
							<figcaption v-if="scene.caption" class="scene-cap">{{ scene.caption }}</figcaption>
						</figure>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
	.wrap
	{
		user-select: none;
		box-sizing: border-box;
		flex: 0 0 auto;
		width: 25rem;
		margin-top: 1rem;
		padding-right: 3rem;
		padding-left: 3rem;
		/* margin: 2rem; */
	}

	.title
	{
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: .8rem;
		zoom: .88;
		padding-top: 1rem;
	}

	.title-txt
	{
		display: flex;
		flex-direction: column;
		line-height: 1;
		color: var(--color-text-default);
		font-weight: 1000;
		font-size: x-large;
		letter-spacing: .08rem;
		font-family: Arial, Helvetica, sans-serif;
		gap: .8rem;
	}

	.head-info
	{
		display: flex;
		flex-direction: column;
		gap: .8rem;
		margin-top: 1rem;
		color: var(--color-text-default);
		font-weight: 700;
		font-size: x-large;
		letter-spacing: .08rem;
		line-height: 1;
		font-family: Arial, Helvetica, sans-serif;
		text-transform: uppercase;
	}

	.codex-svg
	{
		flex: 0 0 auto;
		font-size: 6rem;
	}

	.metadata
	{
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		text-align: center;
		color: var(--color-text-default);
		font-family: Arial, Helvetica, sans-serif;
	}

	.page-head
	{
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: .1rem;
		zoom: .88;
	}

	.piece-icon
	{
		--piece-dim: 6rem;

		flex: 0 0 auto;
		width: var(--piece-dim);
		height: var(--piece-dim);
		object-fit: contain;
	}

	.piece-name
	{
		font-size: 1.5rem;
		font-weight: 1000;
		letter-spacing: .12rem;
		line-height: 1;
		text-transform: uppercase;
		margin-top: .5rem;
	}

	.moves
	{
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: .5rem;
		width: 18rem;
		padding-left: 1rem;
		padding-right: 1rem;
	}

	.tabs
	{
		display: flex;
		width: 100%;
	}

	.move-info
	{
		position: relative;
		display: flex;
		flex-direction: column;
		gap: .55rem;
		padding: .9rem 1.1rem;
		width: 25rem;
		margin-inline: -2rem;
		min-height: 3.5rem;
	}

	.move-title
	{
		font-size: .85rem;
		font-weight: 1000;
		letter-spacing: .1rem;
		text-transform: uppercase;
	}

	.move-desc
	{
		display: flex;
		flex-direction: column;
		gap: .35rem;
		max-width: 20rem;
		margin-inline: auto;
		font-size: .75rem;
		line-height: 1.35;
		letter-spacing: .02rem;
		opacity: .8;
	}

	.move-line
	{
		margin: 0;
	}

	.move-line.step
	{
		padding-left: 1.5rem;
		text-indent: -1.5rem;
		text-align: left;
	}

	.move-line.bullet
	{
		padding-left: 1rem;
		text-indent: -1rem;
		text-align: left;
	}

	.move-line.bullet::before
	{
		content: '\2022';
		display: inline-block;
		width: 1rem;
		text-indent: 0;
		opacity: .55;
	}

	.moves::before
	{
		content: '';
		position: absolute;
		width: 3.5rem;
		height: 26rem;
		border: 1px solid var(--color-border-default);
		pointer-events: none;
		top: .9rem;
		left: -2.5rem;
		border-right: none;
		/* border-bottom: none; */
		z-index: 0;
	}

	.moves::after
	{
		content: '';
		position: absolute;
		width: 3.5rem;
		height: 26rem;
		border: 1px solid var(--color-border-default);
		pointer-events: none;
		top: .9rem;
		right: -2.5rem;
		/* border-top: none; */
		border-left: none;
		z-index: 0;
	}

	.tab
	{
		flex: 1 1 0;
		padding: .35rem 0;
		border: 1px solid currentColor;
		background: transparent;
		color: inherit;
		font: inherit;
		font-size: .65rem;
		font-weight: 1000;
		letter-spacing: .12rem;
		text-transform: uppercase;
		cursor: pointer;
		/* opacity: .45;e */
	}

	.tab:first-child
	{
		border-right: 0;
	}

	.tab.active
	{
		opacity: 1;
		background-color: var(--color-bg-second);
	}

	.tab:disabled
	{
		/* opacity: .15; */
		cursor: not-allowed;
	}

	.scenes
	{
		position: relative;
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		justify-content: center;
		gap: .6rem;
		width: 18.6rem;
		margin-inline: -3.8rem;
	}

	.scene
	{
		flex: 0 0 8.8rem;
		min-width: 0;
	}

	.scene-cap
	{
		margin-top: .35rem;
		font-size: .7rem;
		line-height: 1.25;
		opacity: .75;
		text-align: center;
	}
</style>
