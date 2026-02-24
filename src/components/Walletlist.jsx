import { useParams } from "react-router-dom";
import ReusableTable from "../reuseable/ReusableTable";

const Walletlist = () => {

  const { id } = useParams(); // 👈 get id if exists

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
      pair: "USDT",
      orderId: "WD123",
      buyer: "Vijay",
      tradeType: "Withdraw",
      price: "-",
      volume: "500",
      exchange: "Wallet",
    },
    {
      key: "3",
      pair: "BTC",
      orderId: "DP456",
      buyer: "System",
      tradeType: "Deposit",
      price: "-",
      volume: "0.5",
      exchange: "Wallet",
    },
  ];

  // 👇 Filter logic
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
    <h2 className="text-2xl font-semibold mb-4">Wallet History</h2>
    <ReusableTable
      columns={columns}
      data={filteredData}
      rowKey="key"
    />
    </>
  );
};

export default Walletlist;
