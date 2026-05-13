import { useParams, useLocation, useNavigate } from "react-router-dom";
import ReusableTable from "../../reuseable/ReusableTable";
import { CopyOutlined, LeftCircleOutlined } from "@ant-design/icons";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { constant } from "../../const";
import TableHeader from "../../reuseable/TableHeader";
import ReusableModal from "../../reuseable/ReusableModal";
import debounce from "lodash.debounce";
import { message } from "antd";
import ExportButton from "../../reuseable/ExportButton";
// import ChartsSection from "../../components/ChartsSection";

const CoinRabbitTrans = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [transactionData, setTransactionData] = useState([]);
  const [alltrandata, setAlltrandata] = useState([]);
  const [dateFilterData, setDateFilterData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTrans, setSelectedTrans] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState([]);

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    fromDate: "",
    toDate: "",
  });

        const [deletemodal, setDeletemodal] = useState(false);
    const [deleteRecord, setDeleteRecord] = useState(null);

  const processChartData = (data) => {
    const grouped = {};

    data.forEach((item) => {
      const date = item?.createdAt;
      if (date) {
        if (!grouped[date]) grouped[date] = 0;
        grouped[date] += 1;
      }
    });

    const chart = Object.keys(grouped)
      .sort()
      .map((date) => [date, grouped[date]]);

    setChartData(chart);
  };

  const mapCoinRabbitData = (items = []) => {
    return items.map((item) => ({

      _id: item?._id || item?.id,
      key: item?._id || item?.id,
      loan_id: item?.loan_id || "-",
      firstname: item?.firstname || "-",
      user_id: item?.user_id || "-",
      wallet_id: item?.wallet_id || "-",
      // provider: item?.provider || "-",
      status: item?.status || "-",
      deposit: item?.deposit || "-",
      loan: item?.loan || "-",
      apr: item?.apr || "-",
      one_month_fee: item?.one_month_fee || "-",
      down_limit: item?.down_limit || "-",
      createdAt: item?.createdAt ? item.createdAt.split("T")[0] : "-",
      // updatedAt: item?.updatedAt ? item.updatedAt.split("T")[0] : "-",
      rawCreatedAt: item?.createdAt || "",
    }));
  };

const PAGE_SIZE = 10;

