<template>
  <div class="container mx-auto px-4 py-12">
    <div class="glass-card p-8 max-w-2xl mx-auto">
      <h1 class="text-3xl font-bold mb-8 text-glow-cyan">Profile</h1>

      <div class="space-y-6">
        <div>
          <label class="block text-sm font-medium mb-2">Username</label>
          <div class="input-neon bg-opacity-50 cursor-not-allowed">
            {{ authStore.user?.username }}
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Email</label>
          <div class="input-neon bg-opacity-50 cursor-not-allowed">
            {{ authStore.user?.email }}
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Role</label>
          <span :class="authStore.isAdmin ? 'badge-insane' : 'badge-easy'" class="badge">
            {{ authStore.user?.role }}
          </span>
        </div>
      </div>

      <div class="mt-8 pt-8 border-t border-dark-border">
        <button @click="handleLogout" class="btn-neon-outline w-full">
          Logout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>
