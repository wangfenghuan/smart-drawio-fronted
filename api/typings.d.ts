declare namespace API {
    type BaseResponseBoolean = {
        code?: number
        data?: boolean
        message?: string
    }

    type BaseResponseDiagramVO = {
        code?: number
        data?: DiagramVO
        message?: string
    }

    type BaseResponseLoginUserVO = {
        code?: number
        data?: LoginUserVO
        message?: string
    }

    type BaseResponseLong = {
        code?: number
        data?: number
        message?: string
    }

    type BaseResponsePageConversion = {
        code?: number
        data?: PageConversion
        message?: string
    }

    type BaseResponsePageDiagram = {
        code?: number
        data?: PageDiagram
        message?: string
    }

    type BaseResponsePageDiagramRoom = {
        code?: number
        data?: PageDiagramRoom
        message?: string
    }

    type BaseResponsePageDiagramVO = {
        code?: number
        data?: PageDiagramVO
        message?: string
    }

    type BaseResponsePageRoomVO = {
        code?: number
        data?: PageRoomVO
        message?: string
    }

    type BaseResponsePageUser = {
        code?: number
        data?: PageUser
        message?: string
    }

    type BaseResponsePageUserVO = {
        code?: number
        data?: PageUserVO
        message?: string
    }

    type BaseResponseRoomVO = {
        code?: number
        data?: RoomVO
        message?: string
    }

    type BaseResponseString = {
        code?: number
        data?: string
        message?: string
    }

    type BaseResponseUser = {
        code?: number
        data?: User
        message?: string
    }

    type BaseResponseUserVO = {
        code?: number
        data?: UserVO
        message?: string
    }

    type checkLockParams = {
        roomId: string | number
    }

    type Conversion = {
        /** 主键ID */
        id?: number
        /** 用户ID */
        userId?: number
        /** 图表ID */
        diagramId?: number
        /** 消息类型(user代表用户，ai代表AI回复) */
        messageType?: string
        /** 消息内容 */
        message?: string
        /** 创建时间 */
        createTime?: string
        /** 更新时间 */
        updateTime?: string
        /** 是否删除(0未删除，1已删除) */
        isDelete?: number
    }

    type CustomChatRequest = {
        /** 对话消息 */
        message?: string
        /** 图表ID */
        diagramId?: string
        /** 模型名称 */
        modelId?: string
        /** API接口地址 */
        baseUrl?: string
        /** API密钥 */
        apiKey?: string
    }

    type DeleteRequest = {
        id?: number
    }

    type Diagram = {
        /** 图表主键ID */
        id?: number
        /** 用户ID */
        userId?: number
        /** 图表代码 */
        diagramCode?: string
        /** 图表名称 */
        name?: string
        /** 图表描述 */
        description?: string
        /** 图片URL */
        pictureUrl?: string
        /** 矢量图URL */
        svgUrl?: string
        /** 创建时间 */
        createTime?: string
        /** 更新时间 */
        updateTime?: string
        /** 是否删除（0未删除，1删除） */
        isDelete?: number
    }

    type DiagramAddRequest = {
        /** 图表标题 */
        name?: string
        /** 图表代码 */
        diagramCode?: string
        /** 图片URL */
        pictureUrl?: string
    }

    type DiagramEditRequest = {
        /** 图表ID */
        id?: number
        /** 图表标题 */
        title?: string
        /** 图表描述 */
        description?: string
        /** 图表代码 */
        diagramCode?: string
        /** 图片URL */
        pictureUrl?: string
    }

    type DiagramQueryRequest = {
        current?: number
        pageSize?: number
        sortField?: string
        sortOrder?: string
        /** 图表ID */
        id?: number
        /** 搜索关键词 */
        searchText?: string
        /** 图表标题 */
        title?: string
        /** 图表代码 */
        diagramCode?: string
        /** 创建用户ID */
        userId?: number
    }

    type DiagramRoom = {
        /** 房间ID */
        id?: number
        /** 房间名称 */
        roomName?: string
        /** 图表ID */
        diagramId?: number
        /** 创建者ID */
        owerId?: number
        /** 是否公开（0公开，1私有） */
        isPublic?: number
        /** 是否删除（0未删除，1已删除） */
        isDelete?: number
        /** 创建时间 */
        createTime?: string
        /** 更新时间 */
        updateTime?: string
        /** 是否关闭（0开启，1关闭） */
        isOpen?: number
        /** 访问密码 */
        accessKey?: string
    }

    type DiagramUpdateRequest = {
        /** 图表ID */
        id?: number
        /** 图表标题 */
        title?: string
        /** 图表代码 */
        diagramCode?: string
        /** 图片URL */
        pictureUrl?: string
    }

    type DiagramUploadRequest = {
        /** 业务类型 */
        biz?: string
        /** 图表ID */
        diagramId?: number
        /** 用户ID */
        userId?: number
    }

    type DiagramVO = {
        /** 图表ID */
        id?: number
        /** 图表标题 */
        name?: string
        /** 创建用户ID */
        userId?: number
        /** 图片URL */
        pictureUrl?: string
        /** 矢量图URL */
        svgUrl?: string
        /** 创建时间 */
        createTime?: string
        /** 更新时间 */
        updateTime?: string
        /** 图表描述 */
        description?: string
        /** 图表代码 */
        diagramCode?: string
    }

    type doChatParams = {
        message: string
        diagramId: string
        modelId: string
    }

    type downloadRemoteFileParams = {
        fileName?: string
        type: string
        diagramId: number
    }

    type getDiagramRoomVOByIdParams = {
        id: number
    }

    type getDiagramVOByIdParams = {
        id: number
    }

    type getRoomByDiagramIdParams = {
        diagramId: number
    }

    type getUserByIdParams = {
        id: number
    }

    type getUserVOByIdParams = {
        id: number
    }

    type isContainedParams = {
        roomId: number
    }

    type listDiagramChatHistoryParams = {
        diagramId: number
        pageSize?: number
        lasteCreateTime?: string
    }

    type LoginUserVO = {
        /** 用户ID */
        id?: number
        /** 用户昵称 */
        userName?: string
        /** 用户头像 */
        userAvatar?: string
        /** 用户简介 */
        userProfile?: string
        /** 用户角色 */
        userRole?: string
        /** 创建时间 */
        createTime?: string
        /** 更新时间 */
        updateTime?: string
    }

    type OrderItem = {
        column?: string
        asc?: boolean
    }

    type PageConversion = {
        records?: Conversion[]
        total?: number
        size?: number
        current?: number
        orders?: OrderItem[]
        optimizeCountSql?: any
        searchCount?: any
        optimizeJoinOfCountSql?: boolean
        maxLimit?: number
        countId?: string
        pages?: number
    }

    type PageDiagram = {
        records?: Diagram[]
        total?: number
        size?: number
        current?: number
        orders?: OrderItem[]
        optimizeCountSql?: any
        searchCount?: any
        optimizeJoinOfCountSql?: boolean
        maxLimit?: number
        countId?: string
        pages?: number
    }

    type PageDiagramRoom = {
        records?: DiagramRoom[]
        total?: number
        size?: number
        current?: number
        orders?: OrderItem[]
        optimizeCountSql?: any
        searchCount?: any
        optimizeJoinOfCountSql?: boolean
        maxLimit?: number
        countId?: string
        pages?: number
    }

    type PageDiagramVO = {
        records?: DiagramVO[]
        total?: number
        size?: number
        current?: number
        orders?: OrderItem[]
        optimizeCountSql?: any
        searchCount?: any
        optimizeJoinOfCountSql?: boolean
        maxLimit?: number
        countId?: string
        pages?: number
    }

    type PageRoomVO = {
        records?: RoomVO[]
        total?: number
        size?: number
        current?: number
        orders?: OrderItem[]
        optimizeCountSql?: any
        searchCount?: any
        optimizeJoinOfCountSql?: boolean
        maxLimit?: number
        countId?: string
        pages?: number
    }

    type PageUser = {
        records?: User[]
        total?: number
        size?: number
        current?: number
        orders?: OrderItem[]
        optimizeCountSql?: any
        searchCount?: any
        optimizeJoinOfCountSql?: boolean
        maxLimit?: number
        countId?: string
        pages?: number
    }

    type PageUserVO = {
        records?: UserVO[]
        total?: number
        size?: number
        current?: number
        orders?: OrderItem[]
        optimizeCountSql?: any
        searchCount?: any
        optimizeJoinOfCountSql?: boolean
        maxLimit?: number
        countId?: string
        pages?: number
    }

    type RoomAddRequest = {
        /** 房间名称 */
        roomName?: string
        /** 图表ID */
        diagramId?: string
    }

    type RoomEditRequest = {
        /** 房间ID */
        id?: number
        /** 房间名称 */
        roomName?: string
        /** 是否公开（0公开，1私有） */
        isPublic?: number
        /** 是否关闭（0开启，1关闭） */
        isOpen?: number
        /** 访问密码 */
        accessKey?: string
    }

    type RoomQueryRequest = {
        current?: number
        pageSize?: number
        sortField?: string
        sortOrder?: string
        /** 房间ID */
        id?: number
        /** 房间名称 */
        roomName?: string
        /** 搜索关键词 */
        searchText?: string
        /** 图表ID */
        diagramId?: number
        /** 创建者ID */
        owerId?: number
        /** 是否公开（0公开，1私有） */
        isPublic?: number
        /** 创建时间 */
        createTime?: string
        /** 更新时间 */
        updateTime?: string
        /** 是否关闭（0开启，1关闭） */
        isOpen?: number
    }

    type RoomUpdateRequest = {
        /** 房间ID */
        id?: number
        /** 房间名称 */
        roomName?: string
        /** 是否公开（0公开，1私有） */
        isPublic?: number
        /** 是否关闭（0开启，1关闭） */
        isOpen?: number
        /** 访问密码 */
        accessKey?: string
    }

    type RoomVO = Record<string, any>

    type SseEmitter = {
        timeout?: number
    }

    type uploadFileParams = {
        uploadFileRequest: UploadFileRequest
    }

    type UploadFileRequest = {
        /** 业务类型 */
        biz?: string
    }

    type uploadSnapshotParams = {
        roomId: string | number
    }

    type User = {
        /** 用户ID */
        id?: number
        /** 用户账号 */
        userAccount?: string
        /** 用户密码 */
        userPassword?: string
        /** 开放平台ID */
        unionId?: string
        /** 公众号OpenID */
        mpOpenId?: string
        /** 用户昵称 */
        userName?: string
        /** 用户头像 */
        userAvatar?: string
        /** 用户简介 */
        userProfile?: string
        /** 用户角色 */
        userRole?: string
        /** 创建时间 */
        createTime?: string
        /** 更新时间 */
        updateTime?: string
        /** 是否删除（0未删除，1已删除） */
        isDelete?: number
    }

    type UserAddRequest = {
        /** 用户昵称 */
        userName?: string
        /** 用户账号 */
        userAccount?: string
        /** 用户头像 */
        userAvatar?: string
        /** 用户角色 */
        userRole?: string
    }

    type UserLoginRequest = {
        /** 用户账号 */
        userAccount?: string
        /** 用户密码 */
        userPassword?: string
    }

    type UserQueryRequest = {
        current?: number
        pageSize?: number
        sortField?: string
        sortOrder?: string
        /** 用户ID */
        id?: number
        /** 开放平台ID */
        unionId?: string
        /** 公众号OpenID */
        mpOpenId?: string
        /** 用户昵称 */
        userName?: string
        /** 用户简介 */
        userProfile?: string
        /** 用户角色 */
        userRole?: string
    }

    type UserRegisterRequest = {
        /** 用户账号 */
        userAccount?: string
        /** 用户密码 */
        userPassword?: string
        /** 确认密码 */
        checkPassword?: string
    }

    type UserUpdateMyRequest = {
        /** 用户昵称 */
        userName?: string
        /** 用户头像 */
        userAvatar?: string
        /** 用户简介 */
        userProfile?: string
    }

    type UserUpdateRequest = {
        /** 用户ID */
        id?: number
        /** 用户昵称 */
        userName?: string
        /** 用户头像 */
        userAvatar?: string
        /** 用户简介 */
        userProfile?: string
        /** 用户角色 */
        userRole?: string
    }

    type UserVO = {
        /** 用户ID */
        id?: number
        /** 用户昵称 */
        userName?: string
        /** 用户头像 */
        userAvatar?: string
        /** 用户简介 */
        userProfile?: string
        /** 用户角色 */
        userRole?: string
        /** 创建时间 */
        createTime?: string
    }
}
