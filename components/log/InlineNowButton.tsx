"use client";
import { Button } from "@/components/ui/button";
import { toDatetimeLocal } from "@/lib/datetime";

type Props = { setValue: (v: string) => void; className?: string };

export default function InlineNowButton({ setValue, className }: Props) {
  return (
    <Button type="button" variant="secondary" className={className} onClick={() => setValue(toDatetimeLocal())}>
      今すぐ
    </Button>
  );
}
