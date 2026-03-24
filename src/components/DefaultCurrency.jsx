import { useState } from "react";
import ReusableTable from "../reuseable/ReusableTable";
import ReusableModal from "../reuseable/ReusableModal";
import TableHeader from "../reuseable/TableHeader";

const DefaultCurrency = () => {

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const originalData = [
    {
      id: 1,
      name: "Webhook 1",
      webtype: "Deposit",
      weburl: "https://example.com/webhook",
      status: "Active"
    }
  ];

  const columns = [
    { title: "ID", dataIndex: "id" },
    { title: "Name", dataIndex: "name" },
    { title: "Web Type", dataIndex: "webtype" },
    { title: "Web URL", dataIndex: "weburl" },
    { title: "Status", dataIndex: "status" }
  ];

  const fields = [
    {
      label: "Name",
      name: "name",
      type: "text"
    },
    {
      label: "Web Type",
      name: "webtype",
      type: "text"
    },
    {
      label: "Web URL",
      name: "weburl",
      type: "text"
    },
    {
      label: "Status",
      name: "status",
      type: "select",
      options: [
        { label: "Active", value: "Active" },
        { label: "Inactive", value: "Inactive" }
      ]
    }
  ];

  const handleUpdate = (record) => {
    setSelectedRow(record);  // 👈 store row data
    setModalOpen(true);     
  };

  const handleSubmit = (values) => {
    console.log("Updated values:", values);
    setModalOpen(false);
  };

  return (
    <div>

      <div
        className="mb-5 w-full rounded-lg bg-cover bg-center flex items-center header-content-img"
      // style={{
      //     backgroundImage: `url(${theme.dashboardheaderimg.image})`,
      //     height: theme.dashboardheaderimg.height
      // }}
      >
        <div className="display-3 w-full">
          <h1 className="text-white p-7 font-bold text-2xl">
            Default Currency                </h1>
        </div>
      </div>

      <TableHeader
        data={originalData}
        showCreateButton={true}
      />

      <ReusableTable
        columns={columns}
        data={originalData}
        actionType="update"
        onUpdate={handleUpdate}   
      />

      <ReusableModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        title="Update Webhook"
        fields={fields}
        initialValues={selectedRow}   
      />

    </div>
  );
};

export default DefaultCurrency;