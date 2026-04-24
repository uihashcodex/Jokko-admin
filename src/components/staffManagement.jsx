import { useState, useEffect, useMemo } from "react";
import ReusableTable from "../reuseable/ReusableTable";
import TableHeader from "../reuseable/TableHeader";
import ReusableModal from "../reuseable/ReusableModal";
import { message, Spin, Tag } from "antd";
import debounce from "lodash.debounce";
import axios from "axios";
import { constant } from "../const";

import {
  getStaffList,
  createStaff,
  updateStaff,
} from "../services/staffService";

const StaffManagement = () => {
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [initialValues, setInitialValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [roleOptions, setRoleOptions] = useState([]);
    const [deletemodal, setDeletemodal] = useState(false);
    const [deleteRecord, setDeleteRecord] = useState(null);

  const [page, setPage] = useState(1);
const [total, setTotal] = useState(0);
const PAGE_SIZE = 10;

  const [filters, setFilters] = useState({
    search: "",
    status: "",
  });

  useEffect(() => {
    fetchStaffList();
    fetchRoleOptions();
  }, [page, filters]);

  useEffect(() => {
    applyFilters();
  }, [filters, originalData]);

  const fetchStaffList = async () => {
    try {
      setLoading(true);
const response = await getStaffList({
  page,
  limit: PAGE_SIZE,
  search: filters.search,
  status: filters.status,
});
      if (response?.success && response?.result) {
        const staffData = response.result.map((staff, index) => ({
          key: staff?._id,
sno: (page - 1) * PAGE_SIZE + index + 1,          ...staff,
        }));

        setOriginalData(staffData);
        setData(staffData);
        setFilteredData(staffData);
        setTotal(response.total || 0);
      } else {
        message.error(response?.message || "Failed to fetch staff list");
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
      message.error(error?.message || "Failed to fetch staff list");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoleOptions = async () => {
    try {
      const response = await axios.get(
        `${constant.backend_url}/management/roles/list`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      const roles =
        response?.data?.result && Array.isArray(response.data.result)
          ? response.data.result
          : [];

      setRoleOptions(
        roles.map((role) => ({
          label: role.role_name || role.name,
          value: role.role_name || role.name,
        }))
      );
    } catch (error) {
      console.error("Error fetching role options:", error);
    }
  };

  const applyFilters = () => {
    let temp = [...originalData];

    if (filters.search?.trim()) {
      const searchText = filters.search.toLowerCase();

      temp = temp.filter((item) =>
        [item.name, item.username, item.email, item.phone, item.roleType]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(searchText))
      );
    }

    if (filters.status) {
      temp = temp.filter(
        (item) => item.status?.toLowerCase() === filters.status.toLowerCase()
      );
    }

    setFilteredData(temp);
    setData(temp);
  };

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || "",
    }));
  };

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        updateFilter("search", value);
      }, 500),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const ROLE_OPTIONS = roleOptions.length
    ? roleOptions
    : [
        { label: "Super Admin", value: "superadmin" },
        { label: "Admin", value: "admin" },
        { label: "Sub Admin", value: "subadmin" },
      ];

  const columns = [
    { title: "S.no", dataIndex: "sno" },
    { title: "Name", dataIndex: "name" },
    { title: "Username", dataIndex: "username" },
    { title: "Email", dataIndex: "email" },
    { title: "Phone", dataIndex: "phone" },
    {
      title: "Role",
      dataIndex: "roleType",
      render: (val) => val || "-",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (val) => {
        const status = val?.toLowerCase();
        const isActive = status === "active";
        return <Tag color={isActive ? "green" : "red"}>{val || "-"}</Tag>;
      },
    },
  ];

  const getFields = () => {
    const commonFields = [
      {
        name: "name",
        label: "Name",
        type: "text",
        rules: [{ required: true, message: "Name is required" }],
      },
      {
        name: "username",
        label: "Username",
        type: "text",
        rules: [{ required: true, message: "Username is required" }],
      },
      {
        name: "email",
        label: "Email",
        type: "text",
        rules: [{ required: true, message: "Email is required" }],
      },
      {
        name: "phone",
        label: "Phone",
        type: "text",
      },
    {
  name: "roleType",
  label: "Role Type",
  type: "select",
  options: ROLE_OPTIONS,
  rules: [{ required: true, message: "Role Type is required" }],
},
    ];

    if (!editing) {
      return [
        ...commonFields,
        {
          name: "password",
          label: "Password",
          type: "password",
          rules: [{ required: true, message: "Password is required" }],
        },
      ];
    }

    return [
      ...commonFields,
      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
        ],
        rules: [{ required: true, message: "Status is required" }],
      },
    ];
  };




      const handleDelete = async (userId) => {
        try {
            setLoading(true);

            const res = await axios.post(
                `${constant.backend_url}/admin/delete-staffs`,
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
                message.success("Staff Deleted successfully");
                setDeletemodal(false);
                fetchStaffList();
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


  const handleSubmit = async (values) => {
    const { password, resetPassword, ...rest } = values;

    try {
      setSubmitting(true);

      if (editing) {
        const staffId = editing;
        const selectedStaff = originalData.find((item) => item.key === staffId);

        if (!selectedStaff) {
          message.error("Staff not found");
          return;
        }

        const updateData = { ...rest };

        if (resetPassword) {
          updateData.password = resetPassword;
        }

        const isSame =
          (updateData.name || "") === (selectedStaff.name || "") &&
          (updateData.username || "") === (selectedStaff.username || "") &&
          (updateData.email || "") === (selectedStaff.email || "") &&
          (updateData.phone || "") === (selectedStaff.phone || "") &&
          (updateData.role || "") === (selectedStaff.roleType || "") &&
          (updateData.status || "") === (selectedStaff.status || "") &&
          !resetPassword;

        if (isSame) {
          message.error("No changes detected");
          return;
        }

        const response = await updateStaff(staffId, updateData);

        if (response?.success) {
          message.success(response?.message || "Staff updated successfully");
          await fetchStaffList();
          setEditing(null);
          setOpen(false);
        } else {
          message.error(response?.message || "Failed to update staff");
        }
      } else {
        const createData = {
          ...rest,
          password,
          role: "sub_admin",
        };

        const response = await createStaff(createData);

        if (response?.success) {
          message.success(response?.message || "Staff created successfully");
          await fetchStaffList();
          setOpen(false);
        } else {
          message.error(response?.message || "Failed to create staff");
        }
      }
    } catch (error) {
      console.error("Error submitting staff form:", error);
      message.error(
        error?.response?.data?.message ||
          error?.message ||
          "An error occurred while processing your request"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <div>
        <TableHeader
          data={originalData}
          onFilter={setFilteredData}
          showCreateButton={true}
          onCreate={() => {
            setEditing(null);
            setInitialValues({});
            setOpen(true);
          }}
          onSearch={(value) => debouncedSearch(value)}
          onVerifyChange={(value) => updateFilter("status", value)}
          showStatusFilter={true}
          searchTooltip="Search by Name, Username, Email, Phone, or Role"
        />

   <ReusableTable
  columns={columns}
  data={filteredData}
  rowKey="key"
  pageSize={PAGE_SIZE}
  total={total}
  currentPage={page}
  onPageChange={(p) => setPage(p)}
  loading={loading}
  actionType={["update","Remove"]}
  onUpdate={(record) => {
    setEditing(record.key);
    setInitialValues(record);
    setOpen(true);

    
  }}

      onDelete={(record) => {
        setDeleteRecord(record);
        setDeletemodal(true);
    }}
/>

        <ReusableModal
          open={open}
          onCancel={() => {
            setOpen(false);
            setEditing(null);
          }}
          onSubmit={handleSubmit}
          title={editing ? "Update Staff" : "Create Staff"}
          initialValues={initialValues}
          fields={getFields()}
          loading={submitting}
        />



            <ReusableModal
  open={deletemodal}
  onCancel={() => setDeletemodal(false)}
  title="Delete Staff"
  description={"Are you sure you want to delete this Staff?"}
  showFooter={false}
  extraContent={
    <div className="text-center">

      <p className="text-gray-300 text-base">
        Are you sure you want to delete this Staff?
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
      </div>
    </Spin>
  );
};

export default StaffManagement;