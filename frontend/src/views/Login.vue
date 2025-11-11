<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="glass-card p-8 w-full max-w-md">
      <h2 class="text-3xl font-bold text-center mb-8">
        <span class="text-glow-cyan">Login to</span>
        <span class="text-glow-magenta"> FlagForge</span>
      </h2>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label class="block text-sm font-medium mb-2">Username</label>
          <input
            v-model="form.username"
            type="text"
            class="input-neon"
            placeholder="Enter your username"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Password</label>
          <input
            v-model="form.password"
            type="password"
            class="input-neon"
            placeholder="Enter your password"
            required
          />
        </div>

        <button
          type="submit"
          class="btn-neon w-full"
          :disabled="loading"
        >
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <div class="mt-6 text-center">
        <p class="text-gray-400">
          Don't have an account?
          <RouterLink to="/register" class="text-neon-cyan hover:underline">
            Register here
          </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  username: '',
  password: '',
})

const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  const success = await authStore.login(form.value)
  loading.value = false

  if (success) {
    router.push('/challenges')
  }
}
</script>
