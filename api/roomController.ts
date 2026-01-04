// @ts-expect-error
/* eslint-disable */
import request from "@/lib/request"

/** 此处后端没有提供注释 POST /room/${param0}/save */
export async function save(
    // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
    params: API.saveParams,
    body: string,
    options?: { [key: string]: any },
) {
    const { roomId: param0, ...queryParams } = params
    return request<API.BaseResponseBoolean>(`/room/${param0}/save`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        params: { ...queryParams },
        data: body,
        ...(options || {}),
    })
}

/** 创建房间 POST /room/add */
export async function addRoom(
    body: API.RoomAddRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseLong>("/room/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 删除房间 POST /room/delete */
export async function deleteDiagramRoom(
    body: API.DeleteRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseBoolean>("/room/delete", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 编辑房间（给用户使用） POST /room/edit */
export async function editDiagramRoom(
    body: API.RoomEditRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseBoolean>("/room/edit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 根据 id 获取房间（封装类） GET /room/get/vo */
export async function getDiagramRoomVoById(
    // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
    params: API.getDiagramRoomVOByIdParams,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseRoomVO>("/room/get/vo", {
        method: "GET",
        params: {
            ...params,
        },
        ...(options || {}),
    })
}

/** 分页获取房间列表（仅管理员可用） POST /room/list/page */
export async function listDiagramRoomByPage(
    body: API.RoomQueryRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponsePageDiagramRoom>("/room/list/page", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 分页获取房间列表（封装类） POST /room/list/page/vo */
export async function listDiagramRoomVoByPage(
    body: API.RoomQueryRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponsePageRoomVO>("/room/list/page/vo", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 分页获取当前登录用户创建的房间列表 POST /room/my/list/page/vo */
export async function listMyDiagramRoomVoByPage(
    body: API.RoomQueryRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponsePageRoomVO>("/room/my/list/page/vo", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 更新房间信息（仅管理员可用） POST /room/update */
export async function updateDiagramRoom(
    body: API.RoomUpdateRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseBoolean>("/room/update", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}
