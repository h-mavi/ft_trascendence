<script setup>
import { useI18n } from 'vue-i18n';
import router from '../router/index';

const { t, tm, rt} = useI18n();
</script>

<template>
    <div class="flex flex-col p-6 z-2 bg-linear-to-t from-bg-default to-bg-darker w-3xl gap-4
                max-md:pt-20 max-md:h-screen max-md:overflow-y-scroll md:rounded-3xl">
        <div class="flex w-full justify-between">
            <h2 class="text-text-default max-md:text-3xl md:text-4xl font-semibold">{{ t('legal.privacy.title') }}</h2>
            <RouterLink to="" id="button" class="w-fit">
                <button type="button" class="mr-2 text-2xl leading-none text-text-third hover:text-text-default" @click="router.back()">&times;</button>
            </RouterLink>
        </div>
        <hr class="w-full justify-self-start text-text-last">
        <p class="text-text-second max-md:text-sm md:text-[16px]">{{ t('legal.privacy.desc') }}</p>
        <ul class="text-text-second flex flex-col gap-2 list-disc pl-5 max-md:text-[13px] md:text-[15px]">
            <li v-for="line in tm('legal.privacy.list')">
                {{ rt(line) }}
            </li>
        </ul>
    </div>
</template>

<style scoped>
</style>