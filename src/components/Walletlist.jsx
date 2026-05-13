import { useParams, useLocation, useNavigate } from "react-router-dom";
import ReusableTable from "../reuseable/ReusableTable";
import { LeftCircleOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import axios from "axios";
import { constant } from "../const";
import TableHeader from "../reuseable/TableHeader";
import ReusableModal from "../reuseable/ReusableModal";
import { message, Tooltip } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import create from "@ant-design/icons/lib/components/IconFont";
import ExportButton from "../reuseable/ExportButton";
const Walletlist = () => {

  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [filteredTableData, setFilteredTableData] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  // const [selectedWallet, setSelectedWallet] = useState(null);

  const [totalUsers, setTotalUsers] = useState(0);

  const [selectedWallet, setSelectedWallet] = useState({
    label: "",
    value: ""
  });
  // ✅ pagination states
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // ✅ filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");



      const [deletemodal, setDeletemodal] = useState(false);
    const [deleteRecord, setDeleteRecord] = useState(null);
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
          key: item?._id || item?.id,
          walletname: item?.walletname || item?.walletName,
          firstname: item?.firstname || "-",
          btcaddress: item?.btcAddress,
          evmaddress: item?.evmAddress,
          solanaaddress: item?.solAddress,
          xrpaddress: item?.xrpAddress,
          trxAddress:item?.trxAddress,
          createdAt: item?.createdAt ? item?.createdAt.split("T")[0] : "",
          // updatedAt: item?.updatedAt ? item?.updatedAt.split("T")[0] : "",
          status: item?.walletStatus ? "Active" : "Inactive",
                }));

        setFilteredTableData(walletsList);

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
    status: "",
    fromDate: "",
    toDate: ""
  });

  const PAGE_SIZE = 10;

  const formatWallets = (wallets = [], pageNumber = 1, pageLimit = PAGE_SIZE) =>
    wallets.map((item, index) => ({
      key: item?._id || item?.id,
      sno: (pageNumber - 1) * pageLimit + index + 1,
      walletname: item?.walletname || item?.walletName,
      firstname: item?.firstname || "-",
      btcaddress: item?.btcAddress,
      evmaddress: item?.evmAddress,
      solanaaddress: item?.solAddress,
      xrpaddress: item?.xrpAddress,
      trxAddress: item?.trxAddress,
      status: item?.walletStatus ? "Active" : "Inactive",
      createdAt: item?.createdAt ? item.createdAt.split("T")[0] : "",
      rawCreatedAt: item?.createdAt || "",
    }));

  const getAllWallets = async (id, item,index) => {

    console.log("FididD", id)

    try {
      setLoading(true);


      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "" && v !== undefined)
      );
      const startTime = Date.now();
      const res = await axios.get(
        `${constant.backend_url}/users/get-all-wallets`,
        {
          params: {
            ...cleanFilters,
            page: page,
            limit: 10,
            userId:id
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (res.data?.success) {
          const walletss = res.data.result || [];
        setTotalUsers(res.data.total);

        const walletres = formatWallets(walletss, page, PAGE_SIZE);

        setFilteredTableData(walletres);
        setTotal(res.data.total || 0);

      }
      const elapsed = Date.now() - startTime;
      const remaining = 500 - elapsed;

      setTimeout(() => {
        setLoading(false);
      }, remaining > 0 ? remaining : 0);

    } catch (error) {
      console.error(error);
    }
  };

  const getWalletsForExport = async () => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== "" && v !== undefined)
    );
    const res = await axios.get(`${constant.backend_url}/users/get-all-wallets`, {
      params: {
        ...cleanFilters,
        page: 1,
        limit: total || totalUsers || 100000,
        userId: id,
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    });

    if (!res.data?.success) return [];
    return formatWallets(res.data.result || [], 1, total || totalUsers || 100000);
  };
  

  useEffect(() => {

    // if (id) {
    //   getWallets();
    // } else {
      getAllWallets(id);
    // }

  }, [id, page, filters]);





        const handleDelete = async (userId) => {
        try {
            setLoading(true);

            const res = await axios.post(
                `${constant.backend_url}/admin/delete-userswallets`,
                {
                    userId
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
                    },
                }
            );

            if (res.data?.success) {
                message.success("Wallet Deleted successfully");
                setDeletemodal(false);
                getAllWallets(id);
            } else {
                message.warning(res.data.message || "Delete failed");
            }

        } catch (error) {
            console.log(error);
            message.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

  const updateFilter = (key, value) => {
    if (key === "status") {
      value = value === "active" ? true : value === "inactive" ? false : "";
    }

    setFilters({ ...filters, [key]: value });
    setPage(1); // reset page when filter changes
  };
  // -----------------------------
  // MODAL FIELDS
  // -----------------------------
  const walletFields = [
    { name: "btcaddress", label: "BTC Address", type: "copy" },
    { name: "evmaddress", label: "EVM Address", type: "copy" },
    { name: "solanaaddress", label: "Solana Address", type: "copy" },
    { name: "xrpaddress", label: "XRP Address", type: "copy" },
    { name: "trxAddress", label: "TRX Address", type: "copy" },
  ];

  // -----------------------------
  // TABLE COLUMNS
  // -----------------------------
  const columns = [
    { title: "S.no", dataIndex: "sno" },
    { title: "Wallet Name", dataIndex: "walletname" },
    { title: "User Name", dataIndex: "firstname" },

    // {
    //   title: "BTC Address",
    //   dataIndex: "btcaddress",
    //   render: (addr) =>
    //     addr ? `${addr.slice(0, 6)}...${addr.slice(-8)}` : "-"
    // },
    {
      title: "BTC Address",
      dataIndex: "btcaddress",
      render: (addr, record) =>
        addr ? (
          <span
            style={{ cursor: "pointer", color: "#c9f07b" }}
            onClick={() => {
              setSelectedWallet({
                label: "BTC Address",
                value: addr
              });
              setModalOpen(true);
            }}
          >
            {addr.slice(0, 6)}...{addr.slice(-8)}
          </span>
        ) : "-"
    },

    {
      title: "EVM Address",
      dataIndex: "evmaddress",
      render: (evm, record) =>
        evm ? (
          <span
            style={{ cursor: "pointer", color: "#c9f07b" }}
            onClick={() => {
              setSelectedWallet({
                label: "EVM Address",
                value: evm
              });
              setModalOpen(true);
            }}
          >
            {evm.slice(0, 6)}...{evm.slice(-8)}
          </span>
        ) : "-"
    },

    {
      title: "Solana Address",
      dataIndex: "solanaaddress",
      render: (sol, record) =>
        sol ? (
          <span
            style={{ cursor: "pointer", color: "#c9f07b" }}
            onClick={() => {
              setSelectedWallet({
                label: "Solana Address",
                value: sol
              });
              setModalOpen(true);
            }}
          >
            {sol.slice(0, 6)}...{sol.slice(-8)}
          </span>
        ) : "-"
    },

    {
      title: "XRP Address",
      dataIndex: "xrpaddress",
      render: (xrp, record) =>
        xrp ? (
          <span
            style={{ cursor: "pointer", color: "#c9f07b" }}
            onClick={() => {
              setSelectedWallet({
                label: "XRP Address",
                value: xrp
              });
              setModalOpen(true);
            }}
          >
            {xrp.slice(0, 6)}...{xrp.slice(-8)}
          </span>
        ) : "-"
    },



    {
      title: "TRX Address",
      dataIndex: "trxAddress",
      render: (trx, record) =>
        trx ? (
          <span
            style={{ cursor: "pointer", color: "#c9f07b" }}
            onClick={() => {
              setSelectedWallet({
                label: "TRX Address",
                value: trx
              });
              setModalOpen(true);
            }}
          >
            {trx.slice(0, 6)}...{trx.slice(-8)}
          </span>
        ) : "-"
    },
    // { title: "Created At", dataIndex: "createdAt", key: "createdAt" },
    // { title: "Updated At", dataIndex: "createdAt", key: "updatedAt" },

    { title: "Status", dataIndex: "status" },
  ];

  const tableData = filteredTableData;

    const handleBlockWallet = async (record) => {
    try {

      const isCurrentlyActive = record.status === "Active";

      const res = await axios.post(
        `${constant.backend_url}/admin/userswallet-control`,
        {
          walletId: record.key,
          walletStatus: !isCurrentlyActive
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (res.data?.success) {

        message.success(res.data.message);

        const updatedStatus = isCurrentlyActive ? "Inactive" : "Active";

        setFilteredTableData(prev =>
          prev.map(item =>
            item.key === record.key
              ? { ...item, status: updatedStatus }
              : item
          )
        );

      }

    } catch (error) {
      console.error(error);
    }
  };

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
          onSearch={(value) => updateFilter("search", value)}
          onTypeChange={(value) => updateFilter("type", value)}
          onVerifyChange={(value) => updateFilter("status", value)}
          showExportButton={true}
          exportFilename="wallet_details"
          exportColumns={columns}
          getExportData={getWalletsForExport}
          showDateFilter={true}
          onDateChange={(dates) => {
            setPage(1);

            setFilters(prev => ({
              ...prev,
              fromDate: dates?.[0] || "",
              toDate: dates?.[1] || ""
            }));
          }}
          searchTooltip="Search by User Name, Address"
          showCreateButton={false}
          showPrivateFilter={false}
        />
      )}

      {id && (
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 10px", marginBottom: 12 }}>
          <ExportButton
            filename={`user_wallets_${id}`}
            columns={columns}
            data={tableData}
            getExportData={getWalletsForExport}
          />
        </div>
      )}

      {/* TABLE */}

      <ReusableTable
        columns={columns}
        data={tableData}
        rowKey="key"
        pageSize={10}
        total={total}
        currentPage={page}
        onPageChange={(p) => setPage(p)}  
        actionType={["block","Remove"]}
        onBlock={(record) => handleBlockWallet(record)}  
              onDelete={(record) => {
        setDeleteRecord(record);
        setDeletemodal(true);
    }}
        loading={loading} 

      />




            <ReusableModal
  open={deletemodal}
  onCancel={() => setDeletemodal(false)}
  title="Delete Wallet"
  description={"Are you sure you want to delete this Wallet?"}
  showFooter={false}
  extraContent={
    <div className="text-center">

      <p className="text-gray-300 text-base">
        Are you sure you want to delete this Wallet?
      </p>

      <div className="flex justify-between gap-4 mt-6">

        {/* ❌ NO BUTTON FIX */}
        <button
          className="px-6 py-2 rounded primaty-bg text-black"
          onClick={() => setDeletemodal(false)}
        >
          No
        </button>

        {/* ❌ YES BUTTON FIX */}
        <button
          className="px-6 py-2 rounded bg-red-600 text-white"
          onClick={() => handleDelete(deleteRecord?.key)}
        >
          Yes
        </button>

      </div>

    </div>
  }
/>

      {/* MODAL */}
      <ReusableModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        title={"Address"}
        showFooter={false}
        fields={[]}   
        description={" "}
        extraContent={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10
            }}
          >
            <div className="modal-sub-head">{selectedWallet?.label}:</div>

            <div className="modal-sub-para" onClick={() => {
              navigator.clipboard.writeText(selectedWallet?.value);
              message.success("Address copied!");
            }}
              style={{ cursor: "pointer",}}
            >{selectedWallet?.value}</div>

            <Tooltip title="Copy address">
              <CopyOutlined
                style={{ cursor: "pointer", fontSize: 18 }}
                onClick={() => {
                  navigator.clipboard.writeText(selectedWallet?.value);
                  message.success("Address copied!");
                }}
              />
            </Tooltip>
          </div>
        }
      />
    </>
  );
};

export default Walletlist;
