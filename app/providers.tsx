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

/**
 * 全局初始化组件：负责获取登录用户信息
 */
const InitLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const dispatch = useDispatch<AppDispatch>()
    const [isInitialized, setIsInitialized] = React.useState(false)

    const doInitLoginUser = useCallback(async () => {
        const currentPath = window.location.pathname
        // 先判断是否是公开页面，如果是，打印日志并注意不要误拦截
        const isPublic =
            currentPath === "/" ||
            currentPath.startsWith("/templates") ||
            currentPath.startsWith("/solutions") || // Also add solutions for SEO page
            currentPath.startsWith("/wiki") ||      // Also add wiki for SEO page
            currentPath.startsWith("/diagram-marketplace") ||
            currentPath.startsWith("/user/") ||
            currentPath.includes("sitemap.xml") ||
            currentPath.includes("robots.txt") ||
            currentPath.includes("manifest") ||
            currentPath.includes("favicon")

        try {
            const res = await getLoginUser()
            if (res.code === 0 && res.data) {
                // 登录成功，保存用户信息
                dispatch(setLoginUser(res.data))
            } else {
                // 未登录或登录失效
                // dispatch(
                //    setLoginUser({ userName: "未登录", userRole: "notLogin" }),
                // )

                // 只有非公开页面才跳转
                if (!isPublic && !currentPath.includes("/user/login")) {
                    window.location.href = `/user/login?redirect=${encodeURIComponent(currentPath + window.location.search)}`
                } else {
                    // 公开页面，记录为未登录即可
                    dispatch(
                        setLoginUser({
                            userName: "未登录",
                            userRole: "notLogin",
                        }),
                    )
                }
            }
        } catch (error) {
            // console.error("初始化用户信息失败", error)
            dispatch(setLoginUser({ userName: "未登录", userRole: "notLogin" }))

            if (!isPublic && !currentPath.includes("/user/login")) {
                window.location.href = `/user/login?redirect=${encodeURIComponent(currentPath + window.location.search)}`
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

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AntdRegistry>
            <ConfigProvider locale={zhCN}>
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
    )
}
