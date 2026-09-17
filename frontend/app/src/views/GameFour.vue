<script setup>
    import GameAllert from '../components/GameAllert.vue';
	import ChessBoard from '@/components/ChessBoard.vue';
	import { initLocalMatchState }  from '../scripts/Data/Archi';
	import { onMounted, ref }       from 'vue';
    import { debug }                   from '../scripts/Data/Variables.js';
import IconCrown from '@/components/icons/IconCrown.vue';

	const ready = ref(false);
	const style = ref("14x14x4");

	onMounted(async () => {
	  try{
	    await initLocalMatchState();
	    ready.value = true;
	  } catch (err) { debug("[mounted di GameFour]: Errore nel mounting!\n" + err) }
	})
</script>

<template>
    <GameAllert class="[@media(min-width:1520px)_and_(min-height:900px)]:hidden"/>

    <div class="max-[1520px]:hidden [@media(max-height:900px)]:hidden
                flex z-2 bg-bg-darker rounded-3xl">
        <div class="p-6 bg-bg-default rounded-l-3xl border-r border-border-default">
            <ChessBoard :style="style"/>
        </div>
        <div class="p-10 flex-col mt-20 w-lg">
            <IconCrown fill="var(--color-main-color)" class="w-30 justify-self-center"/>
            <h1 class="text-[200%] mb-1 text-white justify-self-center">Ben tornato</h1>
            <h4 class="text-[100%] mb-8 text-text-second justify-self-center">Accedi al tuo account</h4>
            
            <div class="m-5 flex flex-row justify-self-center gap-4">
                <span class="border-b border-border-default h-4 w-40"></span>
                <p class="text-[80%] text-text-second mt-1">oppure</p>
                <span class="border-b border-border-default h-4 w-40"></span>
            </div>
            <div class="justify-self-center">
                <RouterLink to="/register">
                    <u><a class="text-[80%] text-main-color cursor-pointer hover:text-light-button active:text-active-button">Registrati</a></u>
                </RouterLink>
            </div>
        </div>
    </div>
</template>

<style scoped>
    h1, h4 {
        font-family: "Copperplate", Times;
    }
</style>