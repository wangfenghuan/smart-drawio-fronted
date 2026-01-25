/* eslint-disable */
import request from "@/lib/request"

/** 创建公告 POST /announcement/add */
export async function addAnnouncement(
    body: API.AnnouncementAddRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseLong>("/announcement/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 删除公告 POST /announcement/delete */
export async function deleteAnnouncement(
    body: API.DeleteRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseBoolean>("/announcement/delete", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 根据 id 获取公告 GET /announcement/get */
export async function getAnnouncementById(
    // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
    params: API.getAnnouncementByIdParams,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseAnnouncement>("/announcement/get", {
        method: "GET",
        params: {
            ...params,
        },
        ...(options || {}),
    })
}

/** 根据 id 获取公告封装类 GET /announcement/get/vo */
export async function getAnnouncementVoById(
    // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
    params: API.getAnnouncementVOByIdParams,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseAnnouncementVO>("/announcement/get/vo", {
        method: "GET",
        params: {
            ...params,
        },
        ...(options || {}),
    })
}

/** 分页获取公告列表 POST /announcement/list/page */
export async function listAnnouncementByPage(
    body: API.AnnouncementQueryRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponsePageAnnouncement>(
        "/announcement/list/page",
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

/** 分页获取公告封装列表 POST /announcement/list/page/vo */
export async function listAnnouncementVoByPage(
    body: API.AnnouncementQueryRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponsePageAnnouncementVO>(
        "/announcement/list/page/vo",
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

/** 更新公告 POST /announcement/update */
export async function updateAnnouncement(
    body: API.AnnouncementUpdateRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseBoolean>("/announcement/update", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}
