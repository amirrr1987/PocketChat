import { ref } from "vue";
import { useSocket } from "./socket.composable";

interface TypingUser {
  userId: string;
  username: string;
}

interface TimerControl {
  stop: () => void;
}

const typingUsers = ref<Map<string, Set<TypingUser>>>(new Map());
const typingTimers = ref<Map<string, TimerControl>>(new Map());

export function useTypingIndicator() {
  const { socket } = useSocket();

  function startTyping(conversationId: string) {
    socket.emit("typing:start", { conversationId });
  }

  function stopTyping(conversationId: string) {
    socket.emit("typing:stop", { conversationId });
  }

  function getTypingUsers(conversationId: string): TypingUser[] {
    const users = typingUsers.value.get(conversationId);
    return users ? Array.from(users) : [];
  }

  function setupTypingListeners() {
    socket.on("typing:start", (data: { userId: string; username: string; conversationId: string }) => {
      const { userId, username, conversationId } = data;
      
      if (!typingUsers.value.has(conversationId)) {
        typingUsers.value.set(conversationId, new Set());
      }
      
      const users = typingUsers.value.get(conversationId)!;
      
      // Remove existing user with same userId if exists (to prevent duplicates)
      const existingUser = Array.from(users).find(u => u.userId === userId);
      if (existingUser) {
        users.delete(existingUser);
      }
      
      // Add user (will be unique now)
      users.add({ userId, username });

      // Auto-remove after 3 seconds if no stop event
      const timerKey = `${conversationId}:${userId}`;
      
      // Clear existing timer if any
      const existingTimer = typingTimers.value.get(timerKey);
      if (existingTimer) {
        existingTimer.stop();
      }

      // Create new timeout
      const timeoutId = setTimeout(() => {
        const userToDelete = Array.from(users).find(u => u.userId === userId);
        if (userToDelete) {
          users.delete(userToDelete);
        }
        
        if (users.size === 0) {
          typingUsers.value.delete(conversationId);
        }
        typingTimers.value.delete(timerKey);
      }, 3000);

      typingTimers.value.set(timerKey, {
        stop: () => clearTimeout(timeoutId),
      });
    });

    socket.on("typing:stop", (data: { userId: string; conversationId: string }) => {
      const { userId, conversationId } = data;
      
      const users = typingUsers.value.get(conversationId);
      if (users) {
        // Remove user from typing set
        const userToRemove = Array.from(users).find(u => u.userId === userId);
        if (userToRemove) {
          users.delete(userToRemove);
        }
        
        if (users.size === 0) {
          typingUsers.value.delete(conversationId);
        }
      }

      // Clear timer
      const timerKey = `${conversationId}:${userId}`;
      const timer = typingTimers.value.get(timerKey);
      if (timer) {
        timer.stop();
        typingTimers.value.delete(timerKey);
      }
    });
  }

  function cleanupTypingListeners() {
    socket.off("typing:start");
    socket.off("typing:stop");
    typingTimers.value.forEach(timer => timer.stop());
    typingTimers.value.clear();
    typingUsers.value.clear();
  }

  return {
    startTyping,
    stopTyping,
    getTypingUsers,
    setupTypingListeners,
    cleanupTypingListeners,
  };
}
