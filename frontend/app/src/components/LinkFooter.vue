<script setup>
import { useI18n }	from 'vue-i18n';

const   { t } = useI18n();
</script>

<template>
	<footer>
		<RouterLink to="/privacy" class="cursor-pointer">
			{{ t('legal.privacy.title') }}
		</RouterLink> |
		<RouterLink to="/terms" class="cursor-pointer">
			{{ t('legal.service.title') }}
		</RouterLink>
	</footer>
</template>

<style scoped>
	footer
	{
		position: fixed;
		bottom: 0;
		font-style: oblique;
		color:#CCD6D9;
        align-self: center;
		padding-bottom: 5px;
        font-size: small;
	}
</style>