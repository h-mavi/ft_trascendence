<script setup>
    import UserAvatar 			from '@/components/UserAvatar.vue';
    import { ref, computed }	from 'vue';
    import { useAuthStore }		from "../stores/auth.st";
    import { storeToRefs } 		from 'pinia';
    import { useI18n }     		from 'vue-i18n';
    import router          		from '../router/index.js';
    import IconAlert       		from '@/components/icons/IconAlert.vue';
    import IconAlertSolid  		from '@/components/icons/IconAlertSolid.vue';
    import IconBrush       		from '@/components/icons/IconBrush.vue';
    import IconGlobeOutline		from '@/components/icons/IconGlobeOutline.vue';
    import IconKey         		from '@/components/icons/IconKey.vue';
    import IconLockSolid   		from '@/components/icons/IconLockSolid.vue';
    import IconMail        		from '@/components/icons/IconMail.vue';
    import IconUser        		from '@/components/icons/IconUser.vue';

    const   { t } = useI18n(),
            authStore = useAuthStore(),
	        { user } = storeToRefs(authStore),
            formData = ref({
	        	name: '',
	        	surname: '',
	        	username: '',
	        	nationality: '',
                preset: '',
                mfa: !!user.value.mfa,
                preferences: 0
	        }),
            avatarFile = ref(null),
            avatarPreview = ref(null),
            error = ref(false),
            removeAvatar = ref(false);

    const avatarSrc = computed(() => {
        if (avatarPreview.value)    { return avatarPreview.value; }
        if (removeAvatar.value)     { return null; }
        return user.value.image || null;
    });

    function handleAvatarChange(event) {
        const file = event.target.files[0];
        if (!file) return;
        if (removeAvatar.value) { removeAvatar.value = false; }
        if (formData.value.preset) { formData.value.preset = ''; }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert('Formato non supportato. Usa JPG, PNG o WEBP.');
            return;
        }
        const maxSizeMB = 10;
        if (file.size > maxSizeMB * 1024 * 1024) {
            alert(`L'immagine supera i ${maxSizeMB}MB.`);
            return;
        }

        avatarFile.value = file;

        if (avatarPreview.value) URL.revokeObjectURL(avatarPreview.value);
        avatarPreview.value = URL.createObjectURL(file);
    }

    function handleAvatarRemove()
    {
        if (!user.value.image && !avatarFile.value) { return; }
        if (avatarFile.value || formData.value.preset)
        {
            formData.value.preset = '';
            avatarPreview.value = user.value.image || null;
        }
        else
        {
            if (user.value.image) { removeAvatar.value = true; }
            avatarPreview.value = null;
        }
        avatarFile.value = null;
    }

    async function submitForm() {
        const fd = new FormData();

        if (formData.value.name)        { fd.append('name', formData.value.name); }
        if (formData.value.surname)     { fd.append('surname', formData.value.surname); }
        if (formData.value.username)    { fd.append('username', formData.value.username); }
        if (formData.value.nationality) { fd.append('nationality', formData.value.nationality); }
        if (formData.value.mfa !== user.value.mfa) { fd.append('mfa', formData.value.mfa); }
        if (formData.value.preferences) { fd.append('preferences', formData.value.preferences); }
        
        if (formData.value.preset) { fd.append('preset', formData.value.preset); }
        else
        {
            if (avatarFile.value)                       { fd.append('avatar', avatarFile.value); }
            else if (!avatarFile.value && removeAvatar.value) { fd.append('avatar', ''); }    
        }
        
        const resp = await authStore.update(fd);
        if (!resp)
        {
            await authStore.fetchMe(true);
            await router.replace('/me');
        }
        else { error.value = true; }
    }
</script>

