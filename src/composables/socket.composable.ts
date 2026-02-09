import { io } from "socket.io-client";

const SOCKET_PORT = "5050";

function getSocketURL(): string {
  const envUrl = import.meta.env.VITE_SOCKET_URL ?? import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl;
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:${SOCKET_PORT}`;
  }
  return "http://localhost:5050";
}

let socket: ReturnType<typeof io> | null = null;

export const useSocket = () => {
  if (!socket) {
    socket = io(getSocketURL(), {
            autoConnect: true,
            transports: ["websocket", "polling"],
        });
    }
    return { socket };
};

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
