<script setup>
    import IconRanking	from './icons/IconRanking.vue';
    import IconTrophy	from './icons/IconTrophy.vue';
    import IconGlobe	from './icons/IconGlobe.vue';
    import IconRobot	from './icons/IconRobot.vue';
    import IconBook		from './icons/IconBook.vue';
    import { useI18n }  from 'vue-i18n';
    import { ref } 		from 'vue';

    const   { t } = useI18n(),
            debug = ref(true);
</script>

<template>
    <span class="max-md:hidden"></span>
    <div class="flex flex-col gap-4 w-full 
                max-md:text-[29px] max-md:max-w-xs max-lg:items-center
                md:text-5xl md:max-w-xl
                lg:text-4xl lg:max-w-md lg:justify-self-end lg:translate-x-5">
        <div class="bg-bg-default text-text-default transition-all
                max-md:p-4 max-lg:rounded-xl
                md:p-7
                lg:p-5 lg:rounded-l-xl hover:lg:-translate-x-5">
            <RouterLink :to="{ name: 'playpage' }" class="flex items-center gap-4">
                <IconGlobe class="size-10"/>
                <b><h2>{{ t('menu.online') }}</h2></b>
            </RouterLink>
        </div>
        <div class="bg-bg-default text-text-default transition-all
                max-md:p-4 max-lg:rounded-xl
                md:p-7
                lg:p-5 lg:rounded-l-xl hover:lg:-translate-x-5">
            <RouterLink :to="{ name: 'playpage', query: { ai: '1' } }" class="flex items-center gap-4">
				<IconRobot class="size-10"/>
                <b><h2>{{ t('menu.bot') }}</h2></b>
            </RouterLink>
        </div>
        <div class="bg-bg-default text-text-default transition-all
                max-md:p-4 max-lg:rounded-xl
                md:p-7
                lg:p-5 lg:rounded-l-xl hover:lg:-translate-x-5">
            <RouterLink to="/leaderboard" class="flex items-center gap-4">
				<IconRanking class="size-10"/>
                <b><h2>{{ t('menu.lBoard') }}</h2></b>
            </RouterLink>
        </div>

        <div class="transition-all
                max-lg:rounded-xl max-md:p-4 md:p-7 lg:p-5
                lg:rounded-l-xl hover:lg:-translate-x-5"
                :class="debug ? 'relative text-[#bbbbbb] pointer-events-none bg-[#3a3a3a] max-md:text-[27px] md:text-4xl lg:text-3xl lg:translate-x-6' : 
                                'text-text-default pointer-events-auto bg-bg-default '">
            <RouterLink to="/tournaments" class="flex items-center gap-4">
                <IconTrophy class="size-10"/>
                <b><h2>{{ t('common.tournament', 2) }}</h2></b>
            </RouterLink>
        </div>

        <div class="bg-bg-default text-text-default transition-all
                max-md:p-4 max-lg:rounded-xl
                md:p-7
                lg:p-5 lg:rounded-l-xl hover:lg:-translate-x-5">
            <RouterLink to="/codex" class="flex items-center gap-4">
                <IconBook class="size-10"/>
                <b><h2>{{ t('menu.codex') }}</h2></b>
            </RouterLink>
        </div>
    </div>
</template>

<style scoped>
</style>