<template>
    <form @submit.prevent="submitForm" class="flex z-2 bg-bg-darker
            max-lg:overflow-x-hidden max-lg:overflow-y-scroll
            max-lg:pt-15 max-lg:w-screen max-lg:h-screen max-lg:flex-col
            lg:rounded-3xl lg:w-[67vw] lg:h-[80vh]">
        <div class="flex p-2 m-4 rounded-3xl lg:border border-border-default
            max-lg:w-[95vw]
            lg:w-fit lg:mr-2 lg:flex-col">

            
            <!-- Small Devices -->
            <div class="lg:hidden flex flex-col">
                <div class="cursr-pointer relative m-5 mb-1 rounded-full overflow-hidden">
                    <UserAvatar :src="avatarSrc" alt="avatar" class="size-40 rounded-full object-cover" />
                    <input id="avatar-input" type="file" accept="image/png, image/jpeg, image/webp" class="hidden" @change="handleAvatarChange">
                    <label for="avatar-input" class="absolute inset-0 size-40 rounded-full opacity-0"/>
                </div>
                <button type="button" class="self-center" @click="handleAvatarRemove">
                    <u><a class="text-sm cursor-pointer text-main-color hover:text-light-button active:text-active-button">{{ t('userPage.edit.removeAvatar') }}</a></u>
                </button>
            </div>
            <div class="max-md:hidden md:flex md:flex-col lg:hidden gap-3 mt-5 mx-2.5">
                <div class="flex w-full justify-evenly my-0.5">
                    <img @click="formData.preset = 'bastardo'; avatarPreview = '/media/presetIcon/bastardo.PNG'" :draggable="false"
                        :src="'/media/presetIcon/bastardo.PNG'" title="Bastardo" class="size-16 rounded-full object-cover cursor-pointer">
                    <img @click="formData.preset = 'sovrano'; avatarPreview = '/media/presetIcon/sovrano.PNG'" :draggable="false"
                        :src="'/media/presetIcon/sovrano.PNG'" title="Sovrano" class="size-16 rounded-full object-cover cursor-pointer">
                    <!-- altri 2 preset-->
                </div>
                <!-- <div class="flex w-full justify-evenly my-0.5">
                    altri 4 preset
                </div> -->
            </div>
            <div class="flex flex-col justify-self-end max-md:w-[35vw] md:w-full md:max-w-[47vw] lg:hidden">
                <input id="submit" class="cursor-pointer self-end p-3 text-base bg-main-color rounded-[7px] text-text-default hover:bg-linear-to-t from-main-color to-light-button"
                    v-bind:class="{ 'pointer-events-none grayscale': !formData.name && !formData.surname && !formData.username 
                                                                 && !formData.nationality && !formData.preset && formData.mfa === user.mfa 
                                                                 && (!avatarFile && !removeAvatar) && !formData.preferences,
			    	                'pointer-events-auto grayscale-0': formData.name || formData.surname || formData.username 
                                                                    || formData.nationality || formData.preset  || formData.mfa !== user.mfa 
                                                                    || avatarFile || (!avatarFile && removeAvatar) || formData.preferences }"
	            	type="submit" :value="t('userPage.edit.saveChanges')">
            </div>


            <!-- Desktop -->
            <div class="max-lg:hidden cursr-pointer relative m-5 mb-1 rounded-full overflow-hidden">
                <UserAvatar :src="avatarSrc" alt="" class="size-50 rounded-full object-cover" />
                <input id="avatar-input" type="file" accept="image/png, image/jpeg, image/webp"
                    class="hidden" @change="handleAvatarChange">
                <label for="avatar-input" class="absolute inset-0 size-50 flex flex-col items-center justify-center rounded-full
                    bg-bg-blur opacity-0 transition-opacity duration-200 hover:opacity-100">
                    <p class="text-text-default">{{ t('userPage.edit.changeAvatar') }}</p>
                    <p class="text-text-default text-xl leading-none">+</p>
                </label>
            </div>
            <button type="button" class="max-lg:hidden mx-auto" @click="handleAvatarRemove">
                <u><a class="text-sm cursor-pointer text-main-color hover:text-light-button active:text-active-button">{{ t('userPage.edit.removeAvatar') }}</a></u>
            </button>
            <div class="max-lg:hidden flex flex-col gap-3 mt-5 mx-2.5">
                <div class="flex w-full justify-evenly my-0.5">
                    <img @click="formData.preset = 'bastardo'; avatarPreview = '/media/presetIcon/bastardo.PNG'" :draggable="false"
                        :src="'/media/presetIcon/bastardo.PNG'" title="Bastardo" class="size-21 rounded-full object-cover cursor-pointer">
                    <img @click="formData.preset = 'sovrano'; avatarPreview = '/media/presetIcon/sovrano.PNG'" :draggable="false"
                        :src="'/media/presetIcon/sovrano.PNG'" title="Sovrano" class="size-21 rounded-full object-cover cursor-pointer">
                </div>
                <!-- altri 4 preset-->
            </div>
            <RouterLink to="/me/edit/pwd" class="max-lg:hidden mx-auto mt-54">
                <u><a class="text-sm cursor-pointer text-main-color hover:text-light-button active:text-active-button">{{ t('userPage.edit.changePwd') }}</a></u>
            </RouterLink>
            <input id="submit" class="max-lg:hidden cursor-pointer w-[90%] mt-auto mb-6 self-center p-3 
                text-base bg-main-color rounded-[7px] text-text-default hover:bg-linear-to-t from-main-color to-light-button"
                v-bind:class="{ 'pointer-events-none grayscale': !formData.name && !formData.surname && !formData.username 
                                                             && !formData.nationality && !formData.preset && formData.mfa === user.mfa 
                                                             && (!avatarFile && !removeAvatar) && !formData.preferences,
				                'pointer-events-auto grayscale-0': formData.name || formData.surname || formData.username 
                                                                || formData.nationality || formData.preset  || formData.mfa !== user.mfa 
                                                                || avatarFile || (!avatarFile && removeAvatar) || formData.preferences }"
	        	type="submit" :value="t('userPage.edit.saveChanges')">
        </div>


        <div class="flex flex-col m-4 text-text-default bg-bg-default rounded-3xl border border-border-default
                lg:ml-2 lg:w-[51vw]">
            <h2 class="max-md:text-xl md:text-2xl m-5 p-2">{{ t('userPage.edit.infoU') }}
                <hr class="w-full justify-self-start text-text-last">
            </h2>
            <div class="mb-0 self-center
                    max-lg:flex max-lg:flex-col max-lg:items-center
                    lg:grid lg:grid-cols-2 lg:grid-rows-3 lg:gap-5 lg:px-8 lg:py-5">
                <div class="max-lg:w-[75vw]">
                    <div class="flex gap-2 mb-2">
                        <IconUser class="mt-1 size-6 text-form-icon"/>
                        <h3 class="max-md:text-lg md:text-xl">{{ t('login.val.name') }}</h3>
                    </div>
                    <div class="form border-border-default text-form-icon flex mb-3 max-lg:w-full lg:w-full">
                        <input :placeholder="user.name" class="w-[75vw] pl-2 text-base" type="text" v-model="formData.name">
                    </div>
                </div>

                <div class="max-lg:w-[75vw]">
                    <div class="flex gap-2 mb-2">
                        <IconUser class="mt-1 size-6 text-form-icon"/>
                        <h3 class="max-md:text-lg md:text-xl">{{ t('login.val.surname') }}</h3>
                    </div>
                    <div class="form border-border-default text-form-icon flex mb-3 max-lg:w-full lg:w-full">
                        <input :placeholder="user.surname" class="w-[75vw] pl-2 text-base" type="text" v-model="formData.surname">
                    </div>
                </div>

                <div class="max-lg:w-[75vw] relative">
                    <div class="flex gap-2 mb-2">
                        <IconUser class="mt-1 size-6 text-form-icon"/>
                        <h3 class="max-md:text-lg md:text-xl">Username</h3>
                    </div>
                    <div>
	                	<IconAlertSolid
	                		id="allert"
	                		class="absolute size-6 text-text-error animate-error -translate-x-8 translate-y-3 hidden transition-all duration-250 ease-in-out z-11"
	                		:class="{ 'inline' : error }"/>
	                	<div class="hidden p-3 animate-pop flex-col items-center text-center z-11 -translate-x-60 -translate-y-6
	                			gap-2.5 absolute rounded-xl border inset-ring bg-bg-error text-text-error border-border-error inset-ring-inset-error">	
	                		<IconAlert class="size-6 text-text-error self-center mx-auto"/>
	                		<div class="w-45">
	                			<h2>{{ t('login.err.title') }}</h2>
                                <p class="text-sm">{{ t('login.err.username') }}</p>
	                		</div>
	                	</div>
	                </div>
                    <div class="form border-border-default text-form-icon flex mb-3 max-lg:w-full lg:w-full">
                        <input :placeholder="user.username" class="w-[75vw] pl-2 text-base" type="text" v-model="formData.username">
                    </div>
                </div>

                <div class="max-lg:w-[75vw]">
                    <div class="flex gap-2 mb-2">
                        <IconMail class="mt-1 size-6 text-form-icon"/>
                        <h3 class="max-md:text-lg md:text-xl">Email</h3>
                    </div>
                    <div class="flex relative p-2.5 border rounded-[7px] border-border-default text-form-icon justify-self-center mb-3 transition-colors duration-200 
                                max-lg:w-full max-lg:bg-bg-error max-lg:border-inset-error
                                lg:w-full lg:hover:bg-bg-error lg:hover:border-inset-error" id="email">
                        <IconLockSolid
                        	class="size-6 absolute transition-opacity duration-250
                                max-lg:left-1/2 max-lg:top-1/2 max-lg:-translate-x-1/2 max-lg:-translate-y-1/2
                                lg:translate-x-42 lg:opacity-0"/>
                        <input disabled :placeholder="user.email" class="pl-2 text-base" type="email">
                    </div>
                </div>

                <div class="max-lg:w-[75vw]">
                    <div class="flex gap-2 mb-2">
                        <IconGlobeOutline class="mt-1 size-6 text-form-icon"/>
                        <h3 class="max-md:text-lg md:text-xl">{{ t('login.val.nationality') }}</h3>
                    </div>
                    <div class="flex relative p-2.5 border rounded-[7px] border-border-default text-form-icon justify-self-center mb-3 transition-colors duration-200 
                                max-lg:w-full max-lg:bg-bg-error max-lg:border-inset-error
                                lg:w-full lg:hover:bg-bg-error lg:hover:border-inset-error" id="email">
                        <IconLockSolid
                        	class="size-6 absolute transition-opacity duration-250
                                max-lg:left-1/2 max-lg:top-1/2 max-lg:-translate-x-1/2 max-lg:-translate-y-1/2
                                lg:translate-x-42 lg:opacity-0"/>
                        <input disabled :placeholder="user.nationality" list="country" class="pl-2 text-base" type="text" v-model="formData.nationality">
                    </div>
                </div>


                <!-- Small Devices -->
                <div class="w-[75vw] flex max-md:flex-col lg:hidden ">
                    <div>
                        <div class="flex gap-2 mb-2">
                            <IconKey class="mt-1 size-6 text-form-icon"/>
                            <h3 class="max-md:text-lg md:text-xl">{{ t('login.OTP.auth') }}</h3>
                        </div>
                        <div class="flex mb-3 p-2.5 justify-self-center max-md:w-full md:w-sm">
                            <label class="inline-flex items-center me-5 cursor-pointer">
                              <input type="checkbox" class="sr-only peer" v-model="formData.mfa">
                              <span class="select-none me-3 text-sm font-medium text-heading">{{ t('login.OTP.off') }}</span>
                              <div class="relative w-9 h-5 bg-neutral-quaternary rounded-full bg-bg-darker
                                    peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:inset-s-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-main-color"></div>
                              <span class="select-none ms-3 text-sm font-medium text-heading">{{ t('login.OTP.on') }}</span>
                            </label>
                        </div>
                    </div>
                    <RouterLink to="/me/edit/pwd" class="self-center justify-self-center mt-1 mb-2 cursor-pointer text-main-color hover:text-light-button active:text-active-button">
                        <u><a class="text-base">{{ t('userPage.edit.changePwd') }}</a></u>
                    </RouterLink>
                </div>


                <!-- Desktop -->
                <div class="max-lg:hidden">
                    <div class="flex gap-2 mb-2">
                        <IconKey class="mt-1 size-6 text-form-icon"/>
                        <h3 class="max-md:text-lg md:text-xl">{{ t('login.OTP.auth') }}</h3>
                    </div>
                    <div class="flex w-fit mb-3 p-2.5 justify-self-start">
                        <label class="inline-flex items-center me-5 cursor-pointer">
                          <input type="checkbox" class="sr-only peer" v-model="formData.mfa">
                          <span class="select-none me-3 text-sm font-medium text-heading">{{ t('login.OTP.off') }}</span>
                          <div class="relative w-9 h-5 bg-neutral-quaternary rounded-full bg-bg-darker
                                peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:inset-s-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-main-color"></div>
                          <span class="select-none ms-3 text-sm font-medium text-heading">{{ t('login.OTP.on') }}</span>
                        </label>
                    </div>
                </div>


                <div class="col-span-2 max-md:mt-2 max-lg:w-[75vw]">
                    <div class="flex gap-2 mb-2">
                        <IconBrush class="mt-1 size-6 text-form-icon"/>
                        <h3 class="max-md:text-lg md:text-xl">{{ t('login.val.theme') }}</h3>
                    </div>
                    <div class="flex flex-col p-2.5 justify-self-center w-fit">
                        <div class="max-md:grid max-md:grid-flow-row max-md:grid-rows-2 max-md:grid-cols-2 max-md:gap-8
                                    md:flex md:gap-2 md:text-[15px]
                                    lg:gap-10 my-3">
                            <div class="flex gap-2">
                                <input class="pl-2 hidden" type="radio" id="1" value="1" v-model="formData.preferences">
                                <label for="1" class="flex gap-2 items-center">
                                    <div class="grid grid-cols-2 grid-rows-2 rounded-2xl border-2 border-border-second size-12">
                                        <div class="rounded-tl-2xl bg-[#201e1c]"></div>
                                        <div class="rounded-tr-2xl bg-[#302d2a]"></div>
                                        <div class="rounded-bl-2xl bg-[#2f1818]"></div>
                                        <div class="rounded-br-2xl bg-[#882a2a]"></div>
                                    </div>
                                    <p class="md:hidden">Dark<br>Red</p>
                                    <p class="max-md:hidden">Dark Red</p>
                                </label>
                            </div>
                            <div class="flex gap-2">
                                <input class="pl-2 hidden" type="radio" id="2" value="2" v-model="formData.preferences">
                                <label for="2" class="flex gap-2 items-center">
                                    <div class="grid grid-cols-2 grid-rows-2 rounded-2xl border-2 border-border-second size-12">
                                        <div class="rounded-tl-2xl bg-[#1d1d21]"></div>
                                        <div class="rounded-tr-2xl bg-[#2a2b30]"></div>
                                        <div class="rounded-bl-2xl bg-[#17252e]"></div>
                                        <div class="rounded-br-2xl bg-[#2a6287]"></div>
                                    </div>
                                    <p class="md:hidden">Dark<br>Blue</p>
                                    <p class="max-md:hidden">Dark Blue</p>
                                </label>
                            </div>
                            <div class="flex gap-2">
                                <input class="pl-2 hidden" type="radio" id="3" value="3" v-model="formData.preferences">
                                <label for="3" class="flex gap-2 items-center">
                                    <div class="grid grid-cols-2 grid-rows-2 rounded-2xl border-2 border-border-second size-12">
                                        <div class="rounded-tl-2xl bg-[#1d211f]"></div>
                                        <div class="rounded-tr-2xl bg-[#2a302d]"></div>
                                        <div class="rounded-bl-2xl bg-[#182e17]"></div>
                                        <div class="rounded-br-2xl bg-[#2d872a]"></div>
                                    </div>
                                    <p class="md:hidden">Dark<br>Green</p>
                                    <p class="max-md:hidden">Dark Green</p>
                                </label>
                            </div>
                            <div class="flex gap-2">
                                <input class="pl-2 hidden" type="radio" id="4" value="4" v-model="formData.preferences">
                                <label for="4" class="flex gap-2 items-center">
                                    <div class="grid grid-cols-2 grid-rows-2 rounded-2xl border-2 border-border-second size-12">
                                        <div class="rounded-tl-2xl bg-[#20211d]"></div>
                                        <div class="rounded-tr-2xl bg-[#2f302a]"></div>
                                        <div class="rounded-bl-2xl bg-[#2e2917]"></div>
                                        <div class="rounded-br-2xl bg-[#87712a]"></div>
                                    </div>
                                    <p class="md:hidden">Dark<br>Yellow</p>
                                    <p class="max-md:hidden">Dark Yellow</p>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="!user.setpwd" class="flex items-center max-md:flex-col max-md:text-center max-md:text-sm md:text-[80%] 
                    mt-auto px-5 p-2 rounded-b-3xl border bg-bg-error text-text-error border-border-error inset-ring-inset-error">
                <IconAlert class="size-6 text-text-error mr-2"/>
                <p>{{ t('userPage.edit.googlePwd_one') }}</p>
                <RouterLink to="/me/edit/pwd" class="mx-auto">
                    <u><a class="text-sm cursor-pointer text-main-color hover:text-light-button active:text-active-button">{{ t('userPage.edit.googlePwd_two') }}</a></u>
                </RouterLink>
            </div>
        </div>
    </form>
</template>

<style scoped>
    input:checked + label div {
        border-color: var(--color-form-icon);
    }

    div.form {
		padding: 10px;
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

    #email:hover svg {
        opacity: 100%;
    }

    #allert:hover + div {
		display: inline;
	}

	#allert + div:hover {
		display: inline;
	}
</style>