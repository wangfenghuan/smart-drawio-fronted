import type { MenuDataItem } from "@ant-design/pro-layout"

const menus: MenuDataItem[] = [
    {
        path: "/",
        name: "主页",
    },
    {
        path: "/diagram-marketplace",
        name: "图表广场",
    },
    {
        path: "/my-spaces",
        name: "我的空间",
    },
    {
        path: "/my-diagrams",
        name: "我的图表",
    },
    {
        path: "/my-rooms",
        name: "协作房间",
    },
    {
        path: "/admin",
        name: "管理员控制台",
        access: "admin",
    },
] as MenuDataItem[]

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
