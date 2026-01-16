import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useUserStore } from '@/stores/userStore';

const routes: RouteRecordRaw[] = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/LoginView.vue'),
        meta: { requiresAuth: false },
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('@/views/RegisterView.vue'),
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
                path: 'bots',
                name: 'BotManager',
                component: () => import('@/views/BotManagerView.vue'),
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
router.beforeEach(async (to, _from, next) => {
    const userStore = useUserStore();

    // Try to restore session if not authenticated
    if (!userStore.isAuthenticated) {
        await userStore.restoreSession();
    }

    if (to.meta.requiresAuth !== false && !userStore.isAuthenticated) {
        next('/login');
    } else if ((to.path === '/login' || to.path === '/register') && userStore.isAuthenticated) {
        next('/');
    } else {
        next();
    }
});

export default router;
