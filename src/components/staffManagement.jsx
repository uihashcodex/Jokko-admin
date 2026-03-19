import { useState } from "react";
import ReusableTable from "../reuseable/ReusableTable";
import TableHeader from "../reuseable/TableHeader";
import ReusableModal from "../reuseable/ReusableModal";
import { Tag } from "antd";

const StaffManagement = () => {

    const [data, setData] = useState([]);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [initialValues, setInitialValues] = useState({});

    const ROLE_OPTIONS = [
        { label: "Super Admin", value: "superadmin" },
        { label: "Admin", value: "admin" },
        { label: "Sub Admin", value: "subadmin" }
    ];

    // 👉 Table Columns
    const columns = [
        { title: "S.no", dataIndex: "sno" },
        { title: "Name", dataIndex: "name" },
        { title: "Username", dataIndex: "username" },
        { title: "Email", dataIndex: "email" },
        { title: "Phone", dataIndex: "phone" },
        {
            title: "Role",
            dataIndex: "role",
            render: (val) => val
        },
        {
            title: "Status",
            dataIndex: "status",
            render: (val) => (
                <Tag color={val === "Active" ? "green" : "red"}>
                    {val}
                </Tag>
            )
        }
    ];

    const getFields = () => {
        const commonFields = [
            {
                name: "name",
                label: "Name",
                type: "text",
                rules: [{ required: true }]
            },
            {
                name: "username",
                label: "Username",
                type: "text",
                rules: [{ required: true }]
            },
            {
                name: "email",
                label: "Email",
                type: "text",
                rules: [{ required: true }]
            },
            {
                name: "phone",
                label: "Phone",
                type: "text"
            },
            {
                name: "role",
                label: "Role",
                type: "select",
                options: ROLE_OPTIONS,
                rules: [{ required: true }]
            }
        ];

        if (!editing) {
            return [
                ...commonFields,
                {
                    name: "password",
                    label: "Password",
                    type: "password",
                    rules: [{ required: true }]
                }
            ];
        }

        return [
            ...commonFields,
            {
                name: "resetPassword",
                label: "Reset Password",
                type: "password"
            },
            {
                name: "status",
                label: "Status",
                type: "select",
                options: [
                    { label: "Active", value: "Active" },
                    { label: "Not Active", value: "Not Active" }
                ],
                rules: [{ required: true }]
            }
        ];
    };

    // 👉 Submit (Create / Update)
    // const handleSubmit = (values) => {

    //     if (editing) {
    //         // update
    //         const updated = data.map((item) =>
    //             item.key === editing
    //                 ? { ...item, ...values }
    //                 : item
    //         );

    //         setData(updated);
    //         setEditing(null);

    //     } else {
    //         // create
    //         const newStaff = {
    //             key: Date.now(),
    //             sno: data.length + 1,
    //             ...values
    //         };

    //         setData([...data, newStaff]);
    //     }

    //     setOpen(false);
    // };

    const handleSubmit = (values) => {

        const { password, resetPassword, ...rest } = values;

        if (editing) {
            const updated = data.map((item) =>
                item.key === editing
                    ? { ...item, ...rest }
                    : item
            );

            // 👉 optional: reset password logic
            if (resetPassword) {
                console.log("Reset password for:", editing, resetPassword);
            }

            setData(updated);
            setEditing(null);

        } else {
            const newStaff = {
                key: Date.now(),
                sno: data.length + 1,
                ...rest
            };

            console.log("New password:", password);

            setData([...data, newStaff]);
        }

        setOpen(false);
    };

    return (
        <div>

            <TableHeader
                data={data}
                showCreateButton={true}
                onCreate={() => {
                    setEditing(null);
                    setInitialValues({});
                    setOpen(true);
                }}
            />

            <ReusableTable
                columns={columns}
                data={data}
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

            />

        </div>
    );
};

export default StaffManagement;