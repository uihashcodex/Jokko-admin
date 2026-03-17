import { useParams } from "react-router-dom";
import ReusableTable from "../reuseable/ReusableTable";
import { useLocation } from "react-router-dom";
import { CopyOutlined, LeftCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { constant } from "../const";
import TableHeader from "../reuseable/TableHeader";
import ReusableModal from "../reuseable/ReusableModal";
import debounce from "lodash.debounce";
import { useMemo } from "react";
import { message } from "antd";
import create from "@ant-design/icons/lib/components/IconFont";

const TransectionHistory = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [originalData, setOriginalData] = useState([]);
  const [transactionData, setTransactionData] = useState([]);
  const [alltrandata, setAlltrandata] = useState([]);
  const [filteredTableData, setFilteredTableData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTrans, setSelectedTrans] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [networkOptions, setNetworkOptions] = useState([]);
  const [networkId, setNetworkId] = useState("");

  const TransactionFields = [
    {
      name: "transactionHash", label: "Transaction", type: "copy",
    },
    {
      name: "networkName", label: "Network Name", type: "copy",

    },
    {
      name: "from", label: "From", type: "copy",
    },
    {
      name: "to", label: "To", type: "copy",

    },
  ];

  const getTransation = async () => {
    try {
      const res = await axios.post(
        `${constant.backend_url}/admin/getAllUsersWalletTransactions`,
        { user_id: id },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (!res.data?.success) {
        setTransactionData([]);
        setTotalUsers(0);
        message.warning(res.data?.message || "No transactions found");
        return;
      }

      if (res.data?.success) {
        const trandata = res.data.data.docs || [];


        const trans = trandata.map((item) => ({
          key: item?._id,
          transactionHash: item?.transactionHash || "-",
          networkName: item?.network_id?.networkName || "-",
          amount: item?.amount || "-",
          from: item?.from || "-",
          to: item?.to || "-",
          tokenSymbol: item?.tokenSymbol || "-",
          createdAt: item?.createdAt ? item?.createdAt.split("T")[0] : "",
          updatedAt: item?.updatedAt ? item?.updatedAt.split("T")[0] : "", 
          status: item?.status || "-",
        }));



        setTransactionData(trans);
        setTotalUsers(trandata.length);

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






  const [filters, setFilters] = useState({
    search: "",
    network_id: "",
    fromDate: "",
    toDate: ""
  });


  const getAllTransaction = async () => { 
    const startTime = Date.now();

    try {
      setLoading(true);
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "" && v !== undefined)
      );
      const res = await axios.get(`${constant.backend_url}/admin/get-all-transactions`,

        {
          
          params: {
            ...cleanFilters,
            page: page,
            limit: 10
          },
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }

      );
      if (res.data?.success) {

        const users = res.data.result || [];
        setTotalUsers(res.data.total);

        // const transres = res.data.result.map((item) => ({
        const transres = users.map((item) => ({
          key: item?._id,
          transactionHash: item?.transactionHash || "-",
          firstname: item?.firstname || "-",
          networkName: item?.networkName || "-",
          // here
          amount: item?.amount
            ? `${Number(item.amount).toFixed(4)} ${item?.tokenSymbol || ""}`
            : "-",
          from: item?.from || "-",
          to: item?.to || "-",
          tokenSymbol: item?.tokenSymbol || "-",
          createdAt: item?.createdAt ? item?.createdAt.split("T")[0] : "",
          updatedAt:item?.updatedAt ? item?.updatedAt.split("T")[0] : "", 
          // status: item?.status          
        }))
        console.log(transres, "dsggffgf");

        setAlltrandata(transres);
        setFilteredTableData(transres);

      }
      // const elapsed = Date.now() - startTime;
      // const remaining = 500 - elapsed;

      // setTimeout(() => {
      //   setLoading(false);
      // }, remaining > 0 ? remaining : 0);
    }

    catch (error) {
      console.error(error);
    }
    finally {
      const elapsed = Date.now() - startTime;
      const remaining = 500 - elapsed;

      setTimeout(() => {
        setLoading(false);
      }, remaining > 0 ? remaining : 0);
    }
  };

  // useEffect(() => {
  //   getAllTransaction();
  // }, [page, filters]);

  useEffect(() => {
    if (!id) {
      getAllTransaction();
    }
  }, [page, filters, id]);

  const updateFilter = (value) => {
    setPage(1);

    setFilters((prev) => ({
      ...prev,
      search: value
    }));
  };

  const updateNetworkFilter = (value) => {
    setFilters((prev) => ({
      ...prev,
      network_id: value
    }));
    setPage(1);
  };

  const filteredData = id ? transactionData : alltrandata;


  const columns = [
    {
      title: "Transaction Hash", dataIndex: "transactionHash",
      render: (trans) => {
        if (!trans) return "-";
        return `${trans.slice(0, 8)}...`;
      }
    },
    { title: "User Name", dataIndex: "firstname" },

    { title: "Network Name", dataIndex: "networkName" },
    { title: "Amount", dataIndex: "amount" },
    {
      title: "From", dataIndex: "from",
      render: (frm) => {
        if (!frm) return "-";
        return `${frm.slice(0, 8)}...`;
      }
    },
    {
      title: "To", dataIndex: "to",
      render: (to) => {
        if (!to) return "-";
        return `${to.slice(0, 8)}...`;
      }
    },
    { title: "Token Symbol", dataIndex: "tokenSymbol" },
    { title: "Created At", dataIndex: "createdAt", key: "createdAt" },
    { title: "Updated At", dataIndex: "createdAt", key: "updatedAt" },
    // { title: "Status", dataIndex: "status" },
  ];

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        updateFilter(value);
      }, 800),
    []
  );

  const getNetwork = async () => {
    try {
      const response = await axios.post(
        `${constant.backend_url}/assets/get-all-networks?page=1&limit=50`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (response.data?.success) {
        const netWorkdata = response.data.result.docs.map((item) => ({
          label: item?.networkName?.toUpperCase(),
          value: item?._id,
        }));

        setNetworkOptions(netWorkdata);
      } else {
        setNetworkOptions([]);
      }
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    getNetwork();
  }, []);
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
        <h2 className="text-2xl font-semibold  white">Transaction History</h2>
      </div>

      {!id && (
        <TableHeader
          data={alltrandata}
          // onFilter={(data) => setFilteredTableData(data)}
          showCreateButton={false}
          showPrivateFilter={false}
          showStatusFilter={false}
          onSearch={(value) => debouncedSearch(value)}
          searchTooltip="Search By Hash, Address, Token Symbol, Amount"
          showNetworkFilter={true}
          showDateFilter={true}
          onDateChange={(dates) => {
            setPage(1);

            setFilters(prev => ({
              ...prev,
              fromDate: dates?.[0] || "",
              toDate: dates?.[1] || ""
            }));
          }}
          onNetworkChange={updateNetworkFilter}
          networkOptions={networkOptions}
        />
      )}

      <ReusableTable
        columns={columns}
        // data={id ? transactionData : filteredTableData}
        data={filteredData}
        rowKey="key"
        pageSize={10}
        total={totalUsers}
        currentPage={page}
        onPageChange={(p) => setPage(p)}
        loading={loading}
        actionType={["viewMore"]}
        onView={(record) => {
          setSelectedTrans(record);
          setModalOpen(true);
        }}
      />

      {/* <ReusableModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        title="Wallet Details"
        description=" "
        fields={TransactionFields}
        initialValues={selectedTrans}
        showFooter={false}
      /> */}

      <ReusableModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        title="Transaction Details"
        showFooter={false}
        description={" "}
        fields={[]}
        extraContent={
          <div className="flex flex-col gap-5">

            {/* Transaction Hash */}
            <div className="flex items-center justify-between bg-[#1f252a] p-3 rounded">
              <span className="text-gray-400">Transaction Hash</span>

              <div className="flex items-center gap-2">
                <span className="text-white">
                  {selectedTrans?.transactionHash}
                </span>

                <CopyOutlined
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    navigator.clipboard.writeText(selectedTrans?.transactionHash);
                    message.success("Copied");
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between bg-[#1f252a] p-3 rounded">
              <span className="text-gray-400">User Name</span>
              <span className="text-white">{selectedTrans?.firstname}</span>
            </div>
            {/* Network */}
            <div className="flex items-center justify-between bg-[#1f252a] p-3 rounded">
              <span className="text-gray-400">Network Name</span>
              <span className="text-white">{selectedTrans?.networkName}</span>
            </div>

            <div className="flex items-center justify-between bg-[#1f252a] p-3 rounded">
              <span className="text-gray-400">Amount</span>
              <span className="text-white">{selectedTrans?.amount}</span>
            </div>

            {/* From */}
            <div className="flex items-center justify-between bg-[#1f252a] p-3 rounded">
              <span className="text-gray-400">From</span>

              <div className="flex items-center gap-2">
                <span className="text-white">{selectedTrans?.from}</span>

                <CopyOutlined
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    navigator.clipboard.writeText(selectedTrans?.from);
                    message.success("Copied");
                  }}
                />
              </div>
            </div>

            {/* To */}
            <div className="flex items-center justify-between bg-[#1f252a] p-3 rounded">
              <span className="text-gray-400">To</span>

              <div className="flex items-center gap-2">
                <span className="text-white">{selectedTrans?.to}</span>

                <CopyOutlined
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    navigator.clipboard.writeText(selectedTrans?.to);
                    message.success("Copied");
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between bg-[#1f252a] p-3 rounded">
              <span className="text-gray-400">Token Symbol</span>
              <span className="text-white">{selectedTrans?.tokenSymbol}</span>
            </div>

          </div>
        }
      />

    </>
  );
};

export default TransectionHistory;
