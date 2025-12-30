"use client"

import { Settings } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export interface AIConfig {
    mode: "system" | "custom"
    // 自定义模式配置
    modelId?: string
    baseUrl?: string
    apiKey?: string
}

interface AIConfigDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    config: AIConfig
    onConfigChange: (config: AIConfig) => void
}

// 预设的常见模型配置
const PRESET_MODELS = [
    {
        id: "gpt-4",
        name: "GPT-4",
        baseUrl: "https://api.openai.com/v1",
    },
    {
        id: "gpt-4o",
        name: "GPT-4o",
        baseUrl: "https://api.openai.com/v1",
    },
    {
        id: "gpt-4o-mini",
        name: "GPT-4o Mini",
        baseUrl: "https://api.openai.com/v1",
    },
    {
        id: "claude-3-5-sonnet-20241022",
        name: "Claude 3.5 Sonnet",
        baseUrl: "https://api.anthropic.com/v1",
    },
    {
        id: "claude-3-5-haiku-20241022",
        name: "Claude 3.5 Haiku",
        baseUrl: "https://api.anthropic.com/v1",
    },
]

export function AIConfigDialog({
    open,
    onOpenChange,
    config,
    onConfigChange,
}: AIConfigDialogProps) {
    const [localConfig, setLocalConfig] = useState<AIConfig>(config)

    useEffect(() => {
        setLocalConfig(config)
    }, [config])

    const handleSave = () => {
        onConfigChange(localConfig)
        // 保存到 localStorage
        localStorage.setItem("ai-config", JSON.stringify(localConfig))
        onOpenChange(false)
    }

    const handleModeChange = (useCustom: boolean) => {
        setLocalConfig({
            ...localConfig,
            mode: useCustom ? "custom" : "system",
        })
    }

    const handlePresetModelChange = (modelId: string) => {
        const preset = PRESET_MODELS.find((m) => m.id === modelId)
        if (preset) {
            setLocalConfig({
                ...localConfig,
                modelId: preset.id,
                baseUrl: preset.baseUrl,
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        AI 模型配置
                    </DialogTitle>
                    <DialogDescription>
                        选择使用系统默认AI或自定义大模型
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* 模式选择 */}
                    <div className="flex items-center justify-between space-x-2">
                        <Label
                            htmlFor="mode-switch"
                            className="flex flex-col space-y-1"
                        >
                            <span>使用自定义大模型</span>
                            <span className="font-normal text-sm text-muted-foreground">
                                开启后可以使用自己的 API Key
                            </span>
                        </Label>
                        <Switch
                            id="mode-switch"
                            checked={localConfig.mode === "custom"}
                            onCheckedChange={handleModeChange}
                        />
                    </div>

                    {localConfig.mode === "custom" && (
                        <>
                            {/* 预设模型选择 */}
                            <div className="space-y-2">
                                <Label htmlFor="preset-model">预设模型</Label>
                                <Select
                                    value={localConfig.modelId}
                                    onValueChange={handlePresetModelChange}
                                >
                                    <SelectTrigger id="preset-model">
                                        <SelectValue placeholder="选择预设模型" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PRESET_MODELS.map((model) => (
                                            <SelectItem
                                                key={model.id}
                                                value={model.id}
                                            >
                                                {model.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* 模型ID */}
                            <div className="space-y-2">
                                <Label htmlFor="model-id">
                                    模型名称{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="model-id"
                                    placeholder="例如: gpt-4, claude-3-5-sonnet-20241022"
                                    value={localConfig.modelId || ""}
                                    onChange={(e) =>
                                        setLocalConfig({
                                            ...localConfig,
                                            modelId: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            {/* Base URL */}
                            <div className="space-y-2">
                                <Label htmlFor="base-url">
                                    API 接口地址{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="base-url"
                                    placeholder="例如: https://api.openai.com/v1"
                                    value={localConfig.baseUrl || ""}
                                    onChange={(e) =>
                                        setLocalConfig({
                                            ...localConfig,
                                            baseUrl: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            {/* API Key */}
                            <div className="space-y-2">
                                <Label htmlFor="api-key">
                                    API 密钥{" "}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="api-key"
                                    type="password"
                                    placeholder="sk-..."
                                    value={localConfig.apiKey || ""}
                                    onChange={(e) =>
                                        setLocalConfig({
                                            ...localConfig,
                                            apiKey: e.target.value,
                                        })
                                    }
                                />
                                <p className="text-xs text-muted-foreground">
                                    您的 API Key
                                    将仅存储在本地浏览器中，不会上传到服务器
                                </p>
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        取消
                    </Button>
                    <Button onClick={handleSave}>保存配置</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// 从 localStorage 加载配置的 Hook
export function useAIConfig(): [AIConfig, (config: AIConfig) => void] {
    const [config, setConfig] = useState<AIConfig>({
        mode: "system",
    })

    useEffect(() => {
        const saved = localStorage.getItem("ai-config")
        if (saved) {
            try {
                setConfig(JSON.parse(saved))
            } catch (err) {
                console.error("Failed to parse AI config:", err)
            }
        }
    }, [])

    const updateConfig = (newConfig: AIConfig) => {
        setConfig(newConfig)
        localStorage.setItem("ai-config", JSON.stringify(newConfig))
    }

    return [config, updateConfig]
}
