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
        const tableData = users.map((user, index) => ({

          key: user?._id,
 sno: (page - 1) * 10 + index + 1,          
 name: `${user?.firstname || ""} ${user?.lastname || ""}`.trim() || "-",
          email: user?.email || "-",
          phone: user?.phone || "-",
          status: user?.blockstatus ? "Inactive" : "active",
          type: user?.type || "-",
          country: user?.country || "-",
          createdAt: user?.createdAt ? user.createdAt.split("T")[0] : "-",
          // updatedAt: user?.updatedAt ? user.updatedAt.split("T")[0] : "-",
          uniqueid: user?.unique_id || "-"
        }));

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
        }}

        onBlock={(record) => blockUser(record)}
        onUnblock={(record) => blockUser(record)}
         onDelete={(record) => {
        setDeleteRecord(record);
        setDeletemodal(true);
    }}
      />

    <ReusableModal
  open={deletemodal}
  onCancel={() => setDeletemodal(false)}
  title="Delete User"
  description={"Are you sure you want to delete this user?"}
  showFooter={false}
  extraContent={
    <div className="text-center">

      <p className="text-gray-300 text-base">
        Are you sure you want to delete this user?
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
    </div>
  );
};

export default Viewdetail;
