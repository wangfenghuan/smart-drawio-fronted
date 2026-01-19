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

    type BaseResponseListSpaceLevel = {
        code?: number
        data?: SpaceLevel[]
        message?: string
    }

    type BaseResponseListSpaceUserVO = {
        code?: number
        data?: SpaceUserVO[]
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

    type BaseResponsePageSpace = {
        code?: number
        data?: PageSpace
        message?: string
    }

    type BaseResponsePageSpaceVO = {
        code?: number
        data?: PageSpaceVO
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

    type BaseResponseSpace = {
        code?: number
        data?: Space
        message?: string
    }

    type BaseResponseSpaceUser = {
        code?: number
        data?: SpaceUser
        message?: string
    }

    type BaseResponseSpaceVO = {
        code?: number
        data?: SpaceVO
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
        roomId: number
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
        /** 空间id */
        spaceId?: number
        /** 矢量图URL */
        svgUrl?: string
        /** SVG文件大小（字节） */
        svgSize?: number
        /** PNG文件大小（字节） */
        pngSize?: number
        /** 图片总大小（字节） */
        picSize?: number
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
        /** 空间id */
        spaceId?: number
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
        spaceId?: number
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
        /** 空间id（可选，空代表查询公共空间） */
        spaceId?: number
        /** 搜索关键词 */
        searchText?: string
        /** 图表标题 */
        title?: string
        /** 图表代码 */
        diagramCode?: string
        /** 是否只查询 spaceId 为 null 的数据 */
        nullSpaceId?: boolean
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
        ownerId?: number
        /** 加密后的图表数据 */
        encryptedData?: string
        /** 访问地址 */
        roomUrl?: string
        /** 加密向量 */
        iv?: string
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
        /** 空间ID */
        spaceId?: number
    }

    type DiagramUpdateRequest = {
        /** 图表ID */
        id?: number
        /** 图表标题 */
        name?: string
        /** 图表代码 */
        diagramCode?: string
        /** 图片URL */
        pictureUrl?: string
        /** 图表描述 */
        description?: string
        /** 空间id */
        spaceId?: number
    }

    type DiagramUploadRequest = {
        /** 业务类型 */
        biz?: string
        /** 图表ID */
        diagramId?: number
        /** 用户ID */
        userId?: number
        /** 空间ID */
        spaceId?: number
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
        /** 空间id */
        spaceId?: number
        /** 创建时间 */
        createTime?: string
        /** 更新时间 */
        updateTime?: string
        /** 图表描述 */
        description?: string
        /** 图表代码 */
        diagramCode?: string
        /** 创建用户信息 */
        userVO?: UserVO
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

    type getRoomDiagramVOParams = {
        diagramId: number
        roomId: number
    }

    type getSpaceByIdParams = {
        id: number
    }

    type getSpaceVOByIdParams = {
        id: number
    }

    type getUserByIdParams = {
        id: number
    }

    type getUserVOByIdParams = {
        id: number
    }

    type GrantedAuthority = {
        authority?: string
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

    type PageSpace = {
        records?: Space[]
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

    type PageSpaceVO = {
        records?: SpaceVO[]
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
        diagramId?: number
        /** 空间ID */
        spaceId?: number
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
        /** 访问地址 */
        roomUrl?: string
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
        /** 空间ID */
        spaceId?: number
        /** 是否查询空空间id的记录 */
        nullSpaceId?: boolean
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

    type RoomUrlEditRequest = {
        /** 房间ID */
        id?: number
        /** 访问地址 */
        roomUrl?: string
    }

    type RoomVO = {
        /** 房间ID */
        id?: number
        /** 房间名称 */
        roomName?: string
        /** 图表ID */
        diagramId?: number
        /** 创建者ID */
        ownerId?: number
        /** 是否公开（0公开，1私有） */
        isPublic?: number
        /** 是否删除（0未删除，1已删除） */
        isDelete?: number
        /** 创建时间 */
        createTime?: string
        /** 访问地址 */
        roomUrl?: string
        /** 更新时间 */
        updateTime?: string
        /** 是否关闭（0开启，1关闭） */
        isOpen?: number
        /** 创建用户信息 */
        userVO?: UserVO
        /** 空间id */
        spaceId?: number
    }

    type saveParams = {
        roomId: number
    }

    type Space = {
        id?: number
        spaceName?: string
        spaceLevel?: number
        maxSize?: number
        maxCount?: number
        totalSize?: number
        totalCount?: number
        spaceType?: number
        userId?: number
        createTime?: string
        editTime?: string
        updateTime?: string
        isDelete?: number
    }

    type SpaceAddReqeust = {
        spaceName?: string
        spaceLevel?: number
        spaceType?: number
        userId?: number
    }

    type SpaceEditRequest = {
        id?: number
        spaceName?: string
    }

    type SpaceLevel = {
        /** 级别值 */
        value?: number
        /** 级别文本 */
        text?: string
        /** 最大图表数量 */
        maxCount?: number
        /** 最大总大小（字节） */
        maxSize?: number
    }

    type SpaceQueryRequest = {
        current?: number
        pageSize?: number
        sortField?: string
        sortOrder?: string
        id?: number
        userId?: number
        spaceName?: string
        spaceType?: number
        spaceLevel?: number
    }

    type SpaceUpdateRequest = {
        id?: number
        spaceName?: string
        spaceLevel?: number
        maxSize?: number
        maxCount?: number
        totalSize?: number
        totalCount?: number
    }

    type SpaceUser = {
        id?: number
        spaceId?: number
        userId?: number
        spaceRole?: string
        authorities?: GrantedAuthority[]
        createTime?: string
        updateTime?: string
        isDelete?: number
        enabled?: boolean
        username?: string
        password?: string
        accountNonExpired?: boolean
        accountNonLocked?: boolean
        credentialsNonExpired?: boolean
    }

    type SpaceUserAddRequest = {
        spaceId?: number
        userId?: number
        spaceRole?: string
    }

    type SpaceUserEditRequest = {
        id?: number
        spaceRole?: string
    }

    type SpaceUserQueryRequest = {
        id?: number
        spaceId?: number
        userId?: number
        spaceRole?: string
    }

    type SpaceUserVO = {
        id?: number
        spaceId?: number
        userId?: number
        spaceRole?: string
        createTime?: string
        updateTime?: string
        user?: UserVO
        space?: SpaceVO
    }

    type SpaceVO = {
        id?: number
        spaceName?: string
        spaceType?: number
        spaceLevel?: number
        maxSize?: number
        maxCount?: number
        totalSize?: number
        totalCount?: number
        userId?: number
        createTime?: string
        editTime?: string
        updateTime?: string
        userVO?: UserVO
    }

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
        roomId: number
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
        authorities?: GrantedAuthority[]
        /** 是否删除（0未删除，1已删除） */
        isDelete?: number
        enabled?: boolean
        username?: string
        password?: string
        accountNonExpired?: boolean
        accountNonLocked?: boolean
        credentialsNonExpired?: boolean
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
        /** 用户昵称 */
        userName?: string
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
