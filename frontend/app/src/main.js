import { createApp } 	from 'vue';
import { createPinia }	from 'pinia';
import { createI18n }	from 'vue-i18n';
import App				from './App.vue'
import router			from './router'
import { italian }		from './lang/italian.js'
import { english }		from './lang/english.js'
import { useAuthStore }	from './stores/auth.st.js'


const app = createApp(App);
const i18n = createI18n({
    legacy: false,
    locale: "en",
    fallbackLocale: "it",
    messages :
    {
        "it" : italian.messages,
        "en" : english.messages
    }
});

app.use(createPinia());

// Utilizzo della flag has_session per capire se è stato precedentemente loggato
useAuthStore().$subscribe((_, state) => {
	state.user ? localStorage.setItem('has_session', '1') : localStorage.removeItem('has_session');
});

app.use(router);
app.use(i18n);
await router.isReady();
app.mount('#app');