<script setup>
    import { localInfo, IMG_PATHS } from '../scripts/Data/Variables';
    
    const prop = defineProps({
  	    	player: Object
	    });
    const capt = localInfo.capturedP[prop.player.team];
</script>

<template>
    <div class="flex self-center">
        <img v-if="capt.Champion !== 0" v-for="n in capt.Champion" class="relative size-6" :draggable="false"
            :src="IMG_PATHS[(player.team === 'white' ? 'black' : 'white') + 'Champion']" alt="Captured Champion">
        <img v-if="capt.Minotaurus !== 0" v-for="n in capt.Minotaurus" class="relative size-6" v-bind:class="{'-ml-4.5' : n !== 1}" :draggable="false"
            :src="IMG_PATHS[(player.team === 'white' ? 'black' : 'white') + 'Minotaurus']" alt="Captured Minotaurus">
        <img v-if="capt.Jester !== 0" v-for="n in capt.Jester" class="relative size-6" v-bind:class="{'-ml-4.5' : n !== 1}" :draggable="false"
            :src="IMG_PATHS[(player.team === 'white' ? 'black' : 'white') + 'Jester']" alt="Captured Jester">
        <img v-if="capt.Valkirya !== 0" v-for="n in capt.Valkirya" class="relative size-6" v-bind:class="{'-ml-4.5' : n !== 1}" :draggable="false"
            :src="IMG_PATHS[(player.team === 'white' ? 'black' : 'white') + 'Valkirya']" alt="Captured Valkirya">
        <img v-if="capt.Bastards !== 0" v-for="n in capt.Bastards" class="relative size-6" v-bind:class="{'-ml-4.5' : n !== 1}" :draggable="false"
            :src="IMG_PATHS[(player.team === 'white' ? 'black' : 'white') + 'Bastards']" alt="Captured Bastard">
    </div>
</template>

<style scoped>
</style>