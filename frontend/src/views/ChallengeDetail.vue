<template>
  <div class="container mx-auto px-4 py-12">
    <RouterLink to="/challenges" class="text-neon-cyan hover:underline mb-8 inline-block">
      ← Back to Challenges
    </RouterLink>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-20">
      <div class="spinner w-16 h-16 mx-auto"></div>
    </div>

    <!-- Challenge Content -->
    <div v-else-if="challenge" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Header -->
        <div class="glass-card p-8">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h1 class="text-4xl font-bold mb-2">{{ challenge.title }}</h1>
              <p class="text-gray-400" v-if="challenge.author">by {{ challenge.author }}</p>
            </div>
            <span v-if="challenge.isSolved" class="text-neon-green text-4xl">✓</span>
          </div>

          <div class="flex flex-wrap gap-4 mb-6">
            <span :class="`badge badge-${challenge.category.toLowerCase()}`">
              {{ challenge.category }}
            </span>
            <span :class="`badge badge-${challenge.difficulty.toLowerCase()}`">
              {{ challenge.difficulty }}
            </span>
            <span class="badge bg-neon-cyan bg-opacity-20 text-neon-cyan">
              {{ challenge.points }} points
            </span>
            <span class="badge">
              {{ challenge.solveCount }} solves
            </span>
          </div>

          <div class="prose prose-invert max-w-none" v-html="renderedDescription"></div>

          <div v-if="challenge.connection" class="mt-6 p-4 bg-dark-card rounded-lg border border-dark-border">
            <span class="text-sm text-gray-400">Connection:</span>
            <code class="ml-2 text-neon-cyan font-mono">{{ challenge.connection }}</code>
          </div>
        </div>

        <!-- Flag Submission -->
        <div v-if="!challenge.isSolved && authStore.isAuthenticated" class="glass-card p-8">
          <h2 class="text-2xl font-bold mb-6 text-glow-cyan">Submit Flag</h2>

          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <input
                v-model="flagInput"
                type="text"
                class="flag-input"
                placeholder="flag{enter_flag_here}"
                required
              />
            </div>

            <button
              type="submit"
              class="btn-neon w-full"
              :disabled="submitting"
            >
              {{ submitting ? 'Submitting...' : 'Submit Flag' }}
            </button>
          </form>

          <div v-if="challenge.userSubmissions && challenge.userSubmissions.length > 0" class="mt-6">
            <h3 class="text-sm font-semibold text-gray-400 mb-2">Recent Attempts:</h3>
            <div class="space-y-2">
              <div
                v-for="(sub, idx) in challenge.userSubmissions"
                :key="idx"
                class="flex justify-between items-center text-sm"
              >
                <span :class="sub.status === 'CORRECT' ? 'text-neon-green' : 'text-red-400'">
                  {{ sub.status }}
                </span>
                <span class="text-gray-500">{{ formatDate(sub.submittedAt) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Already Solved -->
        <div v-else-if="challenge.isSolved" class="glass-card p-8 text-center">
          <div class="text-6xl mb-4">🎉</div>
          <h2 class="text-2xl font-bold text-neon-green mb-2">Challenge Solved!</h2>
          <p class="text-gray-400">You've already captured this flag.</p>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Hints -->
        <div v-if="challenge.hints && challenge.hints.length > 0" class="glass-card p-6">
          <h3 class="text-xl font-bold mb-4 text-neon-purple">Hints</h3>
          <div class="space-y-3">
            <div
              v-for="hint in challenge.hints"
              :key="hint.id"
              class="p-4 bg-dark-card rounded-lg border border-dark-border"
            >
              <p class="text-sm text-gray-300">{{ hint.content }}</p>
              <p class="text-xs text-gray-500 mt-2">Cost: {{ hint.cost }} points</p>
            </div>
          </div>
        </div>

        <!-- Attachments -->
        <div v-if="challenge.attachments && challenge.attachments.length > 0" class="glass-card p-6">
          <h3 class="text-xl font-bold mb-4 text-neon-magenta">Files</h3>
          <div class="space-y-2">
            <a
              v-for="file in challenge.attachments"
              :key="file.id"
              :href="`/api/challenges/${challenge.id}/attachments/${file.id}`"
              class="flex items-center justify-between p-3 bg-dark-card rounded-lg hover:bg-dark-hover transition"
            >
              <span class="text-sm">{{ file.originalName }}</span>
              <span class="text-xs text-gray-500">{{ formatBytes(file.filesize) }}</span>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="text-center py-20">
      <p class="text-red-400 text-xl">Challenge not found</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useChallengesStore } from '@/stores/challenges'
import { useAuthStore } from '@/stores/auth'
import { marked } from 'marked'
import dayjs from 'dayjs'

const route = useRoute()
const challengesStore = useChallengesStore()
const authStore = useAuthStore()

const loading = ref(true)
const flagInput = ref('')
const submitting = ref(false)

const challenge = computed(() => challengesStore.currentChallenge)

const renderedDescription = computed(() => {
  if (!challenge.value) return ''
  return marked(challenge.value.description)
})

const handleSubmit = async () => {
  submitting.value = true
  const result = await challengesStore.submitFlag(challenge.value.id, flagInput.value)
  submitting.value = false

  if (result.success) {
    flagInput.value = ''
    // Refresh challenge to show updated status
    await challengesStore.fetchChallenge(challenge.value.id)
  }
}

const formatDate = (date) => {
  return dayjs(date).format('MMM D, HH:mm')
}

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

onMounted(async () => {
  loading.value = true
  await challengesStore.fetchChallenge(route.params.id)
  loading.value = false
})
</script>
