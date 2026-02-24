import { useNavigate } from "react-router-dom";
import ReusableTable from "../reuseable/ReusableTable";

const originalData = [
  {
    key: "1",
    sno: 1,
    pair: "BTC/USDT",
    orderId: "ORD123456",
    time: "19-02-2026 10:45 AM",
    buyer: "Arun",
    orderType: "Limit",
    tradeType: "Buy",
    price: "45000",
    volume: "0.25",
    total: "11250",
    fee: "12",
    exchange: "Binance",
  },
  {
    key: "2",
    sno: 1,
    pair: "USDT",
    orderId: "WD123",
    time: "19-02-2026 11:00 AM",
    buyer: "Vijay",
    orderType: "-",
    tradeType: "Withdraw",
    price: "-",
    volume: "500",
    total: "500",
    fee: "2",
    exchange: "Wallet",
  },
  {
    key: "3",
    sno: 1,
    pair: "BTC",
    orderId: "DP456",
    time: "19-02-2026 12:00 PM",
    buyer: "System",
    orderType: "-",
    tradeType: "Deposit",
    price: "-",
    volume: "0.5",
    total: "-",
    fee: "0",
    exchange: "Wallet",
  },
];

const columns = [
  { title: "Pair", dataIndex: "pair", key: "pair" },
  { title: "Order ID", dataIndex: "orderId", key: "orderId" },
  { title: "Buyer", dataIndex: "buyer", key: "buyer" },
  { title: "Trade Type", dataIndex: "tradeType", key: "tradeType" },
  { title: "Price", dataIndex: "price", key: "price" },
  { title: "Volume", dataIndex: "volume", key: "volume" },
  { title: "Exchange", dataIndex: "exchange", key: "exchange" },
];


const Viewdetail = () => {
  const navigate = useNavigate();
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">View Detail</h2>
      <ReusableTable
        columns={columns}
        data={originalData}
        rowKey="key"
        actionType="view"
        onView={(record, section) => {
          if (section === "wallet") {
            navigate(`/wallet/${record.key}`);
          }

          if (section === "transaction") {
            navigate(`/transaction/${record.key}`);
          }
        }}
      />
    </div>
  );
};

export default Viewdetail;
