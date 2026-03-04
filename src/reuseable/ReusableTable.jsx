import { Table, Dropdown, Button } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { Empty } from "antd";

const ReusableTable = ({
  columns = [],
  data = [],
  loading = false,
  rowKey = "id",
  pageSize = 5,
  onUpdate,
  onView,
  onEdit,
  onBlock,
  onUnblock,
  onDelete,
  title,
  extra,
  actionType = "update",
  actionLabel = "Update",
}) => {

  let updatedColumns = [...columns];
console.log(data,"data");

// if (actionType) {
//   updatedColumns.push({
//     title: "Action",
//     key: "action",
//     render: (_, record) => {

//       if (actionType === "view") {
//         const items = [
//           { key: "transaction", label: "Transaction" },
//           { key: "wallet", label: "Wallet" },
//         ];

//         return (
//           <Dropdown
//             menu={{
//               items,
//               onClick: ({ key }) => onView?.(record, key),
//             }}
//             trigger={["click"]}
//           >
//             <Button>
//               Select <DownOutlined />
//             </Button>
//           </Dropdown>
//         );
//       }

//       if (actionType === "action") {
//         const items = [
//           { key: "edit", label: "Edit" },
//           { key: "delete", label: "Delete" },
//         ];

//         return (
//           <Dropdown
//             menu={{
//               items,
//               onClick: ({ key }) => {
//                 if (key === "edit") onEdit?.(record);
//                 if (key === "delete") onDelete?.(record);
//               },
//             }}
//             trigger={["click"]}
//           >
//             <Button>
//               Action <DownOutlined />
//             </Button>
//           </Dropdown>
//         );
//       }

//       if (actionType === "block") {
//         const items = [
//           { key: "block", label: "Block" },
//           { key: "unblock", label: "UnBlock" },
//         ];

//         return (
//           <Dropdown
//             menu={{
//               items,
//               onClick: ({ key }) => {
//                 if (key === "block") onBlock?.(record);
//                 if (key === "unblock") onUnblock?.(record);
//               },
//             }}
//             trigger={["click"]}
//           >
//             <Button>
//               Action <DownOutlined />
//             </Button>
//           </Dropdown>
//         );
//       }

//       return (
//         <Button type="primary" onClick={() => onUpdate?.(record)}>
//           {actionLabel}
//         </Button>
//       );
//     },
//   });
// }

if (actionType?.includes("view")) {
  updatedColumns.push({
    title: "Action",
    key: "action",
    render: (_, record) => {

      const items = [
        { key: "transaction", label: "Transaction" },
        { key: "wallet", label: "Wallet" },
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

      const items = [
        { key: "block", label: "Block" },
        { key: "unblock", label: "UnBlock" },
      ];

      return (
        <Dropdown
          menu={{
            items,
            onClick: ({ key }) => {
              if (key === "block") onBlock?.(record);
              if (key === "unblock") onUnblock?.(record);
            },
          }}
          trigger={["click"]}
        >
          <Button>
            Block <DownOutlined />
          </Button>
        </Dropdown>
      );
    },
  });
}

if (actionType === "action") {
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
        pagination={{ pageSize }}
        scroll={{ x: "max-content" }}
        className="custom-ant-table"
        locale={{
          emptyText: (
            <Empty  className="empty-data"
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
