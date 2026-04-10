import { useState, useEffect, useMemo } from "react";
import ReusableTable from "../reuseable/ReusableTable";
import TableHeader from "../reuseable/TableHeader";
import ReusableModal from "../reuseable/ReusableModal";
import PermissionSelector from "./PermissionSelector";
import { Form, message } from "antd";
import { constant } from "../const";
import axios from "axios";
import debounce from "lodash.debounce";

const RoleManagement = () => {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [viewPermissions, setViewPermissions] = useState([]);
  const [viewOpen, setViewOpen] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [initialValues, setInitialValues] = useState({});
  const [loading, setLoading] = useState(false);

  const roleLabelMap = {
    superadmin: "Super Admin",
    admin: "Admin",
    subadmin: "Sub Admin",
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async (search = "") => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${constant.backend_url}/management/roles/list`,
        {
          params: { search },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Roles response:", response.data);

      let rolesArray = [];

      if (Array.isArray(response.data)) {
        rolesArray = response.data;
      } else if (response.data && Array.isArray(response.data.result)) {
        rolesArray = response.data.result;
      } else if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        rolesArray = response.data.data;
      } else if (
        response.data &&
        response.data.roles &&
        Array.isArray(response.data.roles)
      ) {
        rolesArray = response.data.roles;
      }

      const formattedData = rolesArray.map((role, index) => ({
        key: role._id || role.id,
        roleId: role._id || role.id,
        sno: index + 1,
        name: role.role_name || role.name || "",
        permissions: Array.isArray(role.permissions) ? role.permissions : [],
      }));

      setData(formattedData);
    } catch (error) {
      console.error("Error fetching roles:", error);
      setData([]);
      message.error(error?.response?.data?.message || "Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        fetchRoles(value);
      }, 600),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const columns = [
    { title: "S.no", dataIndex: "sno" },
    {
      title: "Role Name",
      dataIndex: "name",
      render: (val) => roleLabelMap[val] || val,
    },
    {
      title: "Permissions",
      dataIndex: "permissions",
      render: (permissions) => {
        if (!Array.isArray(permissions)) return null;

        const visible = permissions.slice(0, 5);
        const remaining = permissions.length - 5;

        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {visible.map((mod) => (
              <span
                key={mod}
                style={{
                  padding: "4px 10px",
                  borderRadius: 20,
                  border: "1px solid #ccc",
                  fontSize: 12,
                }}
              >
                {mod}
              </span>
            ))}

            {remaining > 0 && (
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: 20,
                  border: "1px solid #ccc",
                  fontSize: 12,
                  cursor: "pointer",
                  color: "#1890ff",
                }}
                onClick={() => {
                  setViewPermissions(permissions);
                  setViewOpen(true);
                }}
              >
                +{remaining} more...
              </span>
            )}
          </div>
        );
      },
    },
  ];

  const handleSubmit = async (values) => {
    try {
      const trimmedRoleName = values?.roleName?.trim();
      const newPermissions = Array.isArray(values?.permissions)
        ? values.permissions
        : [];

      const exists = data.find(
        (item) =>
          item.name?.toLowerCase() === trimmedRoleName?.toLowerCase() &&
          item.key !== editingKey
      );

      if (exists) {
        message.error("Role already exists!");
        return;
      }

      if (editingKey) {
        const selectedRole = data.find(
          (item) => (item.roleId || item.key) === editingKey
        );

        if (!selectedRole) {
          message.error("Role not found");
          return;
        }

        const oldRoleName = selectedRole.name?.trim() || "";
        const oldPermissions = Array.isArray(selectedRole.permissions)
          ? [...selectedRole.permissions].sort()
          : [];

        const sortedNewPermissions = [...newPermissions].sort();

        const isSame =
          oldRoleName.toLowerCase() === trimmedRoleName.toLowerCase() &&
          JSON.stringify(oldPermissions) === JSON.stringify(sortedNewPermissions);

        if (isSame) {
          message.error("No changes detected");
          return;
        }
      }

      setLoading(true);

      const payload = {
        role_name: trimmedRoleName,
        permissions: newPermissions,
      };

      const url = editingKey
        ? `${constant.backend_url}/management/roles/update`
        : `${constant.backend_url}/management/roles/create`;

      if (editingKey) {
        payload.roleId = editingKey;
      }

      const response = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Role saved:", response.data);

      if (response.data?.success) {
        message.success(
          editingKey
            ? "Role updated successfully"
            : "Role created successfully"
        );
        setOpen(false);
        setEditingKey(null);
        setInitialValues({});
        fetchRoles();
      } else {
        message.error(response.data?.message || "Operation failed");
      }
    } catch (error) {
      console.error(
        "Error creating/updating role:",
        error.response?.data || error.message
      );
      message.error(
        error?.response?.data?.message ||
          "Failed to create/update role. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <TableHeader
        data={data}
        showCreateButton={true}
        showStatusFilter={false}
        onSearch={(value) => debouncedSearch(value)}
         searchTooltip="Search by Role Name"
        onCreate={() => {
          setEditingKey(null);
          setInitialValues({});
          setOpen(true);
        }}
      />

      <ReusableTable
        columns={columns}
        data={data}
        actionType={["update"]}
        onUpdate={(record) => {
          setEditingKey(record.roleId || record.key);
          setInitialValues({
            roleName: record.name,
            permissions: record.permissions,
          });
          setOpen(true);
        }}
        loading={loading}
      />

      <ReusableModal
        open={open}
        onCancel={() => {
          setOpen(false);
          setEditingKey(null);
        }}
        onSubmit={handleSubmit}
        title={editingKey ? "Update Role" : "Create Role"}
        initialValues={initialValues}
        loading={loading}
        fields={[
          {
            name: "roleName",
            label: "Role Name",
            type: "text",
            placeholder: "Enter role name",
            rules: [{ required: true, message: "Role Name is required" }],
          },
        ]}
        PermissionsContent={
          <Form.Item
            name="permissions"
            initialValue={[]}
            rules={[
              {
                validator: (_, value) =>
                  Array.isArray(value) && value.length > 0
                    ? Promise.resolve()
                    : Promise.reject(new Error("Select at least one permission")),
              },
            ]}
          >
            <PermissionSelector />
          </Form.Item>
        }
      />

      <ReusableModal
        open={viewOpen}
        onCancel={() => setViewOpen(false)}
        title="All Permissions"
        showFooter={false}
        description={" "}
        fields={[]}
        extraContent={
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {viewPermissions.map((mod) => (
              <span
                key={mod}
                style={{
                  padding: "6px 12px",
                  borderRadius: 20,
                  border: "1px solid #ccc",
                }}
              >
                {mod}
              </span>
            ))}
          </div>
        }
      />
    </div>
  );
};

export default RoleManagement;