import { useEffect, useState } from "react";
import ReusableTable from "../reuseable/ReusableTable";
import TableHeader from "../reuseable/TableHeader";
import { message } from "antd";
import axios from "axios";
import { constant } from "../const";
import ReusableModal from "../reuseable/ReusableModal";


const PAGE_SIZE = 10;

const BuySellCrypto = () => {
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
    { title: "Token Name", dataIndex: "tokenName", key: "tokenName" },
    { title: "Token Symbol", dataIndex: "tokenSymbol", key: "tokenSymbol" },
    { title: "Code", dataIndex: "code", key: "code" },
    { title: "Status", dataIndex: "verifyStatus", key: "verifyStatus" },
  ];

  const authHeader = {
    Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
  };

  const formatAssets = (docs = [], pageNumber = 1, pageLimit = PAGE_SIZE) =>
    docs.map((item, index) => ({
      id: item._id,
      sno: (pageNumber - 1) * pageLimit + index + 1,
      tokenName: item.tokenName || item.name || "-",
      tokenSymbol: item.tokenSymbol || item.symbol || "-",
      code: item.code || item.tokenSymbol || "-",
      verifyStatus: item.verifyStatus === true ? "active" : "inactive",
    }));





  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || "",
    }));
    setPage(1);
  };

  const fetchAssets = async () => {
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
        `${constant.backend_url}/admin/buysell-assets`,
        payload,
        { headers: authHeader }
      );

      if (data.success) {
        const docs = data.result || [];
        const formatted = formatAssets(docs, page, PAGE_SIZE);

        setTableData(formatted);
        setTotal(data.total || 0);
      } else {
        messageApi.error(data.message || "Failed to fetch assets.");
      }
    } catch (error) {
      if (error?.response?.status === 401) return;
      messageApi.error("Failed to fetch crypto assets.");
    } finally {
      setLoading(false);
    }
  };

  const getAssetsForExport = async () => {
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
        `${constant.backend_url}/admin/buysell-assets`,
        payload,
        { headers: authHeader }
      );

      if (!data.success) break;
      rows.push(...formatAssets(data.result || [], pageNumber, PAGE_SIZE));
    }

    return rows;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAssets();
    }, 400);

    return () => clearTimeout(timer);
  }, [page, filters.search, filters.verifyStatus]);




        const handleDelete = async (userId) => {
        try {
            setLoading(true);

            const res = await axios.post(
                `${constant.backend_url}/admin/delete-crypto`,
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
                message.success("Crypto Deleted successfully");
                setDeletemodal(false);
                fetchAssets();
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

  const handleStatusChange = async (record, newStatus) => {
    try {
      const { data } = await axios.post(
        `${constant.backend_url}/admin/buysell-updateAsset`,
        {
          token_id: record.id,
          verifyStatus: newStatus === "active",
        },
        { headers: authHeader }
      );

      if (data.success) {
        messageApi.success(data.message || "Status updated successfully");
        fetchAssets();
      } else {
        messageApi.error(data.message || "Failed to update status.");
      }
    } catch (error) {
      if (error?.response?.status === 401) return;
      messageApi.error("Failed to update status.");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", flexDirection: "column", width: "100%" }}>
      {contextHolder}

      <div className="mb-5 w-full rounded-lg bg-cover bg-center flex items-center header-content-img">
        <div className="display-3 w-full">
          <h1 className="text-white p-7 font-bold text-2xl">Buy/Sell Crypto</h1>
        </div>
      </div>

      <TableHeader
        data={tableData}
        showCreateButton={false}
        showStatusFilter={true}
        showSearch={true}
        showExportButton={true}
        exportFilename="buysell_crypto"
        exportColumns={columns}
        getExportData={getAssetsForExport}
        onSearch={(value) => updateFilter("search", value)}
        onVerifyChange={(value) => updateFilter("verifyStatus", value)}
        searchTooltip="Search by Token Name, Token Symbol, Code"
        placeHolder="Search by token name, symbol or code"
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
  title="Delete Asset?"
  description={"Are you sure you want to delete this Asset?"}
  showFooter={false}
  extraContent={
    <div className="text-center">

      <p className="text-gray-300 text-base">
        Are you sure you want to delete this Asset?
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

export default BuySellCrypto;
