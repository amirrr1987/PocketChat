<template>
  <Form @submit="handleSubmit">
    <CellGroup inset>
      <Field
        v-model="email"
        name="email"
        type="email"
        label="Email"
        placeholder="you@example.com"
        :rules="[{ required: true, message: 'Please enter your email' }]"
        autocomplete="email"
      />
      <Field
        v-model="password"
        name="password"
        type="password"
        label="Password"
        placeholder="••••••••"
        :rules="[{ required: true, message: 'Please enter your password' }]"
        autocomplete="current-password"
      />
    </CellGroup>
    <Cell v-if="error" :title="error" />
    <CellGroup inset>
      <Button
        round
        block
        type="primary"
        native-type="submit"
        :loading="loading"
        loading-text="Signing in…"
      >
        Sign in
      </Button>
    </CellGroup>
    <Cell title="Don't have an account?" value="Sign up" is-link :to="{ name: 'register' }">
      <template #title> Don't have an account? </template>
      <template #value> Sign up </template>
    </Cell>
  </Form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Form, Field, CellGroup, Cell, Button } from 'vant'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    authStore.isAuthenticated = true
    authStore.auth = {
      token: 'demo-token',
      user: { id: '1', username: 'Demo User', email: email.value },
    }
    await router.replace({ name: 'chats' })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Sign in failed'
  } finally {
    loading.value = false
  }
}
</script>
