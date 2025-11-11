<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-12">
    <div class="glass-card p-8 w-full max-w-md">
      <h2 class="text-3xl font-bold text-center mb-8">
        <span class="text-glow-cyan">Join</span>
        <span class="text-glow-magenta"> FlagForge</span>
      </h2>

      <form @submit.prevent="handleRegister" class="space-y-6">
        <div>
          <label class="block text-sm font-medium mb-2">Username</label>
          <input
            v-model="form.username"
            type="text"
            class="input-neon"
            placeholder="Choose a username"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Email</label>
          <input
            v-model="form.email"
            type="email"
            class="input-neon"
            placeholder="your@email.com"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Password</label>
          <input
            v-model="form.password"
            type="password"
            class="input-neon"
            placeholder="Create a strong password"
            required
          />
          <p class="text-xs text-gray-500 mt-1">
            Must contain uppercase, lowercase, number, and special character
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Country (optional)</label>
          <input
            v-model="form.country"
            type="text"
            class="input-neon"
            placeholder="Your country"
          />
        </div>

        <button
          type="submit"
          class="btn-neon w-full"
          :disabled="loading"
        >
          {{ loading ? 'Creating account...' : 'Register' }}
        </button>
      </form>

      <div class="mt-6 text-center">
        <p class="text-gray-400">
          Already have an account?
          <RouterLink to="/login" class="text-neon-cyan hover:underline">
            Login here
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
  email: '',
  password: '',
  country: '',
})

const loading = ref(false)

const handleRegister = async () => {
  loading.value = true
  const success = await authStore.register(form.value)
  loading.value = false

  if (success) {
    router.push('/challenges')
  }
}
</script>
