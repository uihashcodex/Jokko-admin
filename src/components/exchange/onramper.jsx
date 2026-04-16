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

const OnramperHistory = () => {
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

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    type: "",
    onramp: "", // provider filter
    fromDate: "",
    toDate: "",
  });

  const mapOnramperData = (items = []) => {
    return items.map((item) => ({
      key: item?._id,
      user_id: item?.user_id || "-",
      order_id: item?.order_id || "-",
      type: item?.type || "-",
      firstname: item?.firstname || "-",
      fiat_amount: item?.fiat_amount ?? "-",
      fiat_currency: item?.fiat_currency || "-",
      crypto_currency: item?.crypto_currency || "-",
      crypto_amount: item?.crypto_amount ?? "-",
      network: item?.network || "-",
      wallet_address: item?.wallet_address || "-",
      status: item?.status || "-",
      provider_name: item?.provider_name || "-",
      email: item?.email || "-",
      country: item?.country || "-",
      payment_method: item?.payment_method || "-",
      widget_url: item?.widget_url || "-",
      transaction_url: item?.transaction_url || "-",
      createdAt: item?.createdAt ? item.createdAt.split("T")[0] : "-",
      // updatedAt: item?.updatedAt ? item.updatedAt.split("T")[0] : "-",
    }));
  };

  const buildPayload = () => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(
        ([, value]) => value !== "" && value !== undefined && value !== null
      )
    );

    return {
      ...cleanFilters,
      page,
      limit: 10,
      ...(id ? { user_id: id } : {}),
    };
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        `${constant.backend_url}/admin/get-all-onramper-trans`,
        buildPayload(),
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (!res.data?.success) {
        if (id) {
          setTransactionData([]);
        } else {
          setAlltrandata([]);
        }
        setTotalUsers(0);
        message.warning(res.data?.message || "No transactions found");
        return;
      }

      const docs =
        res.data?.data?.docs ||
        res.data?.result?.docs ||
        res.data?.result ||
        [];

      const mapped = mapOnramperData(docs);

      if (id) {
        setTransactionData(mapped);
      } else {
        setAlltrandata(mapped);
      }

      setTotalUsers(
        res.data?.data?.totalDocs ||
          res.data?.result?.totalDocs ||
          res.data?.total ||
          docs.length ||
          0
      );
    } catch (error) {
      console.error("Failed to fetch onramper transactions:", error);
      message.error("Failed to fetch Onramper history");
      if (id) {
        setTransactionData([]);
      } else {
        setAlltrandata([]);
      }
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [id, page, filters]);

  const updateSearchFilter = (value) => {
    setPage(1);
    setFilters((prev) => ({
      ...prev,
      search: value,
    }));
  };

  const updateOnrampFilter = (value) => {
    setPage(1);
    setFilters((prev) => ({
      ...prev,
      onramp: value || "",
    }));
  };

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        updateSearchFilter(value);
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
      title: "Order ID",
      dataIndex: "order_id",
      render: (value) => {
        if (!value || value === "-") return "-";
        return `${value.slice(0, 8)}...`;
      },
    },
    { title: "Type", dataIndex: "type" },
    { title: "User Name", dataIndex: "firstname" },
    { title: "Status", dataIndex: "status" },
    { title: "Crypto Amount", dataIndex: "crypto_amount" },
    { title: "Crypto Currency", dataIndex: "crypto_currency" },
    { title: "Fiat Amount", dataIndex: "fiat_amount" },
    { title: "Provider", dataIndex: "provider_name" },
    { title: "Fiat Currency", dataIndex: "fiat_currency" },
    { title: "Network", dataIndex: "network" },
    { title: "Payment Method", dataIndex: "payment_method" },
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
          {id ? "OnRamper Details" : "OnRamper History"}
        </h2>
      </div>

      <TableHeader
        data={filteredData}
        showCreateButton={false}
        showPrivateFilter={false}
        showNetworkFilter={false}
        showStatusFilter={false}
        showDateFilter={true}
        showonrampFilter={true}
        onSearch={(value) => debouncedSearch(value)}
        onOnrampChange={updateOnrampFilter}
        searchTooltip="Search by Order ID, Currency, Type, Status, Network"
        onDateChange={(dates) => {
          setPage(1);
          setFilters((prev) => ({
            ...prev,
            fromDate: dates?.[0] || "",
            toDate: dates?.[1] || "",
          }));
        }}
      />

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
        title="OnRamper Transaction Details"
        showFooter={false}
        description=" "
        fields={[]}
        extraContent={
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between bg-[#1f252a] p-3 rounded">
              <span className="text-gray-400">Order ID</span>
              <div className="flex items-center gap-2">
                <span className="text-white">{selectedTrans?.order_id}</span>
                <CopyOutlined
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    navigator.clipboard.writeText(selectedTrans?.order_id || "");
                    message.success("Copied");
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between bg-[#1f252a] p-3 rounded">
              <span className="text-gray-400">Type</span>
              <span className="text-white">{selectedTrans?.type}</span>
            </div>

            <div className="flex items-center justify-between bg-[#1f252a] p-3 rounded">
              <span className="text-gray-400">User Name</span>
              <span className="text-white">{selectedTrans?.firstname}</span>
            </div>

            <div className="flex items-center justify-between bg-[#1f252a] p-3 rounded">
              <span className="text-gray-400">Status</span>
              <span className="text-white">{selectedTrans?.status}</span>
            </div>

            <div className="flex items-center justify-between bg-[#1f252a] p-3 rounded">
              <span className="text-gray-400">Crypto Amount</span>
              <span className="text-white">{selectedTrans?.crypto_amount}</span>
            </div>

            <div className="flex items-center justify-between bg-[#1f252a] p-3 rounded">
              <span className="text-gray-400">Crypto Currency</span>
              <span className="text-white">{selectedTrans?.crypto_currency}</span>
            </div>

            <div className="flex items-center justify-between bg-[#1f252a] p-3 rounded">
              <span className="text-gray-400">Fiat Amount</span>
              <span className="text-white">{selectedTrans?.fiat_amount}</span>
            </div>

            <div className="flex items-center justify-between bg-[#1f252a] p-3 rounded">
              <span className="text-gray-400">Provider</span>
              <span className="text-white">{selectedTrans?.provider_name}</span>
            </div>

            <div className="flex items-center justify-between bg-[#1f252a] p-3 rounded">
              <span className="text-gray-400">Fiat Currency</span>
              <span className="text-white">{selectedTrans?.fiat_currency}</span>
            </div>

            <div className="flex items-center justify-between bg-[#1f252a] p-3 rounded">
              <span className="text-gray-400">Network</span>
              <span className="text-white">{selectedTrans?.network}</span>
            </div>

            <div className="flex items-center justify-between bg-[#1f252a] p-3 rounded">
              <span className="text-gray-400">Wallet Address</span>
              <div className="flex items-center gap-2">
                <span className="text-white break-all">
                  {selectedTrans?.wallet_address}
                </span>
                <CopyOutlined
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    navigator.clipboard.writeText(
                      selectedTrans?.wallet_address || ""
                    );
                    message.success("Copied");
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between bg-[#1f252a] p-3 rounded">
              <span className="text-gray-400">Email</span>
              <span className="text-white">{selectedTrans?.email}</span>
            </div>

            <div className="flex items-center justify-between bg-[#1f252a] p-3 rounded">
              <span className="text-gray-400">Country</span>
              <span className="text-white">{selectedTrans?.country}</span>
            </div>

            <div className="flex items-center justify-between bg-[#1f252a] p-3 rounded">
              <span className="text-gray-400">Payment Method</span>
              <span className="text-white">{selectedTrans?.payment_method}</span>
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

export default OnramperHistory;