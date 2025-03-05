import { createPinia } from 'pinia';

import 'normalize.css';
import './assets/main.scss';
import '@/assets/global-class.scss';
import '@/assets/transition.scss';

import { createApp } from 'vue';
import App from './App.vue';
import useFavStore from './features/stores/useFavStore';

const app = createApp(App);
app.use(createPinia());
// Loading databases.
const favState = useFavStore();
favState.initializeColors_();
favState.initializePlts_();

app.mount('#app');

