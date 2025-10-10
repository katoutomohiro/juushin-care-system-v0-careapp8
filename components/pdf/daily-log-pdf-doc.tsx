interface DailyLogPdfDocProps {
  dailyLog: any
  careEvents: any[]
}

export function DailyLogPdfDoc({ dailyLog, careEvents }: DailyLogPdfDocProps) {
  const todayEvents = careEvents.filter((event: any) => {
    const eventDate = new Date(event.timestamp).toDateString()
    const today = new Date().toDateString()
    return eventDate === today
  })

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto print:shadow-none shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">日常ケア記録レポート</h1>
        <p className="text-sm text-gray-600">重症心身障がい児者支援システム</p>
      </div>

      {/* User Info */}
      <div className="flex justify-between items-center mb-6 bg-gray-50 p-4 rounded-lg">
        <div className="text-lg font-semibold text-gray-900">利用者: {dailyLog.user}</div>
        <div className="text-sm text-gray-600">記録日: {dailyLog.date}</div>
      </div>

      {/* Summary Section */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4 bg-gray-100 p-3 rounded">記録サマリー</h2>
        <div className="grid grid-cols-2 gap-4">
          {dailyLog.events.map((event: any) => (
            <div key={event.type} className="border border-gray-200 rounded-lg p-4">
              <div className="font-semibold text-gray-900 mb-2">{event.name}</div>
              <div className="text-2xl font-bold text-emerald-600 mb-1">{event.count}回</div>
              <div className="text-xs text-gray-500">最終: {event.lastRecorded}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Records */}
      {todayEvents.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4 bg-gray-100 p-3 rounded">詳細記録</h2>
          <div className="space-y-4">
            {todayEvents.map((event: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3 border-b border-gray-100 pb-2">
                  <div className="font-semibold text-gray-900">
                    {event.eventType === "seizure" && "発作記録"}
                    {event.eventType === "vitals" && "バイタルサイン"}
                    {event.eventType === "hydration" && "水分補給"}
                    {event.eventType === "tube_feeding" && "経管栄養"}
                    {event.eventType === "expression" && "表情・反応"}
                    {event.eventType === "excretion" && "排泄"}
                    {event.eventType === "activity" && "活動"}
                    {event.eventType === "skin_oral_care" && "皮膚・口腔ケア"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(event.timestamp).toLocaleTimeString("ja-JP", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <div className="text-sm text-gray-700 leading-relaxed">
                  {event.eventType === "seizure" && (
                    <div>
                      <span className="font-medium">種類:</span> {event.type || "未記録"} |{" "}
                      <span className="font-medium">持続時間:</span> {event.duration || "未記録"}秒 |{" "}
                      <span className="font-medium">重症度:</span> {event.severity || "未記録"}
                      {event.notes && (
                        <div className="mt-2">
                          <span className="font-medium">備考:</span> {event.notes}
                        </div>
                      )}
                    </div>
                  )}
                  {event.eventType === "vitals" && (
                    <div>
                      <span className="font-medium">体温:</span> {event.temperature || "未記録"}℃ |{" "}
                      <span className="font-medium">血圧:</span> {event.bloodPressureSystolic || "未記録"}/
                      {event.bloodPressureDiastolic || "未記録"} | <span className="font-medium">心拍数:</span>{" "}
                      {event.heartRate || "未記録"}回/分
                      {event.notes && (
                        <div className="mt-2">
                          <span className="font-medium">備考:</span> {event.notes}
                        </div>
                      )}
                    </div>
                  )}
                  {event.eventType === "hydration" && (
                    <div>
                      <span className="font-medium">水分量:</span> {event.amount || "未記録"}ml |{" "}
                      <span className="font-medium">種類:</span> {event.fluidType || "未記録"} |{" "}
                      <span className="font-medium">方法:</span> {event.method || "未記録"}
                      {event.notes && (
                        <div className="mt-2">
                          <span className="font-medium">備考:</span> {event.notes}
                        </div>
                      )}
                    </div>
                  )}
                  {event.eventType === "tube_feeding" && (
                    <div>
                      <span className="font-medium">注入量:</span> {event.amount || "未記録"}ml |{" "}
                      <span className="font-medium">栄養剤:</span> {event.nutritionBrand || "未記録"} |{" "}
                      <span className="font-medium">方法:</span> {event.infusionMethod || "未記録"}
                      {event.notes && (
                        <div className="mt-2">
                          <span className="font-medium">備考:</span> {event.notes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-200 pt-4 text-center text-xs text-gray-500">
        生成日時: {new Date().toLocaleString("ja-JP")} | 重症心身障がい児者支援システム v1.0
      </div>
    </div>
  )
}
