<script setup>
import { useI18n } from 'vue-i18n';
import router from '../router/index';

const { t, tm, rt} = useI18n();
</script>

<template>
    <div class="flex flex-col p-6 z-2 bg-linear-to-t from-bg-default to-bg-darker w-7xl
                max-md:pt-20 max-md:gap-3 md:rounded-3xl md:gap-5">
        <div class="flex">
            <h2 class="text-text-default text-[18px] min-[375px]:text-[26px] md:text-4xl font-semibold w-full">{{ t('legal.service.title') }}</h2>
            <div class="text-text-second flex gap-2 self-baseline-last justify-self-end whitespace-nowrap max-md:text-[13px] md:text-[15px]">
                <h3><b>{{ t('legal.service.date.title') }}</b></h3>
                <p v-html="t('legal.service.date.desc')"></p>
            </div>
            <RouterLink to="" id="button" class="w-fit">
                <button type="button" class="md:ml-4 mr-2 text-2xl leading-none text-text-third hover:text-text-default" @click="router.back()">&times;</button>
            </RouterLink>
        </div>
        <hr class="w-full justify-self-start text-text-last">
        <div class="text-text-second max-md:text-sm md:text-[16px]">
            <h3><b>{{ t('legal.service.intro.title') }}</b></h3>
                <p class="whitespace-normal">{{ t('legal.service.intro.desc_one') }}<span class="font-semibold">{{ t('legal.service.title') }}</span>{{ t('legal.service.intro.desc_two') }}</p>
        </div>
        <ul class="text-text-second gap-8 list-decimal
                    max-md:columns-1 max-md:pl-3 max-md:text-[13px]
                    md:columns-2 md:pl-5 md:text-[15px]">
            <li v-for="(title, desc, index) in tm('legal.service.list')" class="break-inside-avoid max-md:mb-2 md:mb-4">
                <b>{{ rt(desc) }}</b>
                <p>{{ rt(title) }}</p>
                <div v-if="index == 1">
                    <ul class="flex flex-col list-disc pl-5 my-2">
                        <li v-for="line in tm('legal.service.behavior')">
                            {{ rt(line) }}
                        </li>
                    </ul>
                    <p>{{ t('legal.service.ban') }}</p>
                </div>
            </li>
        </ul>
    </div>
</template>

<style scoped>
</style>