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

const columns = [
  { title: "Name", dataIndex: "name", key: "name" },
  { title: "Email", dataIndex: "email", key: "email" },
  { title: "Phone", dataIndex: "phone", key: "phone" },
  { title: "Status", dataIndex: "status", key: "status" },
  { title: "Type", dataIndex: "type", key: "type" },
  { title: "Country", dataIndex: "country", key: "contry" },
  { title: "Unique ID", dataIndex: "uniqueid", key: "uniqueid" ,
    render: (frm) => {
      if (!frm) return "-";
      return `${frm.slice(0, 8)}...`;
    }
  },
  // { title: "Exchange", dataIndex: "exchange", key: "exchange" },
];


const Viewdetail = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const [originalData, setOriginalData] = useState([]);
  // const [filteredData, setFilteredData] = useState(originalData);
  const [open, setOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const handleCreate = () => {
    setOpen(true);
    setSelectedRecord(null);
  };



  const [filters, setFilters] = useState({
    search: "",
    type: "",
    blockstatus: ""
  });

  const fetUsers = async (filters = {}) => {
    try {
           
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "" && v !== undefined)
      );

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
          sno: index + 1,
          name: `${user?.firstname || ""} ${user?.lastname || ""}`.trim() || "-",
          email: user?.email || "-",
          phone: user?.phone || "-",
          status: user?.blockstatus ? "blocked" : "active",
          type: user?.type || "-",
          country: user?.country || "-",
          uniqueid: user?.unique_id || "-"
        }));

        console.log(tableData, "tableData");

        setOriginalData(tableData);
        // setFilteredData(tableData);

      } else {
        setOriginalData([]);
        // setFilteredData([]);
      }

    } catch (error) {
      console.error("Error fetching users:", error);
      setOriginalData([]);
      // setFilteredData([]);
    }
  };
 
  useEffect(() => {
    fetUsers(filters);
  }, [page, filters]);


  // const updateFilter = (key, value) => {

  //   if (key === "verifyStatus") {
  //     value = value === "active" ? true : value === "inactive" ? false : "";
  //   }

  //   const updatedFilters = { ...filters, [key]: value };

  //   setFilters(updatedFilters);
  // };


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
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 white">View Detail</h2>
      <TableHeader
        data={originalData}
        // onFilter={setFilteredData}
        onCreate={handleCreate}
        showStatusFilter={true}
        showCreateButton={false}
        showPrivateFilter={true}
        onSearch={(value) => debouncedSearch(value)}
        onTypeChange={(value) => updateFilter("type", value)}
        onVerifyChange={(value) => updateFilter("blockstatus", value)}ss        //

      />
      <ReusableTable
        columns={columns}
        data={originalData}
        pageSize={10}
        total={totalUsers}
        currentPage={page}
        onPageChange={(p) => setPage(p)}    
            rowKey="key"
        actionType={["view", "block"]}
        onView={(record, section) => {
          if (section === "wallet") {
            navigate(`/wallet/${record.key}`, { state: record });
          }

          if (section === "transaction") {
            navigate(`/transaction/${record.key}`, { state: record });
          }
        }}
        onBlock={(record) => blockUser(record)}
        onUnblock={(record) => blockUser(record)}
      />
    </div>
  );
};

export default Viewdetail;
