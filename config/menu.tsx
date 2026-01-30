import {
    CrownOutlined,
    HomeOutlined,
    MessageOutlined,
    NotificationOutlined,
    ShopOutlined,
    TableOutlined,
    UserOutlined,
} from "@ant-design/icons"
import type { MenuDataItem } from "@ant-design/pro-layout"

export const menus: MenuDataItem[] = [
    {
        name: "首页",
        path: "/",
        icon: <HomeOutlined />,
        access: "notLogin",
    },
    {
        name: "模板广场",
        path: "/templates",
        icon: <ShopOutlined />,
        access: "notLogin",
    },
    {
        name: "图表市场",
        path: "/diagram-marketplace",
        icon: <CrownOutlined />,
        access: "notLogin",
    },
    {
        name: "我的图表",
        path: "/my-diagrams",
        icon: <TableOutlined />,
    },
    {
        name: "协作房间",
        path: "/my-rooms",
        icon: <UserOutlined />,
    },
    {
        name: "我的空间",
        path: "/my-spaces",
        icon: <UserOutlined />,
    },
    {
        name: "公告",
        path: "/announcement",
        icon: <NotificationOutlined />,
    },
    {
        name: "意见反馈",
        path: "/user/feedback",
        icon: <MessageOutlined />,
    },
    {
        path: "/admin",
        name: "管理员控制台",
        access: "admin",
    },
]

export default menus

export const findAllMenuItemByPath = (path: string): MenuDataItem | null => {
    return findMenuItemByPath(menus, path)
}
export const findMenuItemByPath = (
    menus: MenuDataItem[],
    path: string,
): MenuDataItem | null => {
    for (const menu of menus) {
        if (menu.path === path) {
            return menu
        }
        if (menu.children) {
            const matchedMenuItem = findMenuItemByPath(menu.children, path)
            if (matchedMenuItem) {
                return matchedMenuItem
            }
        }
    }
    return null
}
