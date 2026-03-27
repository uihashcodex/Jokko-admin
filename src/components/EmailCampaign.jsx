import { useState, useEffect } from "react";
import { Button, Form, Select, Tag, Modal, message, ConfigProvider } from "antd";
import { RocketOutlined, EditOutlined, UserAddOutlined } from "@ant-design/icons";
import axios from "axios";
import { constant } from "../const";
import TableHeader from "../reuseable/TableHeader";
import ReusableTable from "../reuseable/ReusableTable";
import theme from "../config/theme";

const TYPE_OPTIONS = [
  { label: "Professional", value: "professional" },
  { label: "Individual", value: "individual" },
];

const EmailCampaign = () => {
  const [createForm] = Form.useForm();
  const [updateForm] = Form.useForm();

  const [campaigns, setCampaigns] = useState([]);
  const [emailContents, setEmailContents] = useState([]);
  
  const [tableLoading, setTableLoading] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [addUserOpen, setAddUserOpen] = useState(false);
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [addUserForm] = Form.useForm();

  const [publishingId, setPublishingId] = useState(null);

  const token = localStorage.getItem("adminToken");
  const authHeader = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchCampaigns();
    fetchEmailContents();
  }, []);

  // ── fetch campaigns list ──────────────────────────────────────────────────
  const fetchCampaigns = async () => {
    setTableLoading(true);
    try {
      const { data } = await axios.get(
        `${constant.backend_url}/brevo/getCampaigns`,
        { headers: authHeader }
      );
      if (data.success === true) {
        const rows = (data.result || data.data || []).map((item, i) => ({
          ...item,
          sno: i + 1,
          id: item._id,
          event_key: item.content_info.event_key,
          campaign_name:  item.content_info.subject || item.campaign_name || "-",
          
        }));
        setCampaigns(rows);
      } else {
        message.error(data.message || "Failed to load campaigns.");
      }
    } catch {
      message.error("Failed to fetch campaigns.");
    } finally {
      setTableLoading(false);
    }
  };

  // ── fetch email contents filtered by type = "campaign" ───────────────────
  const fetchEmailContents = async () => {
    setContentLoading(true);
    try {
      const { data } = await axios.get(
        `${constant.backend_url}/admin/get-emailcontent`,
        { headers: authHeader }
      );
      if (data.success) {
        const all = data.result || data.data || [];
        const filtered = all.filter((item) => item.type === "campaign");
        setEmailContents(filtered);
      } else {
        message.error(data.message || "Failed to load email contents.");
      }
    } catch {
      message.error("Failed to fetch email contents.");
    } finally {
      setContentLoading(false);
    }
  };

  // ── create campaign ───────────────────────────────────────────────────────
  const handleCreate = async (values) => {
    console.log(values,'values');
    
    setCreateLoading(true);
    try {
      const { data } = await axios.post(
        `${constant.backend_url}/brevo/createCampaign`,
        { campaign_name: values?.event_key?.label, type: values.type, content_id: values?.event_key?.value },
        { headers: authHeader }
      );
      if (data.success) {
        message.success(data.message || "Campaign created successfully!");
        setCreateOpen(false);
        createForm.resetFields();
        fetchCampaigns();
      } else {
        message.error(data.message || "Failed to create campaign.");
      }
    } catch {
      message.error("Failed to create campaign.");
    } finally {
      setCreateLoading(false);
    }
  };

  // ── update campaign ───────────────────────────────────────────────────────
  const openUpdate = (record) => {
    setSelectedRow(record);
    updateForm.setFieldsValue({
      event_key: record.event_key,
      type: record.type,
    });
    setUpdateOpen(true);
  };

  const handleUpdate = async (values) => {
    setUpdateLoading(true);
    try {
      const { data } = await axios.post(
        `${constant.backend_url}/admin/update-campaign`,
        { id: selectedRow.id, event_key: values.event_key, type: values.type },
        { headers: authHeader }
      );
      if (data.success) {
        message.success(data.message || "Campaign updated successfully!");
        setUpdateOpen(false);
        updateForm.resetFields();
        fetchCampaigns();
      } else {
        message.error(data.message || "Failed to update campaign.");
      }
    } catch {
      message.error("Failed to update campaign.");
    } finally {
      setUpdateLoading(false);
    }
  };

  // ── add user ──────────────────────────────────────────────────────────────
  const openAddUser = (record) => {
    setSelectedRow(record);
    setAddUserOpen(true);
  };

  const handleAddUser = async (values) => {
    setAddUserLoading(true);
    try {
      const { data } = await axios.post(
        `${constant.backend_url}/admin/add-campaign-user`,
        { campaign_id: selectedRow.id, email: values.email },
        { headers: authHeader }
      );
      if (data.success) {
        message.success(data.message || "User added successfully!");
        setAddUserOpen(false);
        addUserForm.resetFields();
      } else {
        message.error(data.message || "Failed to add user.");
      }
    } catch {
      message.error("Failed to add user.");
    } finally {
      setAddUserLoading(false);
    }
  };

  // ── publish ───────────────────────────────────────────────────────────────
  const handlePublish = async (record) => {
    setPublishingId(record.id);
    try {
      const { data } = await axios.post(
        `${constant.backend_url}/admin/publish-campaign`,
        { id: record.id },
        { headers: authHeader }
      );
      if (data.success) {
        message.success(data.message || "Campaign published!");
        fetchCampaigns();
      } else {
        message.error(data.message || "Failed to publish campaign.");
      }
    } catch {
      message.error("Failed to publish campaign.");
    } finally {
      setPublishingId(null);
    }
  };

  // ── table columns ─────────────────────────────────────────────────────────
  const columns = [
    { title: "S.No", dataIndex: "sno", width: 60 },
    { title: "Event Key", dataIndex: "event_key" },
    { title: "Subject", dataIndex: "campaign_name", render: (v) => v || "-" },
    {
      title: "Type",
      dataIndex: "type",
      render: (v) =>
        v ? (
          <Tag color={v === "professional" ? "blue" : "green"}>
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </Tag>
        ) : "-",
    },
   
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openUpdate(record)}
            style={btnStyles.update}
          >
            Update
          </Button>
          <Button
            size="small"
            icon={<UserAddOutlined />}
            onClick={() => openAddUser(record)}
            style={btnStyles.addUser}
          >
            Add User
          </Button>
          <Button
            size="small"
            icon={<RocketOutlined />}
            loading={publishingId === record.id}
            onClick={() => handlePublish(record)}
            style={btnStyles.publish}
            className="ec-publish-btn"
          >
            Publish
          </Button>
        </div>
      ),
    },
  ];

  // ── shared modal wrapper ──────────────────────────────────────────────────
  const CampaignModal = ({ open, onCancel, onFinish, form, title, loading, initialContentKey }) => (
    <ConfigProvider
      theme={{ token: { colorBgElevated: theme.sidebarSettings.backgroundColor } }}
    >
      <Modal
        open={open}
        onCancel={onCancel}
        footer={null}
        centered
        width="90%"
        style={{ maxWidth: 520 }}
        destroyOnHidden
        className="custom-modal modal-style"
        styles={{
          content: { background: theme.sidebarSettings.backgroundColor, borderRadius: 12 },
          body: { paddingTop: 20, paddingBottom: 20 },
        }}
      >
        <div style={modalStyles.header}>
          <div style={modalStyles.iconWrap}>
            <RocketOutlined style={{ fontSize: 18, color: "#c9f07b" }} />
          </div>
          <div>
            <p style={modalStyles.title}>{title}</p>
            <p style={modalStyles.subtitle}>Fill in the details below.</p>
          </div>
        </div>
        <div style={modalStyles.divider} />

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label={<span style={modalStyles.label}>Email Content</span>}
            name="event_key"
            rules={[{ required: true, message: "Please select email content" }]}
          >
            <Select
              placeholder="Select email content"
              loading={contentLoading}
              className="ec-select"
              style={{ height: 44 }}
              labelInValue
              options={emailContents.map((item) => ({
                label: item.subject || item.event_key,
                value: item._id,
              }))}
            />
          </Form.Item>

          <Form.Item
            label={<span style={modalStyles.label}>Type</span>}
            name="type"
            rules={[{ required: true, message: "Please select a type" }]}
          >
            <Select
              placeholder="Select type"
              className="ec-select"
              style={{ height: 44 }}
              options={TYPE_OPTIONS}
            />
          </Form.Item>

          <div style={modalStyles.btnRow}>
            <Button onClick={onCancel} style={modalStyles.cancelBtn}>
              Cancel
            </Button>
            <Button
              htmlType="submit"
              loading={loading}
              style={modalStyles.submitBtn}
              className="ec-publish-btn"
            >
              Submit
            </Button>
          </div>
        </Form>
      </Modal>
    </ConfigProvider>
  );

  return (
    <div>
      {/* Page Header */}
      <div className="mb-5 w-full rounded-lg bg-cover bg-center flex items-center header-content-img">
        <div className="display-3 w-full">
          <h1 className="text-white p-7 font-bold text-2xl">Email Campaign</h1>
        </div>
      </div>

      {/* Table Header with Create button */}
      <TableHeader
        showStatusFilter={false}
        showSearch={false}
        showCreateButton
        onCreate={() => setCreateOpen(true)}
      />

      {/* Campaigns Table */}
      <ReusableTable
        columns={columns}
        data={campaigns}
        rowKey="id"
        loading={tableLoading}
        total={campaigns.length}
        pageSize={10}
        actionType={[]}
      />

      {/* ── Create Campaign Modal ── */}
      <CampaignModal
        open={createOpen}
        onCancel={() => { setCreateOpen(false); createForm.resetFields(); }}
        onFinish={handleCreate}
        form={createForm}
        title="Create Campaign"
        loading={createLoading}
      />

      {/* ── Update Campaign Modal ── */}
      <CampaignModal
        open={updateOpen}
        onCancel={() => { setUpdateOpen(false); updateForm.resetFields(); }}
        onFinish={handleUpdate}
        form={updateForm}
        title="Update Campaign"
        loading={updateLoading}
      />

      {/* ── Add User Modal ── */}
      <ConfigProvider
        theme={{ token: { colorBgElevated: theme.sidebarSettings.backgroundColor } }}
      >
        <Modal
          open={addUserOpen}
          onCancel={() => { setAddUserOpen(false); addUserForm.resetFields(); }}
          footer={null}
          centered
          width="90%"
          style={{ maxWidth: 440 }}
          destroyOnHidden
          className="custom-modal modal-style"
          styles={{
            content: { background: theme.sidebarSettings.backgroundColor, borderRadius: 12 },
            body: { paddingTop: 20, paddingBottom: 20 },
          }}
        >
          <div style={modalStyles.header}>
            <div style={modalStyles.iconWrap}>
              <UserAddOutlined style={{ fontSize: 18, color: "#c9f07b" }} />
            </div>
            <div>
              <p style={modalStyles.title}>Add User to Campaign</p>
              <p style={modalStyles.subtitle}>Enter the user email to add.</p>
            </div>
          </div>
          <div style={modalStyles.divider} />

          <Form form={addUserForm} layout="vertical" onFinish={handleAddUser}>
            <Form.Item
              label={<span style={modalStyles.label}>User Email</span>}
              name="email"
              rules={[
                { required: true, message: "Please enter an email" },
                { type: "email", message: "Enter a valid email" },
              ]}
            >
              <input
                placeholder="user@example.com"
                className="ec-text-input"
                onChange={(e) => addUserForm.setFieldValue("email", e.target.value)}
              />
            </Form.Item>

            <div style={modalStyles.btnRow}>
              <Button
                onClick={() => { setAddUserOpen(false); addUserForm.resetFields(); }}
                style={modalStyles.cancelBtn}
              >
                Cancel
              </Button>
              <Button
                htmlType="submit"
                loading={addUserLoading}
                style={modalStyles.submitBtn}
                className="ec-publish-btn"
              >
                Add User
              </Button>
            </div>
          </Form>
        </Modal>
      </ConfigProvider>

      {/* Scoped Styles */}
      <style>{`
        .ec-select .ant-select-selector {
          background-color: #0e2e2a !important;
          border: 1px solid #2e5e4e !important;
          color: #fff !important;
          border-radius: 8px !important;
        }
        .ec-select .ant-select-selector:hover,
        .ec-select.ant-select-focused .ant-select-selector {
          border-color: #c9f07b !important;
          box-shadow: 0 0 0 2px rgba(201,240,123,0.12) !important;
        }
        .ec-select .ant-select-selection-placeholder {
          color: rgba(255,255,255,0.35) !important;
        }
        .ec-select .ant-select-selection-item {
          color: #fff !important;
        }
        .ec-select .ant-select-arrow {
          color: rgba(255,255,255,0.45) !important;
        }
        .ant-select-dropdown {
          background-color: #122f2a !important;
          border: 1px solid #1f4e40 !important;
        }
        .ant-select-item { color: rgba(255,255,255,0.85) !important; }
        .ant-select-item-option-selected {
          background-color: rgba(201,240,123,0.15) !important;
          color: #c9f07b !important;
        }
        .ant-select-item-option-active {
          background-color: rgba(255,255,255,0.05) !important;
        }
        .ec-publish-btn:hover {
          background-color: #b0d660 !important;
          border-color: #b0d660 !important;
        }
        .ec-text-input {
          width: 100%;
          height: 44px;
          padding: 0 12px;
          background-color: #0e2e2a;
          border: 1px solid #2e5e4e;
          border-radius: 8px;
          color: #fff;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .ec-text-input::placeholder { color: rgba(255,255,255,0.35); }
        .ec-text-input:focus { border-color: #c9f07b; box-shadow: 0 0 0 2px rgba(201,240,123,0.12); }
      `}</style>
    </div>
  );
};

