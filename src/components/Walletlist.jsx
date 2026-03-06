import { useParams } from "react-router-dom";
import ReusableTable from "../reuseable/ReusableTable";
import { useLocation } from "react-router-dom";
import { LeftCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { constant } from "../const";
import TableHeader from "../reuseable/TableHeader";

const Walletlist = () => {
  const { state } = useLocation();
  const { id } = useParams(); // 👈 get id if exists
  const navigate = useNavigate();
  // const originalData = [
  //   {
  //     _id: "698c1551e372f04977305e1e",
  //     user_id: "698c154fe372f04977305e1a",
  //     walletname: "Wallet 1",
  //     btcaddress: "bc1qrueax3ed7gpm9gmttmlwfsyunrt270mtpjp434",
  //     evmaddress: "0xc18b156f0591fab5686c8b49a9f7c9276c336bb4",
  //     solanaaddress: "9amu4vhbrcvtdvoadrc7ciryqvoaxg8fscxebtcwhjvk",
  //     xrpaddress: "ref1nfzyfcdabq5oeurs24peffm4xtc87a",
  //     status: "true",
  //     phrase: "true"
  //   },
  //   {
  //     _id: "698c1569e372f04977305e22",
  //     user_id: "698c154fe372f04977305e1a",
  //     walletname: "Wallet 2",
  //     btcaddress: "bc1qy2wy4r9gsyuc9zdfn0axqkguj0pqknl8m999f8",
  //     evmaddress: "0x6dec2ec9415072dfd1f8b5da1a3f40a69c1f99b5",
  //     solanaaddress: "ep5w7qc9h2hatyusdbpvmbjlmvjhgeor7pfqi7qmpyjb",
  //     xrpaddress: "r3ma239d7grcangqas8tpvtvjbnveoqyn4",
  //     status: "false",
  //     phrase: "true"
  //   },

  // ];
  const [originalData,setOriginalData] = useState();
  const [allwalletData, setAllWalletData] = useState([]);
  const [walletData, setWalletData] = useState([]);
  const [filteredTableData, setFilteredTableData] = useState([]);
  const tableData = id ? walletData : filteredTableData;
  const getWallets = async () => {
    try {
      const res = await axios.post(
        `${constant.backend_url}/admin/userswalletdetails`,
        { userId: id }
      );

      if (res.data?.success) {

        const wallets = res.data.result.wallets.map((item) => ({
          key: item._id,
          walletname: item.walletName,
          btcaddress: item.btcAddress,
          evmaddress: item.evmAddress,
          solanaaddress: item.solAddress,
          xrpaddress: item.xrpAddress,
          status: item.checkStatus ? "Active" : "Inactive",
          // phrase: item.randomCheck?.join(", ")
        }));
        console.log(wallets, "wallets");

        setWalletData(wallets);
      }

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (id) {
      getWallets();
    } else {
      setWalletData(originalData);
    }
  }, [id]);

  const getAllWallets = async () => {
    try {
      const res = await axios.get(`${constant.backend_url}/users/get-all-wallets`,
   {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
    },
   }

      );
      if (res.data?.success) {
        const walletres = res.data.result.map((item) => ({
          key: item._id,
          walletname: item.walletName,
          btcaddress: item.btcAddress,
          evmaddress: item.evmAddress,
          solanaaddress: item.solAddress,
          xrpaddress: item.xrpAddress,
          status: item.checkStatus == true ? "active" : "inactive",
          // phrase: item.randomCheck?.join(", ")
        }))

        setAllWalletData(walletres);
        setFilteredTableData(walletres);
      }
    } catch (error) {
      console.error(error);
    }
  };




  useEffect(() => {
    getAllWallets();
  }, []);



  // 👇 Filter logic
  // const filteredData = id
  //   ? originalData.filter((item) => item.key === id)
  //   : originalData;

  const columns = [
    { title: "Wallet Name", dataIndex: "walletname",key: "walletname" },
    { title: "BTC Address", dataIndex: "btcaddress", key: "btcaddress" },
    { title: "EVM Address", dataIndex: "evmaddress", key: "evmaddress" },
    { title: "Solana Address", dataIndex: "solanaaddress", key: "solanaaddress", },
    { title: "XRP Address", dataIndex: "xrpaddress", key: "xrpaddress" },
    { title: "Status", dataIndex: "status", key: "status" },
    // { title: "Phrase", dataIndex: "phrase", key: "phrase" },
  ];

  // const filteredData = walletData.length ? walletData : originalData;
  const filteredData = id ? walletData : allwalletData;

  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        {state && (
          <LeftCircleOutlined
          onClick={() => navigate(-1)}
            style={{ fontSize: "20px", cursor: "pointer", color: "white" }} History
          className="back-icon"
        />
        )}
        
        <h2 className="text-2xl font-semibold white">{state ? "Wallet History" : "Wallet Details"} </h2>
      </div>   
      {!id && (
        <TableHeader
          data={allwalletData}
          onFilter={(data) => setFilteredTableData(data)}
          showCreateButton={false}
          showPrivateFilter={false}
        />
      )}

       <ReusableTable
      columns={columns}
        data={tableData}
      rowKey="key"
      actionType={[]}
    />
    </>
  );
};

export default Walletlist;
