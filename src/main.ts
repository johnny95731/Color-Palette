import { createPinia } from 'pinia';

import 'normalize.css';
import './assets/main.scss';

import { createApp } from 'vue';
import App from './App.vue';
import useFavStore from './features/stores/useFavStore';

const app = createApp(App);
app.use(createPinia());
// Loading databases.
const favState = useFavStore();
favState.initializeColors();
favState.initializePlts();

app.mount('#app');

