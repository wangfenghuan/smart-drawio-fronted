// @ts-expect-error
/* eslint-disable */
import request from "@/lib/request"

/** 添加反馈 POST /feedback/add */
export async function addFeedback(
    body: API.FeedbackAddRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseLong>("/feedback/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 根据 id 获取反馈 GET /feedback/get */
export async function getFeedbackById(
    // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
    params: API.getFeedbackByIdParams,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseFeedback>("/feedback/get", {
        method: "GET",
        params: {
            ...params,
        },
        ...(options || {}),
    })
}

/** 根据 id 获取反馈封装类 GET /feedback/get/vo */
export async function getFeedbackVoById(
    // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
    params: API.getFeedbackVOByIdParams,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseFeedbackVO>("/feedback/get/vo", {
        method: "GET",
        params: {
            ...params,
        },
        ...(options || {}),
    })
}

/** 分页获取反馈列表 POST /feedback/list/page */
export async function listFeedbackByPage(
    body: API.FeedbackQueryRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponsePageFeedback>("/feedback/list/page", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 分页获取反馈封装列表 POST /feedback/list/page/vo */
export async function listFeedbackVoByPage(
    body: API.FeedbackQueryRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponsePageFeedbackVO>("/feedback/list/page/vo", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 获取我提交的反馈列表 POST /feedback/my/list/page/vo */
export async function listMyFeedbackVoByPage(
    body: API.FeedbackQueryRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponsePageFeedbackVO>(
        "/feedback/my/list/page/vo",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            data: body,
            ...(options || {}),
        },
    )
}

/** 上传反馈图片 POST /feedback/upload/image */
export async function uploadFeedbackImage(
    body: {},
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseString>("/feedback/upload/image", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}
