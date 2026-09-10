import { io } from "socket.io-client";

let socket = null;

// Chat rooms the UI currently has open. Room membership lives on the server
// socket, so it is lost on every reconnect, and a join issued before the
// handshake finished never reaches the server at all — either way the thread
// silently stops receiving messages. Keeping the set here lets us re-send the
// joins whenever the connection comes up.
const joinedChats = new Set();

// Callers that want to know a join was refused (so they can show "you no longer
// have access to this conversation" rather than an empty thread).
const joinListeners = new Set();

export const onChatJoinDenied = (fn) => {
  joinListeners.add(fn);
  return () => joinListeners.delete(fn);
};

// The server authorizes chat:join and acks the result. A refusal must drop the
// room from the set: it is replayed on every reconnect, so a chat the user
// cannot access would otherwise be retried forever.
const emitJoin = (chatId) => {
  socket?.emit("chat:join", { chatId }, (ack) => {
    if (ack && ack.ok === false) {
      joinedChats.delete(chatId);
      joinListeners.forEach((fn) => fn(chatId, ack.error));
    }
  });
};

const rejoinChats = () => {
  joinedChats.forEach(emitJoin);
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
  joinListeners.clear();
};

export const joinChat = (chatId) => {
  if (!chatId) return;
  joinedChats.add(chatId);
  if (socket?.connected) emitJoin(chatId);
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
