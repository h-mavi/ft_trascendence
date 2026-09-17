<script setup>
//@ts-nocheck
	import { DOMBoard, localInfo, IMG_PATHS, 
			 HIDDEN, myPlayer, canAfford, localBoard, 
			 isAbilityArmed, pieceSrc}					from '@/scripts/Data/Variables';
	import { onMounted, onUnmounted, computed, ref }	from 'vue';
	import { useClickOutside }							from '@/scripts/Helper/generalUtils.js';
	import { onDragStart, onDrop }						from '@/scripts/Events/Movements';
	import { getSquareColor } 							from '@/scripts/Helper/RenderUtils';
	import { globalEvents }								from '@/scripts/Events/Global';
	import IconChevronSolid 							from './icons/IconChevronSolid.vue';
	import { shopAbility, showBoostedMovesHover,
			 showBoostedMovesLeave, 
			 selectAbilitySquare, upgradeBastard }		from '@/scripts/Events/utils/GlobalUtils.js';
	import IconDoubleChevron 							from './icons/IconDoubleChevron.vue';
	import AuraFx 										from './AuraFx.vue';

	const prop = defineProps({
  	    	style: String
	    });
    let stopGlobalEvents = null;

    onMounted(() => {
        stopGlobalEvents = globalEvents();
    });

    onUnmounted(() => {
        stopGlobalEvents?.();
    });

	const dragOver 				= ref(null);
	const domBoardComputed		= computed(() => DOMBoard());
	const orientation			= computed(() => localInfo.myTeam === "white" ? "white" : "black");
	const bottomRank			= computed(() => orientation.value === "white" ? 1 : 8);
	const leftFile				= computed(() => orientation.value === "white" ? 'a' : 'h');
	const localPlayer			= computed(() => myPlayer());
	const myTurn				= computed(() => localPlayer.value?.isPlaying === true);
	const boostPopup			= ref(null);
	const dragging				= (square) => localInfo.drag?.hideSource && localInfo.drag.from === square?.id;
	const promoTeam				= computed(() => localBoard.get(localInfo.goatId)?.piece?.team ?? localInfo.myTeam);
	const canBoostSquare		= (square) => !!square?.piece && square.piece.team === localInfo.myTeam
												&& !square.piece.isBoostedBool && myTurn.value
												&& localInfo.secondTurn && !localInfo.goatId
												&& canAfford(square?.piece) && square?.piece.type !== 'King';
	const canUseAbilitySquare	= (square) => !!square?.piece && square.piece.team === localInfo.myTeam
												&& square.piece.isBoostedBool && myTurn.value
												&& !localInfo.secondTurn && !localInfo.goatId; 

	function popupBoost(squareId)
	{
		if (!squareId)
			return;
		if (boostPopup.value === squareId)
		{
			boostPopup.value = null;
			shopAbility(squareId);
			return;
		}
		boostPopup.value = squareId;
		showBoostedMovesLeave();
		showBoostedMovesHover(squareId);
	}

	function closeBoostPopup()
	{
		if (!boostPopup.value)
			return;
		boostPopup.value = null;
		showBoostedMovesLeave();
	}

	useClickOutside('.boostBadge', closeBoostPopup, { when: boostPopup, escape: true });

</script>

