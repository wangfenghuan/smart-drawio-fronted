/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const alt = 'IntelliDraw 模板预览'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

// Interface for Material Data
interface BaseResponseMaterialVO {
  code?: number
  data?: {
    id?: string
    name?: string
    description?: string
    pictureUrl?: string
    svgUrl?: string
    tags?: string // JSON string
    userVO?: {
      userName?: string
    }
  }
}

// Fetch font from Google Fonts (or compatible CDN)
async function loadGoogleFont(font: string, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(text)}`
  const css = await (await fetch(url)).text()
  const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/)

  if (resource) {
    const response = await fetch(resource[1])
    if (response.status == 200) {
      return await response.arrayBuffer()
    }
  }

  throw new Error('failed to load font data')
}

export default async function Image({ params }: { params: { id: string } }) {
  const { id } = await params
  
  // 1. Fetch Data
  let material: BaseResponseMaterialVO['data'] = {}
  try {
      const dataRes = await fetch(`http://47.95.35.178:8081/api/material/get/vo?id=${id}`)
      if (dataRes.ok) {
           const json: BaseResponseMaterialVO = await dataRes.json()
           material = json.data || {}
      }
  } catch (e) {
      console.error('OG image fetch error', e)
  }
  
  const title = material.name || 'IntelliDraw 智能绘图'
  const desc = material.description?.slice(0, 60) + (material.description && material.description.length > 60 ? '...' : '') || '探索 IntelliDraw 海量高质量绘图模板'
  const imageUrl = material.pictureUrl || material.svgUrl
  const userName = material.userVO?.userName || 'IntelliDraw'

  // 2. Fetch Font (Critical for Chinese)
  // We fetch a specific subset of characters or the full font if possible. 
  // For simplicity and speed in this demo, we use a standard font URL directly if ArrayBuffer logic is complex, 
  // but Vercel OG needs ArrayBuffer.
  // We'll use a pre-hosted widely available font resource.
  const fontData = await fetch(
    new URL('https://github.com/googlefonts/noto-cjk/raw/main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf', import.meta.url)
  ).then((res) => res.arrayBuffer()).catch(() => null)


  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
          backgroundImage: 'radial-gradient(circle at 25px 25px, #e2e8f0 2%, transparent 0%), radial-gradient(circle at 75px 75px, #e2e8f0 2%, transparent 0%)',
          backgroundSize: '100px 100px',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: '1100px', // slightly smaller than 1200 to have margin
            height: '530px', 
            background: 'white',
            borderRadius: '24px',
            boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
          }}
        >
            {/* Left Column: Text */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '60px',
                    width: imageUrl ? '40%' : '100%', // Full width if no image
                    height: '100%',
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                     {/* Logo / Brand */}
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        color: '#3b82f6',
                        fontSize: 24,
                        fontWeight: 'bold',
                        marginBottom: 40
                    }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 10 }}>
                           <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                        </svg>
                        IntelliDraw
                    </div>

                    <div style={{ 
                        fontSize: 48, 
                        fontWeight: 900, 
                        color: '#0f172a', 
                        lineHeight: 1.2,
                        marginBottom: 20,
                        // Allow text wrap
                        display: 'flex',
                        flexWrap: 'wrap',
                    }}>
                        {title}
                    </div>

                    <div style={{ 
                        fontSize: 24, 
                        color: '#64748b', 
                        lineHeight: 1.5,
                        display: 'flex',
                        flexWrap: 'wrap',
                    }}>
                        {desc}
                    </div>
                </div>

                 <div style={{ display: 'flex', alignItems: 'center', marginTop: 20 }}>
                     <div style={{
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         width: 48,
                         height: 48,
                         borderRadius: '50%',
                         background: '#eff6ff',
                         color: '#3b82f6',
                         fontSize: 20,
                         fontWeight: 'bold',
                         marginRight: 16
                     }}>
                        {userName.charAt(0).toUpperCase()}
                     </div>
                     <div style={{ fontSize: 20, color: '#334155' }}>
                         {userName}
                     </div>
                 </div>
            </div>

            {/* Right Column: Image */}
            {imageUrl && (
                <div
                    style={{
                        display: 'flex',
                        width: '60%',
                        height: '100%',
                        background: '#f1f5f9',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Background Pattern decoration */}
                    <div style={{
                        position: 'absolute',
                        top: -50,
                        right: -50,
                        width: 300,
                        height: 300,
                        borderRadius: '50%',
                        background: 'linear-gradient(to bottom left, #3b82f6, #8b5cf6)',
                        opacity: 0.1,
                    }}/>

                    <img
                        src={imageUrl}
                        alt={title}
                        style={{
                            maxWidth: '80%',
                            maxHeight: '80%',
                            objectFit: 'contain',
                            borderRadius: '12px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        }}
                    />
                </div>
            )}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData ? [
          {
              name: 'Noto Sans SC',
              data: fontData,
              style: 'normal',
          }
      ] : undefined, // Fallback if font fails to fetch, will render blocks for Chinese
    }
  )
}
