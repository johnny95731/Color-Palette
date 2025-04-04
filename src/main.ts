import { createPinia } from 'pinia';

import 'normalize.css';
import './assets/bootstrap-icons.scss';
import './assets/main.scss';
import './assets/global-class.scss';
import './assets/transition.scss';

import { createApp } from 'vue';
import App from './App.vue';
import useSettingStore from './stores/useSettingStore';
import useFavStore from './stores/useFavStore';
import usePltStore from './stores/usePltStore';

const app = createApp(App);
app.use(createPinia());

useSettingStore().initializeSettings_();
useFavStore().initializeColors_();
useFavStore().initializePlts_();
usePltStore().initCards_();

app.mount('#app');

