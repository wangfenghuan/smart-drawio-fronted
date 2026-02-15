
/* eslint-disable */
import request from "@/lib/request"

/** 创建素材 POST /material/add */
export async function addMaterial(
    body: API.MaterialAddRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseLong>("/material/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 删除素材 POST /material/delete */
export async function deleteMaterial(
    body: API.DeleteRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseBoolean>("/material/delete", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 根据 id 获取素材 GET /material/get */
export async function getMaterialById(
    // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
    params: API.getMaterialByIdParams,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseMaterial>("/material/get", {
        method: "GET",
        params: {
            ...params,
        },
        ...(options || {}),
    })
}

/** 根据 id 获取素材封装类 GET /material/get/vo */
export async function getMaterialVoById(
    // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
    params: API.getMaterialVOByIdParams,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseMaterialVO>("/material/get/vo", {
        method: "GET",
        params: {
            ...params,
        },
        ...(options || {}),
    })
}

/** 分页获取素材列表 POST /material/list/page */
export async function listMaterialByPage(
    body: API.MaterialQueryRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponsePageMaterial>("/material/list/page", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 分页获取素材封装列表 POST /material/list/page/vo */
export async function listMaterialVoByPage(
    body: API.MaterialQueryRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponsePageMaterialVO>("/material/list/page/vo", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}

/** 更新素材 POST /material/update */
export async function updateMaterial(
    body: API.MaterialUpdateRequest,
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseBoolean>("/material/update", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        data: body,
        ...(options || {}),
    })
}
