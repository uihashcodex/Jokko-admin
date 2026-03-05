import { useParams } from "react-router-dom";
import ReusableTable from "../reuseable/ReusableTable";
import { useLocation } from "react-router-dom";
import { LeftCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { constant } from "../const";

const TransectionHistory = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [originalData, setOriginalData] = useState([]);
  const [transactionData, setTransactionData] = useState([]);
  const [alltrandata, setAlltrandata] = useState(originalData);

  // const originalData = [
  //   {
  //     key: "1",
  //     pair: "BTC/USDT",
  //     orderId: "ORD123456",
  //     buyer: "Arun",
  //     tradeType: "Buy",
  //     price: "45000",
  //     volume: "0.25",
  //     exchange: "Binance",
  //   },
  //   {
  //     key: "2",
  //     pair: "ETH/USDT",
  //     orderId: "ORD789456",
  //     buyer: "Vijay",
  //     tradeType: "Sell",
  //     price: "2500",
  //     volume: "1",
  //     exchange: "Binance",
  //   },
  //   {
  //     key: "3",
  //     pair: "BTC",
  //     orderId: "ORD456123",
  //     buyer: "System",
  //     tradeType: "Deposit",
  //     price: "-",
  //     volume: "0.5",
  //     exchange: "Wallet",
  //   },
  // ];

  const getTransation = async () => {
    try {
      const res = await axios.post(
        `${constant.backend_url}/admin/userswalletdetails`,
        { userId: id }
      );

      if (res.data?.success) {

        const trans = res.data.result.wallets.map((item) => ({
          key: item._id,
          walletname: item.walletName,
          btcaddress: item.btcAddress,
          evmaddress: item.evmAddress,
          solanaaddress: item.solAddress,
          xrpaddress: item.xrpAddress,
          status: item.checkStatus ? "Active" : "Inactive",
          // phrase: item.randomCheck?.join(", ")
        }));

        setTransactionData(trans);
      }

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (id) {
      getTransation();
    } else {
      setTransactionData(originalData);
    }
  }, [id]);


  const getAllTransaction = async () => {
    try {
      const res = await axios.get(`${constant.backend_url}/admin/get-all-transactions`,

        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }

      );
      if (res.data?.success) {
        const transres = res.data.result.map((item) => ({
          key: item?._id,
          transactionHash: item?.transactionHash,
          networkId: item?.network_id,
          amount: item?.amount,
          from: item?.from,
          to: item?.to,
          tokenSymbol: item?.tokenSymbol,
          status: item?.status ? "Active" : "Inactive",
          // phrase: item.randomCheck?.join(", ")
        }))
        console.log(transres,"dsggffgf");

        setAlltrandata(transres);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getAllTransaction();
  }, []);

  // const filteredData = id
  //   ? originalData.filter((item) => item.key === id)
  //   : originalData;

  // const filteredData = state ? [state] : originalData;

  const filteredData = id ? transactionData : alltrandata;


  const columns = [
    { title: "Transaction", dataIndex: "transactionHash" },
    { title: "Network ID", dataIndex: "networkId" },
    { title: "Amount", dataIndex: "amount" },
    { title: "From", dataIndex: "from" },
    { title: "To", dataIndex: "to" },
    { title: "Token Symbol", dataIndex: "tokenSymbol" },
    { title: "Status", dataIndex: "status" },
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
        <h2 className="text-2xl font-semibold  white">Transection History</h2>
      </div>
      <ReusableTable
        columns={columns}
        data={filteredData}
        rowKey="key"
        actionType={["", ""]}

      />
    </>
  );
};

export default TransectionHistory;
