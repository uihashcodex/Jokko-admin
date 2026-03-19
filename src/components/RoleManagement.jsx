import { useState } from "react";
import ReusableTable from "../reuseable/ReusableTable";
import TableHeader from "../reuseable/TableHeader";
import ReusableModal from "../reuseable/ReusableModal";
import PermissionSelector from "./PermissionSelector";
import { Form } from "antd";

const RoleManagement = () => {

  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [viewPermissions, setViewPermissions] = useState([]);
  const [viewOpen, setViewOpen] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [initialValues, setInitialValues] = useState({});
  const roleLabelMap = {
    superadmin: "Super Admin",
    admin: "Admin",
    subadmin: "Sub Admin"
  };

  // Table columns
  const columns = [
    { title: "S.no", dataIndex: "sno" },
    {
      title: "Role Name",
      dataIndex: "name",
      render: (val) => roleLabelMap[val] || val
    },
    //     {
    //   title: "Permissions",
    //   dataIndex: "permissions",
    //       render: (permissions) => {
    //         if (!Array.isArray(permissions)) return null;

    //         return (
    //           <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
    //             {permissions.map((mod) => (
    //               <span
    //                 key={mod}
    //                 style={{
    //                   padding: "4px 10px",
    //                   borderRadius: 20,
    //                   border: "1px solid #ccc",
    //                   fontSize: 12
    //                 }}
    //               >
    //                 {mod}
    //               </span>
    //             ))}
    //           </div>
    //         );
    //       }
    // }
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
                  fontSize: 12
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
                  color: "#1890ff"
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
      }
    }
  ];

  const ROLE_OPTIONS = [
    { label: "Super Admin", value: "superadmin" },
    { label: "Admin", value: "admin" },
    { label: "Sub Admin", value: "subadmin" }
  ];

  
  
  const currentUserRole = "admin";

  const allowedRoles = {
    superadmin: ["admin", "subadmin"],
    admin: ["subadmin"],
    subadmin: []
  };
  // Submit role
  // const handleSubmit = (values) => {
  //   const newRole = {
  //     key: Date.now(),
  //     sno: data.length + 1,
  //     name: values.roleName,
  //     permissions: values.permissions || []    };

  //   setData([...data, newRole]);
  //   setOpen(false);
  // };

  const handleSubmit = (values) => {

    // ❌ duplicate check
    const exists = data.find(
      (item) => item.name === values.roleName && item.key !== editingKey
    );

    if (exists) {
      alert("Role already exists!");
      return;
    }

    if (editingKey) {
      // ✏️ update
      const updated = data.map((item) =>
        item.key === editingKey
          ? { ...item, name: values.roleName, permissions: values.permissions || [] }
          : item
      );

      setData(updated);
      setEditingKey(null);
    } else {
      // ➕ create
      const newRole = {
        key: Date.now(),
        sno: data.length + 1,
        name: values.roleName,
        permissions: values.permissions || []
      };

      setData([...data, newRole]);
    }

    setOpen(false);
  };

  

  return (
    <div>
      <TableHeader
        data={data}
        showCreateButton={true}
        onCreate={() => {
          setEditingKey(null);
          setInitialValues({});
          setOpen(true);

          
        }}      />

      <ReusableTable
        columns={columns}
        data={data}
        actionType={["update"]}
        onUpdate={(record) => {
          setEditingKey(record.key);
          setInitialValues({
            roleName: record.name,
            permissions: record.permissions
          });
          setOpen(true);
        }}
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
        
        fields={[
          {
            name: "roleName",
            label: "Role Name",
            type: "select",   
            placeholder: "Select role",
            options: ROLE_OPTIONS,
            rules: [{ required: true }]
          }
        ]}
        PermissionsContent={
          <Form.Item name="permissions" initialValue={[]}>
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
                  border: "1px solid #ccc"
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