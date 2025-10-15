import Link from "next/link";

export const metadata = { title: "フォーム（暫定）" };

type Search = Record<string, string | string[] | undefined>;
const TITLES: Record<string, string> = {
  seizure: "発作記録（暫定）",
  transport: "送迎記録（暫定）",
  "user-edit": "利用者編集（暫定）",
};

export default async function Page(props: any) {
  const form = props?.params?.form ?? "unknown";
  const raw = props?.searchParams;
  const sp: Search = raw && typeof raw.then === "function" ? await raw : raw ?? {};
  const get = (k: string) => (Array.isArray(sp[k]) ? sp[k]?.[0] : (sp[k] as string | undefined)) ?? "";

  const user = get("user") || "(不明)";
  const service = get("service") || "(不明)";
  const title = TITLES[form] ?? `Unknown form: ${form}`;

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p>受け取ったクエリ: user=<b>{user}</b>, service=<b>{service}</b></p>
      <p className="text-sm text-muted-foreground">本ページはスタブです。後で本実装に置換します。</p>
    </main>
  );
}
