import { useParams } from "react-router-dom";
import ReusableTable from "../reuseable/ReusableTable";
import { useLocation } from "react-router-dom";
import { CopyOutlined, LeftCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { constant } from "../const";
import TableHeader from "../reuseable/TableHeader";
import ReusableModal from "../reuseable/ReusableModal";
import debounce from "lodash.debounce";
import { useMemo } from "react";
import { message } from "antd";
import create from "@ant-design/icons/lib/components/IconFont";
import ChartsSection from "../components/ChartsSection";
import ExportButton from "../reuseable/ExportButton";


const TransectionHistory = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [originalData, setOriginalData] = useState([]);
  const [transactionData, setTransactionData] = useState([]);
  const [alltrandata, setAlltrandata] = useState([]);
  const [transactionDateFilterData, setTransactionDateFilterData] = useState([]);
  const [filteredTableData, setFilteredTableData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTrans, setSelectedTrans] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [networkOptions, setNetworkOptions] = useState([]);
  const [networkId, setNetworkId] = useState("");
  const [chartData, setChartData] = useState([]);

  const PAGE_SIZE = 10;

  const [filters, setFilters] = useState({
    search: "",
    network_id: "",
    fromDate: "",
    toDate: ""
  });

  const [deletemodal, setDeletemodal] = useState(false);
  const [deleteRecord, setDeleteRecord] = useState(null);

  const formatDateMonth = (dateStr) => {
    const d = new Date(dateStr);
    const day = d.getDate();
    const month = d.toLocaleString("default", { month: "short" });
    return `${day} ${month}`; // 7 Mar
  };

  const formatTransactionDateTime = (item) => {
    if (item?.transactionDate && item?.transactionTime) {
      return {
        transactionDate: item.transactionDate,
        transactionTime: item.transactionTime,
        dateTimeDisplay: `${item.transactionDate} ${item.transactionTime}`,

      };
    }

    const rawDate = item?.DateTime || item?.createdAt;
    if (!rawDate) {
      return {
        transactionDate: "-",
        transactionTime: "-",
        dateTimeDisplay: "-",
      };
    }

    const date = new Date(rawDate);
    if (Number.isNaN(date.getTime())) {
      return {
        transactionDate: "-",
        transactionTime: "-",
        dateTimeDisplay: "-",
      };
    }

    const transactionDate = date.toLocaleDateString("en-CA");
    const transactionTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    return {
      transactionDate,
      transactionTime,
      dateTimeDisplay: `${transactionDate} ${transactionTime}`,
    };
  };

  const getTransactionDate = (item) => {
    const rawDate = item?.transactionDate || item?.DateTime || item?.createdAt;
    if (!rawDate || rawDate === "-") return null;

    const date = new Date(rawDate);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const getStartOfDay = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const getEndOfDay = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    date.setHours(23, 59, 59, 999);
    return date;
  };

  const hasDateFilter = Boolean(filters.fromDate || filters.toDate);

  const matchesDateFilter = (item) => {
    if (!hasDateFilter) return true;

    const transactionDate = getTransactionDate(item);
    const fromDate = getStartOfDay(filters.fromDate);
    const toDate = getEndOfDay(filters.toDate);

    return (
      transactionDate &&
      (!fromDate || transactionDate >= fromDate) &&
      (!toDate || transactionDate <= toDate)
    );
  };

  const processChartData = () => {
    const grouped = {};
    transactionData.forEach(trans => {
      const date = trans.createdAt;
      if (date) {
        if (!grouped[date]) grouped[date] = 0;
        grouped[date]++;
      }
    });
    const chart = Object.keys(grouped).sort().map(date => [date, grouped[date]]);
    setChartData(chart);
  };

  const TransactionFields = [
    {
      name: "transactionHash", label: "Transaction", type: "copy",
    },
    {
      name: "networkName", label: "Network Name", type: "copy",

    },
    {
      name: "from", label: "From", type: "copy",
    },
    {
      name: "to", label: "To", type: "copy",

    },
  ];

  const formatTransactions = (transactions = [], pageNumber = 1, pageLimit = PAGE_SIZE) =>
    transactions.map((item, index) => {
      const dateTime = formatTransactionDateTime(item);

      return {
        key: item?._id,
        id: item?._id,
        sno: (pageNumber - 1) * pageLimit + index + 1,
        transactionHash: item?.transactionHash || "-",
        firstname: item?.firstname || "-",
        networkName: item?.network_id?.networkName || item?.networkName || "-",
        amount: item?.amount
          ? `${Number(item.amount).toFixed(4)} ${item?.tokenSymbol || ""}`
          : "-",
        from: item?.from || "-",
        to: item?.to || "-",
        tokenSymbol: item?.tokenSymbol || "-",
        createdAt: dateTime.transactionDate,
        updatedAt: item?.updatedAt ? item.updatedAt.split("T")[0] : "",
        status: item?.status || "-",
        transType: item?.transType || "-",
        ...dateTime,
      };
    });

  const getTransation = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        `${constant.backend_url}/admin/getAllUsersWalletTransactions?page=${page}&limit=${PAGE_SIZE}`,
        {
          user_id: id,
          search: filters.search,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (res.data?.success) {
        const trandata = res.data.result || [];
        const trans = formatTransactions(trandata, page, PAGE_SIZE);

        setTransactionData(trans);
        setTotalUsers(res.data.total || 0);
      }
    } catch (error) {
      if (error?.response?.status === 401) return;
      console.error(error);
    } finally {
      setLoading(false);
    }
  };





  useEffect(() => {
    if (id) {
      getTransation();
    }
  }, [id, page, filters.search]);

  useEffect(() => {
    if (id && transactionData.length > 0) {
      processChartData();
    }
  }, [transactionData, id]);


  const handleDelete = async (userId) => {
    try {
      setLoading(true);

      const res = await axios.post(
        `${constant.backend_url}/admin/delete-transaction`,
        { transactionId: userId }, // ✅ FIX
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (res.data?.success) {
        message.success("Transaction deleted successfully");
        setDeletemodal(false);
        getAllTransaction();
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





  const getAllTransaction = async () => {
    const startTime = Date.now();

    try {
      setLoading(true);
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "" && v !== undefined)
      );
      const serverFilters = hasDateFilter
        ? Object.fromEntries(
          Object.entries(cleanFilters).filter(([key]) => !["fromDate", "toDate"].includes(key))
        )
        : cleanFilters;
      const res = await axios.get(`${constant.backend_url}/admin/get-all-transactions`,

        {

          params: {
            ...serverFilters,
            page: hasDateFilter ? 1 : page,
            limit: hasDateFilter ? 100000 : PAGE_SIZE
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }

      );
      if (res.data?.success) {

        const users = hasDateFilter
          ? (res.data.result || []).filter(matchesDateFilter)
          : res.data.result || [];
        const visibleUsers = hasDateFilter
          ? users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
          : users;
        setTotalUsers(hasDateFilter ? users.length : res.data.total);
        const transres = formatTransactions(visibleUsers, page, PAGE_SIZE);
        console.log(transres, "dsggffgf");

        setAlltrandata(transres);
        setFilteredTableData(transres);

      }
      // const elapsed = Date.now() - startTime;
      // const remaining = 500 - elapsed;

      // setTimeout(() => {
      //   setLoading(false);
      // }, remaining > 0 ? remaining : 0);
    }

    catch (error) {
      console.error(error);
    }
    finally {
      const elapsed = Date.now() - startTime;
      const remaining = 500 - elapsed;

      setTimeout(() => {
        setLoading(false);
      }, remaining > 0 ? remaining : 0);
    }
  };

  const getTransactionsForExport = async () => {
    if (id) {
      const res = await axios.post(
        `${constant.backend_url}/admin/getAllUsersWalletTransactions?page=1&limit=${totalUsers || 100000}`,
        {
          user_id: id,
          search: filters.search,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (!res.data?.success) return [];
      return formatTransactions(res.data.result || [], 1, totalUsers || 100000);
    }

    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== "" && v !== undefined)
    );
    const res = await axios.get(`${constant.backend_url}/admin/get-all-transactions`, {
      params: {
        ...cleanFilters,
        page: 1,
        limit: totalUsers || 100000,
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    });

    if (!res.data?.success) return [];
    return formatTransactions(res.data.result || [], 1, totalUsers || 100000);
  };

  const getTransactionDateFilterData = async () => {
    if (id) return;

    try {
      const cleanFilters = Object.fromEntries(
        Object.entries({
          search: filters.search,
          network_id: filters.network_id,
        }).filter(([_, v]) => v !== "" && v !== undefined)
      );

      const res = await axios.get(`${constant.backend_url}/admin/get-all-transactions`, {
        params: {
          ...cleanFilters,
          page: 1,
          limit: 100000,
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      if (res.data?.success) {
        setTransactionDateFilterData(res.data.result || []);
      } else {
        setTransactionDateFilterData([]);
      }
    } catch (error) {
      console.error(error);
      setTransactionDateFilterData([]);
    }
  };

  // useEffect(() => {
  //   getAllTransaction();
  // }, [page, filters]);

  useEffect(() => {
    if (!id) {
      getAllTransaction();
    }
  }, [page, filters, id]);

  useEffect(() => {
    getTransactionDateFilterData();
  }, [id, filters.search, filters.network_id]);

  const updateFilter = (value) => {
    setPage(1);

    setFilters((prev) => ({
      ...prev,
      search: value
    }));
  };

  const updateNetworkFilter = (value) => {
    setFilters((prev) => ({
      ...prev,
      network_id: value
    }));
    setPage(1);
  };

  const filteredData = id ? transactionData : alltrandata;


  const columns = [
    { title: "S.no", dataIndex: "sno" },
    {
      title: "Transaction Hash", dataIndex: "transactionHash",
      render: (trans) => {
        if (!trans) return "-";
        return `${trans.slice(0, 8)}...`;
      }
    },
    { title: "User Name", dataIndex: "firstname" },

    { title: "Network Name", dataIndex: "networkName" },
    { title: "Amount", dataIndex: "amount" },
    {
      title: "From", dataIndex: "from",
      render: (frm) => {
        if (!frm) return "-";
        return `${frm.slice(0, 8)}...`;
      }
    },
    {
      title: "To", dataIndex: "to",
      render: (to) => {
        if (!to) return "-";
        return `${to.slice(0, 8)}...`;
      }
    },
    { title: "Token Symbol", dataIndex: "tokenSymbol" },
    { title: "Date", dataIndex: "transactionDate", key: "transactionDate" },
    { title: "Time", dataIndex: "transactionTime", key: "transactionTime" },

    // { title: "Updated At", dataIndex: "createdAt", key: "updatedAt" },
    // { title: "Status", dataIndex: "status" },
  ];

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        updateFilter(value);
      }, 800),
    []
  );

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

  // transation chart
  const [dashboardData, setDashboardData] = useState({});

  const getDashboardData = async () => {
    try {
      const res = await axios.get(`${constant.backend_url}/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });

      if (res.data.success) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getDashboardData();
  }, []);

  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        {state && (
          <LeftCircleOutlined
            onClick={() => navigate(-1)}
            style={{ fontSize: "20px", cursor: "pointer", color: "white" }}
            className="back-icon"
          />
        )}
        <h2 className="text-2xl font-semibold  white">Transaction History</h2>
      </div>

      <div className="mt-5">
        <ChartsSection dashboardData={id ? { weeklyTransactions: chartData } : dashboardData} showtransactionChart={true}
        />
      </div>


      {!id && (
        <TableHeader
          data={alltrandata}
          dateFilterData={transactionDateFilterData}
          // onFilter={(data) => setFilteredTableData(data)}
          showCreateButton={false}
          showPrivateFilter={false}
          showStatusFilter={false}
          showExportButton={true}
          exportFilename="transaction_history"
          exportColumns={columns}
          getExportData={getTransactionsForExport}
          onSearch={(value) => debouncedSearch(value)}
          searchTooltip="Search By Hash, Address, Token Symbol, Amount"
          showNetworkFilter={true}
          showDateFilter={true}
          onDateChange={(dates) => {
            setPage(1);

            setFilters(prev => ({
              ...prev,
              fromDate: dates?.[0] || "",
              toDate: dates?.[1] || ""
            }));
          }}
          onNetworkChange={updateNetworkFilter}
          networkOptions={networkOptions}
        />
      )}

      {id && (
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 10px", marginBottom: 12 }}>
          <ExportButton
            filename={`user_transactions_${id}`}
            columns={columns}
            data={transactionData}
            getExportData={getTransactionsForExport}
          />
        </div>
      )}

      <ReusableTable
        columns={columns}
        data={id ? transactionData : filteredTableData}
        rowKey="key"
        pageSize={PAGE_SIZE}
        total={totalUsers}
        currentPage={page}
        onPageChange={(p) => setPage(p)}
        loading={loading}
        actionType={["viewMore", "Remove"]}
        onView={(record) => {
          setSelectedTrans(record);
          setModalOpen(true);
        }}
        onDelete={(record) => {
          setDeleteRecord(record);
          setDeletemodal(true);
        }}
      />




      <ReusableModal
        open={deletemodal}
        onCancel={() => setDeletemodal(false)}
        title="Delete Transcation"
        description={"Are you sure you want to delete this Transcation?"}
        showFooter={false}
        extraContent={
          <div className="text-center">

            <p className="text-gray-300 text-base">
              Are you sure you want to delete this Transcation?
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

      {/* <ReusableModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        title="Wallet Details"
        description=" "
        fields={TransactionFields}
        initialValues={selectedTrans}
        showFooter={false}
      /> */}

      <ReusableModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        title="Transaction Details"
        showFooter={false}
        description={" "}
        fields={[]}
        extraContent={
          <div className="flex flex-col gap-5">

            {/* Transaction Hash */}
            <div className="flex items-center justify-between bg-[#1f252a] p-3 rounded">
              <span className="text-gray-400">Transaction Hash</span>

              <div className="flex items-center gap-2">
                <span className="text-white">
                  {selectedTrans?.transactionHash}
                </span>

                <CopyOutlined
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    navigator.clipboard.writeText(selectedTrans?.transactionHash);
                    message.success("Copied");
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between bg-[#1f252a] p-3 rounded">
              <span className="text-gray-400">User Name</span>
              <span className="text-white">{selectedTrans?.firstname}</span>
            </div>
            {/* Network */}
            <div className="flex items-center justify-between bg-[#1f252a] p-3 rounded">
              <span className="text-gray-400">Network Name</span>
              <span className="text-white">{selectedTrans?.networkName}</span>
            </div>

            <div className="flex items-center justify-between bg-[#1f252a] p-3 rounded">
              <span className="text-gray-400">Amount</span>
              <span className="text-white">{selectedTrans?.amount}</span>
            </div>

            {/* From */}
            <div className="flex items-center justify-between bg-[#1f252a] p-3 rounded">
              <span className="text-gray-400">From</span>

              <div className="flex items-center gap-2">
                <span className="text-white">{selectedTrans?.from}</span>

                <CopyOutlined
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    navigator.clipboard.writeText(selectedTrans?.from);
                    message.success("Copied");
                  }}
                />
              </div>
            </div>

            {/* To */}
            <div className="flex items-center justify-between bg-[#1f252a] p-3 rounded">
              <span className="text-gray-400">To</span>

              <div className="flex items-center gap-2">
                <span className="text-white">{selectedTrans?.to}</span>

                <CopyOutlined
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    navigator.clipboard.writeText(selectedTrans?.to);
                    message.success("Copied");
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between bg-[#1f252a] p-3 rounded">
              <span className="text-gray-400">Token Symbol</span>
              <span className="text-white">{selectedTrans?.tokenSymbol}</span>
            </div>

            <div className="flex items-center justify-between bg-[#1f252a] p-3 rounded">
              <span className="text-gray-400">Date</span>
              <span className="text-white">{selectedTrans?.transactionDate}</span>
            </div>

            <div className="flex items-center justify-between bg-[#1f252a] p-3 rounded">
              <span className="text-gray-400">Time</span>
              <span className="text-white">{selectedTrans?.transactionTime}</span>
            </div>

          </div>
        }
      />

    </>
  );
};

export default TransectionHistory;