<template>
    <div id="root">
		<div v-if="localInfo.goatId" id="overlay" v-bind:class="{ 'opacity-60 pointer-events-auto':localInfo.goatId }"></div>
		<Teleport to="body">
			<div v-if="localInfo.drag" class="floatingPiece"
					:style="{width: localInfo.drag.size + 'px',
							 height: localInfo.drag.size + 'px',
							 left: localInfo.drag.x + 'px',
							 top: localInfo.drag.y + 'px'}">
				<AuraFx v-if="localInfo.drag.armed" class="pieceAura" 
							:speed=".5" :variant="'yellow'" style="--aura-size: 1.6"/>
				<AuraFx v-else-if="localInfo.drag.boosted" class="pieceAura"
							:speed=".4" :variant="'blue'"/>
				<img class="piece" :src="localInfo.drag.src"/>
			</div>
		</Teleport>
		<div id="board" oncontextmenu="return false;" :class="{ 'boardTwo' : style === '1v1', 'boardFour' : style === '14x14x4'}">
				<div v-for="row in domBoardComputed" :key="row[0]?.id" class="grid" :class="{ 'rowTwo' : style === '1v1', 'rowFour' : style === '14x14x4'}">
					<div
						v-for="square in row"
						:key="square?.id"
						:id="square?.id"
						:class="[getSquareColor(square?.id),
								'square',
								{ 'w-18.75 h-18.75' : style === '1v1', 'w-13 h-13' : style === '14x14x4'},
								{ 'opacity-0 hidden': style === '14x14x4' && HIDDEN.has(square?.id) },
								{'outline-4 outline-[#e2dac5c5] -outline-offset-4': dragOver === square?.id},
								{'hasAura': square?.piece?.isBoostedBool},
								{'selectedBstW': getSquareColor(square?.id) == 'white' && (square.boostedHighlight && square.piece)},
								{'selectedBstB': getSquareColor(square?.id) == 'black' && (square.boostedHighlight && square.piece)},
								{'dangerW': getSquareColor(square?.id) == 'white' && (square.inCheck && !square.highlight && square?.piece.type == 'King' && !square.selected)},
								{'dangerB': getSquareColor(square?.id) == 'black' && (square.inCheck && !square.highlight && square?.piece.type == 'King' && !square.selected)},
								{'selectedW': getSquareColor(square?.id) == 'white' && (square.selected !== square.inCheck || square.highlight && square.piece)},
								{'selectedB': getSquareColor(square?.id) == 'black' && (square.selected !== square.inCheck || square.highlight && square.piece)},
								{'pieceClicked': square.piece && square.piece.team === localInfo.myTeam && square.clicked}]"
						@drop="onDrop($event, square); dragOver = null"
						@dragover.prevent="dragOver = square?.id;"
						@dragenter.prevent>
						<p	class="absolute"
							v-if="(parseInt(square.id.substring(1)) === bottomRank) || 
								(style === '14x14x4' && parseInt(square.id.substring(1)) === 4 &&
								['a', 'b', 'c', 'l', 'm', 'n'].includes(square.id.charAt(0)))"
							:class="{	'ml-15 mt-13' : style === '1v1',
										'ml-10.25 mt-9 text-xs' : style === '14x14x4',
										'text-bg-square': getSquareColor(square.id) == 'white' && square.selected === square.inCheck,
										'text-text-default	': getSquareColor(square.id) == 'black' && square.selected === square.inCheck,
										'text-bg-BSelect' : getSquareColor(square.id) == 'white' && square.selected !== square.inCheck,
										'text-bg-WSelect' : getSquareColor(square.id) == 'black' && square.selected !== square.inCheck }">
							<b>{{ square.id.charAt(0) }}</b>
						</p>
						<AuraFx v-if="isAbilityArmed(square) && !(dragging(square))"
									class="pieceAura" :speed=".5" :variant="'yellow'"
									style="--aura-size: 1.6"/>
						<AuraFx v-else-if="square.piece?.isBoostedBool && !dragging(square)"
								class="pieceAura" :speed=".4" :variant="'blue'"/>
						<img
							v-if="square?.piece"
							class="piece"
							v-bind:class="{ 'boosted-aura':square.piece.isBoostedBool, 'invisible': dragging(square) }"
							:src="pieceSrc(square.piece)"
							:draggable="true"
							@dragstart="onDragStart($event, square)"/>
						<p 	class="absolute" 
							v-if="(square?.id.charAt(0) == leftFile) ||
								(style === '14x14x4' && square?.id.charAt(0) == 'd' && 
								(parseInt(square?.id.substring(1)) < 4 || parseInt(square?.id.substring(1)) > 11))"
							v-bind:class="{ 'mr-15 mb-13' : style === '1v1',
											'mr-10.25 mb-9.5 text-xs' : style === '14x14x4',
											'ml-1.5' : parseInt(square.id.substring(1)) > 9,
											'text-bg-square':getSquareColor(square.id) == 'white' && square.selected === square.inCheck,
											'text-text-default':getSquareColor(square.id) == 'black' && square.selected === square.inCheck,
											'text-bg-BSelect' : getSquareColor(square.id) == 'white' && square.selected !== square.inCheck,
											'text-bg-WSelect' : getSquareColor(square.id) == 'black' && square.selected !== square.inCheck }">
							<b>{{square.id.substring(1)}}</b>
						</p>
						<span v-if="square?.highlight && !square?.piece" class="highlight"
								v-bind:class="{'w-3.75 h-3.75': style === '1v1', 'w-2.5 h-2.5': style === '14x14x4'}"></span>
						<span v-if="square?.boostedHighlight && !square?.piece" class="boostedHighlight"
								v-bind:class="{'w-3.75 h-3.75': style === '1v1', 'w-2.5 h-2.5': style === '14x14x4'}"></span>
						<span v-if="localInfo.lastMovesSquares.has(square?.id) && !square?.selected && !square?.inCheck"
								class="lastMoveOverlay"
								:class="getSquareColor(square.id) == 'white' ? 'Owhite' : 'Oblack'"/>
						<button v-if="canBoostSquare(square)" type="button" class="boostBadge"
									:class="{	'is-morphing': boostPopup === square?.id,
												'mini': style === '14x14x4'	 }"
									@click.stop="popupBoost(square?.id)"
									@mousedown.stop>
								<IconChevronSolid class="boostBadgeIcon chevronUp"
									:outline="boostPopup === square?.id ? '#ffe100' : '#f97316'"
									:from="boostPopup === square?.id ? '#fb923c' : '#ffe100'"
    								:to="boostPopup === square?.id ? '#ea580c' : '#ffc400'"/>
						</button>
						<button v-if="canUseAbilitySquare(square)" type="button" class="boostBadge abilityBadge"
									:class="{	'is-morphing': square?.useAbilityBool,
												'mini': style === '14x14x4'	 }"
									@click.stop="selectAbilitySquare(square?.id)"
									@mousedown.stop>
								<IconDoubleChevron class="boostBadgeIcon chevronUp"
									:outline="square?.useAbilityBool ? '#ffe100' : '#f97316'"
									:from="square?.useAbilityBool ? '#fb923c' : '#ffe100'"
									:to="square?.useAbilityBool ? '#ea580c' : '#ffc400'"/>
						</button>

					</div>
				</div>
			</div>

			<div v-if="localInfo.goatId" id="choseMenu" class="flex absolute pointer-events-none size-75 z-14 gap-0.5 p-1.5 
					border-2 border-bg-error rounded-md bg-[#fafafa] max-h-[10%]">
				<button v-for="type in ['Champion', 'Jester', 'Minotaurus', 'Valkirya']" :key="type"
						@click="upgradeBastard(type)" class="rounded-md p-1 hover:bg-bg-highlight">
					<img :src="IMG_PATHS[promoTeam + type]" :alt="type" :draggable="false">
				</button>
			</div>
    </div>
</template>


<style scoped>

	div#overlay
	{
		opacity: 0.4;
		background: rgba(0, 0, 0, 0.35);
		inset: 0;
		position: fixed;
		z-index: 14;
		pointer-events: auto;
		transition: opacity 0.2s ease;
	}

	#shop {
		position: absolute;
		display: flex;
		flex-flow: column;
		align-items: center;
		margin-left: 5px;
		z-index: 13;
		top: 50%;
	    left: calc(50% + 300px + 16px);
	    transform: translateY(-50%);
	}

	#board
	{
		display: grid;
		width: fit-content;
		margin: auto;
		--piece-clicked-bg: color-mix(in srgb, var(--color-bg-BSelect) 45%, transparent);
	}

	.boardTwo {
		grid-template-rows: repeat(8, 75px);
	}

	.boardFour {
		grid-template-rows: repeat(14, 52px);
	}

	.pieceAura
	{
		--aura-size: 1.4;
		--aura-lift: -20%;

		position: absolute;
		left: 50%;
		bottom: var(--aura-lift);
		width: calc(100% * var(--aura-size));
		height: auto;
		transform: translateX(-50%);
		z-index: 0;
		max-width: none;
	}

	.piece
	{
		position: relative;
		z-index: 1;
		width: 100%;
		cursor: -webkit-grab;
		user-select: none;
	}

	.piece.dragging {
		cursor: -webkit-grabbing;
	}

	.rowTwo {
		grid-template-columns: repeat(8, 75px);
	}

	.rowFour {
		grid-template-columns: repeat(14, 52px);
	}

	.square
	{
		border-collapse: collapse;
		display: flex;
		align-items: center;
		justify-content: center;
		user-select: none;
		position: relative;
		z-index: 0;
	}

	.square:has(.pieceAura)
	{
		z-index: 2;
	}

	.hasAura
	{
		z-index: 2;
	}

	.lastMoveOverlay {
		position: absolute;
		inset: 0;
		z-index: -1;
		pointer-events: none;
	}

	.lastMoveOverlay.Owhite {
		background-color: rgba(50, 50, 50, 0.5);
	}

	.lastMoveOverlay.Oblack {
		background-color: rgba(100, 100, 100, 0.8);
	}
	
	.white{
		background-color: var(--color-bg-WSquare);
	}

	.black{
		background-color: var(--color-bg-square);
	}

	.pieceClicked {
		background-color: var(--piece-clicked-bg);
	}

	.highlight
	{
		display: block;
		margin: auto;
		border-radius: 50%;
		background-color: var(--color-bg-highlight);
	}

	.boostedHighlight
	{
		display: block;
		margin: auto;
		border-radius: 50%;
		background-color: #00ffff; /* #01a76f */
	}

	.selectedB { background-color: var(--color-bg-BSelect); }

	.selectedW { background-color: var(--color-bg-WSelect);	}

	.dangerB { background-color: #801a12; }

	.dangerW { background-color: #bb4232; }

	.selectedBstB { background-color: #2589a1; }

	.selectedBstW { background-color: #78cccc; }

	/* .boosted-aura{
		animation: auraPulse 0.4s ease-in-out infinite;
	}
	
	@keyframes auraPulse
	{
		0%, 100%
		{
			filter:
				drop-shadow(0 0 2px #FFD700)
				drop-shadow(0 0 6px #FFA500)
				drop-shadow(0 0 12px #FF8C00);
		}
		50%
    	{
    	    filter:
    	        drop-shadow(0 0 4px #FFD700)
    	        drop-shadow(0 0 10px #FFA500)
    	        drop-shadow(0 0 20px #FF4500)
    	}
	} */

	.boostBadge
	{
		--badge-dim: 1.15rem;

		position: absolute;
		top: 2px;
		right: 2px;
		z-index: 5;
		display: flex;
		align-items: center;
		width: var(--badge-dim);
		height: var(--badge-dim);
		padding: 0;
		opacity: 0;
		cursor: pointer;
		pointer-events: none;
		transition: opacity .15s ease, transform .15s ease;
		rotate: -90deg;
	}

	.boostBadge.mini
	{
		--mini-dim: .9rem;

		width: var(--mini-dim);
		height: var(--mini-dim);
	}

	.square:hover > .boostBadge,
	.boostBadge:focus-visible
	{
		opacity: 1;
		pointer-events: auto;
	}

	.boostBadge:hover{
		transform: scale(1.5);
	}

	.boostBadge.is-morphing
	{
		opacity: 1;
		pointer-events: auto;
		transform: scale(1.35);
		filter: drop-shadow(0 0 2px rgb(255, 225, 0)) drop-shadow(0 0 6px rgb(249, 115, 22));
	}

	.boostBadge.is-morphing:hover{
		transform: scale(1.6);
	}

	.boostBadgeIcon{
		font-size: 1.5rem;
	}

	.floatingPiece
	{
		display: flex;
		align-items: center;
		justify-content: center;
		position: fixed;
		z-index: 13;
		pointer-events: none;
		transform: translate(-50%, -50%);
	}
</style>