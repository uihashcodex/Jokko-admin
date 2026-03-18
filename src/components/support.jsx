import { useState, useEffect } from "react";
import { Row, Col, List, Avatar, Input, Button, Segmented } from "antd";
import { SendOutlined } from "@ant-design/icons";
import ReusableCard from "../reuseable/Card";
import { ArrowLeftOutlined } from "@ant-design/icons";

const SupportPage = () => {

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

    const filteredChats = chats.filter(chat =>
        status === "open" ? chat.status === "open" : chat.status === "closed"
    );

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

    return (
        <Row gutter={16} style={{ height: "80vh" }}>

            {/* Chat Window */}
            {(!isMobile || selectedChat) && (
                <Col span={isMobile ? 24 : 17} style={{ display: "flex" }}>
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
                                height: "65vh"
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
                                    <div style={{ color: "#aaa", textAlign: "center", marginTop: 50 }}>
                                        Select a chat to start messaging
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
                                                    background: "#1677ff",
                                                    color: "white",
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
                                        style={{ marginLeft: 8, background: "#ff9e00" }}
                                    />
                                </div>
                            )}

                        </div>
                    </ReusableCard>
                </Col>
            )}

            {/* Chat List */}
            {(!isMobile || !selectedChat) && (
                <Col span={isMobile ? 24 : 7} style={{ display: "flex" }}>
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

                        <Input.Search
                            placeholder="Search..."
                            style={{ marginBottom: 16 }}
                        />

                        <List
                            itemLayout="horizontal"
                            dataSource={filteredChats}
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
                                    <span style={{ color: "#fff", fontSize: 12 }}>
                                        {item.time}
                                    </span>
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