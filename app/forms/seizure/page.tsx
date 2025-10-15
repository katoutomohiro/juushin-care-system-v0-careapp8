import Link from "next/link";

export const metadata = { title: "発作記録（暫定）" };

// Next.js 15: searchParams may be a Promise, so make the Page async and await it.
type Search = { user?: string; service?: string };

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Search>;
}) {
  const sp = (await searchParams) ?? {};
  const user = sp.user ?? "(不明)";
  const service = sp.service ?? "(不明)";
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">発作記録（暫定ページ）</h1>
      <p>受け取ったクエリ: user=<b>{user}</b>, service=<b>{service}</b></p>
      <p className="text-sm text-muted-foreground">
        本ページは 404 回避のスタブです。後でフォーム実装に差し替えます。
      </p>
      <div className="flex gap-3">
        <Link href="/" className="underline">トップへ</Link>
        <Link href={`/services/${service}`} className="underline">サービス一覧へ</Link>
        {user !== "(不明)" && service !== "(不明)" && (
          <Link href={`/services/${service}/users/${encodeURIComponent(user)}`} className="underline">
            利用者ページへ戻る
          </Link>
        )}
      </div>
    </main>
  );
}
