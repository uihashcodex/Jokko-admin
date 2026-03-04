import { useParams } from "react-router-dom";
import ReusableTable from "../reuseable/ReusableTable";
import { useLocation } from "react-router-dom";
import { LeftCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const TransectionHistory = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

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

  // const filteredData = id
  //   ? originalData.filter((item) => item.key === id)
  //   : originalData;

  const filteredData = state ? [state] : originalData;



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
      />
    </>
  );
};

export default TransectionHistory;
