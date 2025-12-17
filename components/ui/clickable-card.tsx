"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ClickableCardProps = {
  /** 遷移先のパス。例: "/services/life-care" */
  href?: string;
  /** 追加で実行したいクリック処理（任意） */
  onClick?: (event: MouseEvent<HTMLDivElement>) => void | Promise<void>;
  className?: string;
  children: ReactNode;
  /** パーティクルエフェクトの色配列（任意） */
  particleColors?: string[];
};

export function ClickableCard({
  href,
  onClick,
  className,
  children,
  particleColors: _particleColors,
}: ClickableCardProps) {
  // onClick を指定している場合だけラップして実行
  const handleClick = async (event: MouseEvent<HTMLDivElement>) => {
    if (!onClick) return;

    try {
      await onClick(event);
    } catch (error) {
      // エラーはログだけ出して、Link のナビゲーションは止めない
       
      console.error("[ClickableCard] onClick error", error);
    }
  };

  const content = (
    <div
      className={cn(
        "block cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md",
        className,
      )}
      onClick={onClick ? handleClick : undefined}
    >
      {children}
    </div>
  );

  // href があれば Link でラップしてページ遷移させる
  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  // href が無い場合は onClick だけで使う（ダイアログを開くなど）
  return content;
}
