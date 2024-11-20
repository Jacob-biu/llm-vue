import { createApp } from 'vue';
import App from './App.vue';
import router from './router';  // 导入路由配置
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import store from './store';  // 导入 store.js

const app = createApp(App);

app.use(router);  // 使用路由
app.use(ElementPlus);
app.use(store);  // 注册 Vuex store

app.mount('#app');
