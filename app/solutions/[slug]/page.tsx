import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getSolutionBySlug, solutions } from "@/lib/seo-data"
import { Button } from "antd"
import Link from "next/link"
import { CheckCircle, ArrowRight } from "lucide-react"

type Props = {
    params: Promise<{
        slug: string
    }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const solution = getSolutionBySlug(slug)

    if (!solution) {
        return {
            title: "Solution Not Found",
        }
    }

    return {
        title: solution.title,
        description: solution.description,
        keywords: solution.keywords,
        alternates: {
            canonical: `/solutions/${slug}`,
        },
        openGraph: {
            title: solution.title,
            description: solution.description,
            url: `/solutions/${slug}`,
        },
    }
}

export async function generateStaticParams() {
    return Object.keys(solutions).map((slug) => ({
        slug,
    }))
}

export default async function SolutionPage({ params }: Props) {
    const { slug } = await params;
    const solution = getSolutionBySlug(slug)

    if (!solution) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <section className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
                    <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl md:text-6xl mb-6">
                        {solution.heroTitle}
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-600 mb-10">
                        {solution.heroSubtitle}
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link href="/diagram/new">
                            <Button type="primary" size="large" className="h-12 px-8 text-lg">
                                立即免费开始
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900">核心功能</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {solution.features.map((feature, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <h3 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="bg-white py-20 border-t border-gray-100">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900">常见问题</h2>
                    </div>
                    <div className="space-y-8">
                        {solution.faq.map((item, idx) => (
                            <div key={idx} className="bg-slate-50 p-6 rounded-xl">
                                <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-start">
                                    <span className="text-blue-600 mr-2">Q:</span>
                                    {item.question}
                                </h3>
                                <p className="text-slate-600 ml-6">
                                    {item.answer}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-blue-600 py-20">
                <div className="max-w-4xl mx-auto px-4 text-center text-white">
                    <h2 className="text-3xl font-bold mb-6">准备好开始绘图了吗？</h2>
                    <p className="text-blue-100 text-lg mb-10">
                        加入全球数百万用户的选择，使用 IntelliDraw 释放你的创意。
                    </p>
                    <Link href="/diagram/new">
                        <button className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-4 px-10 rounded-lg transition-colors text-lg shadow-lg">
                            免费创建图表
                        </button>
                    </Link>
                </div>
            </section>
        </div>
    )
}