const btnStyles = {
  update: {
    background: "rgba(201,240,123,0.15)",
    border: "1px solid rgba(201,240,123,0.4)",
    color: "#c9f07b",
    borderRadius: 6,
  },
  addUser: {
    background: "rgba(24,144,255,0.12)",
    border: "1px solid rgba(24,144,255,0.4)",
    color: "#40a9ff",
    borderRadius: 6,
  },
  publish: {
    background: "#c9f07b",
    borderColor: "#c9f07b",
    color: "#000",
    fontWeight: 700,
    borderRadius: 6,
  },
};

const modalStyles = {
  header: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: "rgba(201,240,123,0.1)",
    border: "1px solid rgba(201,240,123,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  title: {
    color: "#fff",
    fontWeight: 700,
    fontSize: 16,
    margin: 0,
  },
  subtitle: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 12,
    margin: 0,
    marginTop: 2,
  },
  divider: {
    height: 1,
    background: "rgba(255,255,255,0.07)",
    marginBottom: 20,
  },
  label: {
    color: "rgba(255,255,255,0.85)",
    fontWeight: 600,
    fontSize: 14,
  },
  btnRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "rgba(255,255,255,0.65)",
    borderRadius: 8,
    height: 40,
  },
  submitBtn: {
    background: "#c9f07b",
    borderColor: "#c9f07b",
    color: "#000",
    fontWeight: 700,
    borderRadius: 8,
    height: 40,
    paddingInline: 24,
  },
};

export default EmailCampaign;
