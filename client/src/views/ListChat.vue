<template>
  <div>
    <CellGroup :title="headerTitle">
      <Cell
        v-for="conv in conversations"
        :key="conv.id"
        :title="otherParticipant(conv)?.name ?? 'Unknown'"
        :value="cellValue(conv)"
        :label="conv.lastMessage?.content ?? 'No messages yet'"
        is-link
        :to="{ name: 'chat', params: { id: conv.id } }"
      >
        <template #icon>
          <Tag plain type="primary" round>{{ avatarInitial(conv) }}</Tag>
        </template>
      </Cell>
    </CellGroup>
    <Empty
      v-if="conversations.length === 0 && !loading"
      description="No conversations yet. Start a chat from Contacts."
    />
    <Loading v-if="loading" vertical>Loading…</Loading>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { CellGroup, Cell, Tag, Empty, Loading } from 'vant'
import { useAuthStore } from '@/stores/auth.store'
import type { IConversation, IUserRef } from '@/models/chat.model'

const authStore = useAuthStore()
const headerTitle = 'Chats — Your conversations'
const loading = ref(false)
const conversations = ref<IConversation[]>([])

onMounted(() => {
  loading.value = true
  conversations.value = [
    {
      id: '1',
      participants: [{ id: '2', name: 'Alex' }],
      lastMessage: {
        id: 'm1',
        conversationId: '1',
        senderId: '2',
        content: 'Hey, how are you?',
        createdAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
      unreadCount: 1,
    },
    {
      id: '2',
      participants: [{ id: '3', name: 'Jordan' }],
      lastMessage: {
        id: 'm2',
        conversationId: '2',
        senderId: '1',
        content: 'See you tomorrow!',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      unreadCount: 0,
    },
  ]
  loading.value = false
})

function otherParticipant(conv: IConversation): IUserRef | undefined {
  const me = authStore.auth?.user?.id
  return conv.participants.find((p) => p.id !== me)
}

function avatarInitial(conv: IConversation): string {
  const other = otherParticipant(conv)
  if (!other?.name) return '?'
  const parts = other.name.trim().split(/\s+/)
  if (parts.length >= 2) {
    const a = parts[0]?.[0] ?? ''
    const b = parts[parts.length - 1]?.[0] ?? ''
    return (a + b).toUpperCase()
  }
  return other.name.slice(0, 2).toUpperCase()
}

function cellValue(conv: IConversation): string {
  const time = formatTime(conv.updatedAt)
  const unread = conv.unreadCount ?? 0
  return unread > 0 ? `${time} · ${unread}` : time
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (diff < 604800000) return d.toLocaleDateString([], { weekday: 'short' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}
</script>
