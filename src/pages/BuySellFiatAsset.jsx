import { useEffect, useMemo, useState } from "react";
import ReusableTable from "../reuseable/ReusableTable";
import TableHeader from "../reuseable/TableHeader";
import { message } from "antd";
import axios from "axios";
import debounce from "lodash.debounce";
import { constant } from "../const";
import ReusableModal from "../reuseable/ReusableModal";



const PAGE_SIZE = 10;

const columns = [
  { title: "S.no", dataIndex: "sno", key: "sno" },
  { title: "Token Name", dataIndex: "tokenName", key: "tokenName" },
  { title: "Token Symbol", dataIndex: "tokenSymbol", key: "tokenSymbol" },
  { title: "Code", dataIndex: "code", key: "code" },
  { title: "Status", dataIndex: "verifyStatus", key: "verifyStatus" },
];

const BuySellFiatAsset = () => {
  const [originalData, setOriginalData] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();


      const [deletemodal, setDeletemodal] = useState(false);
    const [deleteRecord, setDeleteRecord] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    type: "",
    status: "", // ✅ changed from verifyStatus to status
  });

  const typeOptions = useMemo(
    () => [
      { label: "Buy", value: "Buy" },
      { label: "Sell", value: "Sell" },
    ],
    []
  );

  const updateFilter = (key, value) => {
    setPage(1);
    setFilters((prev) => ({
      ...prev,
      [key]: value || "",
    }));

  };

  const getBuySellFiatAssets = async () => {
    const startTime = Date.now();

    try {
      setLoading(true);

      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "")
      );

      const response = await axios.post(
        `${constant.backend_url}/admin/buysell-fiatAsset`,
        {
          ...cleanFilters,
          page,
          limit: PAGE_SIZE,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
          validateStatus: () => true,
        }
      );

      if (response.data?.success) {
        const docs = Array.isArray(response.data?.result)
          ? response.data.result
          : response.data?.result?.docs || [];

        const totalCount =
          response.data?.total ||
          response.data?.result?.totalDocs ||
          response.data?.result?.total ||
          docs.length;

        const formattedData = docs.map((item, index) => ({
          id: item?._id || item?.id || index,
          sno: (page - 1) * PAGE_SIZE + index + 1,
          tokenName:
            item?.tokenName ||
            item?.name ||
            item?.fiatName ||
            item?.currencyName ||
            "-",
          tokenSymbol:
            item?.tokenSymbol ||
            item?.symbol ||
            item?.fiatSymbol ||
            item?.currencySymbol ||
            "-",
          code: item?.code || item?.currencyCode || item?.fiatCode || "-",
          type: item?.type || "-",
          verifyStatus:
            typeof item?.verifyStatus === "boolean"
              ? item.verifyStatus
                ? "active"
                : "inactive"
              : item?.verifyStatus || item?.status || "-",
        }));

        setOriginalData(formattedData);
        setTotal(totalCount);
      } else {
        setOriginalData([]);
        setTotal(0);
        messageApi.error(response.data?.message || "Failed to fetch fiat assets");
      }
    } catch (error) {
      console.log("getBuySellFiatAssets error:", error);
      setOriginalData([]);
      setTotal(0);
      messageApi.error(
        error?.response?.data?.message || "Something went wrong"
      );
    } finally {
      const elapsed = Date.now() - startTime;
      const minTime = 500;

      setTimeout(() => {
        setLoading(false);
      }, Math.max(minTime - elapsed, 0));
    }
  };

  useEffect(() => {
    getBuySellFiatAssets();
  }, [page, filters]);

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        updateFilter("search", value);
      }, 800),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleStatusChange = async (record, newStatus) => {
    try {
      setLoading(true);

      const response = await axios.post(
        `${constant.backend_url}/admin/buysell-updatefiatAsset`,
        {
          token_id: record.id,
          verifyStatus: newStatus === "active" ,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
          validateStatus: () => true,
        }
      );

      if (response.data?.success) {
        setOriginalData((prev) =>
          prev.map((item) =>
            item.id === record.id
              ? { ...item, verifyStatus: newStatus }
              : item
          )
        );

        messageApi.success(`${record.tokenName} changed to ${newStatus}`);
      } else {
        messageApi.error(response.data?.message || "Failed to update status");
      }
    } catch (error) {
      console.log("status update error:", error);
      messageApi.error(
        error?.response?.data?.message || "Failed to update status"
      );
    } finally {
      setLoading(false);
    }
  };




        const handleDelete = async (userId) => {
        try {
            setLoading(true);

            const res = await axios.post(
                `${constant.backend_url}/admin/delete-fiatAsset`,
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
                getBuySellFiatAssets();
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
          onSearch={(value) => debouncedSearch(value)}
onVerifyChange={(value) =>
  updateFilter(
    "status",
    value === "active"
      ? "true"
      : value === "inactive"
      ? "false"
      : ""
  )
}          onTypeChange={(value) => updateFilter("type", value)}
          onNetworkChange={(value) => updateFilter("type", value)}
          searchTooltip="Search by Token Name"
          placeHolder="Search by token name"
        />

        <ReusableTable
          columns={columns}
          data={originalData}
          pageSize={PAGE_SIZE}
          total={total}
          currentPage={page}
          onPageChange={(currentPage) => setPage(currentPage)}
          loading={loading}
          actionType={["status","Remove"]}
          onStatusChange={handleStatusChange}
            onDelete={(record) => {
        setDeleteRecord(record);
        setDeletemodal(true);
    }}
        />


                    <ReusableModal
  open={deletemodal}
  onCancel={() => setDeletemodal(false)}
  title="Delete Fiat Asset?"
  description={"Are you sure you want to delete this Fiat Asset?"}
  showFooter={false}
  extraContent={
    <div className="text-center">

      <p className="text-gray-300 text-base">
        Are you sure you want to delete this Fiat Asset?
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
onClick={() => handleDelete(deleteRecord?.id)}        >
          Yes
        </button>

      </div>

    </div>
  }
/>
      </>
    </div>
  );
};

export default BuySellFiatAsset;