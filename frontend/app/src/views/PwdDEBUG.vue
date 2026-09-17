<script setup>
	import router	from '../router/index.js';
	import { api }	from '../router/api/client'
	import { ref }	from 'vue';
	import IconEye                 from '@/components/icons/IconEye.vue';
	import IconLock                from '@/components/icons/IconLock.vue';
	import IconUser                from '@/components/icons/IconUser.vue';

	const   formData = ref({
				  username: '',
				  password: ''
				}),
			visible = ref(false),
			error = ref(false);

	async function submitForm() {
		try{
			const resp = await api.patch("/api/users/updatePassword", formData.value);
			if (!resp)	{ router.push('/'); }
			else		{ error.value = true; }
		}
		catch { error.value = true; }
	}

	function show() { visible.value = !visible.value; }
</script>

<template>
	<div class="flex flex-col z-2 bg-bg-darker rounded-3xl w-[70vh] h-[65vh]">
		<div class="flex flex-col mt-15">
			<h2 class="text-text-default text-3xl self-center mb-1">Cambia password</h2>
			<h2 class="text-main-color text-3xl self-center">[DEBUG]</h2>
			<div class="text-sm my-4 items-center self-center justify-self-center text-text-default flex flex-col">
				<p>Questa pagina è ad uso esclusivo del team di sviluppo per</p>
				<p>facilitare la fase di debug di questo progetto.</p>
				<p>Se vedi questa pagina a lavoro completo</p>
				<p>vuol dire che qualcuno qui se n'è dimenticato...</p>
			</div>
		</div>
		<form @submit.prevent="submitForm" method="post" enctype="application/json" class="text-text-default self-center flex flex-col mt-7">
			<div class="form border-border-default text-form-icon flex w-sm m-4 mb-2" :class="{ 'animate-shake': error }" @animationend="error = false">
				<IconUser class="size-6"/>
				<input placeholder="Nome utente" size="35" class="pl-2 text-base" autofocus="true" type="text" v-model="formData.username">
			</div>
			<div class="form border-border-default text-form-icon flex w-sm m-4 mb-2" :class="{ 'animate-shake': error }" @animationend="error = false">
				<IconLock class="size-6"/>
				<input placeholder="Nuova password" size="31" class="pl-2 text-base" v-model="formData.password"
						:type="visible ? 'text' : 'password'">
				<button type="button" @click="show()" class="ml-3">
					<IconEye class="size-6" :slashed="visible"/>
				</button>
			</div>
			<div class="text-xs mx-5 self-center justify-self-center text-main-color" 
				:class="{ 'transition-colors duration-200 text-active-button': error, 'transition-colors duration-200 text-main-color': !error, }" 
				@animationend="error = false">
				<p>Ricorda, la password deve avere almeno 8 caratteri, un numero,</p>
				<p> una maiuscola, una minuscola e un carattere speciale ($,%,#...)</p>
			</div>
			<input id="submit" class="cursor-pointer justify-self-center w-sm p-3 text-base self-center mt-6
							bg-main-color rounded-[7px] text-text-default hover:bg-linear-to-t from-main-color to-light-button"
					v-bind:class="{'pointer-events-none grayscale': !formData.password || !formData.username,
						'pointer-events-auto grayscale-0 ': formData.password && formData.username}"
					type="submit" value="Salva le modifiche">
		</form>
	</div>
</template>

<style scoped>
	div.form {
		padding: 15px;
		border-width: 1px;
		border-radius: 7px;
		justify-self: center;
	}

	div.form:focus-within {
		border-color: #f1e8e870;
	}

	div.form:hover {
		border-color: #f1e8e870;
		transition: border 0.25s ease-in-out;
	}

	input:focus {
		outline: 0;
	}

	#submit {
		transition: filter 0.2s ease-in-out;
	}
</style>