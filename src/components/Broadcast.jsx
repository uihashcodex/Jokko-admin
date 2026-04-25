import { useState, useEffect } from "react";
import {
  Button, Form, Input, Upload, Modal, message, ConfigProvider, Image, Tag
} from "antd";
import {
  NotificationOutlined, PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined
} from "@ant-design/icons";
import axios from "axios";
import { constant } from "../const";
import TableHeader from "../reuseable/TableHeader";
import ReusableTable from "../reuseable/ReusableTable";
import ReusableModal from "../reuseable/ReusableModal";
import DeleteAction from "../reuseable/DeleteAction";
import theme from "../config/theme";

const Broadcast = () => {
  const [createForm] = Form.useForm();
  const [updateForm] = Form.useForm();

  const [broadcasts, setBroadcasts] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteRecord, setDeleteRecord] = useState(null);

  const [createIconFile, setCreateIconFile] = useState(null);
  const [updateIconFile, setUpdateIconFile] = useState(null);
  const [createPreview, setCreatePreview] = useState(null);
  const [updatePreview, setUpdatePreview] = useState(null);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);



  const PAGE_SIZE = 10;
  const token = localStorage.getItem("adminToken");
  const authHeader = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchBroadcasts();
  }, [page]);

  // ── fetch ─────────────────────────────────────────────────────────────────
const fetchBroadcasts = async () => {
  setTableLoading(true);
  try {
    const { data } = await axios.get(
      `${constant.backend_url}/admin/get-broadcast`,
      {
        params: {
          page,
          limit:PAGE_SIZE,
        },
        headers: authHeader,
      }
    );

    if (data.success) {
      const rows = (data.result || []).map((item, i) => ({
        ...item,
        id: item._id,
     sno: (page - 1) * PAGE_SIZE + i + 1,
      }));

      setBroadcasts(rows);
setTotal(data.pagination?.total || 0);    
} else {
      message.error(data.message || "Failed to load broadcasts.");
    }
  } catch (error) {
    message.error("Failed to fetch broadcasts.");
  } finally {
    setTableLoading(false);
  }
};
  // ── create ────────────────────────────────────────────────────────────────
