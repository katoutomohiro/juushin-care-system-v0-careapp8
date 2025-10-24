/**
 * 簡易i18nヘルパー (next-i18next完全統合前の段階的導入用)
 * 
 * 使い方:
 * ```tsx
 * import { useTranslation } from '@/lib/i18n'
 * 
 * function MyComponent() {
 *   const { t } = useTranslation()
 *   return <h1>{t('app.title')}</h1>
 * }
 * ```
 */

'use client'

import { useState, useEffect } from 'react'

type Translations = Record<string, string>
type LocaleData = Record<string, Translations>

// クライアントサイドのシンプルな翻訳ストア
let cachedTranslations: LocaleData = {}
let currentLocale = 'ja'

export function setLocale(locale: string) {
  currentLocale = locale
  if (typeof window !== 'undefined') {
    localStorage.setItem('locale', locale)
  }
}

export function getLocale() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('locale') || 'ja'
  }
  return currentLocale
}

async function loadTranslations(locale: string): Promise<Translations> {
  if (cachedTranslations[locale]) {
    return cachedTranslations[locale]
  }

  try {
    // locales/{locale}/common.json を動的にロード
    const response = await fetch(`/locales/${locale}/common.json`)
    if (!response.ok) {
      throw new Error(`Failed to load translations for ${locale}`)
    }
    const translations = await response.json()
    cachedTranslations[locale] = translations
    return translations
  } catch (error) {
    console.warn(`Failed to load ${locale} translations, falling back to ja`, error)
    // フォールバック: jaを試す
    if (locale !== 'ja') {
      return loadTranslations('ja')
    }
    return {}
  }
}

export function useTranslation() {
  const [translations, setTranslations] = useState<Translations>({})
  const [locale, setLocaleState] = useState(() => getLocale())

  useEffect(() => {
    loadTranslations(locale).then(setTranslations)
  }, [locale])

  const t = (key: string, fallback?: string): string => {
    return translations[key] || fallback || key
  }

  const changeLocale = (newLocale: string) => {
    setLocale(newLocale)
    setLocaleState(newLocale)
  }

  return { t, locale, changeLocale }
}

// サーバーコンポーネント用のシンプルな翻訳関数
export async function getTranslation(locale: string = 'ja') {
  const translations = await loadTranslations(locale)
  return {
    t: (key: string, fallback?: string) => translations[key] || fallback || key,
    locale,
  }
}
