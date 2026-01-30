"use client"

import { Link as LinkIcon, Check } from "lucide-react"
import { useState } from "react"
import { message } from "antd"

export function ShareButton({ title }: { title: string }) {
    const [copied, setCopied] = useState(false)

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href)
            setCopied(true)
            message.success("链接已复制到剪贴板")
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            message.error("复制失败，请手动复制浏览器地址")
        }
    }

    return (
        <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-4 px-6 rounded-xl border-2 border-slate-200 transition-all hover:border-slate-300"
        >
            {copied ? (
                <>
                    <Check className="w-5 h-5 text-green-500" />
                    已复制链接
                </>
            ) : (
                <>
                    <LinkIcon className="w-5 h-5" />
                    分享给朋友
                </>
            )}
        </button>
    )
}
