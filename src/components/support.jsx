import { useState, useEffect, useRef } from "react";
import { Row, Col, List, Avatar, Input, Button, Segmented, Spin, message as antMessage } from "antd";
import { SendOutlined } from "@ant-design/icons";
import ReusableCard from "../reuseable/Card";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Dropdown, Menu } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import {
  getAllTickets,
  getTicketMessages,
  sendMessageSocket,
  closeTicket,
  initSocket,
  disconnectSocket,
  joinTicketRoom,
  onReceiveMessage,
  offReceiveMessage,
  isSocketConnected,
} from "../services/supportService";

const SupportPage = () => {
    const { Search } = Input;

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [status, setStatus] = useState("open");
    const [chatList, setChatList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [messageLoading, setMessageLoading] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [user, setUser] = useState(null);
    const [socketConnected, setSocketConnected] = useState(false);
    
    const messagesEndRef = useRef(null);
    const messageHandlerRef = useRef(null);


    // Fetch tickets when status changes
    useEffect(() => {
        setSelectedChat(null);
        fetchTickets(status);
    }, [status]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Fetch tickets by status
    const fetchTickets = async (filterStatus) => {
        setLoading(true);
        try {
            const response = await getAllTickets(filterStatus);
            if (response.success) {
                // Format tickets for display
                const formattedTickets = response.result.map(ticket => ({
                    _id: ticket._id,
                    id: ticket._id,
                    name: ticket.userId?.firstname || "Unknown",
                    message: ticket.subject,
                    time: new Date(ticket.createdAt).toLocaleDateString(),
                    status: String(ticket.status || "open").toLowerCase(),
                    subject: ticket.subject,
                    userId: ticket.userId?._id,
                }));
                setChatList(formattedTickets);
            } else {
                antMessage.error(response.message || "Failed to fetch tickets");
            }
        } catch (error) {
            console.error("Error fetching tickets:", error);
            antMessage.error("Error fetching tickets");
        } finally {
            setLoading(false);
        }
    };

    // Fetch messages for selected chat
    const fetchMessages = async (ticketId) => {
        setMessageLoading(true);
        try {
            const response = await getTicketMessages(ticketId);
            if (response.success) {
                const formattedMessages = response.messages.map(msg => ({
                    text: msg.message,
                    sender: msg.senderType,
                    senderName: msg.senderId?.fullName || msg.senderId?.firstname || "Unknown",
                    timestamp: new Date(msg.createdAt).toLocaleString(),
                    isSubject: msg.isSubject || false,
                }));
                setMessages(formattedMessages);
            } else {
                antMessage.error("Failed to fetch messages");
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
            antMessage.error("Error fetching messages");
        } finally {
            setMessageLoading(false);
        }
    };

    // Handle close ticket
    const handleCloseTicket = async (id) => {
        try {
            const response = await closeTicket(id);
            if (response.success) {
                antMessage.success("Ticket closed successfully");
                // Update local state
                setChatList(prevList =>
                    prevList.map(chat =>
                        chat.id === id ? { ...chat, status: "closed" } : chat
                    )
                );
                // If current chat closed → go back
                if (selectedChat?.id === id) {
                    setSelectedChat(null);
                }
                // Refetch tickets
                fetchTickets(status);
            } else {
                antMessage.error(response.message || "Failed to close ticket");
            }
        } catch (error) {
            console.error("Error closing ticket:", error);
            antMessage.error("Error closing ticket");
        }
    };

    // Handle send message via Socket
    const handleSend = async () => {
        if (!message.trim() || !selectedChat) return;

        // Ensure user has a valid _id
        if (!user || !user._id) {
            antMessage.error("User ID not found. Please refresh the page.");
            console.error("User object:", user);
            return;
        }

        const messageContent = message;
        setMessage("");

        try {
            const senderId = user._id;
            const senderType = "admin";
            
            console.log("Sending message with:", {
                ticketId: selectedChat._id,
                senderId,
                senderType,
                message: messageContent
            });

            // Send via socket or fallback to REST API
            const result = await sendMessageSocket(
                selectedChat._id,
                senderId,
                senderType,
                messageContent
            );

            console.log("Send result:", result);

            if (result?.success) {
                // Optimistically add to local state
                const newMessage = {
                    text: messageContent,
                    sender: "admin",
                    senderName: "You",
                    timestamp: new Date().toLocaleString(),
                    isSubject: false,
                };
                setMessages([...messages, newMessage]);
                antMessage.success("Message sent");
            } else {
                antMessage.error(result?.message || "Failed to send message");
                setMessage(messageContent); // Restore message if failed
            }
        } catch (error) {
            console.error("Error sending message:", error);
            antMessage.error("Error sending message: " + error.message);
            setMessage(messageContent); // Restore message if failed
        }
    };

    const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

    // Initialize Socket on mount
    useEffect(() => {
        const socket = initSocket();
        
        // Monitor socket connection status
        const checkConnection = () => {
            setSocketConnected(isSocketConnected());
        };

        // Initial check
        checkConnection();

        // Check every 1 second
        const interval = setInterval(checkConnection, 1000);

        // Listen for connection events
        socket.on("connect", () => {
            console.log("Socket connected in component");
            setSocketConnected(true);
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected in component");
            setSocketConnected(false);
        });
        
        // Get user data from localStorage - try multiple sources
        let userData = null;
        let userId = null;
        
        // Try to get from various localStorage keys
        const adminData = localStorage.getItem("admin");
        const userData_key = localStorage.getItem("userData");
        const userObj = localStorage.getItem("user");
        const directUserId = localStorage.getItem("userId");
        const authUser = localStorage.getItem("authUser");
        console.log("Attempting to load user data from localStorage...", adminData);
        console.log("Available localStorage keys:", {
            admin: adminData ? "exists" : "missing",
            userData: userData_key ? "exists" : "missing",
            user: userObj ? "exists" : "missing",
            userId: directUserId ? "exists" : "missing",
            authUser: authUser ? "exists" : "missing"
        });



        // Try parsing each one
        if (adminData) {
            try {
                // userData = adminData;
                userId = adminData
            } catch (e) {
                console.error("Error parsing admin data:", e);
            }
        }
        
        if (!userId && userData_key) {
            try {
                userData = JSON.parse(userData_key);
                userId = userData._id || userData.id || userData.userId;
                console.log("User loaded from 'userData':", userData);
            } catch (e) {
                console.error("Error parsing userData:", e);
            }
        }

        if (!userId && userObj) {
            try {
                userData = JSON.parse(userObj);
                userId = userData._id || userData.id || userData.userId;
                console.log("User loaded from 'user':", userData);
            } catch (e) {
                console.error("Error parsing user:", e);
            }
        }

        if (!userId && authUser) {
            try {
                userData = JSON.parse(authUser);
                userId = userData._id || userData.id || userData.userId;
                console.log("User loaded from 'authUser':", userData);
            } catch (e) {
                console.error("Error parsing authUser:", e);
            }
        }

        if (!userId && directUserId) {
            userId = directUserId;
            userData = { _id: userId };
            console.log("User ID loaded from directUserId:", userId);
        }

        if (userId) {
            setUser({ 
                _id: userId,
                ...userData 
            });
            console.log("✓ Final user object set with ID:", userId);
        } else {
            console.warn("✗ No valid user ID found in localStorage");
            console.log("Checked admin data:", adminData);
            
            // Try to extract from parsed adminData if it exists
            if (adminData) {
                try {
                    const parsed = JSON.parse(adminData);
                    console.log("Parsed admin object:", parsed);
                } catch (e) {
                    console.log("Admin data is not valid JSON");
                }
            }
            
            // Don't set user - wait for proper authentication
            antMessage.error("Admin ID not found. Please ensure you're properly logged in.");
        }

        // Fetch initial tickets
        fetchTickets(status);

        // Cleanup on unmount
        return () => {
            clearInterval(interval);
            socket.off("connect");
            socket.off("disconnect");
        };
    }, []);

    // Join ticket room and listen for messages when chat is selected
    useEffect(() => {
        if (selectedChat) {
            setMessages([]);
            fetchMessages(selectedChat._id);
            joinTicketRoom(selectedChat._id);

            // Set up message handler
            const handleNewMessage = (newMsg) => {
                console.log("Received new message:", newMsg);
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        text: newMsg.message,
                        sender: newMsg.senderType,
                        senderName: newMsg.senderId?.fullName || newMsg.senderId?.firstname || "Unknown",
                        timestamp: new Date(newMsg.createdAt).toLocaleString(),
                        isSubject: newMsg.isSubject || false,
                    },
                ]);
            };

            messageHandlerRef.current = handleNewMessage;
            onReceiveMessage(handleNewMessage);

            // Cleanup
            return () => {
                if (messageHandlerRef.current) {
                    offReceiveMessage(messageHandlerRef.current);
                }
            };
        }
    }, [selectedChat]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 900);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Filter chats based on status (already done via fetchTickets)
    const filteredChats = chatList.filter(chat =>
        String(chat.status || "").toLowerCase() === String(status || "").toLowerCase()
    );

    return (
        <Row gutter={16} style={{ height: "100vh" }}>

            {/* Chat Window */}
            {(!isMobile || selectedChat) && (
                <Col span={isMobile ? 24 : 14} style={{ display: "flex" }}>
                    <ReusableCard
                        title={
                            selectedChat ? (
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

                                    {isMobile && (
                                        <Button
                                            type="text"
                                            icon={<ArrowLeftOutlined style={{color:"#fff"}}/>}
                                            onClick={() => setSelectedChat(null)}
                                        />
                                    )}

                                    <Avatar>{selectedChat.name[0]}</Avatar>
                                    <div>
                                        <span>{selectedChat.name}</span>
                                        <div style={{ fontSize: 12, color: "#aaa" }}>{selectedChat.subject}</div>
                                    </div>

                                </div>
                            ) : "Support Chat"
                        }
                        className="w-full"
                    >

                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                height: "80vh"
                            }}
                        >

                            {/* Messages */}
                            <Spin spinning={messageLoading}>
                                <div
                                    style={{
                                        flex: 1,
                                        overflowY: "auto",
                                        paddingRight: 10
                                    }}
                                >
                                    {!selectedChat ? (
                                        <div style={{ color: "#aaa", textAlign: "center", display:"flex",justifyContent:"center",alignItems:"center",minHeight:"80vh" }}>
                                            <div style={{ backgroundColor: "#5E5E5E33", color: "white", flex: 1,minHeight:"100px",borderRadius:"20px" }} 
                                            className="display-3 text-lg"
                                            >
                                            Select a chat to start messaging
                                            </div>
                                        </div>
                                    ) : messages.length > 0 ? (
                                        messages.map((msg, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                    display: "flex",
                                                    justifyContent: msg.sender === "admin" ? "flex-end" : "flex-start",
                                                    marginBottom: 10
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        background: msg.isSubject
                                                            ? "#f0f0f0"
                                                            : msg.sender === "admin"
                                                                ? "#C9F07B"
                                                                : "#444",
                                                        color: msg.isSubject
                                                            ? "#666"
                                                            : msg.sender === "admin"
                                                                ? "#000"
                                                                : "#fff",
                                                        padding: "8px 12px",
                                                        borderRadius: 8,
                                                        maxWidth: "60%",
                                                        border: msg.isSubject ? "1px solid #ddd" : "none",
                                                        fontStyle: msg.isSubject ? "italic" : "normal"
                                                    }}
                                                >
                                                    {msg.isSubject && (
                                                        <div style={{ fontSize: 11, marginBottom: 4, fontWeight: "bold" }}>
                                                            TICKET SUBJECT
                                                        </div>
                                                    )}
                                                    <div>{msg.text}</div>
                                                    <div style={{ fontSize: 10, marginTop: 4, opacity: 0.7 }}>
                                                        {msg.timestamp}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ color: "#aaa", textAlign: "center", marginTop: 20 }}>
                                            No messages yet
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />

                                </div>
                            </Spin>

                            {/* Chat Input */}
                            {selectedChat && selectedChat.status === "open" && (
                                <div style={{ display: "flex", flexDirection: "column", marginTop: 10, gap: 8 }}>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        <Input
                                            placeholder="Message..."
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            onPressEnter={handleSend}
                                            disabled={!socketConnected}
                                        />

                                        <Button
                                            type="primary"
                                            icon={<SendOutlined />}
                                            onClick={handleSend}
                                            disabled={!socketConnected || !message.trim()}
                                            style={{ marginLeft: 8, background: "#C9F07B", color: "#000" }}
                                        />
                                    </div>
                                    {!socketConnected && (
                                        <div style={{ fontSize: 12, color: "#ff7875" }}>
                                            ⚠️ Socket disconnected. Retrying connection...
                                        </div>
                                    )}
                                    {socketConnected && (
                                        <div style={{ fontSize: 12, color: "#b7eb8f" }}>
                                            ✓ Connected
                                        </div>
                                    )}
                                </div>
                            )}
                            {selectedChat && selectedChat.status === "closed" && (
                                <div style={{ color: "#aaa", textAlign: "center", marginTop: 10 }}>
                                    This ticket is closed
                                </div>
                            )}

                        </div>
                    </ReusableCard>
                </Col>
            )}

            {/* Chat List */}
            {(!isMobile || !selectedChat) && (
                <Col span={isMobile ? 24 : 10} style={{ display: "flex" }}>
                    <ReusableCard
                        title="Chats"
                        extra={
                            <Segmented
                                options={[
                                    { label: "Opened", value: "open" },
                                    { label: "Closed", value: "closed" }
                                ]}
                                value={status}
                                onChange={setStatus}
                                style={{
                                    background: "#15202b",
                                    border:"1px solid #C9F07B",
                                    padding:"5px 12px",
                                    borderRadius: 8,
                                    color:"#fff"
                                }}
                                className="support-segment"
                            />
                        }
                    >

                        <Search
                            placeholder="Search..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            style={{ marginBottom: 16 }}
                            className="modal-search"
                        />

                        <Spin spinning={loading}>
                            <List
                                itemLayout="horizontal"
                                dataSource={filteredChats.filter(chat =>
                                    chat.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                                    chat.subject.toLowerCase().includes(searchValue.toLowerCase())
                                )}
                                className="support-meta"
                                locale={{ emptyText: "No tickets found" }}

                                renderItem={(item) => (
                                    <List.Item
                                        onClick={() => setSelectedChat(item)}
                                        style={{
                                            background: "transparent",
                                            marginBottom: 10,
                                            padding: "10px 12px",
                                            borderRadius: 8,
                                            cursor: "pointer",
                                            border: selectedChat?.id === item.id ? "1px solid #C9F07B" : "1px solid #333",
                                            boxShadow: "0px 0px 10px 0px rgba(214, 214, 214, 0.63)",
                                            transition: "all 0.3s ease-in-out",
                                        }}
                                        className="support-list-item"
                                    >
                                        <List.Item.Meta
                                            avatar={<Avatar>{item.name[0]}</Avatar>}
                                            title={<span style={{ color: "white" }}>{item.name}</span>}
                                            description={<span style={{ color: "white" }}>{item.subject}</span>}
                                        />
                                        <div style={{ display: "flex", alignItems: "center", gap: 10,flexDirection:"column" }}>
                                            

                                            {/* 3 DOT MENU */}
                                            {item.status !== "closed" && (
                                                <Dropdown
                                                    trigger={["click"]}
                                                    menu={{
                                                        items: [
                                                            {
                                                                key: "close",
                                                                label: (
                                                                    <span style={{ color: "red" }}>
                                                                        Close Ticket
                                                                    </span>
                                                                ),
                                                                onClick: (e) => {
                                                                    e.domEvent.stopPropagation();
                                                                    handleCloseTicket(item.id);
                                                                }
                                                            }
                                                        ]
                                                    }}
                                                >
                                                    <MoreOutlined
                                                        onClick={(e) => e.stopPropagation()}
                                                        style={{ color: "#fff", fontSize: 18 }}
                                                    />
                                                </Dropdown>
                                            )}

                                            <span style={{ color: "#fff", fontSize: 12 }}>
                                                {item.time}
                                            </span>
                                        </div>
                                    </List.Item>
                                )}
                            />
                        </Spin>

                    </ReusableCard>
                </Col>
            )}

        </Row>
    );
};

export default SupportPage;