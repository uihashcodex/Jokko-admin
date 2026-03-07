import { useParams } from "react-router-dom";
import ReusableTable from "../reuseable/ReusableTable";
import { useLocation } from "react-router-dom";
import { LeftCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { constant } from "../const";
import TableHeader from "../reuseable/TableHeader";
import ReusableModal from "../reuseable/ReusableModal";
import debounce from "lodash.debounce";
import { useMemo } from "react";
import { message } from "antd";

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

  const TransactionFields = [
    {
      name: "transactionHash", label: "Transaction", type: "copy",
    },
    {
      name: "networkId", label: "Network ID", type: "copy",

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
        transactionHash: item?.transactionHash,
        networkId: item?.network_id?.networkName,
        amount: item?.amount,
        from: item?.from,
        to: item?.to,
        tokenSymbol: item?.tokenSymbol,
        status: item?.status,
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
    search: ""
  });


  const getAllTransaction = async () => {
    try {

      
      const res = await axios.get(`${constant.backend_url}/admin/get-all-transactions`,

        {
          params: {
            search: filters.search,
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
          transactionHash: item?.transactionHash,
          networkId: item?.network_id,
          amount: item?.amount,
          from: item?.from,
          to: item?.to,
          tokenSymbol: item?.tokenSymbol,
          // status: item?.status          
        }))
        console.log(transres,"dsggffgf");

        setAlltrandata(transres);
        setFilteredTableData(transres);

      }
    } catch (error) {
      console.error(error);
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
    setFilters({ search: value });
    setPage(1);
  };

  const filteredData = id ? transactionData : alltrandata;


  const columns = [
    { title: "Transaction", dataIndex: "transactionHash" ,
      render: (trans) => {
        if (!trans) return "-";
        return `${trans.slice(0, 8)}...`;
      }
    },
    { title: "Network ID", dataIndex: "networkId" },
    { title: "Amount", dataIndex: "amount" },
    { title: "From", dataIndex: "from",
      render: (frm) => {
        if (!frm) return "-";
        return `${frm.slice(0, 8)}...`;
      }
     },
    { title: "To", dataIndex: "to",
      render: (to) => {
        if (!to) return "-";
        return `${to.slice(0, 8)}...`;
      }
     },
    { title: "Token Symbol", dataIndex: "tokenSymbol" },
    { title: "Status", dataIndex: "status" },
  ];

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        updateFilter(value);
      }, 800),
    []
  );

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

      {!id && (
        <TableHeader
          data={alltrandata}
          // onFilter={(data) => setFilteredTableData(data)}
          showCreateButton={false}
          showPrivateFilter={false}
          showStatusFilter={false}
          onSearch={(value) => debouncedSearch(value)}
          />
      )}
      
      <ReusableTable
        columns={columns}
          data={id ? transactionData : filteredTableData}
        rowKey="key"
        pageSize={10}
        total={totalUsers}
        currentPage={page}
        onPageChange={(p) => setPage(p)}    

        actionType={["viewMore"]}
        onView={(record) => {
          setSelectedTrans(record);
          setModalOpen(true);
        }}
      />

      <ReusableModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        title="Wallet Details"
        description=" "
        fields={TransactionFields}
        initialValues={selectedTrans}
        showFooter={false}
      />
     
    </>
  );
};

export default TransectionHistory;
