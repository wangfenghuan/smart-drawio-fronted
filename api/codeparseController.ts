/* eslint-disable */
import request from "@/lib/request"

/** Upload and Analyze (Architecture Only) POST /codeparse/upload/simple */
export async function uploadAndAnalyzeSimple(
    body: {},
    file: File,
    options?: { [key: string]: any },
) {
    const formData = new FormData()
    formData.append("file", file)
    
    return request<API.BaseResponseSimplifiedProjectDTO>("/codeparse/upload/simple", {
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data",
        },
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

    return request<API.BaseResponseListSqlParseResultDTO>("/codeparse/parse/sql", {
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data",
        },
        data: formData,
        ...(options || {}),
    })
}
