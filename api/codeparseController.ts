/* eslint-disable */
import request from "@/lib/request"

/** Upload and Analyze (Architecture Only) POST /codeparse/springboot/upload/simple */
export async function uploadAndAnalyzeSimple(
    body: {},
    file: File,
    options?: { [key: string]: any },
) {
    const formData = new FormData()
    formData.append("file", file)
    
    // 注意：不要手动设置 Content-Type，让浏览器自动添加 multipart/form-data; boundary=...
    return request<API.BaseResponseSimplifiedProjectDTO>("/codeparse/springboot/upload/simple", {
        method: "POST",
        data: formData,
        ...(options || {}),
    })
}

/** Parse SQL DDL POST /codeparse/parse/sql */
export async function parseSql(
    body: {},
    file: File,
    options?: { [key: string]: any },
) {
    const formData = new FormData()
    formData.append("file", file)

    // 注意：不要手动设置 Content-Type，让浏览器自动添加 multipart/form-data; boundary=...
    return request<API.BaseResponseListSqlParseResultDTO>("/codeparse/parse/sql", {
        method: "POST",
        data: formData,
        ...(options || {}),
    })
}
