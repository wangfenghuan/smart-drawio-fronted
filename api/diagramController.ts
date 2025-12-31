/* eslint-disable */
import request from "@/lib/request"

/** 创建图表 POST /diagram/add */
export async function addDiagram(
    body: API.DiagramAddRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseLong>("/diagram/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 检查是否有上传权限，抢锁，用于决定：抢到锁的客户端进行图表操作快照的上传 GET /diagram/check-lock/${param0} */
export async function checkLock(
    // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
    params: API.checkLockParams,
    options?: { [key: string]: any },
) {
    const { roomId: param0, ...queryParams } = params
    return request<boolean>(`/diagram/check-lock/${param0}`, {
        method: "GET",
        params: { ...queryParams },
        ...(options || {}),
    })
}

/** 删除图表 POST /diagram/delete */
export async function deleteDiagram(
    body: API.DeleteRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseBoolean>("/diagram/delete", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 编辑图表信息（给用户使用） POST /diagram/edit */
export async function editDiagram(
    body: API.DiagramEditRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseBoolean>("/diagram/edit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 根据 id 获取图表（封装类） GET /diagram/get/vo */
export async function getDiagramVoById(
    // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
    params: API.getDiagramVOByIdParams,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseDiagramVO>("/diagram/get/vo", {
        method: "GET",
        params: {
            ...params,
        },
        ...(options || {}),
    })
}

/** 分页获取图表列表（仅管理员可用）） POST /diagram/list/page */
export async function listDiagramByPage(
    body: API.DiagramQueryRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponsePageDiagram>("/diagram/list/page", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 分页获取图表列表（封装类）） POST /diagram/list/page/vo */
export async function listDiagramVoByPage(
    body: API.DiagramQueryRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponsePageDiagramVO>("/diagram/list/page/vo", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 分页获取当前登录用户创建的图表列表 POST /diagram/my/list/page/vo */
export async function listMyDiagramVoByPage(
    body: API.DiagramQueryRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponsePageDiagramVO>("/diagram/my/list/page/vo", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 流式代理下载接口， 根据type。有SVG，PNG和XML格式 GET /diagram/stream-download */
export async function downloadRemoteFile(
    // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
    params: API.downloadRemoteFileParams,
    options?: { [key: string]: any },
) {
    return request<any>("/diagram/stream-download", {
        method: "GET",
        params: {
            ...params,
        },
        ...(options || {}),
    })
}

/** 更新图表（仅管理员admin可用） POST /diagram/update */
export async function updateDiagram(
    body: API.DiagramUpdateRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseBoolean>("/diagram/update", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 上传图表到minio POST /diagram/upload */
export async function uploadDiagram(
    body: {
        diagramUploadRequest?: API.DiagramUploadRequest
    },
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseString>("/diagram/upload", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 上传图表快照 POST /diagram/uploadSnapshot/${param0} */
export async function uploadSnapshot(
    // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
    params: API.uploadSnapshotParams,
    body: string,
    options?: { [key: string]: any },
) {
    const { roomId: param0, ...queryParams } = params
    return request<API.BaseResponseBoolean>(
        `/diagram/uploadSnapshot/${param0}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            params: { ...queryParams },
            data: body,
            ...(options || {}),
        },
    )
}
