import {
    CrownOutlined,
    HomeOutlined,
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
    },
    {
        name: "我的图表",
        path: "/my-diagrams",
        icon: <TableOutlined />,
    },
    {
        name: "素材市场",
        path: "/material-marketplace",
        icon: <ShopOutlined />,
    },
    {
        name: "图表市场",
        path: "/diagram-marketplace",
        icon: <CrownOutlined />,
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
