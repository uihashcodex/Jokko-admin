import { useParams } from "react-router-dom";
import ReusableTable from "../reuseable/ReusableTable";


const TransectionHistory = () => {
const { id } = useParams(); // 👈 get id

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

  const filteredData = id
    ? originalData.filter((item) => item.key === id)
    : originalData;

  const columns = [
    { title: "Pair", dataIndex: "pair" },
    { title: "Order ID", dataIndex: "orderId" },
    { title: "Buyer", dataIndex: "buyer" },
    { title: "Trade Type", dataIndex: "tradeType" },
    { title: "Price", dataIndex: "price" },
    { title: "Volume", dataIndex: "volume" },
    { title: "Exchange", dataIndex: "exchange" },
  ];

  return (
    <>
    <h2 className="text-2xl font-semibold mb-4">Transection History</h2>
    <ReusableTable
      columns={columns}
      data={filteredData}
      rowKey="key"
    />
    </>
  );
};

export default TransectionHistory;
