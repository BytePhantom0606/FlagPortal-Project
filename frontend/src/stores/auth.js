/**
 * ============================================
 * FlagForge - Authentication Store
 * ============================================
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/api/client'
import { useToast } from 'vue-toastification'

const toast = useToast()

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const loading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'ADMIN')

  // Actions
  async function register(credentials) {
    loading.value = true
    try {
      const { data } = await apiClient.post('/auth/register', credentials)
      user.value = data.user
      toast.success('Registration successful! Welcome to FlagForge!')
      return true
    } catch (error) {
      console.error('Registration error:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  async function login(credentials) {
    loading.value = true
    try {
      const { data } = await apiClient.post('/auth/login', credentials)
      user.value = data.user
      toast.success(`Welcome back, ${data.user.username}!`)
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    try {
      await apiClient.post('/auth/logout')
      user.value = null
      toast.info('Logged out successfully')
      return true
    } catch (error) {
      console.error('Logout error:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchCurrentUser() {
    loading.value = true
    try {
      const { data } = await apiClient.get('/auth/me')
      user.value = data.user
      return true
    } catch (error) {
      console.error('Fetch user error:', error)
      user.value = null
      return false
    } finally {
      loading.value = false
    }
  }

  async function changePassword(passwords) {
    loading.value = true
    try {
      await apiClient.post('/auth/change-password', passwords)
      toast.success('Password changed successfully')
      return true
    } catch (error) {
      console.error('Change password error:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    register,
    login,
    logout,
    fetchCurrentUser,
    changePassword,
  }
}, {
  persist: {
    paths: ['user'],
  },
})
