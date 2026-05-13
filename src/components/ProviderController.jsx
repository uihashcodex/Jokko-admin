import React, { useState } from "react";
import { Checkbox, Space, Typography, Card, Row, Col, Tabs } from "antd";
import { CaretDownOutlined, CaretUpOutlined } from "@ant-design/icons";
import theme from "../config/theme.json";

const { Text } = Typography;

const onramperSubProviders = [
  "alchemypay", "banxa", "binanceconnect", "binancep2p", "btcdirect",
  "coinbasepay", "coinify", "dfx", "fonbnk", "gateconnect", "gatefi",
  "guardarian", "koywe", "kraken", "localramp", "moongate", "moonpay",
  "neocrypto", "onmeta", "onrampmoney", "paybis", "ramp", "revolut",
  "sardine", "simplex", "skrill", "stripe", "swapped", "topper",
  "transfi", "utorg", "wello", "yellowcard"
];

const ProviderController = () => {
  const [activeTab, setActiveTab] = useState("onramp");
  const [selectedProviders, setSelectedProviders] = useState({
    onramper: false,
    fonbnk: false,
    transfi: false
  });

  const [dropdowns, setDropdowns] = useState({
    onramper: false,
    fonbnk: false,
    transfi: false
  });

  const handleCheckboxChange = (provider) => (e) => {
    const checked = e.target.checked;
    setSelectedProviders({
      ...selectedProviders,
      [provider]: checked
    });
    // Auto-close dropdown if unchecked
    if (!checked) {
      setDropdowns({ ...dropdowns, [provider]: false });
    }
  };

  const toggleDropdown = (provider) => {
    setDropdowns({
      ...dropdowns,
      [provider]: !dropdowns[provider]
    });
  };

  const renderDropdownArrow = (provider) => (
    <div
      onClick={() => toggleDropdown(provider)}
      style={{
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        background: "rgba(201,240,123,0.1)",
        padding: "4px",
        borderRadius: "4px",
        transition: "all 0.2s ease"
      }}
    >
      {dropdowns[provider] ? (
        <CaretUpOutlined style={{ color: theme.primaryColor, fontSize: "14px" }} />
      ) : (
        <CaretDownOutlined style={{ color: theme.primaryColor, fontSize: "14px" }} />
      )}
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-5 w-full rounded-lg bg-cover bg-center flex items-center header-content-img">
        <div className="display-3 w-full">
          <h1 className="text-white p-7 font-bold text-2xl">Provider Controller</h1>
        </div>
      </div>

      <div style={{ padding: "0 12px", display: "flex", justifyContent: "flex-start" }}>
        <Card
          style={{
            background: theme.sidebarSettings.backgroundColor,
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            width: "100%",
            maxWidth: "850px"
          }}
          styles={{ body: { padding: "28px" } }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            className="custom-tabs"
            items={[
              { key: "onramp", label: "OnRamp" },
              { key: "offramp", label: "OffRamp" }
            ]}
            style={{ marginBottom: "20px" }}
          />

          <div style={{ marginBottom: "28px", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "16px" }}>
            <h2 style={{
              color: "White",
              margin: 0,
              fontSize: "16px",
              fontWeight: "600",
              letterSpacing: "1.5px",
              opacity: 0.9
            }}>
              Choose Provider and Sub Provider
            </h2>
          </div>

          <Row gutter={[48, 24]} align="top">
            {/* Onramper */}
            <Col xs={24} md={8}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Checkbox
                    checked={selectedProviders.onramper}
                    onChange={handleCheckboxChange("onramper")}
                    className="custom-checkbox"
                  >
                    <span style={{ color: "#fff", fontSize: "16px", fontWeight: "600" }}>Onramper</span>
                  </Checkbox>
                  {selectedProviders.onramper && renderDropdownArrow("onramper")}
                </div>

                {selectedProviders.onramper && dropdowns.onramper && (
                  <div style={{
                    padding: "16px",
                    background: "rgba(0,0,0,0.2)",
                    borderRadius: "12px",
                    marginTop: "4px",
                    maxHeight: "350px",
                    overflowY: "auto",
                    border: "1px solid rgba(255,255,255,0.05)",
                    scrollbarWidth: "thin",
                    scrollbarColor: `${theme.primaryColor} transparent`
                  }} className="custom-scrollbar">
                    <Space direction="vertical" style={{ width: "100%" }} size={12}>
                      {onramperSubProviders.map(sub => (
                        <Checkbox key={sub} className="custom-checkbox sub-checkbox">
                          <span style={{ color: "rgba(255,255,255,0.65)", textTransform: "capitalize", fontSize: "13px" }}>{sub}</span>
                        </Checkbox>
                      ))}
                    </Space>
                  </div>
                )}
              </div>
            </Col>

            {/* fonbnk */}
            <Col xs={24} md={8}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Checkbox
                    checked={selectedProviders.fonbnk}
                    onChange={handleCheckboxChange("fonbnk")}
                    className="custom-checkbox"
                  >
                    <span style={{ color: "#fff", fontSize: "16px", fontWeight: "600" }}>fonbnk</span>
                  </Checkbox>
                  {selectedProviders.fonbnk && renderDropdownArrow("fonbnk")}
                </div>
                {selectedProviders.fonbnk && dropdowns.fonbnk && (
                  <div style={{
                    padding: "12px 16px",
                    background: "rgba(0,0,0,0.2)",
                    borderRadius: "12px",
                    marginTop: "4px",
                    border: "1px solid rgba(255,255,255,0.05)"
                  }}>
                    <Text style={{ color: "rgba(255,255,255,0.35)", fontStyle: "italic", fontSize: "12px" }}>
                      No sub providers available
                    </Text>
                  </div>
                )}
              </div>
            </Col>

            {/* transfi */}
            <Col xs={24} md={8}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Checkbox
                    checked={selectedProviders.transfi}
                    onChange={handleCheckboxChange("transfi")}
                    className="custom-checkbox"
                  >
                    <span style={{ color: "#fff", fontSize: "16px", fontWeight: "600" }}>transfi</span>
                  </Checkbox>
                  {selectedProviders.transfi && renderDropdownArrow("transfi")}
                </div>
                {selectedProviders.transfi && dropdowns.transfi && (
                  <div style={{
                    padding: "12px 16px",
                    background: "rgba(0,0,0,0.2)",
                    borderRadius: "12px",
                    marginTop: "4px",
                    border: "1px solid rgba(255,255,255,0.05)"
                  }}>
                    <Text style={{ color: "rgba(255,255,255,0.35)", fontStyle: "italic", fontSize: "12px" }}>
                      No sub providers available
                    </Text>
                  </div>
                )}
              </div>
            </Col>
          </Row>
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
