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

  const [filters, setFilters] = useState({
    search: "",
    status: "",
  });

  useEffect(() => {
    fetchStaffList();
    fetchRoleOptions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, originalData]);

  const fetchStaffList = async () => {
    try {
      setLoading(true);
      const response = await getStaffList();

      if (response?.success && response?.result) {
        const staffData = response.result.map((staff, index) => ({
          key: staff?._id,
          sno: index + 1,
          ...staff,
        }));

        setOriginalData(staffData);
        setData(staffData);
        setFilteredData(staffData);
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
        [item.name, item.username, item.email, item.phone, item.role]
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
      dataIndex: "role",
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
        name: "role",
        label: "Role",
        type: "select",
        options: ROLE_OPTIONS,
        rules: [{ required: true, message: "Role is required" }],
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
          (updateData.role || "") === (selectedStaff.role || "") &&
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
          actionType="update"
          onUpdate={(record) => {
            setEditing(record.key);
            setInitialValues(record);
            setOpen(true);
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
      </div>
    </Spin>
  );
};

export default StaffManagement;