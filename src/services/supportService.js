import { constant } from "../const";
import io from "socket.io-client";

const API_BASE_URL = `${constant.backend_url}/support`;
const BACKEND_URL = constant.backend_url.replace("/jokkoapi", "/");
console.log("BACKEND_URL:", BACKEND_URL);

let socket = null;
let isConnected = false;

// Initialize Socket.io
export const initSocket = () => {
  if (!socket) {
    socket = io(BACKEND_URL, {
      auth: {
        token: localStorage.getItem("adminToken"),
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      isConnected = true;
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      isConnected = false;
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      isConnected = false;
    });
  }
  return socket;
};

// Get socket instance
export const getSocket = () => {
  if (!socket) {
    initSocket();
  }
  return socket;
};

// Check if socket is connected
export const isSocketConnected = () => {
  return isConnected && socket && socket.connected;
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    isConnected = false;
  }
};

// Join ticket room
export const joinTicketRoom = (ticketId) => {
  const skt = getSocket();
  if (skt && skt.connected) {
    skt.emit("join_ticket", { ticketId });
    console.log(`Joined ticket room: ${ticketId}`);
  } else {
    console.warn("Socket not connected, cannot join room");
  }
};

// Send message via socket with fallback to REST API
export const sendMessageSocket = async (ticketId, senderId, senderType, message) => {
  const skt = getSocket();
  
  if (skt && skt.connected) {
    try {
      //Create a promise that resolves when message is sent via socket
      return new Promise((resolve) => {
        skt.emit("send_ticket_message", {
          ticketId,
          senderId,
          senderType,
          message,
        });
        console.log("Message emitted via socket");
        
        // Assume socket message was sent successfully after a short delay
        setTimeout(() => {
          resolve({ success: true, method: "socket" });
        }, 100);
      });
    } catch (error) {
      console.error("Socket send error:", error);
      // Fallback to REST API
      return sendMessage(ticketId, message);
    }
  } else {
    console.warn("Socket not connected, using REST API fallback");
    // Fallback to REST API
    return sendMessage(ticketId, message);
  }
};

// Listen for new messages
export const onReceiveMessage = (callback) => {
  const skt = getSocket();
  if (skt) {
    skt.on("receive_ticket_message", callback);
  }
};

// Remove message listener
export const offReceiveMessage = (callback) => {
  const skt = getSocket();
  if (skt) {
    skt.off("receive_ticket_message", callback);
  }
};

// Get all tickets (admin)
export const getAllTickets = async (status = null) => {
  try {
    const token = localStorage.getItem("adminToken");
    let url = `${API_BASE_URL}/ticket/all`;
    
    if (status) {
      url += `?status=${status}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return { success: false, message: error.message };
  }
};

// Get ticket messages
export const getTicketMessages = async (ticketId) => {
  try {
    const token = localStorage.getItem("adminToken");
    const response = await fetch(`${API_BASE_URL}/ticket/messages/${ticketId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("RESP!!!!!!!!!!!!!!!!", response)

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    return { success: false, message: error.message };
  }
};

// Send message to ticket
export const sendMessage = async (ticketId, message) => {
  try {
    const token = localStorage.getItem("adminToken");
    const response = await fetch(`${API_BASE_URL}/ticket/send-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ticketId,
        message,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, message: error.message };
  }
};

// Close ticket
export const closeTicket = async (ticketId) => {
  try {
    const token = localStorage.getItem("adminToken");
    const response = await fetch(`${API_BASE_URL}/ticket/closeTicket`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ticketId,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error closing ticket:", error);
    return { success: false, message: error.message };
  }
};
