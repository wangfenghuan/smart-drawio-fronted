/**
 * 协议消息打包和解析工具
 */

import { encryptData, decryptData } from "./cryptoUtils"
import {
  OpCode,
  PointerData,
  SyncRequestData,
  getOpCodeName,
  isValidOpcode,
} from "./collab-protocol"

/**
 * 打包消息（添加协议头）
 * @param opcode 消息类型
 * @param payload 加密后的数据
 * @returns 可发送的二进制消息
 */
export function packMessage(
  opcode: OpCode,
  payload: Uint8Array,
): Uint8Array {
  const packet = new Uint8Array(1 + payload.length)
  packet[0] = opcode
  packet.set(payload, 1)

  console.log(
    `[PackMessage] ${getOpCodeName(opcode)} | Payload: ${payload.length} bytes | Total: ${packet.length} bytes`,
  )

  return packet
}

/**
 * 解包消息（移除协议头）
 * @param data 接收到的二进制数据
 * @returns 包含 opcode 和 payload 的对象
 */
export function unpackMessage(data: ArrayBuffer | Uint8Array): {
  opcode: OpCode
  payload: Uint8Array
} {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data)

  if (bytes.length < 1) {
    throw new Error("[UnpackMessage] 消息长度不足")
  }

  const opcode = bytes[0]
  const payload = bytes.slice(1)

  if (!isValidOpcode(opcode)) {
    throw new Error(
      `[UnpackMessage] 无效的 OpCode: 0x${opcode.toString(16)}`,
    )
  }

  console.log(
    `[UnpackMessage] ${getOpCodeName(opcode)} | Payload: ${payload.length} bytes`,
  )

  return { opcode, payload }
}

/**
 * 打包并发送光标消息
 */
export async function packPointerMessage(
  pointer: PointerData,
  secretKey: string,
): Promise<Uint8Array> {
  const json = JSON.stringify(pointer)
  const encrypted = await encryptData(json, secretKey)
  return packMessage(OpCode.POINTER, encrypted)
}

/**
 * 打包并发送绘图更新消息
 */
export async function packElementsMessage(
  xml: string,
  secretKey: string,
): Promise<Uint8Array> {
  const encrypted = await encryptData(xml, secretKey)
  return packMessage(OpCode.ELEMENTS_UPDATE, encrypted)
}

/**
 * 打包并发送全量同步消息
 */
export async function packSyncMessage(
  syncRequest: SyncRequestData,
  secretKey: string,
): Promise<Uint8Array> {
  const json = JSON.stringify(syncRequest)
  const encrypted = await encryptData(json, secretKey)
  return packMessage(OpCode.FULL_SYNC, encrypted)
}

/**
 * 解析并解密光标消息
 */
export async function unpackPointerMessage(
  payload: Uint8Array,
  secretKey: string,
): Promise<PointerData> {
  const json = await decryptData(payload, secretKey)
  const data = JSON.parse(json) as PointerData

  if (data.type !== "pointer") {
    throw new Error(`[UnpackPointer] 消息类型错误: ${data.type}`)
  }

  return data
}

/**
 * 解析并解密绘图更新消息
 */
export async function unpackElementsMessage(
  payload: Uint8Array,
  secretKey: string,
): Promise<string> {
  return await decryptData(payload, secretKey)
}

/**
 * 解析并解密全量同步消息
 */
export async function unpackSyncMessage(
  payload: Uint8Array,
  secretKey: string,
): Promise<SyncRequestData> {
  const json = await decryptData(payload, secretKey)
  const data = JSON.parse(json) as SyncRequestData

  if (data.type !== "sync_request") {
    throw new Error(`[UnpackSync] 消息类型错误: ${data.type}`)
  }

  return data
}