const handleCreate = async (values) => {
  if (!createIconFile) {
    message.error("Icon image is required");
    return;
  }

  setCreateLoading(true);

  try {
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("description", values.description);
    formData.append("icon", createIconFile); 

    const { data } = await axios.post(
      `${constant.backend_url}/admin/add-broadcast`,
      formData,
      {
        headers: {
          ...authHeader,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (data.success) {
      message.success(data.message || "Broadcast created!");
      
      // reset
      setCreateOpen(false);
      createForm.resetFields();
      setCreateIconFile(null);
      setCreatePreview(null);

      fetchBroadcasts();
    } else {
      message.error(data.message || "Failed to create broadcast.");
    }

  } catch (error) {
    // 🔥 BACKEND ERROR MESSAGE SHOW
    const errMsg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      "Something went wrong";

    message.error(errMsg);
  } finally {
    setCreateLoading(false);
  }
};
  // ── update ────────────────────────────────────────────────────────────────
const openUpdate = (record) => {
  setSelectedRow(record);
  setUpdatePreview(getImageUrl(record.icon) || null);
  setUpdateIconFile(null);
  updateForm.setFieldsValue({
    broadcastId: record._id,
    title: record.title,
    description: record.description,
  });
  setUpdateOpen(true);
};

  console.log("openUpdateopenUpdate", openUpdate)

  const handleUpdate = async (values) => {
    setUpdateLoading(true);
    try {
      const formData = new FormData();
      formData.append("broadcastId",selectedRow._id)
      formData.append("title", values.title);
      formData.append("description", values.description);
      if (updateIconFile) formData.append("icon", updateIconFile);

      const { data } = await axios.post(
        `${constant.backend_url}/admin/update-broadcast`,
        formData,
        { headers: { ...authHeader, "Content-Type": "multipart/form-data" } }
      );
      if (data.success) {
        message.success(data.message || "Broadcast updated!");
        setUpdateOpen(false);
        updateForm.resetFields();
        setUpdateIconFile(null);
        setUpdatePreview(null);
        fetchBroadcasts();
      } else {
        message.error(data.message || "Failed to update broadcast.");
      }
    } catch {
      message.error("Failed to update broadcast.");
    } finally {
      setUpdateLoading(false);
    }
  };

  console.log("handleUpdate", handleUpdate)

  // ── delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const { data } = await axios.post(
        `${constant.backend_url}/admin/delete-broadcast`,
         {
               broadcastId: deleteRecord.id,
          },
        { headers: authHeader,
        
         }
      );
      if (data.success) {
        message.success(data.message || "Broadcast deleted!");
        setDeleteRecord(null);
        fetchBroadcasts();
      } else {
        message.error(data.message || "Failed to delete broadcast.");
      }
    } catch {
      message.error("Failed to delete broadcast.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── icon upload helper ────────────────────────────────────────────────────
const makeUploadProps = (setFile, setPreview) => ({
  beforeUpload: (file) => {
    const isImage = file.type && file.type.startsWith("image/");
    if (!isImage) {
      message.error("Please upload an image file.");
      return Upload.LIST_IGNORE;
    }

    setFile(file);
    setPreview(URL.createObjectURL(file));
    return false;
  },
  maxCount: 1,
  showUploadList: false,
});

const getImageUrl = (icon) => {
  if (!icon) return "";

  let imageUrl = String(icon).trim();
  imageUrl = imageUrl.replace("/testapi", "/jokkoapi");

  console.log(imageUrl, "fsdfsdfsd")

  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }

  return `${constant.image_url}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
};

  
  // ── table columns ─────────────────────────────────────────────────────────
const columns = [
  { title: "S.No", dataIndex: "sno", width: 60 },
{
  title: "Icon",
  dataIndex: "icon",
  width: 100,
  render: (v) => {
    const imageUrl = getImageUrl(v);

    return imageUrl ? (
      <Image
        src={imageUrl}
        width={40}
        height={40}
        style={{ borderRadius: 8, objectFit: "cover" }}
        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
      />
    ) : (
      <div style={styles.iconPlaceholder}>
        <NotificationOutlined style={{ color: "#c9f07b", fontSize: 18 }} />
      </div>
    );
  },
},
  { title: "Title", dataIndex: "title" },
  {
    title: "Description",
    dataIndex: "description",
    render: (v) => (v ? (v.length > 60 ? `${v.slice(0, 60)}…` : v) : "-"),
  },
  {
    title: "Status",
    dataIndex: "verifyStatus",
    render: (v) => (
      <Tag color={v ? "green" : "red"}>
        {v ? "Active" : "In Active"}
      </Tag>
    ),
  },
  {
    title: "Created At",
    dataIndex: "createdAt",
    render: (v) => (v ? v.split("T")[0] : "-"),
  },
  {
    title: "Actions",
    key: "actions",
    fixed: "right",
    render: (_, record) => (
      <div style={{ display: "flex", gap: 8 }}>
        <Button
          size="small"
          icon={<EditOutlined />}
          onClick={() => openUpdate(record)}
          style={btnStyles.update}
        >
          Update
        </Button>
        <DeleteAction
          buttonVariant="solid"
          title="Delete Broadcast"
          description={
            <>
              Are you sure you want to delete{" "}
              <strong style={{ color: "#fff" }}>{record?.title}</strong>? This cannot be undone.
            </>
          }
          loading={deleteLoading && deleteRecord?.id === record?.id}
          onOpen={() => setDeleteRecord(record)}
          onConfirm={async () => {
            setDeleteRecord(record);
            await handleDelete();
          }}
          onClose={() => setDeleteRecord(null)}
        />
      </div>
    ),
  },
];


const clearPreview = (setFile, preview, setPreview) => {
  if (preview && preview.startsWith("blob:")) {
    URL.revokeObjectURL(preview);
  }
  setFile(null);
  setPreview(null);
};

  // ── shared form body (used in both create & update modals) ────────────────
  const BroadcastForm = ({ form, onFinish, loading, iconFile, setIconFile, preview, setPreview, submitLabel = "Submit" }) => (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item
        label={<span style={modalStyles.label}>Title</span>}
        name="title"
        rules={[{ required: true, message: "Title is required" }]}
      >
        <Input placeholder="Enter broadcast title" className="bc-input" />
      </Form.Item>

      <Form.Item
        label={<span style={modalStyles.label}>Description</span>}
        name="description"
        rules={[{ required: true, message: "Description is required" }]}
      >
        <Input.TextArea
          placeholder="Enter broadcast description"
          rows={4}
          className="bc-input"
          style={{ resize: "none" }}
        />
      </Form.Item>
<Form.Item label={<span style={modalStyles.label}>Icon / Image</span>}>
  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
    <Upload {...makeUploadProps(setIconFile, setPreview)}>
      <Button icon={<UploadOutlined />} style={modalStyles.uploadBtn}>
        {iconFile ? "Change Icon" : "Upload Icon"}
      </Button>
    </Upload>

    {preview && (
      <Image
        src={preview}
        width={56}
        height={56}
        style={{
          borderRadius: 10,
          objectFit: "cover",
          border: "1px solid rgba(201,240,123,0.3)",
        }}
      />
    )}
  </div>
</Form.Item>

      <div style={modalStyles.btnRow}>
 <Button
  onClick={() => {
    form.resetFields();
    clearPreview(setIconFile, preview, setPreview);
  }}
  style={modalStyles.cancelBtn}
>
  Clear
</Button>
        <Button
          htmlType="submit"
          loading={loading}
          style={modalStyles.submitBtn}
          className="bc-submit-btn"
        >
          {submitLabel}
        </Button>
      </div>
    </Form>
  );

  return (
    <div>
      {/* Page Header */}
      <div className="mb-5 w-full rounded-lg bg-cover bg-center flex items-center header-content-img">
        <div className="display-3 w-full">
          <h1 className="text-white p-7 font-bold text-2xl">Broadcast</h1>
        </div>
      </div>

      <TableHeader
        data={broadcasts}
        showStatusFilter={false}
        showSearch={false}
        showCreateButton
        showExportButton={true}
        exportFilename="broadcast"
        exportColumns={columns}
        onCreate={() => setCreateOpen(true)}
      />
<ReusableTable
  columns={columns}
  data={broadcasts}
  rowKey="id"
  loading={tableLoading}
  total={total}
  pageSize={PAGE_SIZE}
  currentPage={page}
  onPageChange={(p) => setPage(p)}
  actionType={[]}
/>

      {/* ── Create Modal ── */}
      <ConfigProvider theme={{ token: { colorBgElevated: theme.sidebarSettings.backgroundColor } }}>
        <Modal
          open={createOpen}
          onCancel={() => { setCreateOpen(false); createForm.resetFields(); setCreateIconFile(null); setCreatePreview(null); }}
          footer={null}
          centered
          width="90%"
          style={{ maxWidth: 560 }}
          destroyOnHidden
          className="custom-modal modal-style"
          styles={{
            content: { background: theme.sidebarSettings.backgroundColor, borderRadius: 12 },
            body: { paddingTop: 20, paddingBottom: 20 },
          }}
        >
          <div style={modalStyles.header}>
            <div style={modalStyles.iconWrap}>
              <NotificationOutlined style={{ fontSize: 18, color: "#c9f07b" }} />
            </div>
            <div>
              <p style={modalStyles.title}>Create Broadcast</p>
              <p style={modalStyles.subtitle}>Fill in the details to create a new broadcast.</p>
            </div>
          </div>
          <div style={modalStyles.divider} />
          <BroadcastForm
            form={createForm}
            onFinish={handleCreate}
            loading={createLoading}
            iconFile={createIconFile}
            setIconFile={setCreateIconFile}
            preview={createPreview}
            setPreview={setCreatePreview}
            submitLabel="Create"
          />
        </Modal>
      </ConfigProvider>

      {/* ── Update Modal ── */}
      <ConfigProvider theme={{ token: { colorBgElevated: theme.sidebarSettings.backgroundColor } }}>
        <Modal
          open={updateOpen}
          onCancel={() => { setUpdateOpen(false); updateForm.resetFields(); setUpdateIconFile(null); setUpdatePreview(null); }}
          footer={null}
          centered
          width="90%"
          style={{ maxWidth: 560 }}
          destroyOnHidden
          className="custom-modal modal-style"
          styles={{
            content: { background: theme.sidebarSettings.backgroundColor, borderRadius: 12 },
            body: { paddingTop: 20, paddingBottom: 20 },
          }}
        >
          <div style={modalStyles.header}>
            <div style={modalStyles.iconWrap}>
              <EditOutlined style={{ fontSize: 18, color: "#c9f07b" }} />
            </div>
            <div>
              <p style={modalStyles.title}>Update Broadcast</p>
              <p style={modalStyles.subtitle}>Edit the broadcast details below.</p>
            </div>
          </div>
          <div style={modalStyles.divider} />
          <BroadcastForm
            form={updateForm}
            onFinish={handleUpdate}
            loading={updateLoading}
            iconFile={updateIconFile}
            setIconFile={setUpdateIconFile}
            preview={updatePreview}
            setPreview={setUpdatePreview}
            submitLabel="Update"
          />
        </Modal>
      </ConfigProvider>

      <style>{`
        .bc-input {
          background-color: #0e2e2a !important;
          border: 1px solid #2e5e4e !important;
          color: #fff !important;
          border-radius: 8px !important;
        }
        .bc-input:hover, .bc-input:focus {
          border-color: #c9f07b !important;
          box-shadow: 0 0 0 2px rgba(201,240,123,0.12) !important;
        }
        .bc-input::placeholder { color: rgba(255,255,255,0.35) !important; }
        .bc-input.ant-input-textarea textarea {
          background-color: #0e2e2a !important;
          color: #fff !important;
          border-radius: 8px !important;
        }
        .bc-submit-btn:hover {
          background-color: #b0d660 !important;
          border-color: #b0d660 !important;
        }
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
  delete: {
    background: "#eb2724c9",
    border: "none",
    color: "#fff",
    borderRadius: 6,
  },
};

const modalStyles = {
  header: { display: "flex", alignItems: "center", gap: 14, marginBottom: 16 },
  iconWrap: {
    width: 40, height: 40, borderRadius: 10,
    background: "rgba(201,240,123,0.1)",
    border: "1px solid rgba(201,240,123,0.25)",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  title: { color: "#fff", fontWeight: 700, fontSize: 16, margin: 0 },
  subtitle: { color: "rgba(255,255,255,0.45)", fontSize: 12, margin: 0, marginTop: 2 },
  divider: { height: 1, background: "rgba(255,255,255,0.07)", marginBottom: 20 },
  label: { color: "rgba(255,255,255,0.85)", fontWeight: 600, fontSize: 14 },
  uploadBtn: {
    background: "rgba(201,240,123,0.1)",
    border: "1px solid rgba(201,240,123,0.3)",
    color: "#c9f07b",
    borderRadius: 8,
  },
  btnRow: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 },
  cancelBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "rgba(255,255,255,0.65)",
    borderRadius: 8, height: 40,
  },
  submitBtn: {
    background: "#c9f07b", borderColor: "#c9f07b",
    color: "#000", fontWeight: 700,
    borderRadius: 8, height: 40, paddingInline: 24,
  },
};

const styles = {
  iconPlaceholder: {
    width: 40, height: 40, borderRadius: 8,
    background: "rgba(201,240,123,0.08)",
    border: "1px solid rgba(201,240,123,0.2)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
};

export default Broadcast;
