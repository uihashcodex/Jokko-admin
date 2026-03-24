import { useNavigate, useLocation } from "react-router-dom";
import { Grid, Layout, Menu, Button, Drawer } from "antd";
import Anticon from "../reuseable/Anticon";
import { useState } from "react";
import theme from "../config/theme.json";
import { constant } from "../const";
import { filterSidebar } from "../utils/filterSidebar";
import logo from "../assets/image/logo.png";
import logomb from "../assets/image/logo-sm.png";

const { Sider } = Layout;
const { useBreakpoint } = Grid;

const Sidebar = ({ collapsed, setCollapsed }) => {
  const screens = useBreakpoint();
  const isMobile = !screens.lg;

  const navigate = useNavigate();
  const location = useLocation();
  console.log(location.pathname, 'pathname');

  const currentPath = location.pathname.replace(`/${constant.adminRoute}`, "");
  const [mobileOpen, setMobileOpen] = useState(false);

  // ✅ Get Active Sidebar Based on Type
  const activeSidebar = theme.sidebars?.[theme.sidebarType];

  const buildMenuItems = (items) =>
    items?.map((item) => {
      if (item.children) {
        return {
          key: item.key,
          icon: <Anticon name={item.icon} />,
          label: item.label,
          children: buildMenuItems(item.children),
        };
      }

      return {
        key: item.key,
        icon: <Anticon name={item.icon} />,
        label: item.label,
      };
    });

  // ✅ Safe Menu Items
  // const menuItems = buildMenuItems(activeSidebar?.menuItems || []);

  const user = JSON.parse(localStorage.getItem("user")) || {
    permissions: ["ALL"] 
  };

  // 👉 filter based on permission
  const filteredSidebar = filterSidebar(
    activeSidebar?.menuItems || [],
    user.permissions
  );

  // 👉 then build menu
  const menuItems = buildMenuItems(filteredSidebar);

  const handleLogout = () => {
    localStorage.clear(); // or removeItem("token")
    navigate(`/${constant.adminRoute}`);
  };
  // ===========================
  // 📱 MOBILE VIEW
  // ===========================
  if (isMobile) {
    return (
      <>
        <style>
          {`
          
        .custom-sidebar-menu .ant-menu-item-selected {
          background-color: ${theme.sidebarSettings.activeBgColor} !important;
          color: ${theme.sidebarSettings.activeTextColor} !important;
        }

        .custom-sidebar-menu .ant-menu-item-selected .anticon {
          color: ${theme.sidebarSettings.activeTextColor} !important;
        }

        .custom-sidebar-menu .ant-menu-item:hover {
          background-color: ${theme.sidebarSettings.hoverBgColor} !important;
          color: ${theme.sidebarSettings.hoverTextColor} !important;
        }
          .custom-sidebar-menu .ant-menu-submenu-title {
            color: ${theme.sidebarSettings.activeTextColor} !important;
          }

          .custom-sidebar-menu .ant-menu-submenu-selected > .ant-menu-submenu-title {
  background-color: ${theme.sidebarSettings.activeBgColor} !important;
  color: ${theme.sidebarSettings.activeTextColor} !important;
}
  .custom-sidebar-menu .ant-menu-submenu-selected > .ant-menu-submenu-title .anticon {
  color: ${theme.sidebarSettings.activeTextColor} !important;
}
      `}
        </style>
        {/* Mobile Top Bar */}
        <div
          style={{
            height: 60,
            background: theme.sidebarSettings.backgroundColor,
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            justifyContent: "space-between",
          }}
        >
          <div onClick={() => navigate("/")}>
            <img
              src={logo}
              alt="logo"
              style={{ height: theme.logo.height }}
            />
          </div>

          <Button
            type="text"
            icon={<Anticon name="MenuUnfoldOutlined" />}
            onClick={() => setMobileOpen(true)}
            style={{ color: "white", fontSize: 20 }}
          />
        </div>

        {/* Drawer Sidebar */}
        <Drawer
          placement="left"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          styles={{ body: { padding: 0 }, background: theme.sidebarSettings.backgroundColor }}
          className="mobile-drawer"
          headerStyle={{ display: "none" }}


        >
          {/* Drawer Logo */}
          <div
            style={{
              height: 60,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #f0f0f0",
              cursor: "pointer",
              padding: "0 16px",
              background: theme.sidebarSettings.backgroundColor,
            }}
            onClick={() => {

              // setMobileOpen(false);
            }}
          >
            <div>
              <img
                src={theme.logo.image}
                alt="logo"
                style={{ height: theme.logo.height }}
              />
            </div>
            <div>
              <Anticon name="PicRightOutlined" style={{ color: "#fff" }}
                onClick={() => {
                  setMobileOpen(false)
                }}
              />
            </div>
          </div>

          <Menu
            mode="inline"
            className="custom-sidebar-menu"
            // selectedKeys={[location.pathname]}
            onClick={({ key }) => {
              navigate(`/${constant.adminRoute}/${key}`);
              setMobileOpen(false);
            }}
            selectedKeys={[
              location.pathname.replace(`/${constant.adminRoute}/`, "")
            ]}
            style={{
              background: theme.sidebarSettings.backgroundColor,
              color: theme.sidebarSettings.textColor,
              borderRight: "none"
            }}
            items={menuItems}
          />
          <div
            onClick={() => {
              handleLogout();
              setMobileOpen(false);
            }}
            style={{
              padding: 16,
              cursor: "pointer",
              color: "red",
              borderTop: "1px solid #f0f0f0",
            }}
          >
            <Anticon name="LogoutOutlined" />{" "}
            <span style={{ marginLeft: 10 }}>Logout</span>
          </div>
        </Drawer>
      </>
    );
  }

  // ===========================
  // 💻 DESKTOP VIEW
  // ===========================
  return (
    <>
      <style>
        {`
         .custom-sidebar-menu.ant-menu {
              background: transparent !important;
              border-right: none !important;
            }

            .custom-sidebar-menu .ant-menu-item {
              color: ${theme.sidebarSettings.textColor} !important;
            }
             .custom-sidebar-menu .ant-menu-submenu-title {
  color: ${theme.sidebarSettings.textColor} !important;
}
        .custom-sidebar-menu .ant-menu-item-selected {
          background-color: ${theme.sidebarSettings.activeBgColor} !important;
          color: ${theme.sidebarSettings.activeTextColor} !important;
        }
  .custom-sidebar-menu .ant-menu-submenu-selected > .ant-menu-submenu-title {
  background-color: ${theme.sidebarSettings.activeBgColor} !important;
  color: ${theme.sidebarSettings.activeTextColor} !important;
}
  .custom-sidebar-menu .ant-menu-submenu-selected > .ant-menu-submenu-title .anticon {
  color: ${theme.sidebarSettings.activeTextColor} !important;
}

        .custom-sidebar-menu .ant-menu-item-selected .anticon {
          color: ${theme.sidebarSettings.activeTextColor} !important;
        }

        // .custom-sidebar-menu .ant-menu-item:hover {
        //   background-color: ${theme.sidebarSettings.hoverBgColor} !important;
        //   color: ${theme.sidebarSettings.hoverTextColor} !important;
        // }
          .custom-sidebar-menu  .ant-menu-item-active:hover{
          background-color: ${theme.sidebarSettings.activeBgColor} !important;
          color: ${theme.sidebarSettings.activeTextColor} !important;

          }
      `}
      </style>
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={theme.sidebarSettings.width}
        collapsedWidth={theme.sidebarSettings.collapsedWidth}
        style={{
          background: theme.sidebarSettings.backgroundColor,
          position: "fixed",
          height: "100vh",
          left: 0,
          display: "flex",
          flexDirection: "column",
        }}
        className="side-bar"
      >
        {/* Logo Section */}
        <div
          style={{
            height: 60,
            display: "flex",
            minHeight: 60,
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            padding: collapsed ? 0 : "0 16px",
            cursor: "pointer",
          }}
          // onClick={() => navigate("/")}
        >
          <img
            // src={theme.logo.image}
            // src={collapsed ? theme.logo.collapsedImage : theme.logo.image}
            src={collapsed ? logomb : logo}


            alt="logo"
            style={{
              height: theme.logo.height,
              transition: "0.3s",
            }}
          />

          {!collapsed && (
            <Button
              type="text"
              icon={<Anticon name="MenuFoldOutlined" />}
              onClick={(e) => {
                e.stopPropagation();
                setCollapsed(!collapsed);
              }}
              style={{ fontSize: 18, color: "white" }}
            />
          )}
        </div>

        {collapsed && (
          <div style={{ textAlign: "center", paddingBottom: 10 }}>
            <Button
              type="text"
              icon={<Anticon name="MenuUnfoldOutlined" />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 18, color: "white" }}
            />
          </div>
        )}

        <div
          style={{
            flex: 1,
            overflowY: "auto",
          }}
        >

        <Menu
          className="custom-sidebar-menu"
          mode="inline"
          // selectedKeys={[location.pathname?.replace(/^\/[^/]+/, "")]}
          selectedKeys={[currentPath]}

          style={{
            background: theme.sidebarSettings.backgroundColor,
            color: theme.sidebarSettings.textColor,
            borderRight: "none"
          }}
          onClick={({ key }) => navigate(`/${constant?.adminRoute}/${key}`)}
          items={menuItems}
        />
        </div>
        <div
          onClick={handleLogout}
          style={{
            height: 60,
            minHeight: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            paddingLeft: collapsed ? 0 : 24,
            cursor: "pointer",
            color: "red",
            fontWeight: 500,
            borderTop: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0px -6px 30px -8px rgba(255, 255, 255, 0.32)"
                    }}
        >
          <Anticon name="LogoutOutlined" />{" "}
          {!collapsed && <span style={{ marginLeft: 10 }}>Logout</span>}
        </div>
      </Sider>
    </>
  );
};

export default Sidebar;