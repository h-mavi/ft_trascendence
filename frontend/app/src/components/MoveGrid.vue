<script setup>
	//@ts-nocheck
	import { computed }						from 'vue';
	import { gridCells, arrowSegments }		from '@/scripts/Helper/codexGrid.js';

	const props = defineProps({
		scene:		 { type: Object, default: null },		//CodexPattern, null = griglia vuota
		variant:	 { type: String, default: 'regular' },	//'regular' | 'boosted', stessi colori della board
		resolveIcon: { type: Function, default: () => '' },	//(actor) => src, la risolve il padre
	});

	//id univoco del marker SVG: due griglie sulla stessa pagina non devono condividerlo
	const uid		= `arrow-${Math.random().toString(36).slice(2, 8)}`;
	const cells		= computed(() => gridCells(props.scene));
	const arrows	= computed(() => arrowSegments(props.scene));
</script>

<template>
	<div class="move-grid" :class="variant">
		<div v-for="cell in cells" :key="cell.key" class="cell" :class="{ dark: cell.dark }">
			<span v-if="cell.mark" class="mark" :class="[cell.mark, { 'on-piece': !!cell.actor }]"/>
			<img v-if="cell.actor" :src="resolveIcon(cell.actor)" alt="" :draggable="false" class="cell-piece" :class="{ ghost: cell.actor.ghost }">
		</div>

		<svg v-if="arrows.length" class="arrows" viewBox="0 0 100 100">
			<defs>
				<marker :id="uid" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto">
					<path d="M0,0 L4,2 L0,4 Z" fill="var(--mark-color)"/>
				</marker>
			</defs>
			<polyline v-for="(pts, i) in arrows" :key="i"
					:points="pts" fill="none"
					stroke="var(--mark-color)" stroke-width="2.5"
					stroke-linecap="round" stroke-linejoin="round"
					:marker-end="`url(#${uid})`"/>
		</svg>
	</div>
</template>

<style scoped>
	.move-grid
	{
		position: relative;
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		width: 100%;
		aspect-ratio: 1;
		border: 1px solid color-mix(in srgb, var(--color-bg-square) 55%, transparent);
		--felt: color-mix(in srgb, var(--color-bg-square) 75%, var(--color-text-default));	/* sfondo della griglia */
		--ink: color-mix(in srgb, var(--color-bg-WSquare) 80%, var(--color-bg-square));	/* Velo sopra la scacchiera, ti permette di scurirla o schiarirla */
		--mark-color: var(--color-bg-highlight);			/* stesso colore di .highlight sulla board */
		background-color: var(--felt);
	}

	.move-grid.boosted
	{
		--mark-color: #00ffff;
	}

	.cell
	{
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		aspect-ratio: 1;
	}

	.cell.dark
	{
		background-color: var(--ink);
	}

	.cell-piece
	{
		position: relative;
		z-index: 1;
		width: 88%;
		height: 88%;
		object-fit: contain;
	}

	/* la casella da cui il pezzo e' partito: si vede, ma non e' piu' li' */
	.cell-piece.ghost
	{
		opacity: .28;
	}

	.mark
	{
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		display: block;
		width: 15%;
		aspect-ratio: 1;
		border-radius: 50%;
		background-color: var(--mark-color);
	}

	/* convenzione scacchistica: cerchio vuoto = ci arrivo solo mangiando */
	.mark.capture
	{
		width: 62%;
		background-color: transparent;
		border: .18rem solid var(--mark-color);
	}

	/* sopra un pezzo avversario il cerchio lo circonda invece di finirci sotto */
	.mark.capture.on-piece
	{
		width: 94%;
		border-width: .14rem;
	}

	.arrows
	{
		position: absolute;
		inset: 0;
		z-index: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
	}
</style>
