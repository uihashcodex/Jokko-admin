import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Row, Col, List, Avatar, Input, Button, Segmented, Spin, Modal, Select, DatePicker, message as antMessage } from "antd";
import { FilterOutlined, SendOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import ReusableCard from "../reuseable/Card";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Dropdown } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import {
    getAllTickets,
    getTicketMessages,
    sendMessageSocket,
    closeTicket,
    deleteSupportTicket,
    initSocket,
    joinTicketRoom,
    onReceiveMessage,
    offReceiveMessage,
    isSocketConnected,
} from "../services/supportService";
import ReusableModal from "../reuseable/ReusableModal";
import ExportButton from "../reuseable/ExportButton";

/** Socket sends `{ success, message: subDoc }` where subDoc has string field `message` (body text). */
function normalizeChatLine(raw) {
    if (raw == null) {
        return { text: "", sender: "user", senderName: "Unknown", timestamp: "", isSubject: false };
    }
    if (typeof raw === "string") {
        return {
            text: raw,
            sender: "user",
            senderName: "User",
            timestamp: new Date().toLocaleString(),
            isSubject: false,
        };
    }
    const body = typeof raw.message === "string" ? raw.message : "";
    const sender = raw.senderType === "admin" ? "admin" : "user";
    const senderName =
        sender === "admin"
            ? "Admin"
            : raw.senderId?.fullName || raw.senderId?.firstname || "User";
    const id = raw._id != null ? String(raw._id) : undefined;
    return {
        id,
        text: body,
        sender,
        senderName,
        timestamp: raw.createdAt ? new Date(raw.createdAt).toLocaleString() : new Date().toLocaleString(),
        isSubject: false,
    };
}

