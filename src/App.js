import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Layout, Grid, Spin } from "antd";
import config from "./config/theme.json";
import Sidebar from "./components/Sidebar";
import Login from "./components/Login";
import WalletRouts from "./routscomponent/WalletRouts";
import PrivateRoute from "../src/components/Privateroute";
import { constant } from "./const";

const { Content } = Layout;
const { useBreakpoint } = Grid;

/* -------------------- Layout -------------------- */

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.lg;

  let ActiveRoutes = WalletRouts;

  return (
    <Layout style={{ minHeight: "100vh"}}>
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
        <Content style={{ padding: "24px", backgroundColor:config.layoutSettings.layoutBackground }}>
          <ActiveRoutes />
        </Content>
      </Layout>
    </Layout>
  );
}

/* -------------------- Global Loader Wrapper -------------------- */

function AppRoutesWithLoader() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 500); // loader duration

    return () => clearTimeout(timer);
  }, [location]);

 return (
  <div className="relative">
    
    {/* Blur Content */}
    <div className={`transition-all duration-300 ${loading ? "blur-sm pointer-events-none" : ""}`}>
      <Routes>
        <Route path="/" element={<Navigate to={`/${constant.adminRoute}`} />} />
        <Route path={`/${constant.adminRoute}`} element={<Login />} />

        <Route element={<PrivateRoute />}>
          <Route path="/*" element={<AppLayout />} />
        </Route>
      </Routes>
    </div>

    {/* Center Spinner */}
    {loading && (
      <div className="fixed inset-0 flex items-center justify-center z-[9999]">
        <Spin size="large" />
      </div>
    )}

  </div>
);
}

/* -------------------- Main App -------------------- */

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
      <AppRoutesWithLoader />
    </BrowserRouter>
  );
}

export default App;