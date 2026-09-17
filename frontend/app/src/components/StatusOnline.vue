<script setup>
    import { useSockStore } from '../stores/sock.st';

    const sockStore = useSockStore(),
          prop = defineProps({
  	    	user_id: Number
	    });
</script>

<template>
    <span class="rounded-full absolute size-3 ml-9.5 mt-9.5"
            :class="sockStore.isUserOnline(prop.user_id) ? 'bg-online-accept' : 'bg-text-lose-closed'"></span>
</template>

<style scoped>
</style>