import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, Checkbox, Col, Empty, Row, Space, Spin, Tabs, Typography, message } from "antd";
import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";
import axios from "axios";
import theme from "../config/theme.json";
import { constant } from "../const";

const { Text } = Typography;

const ProviderController = () => {
  const [activeTab, setActiveTab] = useState("buy");
  const [providers, setProviders] = useState([]);
  const [dropdowns, setDropdowns] = useState({});
  const [loading, setLoading] = useState(false);
  const [updatingKey, setUpdatingKey] = useState("");

  const authHeader = useMemo(
    () => ({
      Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
    }),
    []
  );

  const activeProviders = useMemo(
    () => providers.filter((provider) => provider.type === activeTab),
    [providers, activeTab]
  );

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${constant.backend_url}/admin/get-provider-controller`, {
        headers: authHeader,
      });

      if (data?.success) {
        setProviders(Array.isArray(data.result) ? data.result : []);
      } else {
        message.error(data?.message || "Failed to load provider controller");
      }
    } catch (error) {
      console.error("Failed to load provider controller:", error);
      message.error("Failed to load provider controller");
    } finally {
      setLoading(false);
    }
  }, [authHeader]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const replaceProvider = (updatedProvider) => {
    if (!updatedProvider?._id) return;

    setProviders((prev) =>
      prev.map((provider) => (provider._id === updatedProvider._id ? updatedProvider : provider))
    );
  };

  const updateProviderStatus = async (provider, isActive) => {
    if (provider.providerName === "onramper" && isActive) {
      setProviders((prev) =>
        prev.map((item) => (item._id === provider._id ? { ...item, isActive: true } : item))
      );
      setDropdowns((prev) => ({ ...prev, [provider._id]: true }));
      return;
    }

    const updateKey = `provider-${provider._id}`;
    setUpdatingKey(updateKey);
    try {
      const { data } = await axios.post(
        `${constant.backend_url}/admin/update-provider-controller`,
        {
          provider_id: provider._id,
          isActive,
        },
        { headers: authHeader }
      );

      if (data?.success) {
        message.success(data.message || "Provider updated");
        if (data.result) {
          replaceProvider(data.result);
        } else {
          setProviders((prev) =>
            prev.map((item) =>
              item._id === provider._id
                ? {
                    ...item,
                    isActive,
                    subProviders:
                      provider.providerName === "onramper" && !isActive
                        ? (item.subProviders || []).map((subProvider) => ({
                            ...subProvider,
                            isActive: false,
                          }))
                        : item.subProviders,
                  }
                : item
            )
          );
        }
        if (!isActive) {
          setDropdowns((prev) => ({ ...prev, [provider._id]: false }));
        }
      } else {
        message.error(data?.message || "Failed to update provider");
        if (isActive && (provider.subProviders || []).length > 0) {
          setDropdowns((prev) => ({ ...prev, [provider._id]: true }));
        }
      }
    } catch (error) {
      console.error("Failed to update provider:", error);
      const errorMessage = error?.response?.data?.message || "Failed to update provider";
      message.error(errorMessage);

      if (isActive && (provider.subProviders || []).length > 0) {
        setDropdowns((prev) => ({ ...prev, [provider._id]: true }));
      }
    } finally {
      setUpdatingKey("");
    }
  };

  const updateSubProviderStatus = async (providerId, subProvider, isActive) => {
    const updateKey = `sub-${subProvider._id}`;
    const provider = providers.find((item) => item._id === providerId);
    setUpdatingKey(updateKey);
    try {
      const { data } = await axios.post(
        `${constant.backend_url}/admin/update-provider-controller`,
        {
          provider_id: providerId,
          ...(provider?.providerName === "onramper" && isActive ? { isActive: true } : {}),
          subProviderName: subProvider.providerName,
          subProviderIsActive: isActive,
        },
        { headers: authHeader }
      );

      if (data?.success) {
        message.success(data.message || "Sub provider updated");
        if (data.result) {
          replaceProvider(data.result);
        } else {
          setProviders((prev) =>
            prev.map((provider) =>
              provider._id === providerId
                ? {
                    ...provider,
                    isActive: provider.providerName === "onramper" && isActive ? true : provider.isActive,
                    subProviders: (provider.subProviders || []).map((sub) =>
                      sub._id === subProvider._id ? { ...sub, isActive } : sub
                    ),
                  }
                : provider
            )
          );
        }
      } else {
        message.error(data?.message || "Failed to update sub provider");
      }
    } catch (error) {
      console.error("Failed to update sub provider:", error);
      message.error(error?.response?.data?.message || "Failed to update sub provider");
    } finally {
      setUpdatingKey("");
    }
  };

  const handleToggleAllSubProviders = async (providerId, isActive) => {
    const provider = providers.find((p) => p._id === providerId);
    if (!provider) return;

    const subProvidersToUpdate = (provider.subProviders || []).filter(
      (sub) => Boolean(sub.isActive) !== isActive
    );

    if (isActive && subProvidersToUpdate.length === 0 && provider.isActive) return;

    const updateKey = `bulk-sub-${providerId}`;
    setUpdatingKey(updateKey);

    try {
      if (!isActive) {
        const { data } = await axios.post(
          `${constant.backend_url}/admin/update-provider-controller`,
          {
            provider_id: providerId,
            isActive: false,
          },
          { headers: authHeader }
        );

        if (data?.success) {
          message.success(data.message || "All sub providers disabled");
          if (data.result) {
            replaceProvider(data.result);
          } else {
            setProviders((prev) =>
              prev.map((p) =>
                p._id === providerId
                  ? {
                      ...p,
                      isActive: false,
                      subProviders: (p.subProviders || []).map((sub) => ({
                        ...sub,
                        isActive: false,
                      })),
                    }
                  : p
              )
            );
          }
          setDropdowns((prev) => ({ ...prev, [providerId]: false }));
        } else {
          message.error(data?.message || "Failed to update all sub providers");
        }
        return;
      }

      for (const subProvider of provider.subProviders || []) {
        const { data } = await axios.post(
          `${constant.backend_url}/admin/update-provider-controller`,
          {
            provider_id: providerId,
            isActive: true,
            subProviderName: subProvider.providerName,
            subProviderIsActive: true,
          },
          { headers: authHeader }
        );

        if (!data?.success) {
          message.error(data?.message || "Failed to update all sub providers");
          return;
        }
      }

      message.success("All sub providers enabled");
      setProviders((prev) =>
        prev.map((p) =>
          p._id === providerId
            ? {
                ...p,
                isActive: true,
                subProviders: (p.subProviders || []).map((sub) => ({
                  ...sub,
                  isActive: true,
                })),
              }
            : p
        )
      );
    } catch (error) {
      console.error("Failed to update all sub providers:", error);
      message.error(error?.response?.data?.message || "Failed to update all sub providers");
    } finally {
      setUpdatingKey("");
    }
  };

  const toggleDropdown = (providerId) => {
    setDropdowns((prev) => ({
      ...prev,
      [providerId]: !prev[providerId],
    }));
  };

  const renderDropdownArrow = (providerId) => (
    <div
      onClick={() => toggleDropdown(providerId)}
      style={{
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        background: "rgba(201,240,123,0.1)",
        padding: "4px",
        borderRadius: "4px",
        transition: "all 0.2s ease",
      }}
    >
      {dropdowns[providerId] ? (
        <CaretUpOutlined style={{ color: theme.primaryColor, fontSize: "14px" }} />
      ) : (
        <CaretDownOutlined style={{ color: theme.primaryColor, fontSize: "14px" }} />
      )}
    </div>
  );

  const renderProvider = (provider) => {
    const subProviders = provider.subProviders || [];
    const hasSubProviders = subProviders.length > 0;

    const activeSubProviders = subProviders.filter((sub) => sub.isActive);
    const isAllSelected = subProviders.length > 0 && activeSubProviders.length === subProviders.length;
    const isIndeterminate =
      activeSubProviders.length > 0 && activeSubProviders.length < subProviders.length;
    const isBulkUpdating = updatingKey === `bulk-sub-${provider._id}`;

    return (
      <Col xs={24} md={8} key={provider._id}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Checkbox
              checked={Boolean(provider.isActive)}
              disabled={updatingKey === `provider-${provider._id}`}
              onChange={(event) => updateProviderStatus(provider, event.target.checked)}
              className="custom-checkbox"
            >
              <span style={{ color: "#fff", fontSize: "16px", fontWeight: "600", textTransform: "capitalize" }}>
                {provider.providerName}
              </span>
            </Checkbox>
            {hasSubProviders && renderDropdownArrow(provider._id)}
          </div>

          {hasSubProviders && dropdowns[provider._id] && (
            <div
              style={{
                padding: "16px",
                background: "rgba(0,0,0,0.2)",
                borderRadius: "12px",
                marginTop: "4px",
                maxHeight: "350px",
                overflowY: "auto",
                border: "1px solid rgba(255,255,255,0.05)",
                scrollbarWidth: "thin",
                scrollbarColor: `${theme.primaryColor} transparent`,
              }}
              className="custom-scrollbar"
            >
              <Space direction="vertical" style={{ width: "100%" }} size={12}>
                <div
                  style={{
                    paddingBottom: "12px",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                    marginBottom: "4px",
                  }}
                >
                  <Checkbox
                    indeterminate={isIndeterminate}
                    checked={isAllSelected}
                    disabled={isBulkUpdating}
                    onChange={(e) => handleToggleAllSubProviders(provider._id, e.target.checked)}
                    className="custom-checkbox sub-checkbox"
                  >
                    <span
                      style={{
                        color: theme.primaryColor,
                        fontWeight: "600",
                        fontSize: "13px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Select All
                    </span>
                  </Checkbox>
                </div>
                {subProviders.map((subProvider) => (
                  <Checkbox
                    key={subProvider._id}
                    checked={Boolean(subProvider.isActive)}
                    disabled={updatingKey === `sub-${subProvider._id}` || isBulkUpdating}
                    onChange={(event) =>
                      updateSubProviderStatus(provider._id, subProvider, event.target.checked)
                    }
                    className="custom-checkbox sub-checkbox"
                  >
                    <span
                      style={{
                        color: "rgba(255,255,255,0.65)",
                        textTransform: "capitalize",
                        fontSize: "13px",
                      }}
                    >
                      {subProvider.providerName}
                    </span>
                  </Checkbox>
                ))}
              </Space>
            </div>
          )}

          {!hasSubProviders && provider.isActive && dropdowns[provider._id] && (
            <div
              style={{
                padding: "12px 16px",
                background: "rgba(0,0,0,0.2)",
                borderRadius: "12px",
                marginTop: "4px",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <Text style={{ color: "rgba(255,255,255,0.35)", fontStyle: "italic", fontSize: "12px" }}>
                No sub providers available
              </Text>
            </div>
          )}
        </div>
      </Col>
    );
  };

  return (
    <div>
      <div className="mb-5 w-full rounded-lg bg-cover bg-center flex items-center header-content-img">
        <div className="display-3 w-full">
          <h1 className="text-white p-7 font-bold text-2xl">Provider Controller</h1>
        </div>
      </div>

      <div style={{display: "flex", justifyContent: "center" }}>
        <Card
          style={{
            background: theme.sidebarSettings.backgroundColor,
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            width: "100%",
            maxWidth: "850px",
          }}
          styles={{ body: { padding: "28px" } }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            className="custom-tabs"
            items={[
              { key: "buy", label: "OnRamp" },
              { key: "sell", label: "OffRamp" },
            ]}
            style={{ marginBottom: "20px" }}
          />

          <div
            style={{
              marginBottom: "28px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              paddingBottom: "16px",
            }}
          >
            <span
              style={{
                color: "White",
                margin: 0,
                fontSize: "16px",
                fontWeight: "600",
                letterSpacing: "1.1px",
                opacity: 0.9,
              }}
            >
              Choose Provider and Sub Provider
            </span>
          </div>

          <Spin spinning={loading}>
            {activeProviders.length ? (
              <Row gutter={[48, 24]} align="top">
                {activeProviders.map(renderProvider)}
              </Row>
            ) : (
              <Empty
                className="empty-data"
                description={<span style={{ color: theme.primaryColor }}>No Providers Found</span>}
              />
            )}
          </Spin>
        </Card>
      </div>

      <style>{`
        .custom-tabs .ant-tabs-nav::before {
          border-bottom: 1px solid rgba(255,255,255,0.05) !important;
        }
        .custom-tabs .ant-tabs-tab {
          padding: 12px 0 !important;
          margin-right: 32px !important;
        }
        .custom-tabs .ant-tabs-tab .ant-tabs-tab-btn {
          color: rgba(255,255,255,0.45) !important;
          font-size: 15px !important;
          font-weight: 500 !important;
          letter-spacing: 0.5px !important;
          transition: all 0.3s ease !important;
        }
        .custom-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: ${theme.primaryColor} !important;
          text-shadow: 0 0 10px rgba(201,240,123,0.3) !important;
        }
        .custom-tabs .ant-tabs-tab:hover .ant-tabs-tab-btn {
          color: ${theme.primaryColor} !important;
          opacity: 0.8 !important;
        }
        .custom-tabs .ant-tabs-ink-bar {
          background: ${theme.primaryColor} !important;
          height: 2px !important;
          box-shadow: 0 0 10px rgba(201,240,123,0.4) !important;
        }
        .custom-checkbox .ant-checkbox-inner {
          background-color: transparent !important;
          border-color: rgba(201,240,123,0.5) !important;
          width: 20px;
          height: 20px;
        }
        .custom-checkbox .ant-checkbox-checked .ant-checkbox-inner {
          background-color: ${theme.primaryColor} !important;
          border-color: ${theme.primaryColor} !important;
        }
        .custom-checkbox .ant-checkbox-checked .ant-checkbox-inner::after {
          border-color: #000 !important;
        }
        .custom-checkbox:hover .ant-checkbox-inner {
          border-color: ${theme.primaryColor} !important;
        }
        .sub-checkbox .ant-checkbox-inner {
          width: 16px;
          height: 16px;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(201,240,123,0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(201,240,123,0.4);
        }
      `}</style>
    </div>
  );
};

export default ProviderController;
