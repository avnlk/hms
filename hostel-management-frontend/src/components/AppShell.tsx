import { useEffect, useMemo, useState } from "react";
import {
  AppstoreOutlined,
  CheckCircleOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TeamOutlined,
  UserOutlined
} from "@ant-design/icons";
import { useKeycloak } from "@react-keycloak/web";
import { Avatar, Button, Dropdown, Layout, Menu } from "antd";
import type { MenuProps } from "antd";
import { Link, Outlet, useLocation } from "react-router-dom";
import logo from "../assets/iiitb-logo.png";
import "./app-shell.css";

const { Header, Sider, Content } = Layout;

const menuItems: MenuProps["items"] = [
  { key: "/dashboard", icon: <HomeOutlined />, label: <Link to="/dashboard">Dashboard</Link> },
  { key: "/room-allotment", icon: <AppstoreOutlined />, label: <Link to="/room-allotment">Room Allotment</Link> },
  { key: "/check-in", icon: <CheckCircleOutlined />, label: <Link to="/check-in">Check In</Link> },
  { key: "/check-out", icon: <CheckCircleOutlined />, label: <Link to="/check-out">Check Out</Link> },
  {
    key: "administration",
    icon: <TeamOutlined />,
    label: "Administration",
    children: [
      { key: "/administration/student", label: <Link to="/administration/student">Student</Link> },
      { key: "/administration/hostel", label: <Link to="/administration/hostel">Hostel</Link> }
    ]
  },
  {
    key: "reports",
    icon: <AppstoreOutlined />,
    label: "Reports",
    children: [
      {
        key: "/reports/present-occupancy",
        label: <Link to="/reports/present-occupancy">Present Occupancy</Link>
      },
      { key: "/reports/vacated-list", label: <Link to="/reports/vacated-list">Vacated list</Link> }
    ]
  }
];

const getOpenMenuKey = (pathname: string): string[] => {
  if (pathname.startsWith("/administration")) {
    return ["administration"];
  }
  if (pathname.startsWith("/reports")) {
    return ["reports"];
  }
  return [];
};

const HEADER_TITLE_BY_PATH: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/reports/present-occupancy": "Occupancy",
  "/reports/vacated-list": "Vacated list"
};

const AppShell = () => {
  const location = useLocation();
  const { keycloak } = useKeycloak();
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>(getOpenMenuKey(location.pathname));

  const selectedKeys = useMemo(() => {
    if (location.pathname.startsWith("/room-allotment")) {
      return ["/room-allotment"];
    }
    return [location.pathname];
  }, [location.pathname]);

  const headerTitle = HEADER_TITLE_BY_PATH[location.pathname] ?? "";

  useEffect(() => {
    setOpenKeys(getOpenMenuKey(location.pathname));
  }, [location.pathname]);

  const profileMenuItems: MenuProps["items"] = [
    {
      key: "user",
      label: keycloak.tokenParsed?.preferred_username ?? "User",
      disabled: true
    },
    {
      type: "divider"
    },
    {
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined />
    }
  ];

  const handleProfileMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "logout") {
      void keycloak.logout({ redirectUri: `${window.location.origin}/login` });
    }
  };

  return (
    <Layout className="app-shell">
      <Sider
        width={220}
        collapsible
        collapsed={collapsed}
        trigger={null}
        className="app-shell-sider"
      >
        <div className="app-shell-brand">
          <img src={logo} alt="IIIT Bangalore" className="app-shell-logo" />
          {!collapsed && (
            <div className="app-shell-brand-text">
              <div>International Institute of</div>
              <div>Information Technology Bangalore</div>
            </div>
          )}
        </div>
        <Menu
          mode="inline"
          items={menuItems}
          selectedKeys={selectedKeys}
          openKeys={openKeys}
          onOpenChange={setOpenKeys}
          className="app-shell-menu"
        />
      </Sider>
      <Layout>
        <Header className="app-shell-header">
          <div className="app-shell-header-left">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed((prev) => !prev)}
              className="app-shell-trigger"
            />
            {headerTitle ? <span className="app-shell-title">{headerTitle}</span> : null}
          </div>
          <Dropdown
            trigger={["click"]}
            placement="bottomRight"
            menu={{ items: profileMenuItems, onClick: handleProfileMenuClick }}
          >
            <Avatar icon={<UserOutlined />} className="app-shell-avatar" />
          </Dropdown>
        </Header>
        <Content className="app-shell-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppShell;
