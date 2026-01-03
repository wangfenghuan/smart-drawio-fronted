/**
 * 协作面板组件
 *
 * 功能：
 * 1. 显示协作状态（连接状态、在线用户数）
 * 2. 一键开启/停止协作
 * 3. 选择权限模式（读写/只读）
 *
 * 逻辑：
 * - 每个图表只能有一个房间
 * - 开启协作时，后端自动创建或返回已有房间ID
 * - 多个用户编辑同一图表时，自动加入同一个房间
 */

"use client"

import { Lock, Unlock, Users, Wifi, WifiOff } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { addRoom } from "@/api/roomController"
import { Button } from "@/components/ui/button"
import { useDiagram } from "@/contexts/diagram-context"

export function CollaborationPanel() {
    const { id: diagramId } = useParams()
    const router = useRouter()
    const {
        collaborationEnabled,
        collaborationConnected,
        collaborationUserCount,
        toggleCollaboration,
    } = useDiagram()

    const [roomId, setRoomId] = useState<string>("")
    const [isReadOnly, setIsReadOnly] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const [isStarting, setIsStarting] = useState(false)

    const handleStartCollaboration = async () => {
        if (!diagramId) {
            toast.error("图表 ID 不存在")
            return
        }

        setIsStarting(true)
        try {
            // 调用后端 API 获取或创建房间（后端会自动判断是创建还是返回已有房间）
            const response = await addRoom({
                roomName: `协作房间_${diagramId}`,
                diagramId: diagramId as string, // 直接使用字符串，避免精度丢失
            })

            if (response?.code === 0 && response?.data) {
                const returnedRoomId = String(response.data)
                setRoomId(returnedRoomId)

                // 跳转到协作路由：/diagram/edit/[id]/room/[roomId]
                router.push(`/diagram/edit/${diagramId}/room/${returnedRoomId}`)

                toast.success("协作已开启，可以邀请他人加入")
            } else {
                toast.error(
                    "开启协作失败: " + (response?.message || "未知错误"),
                )
            }
        } catch (error) {
            console.error("开启协作失败:", error)
            toast.error("开启协作失败，请稍后重试")
        } finally {
            setIsStarting(false)
        }
    }

    const handleStopCollaboration = () => {
        toggleCollaboration(false)

        // 跳回个人编辑路由
        if (diagramId) {
            router.push(`/diagram/edit/${diagramId}`)
        }

        toast.info("已停止协作")
    }

    return (
        <div className="relative">
            {/* 协作按钮 */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className={`relative p-3 rounded-xl transition-all duration-200 hover:scale-105 ${
                    collaborationEnabled
                        ? "bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30"
                        : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10"
                }`}
                title={
                    collaborationEnabled
                        ? `协作中 (${collaborationUserCount}人在线)`
                        : "开启协作"
                }
            >
                <Users className="h-6 w-6" />
                {collaborationEnabled && collaborationConnected && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                )}
            </Button>

            {/* 设置面板 - 未开启协作时 */}
            {showSettings && !collaborationEnabled && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-slate-800 rounded-lg shadow-xl border border-white/10 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <h3 className="text-sm font-semibold text-white mb-3">
                        开启实时协作
                    </h3>

                    <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-xs text-blue-300 mb-2">
                            💡 开启协作后，其他用户可以通过房间 ID 加入
                        </p>
                        <p className="text-xs text-gray-400">
                            • 每个图表只能有一个协作房间
                            <br />• 开启后自动创建或加入已有房间
                            <br />• 多人可同时编辑，实时同步
                        </p>
                    </div>

                    {/* 权限模式 */}
                    <div className="mb-4">
                        <label className="block text-xs text-gray-400 mb-1.5">
                            选择权限模式
                        </label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setIsReadOnly(false)}
                                className={`flex-1 px-3 py-2 text-xs rounded-lg border transition-colors ${
                                    !isReadOnly
                                        ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                        : "bg-white/5 text-gray-400 border-white/10"
                                }`}
                            >
                                <div className="flex items-center justify-center gap-1.5">
                                    <Unlock className="h-3.5 w-3.5" />
                                    <span>可编辑</span>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsReadOnly(true)}
                                className={`flex-1 px-3 py-2 text-xs rounded-lg border transition-colors ${
                                    isReadOnly
                                        ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                        : "bg-white/5 text-gray-400 border-white/10"
                                }`}
                            >
                                <div className="flex items-center justify-center gap-1.5">
                                    <Lock className="h-3.5 w-3.5" />
                                    <span>只读</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* 开启协作按钮 */}
                    <Button
                        onClick={handleStartCollaboration}
                        disabled={isStarting}
                        className="w-full"
                    >
                        {isStarting ? "开启中..." : "开启协作"}
                    </Button>
                </div>
            )}

            {/* 协作中的控制面板 */}
            {showSettings && collaborationEnabled && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-slate-800 rounded-lg shadow-xl border border-white/10 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <h3 className="text-sm font-semibold text-white mb-3">
                        协作进行中
                    </h3>

                    {/* 连接状态 */}
                    <div className="mb-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            {collaborationConnected ? (
                                <>
                                    <Wifi className="h-4 w-4 text-green-400" />
                                    <span className="text-xs text-green-300">
                                        已连接
                                    </span>
                                </>
                            ) : (
                                <>
                                    <WifiOff className="h-4 w-4 text-yellow-400" />
                                    <span className="text-xs text-yellow-300">
                                        连接中...
                                    </span>
                                </>
                            )}
                        </div>
                        <p className="text-xs text-gray-400">
                            房间 ID:{" "}
                            <span className="font-mono font-bold text-white">
                                {roomId}
                            </span>
                        </p>
                    </div>

                    {/* 在线用户 */}
                    <div className="mb-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-400" />
                            <p className="text-xs text-gray-400">
                                在线:{" "}
                                <span className="text-white font-semibold">
                                    {collaborationUserCount}
                                </span>{" "}
                                人
                            </p>
                        </div>
                    </div>

                    {/* 权限模式 */}
                    <div className="mb-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                        <div className="flex items-center gap-2">
                            {isReadOnly ? (
                                <>
                                    <Lock className="h-4 w-4 text-purple-400" />
                                    <span className="text-xs text-gray-400">
                                        只读模式
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Unlock className="h-4 w-4 text-purple-400" />
                                    <span className="text-xs text-gray-400">
                                        可编辑模式
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* 分享提示 */}
                    <div className="mb-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <p className="text-xs text-yellow-300">
                            💡 分享房间 ID 给其他人以加入协作
                        </p>
                    </div>

                    {/* 停止协作按钮 */}
                    <Button
                        onClick={handleStopCollaboration}
                        variant="destructive"
                        className="w-full"
                    >
                        停止协作
                    </Button>
                </div>
            )}
        </div>
    )
}
