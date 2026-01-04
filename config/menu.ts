import type { MenuDataItem } from "@ant-design/pro-layout"

const menus: MenuDataItem[] = [
    {
        path: "/",
        name: "主页",
    },
    {
        path: "/my-diagrams",
        name: "我的图表",
    },
    {
        path: "/my-rooms",
        name: "我的协作房间",
    },
    {
        path: "/diagrams",
        name: "图表广场",
    },
    {
        path: "/room",
        name: "协作空间",
    },
    {
        path: "/admin",
        name: "管理",
        children: [
            {
                path: "/admin/user",
                name: "用户管理",
            },
            {
                path: "/admin/diagram",
                name: "题库管理",
            },
            {
                path: "/admin/room",
                name: "房间管理",
            },
        ],
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
