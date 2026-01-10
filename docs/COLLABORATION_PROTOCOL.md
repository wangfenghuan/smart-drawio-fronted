# 协同编辑协议使用指南

## 概述

这是一个基于 WebSocket 的实时协同编辑协议，支持图表的多人协作编辑。协议采用**二进制格式**，包含**协议头(OpCode)**和**加密的Payload**。

## 协议格式

### 二进制消息结构

```
┌─────────┬─────────────────────────────────┐
│ byte[0] │ byte[1...]                      │
│ OpCode  │ Payload (加密数据)              │
└─────────┴─────────────────────────────────┘
```

### OpCode 定义

| OpCode  | 消息类型      | 发送权限 | 接收权限 | 用途                   |
|---------|---------------|----------|----------|------------------------|
| 0x00    | FULL_SYNC     | edit     | view+edit| 全量同步（新用户加入）  |
| 0x01    | POINTER       | view+edit| view+edit| 光标/感知（显示其他用户）|
| 0x02    | ELEMENTS_UPDATE| edit    | view+edit| 绘图更新（实际编辑操作）|

## 客户端使用

### 1. 基础配置

```typescript
import {
    UserRole,
    OpCode,
    type PointerData,
} from "@/lib/collab-protocol"
import { useWebSocketCollaboration } from "@/lib/use-websocket-collaboration"

function MyDiagramEditor() {
    const {
        isConnected,
        userCount,
        pushUpdate,
        sendPointer,
        requestFullSync,
    } = useWebSocketCollaboration({
        roomName: "room-123",
        secretKey: "your-secret-key",
        userRole: UserRole.EDIT, // 或 UserRole.VIEW
        userId: "user-123",
        userName: "张三",
        enabled: true,
        onRemoteChange: (xml) => {
            // 收到远程图表更新
            console.log("收到远程更新:", xml)
        },
        onPointerMove: (pointer) => {
            // 收到其他用户的光标位置
            console.log(`${pointer.userName} 在 (${pointer.x}, ${pointer.y})`)
        },
    })

    return (
        <div>
            <p>连接状态: {isConnected ? "已连接" : "未连接"}</p>
            <p>在线人数: {userCount}</p>
        </div>
    )
}
```

### 2. 发送绘图更新

```typescript
// 用户编辑图表后，发送更新到服务器
async function handleDiagramChange(xml: string) {
    // 这个方法会自动添加 0x02 (ELEMENTS_UPDATE) 协议头
    await pushUpdate(xml)
}
```

### 3. 发送光标位置

```typescript
// 监听鼠标移动，发送光标位置
function handleMouseMove(event: MouseEvent) {
    const x = event.clientX
    const y = event.clientY

    // 这个方法会自动添加 0x01 (POINTER) 协议头
    sendPointer(x, y)
}
```

### 4. 请求全量同步

```typescript
// 新用户加入时，请求完整图表
function handleJoinRoom() {
    // 这个方法会自动添加 0x00 (FULL_SYNC) 协议头
    requestFullSync()
}
```

## 权限控制

### Edit 权限（可编辑）

```typescript
const collab = useWebSocketCollaboration({
    userRole: UserRole.EDIT,
    // ...
})

// ✅ 可以发送所有类型的消息
await pushUpdate(xml)        // 0x02 - 绘图更新
sendPointer(x, y)            // 0x01 - 光标移动
requestFullSync()            // 0x00 - 全量同步

// ✅ 可以接收所有类型的消息
```

### View 权限（只读）

```typescript
const collab = useWebSocketCollaboration({
    userRole: UserRole.VIEW,
    // ...
})

// ❌ 不能发送绘图更新
await pushUpdate(xml)        // 会被拦截

// ✅ 可以发送光标位置
sendPointer(x, y)            // 0x01 - 光标移动

// ❌ 不能请求全量同步（通常由编辑者触发）
requestFullSync()            // 会被拦截

// ✅ 可以接收所有类型的消息（包括绘图更新）
```

## 与 Diagram Context 集成

