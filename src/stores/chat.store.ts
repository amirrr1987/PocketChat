import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { storeToRefs } from "pinia";
import { useSocket } from "@/composables/socket.composable";
import { useAuthStore } from "@/stores/auth.store";
import type {
  IConversation,
  IConversationWithOther,
  IMessage,
} from "@/models/chat.model";

export const useChatStore = defineStore("chat", () => {
  const authStore = useAuthStore();
  const { user: authUser } = storeToRefs(authStore);
  const currentUserId = computed(() => authUser.value?.id ?? "");

  const conversation = ref<IConversation | null>(null);
  const conversations = ref<IConversationWithOther[]>([]);
  const messages = ref<IMessage[]>([]);
  const newMessageText = ref("");

  const { socket } = useSocket();

  function setupListeners() {
    socket.on("chat:conversations:list", (list: IConversationWithOther[]) => {
      conversations.value = Array.isArray(list) ? list : [];
    });
    socket.on("chat:conversation", (conv: IConversationWithOther) => {
      if (!conversations.value.some((c) => c.id === conv.id)) {
        conversations.value = [...conversations.value, conv];
      }
      conversation.value = conv;
      socket.emit("chat:messages:list", { conversationId: conv.id });
    });
    socket.on("chat:messages:list", (list: IMessage[]) => {
      messages.value = Array.isArray(list) ? list : [];
    });
    socket.on("chat:message:new", (msg: IMessage) => {
      if (conversation.value?.id === msg.conversationId) {
        messages.value = [...messages.value, msg];
      }
    });
  }

  function offListeners() {
    socket.off("chat:conversations:list");
    socket.off("chat:conversation");
    socket.off("chat:messages:list");
    socket.off("chat:message:new");
  }

  function loadConversations() {
    socket.emit("chat:conversations:list");
  }

  function selectConversation(conv: IConversation | null) {
    conversation.value = conv;
    messages.value = [];
    if (conv) socket.emit("chat:messages:list", { conversationId: conv.id });
  }

  function sendMessage() {
    const conv = conversation.value;
    const text = newMessageText.value.trim();
    if (!conv || !text) return;
    socket.emit("chat:message:send", { conversationId: conv.id, content: text });
    newMessageText.value = "";
  }

  function startConversation(otherUserId: string) {
    socket.emit("chat:conversation:getOrCreate", { otherUserId });
    return null;
  }

  function otherParticipantId(conv: IConversation): string {
    const uid = currentUserId.value;
    return conv.participant1Id === uid ? conv.participant2Id : conv.participant1Id;
  }

  return {
    conversation,
    conversations,
    messages,
    newMessageText,
    currentUserId,
    setupListeners,
    offListeners,
    loadConversations,
    selectConversation,
    sendMessage,
    startConversation,
    otherParticipantId,
  };
});
