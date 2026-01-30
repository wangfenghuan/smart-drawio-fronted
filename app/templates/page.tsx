import TemplateSquare from "@/components/TemplateSquare"
import { Metadata } from "next"

export const metadata: Metadata = {
    title: "素材广场 | IntelliDraw",
    description: "浏览和使用由社区创建的高质量图表模板，包括流程图、思维导图、UML等。",
}

// Define the API Response Type matching the backend
interface BaseResponsePageMaterialVO {
    code: number
    data?: {
        records: API.MaterialVO[]
        total: string | number
        size: string | number
        current: string | number
    }
    message?: string
}

async function getMaterials(page = 1, pageSize = 12) {
    try {
        const res = await fetch("http://47.95.35.178:8081/api/material/list/page/vo", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                current: page,
                pageSize: pageSize,
                sortField: "createTime",
                sortOrder: "desc",
            }),
            next: { revalidate: 60 }, // Revalidate every 60 seconds
        })

        if (!res.ok) {
            return { records: [], total: 0, current: 1, size: 12 }
        }

        const json: BaseResponsePageMaterialVO = await res.json()
        if (json.code === 0 && json.data) {
            return {
                records: json.data.records || [],
                total: Number(json.data.total) || 0,
                current: Number(json.data.current) || 1,
                size: Number(json.data.size) || 12,
            }
        }
        return { records: [], total: 0, current: 1, size: 12 }
    } catch (e) {
        console.error("Server fetch materials error:", e)
        return { records: [], total: 0, current: 1, size: 12 }
    }
}

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Page({ searchParams }: Props) {
    const params = await searchParams;
    const page = Number(params?.page) || 1
    const { records, total, current, size } = await getMaterials(page)

    return (
        <TemplateSquare
            initialMaterials={records}
            initialPagination={{
                current,
                pageSize: size,
                total,
            }}
        />
    )
}
