"use client"

import { Button, Modal } from "antd"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { listAnnouncementVoByPage } from "@/api/announcementController"
import type { RootState } from "@/stores"

export const GlobalAnnouncementPopup = () => {
    const [visible, setVisible] = useState(false)
    const [announcement, setAnnouncement] = useState<API.AnnouncementVO | null>(
        null,
    )
    const loginUser = useSelector((state: RootState) => state.loginUser)

    useEffect(() => {
        // Only fetch and show announcements if user is logged in
        if (!loginUser || !loginUser.id) {
            return
        }

        const fetchAnnouncement = async () => {
            try {
                // Fetch the highest priority announcement (priority > 0)
                const res = await listAnnouncementVoByPage({
                    current: 1,
                    pageSize: 1,
                    sortField: "priority",
                    sortOrder: "descend",
                })

                // @ts-expect-error
                if (res.code === 0 && res.data?.records?.length > 0) {
                    // @ts-expect-error
                    const topAnnouncement = res.data.records[0]

                    // Check if it's a high priority announcement (priority > 0)
                    if ((topAnnouncement.priority || 0) > 0) {
                        const seenKey = `announcement_seen_${topAnnouncement.id}`
                        const hasSeen = localStorage.getItem(seenKey)

                        if (!hasSeen) {
                            setAnnouncement(topAnnouncement)
                            setVisible(true)
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch announcements", error)
            }
        }

        fetchAnnouncement()
    }, [loginUser])

    const handleClose = () => {
        if (announcement?.id) {
            localStorage.setItem(`announcement_seen_${announcement.id}`, "true")
        }
        setVisible(false)
    }

    if (!announcement) {
        return null
    }

    return (
        <Modal
            title={
                <div style={{ fontSize: "16px", fontWeight: "bold" }}>
                    系统公告
                </div>
            }
            open={visible}
            onCancel={handleClose}
            footer={[
                <Button key="close" type="primary" onClick={handleClose}>
                    我知道了
                </Button>,
            ]}
            centered
            maskClosable={false}
        >
            <div
                style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    marginBottom: "16px",
                    textAlign: "center",
                    color: "#1f1f1f",
                }}
            >
                {announcement.title}
            </div>
            <div
                style={{
                    whiteSpace: "pre-wrap",
                    maxHeight: "60vh",
                    overflowY: "auto",
                    fontSize: "14px",
                    lineHeight: "1.6",
                    marginTop: "12px",
                    marginBottom: "12px",
                }}
            >
                {announcement.content}
            </div>
            <div
                style={{
                    textAlign: "right",
                    color: "#999",
                    fontSize: "12px",
                    borderTop: "1px solid #f0f0f0",
                    paddingTop: "12px",
                }}
            >
                发布时间:{" "}
                {new Date(announcement.createTime || "").toLocaleString()}
            </div>
        </Modal>
    )
}
