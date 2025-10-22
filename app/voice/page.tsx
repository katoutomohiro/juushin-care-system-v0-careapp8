import React from 'react'
import VoiceRecorder from '@/components/VoiceRecorder'

export const metadata = {
  title: '音声入力 | CareApp',
}

export default function VoicePage() {
  return (
    <main className="mx-auto max-w-5xl p-4">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">音声入力</h1>
      <p className="mb-6 text-gray-600">Web Speech API による音声→テキスト（対応ブラウザのみ）。簡易レベルメーターとテキストプレビュー、保存(ダミー)が利用できます。</p>
      <VoiceRecorder />
    </main>
  )
}
