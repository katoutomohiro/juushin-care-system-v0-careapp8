import { ATCaseRecord, AT_USER_ID } from "@/lib/at-case-record-template"

interface ATCaseRecordPrintProps {
  record: ATCaseRecord
}

export function ATCaseRecordPrint({ record }: ATCaseRecordPrintProps) {
  return (
    <div className="w-full bg-white text-black p-8 text-sm" style={{ fontFamily: "sans-serif" }}>
      {/* A4用紙 210mm x 297mm を想定 */}
      <div style={{ width: "210mm", minHeight: "297mm", margin: "0 auto", padding: "20mm" }}>
        {/* ヘッダ */}
        <div style={{ textAlign: "center", marginBottom: "20px", borderBottom: "2px solid black", paddingBottom: "10px" }}>
          <h1 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>生活介護ケース記録</h1>
          <p style={{ margin: "5px 0 0 0", fontSize: "12px" }}>利用者: {AT_USER_ID}</p>
        </div>

        {/* 記録日・担当者・時間帯 */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "15px",
            fontSize: "11px",
          }}
        >
          <tbody>
            <tr>
              <td style={{ border: "1px solid #ccc", padding: "5px", fontWeight: "bold", width: "20%" }}>
                記録日
              </td>
              <td style={{ border: "1px solid #ccc", padding: "5px", width: "30%" }}>{record.date}</td>
              <td style={{ border: "1px solid #ccc", padding: "5px", fontWeight: "bold", width: "20%" }}>
                担当①
              </td>
              <td style={{ border: "1px solid #ccc", padding: "5px", width: "30%" }}>{record.mainStaff || "-"}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #ccc", padding: "5px", fontWeight: "bold" }}>
                担当②
              </td>
              <td style={{ border: "1px solid #ccc", padding: "5px" }}>{record.subStaff || "-"}</td>
              <td style={{ border: "1px solid #ccc", padding: "5px", fontWeight: "bold" }}>
                サービス時間
              </td>
              <td style={{ border: "1px solid #ccc", padding: "5px" }}>
                {record.serviceStartTime || "-"} ~ {record.serviceEndTime || "-"}
              </td>
            </tr>
          </tbody>
        </table>

        {/* 送迎時刻 */}
        <div style={{ marginBottom: "15px" }}>
          <h3 style={{ margin: "0 0 8px 0", fontWeight: "bold", fontSize: "12px" }}>送迎時刻</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
            <tbody>
              <tr>
                <td style={{ border: "1px solid #ccc", padding: "4px", textAlign: "center", width: "25%", fontWeight: "bold" }}>
                  迎え着
                </td>
                <td style={{ border: "1px solid #ccc", padding: "4px", textAlign: "center", width: "25%" }}>
                  {record.pickupArrive || "-"}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "4px", textAlign: "center", width: "25%", fontWeight: "bold" }}>
                  事業所着
                </td>
                <td style={{ border: "1px solid #ccc", padding: "4px", textAlign: "center", width: "25%" }}>
                  {record.officeArrive || "-"}
                </td>
              </tr>
              <tr>
                <td style={{ border: "1px solid #ccc", padding: "4px", textAlign: "center", fontWeight: "bold" }}>
                  事業所発
                </td>
                <td style={{ border: "1px solid #ccc", padding: "4px", textAlign: "center" }}>
                  {record.officeDeparture || "-"}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "4px", textAlign: "center", fontWeight: "bold" }}>
                  送り着
                </td>
                <td style={{ border: "1px solid #ccc", padding: "4px", textAlign: "center" }}>
                  {record.dropoffArrive || "-"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* バイタル（体温） */}
        <div style={{ marginBottom: "15px" }}>
          <h3 style={{ margin: "0 0 8px 0", fontWeight: "bold", fontSize: "12px" }}>バイタル（体温）℃</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
            <tbody>
              <tr>
                {[0, 1, 2, 3].map(i => (
                  <td key={i} style={{ border: "1px solid #ccc", padding: "4px", textAlign: "center", width: "25%", fontWeight: "bold" }}>
                    {record.bodyTemperatures[i]?.toFixed(1) || "-"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* 水分補給 */}
        <div style={{ marginBottom: "15px" }}>
          <h3 style={{ margin: "0 0 8px 0", fontWeight: "bold", fontSize: "12px" }}>水分補給</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9px" }}>
            <tbody>
              <tr>
                {[0, 1, 2, 3].map(i => (
                  <td key={i} style={{ border: "1px solid #ccc", padding: "3px", textAlign: "center", width: "25%" }}>
                    {record.hydrations[i]?.type && record.hydrations[i]?.amount
                      ? `${record.hydrations[i].type} ${record.hydrations[i].amount}ml`
                      : "-"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* 排尿・排便 */}
        <div style={{ marginBottom: "15px" }}>
          <h3 style={{ margin: "0 0 8px 0", fontWeight: "bold", fontSize: "12px" }}>排尿・排便</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9px" }}>
            <tbody>
              {[[0, 1, 2], [3, 4, 5]].map((row, rowIdx) => (
                <tr key={rowIdx}>
                  {row.map(i => (
                    <td key={i} style={{ border: "1px solid #ccc", padding: "3px", textAlign: "center", width: "33%" }}>
                      <div>尿: {record.excretions[i]?.urinationCount ?? "-"}</div>
                      <div>便: {record.excretions[i]?.defecationStatus || "-"}</div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 食事 */}
        <div style={{ marginBottom: "15px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div>
            <h3 style={{ margin: "0 0 8px 0", fontWeight: "bold", fontSize: "12px" }}>昼食</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9px" }}>
              <tbody>
                <tr>
                  <td style={{ border: "1px solid #ccc", padding: "3px", fontWeight: "bold" }}>主食</td>
                  <td style={{ border: "1px solid #ccc", padding: "3px" }}>{record.lunch.mainFoodRatio ?? "-"}%</td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #ccc", padding: "3px", fontWeight: "bold" }}>副食</td>
                  <td style={{ border: "1px solid #ccc", padding: "3px" }}>{record.lunch.sideDishRatio ?? "-"}%</td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #ccc", padding: "3px", fontWeight: "bold" }}>内服</td>
                  <td style={{ border: "1px solid #ccc", padding: "3px" }}>{record.lunch.medicationTime || "-"}</td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #ccc", padding: "3px", fontWeight: "bold" }}>口腔</td>
                  <td style={{ border: "1px solid #ccc", padding: "3px" }}>
                    {record.lunch.oralCarePerformed ? "✓" : "-"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <h3 style={{ margin: "0 0 8px 0", fontWeight: "bold", fontSize: "12px" }}>間食</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "9px" }}>
              <tbody>
                <tr>
                  <td style={{ border: "1px solid #ccc", padding: "3px", fontWeight: "bold" }}>主食</td>
                  <td style={{ border: "1px solid #ccc", padding: "3px" }}>{record.snack.mainFoodRatio ?? "-"}%</td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #ccc", padding: "3px", fontWeight: "bold" }}>副食</td>
                  <td style={{ border: "1px solid #ccc", padding: "3px" }}>{record.snack.sideDishRatio ?? "-"}%</td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #ccc", padding: "3px", fontWeight: "bold" }}>内服</td>
                  <td style={{ border: "1px solid #ccc", padding: "3px" }}>{record.snack.medicationTime || "-"}</td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #ccc", padding: "3px", fontWeight: "bold" }}>口腔</td>
                  <td style={{ border: "1px solid #ccc", padding: "3px" }}>
                    {record.snack.oralCarePerformed ? "✓" : "-"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 入浴 */}
        <div style={{ marginBottom: "15px" }}>
          <h3 style={{ margin: "0 0 8px 0", fontWeight: "bold", fontSize: "12px" }}>入浴</h3>
          <div style={{ border: "1px solid #ccc", padding: "5px", fontSize: "11px" }}>{record.bathing || "-"}</div>
        </div>

        {/* 課題・活動 */}
        <div style={{ marginBottom: "15px" }}>
          <h3 style={{ margin: "0 0 8px 0", fontWeight: "bold", fontSize: "12px" }}>課題①：ストレッチ・マッサージ</h3>
          <div style={{ fontSize: "10px", marginBottom: "5px" }}>
            {["上肢", "下肢", "肩", "腰", "股関節"]
              .map((label, idx) => {
                const keys = ["upperLimb", "lowerLimb", "shoulder", "waist", "hipJoint"] as const
                return record.stretch?.[keys[idx]] ? label : null
              })
              .filter(Boolean)
              .join("、") || "-"}
          </div>
          <div style={{ border: "1px solid #ccc", padding: "3px", fontSize: "9px", minHeight: "30px" }}>
            {record.stretch?.notes || "-"}
          </div>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <h3 style={{ margin: "0 0 8px 0", fontWeight: "bold", fontSize: "12px" }}>課題②：立ち上がり訓練</h3>
          <div style={{ fontSize: "10px", marginBottom: "5px" }}>
            回数: {record.standup?.count ?? "-"}
          </div>
          <div style={{ border: "1px solid #ccc", padding: "3px", fontSize: "9px", minHeight: "30px" }}>
            {record.standup?.notes || "-"}
          </div>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <h3 style={{ margin: "0 0 8px 0", fontWeight: "bold", fontSize: "12px" }}>課題③：意思疎通</h3>
          <div style={{ fontSize: "10px", marginBottom: "5px" }}>
            支援実施: {record.communication?.supported ? "○" : "×"}
          </div>
          <div style={{ border: "1px solid #ccc", padding: "3px", fontSize: "9px", minHeight: "30px" }}>
            {record.communication?.notes || "-"}
          </div>
        </div>

        {/* 身体拘束・活動・特記 */}
        <div style={{ marginBottom: "15px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div>
            <h3 style={{ margin: "0 0 8px 0", fontWeight: "bold", fontSize: "12px" }}>身体拘束</h3>
            <div style={{ fontSize: "10px" }}>
              {record.restraint?.table && <div>☑ テーブル</div>}
              {record.restraint?.chestBelt && <div>☑ 胸ベルト</div>}
              {!record.restraint?.table && !record.restraint?.chestBelt && <div>-</div>}
            </div>
          </div>
          <div>
            <h3 style={{ margin: "0 0 8px 0", fontWeight: "bold", fontSize: "12px" }}>活動</h3>
            <div style={{ border: "1px solid #ccc", padding: "3px", fontSize: "9px", minHeight: "40px" }}>
              {record.activity || "-"}
            </div>
          </div>
        </div>

        <div>
          <h3 style={{ margin: "0 0 8px 0", fontWeight: "bold", fontSize: "12px" }}>特記事項</h3>
          <div style={{ border: "1px solid #ccc", padding: "3px", fontSize: "9px", minHeight: "50px" }}>
            {record.remarks || "-"}
          </div>
        </div>
      </div>
    </div>
  )
}
