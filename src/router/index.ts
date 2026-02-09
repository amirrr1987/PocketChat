import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/auth',
      name: 'auth',
      component: () => import('@/layouts/AuthLayout.vue'),
      meta: { guest: true },
      redirect: { name: 'login' },
      children: [
        {
          path: 'login',
          name: 'login',
          component: () => import('@/views/LoginView.vue'),
        },
        {
          path: 'register',
          name: 'register',
          component: () => import('@/views/RegisterView.vue'),
        },
      ],
    },
    {
      path: '/',
      name: 'main-layout',
      component: () => import('@/layouts/MainLayout.vue'),
      meta: { requiresAuth: true },
      redirect: { name: 'chats' },
      children: [
        {
          path: '',
          name: 'chats',
          component: () => import('@/views/ChatsView.vue'),
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/ProfileView.vue'),
        },
        {
          path: 'contacts',
          name: 'contacts',
          component: () => import('@/views/ContactsView.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('chat_token')
  const loggedIn = !!token
  
  // Redirect to login if trying to access protected route without auth
  if (to.meta.requiresAuth && !loggedIn) {
    next({ name: 'login' })
    return
  }
  
  // Redirect to chats if logged in user tries to access auth pages
  if (to.meta.guest && loggedIn) {
    next({ name: 'chats' })
    return
  }
  
  next()
})

export default router
