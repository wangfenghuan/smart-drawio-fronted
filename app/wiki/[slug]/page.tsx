import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getWikiBySlug, wikiArticles } from "@/lib/wiki-data"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Calendar, User, Tag, ArrowRight } from "lucide-react"

type Props = {
    params: Promise<{
        slug: string
    }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const article = getWikiBySlug(slug)

    if (!article) {
        return {
            title: "Article Not Found",
        }
    }

    return {
        title: article.title,
        description: article.description,
        openGraph: {
            title: article.title,
            description: article.description,
            type: "article",
            url: `/wiki/${slug}`,
        },
    }
}

export async function generateStaticParams() {
    return Object.keys(wikiArticles).map((slug) => ({
        slug,
    }))
}

export default async function WikiPage({ params }: Props) {
    const { slug } = await params;
    const article = getWikiBySlug(slug)

    if (!article) {
        notFound()
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: article.title,
        description: article.description,
        author: {
            "@type": "Organization",
            name: "IntelliDraw Team",
        },
        publisher: {
            "@type": "Organization",
            name: "IntelliDraw",
            logo: {
                "@type": "ImageObject",
                url: "http://47.95.35.178/logo.png", // Replace with real logo
            },
        },
        datePublished: "2024-01-01T08:00:00+08:00", // Should be dynamic
    }

    return (
        <div className="min-h-screen bg-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
                <header className="mb-10 text-center">
                    <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mb-4">
                        <span className="flex items-center gap-1">
                            <Tag className="w-4 h-4" />
                            {article.category}
                        </span>
                        <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            IntelliDraw Team
                        </span>
                        <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            2024-01-01
                        </span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-6 leading-tight">
                        {article.title}
                    </h1>
                </header>

                <div className="prose prose-lg prose-blue mx-auto">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {article.content}
                    </ReactMarkdown>
                </div>

                {/* Related CTA */}
                <div className="mt-16 p-8 bg-blue-50 rounded-2xl border border-blue-100 text-center">
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">
                        准备好实践了吗？
                    </h3>
                    <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
                        IntelliDraw 提供了文中提到的所有图表工具。现在就开始，释放你的创意。
                    </p>
                    <Link href="/diagram/new">
                        <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all shadow-md hover:shadow-lg">
                            立即创建 {article.category}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </Link>
                </div>
            </article>
        </div>
    )
}
