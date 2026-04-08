// const MODULES = [
//     "Dashboard",
//     "Assets",
//     "Network",
//     "User Details",
//     "Wallet",
//     "Transaction",
//     "Webhook",
//     "Trending Currency",
//     "Default Currency",
//     "Push Notification",
//     "Email Template",
//     "Email Management",
//     "Support",
//     "Role Management",
//     "Profile"
// ];

// const PermissionSelector = ({ value = [], onChange }) => {

//     const handleChange = (module) => {
//         let updated = [...value];

//         if (updated.includes(module)) {
//             updated = updated.filter((m) => m !== module);
//         } else {
//             updated.push(module);
//         }

//         // 🔥 IMPORTANT
//         onChange && onChange(updated);
//     };

//     return (
//         <div className="white"
//             style={{
//                 display: "grid",
//                 gridTemplateColumns: "1fr 1fr", // 🔥 2 columns
//                 gap: "10px 20px"
//             }}
//         >
//             {MODULES.map((module) => (
//                 <div key={module} style={{ marginBottom: 10 }}>
//                     <label style={{ cursor: "pointer" }}>
//                         <input
//                             type="checkbox"
//                             checked={value?.includes(module)}
//                             onChange={() => handleChange(module)}
//                         />
//                         {" "} {module}
//                     </label>
//                 </div>
//             ))}
//         </div>
//     );
// };

// export default PermissionSelector;

const MODULES = [
    "Dashboard",
    "Assets",
    "Network",
    "User Details",
    "Wallet",
    "Transaction",
    "Webhook",
    "Trending Currency",
    "Default Currency",
    "Push Notification",
    "Email Template",
    "Email Management",
    "Support",
    "Role Management",
    "Profile"
];

const PermissionSelector = ({ value = [], onChange }) => {

    const isAllSelected = value.length === MODULES.length;

    const handleSelectAll = () => {
        if (isAllSelected) {
            onChange([]); // ❌ unselect all
        } else {
            onChange(MODULES); // ✅ select all
        }
    };

    const handleChange = (module) => {
        let updated = [...value];

        if (updated.includes(module)) {
            updated = updated.filter((m) => m !== module);
        } else {
            updated.push(module);
        }

        onChange && onChange(updated);
    };

    return (
        <div className="white">

            {/* 🔥 SELECT ALL */}
            <div style={{ marginBottom: 15 }}>
                <label style={{
                    cursor: "pointer", fontWeight: "bold", display: "flex",
                    alignItems: "center",
                    gap: 8 }}>
                    <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleSelectAll}
                    />
                    {" "} Select All
                </label>
            </div>

            {/* MODULE LIST */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px 20px"
                }}
            >
                {MODULES.map((module) => (
                    <label
                        key={module}
                        style={{
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 8
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={value?.includes(module)}
                            onChange={() => handleChange(module)}
                        />
                        {module}
                    </label>
                ))}
            </div>
        </div>
    );
};

export default PermissionSelector;