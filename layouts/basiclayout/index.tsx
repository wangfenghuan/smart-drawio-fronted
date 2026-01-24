"use client"
import {
    GithubFilled,
    LoginOutlined,
    LogoutOutlined,
    UserOutlined,
} from "@ant-design/icons"
import { ProLayout } from "@ant-design/pro-components"
import { App, Dropdown } from "antd"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import type React from "react"
import { useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { getAccessibleMenus } from "@/access/menuAccess"
import { userLogout } from "@/api/userController"
import GlobalFooter from "@/components/GlobalFooter"
import menus from "@/config/menu"
import { DefauleUser } from "@/constants/UserState"
import type { AppDispatch, RootState } from "@/stores"
import { setLoginUser } from "@/stores/loginUser"

interface Props {
    children: React.ReactNode
}

export default function BasicLayout({ children }: Props) {
    const { message } = App.useApp()
    const pathName = usePathname()
    const loginUser = useSelector((state: RootState) => state.loginUser)
    const router = useRouter()
    const dispatch = useDispatch<AppDispatch>()

    // 判断是否是管理员页面（管理员页面全屏显示，图表编辑页面显示导航栏）
    const isAdminPage = pathName.startsWith("/admin")
    const isFullPage = isAdminPage

    const logout = useCallback(async () => {
        try {
            const res = await userLogout()
            // 后端返回结构: { code: 0, data: true, message: "ok" }
            if (res?.code === 0) {
                message.success("账号已经退出")
                dispatch(setLoginUser(DefauleUser))
                router.push("/user/login")
            } else {
                message.error(res?.message || "退出失败")
            }
        } catch (_e) {
            message.error("退出失败，请稍后重试")
        }
    }, [dispatch, router, message])

    // 判断用户是否登录
    const isLoggedIn = loginUser?.userRole !== "notLogin" && loginUser?.id

    // 跳转到登录页
    const goToLogin = useCallback(() => {
        router.push("/user/login")
    }, [router])

    // 跳转到个人信息页
    const goToProfile = useCallback(() => {
        if (loginUser?.id) {
            router.push(`/user/profile/${loginUser.id}`)
        } else {
            message.warning("请先登录")
        }
    }, [router, loginUser, message])

    // 构建下拉菜单项
    const getMenuItems = useCallback(() => {
        if (isLoggedIn) {
            // 已登录用户
            return [
                {
                    key: "profile",
                    icon: <UserOutlined />,
                    label: "个人信息",
                },
                {
                    type: "divider" as const,
                },
                {
                    key: "logout",
                    icon: <LogoutOutlined />,
                    label: "退出登录",
                },
            ]
        } else {
            // 未登录用户
            return [
                {
                    key: "login",
                    icon: <LoginOutlined />,
                    label: "去登录",
                },
            ]
        }
    }, [isLoggedIn])

    // 处理菜单点击
    const handleMenuClick = useCallback(
        async ({ key }: { key: string }) => {
            switch (key) {
                case "logout":
                    await logout()
                    break
                case "login":
                    goToLogin()
                    break
                case "profile":
                    goToProfile()
                    break
            }
        },
        [logout, goToLogin, goToProfile],
    )

    return (
        <div
            id="basiclayout"
            style={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden", // 外层保持 hidden，防止双重滚动条
            }}
        >
            <ProLayout
                title="智能协同云画图"
                logo="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"
                layout="top"
                location={{
                    pathname: pathName,
                }}
                style={{
                    height: "100vh",
                }}
                // --- 修复重点 1：contentStyle ---
                contentStyle={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    // 编辑页/管理员页：0 padding，隐藏溢出
                    // 普通页：保留 padding，允许 Y 轴滚动 (overflowY: "auto")
                    padding: isFullPage ? 0 : 24,
                    overflowY: isFullPage ? "hidden" : "auto",
                    overflowX: "hidden",
                    height: "100%", // 让内容区撑满剩余高度，从而让滚动条出现在内容区内部
                }}
                avatarProps={{
                    src:
                        loginUser.userAvatar ||
                        "https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png",
                    size: "small",
                    title: isLoggedIn ? loginUser.userName || "用户" : "未登录",
                    render: (_props, dom) => (
                        <Dropdown
                            menu={{
                                items: getMenuItems(),
                                onClick: handleMenuClick,
                            }}
                        >
                            {dom}
                        </Dropdown>
                    ),
                }}
                actionsRender={(props) => {
                    if (props.isMobile) return []
                    return [
                        <a
                            key="github"
                            href="https://github.com/wangfenghuan"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <GithubFilled
                                style={{ fontSize: 20, color: "#666" }}
                            />
                        </a>,
                    ]
                }}
                headerTitleRender={(logo, title) => (
                    <Link href="/">
                        {logo}
                        {title}
                    </Link>
                )}
                menuDataRender={() => getAccessibleMenus(loginUser, menus)}
                menuItemRender={(item, dom) => {
                    const isActive =
                        item.path === "/"
                            ? pathName === "/"
                            : pathName?.startsWith(item.path || "")
                    return (
                        <Link
                            href={item.path || "/"}
                            target={item.target}
                            style={{
                                color: isActive ? "#1890ff" : "inherit",
                                fontWeight: isActive ? "bold" : "normal",
                            }}
                        >
                            {dom}
                        </Link>
                    )
                }}
                // 编辑页/管理员页不需要 Footer，普通页显示小 Footer
                footerRender={() => (isFullPage ? null : <GlobalFooter />)}
                // 编辑页/管理员页不需要顶部 Header，普通页显示
                headerRender={isFullPage ? false : undefined}
            >
                {/* --- 修复重点 2：子容器 Wrapper --- */}
                <div
                    style={{
                        width: "100%",
                        // 编辑页/管理员页：强制占满高度，隐藏溢出
                        // 普通页：不需要 height: 100%，让内容自然撑开；也不要 overflow: hidden
                        ...(isFullPage
                            ? {
                                  height: "100%",
                                  overflow: "hidden",
                                  display: "flex",
                                  flexDirection: "column",
                              }
                            : {
                                  // 普通页面模式：不做限制，让内容自然生长
                                  minHeight: "100%", // 确保至少撑满一屏
                              }),
                    }}
                >
                    {children}
                </div>
            </ProLayout>
        </div>
    )
}
