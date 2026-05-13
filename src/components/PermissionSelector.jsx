const MODULES = [
  "Dashboard",
  "User Details",
  "Assets",
  "Network",
  "Trending Currency",
  "Wallet",
  "Transaction History",

  "Push Notification",
  "Email Template",
  "Email Management",
  "Email Campaign",
  "Support",
  "Role Management",
  "Env",
  "Broadcast",
  "Staff Management",
  "Onramper Orders",
  "Oframper Orders",
  "CoinRabbit History",
  "Fiat Assets",
  "Buy/Sell Crypto",
  "Buy/Sell Network",
  "Buy/Sell CoinRabbit"
];

const PermissionSelector = ({ value = [], onChange }) => {
  const selectedValues = Array.isArray(value) ? value : [];
  const isAllSelected = MODULES.every((module) => selectedValues.includes(module));

  const handleSelectAll = () => {
    if (isAllSelected) {
      onChange([]);
    } else {
      onChange(MODULES);
    }
  };

  const handleChange = (module) => {
    let updated = [...selectedValues];

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
              checked={selectedValues.includes(module)}
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