const SupportPage = () => {
    const { Search } = Input;
    const { RangePicker } = DatePicker;

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [status, setStatus] = useState("open");
    const [filterOpen, setFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        keyword: "",
        dateRange: [],
        category: "all",
        sortBy: "newest",
    });
    const [chatList, setChatList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [messageLoading, setMessageLoading] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [user, setUser] = useState(null);
    const [socketConnected, setSocketConnected] = useState(false);
    const [ticketDeleteOpen, setTicketDeleteOpen] = useState(false);
    const [pendingDeleteTicket, setPendingDeleteTicket] = useState(null);
    const [deleteTicketLoading, setDeleteTicketLoading] = useState(false);

    const messagesEndRef = useRef(null);
    const messageHandlerRef = useRef(null);



    // const [chatList, setChatList] = useState([
    //     {
    //         id: 1,
    //         name: "Chandravadan Raut",
    //         message: "Test",
    //         time: "1mon ago",
    //         status: "open"
    //     },
    //     {
    //         id: 1,
    //         name: "Chandravadan Raut",
    //         message: "Test",
    //         time: "1mon ago",
    //         status: "open"
    //     },
    //     {
    //         id: 1,
    //         name: "Chandravadan Raut",
    //         message: "Test",
    //         time: "1mon ago",
    //         status: "open"
    //     },
    //     {
    //         id: 1,
    //         name: "Chandravadan Raut",
    //         message: "Test",
    //         time: "1mon ago",
    //         status: "open"
    //     },
    //     {
    //         id: 1,
    //         name: "Chandravadan Raut",
    //         message: "Test",
    //         time: "1mon ago",
    //         status: "open"
    //     },
    //     {
    //         id: 1,
    //         name: "Chandravadan Raut",
    //         message: "Test",
    //         time: "1mon ago",
    //         status: "open"
    //     },
    //     {
    //         id: 1,
    //         name: "Chandravadan Raut",
    //         message: "Test",
    //         time: "1mon ago",
    //         status: "open"
    //     },
    //     {
    //         id: 1,
    //         name: "Chandravadan Raut",
    //         message: "Test",
    //         time: "1mon ago",
    //         status: "open"
    //     },
    //     {
    //         id: 1,
    //         name: "Chandravadan Raut",
    //         message: "Test",
    //         time: "1mon ago",
    //         status: "open"
    //     },
    //     {
    //         id: 1,
    //         name: "Chandravadan Raut",
    //         message: "Test",
    //         time: "1mon ago",
    //         status: "open"
    //     },
    //     {
    //         id: 1,
    //         name: "Chandravadan Raut",
    //         message: "Test",
    //         time: "1mon ago",
    //         status: "open"
    //     },
    //     {
    //         id: 1,
    //         name: "Chandravadan Raut",
    //         message: "Test",
    //         time: "1mon ago",
    //         status: "open"
    //     },
    //     {
    //         id: 1,
    //         name: "Chandravadan Raut",
    //         message: "Test",
    //         time: "1mon ago",
    //         status: "open"
    //     },
    //     {
    //         id: 1,
    //         name: "Chandravadan Raut",
    //         message: "Test",
    //         time: "1mon ago",
    //         status: "open"
    //     },

    //     {
    //         id: 2,
    //         name: "Ramesh",
    //         message: "test",
    //         time: "3mon ago",
    //         status: "closed"
    //     },
    //     {
    //         id: 3,
    //         name: "Ramesh",
    //         message: "test7",
    //         time: "3mon ago",
    //         status: "open"
    //     }
    // ]);


    const categoryOptions = [
        { label: "All Categories", value: "all" },
        { label: "General", value: "general" },
        { label: "Wallet Issue", value: "wallet_issue" },
        { label: "Buy Crypto", value: "buy_crypto" },

        { label: "Sell Crypto", value: "sell_crypto" },
        { label: "Login Issue", value: "login_issue" },
        { label: "Deposit Issue", value: "deposit_issue" },
        { label: "Withdrawal Issue", value: "withdrawal_issue" },

        { label: "Transaction Failed", value: "transaction_failed" },
        { label: "Payment Issue", value: "payment_issue" },
        { label: "Security Issue", value: "security_issue" },



    ];

    const activeCategory = filters.category === "all" ? null : filters.category;

    // Fetch tickets by status
    const fetchTickets = useCallback(async (filterStatus, filterCategory = null) => {
        setLoading(true);
        try {
            const response = await getAllTickets(filterStatus, filterCategory);
            if (response.success) {
                const raw = response.result || [];
                const byId = new Map();
                raw.forEach((ticket) => {
                    if (ticket?._id && !byId.has(String(ticket._id))) {
                        byId.set(String(ticket._id), ticket);
                    }
                });
                const formattedTickets = Array.from(byId.values()).map((ticket) => ({
                    _id: ticket._id,
                    id: ticket._id,
                    name: ticket.userId?.firstname || "Unknown",
                    message: ticket.subject,
                    time: new Date(ticket.createdAt).toLocaleDateString(),
                    createdAtRaw: ticket.createdAt,
                    status: String(ticket.status || "open").toLowerCase(),
                    category: ticket.category || "-",
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
    }, []);

    // Fetch tickets when status or category changes
    useEffect(() => {
        setSelectedChat(null);
        fetchTickets(status === "all" ? null : status, activeCategory);
    }, [status, activeCategory, fetchTickets]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const supportExportColumns = [
        { title: "User Name", dataIndex: "name" },
        { title: "Subject", dataIndex: "subject" },
        { title: "Status", dataIndex: "status" },
        { title: "Category", dataIndex: "category" },
        { title: "Created At", dataIndex: "time" },
    ];

    const getSupportTicketsForExport = async () => {
        const response = await getAllTickets(status, activeCategory);
        if (!response.success) return [];

        const raw = response.result || [];
        const byId = new Map();
        raw.forEach((ticket) => {
            if (ticket?._id && !byId.has(String(ticket._id))) {
                byId.set(String(ticket._id), ticket);
            }
        });

        return Array.from(byId.values()).map((ticket) => ({
            _id: ticket._id,
            id: ticket._id,
            name: ticket.userId?.firstname || "Unknown",
            subject: ticket.subject,
            status: String(ticket.status || "open").toLowerCase(),
            category: ticket.category || "-",
            time: ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : "-",
        }));
    };

    // Fetch messages for selected chat
    const fetchMessages = async (ticketId) => {
        setMessageLoading(true);
        try {
            const response = await getTicketMessages(ticketId);
            if (response.success) {
                const formattedMessages = (response.messages || []).map((msg) => ({
                    ...normalizeChatLine(msg),
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
                fetchTickets(status === "all" ? null : status, activeCategory);
            } else {
                antMessage.error(response.message || "Failed to close ticket");
            }
        } catch (error) {
            console.error("Error closing ticket:", error);
            antMessage.error("Error closing ticket");
        }
    };

    const openDeleteTicketModal = (item) => {
        setPendingDeleteTicket(item);
        setTicketDeleteOpen(true);
    };

    const confirmDeleteTicket = async () => {
        if (!pendingDeleteTicket?.id) {
            setTicketDeleteOpen(false);
            return;
        }
        const id = String(pendingDeleteTicket.id);
        setDeleteTicketLoading(true);
        try {
            const response = await deleteSupportTicket(id);
            if (response?.success) {
                antMessage.success(response.message || "Ticket deleted");
                if (selectedChat?.id === id || String(selectedChat?._id) === id) {
                    setSelectedChat(null);
                    setMessages([]);
                }
                setTicketDeleteOpen(false);
                setPendingDeleteTicket(null);
                fetchTickets(status === "all" ? null : status, activeCategory);
            } else {
                antMessage.error(response?.message || "Failed to delete ticket");
            }
        } catch (error) {
            console.error("Error deleting ticket:", error);
            antMessage.error("Error deleting ticket");
        } finally {
            setDeleteTicketLoading(false);
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
                // Socket path: do not append here — server emits `receive_ticket_message` (avoids duplicate).
                // REST fallback: no socket echo, append the saved subdocument once.
                if (result.method !== "socket" && result.data) {
                    setMessages((prev) => {
                        const line = { ...normalizeChatLine(result.data), isSubject: false };
                        const mid = line.id;
                        if (mid && prev.some((m) => m.id === mid)) return prev;
                        return [...prev, line];
                    });
                }
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
            const handleNewMessage = (payload) => {
                console.log("Received new message:", payload);
                const sub = payload?.message != null ? payload.message : payload;
                setMessages((prev) => {
                    const line = normalizeChatLine(sub);
                    if (line.id && prev.some((m) => m.id === line.id)) {
                        return prev;
                    }
                    return [...prev, line];
                });
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

    const listSearch = filters.keyword || searchValue;

    const dateBounds = useMemo(() => {
        const startOfDay = (date) => {
            const next = new Date(date);
            next.setHours(0, 0, 0, 0);
            return next;
        };
        const endOfDay = (date) => {
            const next = new Date(date);
            next.setHours(23, 59, 59, 999);
            return next;
        };

        const dates = chatList
            .map((chat) => chat.createdAtRaw)
            .filter(Boolean)
            .map((value) => new Date(value))
            .filter((date) => !Number.isNaN(date.getTime()))
            .map(startOfDay);

        const today = endOfDay(new Date());

        if (!dates.length) {
            return {
                minDate: null,
                maxDate: today,
                minPickerDate: undefined,
                maxPickerDate: dayjs(today),
            };
        }

        const minDate = new Date(Math.min(...dates.map((date) => date.getTime())));

        return {
            minDate,
            maxDate: today,
            minPickerDate: dayjs(minDate),
            maxPickerDate: dayjs(today),
        };
    }, [chatList]);

    const disabledDate = (current) => {
        if (!current) return false;

        const currentDate = current.toDate();
        const isBeforeAvailableData =
            dateBounds.minDate && currentDate < dateBounds.minDate;
        const isAfterToday = currentDate > dateBounds.maxDate;

        return isBeforeAvailableData || isAfterToday;
    };

    const filteredChats = chatList
        .filter(chat => {
            const matchesStatus =
                status === "all" ||
                String(chat.status || "").toLowerCase() === String(status || "").toLowerCase();

            const search = listSearch.toLowerCase();
            const matchesSearch =
                !search ||
                chat.name.toLowerCase().includes(search) ||
                (chat.subject || chat.message || "").toLowerCase().includes(search);

            const createdAt = chat.createdAtRaw ? new Date(chat.createdAtRaw) : null;
            const [fromDate, toDate] = filters.dateRange || [];
            const matchesDate =
                !fromDate ||
                !toDate ||
                (createdAt &&
                    createdAt >= fromDate.startOf("day").toDate() &&
                    createdAt <= toDate.endOf("day").toDate());

            const matchesCategory =
                filters.category === "all" ||
                String(chat.category || "").toLowerCase() === String(filters.category || "").toLowerCase();

            return matchesStatus && matchesSearch && matchesDate && matchesCategory;
        })
        .sort((a, b) => {
            const first = new Date(a.createdAtRaw || 0).getTime();
            const second = new Date(b.createdAtRaw || 0).getTime();
            return filters.sortBy === "oldest" ? first - second : second - first;
        });

    const resetFilters = () => {
        setStatus("open");
        setSearchValue("");
        setFilters({
            keyword: "",
            dateRange: [],
            category: "all",
            sortBy: "newest",
        });
    };

    return (
        <>
            <Row
                gutter={16}
                className="support-page-layout"
                style={{ height: "calc(100dvh - 48px)", maxHeight: "calc(100dvh - 48px)", overflow: "hidden" }}
            >

                {/* Chat Window */}
                {(!isMobile || selectedChat) && (
                    <Col span={isMobile ? 24 : 14} style={{ display: "flex", minHeight: 0 }}>
                        <ReusableCard
                            title={
                                selectedChat ? (
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

                                        {isMobile && (
                                            <Button
                                                type="text"
                                                icon={<ArrowLeftOutlined style={{ color: "#fff" }} />}
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
                            className="w-full support-chat-card"
                        >

                            <div
                                className="support-chat-shell"
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    flex: 1,
                                    minHeight: 0,
                                }}
                            >

                                {/* Messages */}
                                <Spin spinning={messageLoading} wrapperClassName="support-message-spinner">
                                    <div
                                        className="support-message-scroll"
                                        style={{
                                            flex: 1,
                                            minHeight: 0,
                                            overflowY: "auto",
                                            paddingRight: 10,
                                        }}
                                    >
                                        {!selectedChat ? (
                                            <div style={{ color: "#aaa", textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100%" }}>
                                                <div style={{ backgroundColor: "#5E5E5E33", color: "white", flex: 1, minHeight: "100px", borderRadius: "20px" }}
                                                    className="display-3 text-lg"
                                                >
                                                    Select a chat to start messaging
                                                </div>
                                            </div>
                                        ) : messages.length > 0 ? (
                                            messages.map((msg, index) => (
                                                <div
                                                    key={msg.id || `msg-${index}`}
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
                                                                TICKET RAISED
                                                            </div>
                                                        )}
                                                        <div>
                                                            {typeof msg.text === "string"
                                                                ? msg.text
                                                                : String(msg.text?.message ?? "")}
                                                        </div>
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
                                    <div className="support-chat-input" style={{ display: "flex", flexDirection: "column", marginTop: 10, gap: 8 }}>
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
                                    <div className="support-chat-input" style={{ color: "#aaa", textAlign: "center", marginTop: 10 }}>
                                        This ticket is closed
                                    </div>
                                )}

                            </div>
                        </ReusableCard>
                    </Col>
                )}

                {/* Chat List */}
                {(!isMobile || !selectedChat) && (
                    <Col span={isMobile ? 24 : 10} className="support-list-col" style={{ display: "flex" }}>
                        <ReusableCard
                            title="Chats"
                            className="support-list-card"
                            extra={
                                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                                    <Segmented
                                        options={[
                                            { label: "Opened", value: "open" },
                                            { label: "Closed", value: "closed" }
                                        ]}
                                        value={status === "all" ? "open" : status}
                                        onChange={setStatus}
                                        style={{
                                            background: "#15202b",
                                            border: "1px solid #C9F07B",
                                            padding: "5px 12px",
                                            borderRadius: 8,
                                            color: "#fff"
                                        }}
                                        className="support-segment"
                                    />
                                    <ExportButton
                                        filename={`support_${status}_${filters.category}_tickets`}
                                        columns={supportExportColumns}
                                        data={chatList}
                                        getExportData={getSupportTicketsForExport}
                                    />
                                    <Button
                                        icon={<FilterOutlined />}
                                        onClick={() => setFilterOpen(true)}
                                        style={{
                                            background: "rgba(201,240,123,0.12)",
                                            border: "1px solid rgba(201,240,123,0.45)",
                                            color: "#C9F07B",
                                            borderRadius: 8,
                                            height: 38,
                                            width: 38,
                                        }}
                                    />
                                </div>
                            }
                        >

                            <div className="support-list-shell">
                                <Search
                                    placeholder="Search..."
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    className="modal-search support-list-search"
                                />

                                <Spin spinning={loading} wrapperClassName="support-list-spinner">
                                    <List
                                        itemLayout="horizontal"
                                        dataSource={filteredChats}
                                        className="support-meta support-chat-list-scroll"
                                        locale={{ emptyText: "No tickets found" }}

                                        renderItem={(item) => (
                                            <List.Item
                                                onClick={() => setSelectedChat(item)}
                                                style={{
                                                    background: "transparent",
                                                    margin: "10px",
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
                                                    description={
                                                        <span style={{ color: "white" }}>
                                                            {item.subject || item.message}
                                                            {item.category && item.category !== "-" && (
                                                                <span style={{ color: "#C9F07B", display: "block", fontSize: 12, marginTop: 4 }}>
                                                                    {String(item.category).replace(/_/g, " ")}
                                                                </span>
                                                            )}
                                                        </span>
                                                    }
                                                />
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 10,
                                                        flexDirection: "column",
                                                    }}
                                                >
                                                    <div
                                                        style={{ display: "flex", alignItems: "center", gap: 8 }}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {String(item.status).toLowerCase() !== "closed" && (
                                                            <Dropdown
                                                                trigger={["click"]}
                                                                menu={{
                                                                    items: [
                                                                        {
                                                                            key: "close",
                                                                            label: (
                                                                                <span style={{ color: "#ff7875" }}>
                                                                                    Close ticket
                                                                                </span>
                                                                            ),
                                                                            onClick: (e) => {
                                                                                e.domEvent.stopPropagation();
                                                                                handleCloseTicket(item.id);
                                                                            },
                                                                        },
                                                                    ],
                                                                }}
                                                            >
                                                                <MoreOutlined
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    style={{ color: "#fff", fontSize: 18 }}
                                                                />
                                                            </Dropdown>
                                                        )}
                                                        <Button
                                                            type="text"
                                                            danger
                                                            size="small"
                                                            style={{ fontWeight: 600 }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openDeleteTicketModal(item);
                                                            }}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>

                                                    <span style={{ color: "#fff", fontSize: 12 }}>
                                                        {item.time}
                                                    </span>
                                                </div>
                                            </List.Item>
                                        )}
                                    />
                                </Spin>
                            </div>

                        </ReusableCard>
                    </Col>
                )}

                <ReusableModal
                    open={ticketDeleteOpen}
                    onCancel={() => {
                        setTicketDeleteOpen(false);
                        setPendingDeleteTicket(null);
                    }}
                    title="Delete support ticket"
                    description="This will permanently remove the ticket and all messages. This cannot be undone."
                    showFooter={false}
                    extraContent={
                        <div className="text-center">
                            <p className="text-gray-300 text-base">
                                Are you sure you want to permanently delete this support ticket?
                            </p>
                            {pendingDeleteTicket && (
                                <p className="text-gray-400 text-sm mt-2">
                                    {pendingDeleteTicket.subject || pendingDeleteTicket.message}
                                </p>
                            )}
                            <div className="flex justify-between gap-4 mt-6">
                                <button
                                    type="button"
                                    className="px-6 py-2 rounded primaty-bg text-black"
                                    onClick={() => {
                                        setTicketDeleteOpen(false);
                                        setPendingDeleteTicket(null);
                                    }}
                                >
                                    No
                                </button>
                                <button
                                    type="button"
                                    className="px-6 py-2 rounded bg-red-600 text-white"
                                    disabled={deleteTicketLoading}
                                    onClick={confirmDeleteTicket}
                                >
                                    {deleteTicketLoading ? "Deleting…" : "Yes"}
                                </button>
                            </div>
                        </div>
                    }
                />
            </Row>
            <Modal
                open={filterOpen}
                onCancel={() => setFilterOpen(false)}
                footer={null}
                centered
                title={null}
                className="support-filter-modal"
                rootClassName="support-filter-modal-root"
                wrapClassName="support-filter-modal-wrap"
                closeIcon={null}

            >
                <div style={filterStyles.panel}>
                    <div style={filterStyles.header}>
                        <h3 style={filterStyles.title}>Filter Tickets</h3>
                        <button
                            type="button"
                            onClick={() => setFilterOpen(false)}
                            style={filterStyles.closeBtn}
                            aria-label="Close filters"
                        >
                            ×
                        </button>
                    </div>

                    <div style={filterStyles.body}>
                        {/* <div>
                            <label style={filterStyles.label}>Ticket Status</label>
                            <Select
                                value={status}
                                onChange={setStatus}
                                style={{ width: "100%", height: 40 }}
                                className="support-filter-select"
                                popupClassName="support-filter-dropdown"
                                options={[
                                    { label: "All", value: "all" },
                                    { label: "Opened", value: "open" },
                                    { label: "Closed", value: "closed" },
                                ]}
                            />
                        </div> */}

                        <div>
                            <label style={filterStyles.label}>Search Text</label>
                            <Input
                                value={filters.keyword}
                                onChange={(e) => setFilters((prev) => ({ ...prev, keyword: e.target.value }))}
                                placeholder="Name or subject"
                                className="support-filter-input"
                            />
                        </div>

                        <div>
                            <label style={filterStyles.label}>Created Date</label>
                            <RangePicker
                                value={filters.dateRange}
                                disabledDate={disabledDate}
                                minDate={dateBounds.minPickerDate}
                                maxDate={dateBounds.maxPickerDate}
                                onChange={(dates) => setFilters((prev) => ({ ...prev, dateRange: dates || [] }))}
                                style={{ width: "100%", height: 40 }}
                                className="support-filter-picker"
                                popupClassName="support-filter-picker-dropdown"
                            />
                        </div>

                        <div>
                            <label style={filterStyles.label}>Categories</label>
                            <Select
                                value={filters.category}
                                onChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}
                                style={{ width: "100%", height: 40 }}
                                className="support-filter-select"
                                popupClassName="support-filter-dropdown"
                                options={categoryOptions}
                            />
                        </div>

                        <div>
                            <label style={filterStyles.label}>Sort By</label>
                            <Select
                                value={filters.sortBy}
                                onChange={(value) => setFilters((prev) => ({ ...prev, sortBy: value }))}
                                style={{ width: "100%", height: 40 }}
                                className="support-filter-select"
                                popupClassName="support-filter-dropdown"
                                options={[
                                    { label: "Newest First", value: "newest" },
                                    { label: "Oldest First", value: "oldest" },
                                ]}
                            />
                        </div>

                        <div style={filterStyles.footer}>
                            <Button onClick={resetFilters} style={filterStyles.clearBtn}>
                                Reset
                            </Button>
                            <Button onClick={() => setFilterOpen(false)} style={filterStyles.applyBtn}>
                                Apply Filters
                            </Button>
                        </div>
                    </div>
                </div>

            </Modal>
            <style>{`
                .support-filter-modal-root .ant-modal,
                .support-filter-modal-wrap .ant-modal {
                    background: transparent !important;
                }
                    .support-filter-modal .ant-modal-container{
                        background: transparent !important;
                    }
                .support-filter-modal-root .ant-modal-content,
                .support-filter-modal-wrap .ant-modal-content,
                .support-filter-modal .ant-modal-content {
                    background: transparent !important;
                    background-color: transparent !important;
                    border: none !important;
                    border-radius: 0 !important;
                    padding: 0 !important;
                    box-shadow: none !important;
                }
                .support-filter-modal-root .ant-modal-header,
                .support-filter-modal-wrap .ant-modal-header,
                .support-filter-modal .ant-modal-header {
                    display: none !important;
                    background: transparent !important;
                    background-color: transparent !important;
                    border-bottom: none !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }
                .support-filter-modal-root .ant-modal-body,
                .support-filter-modal-wrap .ant-modal-body,
                .support-filter-modal .ant-modal-body {
                    background: transparent !important;
                    background-color: transparent !important;
                    padding: 0 !important;
                }
                .support-filter-modal-root .ant-modal-title,
                .support-filter-modal-wrap .ant-modal-title,
                .support-filter-modal .ant-modal-title {
                    color: #fff !important;
                    font-weight: 700 !important;
                }
                .support-filter-modal-root .ant-modal-close,
                .support-filter-modal-wrap .ant-modal-close,
                .support-filter-modal .ant-modal-close {
                    color: rgba(255,255,255,0.65) !important;
                }
                .support-filter-modal-root .ant-modal-close:hover,
                .support-filter-modal-wrap .ant-modal-close:hover,
                .support-filter-modal .ant-modal-close:hover {
                    color: #C9F07B !important;
                    background: rgba(201,240,123,0.08) !important;
                }
                .support-filter-input {
                    background: #0e2e2a !important;
                    border: 1px solid #2e5e4e !important;
                    color: #fff !important;
                    border-radius: 8px !important;
                    height: 40px !important;
                }
                .support-filter-picker {
                    background: #0e2e2a !important;
                    border: 1px solid #2e5e4e !important;
                    color: #fff !important;
                    border-radius: 8px !important;
                }
                .support-filter-select.ant-select .ant-select-selector {
                    background: #0e2e2a !important;
                    background-color: #0e2e2a !important;
                    border: 1px solid #2e5e4e !important;
                    color: #fff !important;
                    border-radius: 8px !important;
                    height: 40px !important;
                }
                .support-filter-input::placeholder {
                    color: rgba(255,255,255,0.35) !important;
                }
                .support-filter-picker input,
                .support-filter-select .ant-select-selection-item {
                    color: #fff !important;
                }
                .support-filter-picker .ant-picker-suffix,
                .support-filter-select .ant-select-arrow {
                    color: rgba(255,255,255,0.55) !important;
                }
                .support-filter-modal-root .ant-picker,
                .support-filter-modal-wrap .ant-picker,
                .support-filter-modal .ant-picker {
                    background: #0e2e2a !important;
                }
                .support-filter-modal-root .ant-picker-clear,
                .support-filter-modal-wrap .ant-picker-clear,
                .support-filter-modal .ant-picker-clear {
                    background: #0e2e2a !important;
                    color: rgba(255,255,255,0.65) !important;
                }
                .support-filter-modal-root .ant-picker-separator,
                .support-filter-modal-root .ant-picker-input input::placeholder,
                .support-filter-modal-root .ant-select-selection-placeholder,
                .support-filter-modal-wrap .ant-picker-separator,
                .support-filter-modal-wrap .ant-picker-input input::placeholder,
                .support-filter-modal-wrap .ant-select-selection-placeholder,
                .support-filter-modal .ant-picker-separator,
                .support-filter-modal .ant-picker-input input::placeholder,
                .support-filter-modal .ant-select-selection-placeholder {
                    color: rgba(255,255,255,0.38) !important;
                }
                .support-filter-modal-root .ant-select-dropdown,
                .support-filter-modal-root .ant-picker-dropdown .ant-picker-panel-container,
                .support-filter-modal-wrap .ant-select-dropdown,
                .support-filter-modal-wrap .ant-picker-dropdown .ant-picker-panel-container,
                .support-filter-modal .ant-select-dropdown,
                .support-filter-modal .ant-picker-dropdown .ant-picker-panel-container {
                    background: #122f2a !important;
                    border: 1px solid #1f4e40 !important;
                }
                .support-filter-dropdown {
                    background: #122f2a !important;
                    border: 1px solid #1f4e40 !important;
                }
                .support-filter-dropdown .ant-select-item {
                    color: rgba(255,255,255,0.85) !important;
                }
                .support-filter-dropdown .ant-select-item-option-active {
                    background: rgba(255,255,255,0.06) !important;
                }
                .support-filter-dropdown .ant-select-item-option-selected {
                    background: rgba(201,240,123,0.16) !important;
                    color: #C9F07B !important;
                }
                .support-filter-picker-dropdown .ant-picker-panel-container,
                .support-filter-picker-dropdown .ant-picker-panel,
                .support-filter-picker-dropdown .ant-picker-header {
                    background: #122f2a !important;
                    border-color: #1f4e40 !important;
                }
                .support-filter-picker-dropdown .ant-picker-header button,
                .support-filter-picker-dropdown .ant-picker-content th,
                .support-filter-picker-dropdown .ant-picker-cell {
                    color: rgba(255,255,255,0.68) !important;
                }
                .support-filter-picker-dropdown .ant-picker-cell-in-view {
                    color: rgba(255,255,255,0.88) !important;
                }
                .support-filter-picker-dropdown .ant-picker-cell-selected .ant-picker-cell-inner,
                .support-filter-picker-dropdown .ant-picker-cell-range-start .ant-picker-cell-inner,
                .support-filter-picker-dropdown .ant-picker-cell-range-end .ant-picker-cell-inner {
                    background: #C9F07B !important;
                    color: #000 !important;
                }
                .support-filter-picker-dropdown .ant-picker-cell-in-range:before {
                    background: rgba(201,240,123,0.18) !important;
                }
            `}</style>
        </>
    );
};

const filterStyles = {
    panel: {
        background: "#122f2a",
        border: "1px solid rgba(201,240,123,0.22)",
        borderRadius: 12,
        boxShadow: "0 18px 48px rgba(0,0,0,0.42)",
        overflow: "hidden",
    },
    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 24px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
    },
    title: {
        color: "#fff",
        fontSize: 16,
        fontWeight: 700,
        margin: 0,
    },
    closeBtn: {
        width: 28,
        height: 28,
        border: "none",
        background: "transparent",
        color: "rgba(255,255,255,0.68)",
        fontSize: 22,
        lineHeight: "24px",
        cursor: "pointer",
        borderRadius: 6,
    },
    body: {
        display: "grid",
        gap: 16,
        padding: 24,
    },
    label: {
        display: "block",
        color: "rgba(255,255,255,0.82)",
        fontWeight: 650,
        fontSize: 13,
        marginBottom: 8,
    },
    footer: {
        display: "flex",
        justifyContent: "flex-end",
        gap: 10,
        marginTop: 4,
    },
    clearBtn: {
        background: "transparent",
        border: "1px solid rgba(255,255,255,0.2)",
        color: "rgba(255,255,255,0.68)",
        borderRadius: 8,
        height: 40,
    },
    applyBtn: {
        background: "#C9F07B",
        borderColor: "#C9F07B",
        color: "#000",
        borderRadius: 8,
        height: 40,
        fontWeight: 700,
    },
};

export default SupportPage;
