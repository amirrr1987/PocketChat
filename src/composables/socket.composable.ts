import { io, Socket } from "socket.io-client";

const SOCKET_PORT = "5050";
const TOKEN_KEY = "chat_token";

function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function getSocketURL(): string {
  const envUrl =
    import.meta.env.VITE_WS_URL ?? import.meta.env.VITE_SOCKET_URL ?? import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl;
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:${SOCKET_PORT}`;
  }
  return "http://localhost:5050";
}

let socket: ReturnType<typeof io> | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 1000;

function createSocket(): Socket {
  const token = getAuthToken();

  const newSocket = io(getSocketURL(), {
    autoConnect: false,
    transports: ["websocket", "polling"],
    auth: {
      token: token || undefined,
    },
    reconnection: true,
    reconnectionDelay: RECONNECT_DELAY,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
  });

  // Handle reconnection with token refresh
  newSocket.on("connect", () => {
    console.log("Socket connected");
    reconnectAttempts = 0;
    // Update auth token on reconnect
    const currentToken = getAuthToken();
    if (currentToken) {
      newSocket.auth = { token: currentToken };
    }
  });

  newSocket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
    if (reason === "io server disconnect") {
      // Server disconnected, reconnect manually
      const currentToken = getAuthToken();
      if (currentToken) {
        newSocket.auth = { token: currentToken };
        newSocket.connect();
      }
    }
  });

  newSocket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
    reconnectAttempts++;
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error("Max reconnection attempts reached");
    }
  });

  return newSocket;
}

export const useSocket = () => {
  if (!socket) {
    socket = createSocket();
    // Connect if we have a token
    const token = getAuthToken();
    if (token) {
      socket.connect();
    }
  } else if (!socket.connected) {
    // Reconnect if disconnected
    const token = getAuthToken();
    if (token) {
      socket.auth = { token };
      socket.connect();
    }
  }
  return { socket };
};

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/** Wait for socket to be connected, with timeout. Resolves when connected. */
export function waitForSocketConnect(timeoutMs = 8000): Promise<void> {
  const { socket } = useSocket();
  if (socket.connected) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onErr);
      reject(new Error("Socket connection timeout"));
    }, timeoutMs);
    const onConnect = () => {
      clearTimeout(t);
      socket.off("connect_error", onErr);
      resolve();
    };
    const onErr = (err: Error) => {
      clearTimeout(t);
      socket.off("connect", onConnect);
      reject(err);
    };
    socket.once("connect", onConnect);
    socket.once("connect_error", onErr);
  });
}