const getTransation = async () => {
  try {
    setLoading(true);

    const res = await axios.post(
      `${constant.backend_url}/admin/get-all-coinrabbit-trans`,
      {
        user_id: id,
        page,
        limit: PAGE_SIZE,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      }
    );

    if (!res.data?.success) {
      setTransactionData([]);
      setTotalUsers(0);
      message.warning(res.data?.message || "No transactions found");
      return;
    }

    const docs = res.data?.data?.docs || [];

const mappedData = mapCoinRabbitData(docs).map((item, index) => ({
  ...item,
  sno: (page - 1) * PAGE_SIZE + index + 1,
}));

    setTransactionData(mappedData);
    setTotalUsers(res.data?.data?.totalDocs || 0);

    processChartData(mappedData);
  } catch (error) {
    console.error(error);
    message.error("Failed to fetch CoinRabbit details");
  } finally {
    setLoading(false);
  }
};




        const handleDelete = async (userId) => {
        try {
            setLoading(true);

            const res = await axios.post(
                `${constant.backend_url}/admin/delete-coinrabbithistory`,
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
                message.success("CoinRabbit Deleted successfully");
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





  const getAllTransaction = async (item,index) => {
    const startTime = Date.now();

    try {
      setLoading(true);

      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(
          ([, value]) => value !== "" && value !== undefined && value !== null
        )
      );

    const res = await axios.post(
  `${constant.backend_url}/admin/get-all-coinrabbit-trans`,
  {
    ...cleanFilters,
    page,
limit: PAGE_SIZE,
  },
  {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
    },
  }
);

      if (!res.data?.success) {
        setAlltrandata([]);
        setTotalUsers(0);
        message.warning(res.data?.message || "No transactions found");
        return;
      }

      const docs =
        res.data?.data?.docs ||
        res.data?.result?.docs ||
        res.data?.result ||
        res.data?.data ||
        [];

    const mappedData = mapCoinRabbitData(docs).map((item, index) => ({
  ...item,
  sno: (page - 1) * PAGE_SIZE + index + 1,
}));

setAlltrandata(mappedData);


      setTotalUsers(
        res.data?.data?.totalDocs ||
          res.data?.total ||
          docs.length ||
          0
      );

      processChartData(mappedData);
    } catch (error) {
      console.error(error);
      message.error("Failed to fetch CoinRabbit history");
    } finally {
      const elapsed = Date.now() - startTime;
      const remaining = 500 - elapsed;

      setTimeout(() => {
        setLoading(false);
      }, remaining > 0 ? remaining : 0);
    }
  };

  const getCoinRabbitForExport = async () => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(
        ([, value]) => value !== "" && value !== undefined && value !== null
      )
    );

    const res = await axios.post(
      `${constant.backend_url}/admin/get-all-coinrabbit-trans`,
      {
        ...cleanFilters,
        ...(id ? { user_id: id } : {}),
        page: 1,
        limit: totalUsers || 100000,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      }
    );

    if (!res.data?.success) return [];

    const docs =
      res.data?.data?.docs ||
      res.data?.result?.docs ||
      res.data?.result ||
      res.data?.data ||
      [];

    return mapCoinRabbitData(docs).map((item, index) => ({
      ...item,
      sno: index + 1,
    }));
  };

  const fetchDateFilterData = async () => {
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries({
          search: filters.search,
          status: filters.status,
        }).filter(([, value]) => value !== "" && value !== undefined && value !== null)
      );

      const res = await axios.post(
        `${constant.backend_url}/admin/get-all-coinrabbit-trans`,
        {
          ...cleanFilters,
          ...(id ? { user_id: id } : {}),
          page: 1,
          limit: 100000,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (!res.data?.success) {
        setDateFilterData([]);
        return;
      }

      const docs =
        res.data?.data?.docs ||
        res.data?.result?.docs ||
        res.data?.result ||
        res.data?.data ||
        [];

      setDateFilterData(mapCoinRabbitData(docs));
    } catch (error) {
      console.error("Failed to fetch CoinRabbit date filter data:", error);
      setDateFilterData([]);
    }
  };

  useEffect(() => {
    if (id) {
      getTransation();
    } else {
      getAllTransaction();
    }
  }, [id, page, filters]);

  useEffect(() => {
    fetchDateFilterData();
  }, [id, filters.search, filters.status]);

  const updateFilter = (value) => {
    setPage(1);
    setFilters((prev) => ({
      ...prev,
      search: value,
    }));
  };

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        updateFilter(value);
      }, 800),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const filteredData = id ? transactionData : alltrandata;

  const columns = [
    { title: "S.no", dataIndex: "sno" },
    {
      title: "Loan ID",
      dataIndex: "loan_id",
      render: (value) => {
        if (!value || value === "-") return "-";
        return `${value.slice(0, 8)}...`;
      },
    },
        { title: "Username", dataIndex: "firstname" },

    // { title: "Provider", dataIndex: "provider" },
    { title: "Status", dataIndex: "status" },
    { title: "Deposit", dataIndex: "deposit" },
    { title: "Loan", dataIndex: "loan" },
    { title: "APR", dataIndex: "apr" },
    { title: "1 Month Fee", dataIndex: "one_month_fee" },
    { title: "Down Limit", dataIndex: "down_limit" },
    { title: "Created At", dataIndex: "createdAt", key: "createdAt" },
    // { title: "Updated At", dataIndex: "updatedAt", key: "updatedAt" },
  ];

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

        <h2 className="text-2xl font-semibold white">
          {state ? "CoinRabbit Details" : "CoinRabbit History"}
        </h2>
      </div>

      {/* <div className="mt-5">
        <ChartsSection
          dashboardData={{ weeklyTransactions: chartData }}
          showtransactionChart={true}
        />
      </div> */}

      {!id && (
        <TableHeader
          data={alltrandata}
          dateFilterData={dateFilterData}
          showCreateButton={false}
          showPrivateFilter={false}
          showNetworkFilter={false}
          showStatusFilter={false}
          showExportButton={true}
          exportFilename="coinrabbit_history"
          exportColumns={columns}
          getExportData={getCoinRabbitForExport}
          showDateFilter={true}
          onSearch={(value) => debouncedSearch(value)}
          searchTooltip="Search by Loan ID, Status"
          onDateChange={(dates) => {
            setPage(1);
            setFilters((prev) => ({
              ...prev,
              fromDate: dates?.[0] || "",
              toDate: dates?.[1] || "",
            }));
          }}
        />
      )}

      {id && (
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 10px", marginBottom: 12 }}>
          <ExportButton
            filename={`coinrabbit_details_${id}`}
            columns={columns}
            data={filteredData}
            getExportData={getCoinRabbitForExport}
          />
        </div>
      )}

      <ReusableTable
        columns={columns}
        data={filteredData}
        rowKey="key"
        pageSize={10}
        total={totalUsers}
        currentPage={page}
        onPageChange={(p) => setPage(p)}
        loading={loading}
        actionType={["viewMore","Remove"]}
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
  title="Delete CoinRabbit Orders?"
  description={"Are you sure you want to delete this CoinRabbit Orders?"}
  showFooter={false}
  extraContent={
    <div className="text-center">

      <p className="text-gray-300 text-base">
        Are you sure you want to delete this CoinRabbit Orders?
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
          onClick={() => handleDelete(deleteRecord?._id || deleteRecord?.key)}
        >
          Yes
        </button>

      </div>

    </div>
  }
