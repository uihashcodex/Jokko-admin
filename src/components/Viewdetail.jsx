import { useNavigate } from "react-router-dom";
import ReusableTable from "../reuseable/ReusableTable";
import TableHeader from "../reuseable/TableHeader";
import { useState } from "react";
import axios from "axios";
import { constant } from "../const";
import { useEffect } from "react";
import { message } from "antd";
import debounce from "lodash.debounce";
import { useMemo } from "react";
import theme from '../config/theme';
import ChartsSection from "../components/ChartsSection";
import StatCard from "../components/StatCard";
import { hasAccess } from "../utils/permissionCheck";
import ReusableModal from "../reuseable/ReusableModal";

const columns = [
  { title: "S.no", dataIndex: "sno", key: "sno" },
  { title: "Name", dataIndex: "name", key: "name" },
  { title: "Email", dataIndex: "email", key: "email" },
  { title: "Phone", dataIndex: "phone", key: "phone" },
  { title: "Status", dataIndex: "status", key: "status" },
  { title: "Type", dataIndex: "type", key: "type" },
  { title: "Country", dataIndex: "country", key: "country" },
  {
    title: "Unique ID", dataIndex: "uniqueid", key: "uniqueid",
    render: (frm) => {
      if (!frm) return "-";
      return `${frm.slice(0, 8)}`;
    }
  },
  { title: "Created At", dataIndex: "createdAt", key: "createdAt" },
  // { title: "Updated At", dataIndex: "createdAt", key: "updatedAt" },

];


const user = JSON.parse(localStorage.getItem("user")) || {};
const userPermissions = user?.permissions || [];


