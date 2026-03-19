import { useState, useEffect, useRef } from "react";
import { Row, Col, List, Avatar, Input, Button, Segmented } from "antd";
import { SendOutlined } from "@ant-design/icons";
import ReusableCard from "../reuseable/Card";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Dropdown, Menu } from "antd";
import { MoreOutlined } from "@ant-design/icons";

const SupportPage = () => {
    const { Search } = Input;

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [status, setStatus] = useState("open");

    const chats = [
        {
            id: 1,
            name: "Chandravadan Raut",
            message: "Test",
            time: "1mon ago",
            status: "open"
        },
        {
            id: 2,
            name: "Ramesh",
            message: "test",
            time: "3mon ago",
            status: "closed"
        },
        {
            id: 3,
            name: "Ramesh",
            message: "test7",
            time: "3mon ago",
            status: "open"
        }
    ];
    const messagesEndRef = useRef(null);

    const [chatList, setChatList] = useState([
        {
            id: 1,
            name: "Chandravadan Raut",
            message: "Test",
            time: "1mon ago",
            status: "open"
        },
        {
            id: 2,
            name: "Ramesh",
            message: "test",
            time: "3mon ago",
            status: "closed"
        },
        {
            id: 3,
            name: "Ramesh",
            message: "test7",
            time: "3mon ago",
            status: "open"
        }
    ]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const filteredChats = chatList.filter(chat =>
        status === "open" ? chat.status === "open" : chat.status === "closed"
    );

    const handleCloseTicket = (id) => {
        const updatedChats = chatList.map(chat =>
            chat.id === id ? { ...chat, status: "closed" } : chat
        );

        setChatList(updatedChats);

        // if current chat closed → go back
        if (selectedChat?.id === id) {
            setSelectedChat(null);
        }
    };

    const handleSend = () => {
        if (!message.trim()) return;

        const newMessage = {
            text: message,
            sender: "admin"
        };

        setMessages([...messages, newMessage]);
        setMessage("");
    };

    const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

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
                                    <span>{selectedChat.name}</span>

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
                                ) : (
                                    messages.map((msg, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                display: "flex",
                                                justifyContent: "flex-end",
                                                marginBottom: 10
                                            }}
                                        >
                                            <div
                                                style={{
                                                    background: "#C9F07B",
                                                    color: "#000",
                                                    padding: "8px 12px",
                                                    borderRadius: 8,
                                                    maxWidth: "60%"
                                                }}
                                            >
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />

                            </div>

                            {/* Chat Input */}
                            {selectedChat && (
                                <div style={{ display: "flex", marginTop: 10 }}>
                                    <Input
                                        placeholder="Message..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onPressEnter={handleSend}
                                    />

                                    <Button
                                        type="primary"
                                        icon={<SendOutlined />}
                                        onClick={handleSend}
                                        style={{ marginLeft: 8, background: "#C9F07B",color:"#000" }}
                                    />
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
                            style={{ marginBottom: 16 }}
                            className="modal-search"
                        />

                        <List
                            itemLayout="horizontal"
                            dataSource={filteredChats}
                            className="support-meta"

                            renderItem={(item) => (
                                <List.Item
                                    onClick={() => setSelectedChat(item)}
                                    style={{
                                        background: "transparent",
                                        marginBottom: 10,
                                        padding: "10px 12px",
                                        borderRadius: 8,
                                        cursor: "pointer",
                                        border: "1px solid #C9F07B",
                                        boxShadow: "0px 0px 10px 0px rgba(214, 214, 214, 0.63)",
                                        transition: "all 0.3s ease-in-out",
                                    }}
                                    className="support-list-item"
                                >
                                    <List.Item.Meta
                                        avatar={<Avatar>{item.name[0]}</Avatar>}
                                        title={<span style={{ color: "white" }}>{item.name}</span>}
                                        description={<span style={{ color: "white" }}>{item.message}</span>}
                                    />
                                    <div style={{ display: "flex", alignItems: "center", gap: 10,flexDirection:"column" }}>
                                        

                                        {/* 3 DOT MENU */}
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

                                        <span style={{ color: "#fff", fontSize: 12 }}>
                                            {item.time}
                                        </span>
                                    </div>
                                </List.Item>
                            )}
                        />

                    </ReusableCard>
                </Col>
            )}

        </Row>
    );
};

export default SupportPage;