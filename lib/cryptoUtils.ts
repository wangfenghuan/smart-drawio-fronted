/**
 * 加密/解密工具类
 * 使用 AES-GCM 进行端到端加密
 */

/**
 * 从字符串生成加密密钥
 * @param secretKey 密钥字符串(来自 URL hash 或用户输入)
 * @returns CryptoKey
 */
export async function deriveKey(secretKey: string): Promise<CryptoKey> {
    const encoder = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secretKey),
        "PBKDF2",
        false,
        ["deriveBits", "deriveKey"],
    )

    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: encoder.encode("excalidraw-salt"), // 固定 salt,简化实现
            iterations: 100000,
            hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"],
    )
}

/**
 * 加密数据
 * @param data 要加密的字符串(通常是 XML)
 * @param secretKey 密钥字符串
 * @returns 加密后的 Uint8Array
 */
export async function encryptData(
    data: string,
    secretKey: string,
): Promise<Uint8Array> {
    const key = await deriveKey(secretKey)
    const encoder = new TextEncoder()
    const iv = crypto.getRandomValues(new Uint8Array(12)) // 12 bytes IV for GCM

    const encrypted = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        key,
        encoder.encode(data),
    )

    // 将 IV 和加密数据合并: IV(12 bytes) + EncryptedData
    const result = new Uint8Array(iv.length + encrypted.byteLength)
    result.set(iv, 0)
    result.set(new Uint8Array(encrypted), iv.length)

    return result
}

/**
 * 解密数据
 * @param encryptedData 加密的数据 Uint8Array
 * @param secretKey 密钥字符串
 * @returns 解密后的字符串
 */
export async function decryptData(
    encryptedData: Uint8Array,
    secretKey: string,
): Promise<string> {
    const key = await deriveKey(secretKey)

    // 提取 IV (前 12 bytes)
    const iv = encryptedData.slice(0, 12)
    const data = encryptedData.slice(12)

    const decrypted = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        key,
        data,
    )

    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
}

/**
 * 生成随机密钥字符串
 * @returns 随机密钥(用于新房间)
 */
export function generateSecretKey(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
        "",
    )
}

/**
 * 从 URL hash 获取密钥
 * @returns 密钥字符串或 null
 */
export function getSecretKeyFromHash(): string | null {
    if (typeof window === "undefined") return null

    const hash = window.location.hash.substring(1) // 移除 #
    const keyMatch = hash.match(/key=([^&]+)/)

    if (keyMatch) {
        return keyMatch[1]
    }

    // 如果整个 hash 就是密钥(简化版)
    if (hash.length === 64 && /^[0-9a-f]+$/.test(hash)) {
        return hash
    }

    return null
}

/**
 * 将密钥添加到 URL hash
 * @param secretKey 密钥字符串
 */
export function setSecretKeyToHash(secretKey: string): void {
    if (typeof window === "undefined") return

    const currentHash = window.location.hash.substring(1)
    const _newHash = `key=${secretKey}`

    // 保留其他 hash 参数
    const params = new URLSearchParams(currentHash)
    params.set("key", secretKey)

    window.location.hash = params.toString()
}
