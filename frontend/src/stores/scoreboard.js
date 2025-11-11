/**
 * ============================================
 * FlagForge - Scoreboard Store
 * ============================================
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import apiClient from '@/api/client'

export const useScoreboardStore = defineStore('scoreboard', () => {
  // State
  const scoreboard = ref([])
  const loading = ref(false)

  // Actions
  async function fetchScoreboard(ctfId = null, limit = 100) {
    loading.value = true
    try {
      const params = { limit }
      if (ctfId) params.ctfId = ctfId

      const { data } = await apiClient.get('/scoreboard', { params })
      scoreboard.value = data.scoreboard
      return true
    } catch (error) {
      console.error('Fetch scoreboard error:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    scoreboard,
    loading,
    fetchScoreboard,
  }
})
