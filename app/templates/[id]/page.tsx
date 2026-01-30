import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Rocket, User, Tag as TagIcon, Clock } from "lucide-react"
import MaterialViewer from "@/components/MaterialViewer"
import { ShareButton } from "@/components/ShareButton"

// Define the API Response Type
interface BaseResponseMaterialVO {
    code?: number
    data?: MaterialVO
    message?: string
}

interface MaterialVO {
    id?: string
    name?: string
    description?: string
    pictureUrl?: string
    svgUrl?: string
    tags?: string
    userId?: string
    createTime?: string
    updateTime?: string
    diagramCode?: string
    userVO?: {
        userName?: string
        userAvatar?: string
    }
}

async function getMaterial(id: string): Promise<MaterialVO | null> {
    try {
        const res = await fetch(`http://47.95.35.178:8081/api/material/get/vo?id=${id}`, {
            next: { revalidate: 60 }, // Revalidate every 60 seconds
        })
        
        if (!res.ok) return null
        
        const json: BaseResponseMaterialVO = await res.json()
        if (json.code === 0 && json.data) {
            return json.data
        }
        return null
    } catch (e) {
        console.error("Fetch material error:", e)
        return null
    }
}

type Props = {
    params: Promise<{
        id: string
    }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const material = await getMaterial(id)

    if (!material) return { title: "模板未找到 | IntelliDraw" }

    return {
        title: `${material.name || "未命名模板"} - 免费在线编辑 | IntelliDraw`,
        description: material.description || "使用 IntelliDraw 在线编辑此模板。",
        openGraph: {
            title: material.name,
            description: material.description,
            images: material.pictureUrl ? [material.pictureUrl] : [],
        }
    }
}

export default async function TemplatePage({ params }: Props) {
    const { id } = await params;
    const material = await getMaterial(id)

    if (!material) notFound()

    // Parse tags
    let tags: string[] = []
    try {
        if (material.tags) {
            tags = JSON.parse(material.tags)
            if (!Array.isArray(tags)) tags = [material.tags]
        }
    } catch (e) {
        if (material.tags) tags = [material.tags]
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
                <div className="mb-8">
                    <Link href="/templates" className="text-slate-500 hover:text-slate-900 flex items-center gap-2 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        返回模板库
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-3">
                        {/* Left: Preview Image */}
                        <div className="md:col-span-2 bg-slate-100 p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 h-[500px]">
                             {material.pictureUrl || material.svgUrl ? (
                                <img
                                    src={material.pictureUrl || material.svgUrl}
                                    alt={material.name}
                                    className="max-w-full max-h-full object-contain shadow-lg rounded-lg bg-white"
                                />
                             ) : material.diagramCode ? (
                                <div className="w-full h-full shadow-lg rounded-lg bg-white overflow-hidden p-2">
                                     <MaterialViewer 
                                        xml={material.diagramCode}
                                        className="w-full h-full scale-100"
                                        style={{ width: "100%", height: "100%" }}
                                     />
                                </div>
                             ) : (
                                <div className="w-full aspect-video bg-white shadow-sm rounded-lg flex items-center justify-center text-slate-400">
                                    暂无预览图片
                                </div>
                             )}
                        </div>

                        {/* Right: Info */}
                        <div className="p-8 flex flex-col">
                            <div className="mb-auto">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {tags.map((tag, i) => (
                                        <span key={i} className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <h1 className="text-2xl font-bold text-slate-900 mb-4">
                                    {material.name || "未命名模板"}
                                </h1>
                                <p className="text-slate-600 mb-8 leading-relaxed">
                                    {material.description || "暂无描述"}
                                </p>
                                
                                <div className="space-y-3 pt-6 border-t border-gray-100 text-sm text-slate-500">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        <span>作者: {material.userVO?.userName || "未知用户"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        <span>时间: {material.createTime ? new Date(material.createTime).toLocaleDateString() : '未知'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 space-y-4">
                                <Link href={`/diagram/new?template=${material.id}`} className="block">
                                    <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                                        <Rocket className="w-5 h-5" />
                                        立即使用此模板
                                    </button>
                                </Link>
                                <ShareButton title={material.name || "IntelliDraw 模板"} />
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Related or JSON-LD */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "ImageObject",
                            contentUrl: material.pictureUrl || material.svgUrl || "",
                            creator: {
                                "@type": "Person",
                                name: material.userVO?.userName || "Unknown"
                            },
                            name: material.name,
                            description: material.description
                        })
                    }}
                />
            </div>
        </div>
    )
}
