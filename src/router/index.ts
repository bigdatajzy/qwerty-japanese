import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/dict', name: 'dict', component: () => import('@/views/DictView.vue') },
    { path: '/practice/:dictId', name: 'practice', component: () => import('@/views/PracticeView.vue'), props: true },
    { path: '/articles', name: 'articles', component: () => import('@/views/ArticlesView.vue') },
    { path: '/article/:articleId', name: 'article-practice', component: () => import('@/views/ArticlePracticeView.vue'), props: true },
    { path: '/result', name: 'result', component: () => import('@/views/ResultView.vue') }
  ]
})

export default router
