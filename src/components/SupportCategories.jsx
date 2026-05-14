import { useCallback, useEffect, useMemo, useState } from "react";
import { message } from "antd";
import ReusableTable from "../reuseable/ReusableTable";
import TableHeader from "../reuseable/TableHeader";
import ReusableModal from "../reuseable/ReusableModal";
import {
  createSupportCategory,
  deleteSupportCategory,
  getAdminSupportCategories,
  updateSupportCategory,
} from "../services/supportService";

const columns = [
  { title: "S.no", dataIndex: "sno", key: "sno" },
  { title: "Category", dataIndex: "category", key: "category" },
  { title: "Value", dataIndex: "value", key: "value" },
  { title: "Status", dataIndex: "verifyStatus", key: "verifyStatus" },
];

const PAGE_SIZE = 10;

const parseDate = (value) => {
  if (!value || value === "-") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const startOfDay = (value) => {
  const date = parseDate(value);
  if (!date) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

const endOfDay = (value) => {
  const date = parseDate(value);
  if (!date) return null;
  date.setHours(23, 59, 59, 999);
  return date;
};

const SupportCategories = () => {
  const [allData, setAllData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    verifyStatus: "",
    fromDate: "",
    toDate: "",
  });
  const [messageApi, contextHolder] = message.useMessage();

  const fields = [
    {
      name: "category",
      label: "Category",
      type: "text",
      placeholder: "Enter support category",
      span: 24,
      rules: [{ required: true, message: "Please enter category" }],
    },
    {
      name: "isActive",
      label: "Active",
      type: "switch",
      span: 24,
    },
  ];

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAdminSupportCategories();
      if (response?.success) {
        const formatted = (response.result || []).map((item) => ({
          id: item._id || item.id,
          category: item.categories || item.category || "-",
          value: item.value || "-",
          isActive: Boolean(item.isActive),
          verifyStatus: item.isActive ? "active" : "inactive",
          createdAt: item.createdAt,
        }));
        setAllData(formatted);
      } else {
        messageApi.error(response?.message || "Failed to fetch categories");
      }
    } finally {
      setLoading(false);
    }
  }, [messageApi]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filteredData = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return allData.filter((item) => {
      const matchesSearch =
        !search ||
        item.category.toLowerCase().includes(search) ||
        item.value.toLowerCase().includes(search);
      const matchesStatus = !filters.verifyStatus || item.verifyStatus === filters.verifyStatus;

      const itemDate = startOfDay(item.createdAt);
      const fromDate = startOfDay(filters.fromDate);
      const toDate = endOfDay(filters.toDate);
      const matchesDate =
        (!fromDate && !toDate) ||
        (itemDate && (!fromDate || itemDate >= fromDate) && (!toDate || itemDate <= toDate));

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [allData, filters]);

  useEffect(() => {
    const paginated = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    setTotal(filteredData.length);
    setTableData(paginated.map((item, index) => ({ ...item, sno: (page - 1) * PAGE_SIZE + index + 1 })));
  }, [filteredData, page]);

  const openCreate = () => {
    setSelectedRecord(null);
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setSelectedRecord(record);
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    const payload = {
      category: values.category,
      isActive: Boolean(values.isActive),
    };
    const response = selectedRecord
      ? await updateSupportCategory({ categoryId: selectedRecord.id, ...payload })
      : await createSupportCategory(payload);

    if (response?.success) {
      messageApi.success(response.message || "Category saved");
      setModalOpen(false);
      fetchCategories();
    } else {
      messageApi.error(response?.message || "Failed to save category");
    }
  };

  // const handleStatusChange = async (record, nextStatus) => {
  //   const response = await updateSupportCategory({
  //     categoryId: record.id,
  //     isActive: nextStatus === "active",
  //   });

  //   if (response?.success) {
  //     messageApi.success(response.message || "Status updated");
  //     fetchCategories();
  //   } else {
  //     messageApi.error(response?.message || "Failed to update status");
  //   }
  // };

  const confirmDelete = async () => {
    if (!selectedRecord?.id) return;
    const response = await deleteSupportCategory(selectedRecord.id);
    if (response?.success) {
      messageApi.success(response.message || "Category deleted");
      setDeleteOpen(false);
      setSelectedRecord(null);
      fetchCategories();
    } else {
      messageApi.error(response?.message || "Failed to delete category");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", flexDirection: "column", width: "100%" }}>
      {contextHolder}

      <div className="mb-5 w-full rounded-lg bg-cover bg-center flex items-center header-content-img">
        <div className="display-3 w-full">
          <h1 className="text-white p-7 font-bold text-2xl">Support Categories</h1>
        </div>
      </div>

      <TableHeader
        data={allData}
        showCreateButton
        
        showSearch
        showExportButton
        exportFilename="support_categories"
        exportColumns={columns}
        getExportData={() => filteredData.map((item, index) => ({ ...item, sno: index + 1 }))}
        onCreate={openCreate}
        onSearch={(value) => {
          setFilters((prev) => ({ ...prev, search: value || "" }));
          setPage(1);
        }}
        onVerifyChange={(value) => {
          setFilters((prev) => ({ ...prev, verifyStatus: value || "" }));
          setPage(1);
        }}
        onDateChange={(dates) => {
          setFilters((prev) => ({
            ...prev,
            fromDate: dates?.[0] || "",
            toDate: dates?.[1] || "",
          }));
          setPage(1);
        }}
        searchTooltip="Search by category"
        placeHolder="Search by category"
      />

      <ReusableModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        title={selectedRecord ? "Edit Support Category" : "Create Support Category"}
        description="Manage the categories users can select while creating support tickets."
        fields={fields}
        initialValues={{
          category: selectedRecord?.category || "",
          isActive: selectedRecord ? selectedRecord.isActive : true,
        }}
      />

      <ReusableModal
        open={deleteOpen}
        onCancel={() => setDeleteOpen(false)}
        title="Delete Support Category"
        description="This category will no longer be available for support tickets."
        showFooter={false}
        extraContent={
          <div className="text-center">
            <p className="text-gray-300 text-base">
              Are you sure you want to delete {selectedRecord?.category || "this category"}?
            </p>
            <div className="flex justify-between gap-4 mt-6">
              <button className="px-6 py-2 rounded primaty-bg text-black" onClick={() => setDeleteOpen(false)}>
                No
              </button>
              <button className="px-6 py-2 rounded bg-red-600 text-white" onClick={confirmDelete}>
                Yes
              </button>
            </div>
          </div>
        }
      />

      <ReusableTable
        columns={columns}
        data={tableData}
        pageSize={PAGE_SIZE}
        total={total}
        currentPage={page}
        onPageChange={(p) => setPage(p)}
        loading={loading}
        actionType={["edit", "Remove"]}
        // onStatusChange={handleStatusChange}
        onEdit={openEdit}
        onDelete={(record) => {
          setSelectedRecord(record);
          setDeleteOpen(true);
        }}
      />
    </div>
  );
};

export default SupportCategories;
