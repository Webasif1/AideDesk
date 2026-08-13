import { io } from "socket.io-client";

let socket = null;

// Chat rooms the UI currently has open. Room membership lives on the server
// socket, so it is lost on every reconnect, and a join issued before the
// handshake finished never reaches the server at all — either way the thread
// silently stops receiving messages. Keeping the set here lets us re-send the
// joins whenever the connection comes up.
const joinedChats = new Set();

const rejoinChats = () => {
  joinedChats.forEach((chatId) => socket?.emit("chat:join", { chatId }));
};

export const getSocket = () => socket;

export const connectSocket = () => {
  // Reuse a socket that exists but is mid-(re)connect too — creating a second
  // one here left the first connected and orphaned.
  if (!socket) {
    const url = import.meta.env.VITE_SOCKET_URL || window.location.origin;

    socket = io(url, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ["websocket", "polling"],
    });
  }

  // Re-attached on every call: the consumer's cleanup does a blanket
  // off("connect"), which would otherwise strip this from a live socket.
  socket.off("connect", rejoinChats);
  socket.on("connect", rejoinChats);

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  joinedChats.clear();
};

export const joinChat = (chatId) => {
  if (!chatId) return;
  joinedChats.add(chatId);
  if (socket?.connected) socket.emit("chat:join", { chatId });
};

export const leaveChat = (chatId) => {
  if (!chatId) return;
  joinedChats.delete(chatId);
  if (socket?.connected) socket.emit("chat:leave", { chatId });
};

export const emitTyping = (chatId, isTyping) => {
  if (socket && socket.connected)
    socket.emit("chat:typing", { chatId, isTyping });
};
