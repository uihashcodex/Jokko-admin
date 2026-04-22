const MODULES = [
  "Dashboard",
  "Assets",
  "Network",
  "User Details",
  "Wallet",
  "Transaction",
  "Trending Currency",
  "Push Notification",
  "Email Template",
  "Email Management",
  "Email Campaign",
  "Support",
  // "Role Management",
  "Broadcast",
  // "Staff Management",
  "Providers",
  "CoinRabbit History",
  "Buy/Sell Fiat Assets",
  "Buy/Sell Crypto",
  "Buy/Sell Network",
  "Buy/Sell CoinRabbit"
];

const PermissionSelector = ({ value = [], onChange }) => {
  const isAllSelected = value.length === MODULES.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      onChange([]);
    } else {
      onChange(MODULES);
    }
  };

  const handleChange = (module) => {
    let updated = [...value];

    if (updated.includes(module)) {
      updated = updated.filter((m) => m !== module);
    } else {
      updated.push(module);
    }

    onChange(updated);
  };

  return (
    <div className="white">
      <div style={{ marginBottom: 15 }}>
        <label
          style={{
            cursor: "pointer",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: 8
          }}
        >
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={handleSelectAll}
          />
          Select All
        </label>
      </div>

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