import "server-only";

const DOMAINS = [
  "健康・生活",
  "運動・感覚",
  "認知・行動",
  "言語・コミュニケーション",
  "人間関係・社会性",
];

export default function PlansDashboardPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">個別支援計画ダッシュボード（ダミー）</h1>
        <p className="text-xs text-gray-600">※まだダミー画面です。将来、5領域ごとの目標・モニタリング・見直し期限を一覧できる画面になる予定です。</p>
      </header>
      <section>
        <div className="grid gap-4 md:grid-cols-2">
          {DOMAINS.map((domain) => (
            <div key={domain} className="rounded-lg border bg-white p-4 shadow-sm space-y-3">
              <h2 className="font-semibold text-gray-900">{domain}</h2>
              <dl className="space-y-2 text-sm text-gray-700">
                <div>
                  <dt className="font-medium">長期目標（ダミー）</dt>
                  <dd className="text-gray-600">ここに長期目標の概要を表示予定。</dd>
                </div>
                <div>
                  <dt className="font-medium">短期目標（ダミー）</dt>
                  <dd className="text-gray-600">ここに短期目標の概要を表示予定。</dd>
                </div>
                <div>
                  <dt className="font-medium">次回見直し予定日</dt>
                  <dd className="text-gray-600">2025-03-31（仮）</dd>
                </div>
                <div>
                  <dt className="font-medium">モニタリング記録</dt>
                  <dd className="text-gray-600">0件（ダミー）</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
