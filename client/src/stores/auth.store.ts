import type { IAuth } from '@/models/auth.model'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const auth = ref<IAuth | null>(null)

  return { isAuthenticated, auth }
})
