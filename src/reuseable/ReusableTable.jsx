import { Table, Dropdown, Button } from "antd";
import { DownOutlined } from "@ant-design/icons";
import Select from "./SelectField";
import { Empty } from "antd";
// import { Select } from "antd";


const ReusableTable = ({
  columns = [],
  data = [],
  loading = false,
  rowKey = "id",
  pageSize = 5,
  total = 0,
  currentPage = 1,
  onPageChange,
  onUpdate,
  onView,
  onEdit,
  onBlock,
  onUnblock,
  onStatusChange,
  onDelete,
  title,
  extra,
  actionType = "update",
  actionLabel = "Update",
  actionRemove = "Delete",
}) => {

  let updatedColumns = [...columns];
  console.log(data, "data");


  if (actionType?.includes("view")) {
    updatedColumns.push({
      title: "Action",
      key: "action",
      render: (_, record) => {

        const items = [
          { key: "transaction", label: "Transaction" },
          { key: "wallet", label: "Wallet" },
          { key: "coinrabbit", label: "CoinRabbit" },
          { key: "onramper", label: "OnRamper" },
        ];

        return (
          <Dropdown
            menu={{
              items,
              onClick: ({ key }) => onView?.(record, key),
            }}
            trigger={["click"]}
          >
            <Button>
              Select <DownOutlined />
            </Button>
          </Dropdown>
        );
      },
    });
  }
  if (actionType?.includes("webhook")) {
    updatedColumns.push({
      title: "Webhook",
      key: "webhook",
      render: (_, record) => {

        const items = [
          { key: "webhookaddress", label: "Webhook Address" },
          { key: "webhook", label: "Webhook" },
        ];

        return (
          <Dropdown
            menu={{
              items,
              onClick: ({ key }) => onView?.(record, key),
            }}
            trigger={["click"]}
          >
            <Button>
              Select <DownOutlined />
            </Button>
          </Dropdown>
        );
      },
    });
  }

  if (actionType?.includes("block")) {
    updatedColumns.push({
      title: "Block Users",
      key: "block",
      render: (_, record) => {

        const isBlocked = record.status === "Inactive";

        return (
          <Select
            value={isBlocked ? "block" : "unblock"}
            style={{ width: 120 }}
            onChange={(value) => {
              if (value === "block" && !isBlocked) {
                onBlock?.(record);
              }

              if (value === "unblock" && isBlocked) {
                onBlock?.(record);
              }
            }}
            options={[
              { value: "block", label: "Block" },
              { value: "unblock", label: "Unblock" },
            ]}
          />
        );
      },
    });
  }

  if (actionType?.includes("status")) {
    updatedColumns.push({
      title: "Status",
      key: "statusAction",
      render: (_, record) => {

        const isActive = record.verifyStatus === "active";

        return (
          <Select
            value={isActive ? "active" : "inactive"}
            style={{ width: 120 }}
            onChange={(value) => {
              if (value === "active" && !isActive) {
                onStatusChange?.(record, "active");
              }

              if (value === "inactive" && isActive) {
                onStatusChange?.(record, "inactive");
              }
            }}
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
          />
        );
      },
    });
  }

  if (actionType?.includes("action")) {
    updatedColumns.push({
      title: "Manage",
      key: "manage",
      render: (_, record) => {

        const items = [
          { key: "edit", label: "Edit" },
          { key: "delete", label: "Delete" },
        ];

        return (
          <Dropdown
            menu={{
              items,
              onClick: ({ key }) => {
                if (key === "edit") onEdit?.(record);
                if (key === "delete") onDelete?.(record);
              },
            }}
            trigger={["click"]}
          >
            <Button>
              Manage <DownOutlined />
            </Button>
          </Dropdown>
        );
      },
    });
  }


  if (actionType?.includes("update")) {
    updatedColumns.push({
      title: "Update",
      key: "update",
      render: (_, record) => (
        <Button type="primary" onClick={() => onUpdate?.(record)}>
          {actionLabel || "Update"}
        </Button>
      ),
    });
  }


  if (actionType?.includes("viewMore")) {
    updatedColumns.push({
      title: "View",
      key: "view",
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => onView?.(record)}
          style={{ background: "#c9f07b", color: "#000" }}
        >
          View
        </Button>
      ),
    });
  }

  if (actionType?.includes("Remove")) {
    updatedColumns.push({
      title: "Action",
      key: "delete",
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => onDelete?.(record)}   // ✅ FIXED
          style={{ background: "#eb2724c9", color: "#fff" }}
        >
          {actionRemove || "Delete"}
        </Button>
      ),
    });
  }
  return (
    <>
      {(title) && (
        <div
          // style={{
          //   display: "flex",
          //   justifyContent: "space-between",
          //   alignItems: "center",
          //   marginBottom: 16,
          // }}
          className="flex flex-col md:flex-row justify-between items-center mb-4"
        >
          <h2 style={{ fontWeight: 600, fontSize: 22, margin: 3 }}>
            {title}
          </h2>

          {extra && extra}
        </div>
      )}
      <Table
        columns={updatedColumns}
        dataSource={data}
        loading={loading}
        rowKey={rowKey}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: total,
          onChange: (page) => onPageChange?.(page),

          hideOnSinglePage: true,
        }}
        scroll={{ x: "max-content" }}
        className="custom-ant-table"
        locale={{
          emptyText: (
            <Empty className="empty-data"
              description={
                <span style={{ color: "#c9f07b", fontWeight: 500 }}>
                  No Data Found
                </span>
              }
            />
          ),
        }}
      />
    </>
  );
};

export default ReusableTable;
