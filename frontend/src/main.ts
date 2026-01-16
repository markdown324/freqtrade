import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';

import App from './App.vue';
import router from './router';
import './styles/global.scss';

import { useConfigStore } from './stores/configStore';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(ElementPlus);

// Initialize theme
const configStore = useConfigStore();
configStore.initTheme();

app.mount('#app');
