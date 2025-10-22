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
    } catch (_) {
      // 既に開始済みなら例外が出ることがあるが無視
    }
  }

  return {
    start: () => {
      try {
        recognition.start()
      } catch (e) {
        // 二重開始防止
      }
    },
    stop: () => {
      try {
        recognition.onend = null
        recognition.stop()
      } catch (e) {
        // ignore
      }
    },
  }
}

async function saveToSupabaseDummy(text: string, meta: Record<string, any>) {
  // TODO: 後日 Supabase SDK 接続
  // ここでは擬似的に遅延して成功扱い
  await new Promise((r) => setTimeout(r, 400))
  return { id: 'dummy-id', ...meta, length: text.length }
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

  const startedAtRef = useRef<number | null>(null)
  const timerRef = useRef<number | null>(null)
  const levelTimerRef = useRef<number | null>(null)

  const streamRef = useRef<MediaStream | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const transcriberRef = useRef<Transcriber | null>(null)

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
      startTimer()
      setIsRecording(true)
    } catch (e: any) {
      setMessage(e?.message || 'マイクの使用に失敗しました')
      stopStreamAndMeter()
    }
  }, [isRecording, startStreamAndMeter, startTimer, stopStreamAndMeter, supported])

  const stopRecording = useCallback(() => {
    if (!isRecording) return
    transcriberRef.current?.stop()
    stopStreamAndMeter()
    stopTimer()
    setIsRecording(false)
  }, [isRecording, stopStreamAndMeter, stopTimer])

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
      const res = await saveToSupabaseDummy(transcript, { elapsed })
      setMessage(`保存しました (id: ${res.id})`)
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
          {saving ? '保存中…' : '保存(ダミー)'}
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
