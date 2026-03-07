import { useParams, useLocation, useNavigate } from "react-router-dom";
import ReusableTable from "../reuseable/ReusableTable";
import { LeftCircleOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import axios from "axios";
import { constant } from "../const";
import TableHeader from "../reuseable/TableHeader";
import ReusableModal from "../reuseable/ReusableModal";

const Walletlist = () => {

  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [walletData, setWalletData] = useState([]);
  const [filteredTableData, setFilteredTableData] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);

  const [totalUsers, setTotalUsers] = useState(0);


  // ✅ pagination states
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  // ✅ filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  // -----------------------------
  // USER WALLET DETAILS (HISTORY)
  // -----------------------------
  const getWallets = async () => {
    try {

      const res = await axios.post(
        `${constant.backend_url}/admin/userswalletdetails`,
        { userId: id }
      );

      if (res.data?.success) {

        const walletsList = res.data.result.wallets.map((item) => ({
          key: item?._id,
          walletname: item?.walletName,
          firstname: item?.firstname || "-",
          btcaddress: item?.btcAddress,
          evmaddress: item?.evmAddress,
          solanaaddress: item?.solAddress,
          xrpaddress: item?.xrpAddress,
          status: item?.checkStatus ? "Active" : "Inactive",
        }));

        setWalletData(walletsList);

      }

    } catch (error) {
      console.error(error);
    }
  };

  // -----------------------------
  // GET ALL WALLETS (ADMIN)
  // -----------------------------


  const [filters, setFilters] = useState({
    search: "",
    type: "",
    status: ""
  });

  const getAllWallets = async () => {

    try {

      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "" && v !== undefined)
      );

      const res = await axios.get(
        `${constant.backend_url}/users/get-all-wallets`,
        {
          params: {
            ...cleanFilters,
            page: page,
            limit: 10
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (res.data?.success) {
          const walletss = res.data.result || [];
        setTotalUsers(res.data.total);

        // const walletres = res.data.result.map((item) => ({
        const walletres = walletss.map((item) => ({
          key: item?._id,
          walletname: item?.walletName,
          firstname: item?.firstname || "-",
          btcaddress: item?.btcAddress,
          evmaddress: item?.evmAddress,
          solanaaddress: item?.solAddress,
          xrpaddress: item?.xrpAddress,
          status: item?.checkStatus ? "Active" : "Inactive",
        }));

        setFilteredTableData(walletres);
        setTotal(res.data.total || 0);

      }

    } catch (error) {
      console.error(error);
    }
  };
  

  useEffect(() => {

    if (id) {
      getWallets();
    } else {
      getAllWallets();
    }

  }, [page, filters]);

  const updateFilter = (key, value) => {

    if (key === "status") {
      value = value === "active" ? true : value === "inactive" ? false : "";
    }

    const updatedFilters = { ...filters, [key]: value };

    setFilters(updatedFilters);
    getAllWallets(updatedFilters);
  };
  // -----------------------------
  // MODAL FIELDS
  // -----------------------------
  const walletFields = [
    { name: "btcaddress", label: "BTC Address", type: "copy" },
    { name: "evmaddress", label: "EVM Address", type: "copy" },
    { name: "solanaaddress", label: "Solana Address", type: "copy" },
    { name: "xrpaddress", label: "XRP Address", type: "copy" },
  ];

  // -----------------------------
  // TABLE COLUMNS
  // -----------------------------
  const columns = [
    { title: "Wallet Name", dataIndex: "walletname" },
    { title: "User Name", dataIndex: "firstname" },

    {
      title: "BTC Address",
      dataIndex: "btcaddress",
      render: (addr) =>
        addr ? `${addr.slice(0, 6)}...${addr.slice(-8)}` : "-"
    },

    {
      title: "EVM Address",
      dataIndex: "evmaddress",
      render: (evm) =>
        evm ? `${evm.slice(0, 6)}...${evm.slice(-8)}` : "-"
    },

    {
      title: "Solana Address",
      dataIndex: "solanaaddress",
      render: (sol) =>
        sol ? `${sol.slice(0, 6)}...${sol.slice(-8)}` : "-"
    },

    {
      title: "XRP Address",
      dataIndex: "xrpaddress",
      render: (xrp) =>
        xrp ? `${xrp.slice(0, 6)}...${xrp.slice(-8)}` : "-"
    },

    { title: "Status", dataIndex: "status" },
  ];

  const tableData = id ? walletData : filteredTableData;

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

        <h2 className="text-2xl font-semibold white">
          {state ? "Wallet History" : "Wallet Details"}
        </h2>

      </div>

      {/* FILTER HEADER */}

      {!id && (
        <TableHeader
          data={filteredTableData}
          // onSearch={(value) => {
          //   setSearch(value);
          //   setPage(1);
          // }}
          // onStatusChange={(value) => {
          //   setStatus(value);
          //   setPage(1);
          // }}
          onSearch={(value) => updateFilter("search", value)}
          onTypeChange={(value) => updateFilter("type", value)}
          onVerifyChange={(value) => updateFilter("status", value)}
          
          showCreateButton={false}
          showPrivateFilter={false}
        />
      )}

      {/* TABLE */}

      <ReusableTable
        columns={columns}
        data={tableData}
        rowKey="key"
        // pageSize={10}

        // pagination={{
        //   current: page,
        //   total: total,
        //   pageSize: limit,
        //   onChange: (p) => setPage(p),
        // }}

        pageSize={10}
        total={totalUsers}
        currentPage={page}
        onPageChange={(p) => setPage(p)}  

        actionType={["viewMore"]}

        onView={(record) => {
          setSelectedWallet(record);
          setModalOpen(true);
        }}
      />

      {/* MODAL */}

      <ReusableModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        title="Wallet Details"
        description=""
        fields={walletFields}
        initialValues={selectedWallet}
        showFooter={false}
      />
    </>
  );
};

export default Walletlist;