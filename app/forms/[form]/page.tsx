import Link from "next/link";
export const metadata = { title: "フォーム（暫定）" };
type Search = { user?: string; service?: string };

const TITLES: Record<string, string> = {
  seizure: "発作記録（暫定）",
  transport: "送迎記録（暫定）",
  "user-edit": "利用者編集（暫定）",
};

export default async function Page({
  params,
  searchParams,
}: {
  params: { form: string };
  searchParams?: Promise<Search>;
}) {
  const sp = (await searchParams) ?? {};
  const user = sp.user ?? "(不明)";
  const service = sp.service ?? "(不明)";
  const title = TITLES[params.form] ?? `Unknown form: ${params.form}`;

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p>受け取ったクエリ: user=<b>{user}</b>, service=<b>{service}</b></p>
      <p className="text-sm text-muted-foreground">本ページはスタブです。後で本実装に置換します。</p>
      <div className="flex gap-3">
        <Link href="/" className="underline">トップへ</Link>
        {service !== "(不明)" && <Link href={`/services/${service}`} className="underline">サービス一覧へ</Link>}
        {user !== "(不明)" && service !== "(不明)" && (
          <Link href={`/services/${service}/users/${encodeURIComponent(user)}`} className="underline">
            利用者ページへ戻る
          </Link>
        )}
      </div>
    </main>
  );
}
