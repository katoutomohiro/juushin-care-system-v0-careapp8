import React from "react";

type Params = { form: string };
type Search = { user?: string | string[]; service?: string | string[] };

const first = (v?: string | string[]) =>
  Array.isArray(v) ? (v[0] ?? "") : (v ?? "");

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams?: Promise<Search>;
}) {
  // ⬇️ Next 15: params / searchParams は Promise。必ず await する
  const { form } = await params;
  const sp = (searchParams ? await searchParams : {}) as Search;

  const user = first(sp.user);
  const service = first(sp.service);

  // ここは仮のスタブ。必要に応じて本実装に差し替え
  return (
    <main className="p-6">
      <h1 className="text-xl font-bold">Form: {form}</h1>
      <p className="mt-2 text-sm text-gray-600">
        user=<code>{user}</code>, service=<code>{service}</code>
      </p>
      <div className="mt-6 rounded-lg border p-4">
        <p>ここに {form} のフォーム実装を差し込みます。</p>
      </div>
    </main>
  );
}
