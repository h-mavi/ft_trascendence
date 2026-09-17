<script setup>
	import BackGround from './components/BackGround.vue';
	import AppHeader from './components/AppHeader.vue';
	import LinkFooter from './components/LinkFooter.vue';
	import { useAuthStore } from './stores/auth.st.js';
	import { storeToRefs }	from 'pinia';
	import { useRoute } from 'vue-router'
	import { watch } from 'vue'

	const	route = useRoute();

	function useTheme() {
		const authStore = useAuthStore();
		const { user } = storeToRefs(authStore);
 		watch( () => user.value?.preferences?.name, (newTheme) => {
				document.documentElement.setAttribute('data-theme', newTheme ?? 'default');
				localStorage.setItem('data-theme', newTheme ?? 'default');
			},
			{ immediate: true }
		);
	}

	useTheme();
</script>

<template>
	<BackGround/>
	<div class="min-h-screen flex flex-col overflow-hidden">
		<AppHeader/>
		<div class="grow wrap" :class="{ 'other' : route.name !== 'home', 'home lg:grid lg:justify-between max-lg:justify-center max-lg:flex' : route.name === 'home' }">
			<router-view/>
		</div>
	</div>
	<LinkFooter class="z-11 justify-self-center"/>
</template>

<style scoped>
	.wrap{
		position: relative;
		align-items: center;
		z-index: 10;
		font-size: 110%;
		font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
		user-select: none;
	}

	.home {
		grid-template-columns: 1fr 1fr;
	}

	.other {
		display: flex;
		justify-content: center;
		margin-top: -10px;
	}
</style>