import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/Home.vue'),
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
    },
    {
      path: '/cart',
      name: 'Cart',
      component: () => import('../views/Cart.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/checkout',
      name: 'Checkout',
      component: () => import('../views/Checkout.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/product/:id',
      name: 'ProductDetail',
      component: () => import('../views/ProductDetail.vue'),
    },
    {
      path: '/orders',
      name: 'OrderList',
      component: () => import('../views/OrderList.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/orders/:orderNo',
      name: 'OrderDetail',
      component: () => import('../views/OrderDetail.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/pay',
      name: 'OrderPay',
      component: () => import('../views/OrderPay.vue'),
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach((to, _from, next) => {
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token');
    if (!token) {
      next({ name: 'Login', query: { redirect: to.fullPath } });
      return;
    }
  }
  next();
});

export default router;
