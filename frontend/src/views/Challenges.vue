<template>
  <div class="container mx-auto px-4 py-12">
    <h1 class="text-4xl font-bold mb-8 text-glow-cyan">Challenges</h1>

    <!-- Loading State -->
    <div v-if="challengesStore.loading" class="text-center py-20">
      <div class="spinner w-16 h-16 mx-auto"></div>
      <p class="text-gray-400 mt-4">Loading challenges...</p>
    </div>

    <!-- Challenges by Category -->
    <div v-else class="space-y-8">
      <div v-for="(challenges, category) in challengesStore.challengesByCategory" :key="category">
        <h2 class="text-2xl font-bold mb-4 flex items-center">
          <span :class="`badge badge-${category.toLowerCase()} mr-3`">{{ category }}</span>
          <span class="text-gray-400 text-sm">({{ challenges.length }})</span>
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <RouterLink
            v-for="challenge in challenges"
            :key="challenge.id"
            :to="`/challenges/${challenge.id}`"
            class="glass-card-hover p-6"
          >
            <div class="flex justify-between items-start mb-4">
              <h3 class="text-xl font-bold">{{ challenge.title }}</h3>
              <span v-if="challenge.isSolved" class="text-neon-green text-2xl">✓</span>
            </div>

            <p class="text-gray-400 text-sm mb-4 line-clamp-2">
              {{ challenge.description }}
            </p>

            <div class="flex justify-between items-center">
              <span :class="`badge badge-${challenge.difficulty.toLowerCase()}`">
                {{ challenge.difficulty }}
              </span>
              <span class="text-neon-cyan font-bold">{{ challenge.points }} pts</span>
            </div>

            <div class="mt-4 text-sm text-gray-500">
              {{ challenge.solveCount }} solves
            </div>
          </RouterLink>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="challengesStore.challenges.length === 0" class="text-center py-20">
        <p class="text-gray-400 text-xl">No challenges available yet.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useChallengesStore } from '@/stores/challenges'

const challengesStore = useChallengesStore()

onMounted(() => {
  challengesStore.fetchChallenges()
})
</script>
