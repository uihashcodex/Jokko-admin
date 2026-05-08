import { useEffect, useMemo, useState } from "react";
import { message, Tag } from "antd";
import { BellOutlined } from "@ant-design/icons";
import axios from "axios";
import { constant } from "../const";
import ExportButton from "../reuseable/ExportButton";
import ReusableTable from "../reuseable/ReusableTable";
import DeleteAction from "../reuseable/DeleteAction";
import TableHeader from "../reuseable/TableHeader";
import ReusableModal from "../reuseable/ReusableModal";

const PushNotification = () => {
  const [open, setOpen] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const authHeader = useMemo(
    () => ({
      Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
    }),
    []
  );

  const fetchNotifications = async (nextPage = page) => {
    setListLoading(true);
    try {
      const { data } = await axios.get(
        `${constant.backend_url}/admin/push-notifications?page=${nextPage}&limit=${pageSize}`,
        { headers: authHeader }
      );

      if (data?.success) {
        const items = data?.result?.items || [];
        setNotifications(items.map((n) => ({ ...n, key: n._id })));
        setTotal(data?.result?.total || 0);
        setPage(data?.result?.page || nextPage);
      } else {
        message.error(data?.message || "Failed to load notifications");
      }
    } catch (e) {
      message.error("Failed to load notifications");
    } finally {
      setListLoading(false);
    }
  };

  const getNotificationsForExport = async () => {
    const { data } = await axios.get(
      `${constant.backend_url}/admin/push-notifications?page=1&limit=${total || 100000}`,
      { headers: authHeader }
    );

    if (!data?.success) return [];
    return (data?.result?.items || []).map((n) => ({ ...n, key: n._id }));
  };

  useEffect(() => {
    fetchNotifications(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = async (values) => {
    setSendLoading(true);
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
        setOpen(false);
        fetchNotifications(1);
      } else {
        message.error(data.message);
      }
    } catch {
      message.error("Failed to send notification.");
    } finally {
      setSendLoading(false);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      const { data } = await axios.post(
        `${constant.backend_url}/admin/delete-push-notification`,
        { notificationId },
        { headers: authHeader }
      );

      if (data?.success) {
        message.success(data?.message || "Deleted");
        fetchNotifications(page);
      } else {
        message.error(data?.message || "Delete failed");
      }
    } catch (e) {
      message.error("Delete failed");
    }
  };

  const listColumns = [
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v) => (v ? new Date(v).toLocaleString() : "-"),
    },
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Body", dataIndex: "body", key: "body" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (v) => {
        const val = String(v || "").toLowerCase();
        const color = val === "sent" ? "green" : val === "failed" ? "red" : "gold";
        return <Tag color={color}>{val || "-"}</Tag>;
      },
    },
    // {
    //   title: "User Id",
    //   dataIndex: "user_id",
    //   key: "user_id",
    //   render: (v) => (v ? String(v) : "-"),
    // },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <DeleteAction
          title="Delete Notification"
          description={
            <div>
              This will permanently delete this notification record from the database.
            </div>
          }
          confirmText="Delete"
          onConfirm={() => handleDeleteNotification(record?._id)}
        />
      ),
    },
  ];

  const modalFields = [
    {
      label: "Title",
      name: "title",
      type: "text",
      placeholder: "e.g. Maintenance Notice",
      rules: [{ required: true, message: "Title is required" }],
    },
    {
      label: "Content",
      name: "body",
      type: "textarea",
      placeholder: "Write the notification message…",
      rules: [{ required: true, message: "Content is required" }],
    },
  ];

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

      <TableHeader
        data={notifications}
        showSearch={false}
        showStatusFilter={false}
        showPrivateFilter={false}
        showNetFilter={false}
        showNetworkFilter={false}
        showDateFilter={false}
        showCreateButton={true}
        onCreate={() => setOpen(true)}
        showExportButton={true}
        exportFilename="push_notifications"
        exportColumns={listColumns.filter((c) => c.dataIndex)}
        getExportData={getNotificationsForExport}
      />

      <ReusableTable
        columns={listColumns}
        data={notifications}
        loading={listLoading}
        rowKey="key"
        pageSize={pageSize}
        total={total}
        currentPage={page}
        onPageChange={(p) => {
          setPage(p);
          fetchNotifications(p);
        }}
        actionType={[]}
      />

      <ReusableModal
        open={open}
        onCancel={() => setOpen(false)}
        onSubmit={handleSend}
        title="Create Push Notification"
        description="Send a push notification to all users who have an active device token."
        fields={modalFields}
        initialValues={{}}
        maskClosable={false}
      />

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

export default PushNotification;
