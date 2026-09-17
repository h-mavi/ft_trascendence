<script setup>
	import { useI18n }	from 'vue-i18n';
	import IconLogo		from './icons/IconLogo.vue';
	import router		from '@/router';

	const { t } = useI18n();
</script>

<template>
    <div class="flex flex-col z-2 bg-linear-to-t from-bg-default to-bg-darker rounded-3xl text-text-default text-center items-center px-10 pb-7 h-fit relative
		max-md:w-[90vw]
		md:w-[65vw] md:place-content-center
		lg:w-[50vw]">
		<RouterLink to="" id="button" class="w-fit absolute top-4 right-6">
            <button type="button" class="text-2xl leading-none text-text-third hover:text-text-default" @click="router.back()">&times;</button>
        </RouterLink>
		<h2 class="max-lg:text-3xl lg:text-5xl max-md:m-5 md:m-10">{{ t("allert.title") }}</h2>
		<p class="max-md:text-sm md:text-lg">{{ t("allert.desc_one") }}</p>
		<div class="max-md:text-2xl md:text-4xl my-2 flex items-center">
			<IconLogo class=" ml-3 place-self-center max-md:size-13 md:size-14 lg:size-15"/>
			<h1>{{ t("common.name") }}</h1>
		</div>
		<p class="max-md:text-sm md:text-lg">{{ t("allert.desc_two") }}</p>
		<br>
		<p class="max-md:text-sm md:text-lg max-md:mt-1 md:mt-5">{{ t("allert.desc_three") }}</p>
		<p class="max-md:text-sm md:text-lg">(ctrl +/-)</p>
	</div>
</template>

<style scoped>
</style>