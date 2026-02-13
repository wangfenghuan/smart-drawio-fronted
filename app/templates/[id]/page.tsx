import { ActionType, PageContainer } from "@ant-design/pro-components"
import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, User, Clock } from "lucide-react"
import MaterialViewer from "@/components/MaterialViewer"
import { ShareButton } from "@/components/ShareButton"
import { TemplateDetailActions } from "@/components/TemplateDetailActions"
import { Tag } from "antd"

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
        const apiUrl =
            process.env.NODE_ENV === "development"
                ? "http://localhost:8081/api"
                : "http://47.95.35.178:8081/api"
        const res = await fetch(`${apiUrl}/material/get/vo?id=${id}`, {
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
    } catch (_e) {
        if (material.tags) tags = [material.tags]
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 relative overflow-hidden">
             {/* Background decorative elements */}
             <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none" />
             <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30 pointer-events-none" />
             <div className="absolute top-48 -left-24 w-72 h-72 bg-indigo-100 rounded-full blur-3xl opacity-30 pointer-events-none" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
                <div className="mb-8">
                    <Link href="/templates" className="inline-flex items-center text-slate-500 hover:text-slate-900 transition-colors group">
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center mr-3 group-hover:border-slate-300 shadow-sm transition-all">
                             <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                        </div>
                        <span className="font-medium">返回模板库</span>
                    </Link>
                </div>

                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col md:flex-row">
                    {/* Left: Preview Image */}
                    <div className="md:w-7/12 lg:w-2/3 bg-slate-100 relative group overflow-hidden border-b md:border-b-0 md:border-r border-slate-100 min-h-[250px] md:min-h-[350px] flex items-center justify-center">
                         {/* Dot Grid Pattern Background */}
                         <div className="absolute inset-0 opacity-[0.4]" 
                              style={{ 
                                  backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', 
                                  backgroundSize: '20px 20px' 
                              }} 
                         />
                         
                         <div className="relative z-10 w-full h-full p-8 flex items-center justify-center">
                             {material.pictureUrl || material.svgUrl ? (
                                // biome-ignore lint/performance/noImgElement: External image URL
                                <img
                                    src={material.pictureUrl || material.svgUrl}
                                    alt={material.name}
                                    className="max-w-full max-h-full object-contain shadow-2xl rounded-lg bg-white transition-transform duration-500 group-hover:scale-[1.02]"
                                />
                             ) : material.diagramCode ? (
                                <div className="w-full h-full shadow-2xl rounded-lg bg-white overflow-hidden p-2 transition-transform duration-500 group-hover:scale-[1.02]">
                                     <MaterialViewer 
                                        xml={material.diagramCode}
                                        className="w-full h-full scale-100"
                                        style={{ width: "100%", height: "100%" }}
                                     />
                                </div>
                             ) : (
                                <div className="w-full aspect-video bg-white shadow-sm rounded-lg flex items-center justify-center text-slate-400">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <span className="text-2xl">🖼️</span>
                                        </div>
                                        暂无预览图片
                                    </div>
                                </div>
                             )}
                         </div>
                    </div>

                    {/* Right: Info */}
                    <div className="md:w-5/12 lg:w-1/3 p-8 lg:p-10 flex flex-col bg-white">
                        <div className="mb-auto">
                            <div className="flex flex-wrap gap-2 mb-6">
                                {tags.length > 0 ? tags.map((tag, i) => (
                                    <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                        {tag}
                                    </span>
                                )) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-500 border border-slate-100">
                                        未分类
                                    </span>
                                )}
                            </div>

                            <h1 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight">
                                {material.name || "未命名模板"}
                            </h1>
                            
                            <div className="flex items-center gap-3 mb-8 pb-8 border-b border-slate-100">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 p-[2px]">
                                    <div className="h-full w-full rounded-full bg-white overflow-hidden">
                                        {material.userVO?.userAvatar ? (
                                            <img src={material.userVO.userAvatar} alt={material.userVO.userName} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                <User className="w-5 h-5" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-slate-900">
                                        {material.userVO?.userName || "未知用户"}
                                    </div>
                                    <div className="text-xs text-slate-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        <span>发布于 {material.createTime ? new Date(material.createTime).toLocaleDateString() : '未知'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="prose prose-slate prose-sm text-slate-600 mb-8">
                                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-2">简介</h3>
                                <p className="leading-relaxed">
                                    {material.description || "暂无描述，作者很懒什么都没写~"}
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 space-y-4">
                            <TemplateDetailActions material={material} />
                            <div className="pt-4 border-t border-slate-50">
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
