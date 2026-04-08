import { useState } from "react";
import { Button, Form, Input, message } from "antd";
import { SendOutlined, BellOutlined } from "@ant-design/icons";
import axios from "axios";
import { constant } from "../const";

const { TextArea } = Input;

const PushNotification = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSend = async (values) => {
    setLoading(true);
    try {
      // TODO: wire up to your API endpoint
      const { data } = await axios.post(
        `${constant.backend_url}/admin/send-batch`,
        values,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      // message.success("Push notification sent successfully!");
      if (data.success === true) {
        message.success(data.message);
        form.resetFields();
      } else {
        message.error(data.message);
      }
    } catch {
      message.error("Failed to send notification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-5 w-full rounded-lg bg-cover bg-center flex items-center header-content-img">
        <div className="display-3 w-full">
          <h1 className="text-white p-7 font-bold text-2xl">
            Push Notification
          </h1>
        </div>
      </div>

      {/* Notification Composer Card */}
      <div style={styles.card}>
        {/* Card Header */}
        <div style={styles.cardHeader}>
          <div style={styles.iconWrap}>
            <BellOutlined style={{ fontSize: 20, color: "#c9f07b" }} />
          </div>
          <div>
            <p style={styles.cardTitle}>Compose Notification</p>
            <p style={styles.cardSubtitle}>
              Fill in the title and content, then click Send.
            </p>
          </div>
        </div>

        <div style={styles.divider} />

        {/* Form */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSend}
          style={styles.form}
        >
          {/* Title Field */}
          <Form.Item
            label={<span style={styles.label}>Title</span>}
            name="title"
            rules={[{ required: true, message: "Please enter a notification title" }]}
          >
            <Input
              placeholder="e.g. New Update Available"
              maxLength={100}
              showCount
              style={styles.input}
              className="pn-input"
            />
          </Form.Item>

          {/* Content Field */}
          <Form.Item
            label={<span style={styles.label}>Content</span>}
            name="body"
            rules={[{ required: true, message: "Please enter the notification content" }]}
          >
            <TextArea
              placeholder="Write the notification message here…"
              rows={5}
              maxLength={300}
              showCount
              style={styles.textarea}
              className="pn-input"
            />
          </Form.Item>

          {/* Send Button */}
          <Form.Item style={{ marginBottom: 0 }}>
            <div style={styles.btnRow}>
              <Button
                htmlType="reset"
                onClick={() => form.resetFields()}
                style={styles.clearBtn}
              >
                Clear
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SendOutlined />}
                style={styles.sendBtn}
                className="pn-send-btn"
              >
                Send Notification
              </Button>
            </div>
          </Form.Item>
        </Form>
      </div>

      {/* Scoped styles */}
      <style>{`
        .pn-input {
          background-color: #0e2e2a !important;
          border: 1px solid #2e5e4e !important;
          color: #fff !important;
          border-radius: 8px !important;
          transition: border-color 0.2s ease !important;
        }
        .pn-input:hover,
        .pn-input:focus {
          border-color: #c9f07b !important;
          box-shadow: 0 0 0 2px rgba(201,240,123,0.12) !important;
        }
        .pn-input::placeholder,
        .pn-input .ant-input::placeholder {
          color: rgba(255,255,255,0.35) !important;
        }
        .ant-input-textarea-show-count::after {
          color: rgba(255,255,255,0.4) !important;
        }
        .ant-input-show-count-suffix {
          color: rgba(255,255,255,0.4) !important;
        }
        .pn-send-btn:hover {
          background-color: #b0d660 !important;
          border-color: #b0d660 !important;
        }
        .pn-send-btn:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
};

const styles = {
  card: {
    background: "linear-gradient(135deg, #122f2a 0%, #0e2521 100%)",
    border: "1px solid #1f4e40",
    borderRadius: 16,
    padding: "28px 32px",
    maxWidth: 680,
    boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
    margin: "auto"
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: "rgba(201,240,123,0.1)",
    border: "1px solid rgba(201,240,123,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardTitle: {
    color: "#fff",
    fontWeight: 700,
    fontSize: 17,
    margin: 0,
    lineHeight: "1.3",
  },
  cardSubtitle: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 13,
    margin: 0,
    marginTop: 2,
  },
  divider: {
    height: 1,
    background: "rgba(255,255,255,0.07)",
    marginBottom: 24,
  },
  form: {
    marginTop: 0,
  },
  label: {
    color: "rgba(255,255,255,0.85)",
    fontWeight: 600,
    fontSize: 14,
  },
  input: {
    height: 44,
  },
  textarea: {
    resize: "none",
  },
  btnRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 8,
  },
  clearBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "rgba(255,255,255,0.65)",
    borderRadius: 8,
    height: 42,
    paddingInline: 20,
    cursor: "pointer",
  },
  sendBtn: {
    background: "#c9f07b",
    borderColor: "#c9f07b",
    color: "#000",
    fontWeight: 700,
    borderRadius: 8,
    height: 42,
    paddingInline: 28,
    transition: "all 0.2s ease",
  },
};

export default PushNotification;