const Viewdetail = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [originalData, setOriginalData] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [deleteRecord, setDeleteRecord] = useState(null);
  const [deletemodal, setDeletemodal] = useState(false);
  const [deleteCounts, setDeleteCounts] = useState({
    wallets: 0,
    transactions: 0,
    onramper_orders: 0,
    coinrabbit_orders: 0,
  });
  const [deleteCountsLoading, setDeleteCountsLoading] = useState(false);

  const handleCreate = () => {
    setOpen(true);
    setSelectedRecord(null);
  };



  const [filters, setFilters] = useState({
    search: "",
    userType: "",
    blockstatus: "",
    fromDate: "",
    toDate: ""
  });

  const formatUsers = (users = [], pageNumber = 1, pageLimit = 10) =>
    users.map((user, index) => ({
      key: user?._id,
      sno: (pageNumber - 1) * pageLimit + index + 1,
      name: `${user?.firstname || ""} ${user?.lastname || ""}`.trim() || "-",
      email: user?.email || "-",
      phone: user?.phone || "-",
      status: user?.blockstatus ? "Inactive" : "active",
      type: user?.type || "-",
      country: user?.country || "-",
      createdAt: user?.createdAt ? user.createdAt.split("T")[0] : "-",
      uniqueid: user?.unique_id || "-"
    }));

  const fetUsers = async () => {
    try {
      setLoading(true);
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "" && v !== undefined)
      );
      const startTime = Date.now();
      const res = await axios.get(`${constant.backend_url}/admin/get-all-users`,
        {
          params: {
            ...cleanFilters,
            page: page,
            limit: 10
          }
        }
      );

      if (res.data?.success) {

        const users = res.data.result || [];
        setTotalUsers(res.data.total);
        const tableData = formatUsers(users, page, 10);

        console.log(tableData, "tableData");

        setOriginalData(tableData);
        // setFilteredData(tableData);

      }

      const elapsed = Date.now() - startTime;
      const remaining = 500 - elapsed;

      setTimeout(() => {
        setLoading(false);
      }, remaining > 0 ? remaining : 0);

    } catch (error) {
      console.error("Error fetching users:", error);
      setOriginalData([]);
      // setFilteredData([]);
    }
  };

  const getUsersForExport = async () => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== "" && v !== undefined)
    );
    const res = await axios.get(`${constant.backend_url}/admin/get-all-users`, {
      params: {
        ...cleanFilters,
        page: 1,
        limit: totalUsers || 100000,
      },
    });

    if (!res.data?.success) return [];
    return formatUsers(res.data.result || [], 1, totalUsers || 100000);
  };

  useEffect(() => {
    fetUsers();
  }, [page, filters]);




  const updateFilter = (key, value) => {

    if (key === "blockstatus") {
      value = value === "active" ? false : value === "inactive" ? true : "";
    }

    setPage(1);

    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };
  const blockUser = async (record) => {
    try {
      const res = await axios.post(
        `${constant.backend_url}/admin/block-user`,
        {
          id: record.key,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (res.data?.success) {
        message.success(res.data.message);

        // reload users list
        fetUsers();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };



  const handleDelete = async (userId) => {
    try {
      setLoading(true);

      const res = await axios.post(
        `${constant.backend_url}/admin/delete-userdetails`,
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
        message.success("Users Deleted successfully");
        setDeletemodal(false);
        fetUsers();
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

  const fetchUserDeleteCounts = async (userId) => {
    if (!userId) return;
    setDeleteCountsLoading(true);
    try {
      const res = await axios.get(
        `${constant.backend_url}/admin/user-delete-counts`,
        {
          params: { userId },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      if (res.data?.success && res.data?.result) {
        const r = res.data.result;
        setDeleteCounts({
          wallets: r.wallets ?? 0,
          transactions: r.transactions ?? 0,
          onramper_orders: r.onramper_orders ?? 0,
          coinrabbit_orders: r.coinrabbit_orders ?? 0,
        });
      } else {
        setDeleteCounts({
          wallets: 0,
          transactions: 0,
          onramper_orders: 0,
          coinrabbit_orders: 0,
        });
      }
    } catch (e) {
      setDeleteCounts({
        wallets: 0,
        transactions: 0,
        onramper_orders: 0,
        coinrabbit_orders: 0,
      });
    } finally {
      setDeleteCountsLoading(false);
    }
  };

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        updateFilter("search", value);
      }, 800),
    []
  );
  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  // dashboard
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
            User Detail             </h1>
        </div>
      </div>

      {/* 🔥 User Chart Section */}
      <div className="mt-5">
        <ChartsSection dashboardData={dashboardData} showOnlyUserChart={true}
        />
      </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 mb-10">
        <StatCard title="Total Users" value={dashboardData?.totalusers || 0} />
        <StatCard title="Individual Users" value={dashboardData?.individualCount || 0} />
        <StatCard title="Professional Users" value={dashboardData?.professionalCount || 0} />
      </div>
      <TableHeader
        data={originalData}
        onCreate={handleCreate}
        showStatusFilter={true}
        showCreateButton={false}
        showPrivateFilter={true}
        showExportButton={true}
        exportFilename="user_details"
        exportColumns={columns}
        getExportData={getUsersForExport}
        onSearch={(value) => debouncedSearch(value)}
        onTypeChange={(value) => updateFilter("userType", value)}
        onVerifyChange={(value) => updateFilter("blockstatus", value)}
        showDateFilter={true}
        onDateChange={(dates) => {
          setPage(1);

          setFilters(prev => ({
            ...prev,
            fromDate: dates?.[0] || "",
            toDate: dates?.[1] || ""
          }));
        }}
        searchTooltip="Search by Name, Email, Phone"

      />
      <ReusableTable
        columns={columns}
        data={originalData}
        pageSize={10}
        total={totalUsers}
        currentPage={page}
        onPageChange={(p) => setPage(p)}
        loading={loading}
        rowKey="key"
        actionType={["view", "block", "Remove"]}
        onView={(record, section) => {
          if (section === "wallet") {
            navigate(`/wallet/${record.key}`, { state: record });
          }

          if (section === "transaction") {
            navigate(`/transaction/${record.key}`, { state: record });
          }
          if (section === "coinrabbit") {
            navigate(`/coin-rabbbit-history/${record.key}`, { state: record });
          }
          if (section === "onramper") {
            navigate(`/onramper-history/${record.key}`, { state: record });
          }

          if (section === "oframper") {
            navigate(`/oframper-history/${record.key}`, { state: record });
          }
        }}

        onBlock={(record) => blockUser(record)}
        onUnblock={(record) => blockUser(record)}
        onDelete={async (record) => {
          setDeleteRecord(record);
          setDeleteCounts({ wallets: 0, transactions: 0 });
          setDeletemodal(true);
          await fetchUserDeleteCounts(record.key);
        }}
      />

      <ReusableModal
        open={deletemodal}
        onCancel={() => {
          setDeletemodal(false);
          setDeleteCounts({
            wallets: 0,
            transactions: 0,
            onramper_orders: 0,
            coinrabbit_orders: 0,
          });
        }}
        title="Delete User"
        description={"PERMANENT DELETE: This cannot be undone."}
        showFooter={false}
        extraContent={
          <div className="text-center">

            <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-left">
              <p className="text-red-300 text-base font-semibold">
                PERMANENT DELETE (cannot be undone)
              </p>
              <p className="text-gray-300 text-sm mt-1">
                If you click <b>Yes</b>, this user will be permanently deleted from the database.
              </p>
            </div>

            <div className="mt-4 text-left text-gray-300">
              {deleteCountsLoading && (
                <p className="text-sm text-gray-400">Loading record counts…</p>
              )}
              {(() => {
                const c = deleteCounts;
                const hasAny =
                  !deleteCountsLoading &&
                  (c.wallets > 0 ||
                    c.transactions > 0 ||
                    c.onramper_orders > 0 ||
                    c.coinrabbit_orders > 0);
                const parts = [
                  c.wallets > 0 && `${c.wallets} wallet${c.wallets === 1 ? "" : "s"}`,
                  c.transactions > 0 &&
                  `${c.transactions} transaction${c.transactions === 1 ? "" : "s"}`,
                  c.coinrabbit_orders > 0 &&
                  `${c.coinrabbit_orders} CoinRabbit order${c.coinrabbit_orders === 1 ? "" : "s"}`,
                  c.onramper_orders > 0 &&
                  `${c.onramper_orders} provider / Onramper order${c.onramper_orders === 1 ? "" : "s"}`,
                ].filter(Boolean);
                const rec = (n) => `record${n === 1 ? "" : "s"}`;
                return (
                  <>
                    {hasAny && (
                      <>
                        <p className="text-sm text-gray-200 font-medium mb-2">
                          {parts.join(", ")}.
                        </p>
                        <ul className="list-none pl-0 space-y-2">
                          {c.wallets > 0 && (
                            <li className="text-sm text-white">
                              Wallets ({c.wallets} {rec(c.wallets)})
                            </li>
                          )}
                          {c.transactions > 0 && (
                            <li className="text-sm text-white">
                              Transactions ({c.transactions} {rec(c.transactions)})
                            </li>
                          )}
                          {c.coinrabbit_orders > 0 && (
                            <li className="text-sm text-white">
                              CoinRabbit orders ({c.coinrabbit_orders} {rec(c.coinrabbit_orders)})
                            </li>
                          )}
                          {c.onramper_orders > 0 && (
                            <li className="text-sm text-white">
                              Provider / Onramper orders ({c.onramper_orders}{" "}
                              {rec(c.onramper_orders)})
                            </li>
                          )}
                        </ul>
                      </>
                    )}
                    {!deleteCountsLoading &&
                      c.wallets === 0 &&
                      c.transactions === 0 &&
                      c.onramper_orders === 0 &&
                      c.coinrabbit_orders === 0 && (
                        <p className="text-sm text-gray-400">
                          No wallet, transaction, CoinRabbit, or provider orders found to
                          list. The user account will still be removed.
                        </p>
                      )}
                  </>
                );
              })()}
            </div>

            <div className="flex justify-between gap-4 mt-6">

              {/* ❌ NO BUTTON FIX */}
              <button
                className="px-6 py-2 rounded primaty-bg text-black"
                onClick={() => {
                  setDeletemodal(false);
                  setDeleteCounts({
                    wallets: 0,
                    transactions: 0,
                    onramper_orders: 0,
                    coinrabbit_orders: 0,
                  });
                }}
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
    </div>
  );
};

export default Viewdetail;
