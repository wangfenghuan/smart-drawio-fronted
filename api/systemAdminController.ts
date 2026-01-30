/* eslint-disable */
import request from "@/lib/request"

/** 全局禁用AI服务 POST /admin/system/shutdown-ai */
export async function shutdownAi(options?: { [key: string]: any }) {
    return request<API.BaseResponseString>("/admin/system/shutdown-ai", {
        method: "POST",
        ...(options || {}),
    })
}

/** 全局启用AI服务 POST /admin/system/resume-ai */
export async function resumeAi(options?: { [key: string]: any }) {
    return request<API.BaseResponseString>("/admin/system/resume-ai", {
        method: "POST",
        ...(options || {}),
    })
}

/** 获取全局AI服务状态 GET /admin/system/status-ai */
export async function getGlobalAiStatus(options?: { [key: string]: any }) {
    return request<API.BaseResponseBoolean>("/admin/system/status-ai", {
        method: "GET",
        ...(options || {}),
    })
}

/** 切换指定用户的AI服务权限 POST /admin/system/user-ai-switch */
export async function toggleUserAi(
    // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
    params: {
        userId: number
        enable: boolean
    },
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseString>("/admin/system/user-ai-switch", {
        method: "POST",
        params: {
            ...params,
        },
        ...(options || {}),
    })
}

/** 获取指定用户的AI服务状态 GET /admin/system/user-ai-status */
export async function getUserAiStatus(
    // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
    params: {
        userId: number
    },
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseBoolean>("/admin/system/user-ai-status", {
        method: "GET",
        params: {
            ...params,
        },
        ...(options || {}),
    })
}

/** 获取当前AI使用量 GET /admin/system/ai-usage */
export async function getAiUsage(options?: { [key: string]: any }) {
    return request<API.BaseResponseString>("/admin/system/ai-usage", {
        method: "GET",
        ...(options || {}),
    })
}
