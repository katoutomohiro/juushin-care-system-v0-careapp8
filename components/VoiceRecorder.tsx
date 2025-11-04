'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// 簡易型定義（ブラウザ実装差や型未提供環境への配慮）
type SpeechRecognitionConstructor = new () => any
declare global {
  interface Window {
    webkitSpeechRecognition?: SpeechRecognitionConstructor
    SpeechRecognition?: SpeechRecognitionConstructor
  }
}

type Transcriber = {
  start: () => void
  stop: () => void
}

type CreateTranscriberOptions = {
  lang?: string
  interimResults?: boolean
  continuous?: boolean
  onPartial?: (text: string) => void
  onFinal?: (text: string) => void
  onError?: (err: Error) => void
}

type TranscriptionMode = 'web-speech' | 'whisper'

/**
 * 指数バックオフでリトライする fetch ラッパー
 * @param url - リクエスト先
 * @param options - fetch options
 * @param maxRetries - 最大リトライ回数
 * @param baseDelay - 初回待機時間(ms)
 * @param maxDelay - 累計待機上限(ms)
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

// 将来 Whisper API に置換できるよう、Web Speech API 実装を分離
function createWebTranscriber(opts: CreateTranscriberOptions = {}): Transcriber | null {
  const SR = (typeof window !== 'undefined') && (window.SpeechRecognition || window.webkitSpeechRecognition)
  if (!SR) return null

  const recognition = new SR()
  recognition.lang = opts.lang ?? 'ja-JP'
  recognition.interimResults = opts.interimResults ?? true
  recognition.continuous = opts.continuous ?? true

  // テキスト連結管理
  let current = ''

  recognition.onresult = (event: any) => {
    let interim = ''
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const res = event.results[i]
      if (res.isFinal) {
        current += res[0].transcript
        opts.onFinal?.(current)
      } else {
        interim += res[0].transcript
      }
    }
    if (interim) {
      opts.onPartial?.(current + interim)
    } else {
      opts.onPartial?.(current)
    }
  }

  recognition.onerror = (e: any) => {
    const err = new Error(e?.error || 'speech recognition error')
    opts.onError?.(err)
  }

  // 一部ブラウザは自動で終了するため、録音中は再開する
  recognition.onend = () => {
    try {
      recognition.start()
    } catch {
      // 既に開始済みなら例外が出ることがあるが無視
    }
  }

  return {
    start: () => {
      try {
        recognition.start()
      } catch {
        // 二重開始防止
      }
    },
    stop: () => {
      try {
        recognition.onend = null
        recognition.stop()
      } catch {
        // ignore
      }
    },
  }
}

function formatElapsed(ms: number) {
  const s = Math.floor(ms / 1000)
  const mm = String(Math.floor(s / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

export default function VoiceRecorder() {
  const [supported, setSupported] = useState<boolean>(false)
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [level, setLevel] = useState(0)
  const [message, setMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [mode, setMode] = useState<TranscriptionMode>('web-speech')

  const startedAtRef = useRef<number | null>(null)
  const timerRef = useRef<number | null>(null)
  const levelTimerRef = useRef<number | null>(null)

  const streamRef = useRef<MediaStream | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const transcriberRef = useRef<Transcriber | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const levelSumRef = useRef<number>(0)
  const levelCountRef = useRef<number>(0)

  // サポート確認
  useEffect(() => {
    const hasSR = typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition)
    const hasMedia = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia
    setSupported(hasSR && hasMedia)
  }, [])

  // 音量レベル更新ループ
  const startLevelMeter = useCallback(() => {
    const analyser = analyserRef.current
    if (!analyser) return
    const buf = new Uint8Array(analyser.fftSize)
    levelSumRef.current = 0
    levelCountRef.current = 0
    const loop = () => {
      analyser.getByteTimeDomainData(buf)
      // 0-255 の中点128からの振幅の平均で簡易レベル
      let sum = 0
      for (let i = 0; i < buf.length; i++) {
        const v = buf[i] - 128
        sum += v * v
      }
      const rms = Math.sqrt(sum / buf.length) // 0..~
      const normalized = Math.min(1, rms / 64) // 大きめに正規化
      setLevel(normalized)
      // 平均計算用
      levelSumRef.current += normalized
      levelCountRef.current += 1
      levelTimerRef.current = window.setTimeout(loop, 66) // ~15fps
    }
    loop()
  }, [])

  const stopLevelMeter = useCallback(() => {
    if (levelTimerRef.current) {
      window.clearTimeout(levelTimerRef.current)
      levelTimerRef.current = null
    }
    setLevel(0)
  }, [])

  const startTimer = useCallback(() => {
    startedAtRef.current = Date.now()
    const tick = () => {
      if (startedAtRef.current) setElapsed(Date.now() - startedAtRef.current)
      timerRef.current = window.setTimeout(tick, 200)
    }
    tick()
  }, [])

  const stopTimer = useCallback(() => {
    startedAtRef.current = null
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startStreamAndMeter = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    streamRef.current = stream
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    audioCtxRef.current = ctx
    const source = ctx.createMediaStreamSource(stream)
    sourceRef.current = source
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 2048
    analyserRef.current = analyser
    source.connect(analyser)
    startLevelMeter()
  }, [startLevelMeter])

  const stopStreamAndMeter = useCallback(() => {
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop())
    } catch {}
    try {
      sourceRef.current?.disconnect()
    } catch {}
    try {
      audioCtxRef.current?.close()
    } catch {}
    streamRef.current = null
    sourceRef.current = null
    analyserRef.current = null
    audioCtxRef.current = null
    stopLevelMeter()
  }, [stopLevelMeter])

  const startRecording = useCallback(async () => {
    if (!supported || isRecording) return
    setMessage(null)
    try {
      setTranscript('')
      await startStreamAndMeter()
      const stream = streamRef.current
      if (!stream) throw new Error('Stream not available')

      // MediaRecorder でBlobを録音（Whisper用）
      recordedChunksRef.current = []
      try {
        const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) recordedChunksRef.current.push(e.data)
        }
        recorder.start()
        mediaRecorderRef.current = recorder
      } catch {
        // MediaRecorder未対応の場合も続行（Whisperモード選択時にエラー表示）
      }

      if (mode === 'web-speech') {
        const transcriber = createWebTranscriber({
          onPartial: (t) => setTranscript(t),
          onFinal: (t) => setTranscript(t),
          onError: (e) => setMessage(`音声認識エラー: ${e.message}`),
        })
        if (!transcriber) {
          setMessage('このブラウザは Web Speech API に対応していません。別ブラウザをご検討ください。')
          return
        }
        transcriberRef.current = transcriber
        transcriber.start()
      }
      startTimer()
      setIsRecording(true)
    } catch (e: any) {
      setMessage(e?.message || 'マイクの使用に失敗しました')
      stopStreamAndMeter()
    }
  }, [isRecording, mode, startStreamAndMeter, startTimer, stopStreamAndMeter, supported])

  const stopRecording = useCallback(async () => {
    if (!isRecording) return
    transcriberRef.current?.stop()
    
    // MediaRecorder停止
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    
    stopStreamAndMeter()
    stopTimer()
    setIsRecording(false)

    // Whisperモードの場合はサーバへ送信
    if (mode === 'whisper' && recordedChunksRef.current.length > 0) {
      setMessage('Whisper で変換中…')
      try {
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' })
        const formData = new FormData()
        formData.append('audio', blob, 'recording.webm')
        
        const res = await fetchWithBackoff('/api/whisper', {
          method: 'POST',
          body: formData,
        })
        const data = await res.json()
        if (data.error) {
          setMessage(`Whisper エラー: ${data.error}`)
        } else {
          setTranscript(data.text || '')
          setMessage(data.text?.includes('[DRY-RUN]') ? 'DRY-RUN: OPENAI_API_KEY 未設定' : 'Whisper 変換完了')
        }
      } catch (e: any) {
        setMessage(`Whisper 呼び出し失敗: ${e.message}`)
      }
    }
  }, [isRecording, mode, stopStreamAndMeter, stopTimer])

  useEffect(() => {
    return () => {
      // アンマウント時クリーンアップ
      try { transcriberRef.current?.stop() } catch {}
      stopStreamAndMeter()
      stopTimer()
    }
  }, [stopStreamAndMeter, stopTimer])

  const onKeyDownToggle = useCallback((e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      isRecording ? stopRecording() : startRecording()
    }
  }, [isRecording, startRecording, stopRecording])

  const canSave = useMemo(() => transcript.trim().length > 0 && !saving, [transcript, saving])

  const onSave = useCallback(async () => {
    if (!canSave) return
    setSaving(true)
    setMessage(null)
    try {
      const avgLevel = levelCountRef.current > 0 ? levelSumRef.current / levelCountRef.current : 0
      const res = await fetch('/api/voice/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: transcript,
          durationMs: elapsed,
          avgLevel,
          device: navigator.userAgent,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage(`保存失敗: ${data.error || 'unknown'}`)
      } else {
        setMessage(`保存しました (id: ${data.id})`)
      }
    } catch (e: any) {
      setMessage(`保存に失敗しました: ${e?.message || 'unknown'}`)
    } finally {
      setSaving(false)
    }
  }, [canSave, elapsed, transcript])

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h2 className="text-2xl font-semibold mb-4">音声入力</h2>
      {!supported && (
        <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-900">
          このブラウザは音声認識（Web Speech API）またはマイク取得に対応していません。対応ブラウザをご利用ください。
        </div>
      )}

      {/* モード切替 */}
      <div className="mb-4 flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">認識モード:</span>
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="radio"
            name="mode"
            value="web-speech"
            checked={mode === 'web-speech'}
            onChange={() => setMode('web-speech')}
            disabled={isRecording}
            className="mr-1.5 focus:ring-2 focus:ring-emerald-500"
          />
          <span className="text-sm">Web Speech (ブラウザ)</span>
        </label>
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="radio"
            name="mode"
            value="whisper"
            checked={mode === 'whisper'}
            onChange={() => setMode('whisper')}
            disabled={isRecording}
            className="mr-1.5 focus:ring-2 focus:ring-emerald-500"
          />
          <span className="text-sm">Whisper (サーバ)</span>
        </label>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <button
          type="button"
          className={`select-none rounded-full px-8 py-6 text-lg font-semibold shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-colors ${isRecording ? 'bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-500' : 'bg-emerald-600 hover:bg-emerald-700 text-white focus-visible:ring-emerald-500'} ${!supported ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label={isRecording ? '録音停止' : '録音開始'}
          onClick={() => (isRecording ? stopRecording() : startRecording())}
          onKeyDown={onKeyDownToggle}
          disabled={!supported}
        >
          {isRecording ? '停止' : '録音'}
        </button>

        <button
          type="button"
          className="rounded-md px-4 py-3 text-base font-medium border border-gray-300 bg-white hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 disabled:opacity-50"
          onClick={onSave}
          disabled={!canSave}
        >
          {saving ? '保存中…' : '保存'}
        </button>

        <div className="flex items-center gap-2" aria-live="polite">
          <span className="text-sm text-gray-600">時間</span>
          <span className="font-mono tabular-nums">{formatElapsed(elapsed)}</span>
        </div>
      </div>

      {/* 簡易レベルメーター */}
      <div className="mb-4">
        <div className="flex h-3 w-full items-stretch gap-[2px]">
          {Array.from({ length: 12 }).map((_, i) => {
            const filled = Math.round(level * 12) > i
            return (
              <div key={i} className={`h-full flex-1 rounded ${filled ? 'bg-emerald-500' : 'bg-gray-200'}`} />
            )
          })}
        </div>
        <span className="sr-only" aria-live="polite">音量 {Math.round(level * 100)}%</span>
      </div>

      <div className="mb-2 text-sm text-gray-600">テキストプレビュー</div>
      <div className="min-h-[6rem] rounded-md border border-gray-200 bg-white p-3" aria-live="polite">
        {transcript ? (
          <p className="whitespace-pre-wrap leading-relaxed">{transcript}</p>
        ) : (
          <p className="text-gray-400">ここに音声認識結果が表示されます…</p>
        )}
      </div>

      {message && (
        <div className="mt-4 rounded-md border border-blue-300 bg-blue-50 p-3 text-blue-900" role="status" aria-live="polite">
          {message}
        </div>
      )}
    </div>
  )
}
