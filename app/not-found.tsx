import Link from "next/link"
import { Button } from "antd"
import { Home, Search, FileQuestion } from "lucide-react"

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
            <div className="text-center max-w-xl">
                <div className="mb-8 flex justify-center">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <FileQuestion size={48} />
                    </div>
                </div>
                
                <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
                    页面未找到 (404)
                </h1>
                
                <p className="text-lg text-slate-600 mb-8">
                    抱歉，您访问的页面似乎迷路了。可能它被移动了，或者从未存在过。
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                    <Link href="/">
                        <Button type="primary" size="large" icon={<Home size={18} />} className="w-full h-12">
                            返回首页
                        </Button>
                    </Link>
                    <Link href="/solutions/uml-diagram">
                        <Button size="large" icon={<Search size={18} />} className="w-full h-12">
                            浏览绘图工具
                        </Button>
                    </Link>
                </div>

                <div className="border-t border-gray-200 pt-8">
                    <p className="text-sm text-slate-500 mb-4">您可能在寻找：</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <Link href="/solutions/uml-diagram" className="px-4 py-2 bg-white border border-gray-200 rounded-full text-slate-600 hover:text-blue-600 hover:border-blue-600 transition-colors text-sm">
                            UML 类图
                        </Link>
                        <Link href="/solutions/flowchart" className="px-4 py-2 bg-white border border-gray-200 rounded-full text-slate-600 hover:text-blue-600 hover:border-blue-600 transition-colors text-sm">
                            流程图
                        </Link>
                        <Link href="/wiki/what-is-uml-diagram" className="px-4 py-2 bg-white border border-gray-200 rounded-full text-slate-600 hover:text-blue-600 hover:border-blue-600 transition-colors text-sm">
                            什么是 UML?
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
