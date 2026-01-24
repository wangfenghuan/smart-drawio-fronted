"use client"

import { AntdRegistry } from "@ant-design/nextjs-registry"
import { App as AntdApp, ConfigProvider } from "antd"
import zhCN from "antd/locale/zh_CN"
import React, { useCallback, useEffect } from "react"
import { Provider, useDispatch } from "react-redux"
import AccessLayout from "@/access/AccessLayout"
import { getLoginUser } from "@/api/userController"
import { GlobalAnnouncementPopup } from "@/components/GlobalAnnouncementPopup"
import { DiagramProvider } from "@/contexts/diagram-context"
import BasicLayout from "@/layouts/basiclayout"
import store, { type AppDispatch } from "@/stores"
import { setLoginUser } from "@/stores/loginUser"

import "./globals.css"
import "../styles/markdown.css"

/**
 * 全局初始化组件：负责获取登录用户信息
 */
const InitLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const dispatch = useDispatch<AppDispatch>()
    const [isInitialized, setIsInitialized] = React.useState(false)

    const doInitLoginUser = useCallback(async () => {
        try {
            const res = await getLoginUser()
            // @ts-expect-error
            if (res.code === 0 && res.data) {
                // 登录成功，保存用户信息
                dispatch(setLoginUser(res.data))
            } else {
                // 未登录或登录失效
                console.log("用户未登录，跳转到登录页面")
                dispatch(
                    setLoginUser({ userName: "未登录", userRole: "notLogin" }),
                )
                // 跳转到登录页，带上当前页面地址作为 redirect 参数
                const currentPath =
                    window.location.pathname + window.location.search
                if (!currentPath.includes("/user/login")) {
                    window.location.href = `/user/login?redirect=${encodeURIComponent(currentPath)}`
                }
            }
        } catch (error) {
            console.error("初始化用户信息失败", error)
            // 请求失败，可能未登录
            dispatch(setLoginUser({ userName: "未登录", userRole: "notLogin" }))
            const currentPath =
                window.location.pathname + window.location.search
            if (!currentPath.includes("/user/login")) {
                window.location.href = `/user/login?redirect=${encodeURIComponent(currentPath)}`
            }
        } finally {
            setIsInitialized(true)
        }
    }, [dispatch])

    useEffect(() => {
        doInitLoginUser()
    }, [doInitLoginUser])

    // 等待初始化完成再渲染子组件
    if (!isInitialized) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f5f5f5",
                }}
            >
                <div className="animate-spin h-6 w-6 border-2 border-gray-300 border-t-gray-600 rounded-full" />
            </div>
        )
    }

    return <>{children}</>
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="zh">
            <body>
                {/* AntdRegistry 应该包裹在最外层以确保样式收集 */}
                <AntdRegistry>
                    {/* ConfigProvider 负责 Ant Design 的全局样式配置和语言 */}
                    <ConfigProvider locale={zhCN}>
                        {/* AntdApp 提供 message、modal、notification 等组件的上下文 */}
                        <AntdApp>
                            <Provider store={store}>
                                <InitLayout>
                                    <BasicLayout>
                                        <AccessLayout>
                                            <DiagramProvider>
                                                {children}
                                            </DiagramProvider>
                                        </AccessLayout>
                                        <GlobalAnnouncementPopup />
                                    </BasicLayout>
                                </InitLayout>
                            </Provider>
                        </AntdApp>
                    </ConfigProvider>
                </AntdRegistry>
            </body>
        </html>
    )
}
