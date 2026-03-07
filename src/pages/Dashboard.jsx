import StatCard from "../components/StatCard";
import ChartsSection from "../components/ChartsSection";
import DashboardTable from "../components/DashboardTable";
import theme from '../config/theme';
import ReusableTable from "../reuseable/ReusableTable";
import axios from "axios";
import { constant } from "../const";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({});

  const [userTableData, setUserTableData] = useState([]);


  const [tranHistory, setTranHistory] = useState([]);


  const originalData = [
    {
      key: "1",
      pair: "BTC/USDT",
      orderId: "ORD123456",
      buyer: "Arun",
      tradeType: "Buy",
      price: "45000",
      volume: "0.25",
      exchange: "Binance",
    },
    {
      key: "2",
      pair: "ETH/USDT",
      orderId: "ORD789456",
      buyer: "Vijay",
      tradeType: "Sell",
      price: "2500",
      volume: "1",
      exchange: "Binance",
    },
    {
      key: "3",
      pair: "BTC",
      orderId: "ORD456123",
      buyer: "System",
      tradeType: "Deposit",
      price: "-",
      volume: "0.5",
      exchange: "Wallet",
    },
  ];

  const getdashboarddata = async () => {
    try {
      const res = await axios.get(
        `${constant.backend_url}/admin/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (res.data.success) {
        setDashboardData(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    getdashboarddata();
  }, []);


  // transaction table configuration
  const transactionColumns = [

      {
      title: "Transaction Hash",
      dataIndex: "transactionHash",
      render: (hash) => {
        if (!hash) return "-";
        const start = hash.slice(0, 6);
        const end = hash.slice(-4);
        return `${start}...${end}`;
      },
    },

    {
      title: "Network Name",
      dataIndex: "networkName",
    },
    {
      title: "Token Symbol",
      dataIndex: "tokenSymbol",
    },

  
    {
      title: "From",
      dataIndex: "from",
      render: (addr) => {
        if (!addr) return "-";
        const start = addr.slice(0, 6);
        const end = addr.slice(-4);
        return `${start}...${end}`;
      },
    },
    {
      title: "To",
      dataIndex: "to",
      render: (addr) => {
        if (!addr) return "-";
        const start = addr.slice(0, 6);
        const end = addr.slice(-4);
        return `${start}...${end}`;
      },
    },
    { title: "Amount", dataIndex: "amount" },
    // { title: "Symbol", dataIndex: "tokenSymbol" },
    // { title: "Status", dataIndex: "status" },
    {
      title: "Date",
      dataIndex: "DateTime",
      render: (dt) => {
        if (!dt) return "-";
        const d = new Date(dt);
        if (isNaN(d)) return dt;
        return d.toISOString().split("T")[0];
      },
    },
  ];

  const userColumns = [
    { title: "First Name", dataIndex: "firstname" },
    { title: "Last Name", dataIndex: "lastname" },
    { title: "Email", dataIndex: "email" },
    { title: "Phone", dataIndex: "phone" },
    { title: "Role", dataIndex: "role" },
    { title: "Type", dataIndex: "type" },
    {
      title: "Verified",
      dataIndex: "verifyStatus",
      render: (status) => (status ? "Yes" : "No"),
    },
  ];


  // const getuserstabledata = async () => {
  //   try {
  //     const res = await axios.get(
  //       `${constant.backend_url}/admin/get-all-users`,
  //       {},
  //       {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
  //         },
  //       }
  //     );

  //     if (res.data?.success) {
  //       const data = res.data.result.map((item, index) => ({
  //         id: item?._id,
  //         key: index + 1,
  //         firstname: item?.firstname || "-",
  //         lastname: item?.lastname || "-",
  //         email: item?.email || "-",
  //         phone: item?.phone || "-",
  //         role: item?.role || "-",
  //         type: item?.type || "-",
  //         verifyStatus: item?.verifyStatus || "-",
  //       }))
  //       setUserTableData(data);
  //       console.log(data, "usrerdada");
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };



const getuserstabledata = async () => {
  try {

    const res = await axios.get(
      `${constant.backend_url}/admin/get-all-users`,
      {
        params: {
          type: "recent",  
          page: 1,
          limit: 3          
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      }
    );

    if (res.data?.success) {

      const data = res.data.result.map((item) => ({
        id: item?._id,
        firstname: item?.firstname || "-",
        lastname: item?.lastname || "-",
        email: item?.email || "-",
        phone: item?.phone || "-",
        role: item?.role || "-",
        type: item?.type || "-",
        verifyStatus: item?.verifyStatus ? "Yes" : "No",
      }));

      setUserTableData(data);

    }

  } catch (error) {
    console.error(error);
  }
};
  useEffect(() => {
    getuserstabledata();
  }, []);


  const getTransationHistory = async () => {
    try {
      const res = await axios.get(
        `${constant.backend_url}/admin/get-all-transactions`,
        
        {

          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (res.data?.success) {
        const data = res.data.result
          .slice(0, 3)
          .map((item, index) => ({
            id: item?._id,
            key: index + 1,
            tokenSymbol: item?.tokenSymbol || "-",
            networkName: item?.networkName || "-",
            transactionHash: item?.transactionHash || "-",
            from: item?.from || "-",
            to: item?.to || "-",
            amount: item?.amount || "-",
            // status: item?.status || "-",
            DateTime: item?.createdAt || "-",
          }));
          console.log(data, "datasss");

        setTranHistory(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getTransationHistory();
  }, []);




  return (
    <div className="">
      {/* <div className="bg-img mb-5 w-full rounded-lg">
        <h1 className="text-white text-start p-7 font-bold text-2xl">DashBoard</h1>
      </div> */}
      <div
        className="mb-5 w-full rounded-lg bg-cover bg-center flex items-center"
        style={{
          backgroundImage: `url(${theme.dashboardheaderimg.image})`,
          height: theme.dashboardheaderimg.height
        }}
      >
        <div className="display-3 w-full">
          <h1 className="text-white p-7 font-bold text-2xl">
            DashBoard
          </h1>
        </div>
      </div>
      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Users" value={dashboardData?.totalusers || 0} />
        <StatCard title="Individual Users" value={dashboardData?.individualCount || 0} />
        <StatCard title="Professional Users" value={dashboardData?.professionalCount || 0} />
        <StatCard title="Total Transactions" value={dashboardData?.totalTransactions || 0} />
        <StatCard title="Revenue" value={dashboardData?.revenue || 0} />
        <StatCard title="Total Network" value={dashboardData?.totalNetworks || 0} />
        <StatCard title="EVM Network" value={dashboardData?.evenetworks || 0} />
        <StatCard title="Non EVM Network" value={dashboardData?.nonevmnetworks || 0} />
      </div>

      <ChartsSection dashboardData={dashboardData} />

      {/* <DashboardTable /> */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div>
          <div>
            <div>
              <div className="dashboard-bg">
                <div className="d-block heading-2 mb-10">Recent Users</div>
                <ReusableTable
                  columns={userColumns}
                  actionType={[]}
                  data={userTableData}
                  rowKey="id"
                  pagination={false}
                />
                <div className="text-right mt-2">
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                    onClick={() =>
                      navigate(`/${constant.adminRoute}/viewdetails`)
                    }
                  >
                    View More
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="dashboard-bg">

            <div className="d-block heading-2 mb-10">Transation History</div>

            <ReusableTable
              columns={transactionColumns}
              actionType={[]}
              data={tranHistory}
              rowKey="id"
              pagination={false}
            />
            <div className="text-right mt-2">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={() =>
                  navigate(`/${constant.adminRoute}/transaction`)
                }
              >
                View More
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
