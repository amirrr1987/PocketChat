import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSocket } from "./socket.composable";
import { useAuthStore } from "@/stores/auth.store";
import type { MessageResponse } from "@/services/messages.api";

const notificationPermission = ref<NotificationPermission>("default");
const isSupported = ref(false);

export function useNotification() {
  const route = useRoute();
  const router = useRouter();
  const { socket } = useSocket();
  const authStore = useAuthStore();

  // Check if notifications are supported
  function checkSupport() {
    if (typeof window === "undefined") return false;
    isSupported.value = "Notification" in window && "serviceWorker" in navigator;
    if (isSupported.value) {
      notificationPermission.value = Notification.permission;
    }
    return isSupported.value;
  }

  // Request notification permission
  async function requestPermission(): Promise<boolean> {
    if (!checkSupport()) {
      console.warn("Notifications are not supported");
      return false;
    }

    if (notificationPermission.value === "granted") {
      return true;
    }

    if (notificationPermission.value === "denied") {
      console.warn("Notification permission denied");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      notificationPermission.value = permission;
      return permission === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }

  // Show notification
  async function showNotification(
    title: string,
    options?: NotificationOptions
  ): Promise<void> {
    if (!checkSupport() || notificationPermission.value !== "granted") {
      return;
    }

    // Check if service worker is available
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const notificationOptions = {
          badge: "/logo.svg",
          icon: "/logo.svg",
          renotify: true,
          ...options,
        } as NotificationOptions & { renotify?: boolean };
        await registration.showNotification(title, notificationOptions);
        return;
      } catch (error) {
        console.error("Error showing notification via service worker:", error);
        // Fall through to regular notification
      }
    }

    // Fallback to regular notification
    try {
      const notification = new Notification(title, {
        icon: "/logo.svg",
        badge: "/logo.svg",
        ...options,
      });

      // Handle click on regular notification
      notification.onclick = (event) => {
        event.preventDefault();
        const data = (options as { data?: { conversationId?: string; url?: string } })?.data;
        if (data?.conversationId) {
          router.push({ name: "chat", params: { id: data.conversationId } });
        } else if (data?.url) {
          router.push(data.url);
        }
        window.focus();
      };
    } catch (error) {
      console.error("Error showing notification:", error);
    }
  }

  // Show notification for new message
  function showMessageNotification(message: MessageResponse): void {
    const currentUserId = authStore.user?.id;
    
    // Don't show notification for own messages
    if (message.senderId === currentUserId) {
      return;
    }

    // Don't show notification if user is viewing this conversation
    const currentConversationId = route.params.id as string;
    if (currentConversationId === message.conversationId) {
      return;
    }

    // Check if page is visible (user is not on the page)
    if (document.visibilityState === "visible") {
      // User is on the page, but not viewing this conversation
      // Still show notification but maybe with less priority
    }

    // Get sender name from message.sender
    const senderName =
      message.sender?.profile?.displayName ||
      message.sender?.username ||
      "Someone";

    // Truncate message content
    const messagePreview =
      message.content.length > 100
        ? message.content.substring(0, 100) + "..."
        : message.content;

    // Use unique tag for each message to prevent replacement
    showNotification(`${senderName}`, {
      body: messagePreview,
      tag: `message-${message.id}`, // Unique tag per message
      requireInteraction: false,
      silent: false,
      data: {
        conversationId: message.conversationId,
        messageId: message.id,
        url: `/chat/${message.conversationId}`,
      },
    });
  }

  // Setup notification click handler for service worker notifications
  function setupNotificationClickHandler() {
    if (!checkSupport() || typeof window === "undefined") return;

    // Handle service worker notification clicks
    // Note: This will be handled by the service worker itself
    // We just need to ensure the service worker can navigate
    if ("serviceWorker" in navigator) {
      // The service worker will handle notification clicks
      // We can add a message listener here if needed for additional handling
    }
  }

  // Message notification handler
  function handleNewMessage(message: MessageResponse) {
    showMessageNotification(message);
  }

  // Setup message notification listener
  function setupMessageNotifications() {
    if (!checkSupport()) {
      return;
    }

    // Setup click handler
    setupNotificationClickHandler();

    // Request permission on mount
    requestPermission().catch((error) => {
      console.error("Failed to request notification permission:", error);
    });

    // Remove existing listener first to prevent duplicates
    socket.off("message:new", handleNewMessage);
    
    // Listen for new messages
    socket.on("message:new", handleNewMessage);
  }

  // Cleanup message notification listener
  function cleanupMessageNotifications() {
    socket.off("message:new", handleNewMessage);
  }

  return {
    isSupported,
    notificationPermission,
    checkSupport,
    requestPermission,
    showNotification,
    showMessageNotification,
    setupMessageNotifications,
    cleanupMessageNotifications,
  };
}