```typescript
import { useDiagram } from "@/contexts/diagram-context"

function MyCollaborationPanel() {
    const {
        collaborationEnabled,
        collaborationConnected,
        collaborationUserCount,
        toggleCollaboration,
    } = useDiagram()

    // 开启协作（编辑模式）
    const startCollaboration = () => {
        toggleCollaboration(true, "room-123", false) // false = 可编辑
    }

    // 开启协作（只读模式）
    const startReadOnlyCollaboration = () => {
        toggleCollaboration(true, "room-123", true) // true = 只读
    }

    return (
        <button onClick={startCollaboration}>
            开启协作 ({collaborationUserCount}人在线)
        </button>
    )
}
```

## 服务器端实现（参考）

你的 Spring Boot 后端需要实现类似的逻辑：

```java
@OnMessage
public void onMessage(byte[] message, Session session) {
    if (message.length < 1) {
        return;
    }

    byte opcode = message[0];
    byte[] payload = Arrays.copyOfRange(message, 1, message.length);

    // 检查用户权限
    UserRole role = getUserRole(session);

    switch (opcode) {
        case 0x00: // FULL_SYNC
            if (role != UserRole.EDIT) {
                logger.warn("拒绝：只读用户尝试请求全量同步");
                return;
            }
            broadcastToRoom(session.getRoomId(), message, session);
            break;

        case 0x01: // POINTER
            // 所有人都可以发送和接收光标位置
            broadcastToRoom(session.getRoomId(), message, session);
            break;

        case 0x02: // ELEMENTS_UPDATE
            if (role != UserRole.EDIT) {
                logger.warn("拒绝：只读用户尝试编辑");
                return;
            }
            // 广播给房间内所有人（包括只读用户）
            broadcastToRoom(session.getRoomId(), message, session);
            break;
    }
}
```

## 加密说明

- **加密算法**: AES-GCM (256位)
- **密钥派生**: PBKDF2 (100,000次迭代)
- **IV**: 每个消息12字节随机IV
- **加密范围**: 只加密 Payload，不加密 OpCode

这样设计的好处：
- 服务器可以根据 OpCode 做路由决策，无需解密
- 实际内容依然端到端加密，服务器无法窃听

## 调试技巧

### 启用详细日志

```typescript
// 在浏览器控制台中
localStorage.debug = "WebSocketCollab:*"
```

### 查看网络流量

```typescript
// 在 Chrome DevTools -> Network -> WS 标签页
// 可以看到实际的二进制消息
```

### 验证消息格式

```typescript
import { unpackMessage, getOpCodeName } from "@/lib/collab-packet"

// 在控制台中测试
const data = await fetchWebSocketMessage()
const { opcode, payload } = unpackMessage(data)
console.log("OpCode:", getOpCodeName(opcode))
console.log("Payload length:", payload.length)
```

## 常见问题

### Q: 为什么我的只读用户不能看到图表更新？

A: 确保服务器端也允许只读用户**接收** 0x02 消息。权限控制只在**发送端**生效。

### Q: 光标位置太频繁，会影响性能吗？

A: 光标消息(0x01)的Payload很小（只有坐标和用户ID），通常不会有问题。如果担心，可以在客户端添加节流(throttle)。

### Q: 如何添加新的消息类型？

A:
1. 在 `lib/collab-protocol.ts` 中添加新的 OpCode
2. 在 `lib/collab-packet.ts` 中添加对应的 pack/unpack 函数
3. 在 `lib/websocket-collab.ts` 中添加发送方法
4. 在服务器端添加对应的处理逻辑

### Q: 能否实现撤销/重做？

A: 当前的协议不支持操作历史（因为发送的是完整XML）。如果需要，可以考虑：
- 添加新的 OpCode (0x03) 用于操作记录
- 在客户端维护操作历史栈
- 或者使用 Yjs 等专业的 CRDT 库

## 相关文件

- `lib/collab-protocol.ts` - 协议常量和类型定义
- `lib/collab-packet.ts` - 消息打包和解析工具
- `lib/websocket-collab.ts` - WebSocket 客户端实现
- `lib/use-websocket-collaboration.ts` - React Hook
- `contexts/diagram-context.tsx` - 全局状态管理
