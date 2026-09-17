<script setup>
    import UserAvatar from '@/components/UserAvatar.vue';
    import { useAuthStore }						from "../stores/auth.st";
    import { storeToRefs }						from 'pinia';
	import { useI18n }							from 'vue-i18n';
    import { ref }								from 'vue';
	import router								from '../router/index.js';
	import IconEye                 from '@/components/icons/IconEye.vue';
	import IconLock                from '@/components/icons/IconLock.vue';
	
    const	{ t } = useI18n(),
    	   formData = ref({
	              password: ''
	            }),
            authStore = useAuthStore(),
            { user } = storeToRefs(authStore),
            visible = ref(false),
			error = ref(false);

    async function submitForm() {
		const resp = await authStore.changePwd(formData.value);
		if (!resp)	{ router.push('/me'); }
		else		{ error.value = true; }
	}

	function show() { visible.value = !visible.value; }
</script>

<template>
    <div class="flex flex-col z-2 bg-bg-darker rounded-3xl
		max-md:w-screen max-md:h-screen max-md:pt-11
		md:w-[70vw] md:h-[60vh]	md:min-h-160 md:place-content-center
		lg:w-[30vw] lg:h-[70vh] lg:min-w-110">
        <h2 class="text-text-default self-center m-9 max-md:text-2xl md:text-3xl">
			{{ t('userPage.edit.changePwd') }}</h2>
        <div class="flex flex-col justify-center w-fit px-8 py-5 mb-4 mx-auto bg-bg-default rounded-3xl border border-border-default">
            <UserAvatar :src="user.image"
                    alt="" class="rounded-full m-5 mx-auto object-cover max-md:size-30  md:size-35 " />
            <h3 class="text-text-default self-center max-md:text-xl md:text-2xl">{{ user.username }}</h3>
            <h4 class="text-text-second self-center max-md:text-sm md:text-base">{{ user.name }} {{ user.surname }}</h4>
            <h5 class="text-text-third self-center max-md:text-xs md:text-sm">{{ user.email }}</h5>
        </div>
        <form @submit.prevent="submitForm" method="post" enctype="application/json" class="text-text-default self-center flex flex-col">
	    	<div :class="{ 'animate-shake': error }" @animationend="error = false" class="form self-center border-border-default text-form-icon flex m-4 mb-0
					max-md:w-[80vw] max-md:max-w-110
					md:w-[50vw]
					lg:w-[22vw] lg:min-w-100">
	    		<IconLock class="max-md:size-5 md:size-6"/>
	    		<input :placeholder="t('userPage.edit.newPwd')"  v-model="formData.password" :type="visible ? 'text' : 'password'" class="pl-2 text-base
					max-md:w-[48vw] max-md:min-w-17 max-md:text-[15px] md:w-100">
	    		<button type="button" @click="show()" class="max-md:ml-auto md:ml-3">
	    			<IconEye class="max-md:size-5 md:size-6" :slashed="visible"/>
	    		</button>
	    	</div>
            <div class="mx-5 mb-4 mt-1 self-center justify-self-center text-main-color max-md:text-[10px] md:text-xs" 
                :class="{ 'transition-colors duration-200 text-text-error': error, 'transition-colors duration-200 text-main-color': !error, }" 
                @animationend="error = false">
				<p class="text-center
					max-md:w-[80vw] max-md:max-w-110
					md:w-[50vw]
					lg:w-[22vw] lg:min-w-100">{{ t('userPage.edit.desc') }}</p>
            </div>
	    	<input id="submit" class="cursor-pointer justify-self-center p-3 text-base self-center my-4
                            bg-main-color rounded-[7px] text-text-default hover:bg-linear-to-t from-main-color to-light-button
							max-md:w-[80vw] max-md:max-w-110
							md:w-[50vw]
							lg:w-[22vw] lg:min-w-100"
	    			v-bind:class="{'pointer-events-none grayscale': !formData.password,
	    				'pointer-events-auto grayscale-0 ': formData.password }"
	    			type="submit" :value="t('userPage.edit.saveChanges')">
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