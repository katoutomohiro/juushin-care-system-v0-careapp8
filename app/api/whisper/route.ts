import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

/**
 * POST /api/whisper
 * multipart/form-data で audio ファイルを受け取り、OpenAI Whisper で文字起こし。
 * OPENAI_API_KEY 未設定時は DRY-RUN メッセージを返す（安全フォールバック）。
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File | null
    if (!audioFile) {
      return NextResponse.json({ error: 'audio file required' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      // DRY-RUN: キー未設定時はダミー応答
      return NextResponse.json({
        text: '[DRY-RUN] whisper disabled (OPENAI_API_KEY not set)',
        durationMs: 0,
      })
    }

    // OpenAI Whisper API へ転送（指数バックオフ付き）
    const startTime = Date.now()
    const whisperFormData = new FormData()
    whisperFormData.append('file', audioFile)
    whisperFormData.append('model', 'whisper-1')
    whisperFormData.append('language', 'ja')

    const response = await fetchWithBackoff(
      'https://api.openai.com/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: whisperFormData,
      },
      5,
      500,
      5000
    )

    const data = await response.json()
    const durationMs = Date.now() - startTime

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || 'Whisper API error', hint: 'Check your OPENAI_API_KEY and quota' },
        { status: response.status }
      )
    }

    return NextResponse.json({
      text: data.text || '',
      durationMs,
    })
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || 'Internal error', hint: 'Server-side exception during Whisper call' },
      { status: 500 }
    )
  }
}

/**
 * 指数バックオフでリトライする fetch ラッパー
 */
async function fetchWithBackoff(
  url: string,
  options: RequestInit,
  maxRetries = 5,
  baseDelay = 500,
  maxDelay = 5000
): Promise<Response> {
  let totalWait = 0
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const res = await fetch(url, options)
      if (res.ok) return res
      if (res.status === 429 || res.status >= 500) {
        if (i === maxRetries) throw new Error(`HTTP ${res.status} after ${maxRetries} retries`)
        const wait = Math.min(baseDelay * 2 ** i, maxDelay - totalWait)
        if (totalWait + wait > maxDelay) throw new Error(`Retry timeout exceeded ${maxDelay}ms`)
        await new Promise((r) => setTimeout(r, wait))
        totalWait += wait
        continue
      }
      // 4xx (429以外) は即座に返す
      return res
    } catch (e: any) {
      if (i === maxRetries || e.message.includes('timeout')) throw e
      const wait = Math.min(baseDelay * 2 ** i, maxDelay - totalWait)
      if (totalWait + wait > maxDelay) throw e
      await new Promise((r) => setTimeout(r, wait))
      totalWait += wait
    }
  }
  throw new Error('Unexpected retry loop exit')
}
