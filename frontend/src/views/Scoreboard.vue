<template>
  <div class="container mx-auto px-4 py-12">
    <h1 class="text-4xl font-bold mb-8 text-glow-cyan">Scoreboard</h1>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-20">
      <div class="spinner w-16 h-16 mx-auto"></div>
    </div>

    <!-- Scoreboard Table -->
    <div v-else class="glass-card overflow-hidden">
      <table class="w-full">
        <thead class="bg-dark-card border-b border-dark-border">
          <tr>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-400">Rank</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-400">User</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-gray-400">Country</th>
            <th class="px-6 py-4 text-right text-sm font-semibold text-gray-400">Solves</th>
            <th class="px-6 py-4 text-right text-sm font-semibold text-gray-400">Points</th>
            <th class="px-6 py-4 text-right text-sm font-semibold text-gray-400">🩸</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="entry in scoreboard"
            :key="entry.userId"
            class="border-b border-dark-border hover:bg-dark-hover transition"
          >
            <td class="px-6 py-4">
              <span
                class="font-bold text-lg"
                :class="{
                  'text-yellow-400': entry.rank === 1,
                  'text-gray-300': entry.rank === 2,
                  'text-amber-600': entry.rank === 3,
                  'text-gray-400': entry.rank > 3,
                }"
              >
                #{{ entry.rank }}
              </span>
            </td>
            <td class="px-6 py-4">
              <RouterLink
                :to="`/user/${entry.userId}`"
                class="font-semibold text-neon-cyan hover:underline"
              >
                {{ entry.username }}
              </RouterLink>
            </td>
            <td class="px-6 py-4 text-gray-400">
              {{ entry.country || '-' }}
            </td>
            <td class="px-6 py-4 text-right text-gray-300">
              {{ entry.solveCount }}
            </td>
            <td class="px-6 py-4 text-right">
              <span class="font-bold text-neon-cyan">{{ entry.totalPoints }}</span>
            </td>
            <td class="px-6 py-4 text-right">
              <span v-if="entry.firstBloods > 0" class="text-red-500 font-bold">
                {{ entry.firstBloods }}
              </span>
              <span v-else class="text-gray-600">-</span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="scoreboard.length === 0" class="text-center py-20">
        <p class="text-gray-400">No scores yet. Be the first to solve a challenge!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useScoreboardStore } from '@/stores/scoreboard'

const scoreboardStore = useScoreboardStore()

const loading = computed(() => scoreboardStore.loading)
const scoreboard = computed(() => scoreboardStore.scoreboard)

onMounted(() => {
  scoreboardStore.fetchScoreboard()
})
</script>
