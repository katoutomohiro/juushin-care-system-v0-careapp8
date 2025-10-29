"use client";
import { Font } from "@react-pdf/renderer";

let registered = false;

export function registerNotoIfNeeded() {
  if (registered) return;
  // public/ 配下は /fonts/... で参照可能（ブラウザ実行時）
  Font.register({
    family: "NotoSansJP",
    fonts: [
      { src: "/fonts/NotoSansJP-Regular.ttf", fontWeight: "normal" },
      { src: "/fonts/NotoSansJP-Bold.ttf", fontWeight: "bold" },
    ],
  });
  registered = true;
}
