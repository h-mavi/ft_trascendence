<script setup>
	import { useAuthStore }	from "../stores/auth.st";
	import { useI18n }		from 'vue-i18n';
	import { ref }			from 'vue';
	import IconAlert    from './icons/IconAlert.vue';
	import IconLock     from './icons/IconLock.vue';
	import IconUser     from './icons/IconUser.vue';
	import IconEye      from './icons/IconEye.vue';
	import router		from '../router/index.js';

    const	{ t } = useI18n(),
			formData = ref({
			  username: '',
			  password: ''
			}),
			otpData = ref({
			  id_user: '',
			  otp: ''
			}),
			otpValues = ref(['', '', '', '', '', '']),
			authStore = useAuthStore(),
			visible = ref(false), popup = ref(false),
			error = ref(false), error_card = ref(false), error_msg = ref(null),
			resp = ref(null),
			otpExpiration = ref(null);

	async function submitForm() {
		resp.value = await authStore.login(formData.value);
		if (!resp.value && authStore.isAuthenticated)	{ router.push('/me'); }
		else if (resp.value && resp.value.status === "success" && !authStore.isAuthenticated)
		{
			popup.value = true;
    		otpData.value.id_user = resp.value.data.id_user;
    		otpExpiration.value = resp.value.data.Expiration;
		}
		else if (resp.value && resp.value === "User already logged in")
		{
			error.value = true;
			error_card.value = true;
			error_msg.value = t('login.err.logged');
		}
		else	{ error.value = true; error_card.value = true; error_msg.value = t('login.err.wrong'); }
	}

	async function submitOtp()
	{
		otpData.value.otp = otpValues.value.join('');
		resp.value = await authStore.mfa(otpData.value);

		if (!resp.value)
		{
		    popup.value = false;
		    await router.push('/me');
		    return;
		}
		else if (resp.value === "Too many attempts")
		{
			popup.value = false;
			error.value = true;
			error_card.value = true;
			error_msg.value = t('login.err.tooMany');
		}
	}

	const closePopup = () => {
        popup.value = false;
    };

	function show() { visible.value = !visible.value; }

	function handleOtpInput(index, event) {
		const value = event.target.value;
		if (value && /^\d$/.test(value)) // /^\d$/ ^ -> inzio stringa, \d = digit 0-9, $ = fine stringa
		{
			otpValues.value[index] = value;
			if (index < 5)
				setTimeout(() => document.getElementById(`otp-${index + 1}`)?.focus(), 0);
		} 
		else { otpValues.value[index] = ''; }
	}

	function handleOtpKeydown(index, event) {
		if (event.ctrlKey || event.metaKey) return;

		if (!/^\d$/.test(event.key) && !['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(event.key))
		{
    	    event.preventDefault();
    	    return;
    	}

		if (event.key === 'Backspace')
		{
			if (otpValues.value[index] === '' && index > 0)
			{
				otpValues.value[index - 1] = '';
				setTimeout(() => document.getElementById(`otp-${index - 1}`)?.focus(), 0);
			}
			else
				otpValues.value[index] = '';
		}
		else if (event.key === 'ArrowLeft' && index > 0)	{ document.getElementById(`otp-${index - 1}`)?.focus(); }
		else if (event.key === 'ArrowRight' && index < 5)	{ document.getElementById(`otp-${index + 1}`)?.focus(); }
	}

	function handleOtpPaste(event) {
		event.preventDefault();

		const	pasted = event.clipboardData.getData('text').trim(),
				digits = pasted.replace(/\D/g, '').split('');

		if (digits.length === 0)
			return;

		let currentIndex = 0;
		for (let i = 0; i < digits.length && currentIndex < 6; i++) {
			otpValues.value[currentIndex] = digits[i];
			currentIndex++;
		}

		const focusIndex = Math.min(currentIndex, 5);
		setTimeout(() => document.getElementById(`otp-${focusIndex}`)?.focus(), 0);
	}
</script>

<template>
	<div v-if="error_card" class="flex absolute gap-2.5 translate-x-8 items-center rounded-xl border animate-card inset-ring bg-bg-error text-text-error border-border-error inset-ring-inset-error
				max-md:hidden
				md:translate-x-8 md:-translate-y-75 md:px-6 md:py-3 md:w-95 md:mt-1
				lg:px-5 lg:py-4 lg:w-93 ">
		<IconAlert class="size-6 text-text-error"/>
		<div>
			<h2>{{ t('login.err.title') }}</h2>
			<p class="md:text-sm">{{ error_msg }}</p>
		</div>
	</div>
	<div class="justify-self-center justify-items-center">
		<form @submit.prevent="submitForm" method="post" enctype="application/json" class="flex flex-col text-text-default max-sm:w-[80vw]">
			<div class="form border-border-default text-form-icon 
				max-md:w-[80vw] max-md:min-w-65 max-md:p-3
				md:w-sm md:mb-5 md:p-3.75"
				:class="{ 'animate-shake': error, 'max-md:mb-5.5' : !error_card, 'max-md:mb-1' : error_card }" @animationend="error = false">
				<IconUser class="max-md:size-5 md:size-6"/>
				<input :placeholder="'Username ' + t('common.or', 1) + ' email'" class="pl-2 max-md:w-[75vw] max-md:min-w-45 max-md:text-[15px] md:w-75 md:text-base" :autofocus="true" type="text" v-model="formData.username">
			</div>
			<p v-if="error_card" class="md:hidden err transition-all text-xs text-main-color mb-0.5 ml-1">{{ error_msg }}</p>
			<div class="mb-4.5">
				<div class="form border-border-default text-form-icon mb-0.5
						max-md:w-[80vw] max-md:min-w-65 max-md:p-3
						md:w-sm md:p-3.75"
					:class="{ 'animate-shake': error }" @animationend="error = false">
					<IconLock class="max-md:size-5 md:size-6"/>
					<input placeholder="Password" class="pl-2 max-md:w-[65vw] max-md:min-w-40 max-md:text-[15px] md:w-75 md:text-base" v-model="formData.password"
							:type="visible ? 'text' : 'password'">
					<button type="button" @click="show()" class="max-md:ml-auto md:ml-3">
						<IconEye class="max-md:size-5 md:size-6" :slashed="visible"/>
					</button>
				</div>
				<!-- <RouterLink to="/DEBUG/pwd">
					<u><a class="justify-self-center max-md:text-[70%] md:text-[80%] text-main-color cursor-pointer hover:text-light-button active:text-active-button">{{ t('login.forgot') }}</a></u>
				</RouterLink> -->
			</div>
			<input id="submit" class="cursor-pointer justify-self-center bg-main-color rounded-[7px] text-text-default hover:bg-linear-to-t from-main-color to-light-button
					mt-1.5 p-3 text-base max-md:w-[80vw] max-md:min-w-50 md:w-sm"
					v-bind:class="{'pointer-events-none grayscale': !formData.username || !formData.password,
						'pointer-events-auto grayscale-0 ': formData.username && formData.password }"        
					type="submit" :value="t('header.login')">
		</form>
	</div>

	<div v-if="popup" class="fixed inset-0 z-50 flex items-center justify-center bg-bg-blur backdrop-blur-xs px-4">
        <div class="w-full max-w-lg rounded-3xl border border-border-default bg-bg-default p-6 text-text-default shadow-2xl">
            <div class="flex items-start justify-between gap-4">
                <p class="max-md:text-xs md:text-sm uppercase tracking-widest text-text-second">{{ t('login.OTP.auth') }}</p>
				<button type="button" class="max-md:text-base md:text-2xl leading-none text-text-third hover:text-text-default" @click="closePopup">&times;</button>
            </div>
			<hr class="w-[90%] justify-self-start text-text-last mt-1 mb-2">
			<div class="justify-self-center mt-4">
				<p class="max-md:text-xs md:text-sm justify-self-center">{{ t('login.OTP.desc') }}</p>
				<p v-if="otpExpiration" class="max-md:text-xs md:text-sm justify-self-center mb-2">{{ t('login.OTP.exp', { date: otpExpiration }) }}</p>
				<form @submit.prevent="submitOtp" class="flex flex-col justify-self-center items-center">
					<div class="flex">
						<div v-for="(digit, index) in otpValues" :key="`otp-${index}`" id="otpContainer"
							class="otp max-md:p-2 max-md:m-1 max-md:gap-2 md:p-3.75 md:m-1.25 md:gap-3.75">
							<input type="text" class="otp-input max-md:text-xl md:text-[28px]" maxlength="1"
									:id="`otp-${index}`" :value="digit" :autofocus="popup && index === 0 ? true : false"
									@input="handleOtpInput(index, $event)" @keydown="handleOtpKeydown(index, $event)" @paste="handleOtpPaste($event)">
						</div>
					</div>
					<input id="submit" type="submit" value="Accedi"
						class="cursor-pointer my-3 p-3 bg-main-color rounded-[7px] text-text-default hover:bg-linear-to-t from-main-color to-light-button
								max-md:text-sm max-md:w-[80vw] md:text-base md:w-full"
						:class="{	'pointer-events-none grayscale': otpValues.some(v => !v), 
									'pointer-events-auto grayscale-0': otpValues.every(v => v) }">
				</form>
			</div>
		</div>
    </div>
</template>

<style scoped>
	div.form {
		display: flex;
		flex-direction: row;
		border-width: 1px;
		border-radius: 7px;
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

	.otp {
	    display: flex;
	    justify-content: center;
		border-width: 1px;
		border-radius: 7px;
		border-color: var(--color-border-default);
		color: var(--color-form-icon);
		justify-self: center;
	}

	.otp-input {
	    width: 20px;
	    height: 30px;
	    border: none;
	    outline: none;
	    text-align: center;
	    transition: 0.3s;
	}

	div.otp:focus-within {
		border-color: #f1e8e870;
	}

	div.otp:hover {
		border-color: #f1e8e870;
		transition: border 0.25s ease-in-out;
	}

	.err {
	  animation: error 200ms ease-out both;
	}

	@keyframes error {
	  from {
	    opacity: 0;
	  }
	  to {
	    opacity: 100;
	  }
	}
</style>