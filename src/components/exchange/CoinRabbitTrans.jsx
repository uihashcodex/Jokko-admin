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
// import ChartsSection from "../../components/ChartsSection";

const CoinRabbitTrans = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [transactionData, setTransactionData] = useState([]);
  const [alltrandata, setAlltrandata] = useState([]);
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
      key: item?._id,
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

  const getTransation = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        `${constant.backend_url}/admin/get-all-coinrabbit-trans`,
        { user_id: id },
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

      const docs =
        res.data?.data?.docs ||
        res.data?.result?.docs ||
        res.data?.result ||
        res.data?.data ||
        [];

      const mappedData = mapCoinRabbitData(docs);

      setTransactionData(mappedData);
      setTotalUsers(
        res.data?.data?.totalDocs ||
          res.data?.total ||
          docs.length ||
          0
      );

      processChartData(mappedData);
    } catch (error) {
      console.error(error);
      message.error("Failed to fetch CoinRabbit details");
    } finally {
      setLoading(false);
    }
  };

  const getAllTransaction = async () => {
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
    limit: 10,
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

      const mappedData = mapCoinRabbitData(docs);

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

  useEffect(() => {
    if (id) {
      getTransation();
    } else {
      getAllTransaction();
    }
  }, [id, page, filters]);

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
          showCreateButton={false}
          showPrivateFilter={false}
          showNetworkFilter={false}
          showStatusFilter={false}
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

      <ReusableTable
        columns={columns}
        data={filteredData}
        rowKey="key"
        pageSize={10}
        total={totalUsers}
        currentPage={page}
        onPageChange={(p) => setPage(p)}
        loading={loading}
        actionType={["viewMore"]}
        onView={(record) => {
          setSelectedTrans(record);
          setModalOpen(true);
        }}
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