<script setup>
	import { ref, reactive }	from 'vue';
	import { useAuthStore } from "../stores/auth.st";
	import { useI18n }		from 'vue-i18n';
	import router			from '../router/index.js';
	import IconAlert               from './icons/IconAlert.vue';
	import IconAlertSolid          from './icons/IconAlertSolid.vue';
	import IconEye                 from './icons/IconEye.vue';
	import IconGlobeOutline        from './icons/IconGlobeOutline.vue';
	import IconLock                from './icons/IconLock.vue';
	import IconMail                from './icons/IconMail.vue';
	import IconUser                from './icons/IconUser.vue';

    const { t, locale } = useI18n({ useScope: 'global' }),
			formData = ref({
				name: '',
				surname: '',
				email: '',
				username: '',
				password: '',
				nationality: ''
			});
	const	authStore = useAuthStore(),
			visible = ref(false),
			error = reactive({
				clone: [false, false],		//[0] == shake, [1] == card
				username: [false, false],
				email: [false, false],
				password: [false, false],
			}),
			error_msg = {
				clone: t('login.err.clone'),
				username: t('login.err.username'),
				email: t('login.err.email'),
				password: t('login.err.password')
			};
	let		resp = ref(null);

	function resetError() {
		error.clone[1] = false;
		error.username[1] = false;
		error.email[1] = false;
		error.password[1] = false;
	}

	async function submitForm() {
		resp.value = await authStore.register(formData.value);
		resetError();
		if (!resp.value)	{ router.push('/me'); }
		else {
			switch (resp.value) {
				case "User already exists":
					error.clone.fill(true)
					break;
				case "Username too short":
					error.username.fill(true)
					break;
				case "Invalid email format":
					error.email.fill(true)
					break;
				case "Invalid password format":
					error.password.fill(true)
					break;
				default:
					break;
			}
		}
	}

	function show() { visible.value = !visible.value; }
</script>

