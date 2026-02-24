import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout, Grid } from "antd";
import config from "./config/theme.json";
import Sidebar from "./components/Sidebar";
import Login from "./components/Login";
import WalletRouts from "./routscomponent/WalletRouts";
import PrivateRoute from "../src/components/Privateroute";
import { constant } from "./const";
const { Content } = Layout;
const { useBreakpoint } = Grid;

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.lg;

  let ActiveRoutes = WalletRouts;

  if (config.sidebarType === "wallet") {
    ActiveRoutes = WalletRouts;
  } else if (config.sidebarType === "exchange") {
    ActiveRoutes = ExchangeRouts;
  } else {
    ActiveRoutes = WalletRouts;
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <Layout
        style={{
          marginLeft: isMobile
            ? 0
            : collapsed
              ? config.sidebarSettings.collapsedWidth
              : config.sidebarSettings.width,
          transition: "all 0.2s",
        }}
      >
        <Content style={{ padding: "24px", background: "#f5f5f5" }}>
          <ActiveRoutes />
        </Content>
      </Layout>
    </Layout>
  );
}

function App() {
  useEffect(() => {
    document.title = config.project.name;

    const link =
      document.querySelector("link[rel~='icon']") ||
      document.createElement("link");

    link.rel = "icon";
    link.href = config.logo.image;
    document.head.appendChild(link);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={`/${constant.adminRoute}`} />} />
        <Route path={`/${constant.adminRoute}`} element={<Login />} />

        {/* Protected layout */}
        <Route element={<PrivateRoute />}>
          <Route path="/*" element={<AppLayout />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;