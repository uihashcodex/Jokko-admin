import { useNavigate } from "react-router-dom";
import ReusableTable from "../reuseable/ReusableTable";
import TableHeader from "../reuseable/TableHeader";
import { useState } from "react";
import axios from "axios";
import { constant } from "../const";
import { useEffect } from "react";
import { message } from "antd"; 

// const originalData = [
//   // {
//   //   key: "1",
//   //   sno: 1,
//   //   pair: "BTC/USDT",
//   //   orderId: "ORD123456",
//   //   time: "19-02-2026 10:45 AM",
//   //   buyer: "Arun",
//   //   orderType: "Limit",
//   //   tradeType: "Buy",
//   //   price: "45000",
//   //   volume: "0.25",
//   //   total: "11250",
//   //   fee: "12",
//   //   exchange: "Binance",
//   // },
//   // {
//   //   key: "2",
//   //   sno: 1,
//   //   pair: "USDT",
//   //   orderId: "WD123",
//   //   time: "19-02-2026 11:00 AM",
//   //   buyer: "Vijay",
//   //   orderType: "-",
//   //   tradeType: "Withdraw",
//   //   price: "-",
//   //   volume: "500",
//   //   total: "500",
//   //   fee: "2",
//   //   exchange: "Wallet",
//   // },
//   // {
//   //   key: "3",
//   //   sno: 1,
//   //   pair: "BTC",
//   //   orderId: "DP456",
//   //   time: "19-02-2026 12:00 PM",
//   //   buyer: "System",
//   //   orderType: "-",
//   //   tradeType: "Deposit",
//   //   price: "-",
//   //   volume: "0.5",
//   //   total: "-",
//   //   fee: "0",
//   //   exchange: "Wallet",
//   // },
// ];

const columns = [
  { title: "Name", dataIndex: "name", key: "name" },
  { title: "Email", dataIndex: "email", key: "email" },
  { title: "Phone", dataIndex: "phone", key: "phone" },
  { title: "Status", dataIndex: "status", key: "status" },
  { title: "Type", dataIndex: "type", key: "type" },
  { title: "Country", dataIndex: "country", key: "contry" },
  { title: "Unique ID", dataIndex: "uniqueid", key: "uniqueid" },
  // { title: "Exchange", dataIndex: "exchange", key: "exchange" },
];


const Viewdetail = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const [originalData, setOriginalData] = useState([]);
  const [filteredData, setFilteredData] = useState(originalData);
  const [open, setOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const handleCreate = () => {
    setOpen(true);
    setSelectedRecord(null);
  };

  const fetUsers = async () => {
    try {
      const [individualRes, professionalRes] = await Promise.all([
        axios.get(`${constant.backend_url}/admin/get-all-individual`),
        axios.get(`${constant.backend_url}/admin/get-all-professional`)
      ]);
      if (individualRes, professionalRes.data?.success) {
        const individualUsers = individualRes.data.result || [];
        const professionalUsers = professionalRes.data.result || [];

        const allUsers = [...individualUsers, ...professionalUsers];

        const tableData = allUsers.map((user, index) => ({
          key: user?._id,
          sno: index + 1,
          name: ` ${user?.firstname} ${user?.lastname}` || "-",
          email: user?.email || "-",
          phone: user?.phone || "-",
          status: user?.blockStatus ? "blocked" : "active",
          type: user?.type || "-",
          country: user?.country || "-",
          uniqueid: user?.unique_id || "-",
          // exchange: "Wallet"
        }));

        console.log(tableData, "tableData");
        setOriginalData(tableData);
        setFilteredData(tableData);

      }

      else {
        setOriginalData([]);
        setFilteredData([]);
      }

    }
    catch (error) {
      console.error("Error fetching users:", error);
      setOriginalData([]);
      setFilteredData([]);
    }
  };

  useEffect(() => {
    fetUsers();
  }, [page]);

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


  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 white">View Detail</h2>
      <TableHeader
        data={originalData}
        onFilter={setFilteredData}
        onCreate={handleCreate}
        showStatusFilter={true}
        showCreateButton={false}
        showPrivateFilter={true}
      />
    <ReusableTable
  columns={columns}
  data={filteredData}
  pageSize={7}
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
