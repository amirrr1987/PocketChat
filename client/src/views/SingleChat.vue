<template>
  <div>
    <NavBar :title="otherName ?? 'Chat'" left-arrow fixed placeholder @click-left="goBack">
      <template #right>
        <Tag plain type="success">Active</Tag>
      </template>
    </NavBar>
    <CellGroup v-if="messages.length > 0" inset>
      <Cell
        v-for="msg in messages"
        :key="msg.id"
        :title="msg.content"
        :label="formatTime(msg.createdAt)"
      />
    </CellGroup>
    <Empty v-if="messages.length === 0 && !loading" description="No messages yet. Say hello!" />
    <Loading v-if="loading" vertical>Loading…</Loading>
    <CellGroup inset>
      <Field v-model="inputText" placeholder="Type a message…" autocomplete="off">
        <template #button>
          <Button size="small" type="primary" :disabled="!inputText.trim()" @click="sendMessage">
            Send
          </Button>
        </template>
      </Field>
    </CellGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NavBar, CellGroup, Cell, Field, Button, Empty, Loading } from 'vant'
import { useAuthStore } from '@/stores/auth.store'
import type { IMessage, IConversation } from '@/models/chat.model'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const conversationId = computed(() => route.params.id as string)

const currentUserId = computed(() => authStore.auth?.user?.id ?? '')
const conversation = ref<IConversation | null>(null)
const messages = ref<IMessage[]>([])
const otherName = ref('')
const loading = ref(false)
const inputText = ref('')

onMounted(() => {
  loadChat()
})

watch(conversationId, () => {
  loadChat()
})

function goBack() {
  router.push({ name: 'chats' })
}

function loadChat() {
  loading.value = true
  otherName.value = 'Alex'
  conversation.value = {
    id: conversationId.value,
    participants: [{ id: '2', name: 'Alex' }],
    updatedAt: new Date().toISOString(),
  }
  messages.value = [
    {
      id: 'm1',
      conversationId: conversationId.value,
      senderId: '2',
      content: 'Hey, how are you?',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'm2',
      conversationId: conversationId.value,
      senderId: currentUserId.value,
      content: 'Doing great, thanks!',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
  ]
  loading.value = false
}

function sendMessage() {
  const text = inputText.value.trim()
  if (!text) return
  const msg: IMessage = {
    id: `m-${Date.now()}`,
    conversationId: conversationId.value,
    senderId: currentUserId.value,
    content: text,
    createdAt: new Date().toISOString(),
  }
  messages.value.push(msg)
  inputText.value = ''
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>
