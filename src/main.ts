import { createPinia } from 'pinia';

import 'normalize.css';
import './assets/main.scss';
import '@/assets/global-class.scss';
import '@/assets/transition.scss';

import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);
app.use(createPinia());

app.mount('#app');