<template>
	<datalist id="country" class="max-h-50">
		<datalist id="country">
		<option value="Afghanistan" />
		<option value="Albania" />
		<option value="Algeria" />
		<option value="Samoa Americane" />
		<option value="Andorra" />
		<option value="Angola" />
		<option value="Anguilla" />
		<option value="Antartide" />
		<option value="Antigua e Barbuda" />
		<option value="Argentina" />
		<option value="Armenia" />
		<option value="Aruba" />
		<option value="Australia" />
		<option value="Austria" />
		<option value="Azerbaigian" />
		<option value="Bahamas" />
		<option value="Bahrein" />
		<option value="Bangladesh" />
		<option value="Barbados" />
		<option value="Bielorussia" />
		<option value="Belgio" />
		<option value="Belize" />
		<option value="Benin" />
		<option value="Bermuda" />
		<option value="Bhutan" />
		<option value="Bolivia" />
		<option value="Bosnia ed Erzegovina" />
		<option value="Botswana" />
		<option value="Isola Bouvet" />
		<option value="Brasile" />
		<option value="Territorio Britannico dell'Oceano Indiano" />
		<option value="Brunei" />
		<option value="Bulgaria" />
		<option value="Burkina Faso" />
		<option value="Burundi" />
		<option value="Cambogia" />
		<option value="Camerun" />
		<option value="Canada" />
		<option value="Capo Verde" />
		<option value="Isole Cayman" />
		<option value="Repubblica Centrafricana" />
		<option value="Ciad" />
		<option value="Cile" />
		<option value="Cina" />
		<option value="Isola Christmas" />
		<option value="Isole Cocos (Keeling)" />
		<option value="Colombia" />
		<option value="Comore" />
		<option value="Congo" />
		<option value="Congo, Repubblica Democratica del" />
		<option value="Isole Cook" />
		<option value="Costa Rica" />
		<option value="Costa d'Avorio" />
		<option value="Croazia" />
		<option value="Cuba" />
		<option value="Cipro" />
		<option value="Repubblica Ceca" />
		<option value="Danimarca" />
		<option value="Gibuti" />
		<option value="Dominica" />
		<option value="Repubblica Dominicana" />
		<option value="Ecuador" />
		<option value="Egitto" />
		<option value="El Salvador" />
		<option value="Guinea Equatoriale" />
		<option value="Eritrea" />
		<option value="Estonia" />
		<option value="Etiopia" />
		<option value="Isole Falkland (Malvinas)" />
		<option value="Isole Faroe" />
		<option value="Figi" />
		<option value="Finlandia" />
		<option value="Francia" />
		<option value="Guyana Francese" />
		<option value="Polinesia Francese" />
		<option value="Terre Australi e Antartiche Francesi" />
		<option value="Gabon" />
		<option value="Gambia" />
		<option value="Georgia" />
		<option value="Germania" />
		<option value="Ghana" />
		<option value="Gibilterra" />
		<option value="Grecia" />
		<option value="Groenlandia" />
		<option value="Grenada" />
		<option value="Guadalupa" />
		<option value="Guam" />
		<option value="Guatemala" />
		<option value="Guinea" />
		<option value="Guinea-Bissau" />
		<option value="Guyana" />
		<option value="Haiti" />
		<option value="Isole Heard e McDonald" />
		<option value="Santa Sede (Città del Vaticano)" />
		<option value="Honduras" />
		<option value="Hong Kong" />
		<option value="Ungheria" />
		<option value="Islanda" />
		<option value="India" />
		<option value="Indonesia" />
		<option value="Iran" />
		<option value="Iraq" />
		<option value="Irlanda" />
		<option value="Italia" />
		<option value="Giamaica" />
		<option value="Giappone" />
		<option value="Giordania" />
		<option value="Kazakistan" />
		<option value="Kenya" />
		<option value="Kiribati" />
		<option value="Corea del Nord" />
		<option value="Corea del Sud" />
		<option value="Kuwait" />
		<option value="Kirghizistan" />
		<option value="Laos" />
		<option value="Lettonia" />
		<option value="Libano" />
		<option value="Lesotho" />
		<option value="Liberia" />
		<option value="Libia" />
		<option value="Liechtenstein" />
		<option value="Lituania" />
		<option value="Lussemburgo" />
		<option value="Macao" />
		<option value="Macedonia del Nord" />
		<option value="Madagascar" />
		<option value="Malawi" />
		<option value="Malesia" />
		<option value="Maldive" />
		<option value="Mali" />
		<option value="Malta" />
		<option value="Isole Marshall" />
		<option value="Martinica" />
		<option value="Mauritania" />
		<option value="Mauritius" />
		<option value="Mayotte" />
		<option value="Messico" />
		<option value="Micronesia" />
		<option value="Moldova" />
		<option value="Monaco" />
		<option value="Mongolia" />
		<option value="Montserrat" />
		<option value="Marocco" />
		<option value="Mozambico" />
		<option value="Myanmar" />
		<option value="Namibia" />
		<option value="Nauru" />
		<option value="Nepal" />
		<option value="Paesi Bassi" />
		<option value="Antille Olandesi" />
		<option value="Nuova Caledonia" />
		<option value="Nuova Zelanda" />
		<option value="Nicaragua" />
		<option value="Niger" />
		<option value="Nigeria" />
		<option value="Niue" />
		<option value="Isola Norfolk" />
		<option value="Isole Marianne Settentrionali" />
		<option value="Norvegia" />
		<option value="Oman" />
		<option value="Pakistan" />
		<option value="Palau" />
		<option value="Palestina" />
		<option value="Panama" />
		<option value="Papua Nuova Guinea" />
		<option value="Paraguay" />
		<option value="Perù" />
		<option value="Filippine" />
		<option value="Pitcairn" />
		<option value="Polonia" />
		<option value="Portogallo" />
		<option value="Porto Rico" />
		<option value="Qatar" />
		<option value="Riunione" />
		<option value="Romania" />
		<option value="Federazione Russa" />
		<option value="Ruanda" />
		<option value="Sant'Elena" />
		<option value="Saint Kitts e Nevis" />
		<option value="Santa Lucia" />
		<option value="Saint Pierre e Miquelon" />
		<option value="Saint Vincent e Grenadine" />
		<option value="Samoa" />
		<option value="San Marino" />
		<option value="São Tomé e Príncipe" />
		<option value="Arabia Saudita" />
		<option value="Senegal" />
		<option value="Serbia e Montenegro" />
		<option value="Seychelles" />
		<option value="Sierra Leone" />
		<option value="Singapore" />
		<option value="Slovacchia" />
		<option value="Slovenia" />
		<option value="Isole Salomone" />
		<option value="Somalia" />
		<option value="Sudafrica" />
		<option value="Georgia del Sud e Isole Sandwich Australi" />
		<option value="Spagna" />
		<option value="Sri Lanka" />
		<option value="Sudan" />
		<option value="Suriname" />
		<option value="Svalbard e Jan Mayen" />
		<option value="Swaziland" />
		<option value="Svezia" />
		<option value="Svizzera" />
		<option value="Siria" />
		<option value="Taiwan" />
		<option value="Tagikistan" />
		<option value="Tanzania" />
		<option value="Thailandia" />
		<option value="Timor Est" />
		<option value="Togo" />
		<option value="Tokelau" />
		<option value="Tonga" />
		<option value="Trinidad e Tobago" />
		<option value="Tunisia" />
		<option value="Turchia" />
		<option value="Turkmenistan" />
		<option value="Isole Turks e Caicos" />
		<option value="Tuvalu" />
		<option value="Uganda" />
		<option value="Ucraina" />
		<option value="Emirati Arabi Uniti" />
		<option value="Regno Unito" />
		<option value="Stati Uniti" />
		<option value="Isole Minori Esterne degli Stati Uniti" />
		<option value="Uruguay" />
		<option value="Uzbekistan" />
		<option value="Vanuatu" />
		<option value="Venezuela" />
		<option value="Vietnam" />
		<option value="Isole Vergini Britanniche" />
		<option value="Isole Vergini Americane" />
		<option value="Wallis e Futuna" />
		<option value="Sahara Occidentale" />
		<option value="Yemen" />
		<option value="Zambia" />
		<option value="Zimbabwe" />
	</datalist>
	</datalist>
	<div class="max-lg:hidden">
		<IconAlertSolid
			id="allert"
			class="absolute size-6 text-text-error animate-error -translate-x-3 hidden transition-all duration-250 ease-in-out"
			:class="{	'inline translate-y-34.5' : error.username[1] || error.clone[1],
						'inline translate-y-49' : error.email[1],
						'inline translate-y-63.5' : error.password[1],
			}"/>
		<div class="hidden -translate-x-25 p-3 animate-pop flex-col items-center text-center
				gap-2.5 absolute rounded-xl border inset-ring bg-bg-error text-text-error border-border-error inset-ring-inset-error"
			:class="{	'translate-y-24.5 -translate-x-52 inline' : error.clone[1] && locale == 'it',
						'translate-y-24.5 -translate-x-57 inline' : error.clone[1] && locale == 'en',
						'translate-y-24.5 -translate-x-55' : error.username[1], 
						'translate-y-39 -translate-x-52' : error.email[1] && locale == 'it',
						'translate-y-39 -translate-x-57' : error.email[1] && locale == 'en',
						'translate-y-53.5 -translate-x-69' : error.password[1],
			}">	
			<IconAlert class="size-6 text-text-error self-center mx-auto"/>
			<div>
				<h2>{{ t('login.err.title') }}</h2>
				<p class="text-sm whitespace-pre-line" v-if="error.username[1]">{{ error_msg.username }}</p>
				<p class="text-sm whitespace-pre-line" v-if="error.clone[1]">{{ error_msg.clone }}</p>
				<p class="text-sm whitespace-pre-line" v-if="error.email[1]">{{ error_msg.email }}</p>
				<p class="text-sm whitespace-pre-line" v-if="error.password[1]">{{ error_msg.password }}</p>
				<RouterLink to="/login" v-if="error.clone[1]">
                    <u><a class="text-sm cursor-pointer hover:text-light-button active:text-active-button">{{ t('header.login') }}</a></u>
                </RouterLink>
			</div>
		</div>
	</div>

	<!-- mb-5.5 -->

	<div class="justify-self-center justify-items-center max-md:mt-1 md:mt-3">
		<form @submit.prevent="submitForm" method="post" enctype="application/json" class="text-text-default max-sm:w-[80vw]" target="_blank">
			<div class="form border-border-default text-form-icon
				max-md:w-[80vw] max-md:min-w-65 max-md:p-2
				max-lg:mb-5.5 md:w-sm md:p-2.5 lg:mb-3">
				<IconUser class="max-md:size-5 md:size-6"/>
				<input :placeholder="t('login.val.name')" class="pl-2 max-md:w-[75vw] max-md:min-w-45 max-md:text-[15px] md:w-75 md:text-base" autofocus="true" type="text" v-model="formData.name">
			</div>
			<div class="form border-border-default text-form-icon
				max-md:w-[80vw] max-md:min-w-65 max-md:p-2
				max-lg:mb-5.5 md:w-sm md:p-2.5 lg:mb-3">
				<IconUser class="max-md:size-5 md:size-6"/>
				<input :placeholder="t('login.val.surname')" class="pl-2 max-md:w-[75vw] max-md:min-w-45 max-md:text-[15px] md:w-75 md:text-base" type="text" v-model="formData.surname">
			</div>
			<div class="form border-border-default text-form-icon
				max-md:w-[80vw] max-md:min-w-65 max-md:p-2
				md:w-sm md:p-2.5 lg:mb-3" :class="{ 'animate-shake': error.username[0], 'max-lg:mb-5.5' : !error.username[1] && !error.clone[1], 'max-lg:mb-1' : error.username[1] || error.clone[1] }" @animationend="error.username[0] = false">
				<IconUser class="max-md:size-5 md:size-6"/>
				<input placeholder="Username" class="pl-2 max-md:w-[75vw] max-md:min-w-45 max-md:text-[15px] md:w-75 md:text-base" type="text" v-model="formData.username">
			</div>
			<p v-if="error.username[1]" class="lg:hidden err transition-all text-main-color mb-0.5 ml-1 max-md:text-[10px] md:text-xs">{{ error_msg.username }}</p>
			<p v-if="error.clone[1]" class="lg:hidden err transition-all text-main-color mb-0.5 ml-1 max-md:text-[10px] md:text-xs">{{ error_msg.clone }}</p>
			<div class="form border-border-default text-form-icon
				max-md:w-[80vw] max-md:min-w-65 max-md:p-2
				md:w-sm md:p-2.5 lg:mb-3" :class="{ 'animate-shake': error.email[0], 'max-lg:mb-5.5' : !error.email[1], 'max-lg:mb-1' : error.email[1] }" @animationend="error.email[0] = false">
				<IconMail class="max-md:size-5 md:size-6"/>
				<input placeholder="Email" class="pl-2 max-md:w-[75vw] max-md:min-w-45 max-md:text-[15px] md:w-75 md:text-base" type="email" v-model="formData.email">
			</div>
			<p v-if="error.email[1]" class="lg:hidden err transition-all text-main-color mb-0.5 ml-1 max-md:text-[10px] md:text-xs">{{ error_msg.email }}</p>
			<div class="form border-border-default text-form-icon
				max-md:w-[80vw] max-md:min-w-65 max-md:p-2
				md:w-sm md:p-2.5 lg:mb-3" :class="{ 'animate-shake': error.password[0], 'max-lg:mb-5.5' : !error.password[1], 'max-lg:mb-1' : error.password[1] }" @animationend="error.password[0] = false">
				<IconLock class="max-md:size-5 md:size-6"/>
				<input placeholder="Password" size="31" class="pl-2 max-md:w-[65vw] max-md:min-w-40 max-md:text-[15px] md:w-75 md:text-base" :type="visible ? 'text' : 'password'" v-model="formData.password">
				<button type="button" @click="show()" class="ml-3">
					<IconEye class="max-md:size-5 md:size-6" :slashed="visible"/>
				</button>
			</div>
			<p v-if="error.password[1]" class="lg:hidden err transition-all text-center md:text-xs text-main-color mb-0.5 ml-1 max-md:text-[10px] md:w-sm">{{ error_msg.password }}</p>
			<div class="form border-border-default text-form-icon
				max-md:w-[80vw] max-md:min-w-65 max-md:mb-2 max-md:p-2
				md:w-sm md:mb-3 md:p-2.5">
				<IconGlobeOutline class="max-md:size-5 md:size-6"/>
				<input :placeholder="t('login.val.nationality')" list="country" class="pl-2 max-md:w-[75vw] max-md:min-w-45 max-md:text-[15px] md:w-75 md:text-base" type="text" v-model="formData.nationality">
			</div>
			<input id="submit" class="cursor-pointer justify-self-center w-full mt-1.5 p-3 text-base bg-main-color rounded-[7px] text-text-default hover:bg-linear-to-t from-main-color to-light-button"
					v-bind:class="{'pointer-events-none grayscale': !formData.name || !formData.surname || !formData.username || !formData.email || !formData.password || !formData.nationality,
						'pointer-events-auto grayscale-0 ': formData.name && formData.surname && formData.username && formData.email && formData.password && formData.nationality }"
					type="submit" :value="t('login.signIn')">
		</form>
	</div>
</template>

<style scoped>
	div.form {
		display: flex;
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

	#allert:hover + div
	{
		display: inline;
	}

	#allert + div:hover {
		display: inline;
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