/>
      <ReusableModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        title="Transaction Details"
        showFooter={false}
        description=" "
        fields={[]}
        extraContent={
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between bg-[#1f252a] p-3 rounded">
              <span className="text-gray-400">Loan ID</span>
              <div className="flex items-center gap-2">
                <span className="text-white">{selectedTrans?.loan_id}</span>
                <CopyOutlined
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    navigator.clipboard.writeText(selectedTrans?.loan_id || "");
                    message.success("Copied");
                  }}
                />
              </div>
            </div>

            {/* <div className="flex items-center justify-between bg-[#1f252a] p-3 rounded">
              <span className="text-gray-400">Provider</span>
              <span className="text-white">{selectedTrans?.provider}</span>
            </div> */}

            <div className="flex items-center justify-between bg-[#1f252a] p-3 rounded">
              <span className="text-gray-400">Status</span>
              <span className="text-white">{selectedTrans?.status}</span>
            </div>
          

            <div className="flex items-center justify-between bg-[#1f252a] p-3 rounded">
              <span className="text-gray-400">Username</span>
              <span className="text-white">{selectedTrans?.firstname}</span>
            </div>

            <div className="flex items-center justify-between bg-[#1f252a] p-3 rounded">
              <span className="text-gray-400">Deposit</span>
              <span className="text-white">{selectedTrans?.deposit}</span>
            </div>

            <div className="flex items-center justify-between bg-[#1f252a] p-3 rounded">
              <span className="text-gray-400">Loan</span>
              <span className="text-white">{selectedTrans?.loan}</span>
            </div>

            <div className="flex items-center justify-between bg-[#1f252a] p-3 rounded">
              <span className="text-gray-400">APR</span>
              <span className="text-white">{selectedTrans?.apr}</span>
            </div>

            <div className="flex items-center justify-between bg-[#1f252a] p-3 rounded">
              <span className="text-gray-400">1 Month Fee</span>
              <span className="text-white">{selectedTrans?.one_month_fee}</span>
            </div>

            <div className="flex items-center justify-between bg-[#1f252a] p-3 rounded">
              <span className="text-gray-400">Down Limit</span>
              <span className="text-white">{selectedTrans?.down_limit}</span>
            </div>

            <div className="flex items-center justify-between bg-[#1f252a] p-3 rounded">
              <span className="text-gray-400">Created At</span>
              <span className="text-white">{selectedTrans?.createdAt}</span>
            </div>
{/* 
            <div className="flex items-center justify-between bg-[#1f252a] p-3 rounded">
              <span className="text-gray-400">Updated At</span>
              <span className="text-white">{selectedTrans?.updatedAt}</span>
            </div> */}
          </div>
        }
      />
    </>
  );
};

export default CoinRabbitTrans;
