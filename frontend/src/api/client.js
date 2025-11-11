/**
 * ============================================
 * FlagForge - API Client
 * ============================================
 * Axios wrapper with authentication and error handling
 */

import axios from 'axios'
import { useToast } from 'vue-toastification'

const toast = useToast()

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Send cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add CSRF token if available
    const csrfToken = localStorage.getItem('csrfToken')
    if (csrfToken && ['post', 'put', 'delete', 'patch'].includes(config.method)) {
      config.headers['X-CSRF-Token'] = csrfToken
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const { response } = error

    if (response) {
      const { status, data } = response

      // Handle different error types
      if (status === 401) {
        // Unauthorized - clear auth state
        localStorage.removeItem('user')
        localStorage.removeItem('csrfToken')

        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }

        toast.error('Session expired. Please log in again.')
      } else if (status === 403) {
        toast.error(data.error || 'Access denied')
      } else if (status === 429) {
        toast.error('Too many requests. Please try again later.')
      } else if (status >= 500) {
        toast.error('Server error. Please try again later.')
      } else {
        // Other errors
        if (data.error) {
          toast.error(data.error)
        }
      }
    } else {
      // Network error
      toast.error('Network error. Please check your connection.')
    }

    return Promise.reject(error)
  }
)

export default apiClient
