import { useEffect, useMemo, useState } from "react";
import ReusableTable from "../reuseable/ReusableTable";
import TableHeader from "../reuseable/TableHeader";
import {  message } from 'antd';

const DUMMY_FIAT_ASSETS = [
  {
    id: 1,
    tokenName: "Albania Lek",
    tokenSymbol: "Lek",
    code: "ALL",
    type: "Buy",
    verifyStatus: "active",
  },
  {
    id: 2,
    tokenName: "US Dollar",
    tokenSymbol: "USD",
    code: "USD",
    type: "Sell",
    verifyStatus: "inactive",
  },
  {
    id: 3,
    tokenName: "Euro",
    tokenSymbol: "EUR",
    code: "EUR",
    type: "Buy",
    verifyStatus: "active",
  },
  {
    id: 4,
    tokenName: "British Pound",
    tokenSymbol: "GBP",
    code: "GBP",
    type: "Sell",
    verifyStatus: "active",
  },
  {
    id: 5,
    tokenName: "Indian Rupee",
    tokenSymbol: "INR",
    code: "INR",
    type: "Buy",
    verifyStatus: "inactive",
  },
  {
    id: 6,
    tokenName: "Canadian Dollar",
    tokenSymbol: "CAD",
    code: "CAD",
    type: "Sell",
    verifyStatus: "active",
  },
  {
    id: 7,
    tokenName: "Australian Dollar",
    tokenSymbol: "AUD",
    code: "AUD",
    type: "Buy",
    verifyStatus: "active",
  },
  {
    id: 8,
    tokenName: "Swiss Franc",
    tokenSymbol: "CHF",
    code: "CHF",
    type: "Sell",
    verifyStatus: "inactive",
  },
  {
    id: 9,
    tokenName: "Japanese Yen",
    tokenSymbol: "JPY",
    code: "JPY",
    type: "Buy",
    verifyStatus: "active",
  },
  {
    id: 10,
    tokenName: "Singapore Dollar",
    tokenSymbol: "SGD",
    code: "SGD",
    type: "Sell",
    verifyStatus: "active",
  },
  {
    id: 11,
    tokenName: "UAE Dirham",
    tokenSymbol: "AED",
    code: "AED",
    type: "Buy",
    verifyStatus: "inactive",
  },
  {
    id: 12,
    tokenName: "Saudi Riyal",
    tokenSymbol: "SAR",
    code: "SAR",
    type: "Sell",
    verifyStatus: "active",
  },
];

const columns = [
  { title: "S.no", dataIndex: "sno", key: "sno" },
  { title: "Token Name", dataIndex: "tokenName", key: "tokenName" },
  { title: "Token Symbol", dataIndex: "tokenSymbol", key: "tokenSymbol" },
  { title: "Code", dataIndex: "code", key: "code" },
  { title: "Type", dataIndex: "type", key: "type" },
  { title: "Status", dataIndex: "verifyStatus", key: "verifyStatus" },
];

const PAGE_SIZE = 10;

const BuySellFiatAsset = () => {
  const [originalData, setOriginalData] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const [filters, setFilters] = useState({
    search: "",
    type: "",
    verifyStatus: "",
  });

  const typeOptions = useMemo(
    () => [
      { label: "Buy", value: "Buy" },
      { label: "Sell", value: "Sell" },
    ],
    []
  );

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || "",
    }));
    setPage(1);
  };

  useEffect(() => {
    const delay = 500 + Math.floor(Math.random() * 301);

    setLoading(true);

    const timer = setTimeout(() => {
      const searchValue = filters.search.trim().toLowerCase();

      const filteredData = DUMMY_FIAT_ASSETS.filter((item) => {
        const matchesSearch =
          !searchValue ||
          item.tokenName.toLowerCase().includes(searchValue) ||
          item.tokenSymbol.toLowerCase().includes(searchValue) ||
          item.code.toLowerCase().includes(searchValue);

        const matchesStatus =
          !filters.verifyStatus || item.verifyStatus === filters.verifyStatus;

        const matchesType = !filters.type || item.type === filters.type;

        return matchesSearch && matchesStatus && matchesType;
      });

      const paginatedData = filteredData.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
      );

      setTotal(filteredData.length);
      setOriginalData(
        paginatedData.map((item, index) => ({
          ...item,
          sno: (page - 1) * PAGE_SIZE + index + 1,
        }))
      );
      setLoading(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [page, filters]);

  const handleStatusChange = (record, newStatus) => {
    message.success(
      `${record.tokenName} changed to ${newStatus}`
    );

    // UI update (dummy)
    setOriginalData((prev) =>
      prev.map((item) =>
        item.id === record.id
          ? { ...item, verifyStatus: newStatus }
          : item
      )
    );
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        width: "100%",
      }}
    >
      <>
        {contextHolder}

        <div className="mb-5 w-full rounded-lg bg-cover bg-center flex items-center header-content-img">
          <div className="display-3 w-full">
            <h1 className="text-white p-7 font-bold text-2xl">
              Buy/Sell Fiat Asset
            </h1>
          </div>
        </div>

        <TableHeader
          data={originalData}
          showCreateButton={false}
          showStatusFilter={true}
          showSearch={true}
          networkOptions={typeOptions}
          onSearch={(value) => updateFilter("search", value)}
          onVerifyChange={(value) => updateFilter("verifyStatus", value)}
          onTypeChange={(value) => updateFilter("type", value)}
          onNetworkChange={(value) => updateFilter("type", value)}
          searchTooltip="Search by Token Name, Token Symbol, Code"
          placeHolder="Search by token name, symbol or code"
        />

        <ReusableTable
          columns={columns}
          data={originalData}
          pageSize={PAGE_SIZE}
          total={total}
          currentPage={page}
          onPageChange={(currentPage) => setPage(currentPage)}
          loading={loading}
          actionType={["status"]}
          onStatusChange={handleStatusChange}

        />
      </>
    </div>
  );
};

export default BuySellFiatAsset;
