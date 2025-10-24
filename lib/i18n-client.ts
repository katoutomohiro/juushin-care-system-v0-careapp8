"use client";

export function useTranslation(){
  const t = (key: string, fallback?: string) => (fallback ?? key);
  return { t };
}
