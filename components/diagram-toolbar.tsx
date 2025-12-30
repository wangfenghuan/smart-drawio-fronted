"use client"

import { Download, Save, Upload } from "lucide-react"
import { useState } from "react"
import { DownloadDialog } from "@/components/download-dialog"
import { type ExportFormat, SaveDialog } from "@/components/save-dialog"
import { Button } from "@/components/ui/button"

interface DiagramToolbarProps {
    diagramId: number
    title: string
    xml: string
    onSave: () => Promise<boolean>
}

export function DiagramToolbar({
    diagramId,
    title,
    xml,
    onSave,
}: DiagramToolbarProps) {
    const [saveDialogOpen, setSaveDialogOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // 处理保存
    const handleSave = async () => {
        setIsSaving(true)
        try {
            await onSave()
        } finally {
            setIsSaving(false)
        }
    }

    // 处理保存对话框确认
    const handleSaveConfirm = async (
        filename: string,
        format: ExportFormat,
    ) => {
        // 这里我们只使用文件名，格式由后端统一生成 PNG 和 SVG
        setIsSaving(true)
        try {
            await onSave()
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <>
            <div className="flex items-center gap-4">
                {/* 保存按钮 */}
                <Button
                    size="default"
                    variant="outline"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="gap-2 h-10 px-6 bg-white/95 hover:bg-white text-gray-800 border-gray-300 hover:border-gray-400 shadow-md font-medium"
                >
                    <Save className="h-5 w-5" />
                    {isSaving ? "保存中..." : "保存"}
                </Button>
            </div>

            {/* 保存对话框 - 复用现有组件 */}
            <SaveDialog
                open={saveDialogOpen}
                onOpenChange={setSaveDialogOpen}
                onSave={handleSaveConfirm}
                defaultFilename={title}
            />
        </>
    )
}
