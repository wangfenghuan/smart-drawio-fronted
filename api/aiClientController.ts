/* eslint-disable */
import request from "@/lib/request"

/** 使用自定义的llm生成图表 POST /chat/custom/stream */
export async function doCustomChatStream(
    body: API.CustomChatRequest,
    options?: { [key: string]: any },
) {
    return request<API.SseEmitter>("/chat/custom/stream", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 此处后端没有提供注释 POST /chat/gen */
export async function doChat(
    // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
    params: API.doChatParams,
    options?: { [key: string]: any },
) {
    return request<string>("/chat/gen", {
        method: "POST",
        params: {
            ...params,
        },
        ...(options || {}),
    })
}

/** 系统默认llm流式生成图表 POST /chat/stream */
export async function doChatStream(
    body: API.CustomChatRequest,
    options?: { [key: string]: any },
) {
    return request<API.SseEmitter>("/chat/stream", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}
