import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const routes: RouteRecordRaw[] = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/LoginView.vue'),
        meta: { requiresAuth: false },
    },
    {
        path: '/',
        component: () => import('@/components/layout/AppLayout.vue'),
        meta: { requiresAuth: true },
        children: [
            {
                path: '',
                name: 'Dashboard',
                component: () => import('@/views/DashboardView.vue'),
            },
            {
                path: 'trades',
                name: 'Trades',
                component: () => import('@/views/TradesView.vue'),
            },
            {
                path: 'backtest',
                name: 'Backtest',
                component: () => import('@/views/BacktestView.vue'),
            },
            {
                path: 'strategies',
                name: 'Strategies',
                component: () => import('@/views/StrategyView.vue'),
            },
            {
                path: 'settings',
                name: 'Settings',
                component: () => import('@/views/SettingsView.vue'),
            },
        ],
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// Navigation guard
router.beforeEach((to, _from, next) => {
    const authStore = useAuthStore();

    if (to.meta.requiresAuth !== false && !authStore.isAuthenticated) {
        next('/login');
    } else if (to.path === '/login' && authStore.isAuthenticated) {
        next('/');
    } else {
        next();
    }
});

export default router;
