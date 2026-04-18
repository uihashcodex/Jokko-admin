import { useEffect, useMemo, useState } from "react";
import ReusableTable from "../reuseable/ReusableTable";
import TableHeader from "../reuseable/TableHeader";
import { message } from "antd";
import axios from "axios";
import { constant } from "../const";

const columns = [
  { title: "S.no",         dataIndex: "sno",          key: "sno"          },
  { title: "Network Name", dataIndex: "tokenName",    key: "tokenName"    },
  { title: "Network Symbol",       dataIndex: "networkSymbol",  key: "networkSymbol"  },
  // { title: "Code",         dataIndex: "code",         key: "code"         },
  // { title: "Type",         dataIndex: "type",         key: "type"         },
  { title: "Status",       dataIndex: "verifyStatus", key: "verifyStatus" },
];

const PAGE_SIZE = 10;

const BuySellNetworks = () => {
  const [allData, setAllData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const [filters, setFilters] = useState({ search: "", type: "", verifyStatus: "" });

  const authHeader = { Authorization: `Bearer ${localStorage.getItem("adminToken")}` };

  const typeOptions = useMemo(() => [
    { label: "Buy",  value: "Buy"  },
    { label: "Sell", value: "Sell" },
  ], []);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value || "" }));
    setPage(1);
  };

  // ── fetch from API ────────────────────────────────────────────────────────
  const fetchNetworks = async (search = "") => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${constant.backend_url}/admin/buysell-getnetworks`,
        { search },
        { headers: authHeader }
      );
      if (data.success) {
        const docs = data.result || data.data || [];
        const formatted = docs.map((item) => ({
          id:           item._id,
          tokenName:    item.networkName  || item.tokenName  || item.name   || "-",
          networkSymbol:  item.networkSymbol  || item.networkSymbol     || "-",
          // code:         item.code         || item.tokenSymbol || "-",
          // type:         item.type         || "-",
          verifyStatus: item.verifyStatus === true ? "active" : "inactive",
        }));
        setAllData(formatted);
      } else {
        messageApi.error(data.message || "Failed to fetch networks.");
      }
    } catch {
      messageApi.error("Failed to fetch networks.");
    } finally {
      setLoading(false);
    }
  };

  // debounce search calls
  useEffect(() => {
    const timer = setTimeout(() => fetchNetworks(filters.search), 400);
    return () => clearTimeout(timer);
  }, [filters.search]);

  // client-side filter by type / status + paginate
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

  // ── update status ─────────────────────────────────────────────────────────
  const handleStatusChange = async (record, newStatus) => {
    try {
      const { data } = await axios.post(
        `${constant.backend_url}/admin/buysell-network`,
        { network_id: record.id, verifyStatus: newStatus === "active" },
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
          <h1 className="text-white p-7 font-bold text-2xl">Buy/Sell Networks</h1>
        </div>
      </div>

      <TableHeader
        data={originalData}
        showCreateButton={false}
        showStatusFilter={true}
        showSearch={true}
        networkOptions={typeOptions}
        onSearch={(value) => updateFilter("search", value)}
        onVerifyChange={(value) => updateFilter("verifyStatus", value)}
        onTypeChange={(value) => updateFilter("type", value)}
        onNetworkChange={(value) => updateFilter("type", value)}
        searchTooltip="Search by Network Name, Symbol"
        placeHolder="Search by network name, symbol"
      />

      <ReusableTable
        columns={columns}
        data={originalData}
        pageSize={PAGE_SIZE}
        total={total}
        currentPage={page}
        onPageChange={(p) => setPage(p)}
        loading={loading}
        actionType={["status"]}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default BuySellNetworks;
