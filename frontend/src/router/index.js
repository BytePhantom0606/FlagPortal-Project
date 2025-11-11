/**
 * ============================================
 * FlagForge - Vue Router Configuration
 * ============================================
 */

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue'),
    },
    {
      path: '/challenges',
      name: 'challenges',
      component: () => import('@/views/Challenges.vue'),
    },
    {
      path: '/challenges/:id',
      name: 'challenge-detail',
      component: () => import('@/views/ChallengeDetail.vue'),
    },
    {
      path: '/scoreboard',
      name: 'scoreboard',
      component: () => import('@/views/Scoreboard.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/Profile.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue'),
      meta: { guest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/Register.vue'),
      meta: { guest: true },
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/admin/Dashboard.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/challenges',
      name: 'admin-challenges',
      component: () => import('@/views/admin/Challenges.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('@/views/admin/Users.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFound.vue'),
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  // Check if route requires admin
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next({ name: 'home' })
    return
  }

  // Redirect authenticated users away from guest pages
  if (to.meta.guest && authStore.isAuthenticated) {
    next({ name: 'home' })
    return
  }

  next()
})

export default router
