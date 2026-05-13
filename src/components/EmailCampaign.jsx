import { useState, useEffect, useMemo } from "react";
import { Button, Form, Select, Tag, Modal, message, ConfigProvider, Input } from "antd";
import { RocketOutlined, EditOutlined, UserAddOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import { constant } from "../const";
import TableHeader from "../reuseable/TableHeader";
import ReusableTable from "../reuseable/ReusableTable";
import UserPickerModal from "../reuseable/UserPickerModal";
import theme from "../config/theme";
import { capitalize } from "../utils/capitalize";

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

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const [addUserOpen, setAddUserOpen] = useState(false);
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState(undefined);
  const [selectedUsersByCampaign, setSelectedUsersByCampaign] = useState({});

  const [publishingId, setPublishingId] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const token = localStorage.getItem("adminToken");
  const authHeader = { Authorization: `Bearer ${token}` };
  const pickerSelectedUsers = useMemo(
    () => selectedUsersByCampaign[selectedCampaignId] || [],
    [selectedCampaignId, selectedUsersByCampaign]
  );
  const selectedCampaign = useMemo(
    () => campaigns.find((campaign) => campaign.id === selectedCampaignId),
    [campaigns, selectedCampaignId]
  );
  const pickerUserType = selectedRow?.type || selectedCampaign?.type;

  useEffect(() => {
    fetchCampaigns();
    fetchEmailContents();
  }, [page]);

  // ── fetch campaigns list ──────────────────────────────────────────────────
  const formatCampaigns = (items = [], pageNumber = page) =>
    items.map((item, i) => ({
      ...item,
      sno: (pageNumber - 1) * PAGE_SIZE + i + 1,
      id: item._id,
      event_key: item.content_info?.event_key,
      campaign_name: item.campaign_name || "-",
      template_name: item.content_info?.template_name || "-",
      subject: item.content_info?.subject || "-",
      recipient_count: item.recipient_count || 0,
    }));

  const fetchCampaigns = async () => {
    setTableLoading(true);
    try {
      const { data } = await axios.get(
        `${constant.backend_url}/brevo/getCampaigns`,
        { headers: authHeader }
      );
      if (data.success === true) {
        const rows = formatCampaigns(data.result || data.data || [], page);
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

  const getCampaignsForExport = async () => {
    const { data } = await axios.get(
      `${constant.backend_url}/brevo/getCampaigns`,
      { headers: authHeader }
    );

    if (data.success !== true) return [];
    return formatCampaigns(data.result || data.data || [], 1);
  };





  // ── fetch email contents filtered by type = "campaign" ───────────────────
  const fetchEmailContents = async () => {
    setContentLoading(true);

    try {
      const { data } = await axios.get(
        `${constant.backend_url}/admin/get-emailcontent`,
        {
          params: {
            type: "campaign",
            page: 1,
            limit: 10,
          },
          headers: authHeader,
        }
      );

      if (data.success) {
        setEmailContents(data.result || []);
      } else {
        message.error(data.message || "Failed to load email contents.");
      }
    } catch (error) {
      message.error("Failed to fetch email contents.");
    } finally {
      setContentLoading(false);
    }
  };

  // ── create campaign ───────────────────────────────────────────────────────
  const handleCreate = async (values) => {

    setCreateLoading(true);
    try {
      const { data } = await axios.post(
        `${constant.backend_url}/brevo/createCampaign`,
        { campaign_name: values?.campaign_name, type: values.type, content_id: values?.event_key?.value },
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
      event_key: { label: record.subject, value: record.content_id },
      type: record.type,
      campaign_name: record.campaign_name,
      _id: record._id
    });
    setUpdateOpen(true);
  };

  const handleUpdate = async (values) => {
    setUpdateLoading(true);
    try {
      const content_id = values?.event_key?.value;
      const { data } = await axios.put(
        `${constant.backend_url}/brevo/updateCampaign/${values?._id}`,
        { content_id: content_id },
        { headers: authHeader }
      );
      if (data.success) {
        message.success(data.message || "Campaign updated successfully!");
        setUpdateOpen(false);
        updateForm.resetFields();
        fetchCampaigns();
      } else {
        console.log("🚀 ~ handleUpdate ~ data:", data)
        message.error(data.message || "Failed to update campaign.");
      }
    } catch {
      message.error("Failed to update campaign.");
    } finally {
      setUpdateLoading(false);
    }
  };

  // ── add user ──────────────────────────────────────────────────────────────
  const openAddUser = (record = null) => {
    setSelectedRow(record);
    setSelectedCampaignId(record?.id);
    setAddUserOpen(true);
  };

  const handleAddUser = async ({ userIds, users }) => {
    if (!selectedCampaignId) {
      message.error("Please select a campaign.");
      return;
    }

    setAddUserLoading(true);
    try {
      const { data } = await axios.post(
        `${constant.backend_url}/brevo/batchJoinContactList`,
        {
          campaign_id: selectedCampaignId,
          userIds,
        },
        { headers: authHeader }
      );

      if (data.success) {
        console.log("Campaign user add result:", {
          total_count: data.total_count,
          success_count: data.success_count ?? data.added_count,
          failure_count: data.failure_count ?? data.failed_count,
          success_emails: data.success_emails ?? data.added_users,
          failed_emails: data.failed_emails,
          failed_errors: data.failed_errors,
        });
        setSelectedUsersByCampaign((prev) => {
          const existingUsers = prev[selectedCampaignId] || [];
          const mergedUsers = Array.from(
            new Map([...existingUsers, ...users].map((user) => [user.id, user])).values()
          );

          return {
            ...prev,
            [selectedCampaignId]: mergedUsers,
          };
        });
        message.success(data.message || "Users added successfully!");
        setAddUserOpen(false);
        setSelectedCampaignId(undefined);
        fetchCampaigns();
      } else {
        message.error(data.message || "Failed to add users.");
      }
    } catch {
      message.error("Failed to add users.");
    } finally {
      setAddUserLoading(false);
    }
  };

  // ── publish ───────────────────────────────────────────────────────────────
  const handlePublish = async (record) => {
    if (!record?.recipient_count) {
      message.error("Please select at least one user");
      return;
    }

    setPublishingId(record.id);
    try {
      const { data } = await axios.post(
        `${constant.backend_url}/brevo/sendCampineEmail`,
        { campaign_id: record._id },
        { headers: authHeader }
      );
      if (data.success) {
        message.success(data.message || "Campaign published!");
        setSelectedUsersByCampaign((prev) => {
          const next = { ...prev };
          delete next[record.id];
          return next;
        });
        fetchCampaigns();
      } else {
        message.error(data.message || "Failed to publish campaign.");
      }
    } catch (error) {
      message.error(error?.response?.data?.message || "Failed to publish campaign.");
    } finally {
      setPublishingId(null);
    }
  };

  // ── delete campaign (hard delete) ─────────────────────────────────────────
  const openDelete = (record) => {
    setSelectedRow(record);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    try {
      const campaignId = selectedRow?._id || selectedRow?.id;
      if (!campaignId) {
        message.error("Invalid campaign id");
        return;
      }

      setDeleteLoading(true);

      const { data } = await axios.delete(
        `${constant.backend_url}/brevo/deleteCampaign/${campaignId}`,
        { headers: authHeader }
      );

      if (data?.success) {
        message.success(data.message || "Campaign deleted successfully");
        setDeleteOpen(false);
        setSelectedRow(null);
        fetchCampaigns();
      } else {
        message.warning(data?.message || "Delete failed");
      }
    } catch (error) {
      console.error(error);
      message.error("Failed to delete campaign");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── table columns ─────────────────────────────────────────────────────────
  const columns = [
    { title: "S.No", dataIndex: "sno", width: 60 },
    { title: "Campaign Name", dataIndex: "campaign_name" },
    // { title: "Template Name", dataIndex: "template_name" },
    { title: "Event Key", dataIndex: "event_key" },
    { title: "Subject", dataIndex: "subject", render: (v) => v || "-" },
    {
      title: "Type",
      dataIndex: "type",
      render: (v) =>
        v ? (
          <Tag color={v === "professional" ? "blue" : "green"}>
            {capitalize(v)}
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
            Select Users
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

          <Button
            size="small"
            icon={<DeleteOutlined />}
            style={{
              background: "rgba(255,77,79,0.1)",
              border: "1px solid rgba(255,77,79,0.4)",
              color: "#ff4d4f",
              borderRadius: 6,
            }}
            onClick={() => openDelete(record)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  // ── shared modal wrapper ──────────────────────────────────────────────────
  const CampaignModal = ({ open, onCancel, onFinish, form, title, loading }) => (
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
          <Form.Item name="_id" hidden>
            <Input />
          </Form.Item>

          {/* Campaign Name */}
          <Form.Item
            label={<span style={modalStyles.label}>Campaign Name</span>}
            name="campaign_name"
            rules={[{ required: true, message: "Please enter campaign name" }]}
          >
            <Input
              placeholder="Enter campaign name"
              className="ec-input"
              disabled={updateOpen}
              style={{ height: 44, color: updateOpen ? "#fff" : "#000", }}
            />
          </Form.Item>

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
                label: item.event_key,
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
              options={TYPE_OPTIONS}
              disabled={updateOpen}
              style={{ height: 44, color: updateOpen ? "#fff" : "#000", }}
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

      <TableHeader
        data={campaigns}
        showStatusFilter={false}
        showSearch={false}
        showExportButton={true}
        showCreateButton={true}
        exportFilename="email_campaigns"
        exportColumns={columns}
        getExportData={getCampaignsForExport}
        onCreate={() => setCreateOpen(true)}
      // showCreateButton={false}
      />

      {/* <div style={pageActionStyles.wrap}>

        <Button
          icon={<PlusOutlined />}
          onClick={() => setCreateOpen(true)}
          style={pageActionStyles.create}
        >
          Create
        </Button>
      </div> */}

      {/* Campaigns Table */}
      <ReusableTable
        columns={columns}
        data={campaigns}
        rowKey="id"
        loading={tableLoading}
        total={campaigns.length}
        pageSize={PAGE_SIZE}
        currentPage={page}
        onPageChange={(p) => setPage(p)}
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

      <UserPickerModal
        open={addUserOpen}
        title="Select Users"
        subtitle={selectedRow?.campaign_name || "Choose campaign recipients"}
        submitText="Add Users"
        submitLoading={addUserLoading}
        initialSelectedUsers={pickerSelectedUsers}
        userType={pickerUserType}
        onCancel={() => {
          setAddUserOpen(false);
          setSelectedCampaignId(undefined);
        }}
        onSubmit={handleAddUser}
        topContent={
          !selectedRow && (
            <>
              <label style={modalStyles.label}>Campaign</label>
              <Select
                placeholder="Select campaign"
                value={selectedCampaignId}
                onChange={setSelectedCampaignId}
                className="ec-select"
                style={{ height: 44, width: "100%", marginTop: 8 }}
                options={campaigns.map((campaign) => ({
                  label: campaign.campaign_name,
                  value: campaign.id,
                }))}
              />
            </>
          )
        }
      />

      {/* ── Delete Campaign Modal ── */}
      <ConfigProvider
        theme={{ token: { colorBgElevated: theme.sidebarSettings.backgroundColor } }}
      >
        <Modal
          open={deleteOpen}
          onCancel={() => { setDeleteOpen(false); setSelectedRow(null); }}
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
              <DeleteOutlined style={{ fontSize: 18, color: "#eb2724c9" }} />
            </div>
            <div>
              <p style={modalStyles.title}>Delete Campaign</p>
              <p style={modalStyles.subtitle}>This action is permanent.</p>
            </div>
          </div>

          <div style={modalStyles.divider} />

          <p style={{ color: "rgba(255,255,255,0.75)" }}>
            Are you sure you want to delete{" "}
            <b style={{ color: "#fff" }}>{selectedRow?.campaign_name || "this campaign"}</b>?
          </p>

          <div style={modalStyles.btnRow}>
            <Button
              onClick={() => { setDeleteOpen(false); setSelectedRow(null); }}
              style={modalStyles.cancelBtn}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              danger
              type="primary"
              onClick={handleDelete}
              loading={deleteLoading}
              style={{ ...modalStyles.submitBtn, background: "#eb2724c9", borderColor: "#eb2724c9", color: "#fff" }}
            >
              Delete
            </Button>
          </div>
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
