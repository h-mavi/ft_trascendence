<script setup>
import KingSketch from '@/components/KingSketch.vue';
import IconCrown 	from '@/components/icons/IconCrown.vue';
import RegisterForm from '../components/RegisterForm.vue';
import { useI18n } 	from 'vue-i18n';

    const { t } = useI18n();
</script>

<template>
    <div class="flex z-2 bg-bg-darker max-md:overflow-x-hidden max-md:overflow-y-scroll md:rounded-3xl">
        <div class="p-3 bg-bg-default rounded-l-3xl border-r border-border-default max-lg:hidden">
            <KingSketch alt="" />
        </div>
        <div class="flex-col 
                    max-md:h-screen max-md:w-screen max-md:pt-15 max-md:px-5
                    md:w-lg md:p-10 md:-mt-6">
            <IconCrown fill="var(--color-main-color)" class="justify-self-center max-md:size-22 md:size-30"/>
            <h1 class="text-text-default justify-self-center text-[200%] md:mb-1">{{  t('login.welcome') }}</h1>
            <RegisterForm/>
            <div class="flex flex-row justify-self-center max-md:gap-2 max-md:m-2 md:gap-4 md:m-4">
                <span class="border-b border-border-default max-md:h-3.5 max-md:w-[36.5vw] md:h-4 md:w-40"></span>
                <p class="max-md:text-[70%] md:text-[80%] text-text-second mt-1">{{ t('common.or', 2) }}</p>
                <span class="border-b border-border-default max-md:h-3.5 max-md:w-[36.5vw] md:h-4 md:w-40"></span>
            </div>
            <div class="justify-self-center flex gap-2 mt-5 max-md:text-[70%] md:text-[80%] text-text-second">
				<p>{{ t('login.presentAcc') }}</p>
                <RouterLink to="/login">
                    <u><a class="text-main-color cursor-pointer hover:text-light-button active:text-active-button">{{ t('header.login') }}</a></u>
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