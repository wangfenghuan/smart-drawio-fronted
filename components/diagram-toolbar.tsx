"use client"

import { useState } from "react"
import { type ExportFormat, SaveDialog } from "@/components/save-dialog"

interface DiagramToolbarProps {
    diagramId: string
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
    const [_isSaving, setIsSaving] = useState(false)

    // 处理保存对话框确认
    const handleSaveConfirm = async (
        _filename: string,
        _format: ExportFormat,
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
                {/* 保存按钮已移除，请使用聊天面板中的保存按钮 */}
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
