// src/router.js
import { createRouter, createWebHistory } from 'vue-router';

// 导入视图组件
import HomePage from '@/views/Home.vue';
import AboutPage from '@/views/About.vue';
import knowledgeDBView from './views/knowledgeDBView.vue';  
import knowledgeDBPreview from './views/knowledgeDBPreview.vue';

// 定义路由
const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/about',
    name: 'About',
    component: AboutPage
  },
  {
    path: '/knowledgeDBView',
    name: 'knowledgeDBView',
    component: knowledgeDBView
  },
  {
    path: '/knowledge-db-preview',
    name: 'knowledgeDBPreview',
    component: knowledgeDBPreview,
  },
];

// 创建并导出路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
