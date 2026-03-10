import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, message } from "antd";
import Editor from "@monaco-editor/react";
import axios from "axios";
import moment from "moment";
import { constant } from "../const";
import ReusableTable from "../reuseable/ReusableTable";
import ReusableModal from "../reuseable/ReusableModal";

const EmailTemplateManagement = () => {
    const [templates, setTemplates] = useState([]);
    const [modal, setModal] = useState({
        visible: false,
        mode: "view",
        template: null,
    });
    const [form] = Form.useForm();
    const [body, setBody] = useState("");
    const [loading, setLoading] = useState(false);

    // Fetch templates
    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const res = await axios.get(
                `${constant.backend_url}/get-email-template`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                    },
                }
            );

            setTemplates(res.data?.result || []);
        } catch (err) {
            message.error("Failed to fetch templates");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    // Table columns
    const columns = [
        {
            title: "Event Key",
            dataIndex: "event_key",
        },
        {
            title: "Subject",
            dataIndex: "subject",
        },
        {
            title: "Created",
            dataIndex: "createdAt",
            render: (d) => moment(d).format("DD MMM YYYY"),
        },
        {
            title: "Actions",
            render: (_, record) => (
                <>
                    <Button size="small" onClick={() => openModal("view", record)}>
                        View
                    </Button>

                    <Button
                        size="small"
                        style={{ marginLeft: 8 }}
                        onClick={() => openModal("edit", record)}
                    >
                        Edit
                    </Button>
                </>
            ),
        },
    ];

    // Open modal
    const openModal = (mode, template = null) => {
        setModal({ visible: true, mode, template });

        if (mode !== "add" && template) {
            form.setFieldsValue({
                event_key: template.event_key,
                subject: template.subject,
            });

            setBody(template.body);
        } else {
            form.resetFields();
            setBody("");
        }
    };

    // Handle submit
    const handleOk = async () => {
        const values = await form.validateFields();

        const payload = {
            ...values,
            body,
        };

        try {
            if (modal.mode === "add") {
                await axios.post(
                    `${constant.backend_url}/add-email-template`,
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                        },
                    }
                );

                message.success("Template added");
            } else {
                await axios.put(
                    `${constant.backend_url}/edit-email-template/${modal.template._id}`,
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                        },
                    }
                );

                message.success("Template updated");
            }

            setModal({ ...modal, visible: false });
            fetchTemplates();
        } catch (err) {
            message.error("Error saving template");
        }
    };

    return (
        <div style={{ padding: 24 }}>
            <div className="mb-4 display-4">
            <Button type="primary" onClick={() => openModal("add")}>
                Add Template
            </Button>
            </div>

            <ReusableTable
                columns={columns}
                dataSource={templates}
                rowKey="_id"
                loading={loading}
                style={{ marginTop: 20 }}
            />

            {/* <Modal
                open={modal.visible}
                title={
                    modal.mode === "view"
                        ? "View Template"
                        : modal.mode === "edit"
                            ? "Edit Template"
                            : "Add Template"
                }
                onCancel={() => setModal({ ...modal, visible: false })}
                onOk={modal.mode === "view" ? undefined : handleOk}
                footer={modal.mode === "view" ? null : undefined}
                width={1000}
                destroyOnClose
            >
                {modal.mode === "view" ? (
                    <div style={{ minHeight: 300 }}>
                        <div dangerouslySetInnerHTML={{ __html: modal.template?.body }} />
                    </div>
                ) : (
                    <div style={{ display: "flex", gap: 24 }}>

                        <div style={{ flex: 1 }}>
                            <Form form={form} layout="vertical">
                                <Form.Item
                                    name="event_key"
                                    label="Event Key"
                                    rules={[{ required: true }]}
                                >
                                    <Input disabled={modal.mode === "edit"} />
                                </Form.Item>

                                <Form.Item
                                    name="subject"
                                    label="Subject"
                                    rules={[{ required: true }]}
                                >
                                    <Input />
                                </Form.Item>

                                <Form.Item label="HTML Body" required>
                                    <Editor
                                        height="400px"
                                        language="html"
                                        value={body}
                                        onChange={(value) => setBody(value || "")}
                                        options={{
                                            minimap: { enabled: false },
                                            fontSize: 14,
                                            wordWrap: "on",
                                            automaticLayout: true,
                                        }}
                                    />
                                </Form.Item>
                            </Form>
                        </div>


                        <div
                            style={{
                                flex: 1,
                                borderLeft: "1px solid #eee",
                                paddingLeft: 24,
                            }}
                        >
                            <div style={{ fontWeight: "bold", marginBottom: 8 }}>
                                Live Email Preview
                            </div>

                            <div
                                style={{
                                    border: "1px solid #ddd",
                                    minHeight: 400,
                                    background: "#fff",
                                    padding: 12,
                                }}
                            >
                                <div dangerouslySetInnerHTML={{ __html: body }} />
                            </div>
                        </div>
                    </div>
                )}
            </Modal> */}

            <ReusableModal
                open={modal.visible}
                onCancel={() => setModal({ ...modal, visible: false })}
                title={
                    modal.mode === "view"
                        ? "View Template"
                        : modal.mode === "edit"
                            ? "Edit Template"
                            : "Add Template"
                }
                showFooter={modal.mode !== "view"}
                onSubmit={handleOk}
                extraContent={
                    modal.mode === "view" ? (
                        <div style={{ minHeight: 300 }}>
                            <div dangerouslySetInnerHTML={{ __html: modal.template?.body }} />
                        </div>
                    ) : (
                        <div style={{ display: "flex", gap: 24 }}>

                            {/* LEFT SIDE */}

                            <div style={{ flex: 1 }}>
                                <Form form={form} layout="vertical">

                                    <Form.Item
                                        name="event_key"
                                        label="Event Key"
                                        rules={[{ required: true }]}
                                    >
                                        <Input disabled={modal.mode === "edit"} />
                                    </Form.Item>

                                    <Form.Item
                                        name="subject"
                                        label="Subject"
                                        rules={[{ required: true }]}
                                    >
                                        <Input />
                                    </Form.Item>

                                    <Form.Item label="HTML Body" required>
                                        <Editor
                                            height="400px"
                                            language="html"
                                            value={body}
                                            onChange={(value) => setBody(value || "")}
                                            options={{
                                                minimap: { enabled: false },
                                                fontSize: 14,
                                                wordWrap: "on",
                                                automaticLayout: true,
                                            }}
                                        />
                                    </Form.Item>

                                </Form>
                            </div>

                            {/* RIGHT SIDE PREVIEW */}

                            <div
                                style={{
                                    flex: 1,
                                    borderLeft: "1px solid #eee",
                                    paddingLeft: 24,
                                }}
                            >
                                <div style={{ fontWeight: "bold", marginBottom: 8 }}>
                                    Live Email Preview
                                </div>

                                <div
                                    style={{
                                        border: "1px solid #ddd",
                                        minHeight: 400,
                                        background: "#fff",
                                        padding: 12,
                                    }}
                                >
                                    <div dangerouslySetInnerHTML={{ __html: body }} />
                                </div>
                            </div>

                        </div>
                    )
                }
            />
        </div>
    );
};

export default EmailTemplateManagement;