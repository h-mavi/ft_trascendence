<script setup>
    const prop = defineProps({
  		title: String
	});
</script>

<template>
    <span v-if="['Paesant','Bastards','Valkirya','Minotaurus', 'Jester', 'Champion', 'King', 'Emperor'].includes(title.valueOf())"
        class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium inset-ring"
        v-bind:class="{ 'bg-gray-50 text-gray-600 inset-ring-gray-500/10' : title.valueOf() === 'Paesant',
                        'bg-yellow-50 text-yellow-800 inset-ring-yellow-600/20' : title.valueOf() === 'Bastards',
                        'bg-green-50 text-green-700 inset-ring-green-600/20' : title.valueOf() === 'Valkirya',
                        'bg-blue-50 text-blue-700 inset-ring-blue-700/10' : title.valueOf() === 'Minotaurus',
                        'bg-indigo-50 text-indigo-700 inset-ring-indigo-700/10' : title.valueOf() === 'Jester',
                        'bg-purple-50 text-purple-700 inset-ring-purple-700/10' : title.valueOf() === 'Champion',
                        'bg-pink-50 text-pink-700 inset-ring-pink-700/10' : title.valueOf() === 'King',
                        'bg-red-50 text-red-700 inset-ring-red-600/10' : title.valueOf() === 'Emperor' }">
        {{ title.valueOf() }}
    </span>
</template>

<style scoped>
</style>