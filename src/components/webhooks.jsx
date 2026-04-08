import { useEffect, useState } from "react";
import ReusableTable from "../reuseable/ReusableTable";
import TableHeader from "../reuseable/TableHeader";
import theme from '../config/theme';
import ReusableModal from "../reuseable/ReusableModal";
import axios from "axios";
import { constant } from "../const";
import { message } from "antd";
import { useNavigate } from "react-router-dom";


const Webhook = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [networkOptions, setNetworkOptions] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [totalUsers, setTotalUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletemodal, setDeletemodal] = useState(false);
  const [deleteRecord, setDeleteRecord] = useState(null);


  const handleCreate = () => {
    setSelectedAsset(null);
    setOpen(true);
  };

  const handleUpdate = (record) => {
    setSelectedAsset(record);
    setOpen(true);
  };
  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ];
  const createFields = [
    {
      label: "Name",
      name: "name",
      span: 12,
      rules: [{ required: true, message: "Name is required" }],
    },
    {
      label: "Network Id",
      name: "network_id",
      type: "select",
      span: 12,
      options: networkOptions,
      rules: [{ required: true, message: "Network is required" }],
    },
  ];

  const updateFields = [
    {
      label: "Name",
      name: "name",
      span: 12,
      rules: [{ required: true, message: "Name is required" }],
    },
    {
      label: "Status",
      name: "status",
      type: "select",
      options: statusOptions,
      span: 12,
      rules: [{ required: true, message: "Status is required" }],
    },
  ];
  const modalFields = selectedAsset ? updateFields : createFields;


  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    const d = new Date(timestamp);

    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const fetchAlchemyWebhooks = async () => {
    const startTime = Date.now();

    try {
      setLoading(true);

      const res = await axios.get(
        `${constant.backend_url}/alchemy/get-all-webhooks`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (res.data?.success) {

        const users = res.data.data?.data || [];

        const tableData = users.map((user) => ({
          key: user?.id,
          id: user?.id,
          name: user?.name || "-",
          webtype: user?.webhook_type || "-",
          weburl: user?.webhook_url || "-",
          datetime: formatDate(user?.time_created),
          status: user?.is_active ? "Active" : "Inactive",
        }));

        setOriginalData(tableData);
        setTotalUsers(tableData);
      }

    } catch (error) {
      console.error("Error fetching webhooks:", error);
      setOriginalData([]);
      setTotalUsers([]);
    }
    finally {
      const elapsed = Date.now() - startTime;
      const remaining = 500 - elapsed;

      setTimeout(() => {
        setLoading(false);
      }, remaining > 0 ? remaining : 0);
    }
  };

  useEffect(() => {
    fetchAlchemyWebhooks();
  }, []);


  const getNetwork = async () => {
    try {
      const response = await axios.post(
        `${constant.backend_url}/assets/get-all-networks?page=1&limit=50`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (response.data?.success) {
        const netWorkdata = response.data.result.docs.map((item) => ({
          label: item?.networkName?.toUpperCase(),
          value: item?._id,
        }));

        setNetworkOptions(netWorkdata);
      } else {
        setNetworkOptions([]);
      }
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    getNetwork();
  }, []);

  const handleSubmit = async (values) => {
    try {
      const res = await axios.post(
        `${constant.backend_url}/alchemy/create-webhook`,
        values,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (res.data?.success) {
        message.success(res.data?.message);
        setOpen(false);
        fetchAlchemyWebhooks();
      } else {
        message.error(res.data?.message);
      }
    } catch (error) {
      
    }
  }
  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "web Type", dataIndex: "webtype", key: "webtype" },
    { title: "web Url", dataIndex: "weburl", key: "weburl" },
    { title: "Date/Time", dataIndex: "datetime", key: "datetime" },
    { title: "Status", dataIndex: "status", key: "status" },
  ];
  
  return (
    <div>
      <div
        className="mb-5 w-full rounded-lg bg-cover bg-center flex items-center header-content-img"
        // style={{
        //   backgroundImage: `url(${theme.dashboardheaderimg.image})`,
        //   height: theme.dashboardheaderimg.height
        // }}
      >
        <div className="display-3 w-full">
          <h1 className="text-white p-7 font-bold text-2xl">
            Alchemy webHook   </h1>
        </div>
      </div>
      <TableHeader
        data={originalData}
        onCreate={handleCreate}
      />
      <ReusableTable
        columns={columns}
        data={totalUsers}
        actionType={["update", "Remove","webhook"]}
        onView={(record, section) => {
          if (section === "webhookaddress") {
            navigate(`/wallet/${record.key}`, { state: record });
          }

          if (section === "webhook") {
            navigate(`/transaction/${record.key}`, { state: record });
          }
        }}
        onUpdate={handleUpdate}
        onDelete={(record) => {
          setDeleteRecord(record);
          setDeletemodal(true);
        }}
      />
      <ReusableModal
        open={open}
        setOpen={setOpen}
        fields={modalFields}
        onCancel={() => setOpen(false)}
        selectedAsset={selectedAsset}
        setSelectedAsset={setSelectedAsset}
        onSubmit={handleSubmit}
        title={selectedAsset ? "Update Webhook" : "Create Webhook"}
        description={selectedAsset ? "Update  the Webhook details below carefully " : "Please fill the details below carefully."}

        
      />
    </div>
  )
}

export default Webhook;