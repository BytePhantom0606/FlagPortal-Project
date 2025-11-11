<template>
  <header class="glass-card sticky top-0 z-50 border-b border-dark-border">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center space-x-3">
          <div class="text-2xl font-bold">
            <span class="text-glow-cyan">Flag</span><span class="text-glow-magenta">Forge</span>
          </div>
        </RouterLink>

        <!-- Navigation -->
        <nav class="hidden md:flex items-center space-x-4">
          <RouterLink to="/" :class="isActive('/') ? 'nav-link-active' : 'nav-link'">
            Home
          </RouterLink>
          <RouterLink to="/challenges" :class="isActive('/challenges') ? 'nav-link-active' : 'nav-link'">
            Challenges
          </RouterLink>
          <RouterLink to="/scoreboard" :class="isActive('/scoreboard') ? 'nav-link-active' : 'nav-link'">
            Scoreboard
          </RouterLink>
        </nav>

        <!-- User Menu -->
        <div class="flex items-center space-x-4">
          <template v-if="authStore.isAuthenticated">
            <RouterLink to="/profile" class="nav-link">
              {{ authStore.user.username }}
            </RouterLink>
            <RouterLink v-if="authStore.isAdmin" to="/admin" class="btn-neon-outline px-4 py-2 text-sm">
              Admin
            </RouterLink>
            <button @click="handleLogout" class="nav-link">
              Logout
            </button>
          </template>
          <template v-else>
            <RouterLink to="/login" class="nav-link">
              Login
            </RouterLink>
            <RouterLink to="/register" class="btn-neon px-4 py-2 text-sm">
              Register
            </RouterLink>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isActive = (path) => route.path === path || route.path.startsWith(path + '/')

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>
