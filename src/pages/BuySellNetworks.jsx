import { useEffect, useState } from "react";
import ReusableTable from "../reuseable/ReusableTable";
import TableHeader from "../reuseable/TableHeader";
import { message } from "antd";
import axios from "axios";
import { constant } from "../const";
import ReusableModal from "../reuseable/ReusableModal";


const PAGE_SIZE = 10;

const BuySellNetworks = () => {
  const [tableData, setTableData] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

      const [deletemodal, setDeletemodal] = useState(false);
    const [deleteRecord, setDeleteRecord] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    verifyStatus: "",
  });

  const columns = [
    { title: "S.no", dataIndex: "sno", key: "sno" },
    { title: "Network Name", dataIndex: "tokenName", key: "tokenName" },
    { title: "Network Symbol", dataIndex: "networkSymbol", key: "networkSymbol" },
    { title: "Status", dataIndex: "verifyStatus", key: "verifyStatus" },
  ];

  const authHeader = {
    Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
  };

  const formatNetworks = (docs = [], pageNumber = 1, pageLimit = PAGE_SIZE) =>
    docs.map((item, index) => ({
      id: item._id,
      sno: (pageNumber - 1) * pageLimit + index + 1,
      tokenName: item.networkName || "-",
      networkSymbol: item.networkSymbol || "-",
      verifyStatus: item.verifyStatus === true ? "active" : "inactive",
    }));

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || "",
    }));
    setPage(1);
  };

  const fetchNetworks = async () => {
    setLoading(true);

    try {
      const payload = {
        page,
        limit: PAGE_SIZE,
        search: filters.search,
      };

      if (filters.verifyStatus) {
        payload.status = filters.verifyStatus === "active" ? "true" : "false";
      }

      const { data } = await axios.post(
        `${constant.backend_url}/admin/buysell-getnetworks`,
        payload,
        { headers: authHeader }
      );

      if (data.success) {
        const docs = data.result || [];
        const formatted = formatNetworks(docs, page, PAGE_SIZE);

        setTableData(formatted);
        setTotal(data.total || 0);
      } else {
        messageApi.error(data.message || "Failed to fetch networks.");
      }
    } catch (error) {
      if (error?.response?.status === 401) return;
      messageApi.error("Failed to fetch networks.");
    } finally {
      setLoading(false);
    }
  };

  const getNetworksForExport = async () => {
    const totalPages = Math.max(1, Math.ceil((total || 0) / PAGE_SIZE));
    const rows = [];

    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
      const payload = {
        page: pageNumber,
        limit: PAGE_SIZE,
        search: filters.search,
      };

      if (filters.verifyStatus) {
        payload.status = filters.verifyStatus === "active" ? "true" : "false";
      }

      const { data } = await axios.post(
        `${constant.backend_url}/admin/buysell-getnetworks`,
        payload,
        { headers: authHeader }
      );

      if (!data.success) break;
      rows.push(...formatNetworks(data.result || [], pageNumber, PAGE_SIZE));
    }

    return rows;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNetworks();
    }, 400);

    return () => clearTimeout(timer);
  }, [page, filters.search, filters.verifyStatus]);

  const handleStatusChange = async (record, newStatus) => {
    try {
      const { data } = await axios.post(
        `${constant.backend_url}/admin/buysell-network`,
        {
          network_id: record.id,
          verifyStatus: newStatus === "active",
        },
        { headers: authHeader }
      );

      if (data.success) {
        messageApi.success(data.message || "Status updated successfully");
        fetchNetworks();
      } else {
        messageApi.error(data.message || "Failed to update status.");
      }
    } catch (error) {
      if (error?.response?.status === 401) return;
      messageApi.error("Failed to update status.");
    }
  };




        const handleDelete = async (userId) => {
        try {
            setLoading(true);

            const res = await axios.post(
                `${constant.backend_url}/admin/delete-network`,
                {
                    userId
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                    },
                }
            );

            if (res.data?.success) {
                message.success("Buy/Sell Network Deleted successfully");
                setDeletemodal(false);
                fetchNetworks();
            } else {
                message.warning(res.data.message || "Delete failed");
            }

        } catch (error) {
            console.log(error);
            message.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };


  return (
    <div style={{ display: "flex", justifyContent: "center", flexDirection: "column", width: "100%" }}>
      {contextHolder}

      <div className="mb-5 w-full rounded-lg bg-cover bg-center flex items-center header-content-img">
        <div className="display-3 w-full">
          <h1 className="text-white p-7 font-bold text-2xl">Buy/Sell Networks</h1>
        </div>
      </div>

      <TableHeader
        data={tableData}
        showCreateButton={false}
        showStatusFilter={true}
        showSearch={true}
        showExportButton={true}
        exportFilename="buysell_networks"
        exportColumns={columns}
        getExportData={getNetworksForExport}
        onSearch={(value) => updateFilter("search", value)}
        onVerifyChange={(value) => updateFilter("verifyStatus", value)}
        searchTooltip="Search by Network Name, Symbol"
        placeHolder="Search by network name, symbol"
      />

      <ReusableTable
        columns={columns}
        data={tableData}
        pageSize={PAGE_SIZE}
        total={total}
        currentPage={page}
        onPageChange={(p) => setPage(p)}
        loading={loading}
        actionType={["status","Remove"]}
               onDelete={(record) => {
        setDeleteRecord(record);
        setDeletemodal(true);
    }}
        onStatusChange={handleStatusChange}
      />


                          <ReusableModal
  open={deletemodal}
  onCancel={() => setDeletemodal(false)}
  title="Delete Buy/sell Network?"
  description={"Are you sure you want to delete this Buy/sell Network?"}
  showFooter={false}
  extraContent={
    <div className="text-center">

      <p className="text-gray-300 text-base">
        Are you sure you want to delete this Buy/sell Network?
      </p>

      <div className="flex justify-between gap-4 mt-6">

        {/* ❌ NO BUTTON FIX */}
        <button
          className="px-6 py-2 rounded primaty-bg text-black"
          onClick={() => setDeletemodal(false)}
        >
          No
        </button>

        {/* ❌ YES BUTTON FIX */}
        <button
          className="px-6 py-2 rounded bg-red-600 text-white"
onClick={() => handleDelete(deleteRecord?.id)}        >
          Yes
        </button>

      </div>

    </div>
  }
/>
    </div>
  );
};

export default BuySellNetworks;
