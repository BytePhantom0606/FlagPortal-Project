/**
 * ============================================
 * FlagForge - Challenges Store
 * ============================================
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/api/client'
import { useToast } from 'vue-toastification'

const toast = useToast()

export const useChallengesStore = defineStore('challenges', () => {
  // State
  const challenges = ref([])
  const currentChallenge = ref(null)
  const loading = ref(false)

  // Getters
  const challengesByCategory = computed(() => {
    const grouped = {}
    challenges.value.forEach((challenge) => {
      if (!grouped[challenge.category]) {
        grouped[challenge.category] = []
      }
      grouped[challenge.category].push(challenge)
    })
    return grouped
  })

  const solvedChallenges = computed(() =>
    challenges.value.filter((c) => c.isSolved)
  )

  const totalPoints = computed(() =>
    solvedChallenges.value.reduce((sum, c) => sum + c.points, 0)
  )

  // Actions
  async function fetchChallenges(ctfId = null) {
    loading.value = true
    try {
      const params = ctfId ? { ctfId } : {}
      const { data } = await apiClient.get('/challenges', { params })
      challenges.value = data.challenges
      return true
    } catch (error) {
      console.error('Fetch challenges error:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchChallenge(id) {
    loading.value = true
    try {
      const { data } = await apiClient.get(`/challenges/${id}`)
      currentChallenge.value = data.challenge
      return true
    } catch (error) {
      console.error('Fetch challenge error:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  async function submitFlag(challengeId, flag) {
    loading.value = true
    try {
      const { data } = await apiClient.post(`/submissions/${challengeId}`, { flag })

      if (data.success) {
        // Update challenge as solved
        const challenge = challenges.value.find((c) => c.id === challengeId)
        if (challenge) {
          challenge.isSolved = true
          challenge.solveCount++
        }

        if (data.isFirstBlood) {
          toast.success('🎉 FIRST BLOOD! You are amazing!', {
            timeout: 5000,
          })
        } else {
          toast.success(`✅ Correct flag! +${data.points} points`)
        }

        return { success: true, isFirstBlood: data.isFirstBlood }
      }
    } catch (error) {
      console.error('Submit flag error:', error)
      if (error.response?.status !== 400) {
        toast.error('Failed to submit flag')
      }
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  return {
    challenges,
    currentChallenge,
    loading,
    challengesByCategory,
    solvedChallenges,
    totalPoints,
    fetchChallenges,
    fetchChallenge,
    submitFlag,
  }
})
