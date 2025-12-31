/* eslint-disable */
import request from "@/lib/request"

/** 此处后端没有提供注释 POST /file/upload */
export async function uploadFile(
    // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
    params: API.uploadFileParams,
    // biome-ignore lint/complexity/noBannedTypes: 自动生成的 API 类型
    body: {},
    options?: { [key: string]: any },
) {
    return request<API.BaseResponseString>("/file/upload", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        params: {
            ...params,
            uploadFileRequest: undefined,
            ...params.uploadFileRequest,
        },
        data: body,
        ...(options || {}),
    })
}
