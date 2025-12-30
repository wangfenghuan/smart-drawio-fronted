"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export type DownloadFormat = "xml" | "png" | "svg"

const FORMAT_OPTIONS: {
    value: DownloadFormat
    label: string
    extension: string
}[] = [
    { value: "xml", label: "Draw.io XML (.drawio)", extension: ".drawio" },
    { value: "png", label: "PNG 图片 (.png)", extension: ".png" },
    { value: "svg", label: "SVG 矢量图 (.svg)", extension: ".svg" },
]

interface DownloadDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onDownload: (format: DownloadFormat) => void
    defaultFilename: string
    isLoading?: boolean
}

export function DownloadDialog({
    open,
    onOpenChange,
    onDownload,
    defaultFilename,
    isLoading = false,
}: DownloadDialogProps) {
    const [format, setFormat] = useState<DownloadFormat>("png")

    const handleDownload = () => {
        onDownload(format)
        onOpenChange(false)
    }

    const currentFormat = FORMAT_OPTIONS.find((f) => f.value === format)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>下载图表</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* 文件名预览 */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">文件名</label>
                        <div className="px-3 py-2 rounded-md border bg-muted text-sm">
                            {defaultFilename}
                            {currentFormat?.extension || ".png"}
                        </div>
                    </div>

                    {/* 格式选择 */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">下载格式</label>
                        <Select
                            value={format}
                            onValueChange={(v) =>
                                setFormat(v as DownloadFormat)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {FORMAT_OPTIONS.map((opt) => (
                                    <SelectItem
                                        key={opt.value}
                                        value={opt.value}
                                    >
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            {format === "xml" &&
                                "下载 Draw.io 可编辑的 XML 文件"}
                            {format === "png" && "下载高清 PNG 位图"}
                            {format === "svg" && "下载可缩放的 SVG 矢量图"}
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        取消
                    </Button>
                    <Button onClick={handleDownload} disabled={isLoading}>
                        {isLoading ? "下载中..." : "下载"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
