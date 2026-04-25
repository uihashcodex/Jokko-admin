import { useEffect, useMemo, useState } from "react";
import ReusableTable from "../reuseable/ReusableTable";
import TableHeader from "../reuseable/TableHeader";
import { message } from "antd";
import axios from "axios";
import { constant } from "../const";
import ReusableModal from "../reuseable/ReusableModal";


const columns = [
  { title: "S.no",         dataIndex: "sno",          key: "sno"          },
  { title: "Network",   dataIndex: "tokenName",    key: "tokenName"    },
  // { title: "Token Symbol", dataIndex: "tokenSymbol",  key: "tokenSymbol"  },
  { title: "Code",         dataIndex: "code",         key: "code"         },
  // { title: "Type",         dataIndex: "type",         key: "type"         },
  { title: "Status",       dataIndex: "verifyStatus", key: "verifyStatus" },
];

const PAGE_SIZE = 10;

const CoinRabbitCrypto = () => {
  const [allData, setAllData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const [filters, setFilters] = useState({ search: "", type: "", verifyStatus: "" });

  const authHeader = { Authorization: `Bearer ${localStorage.getItem("adminToken")}` };


      const [deletemodal, setDeletemodal] = useState(false);
    const [deleteRecord, setDeleteRecord] = useState(null);

  const typeOptions = useMemo(() => [
    { label: "Buy",  value: "Buy"  },
    { label: "Sell", value: "Sell" },
  ], []);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value || "" }));
    setPage(1);
  };

  // ── fetch ─────────────────────────────────────────────────────────────────
  const fetchCrypto = async (search = "") => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${constant.backend_url}/admin/coinrabbit-getCrypto`,
        { search },
        { headers: authHeader }
      );
      if (data.success) {
        const docs = data.result || data.data || [];
        const formatted = docs.map((item) => ({
          id:           item._id,
          tokenName:    item.tokenName   || item.name   || "-",
          tokenSymbol:  item.tokenSymbol || item.symbol || "-",
          code:         item.code        || item.tokenSymbol || "-",
          type:         item.type        || "-",
          verifyStatus: item.verifyStatus === true ? "active" : "inactive",
        }));
        setAllData(formatted);
      } else {
        messageApi.error(data.message || "Failed to fetch crypto.");
      }
    } catch {
      messageApi.error("Failed to fetch CoinRabbit crypto.");
    } finally {
      setLoading(false);
    }
  };

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => fetchCrypto(filters.search), 400);
    return () => clearTimeout(timer);
  }, [filters.search]);

  // client-side filter + paginate
  useEffect(() => {
    const filtered = allData.filter((item) => {
      const matchesStatus = !filters.verifyStatus || item.verifyStatus === filters.verifyStatus;
      const matchesType   = !filters.type         || item.type         === filters.type;
      return matchesStatus && matchesType;
    });
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    setTotal(filtered.length);
    setOriginalData(paginated.map((item, i) => ({ ...item, sno: (page - 1) * PAGE_SIZE + i + 1 })));
  }, [allData, filters.type, filters.verifyStatus, page]);



     const handleDelete = async (userId) => {
        try {
            setLoading(true);

            const res = await axios.post(
                `${constant.backend_url}/admin/delete-coinrabbit-currency`,
                {
                  currencyId: userId
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                    },
                }
            );

            if (res.data?.success) {
                message.success("CoinRabbit Assets Deleted successfully");
                setDeletemodal(false);
                fetchCrypto();
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


  // ── update status ─────────────────────────────────────────────────────────
  const handleStatusChange = async (record, newStatus) => {
    try {
      const { data } = await axios.post(
        `${constant.backend_url}/admin/coinrabbit-updateCrypto`,
        { crypto_id: record.id, verifyStatus: newStatus === "active" },
        { headers: authHeader }
      );
      if (data.success) {
        messageApi.success(data.message || `${record.tokenName} updated to ${newStatus}`);
        setAllData((prev) =>
          prev.map((item) => item.id === record.id ? { ...item, verifyStatus: newStatus } : item)
        );
      } else {
        messageApi.error(data.message || "Failed to update status.");
      }
    } catch {
      messageApi.error("Failed to update status.");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", flexDirection: "column", width: "100%" }}>
      {contextHolder}

      <div className="mb-5 w-full rounded-lg bg-cover bg-center flex items-center header-content-img">
        <div className="display-3 w-full">
          <h1 className="text-white p-7 font-bold text-2xl">CoinRabbit Crypto</h1>
        </div>
      </div>

      <TableHeader
        data={originalData}
        showCreateButton={false}
        showStatusFilter={true}
        showSearch={true}
        showExportButton={true}
        exportFilename="coinrabbit_crypto"
        exportColumns={columns}
        networkOptions={typeOptions}
        onSearch={(value) => updateFilter("search", value)}
        onVerifyChange={(value) => updateFilter("verifyStatus", value)}
        onTypeChange={(value) => updateFilter("type", value)}
        onNetworkChange={(value) => updateFilter("type", value)}
        searchTooltip="Search by Network, Code"
        placeHolder="Search by Network, Code"
      />


            <ReusableModal
  open={deletemodal}
  onCancel={() => setDeletemodal(false)}
  title="Delete CoinRabbit Cryptos?"
  description={"Are you sure you want to delete this CoinRabbit Cryptos?"}
  showFooter={false}
  extraContent={
    <div className="text-center">

      <p className="text-gray-300 text-base">
        Are you sure you want to delete this CoinRabbit Cryptos?
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
          onClick={() => handleDelete(deleteRecord?.key)}
        >
          Yes
        </button>

      </div>

    </div>
  }
/>
      <ReusableTable
        columns={columns}
        data={originalData}
        pageSize={PAGE_SIZE}
        total={total}
        currentPage={page}
        onPageChange={(p) => setPage(p)}
        loading={loading}
        actionType={["status","Remove"]}
        onStatusChange={handleStatusChange}
                onDelete={(record) => {
        setDeleteRecord(record);
        setDeletemodal(true);
    }}
      />
    </div>
  );
};

export default CoinRabbitCrypto;
