/**
 * 协同编辑协议定义
 *
 * 二进制消息格式:
 * byte[0]     OpCode (消息类型)
 * byte[1...]  Payload (加密数据)
 */

/**
 * 消息类型枚举 (OpCode)
 */
export enum OpCode {
  /**
   * 全量同步
   * - 发送权限: edit
   * - 接收权限: view + edit
   * - 用途: 新用户加入时获取完整图表
   */
  FULL_SYNC = 0x00,

  /**
   * 光标/感知
   * - 发送权限: view + edit
   * - 接收权限: view + edit
   * - 用途: 广播光标位置、用户状态等
   */
  POINTER = 0x01,

  /**
   * 绘图更新
   * - 发送权限: edit
   * - 接收权限: view + edit
   * - 用途: 图表内容的实际修改
   */
  ELEMENTS_UPDATE = 0x02,
}

/**
 * 用户角色
 */
export enum UserRole {
  VIEW = "view",
  EDIT = "edit",
}

/**
 * 光标数据结构
 */
export interface PointerData {
  type: "pointer"
  x: number
  y: number
  userId: string
  userName?: string
  timestamp?: number
}

/**
 * 全量同步请求数据结构
 */
export interface SyncRequestData {
  type: "sync_request"
  userId: string
  timestamp?: number
}

/**
 * 协议消息（解析后）
 */
export interface ProtocolMessage {
  opcode: OpCode
  payload: Uint8Array // 加密的数据
}

/**
 * 打包后的消息（可发送）
 */
export type PackedMessage = Uint8Array

/**
 * 权限检查结果
 */
export interface PermissionCheck {
  allowed: boolean
  reason?: string
}

/**
 * 检查用户是否有权限发送指定类型的消息
 */
export function canSend(opcode: OpCode, role: UserRole): PermissionCheck {
  switch (opcode) {
    case OpCode.FULL_SYNC:
      if (role !== UserRole.EDIT) {
        return { allowed: false, reason: "全量同步需要编辑权限" }
      }
      return { allowed: true }

    case OpCode.POINTER:
      // 所有人都可以发送光标位置
      return { allowed: true }

    case OpCode.ELEMENTS_UPDATE:
      if (role !== UserRole.EDIT) {
        return { allowed: false, reason: "绘图更新需要编辑权限" }
      }
      return { allowed: true }

    default:
      return { allowed: false, reason: "未知的消息类型" }
  }
}

/**
 * 检查用户是否有权限接收指定类型的消息
 */
export function canReceive(opcode: OpCode, role: UserRole): PermissionCheck {
  // 所有用户都可以接收所有类型的消息
  return { allowed: true }
}

/**
 * 获取 OpCode 的名称（用于日志）
 */
export function getOpCodeName(opcode: OpCode): string {
  switch (opcode) {
    case OpCode.FULL_SYNC:
      return "FULL_SYNC"
    case OpCode.POINTER:
      return "POINTER"
    case OpCode.ELEMENTS_UPDATE:
      return "ELEMENTS_UPDATE"
    default:
      return `UNKNOWN(0x${opcode.toString(16).padStart(2, "0")})`
  }
}

/**
 * 验证消息是否有效
 */
export function isValidOpcode(opcode: number): opcode is OpCode {
  return opcode === OpCode.FULL_SYNC ||
         opcode === OpCode.POINTER ||
         opcode === OpCode.ELEMENTS_UPDATE
}
