"use client"

import {
    AppstoreOutlined,
    DatabaseOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    NotificationOutlined,
    RobotOutlined,
    SafetyOutlined,
    SolutionOutlined,
    TeamOutlined,
    UserOutlined,
} from "@ant-design/icons"
import { Layout, theme } from "antd"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AdminAiManagement } from "@/components/admin/AdminAiManagement"
import { AdminAnnouncementManagement } from "@/components/admin/AdminAnnouncementManagement"
import { AdminDiagramManagement } from "@/components/admin/AdminDiagramManagement"
import { AdminFeedbackManagement } from "@/components/admin/AdminFeedbackManagement"
import { AdminMaterialManagement } from "@/components/admin/AdminMaterialManagement"
import { AdminRoleManagement } from "@/components/admin/AdminRoleManagement"
import { AdminRoomManagement } from "@/components/admin/AdminRoomManagement"
import { AdminSpaceManagement } from "@/components/admin/AdminSpaceManagement"
import { AdminUserManagement } from "@/components/admin/AdminUserManagement"

const { Sider, Content, Header } = Layout

type AdminTab =
    | "users"
    | "roles"
    | "rooms"
    | "diagrams"
    | "spaces"
    | "materials"
    | "announcements"
    | "feedback"
    | "ai"

interface MenuItem {
    key: AdminTab
    label: string
    icon: React.ReactNode
}

const menuItems: MenuItem[] = [
    {
        key: "users",
        label: "用户管理",
        icon: <UserOutlined />,
    },
    {
        key: "roles",
        label: "角色管理", // Changed label from "角色权限" to "角色管理"
        icon: <SafetyOutlined />,
    },
    {
        key: "rooms",
        label: "房间管理",
        icon: <TeamOutlined />,
    },
    {
        key: "diagrams",
        label: "图表管理",
        icon: <MenuFoldOutlined />, // Changed icon from ClockCircleOutlined to MenuFoldOutlined
    },
    {
        key: "spaces",
        label: "空间管理",
        icon: <DatabaseOutlined />,
    },
    {
        key: "materials",
        label: "素材管理",
        icon: <AppstoreOutlined />,
    },
    {
        key: "announcements",
        label: "公告管理",
        icon: <NotificationOutlined />,
    },
    {
        key: "feedback",
        label: "反馈管理",
        icon: <SolutionOutlined />,
    },
    {
        key: "ai",
        label: "AI 管理",
        icon: <RobotOutlined />,
    },
]

export default function AdminPage() {
    const { token } = theme.useToken()
    const router = useRouter()

    const [collapsed, setCollapsed] = useState(false)
    const [selectedTab, setSelectedTab] = useState<AdminTab>("users")

    const renderContent = () => {
        switch (selectedTab) {
            case "users":
                return <AdminUserManagement />
            case "roles":
                return <AdminRoleManagement />
            case "rooms":
                return <AdminRoomManagement />
            case "diagrams":
                return <AdminDiagramManagement />
            case "spaces":
                return <AdminSpaceManagement />
            case "materials":
                return <AdminMaterialManagement />
            case "announcements":
                return <AdminAnnouncementManagement />
            case "feedback":
                return <AdminFeedbackManagement />
            case "ai":
                return <AdminAiManagement />
            default:
                return <AdminUserManagement />
        }
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#f0f2f5",
                height: "100vh",
                overflow: "hidden",
            }}
        >
            <Layout style={{ minHeight: "100vh", height: "100vh" }}>
                {/* 左侧边栏 */}
                <Sider
                    trigger={null}
                    collapsible
                    collapsed={collapsed}
                    style={{
                        overflow: "auto",
                        height: "100vh",
                        position: "fixed",
                        left: 0,
                        top: 0,
                        bottom: 0,
                    }}
                    theme="dark"
                >
                    {/* Logo区域 */}
                    <div
                        style={{
                            height: "64px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(255, 255, 255, 0.1)",
                            margin: "16px",
                            borderRadius: "8px",
                        }}
                    >
                        <SafetyOutlined
                            style={{
                                fontSize: collapsed ? "24px" : "28px",
                                color: "#ff4d4f",
                                marginRight: collapsed ? 0 : "12px",
                            }}
                        />
                        {!collapsed && (
                            <span
                                style={{
                                    color: "white",
                                    fontSize: "16px",
                                    fontWeight: 600,
                                }}
                            >
                                管理员控制台
                            </span>
                        )}
                    </div>

                    {/* 菜单项 */}
                    <div style={{ padding: collapsed ? "0 16px" : "0 24px" }}>
                        {menuItems.map((item) => (
                            <div
                                key={item.key}
                                onClick={() => setSelectedTab(item.key)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "12px 16px",
                                    marginBottom: "8px",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    background:
                                        selectedTab === item.key
                                            ? "rgba(255, 77, 79, 0.2)"
                                            : "transparent",
                                    color:
                                        selectedTab === item.key
                                            ? "#ff4d4f"
                                            : "rgba(255, 255, 255, 0.65)",
                                    transition: "all 0.3s",
                                }}
                                onMouseEnter={(e) => {
                                    if (selectedTab !== item.key) {
                                        e.currentTarget.style.background =
                                            "rgba(255, 255, 255, 0.08)"
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (selectedTab !== item.key) {
                                        e.currentTarget.style.background =
                                            "transparent"
                                    }
                                }}
                            >
                                <span style={{ fontSize: "18px" }}>
                                    {item.icon}
                                </span>
                                {!collapsed && (
                                    <span
                                        style={{
                                            marginLeft: "12px",
                                            fontSize: "14px",
                                            fontWeight: 500,
                                        }}
                                    >
                                        {item.label}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </Sider>

                {/* 右侧内容区 */}
                <Layout
                    style={{
                        marginLeft: collapsed ? 80 : 200,
                        transition: "margin-left 0.2s",
                        height: "100vh",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {/* 顶部Header */}
                    <Header
                        style={{
                            padding: "0 24px",
                            height: "64px",
                            background: token.colorBgContainer,
                            borderBottom: `1px solid ${token.colorBorderSecondary}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexShrink: 0,
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "16px",
                            }}
                        >
                            {collapsed ? (
                                <MenuUnfoldOutlined
                                    style={{
                                        fontSize: "18px",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => setCollapsed(!collapsed)}
                                />
                            ) : (
                                <MenuFoldOutlined
                                    style={{
                                        fontSize: "18px",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => setCollapsed(!collapsed)}
                                />
                            )}
                            <span style={{ fontSize: "16px", fontWeight: 600 }}>
                                {menuItems.find(
                                    (item) => item.key === selectedTab,
                                )?.label || "管理"}
                            </span>
                        </div>

                        <div style={{ display: "flex", gap: "12px" }}>
                            <button
                                onClick={() => router.push("/")}
                                style={{
                                    padding: "6px 16px",
                                    border: `1px solid ${token.colorBorder}`,
                                    borderRadius: "6px",
                                    background: token.colorBgContainer,
                                    cursor: "pointer",
                                    fontSize: "14px",
                                }}
                            >
                                返回首页
                            </button>
                        </div>
                    </Header>

                    {/* 内容区域 */}
                    <Content
                        style={{
                            margin: "24px",
                            padding: "0",
                            background: "#f0f2f5",
                            overflowY: "auto",
                            flex: 1,
                        }}
                    >
                        {renderContent()}
                    </Content>
                </Layout>
            </Layout>
        </div>
    )
}
