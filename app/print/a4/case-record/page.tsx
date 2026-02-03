/**
 * A4印刷専用ページ - ケース記録
 * ATさんのケース記録をA4サイズ（210mm × 297mm）で正確に印刷するための専用レイアウト
 */

import React from "react"
import styles from "./print.module.css"

export default function A4CaseRecordPrintPage() {
  // TODO: URLパラメータまたはクエリからデータを取得
  // 現在は静的なレイアウトのみ実装
  
  const recordData = {
    // 基本情報
    userId: "A・T",
    recordDate: "2026年1月8日",
    recordTime: "14:30",
    mainStaff: "スタッフA",
    subStaff: "",
    
    // リハビリ
    stretchMassage: "",
    challenge1Title: "側弯・拘縮予防",
    challenge1Details: "",
    challenge2Title: "下肢機能低下防止",
    challenge2StandingCount: "",
    challenge2Details: "",
    
    // 意思疎通
    challenge3Title: "意思疎通",
    challenge3Communication: [],
    challenge3Details: "",
    
    // 活動
    activityContent: "",
    
    // 身体拘束
    restraintStatus: "",
    restraintReason: "",
    
    // 特記事項
    specialNotes: "",
  }

  return (
    <div className={styles.printContainer}>
      {/* ページタイトル */}
      <div className={styles.pageTitle}>
        ケース記録（A・T様）
      </div>

      {/* 基本情報セクション */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>基本情報</div>
        <div className={styles.basicInfoGrid}>
          <div className={styles.fieldRow}>
            <div className={styles.fieldLabel}>利用者</div>
            <div className={styles.fieldValue}>{recordData.userId}</div>
          </div>
          <div className={styles.fieldRow}>
            <div className={styles.fieldLabel}>記録日</div>
            <div className={styles.fieldValue}>{recordData.recordDate}</div>
          </div>
          <div className={styles.fieldRow}>
            <div className={styles.fieldLabel}>記録時刻</div>
            <div className={styles.fieldValue}>{recordData.recordTime}</div>
          </div>
          <div className={styles.fieldRow}>
            <div className={styles.fieldLabel}>担当スタッフ</div>
            <div className={styles.fieldValue}>{recordData.mainStaff}</div>
          </div>
        </div>
      </div>

      {/* リハビリセクション */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>リハビリ</div>
        
        {/* ストレッチ・マッサージ */}
        <div className={styles.fieldRow}>
          <div className={styles.fieldLabel}>ストレッチ・マッサージ</div>
          <div className={styles.fieldValueTextarea}>{recordData.stretchMassage}</div>
        </div>

        {/* 課題① 側弯・拘縮予防 */}
        <div style={{ marginTop: "5mm" }}>
          <div className={styles.fieldRow}>
            <div className={styles.fieldLabel}>課題① {recordData.challenge1Title}</div>
            <div className={styles.fieldValue}></div>
          </div>
          <div className={styles.fieldRow}>
            <div className={styles.fieldLabel}>実施内容</div>
            <div className={styles.fieldValueTextarea}>{recordData.challenge1Details}</div>
          </div>
        </div>

        {/* 課題② 下肢機能低下防止 */}
        <div style={{ marginTop: "5mm" }}>
          <div className={styles.fieldRow}>
            <div className={styles.fieldLabel}>課題② {recordData.challenge2Title}</div>
            <div className={styles.fieldValue}></div>
          </div>
          <div className={styles.fieldRow}>
            <div className={styles.fieldLabel}>立ち上がり訓練（回数）</div>
            <div className={styles.fieldValue}>{recordData.challenge2StandingCount}</div>
          </div>
          <div className={styles.fieldRow}>
            <div className={styles.fieldLabel}>実施内容</div>
            <div className={styles.fieldValueTextarea}>{recordData.challenge2Details}</div>
          </div>
        </div>
      </div>

      {/* 意思疎通セクション */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>意思疎通</div>
        
        <div className={styles.fieldRow}>
          <div className={styles.fieldLabel}>課題③ {recordData.challenge3Title}</div>
          <div className={styles.fieldValue}></div>
        </div>
        
        <div style={{ marginBottom: "3mm" }}>
          <div className={styles.fieldLabel} style={{ marginBottom: "2mm" }}>コミュニケーション方法</div>
          <div className={styles.checkboxGroup}>
            <div className={styles.checkboxItem}>
              <span className={styles.checkboxBox}></span>
              <span>声掛け反応</span>
            </div>
            <div className={styles.checkboxItem}>
              <span className={styles.checkboxBox}></span>
              <span>カード</span>
            </div>
            <div className={styles.checkboxItem}>
              <span className={styles.checkboxBox}></span>
              <span>視線接触</span>
            </div>
            <div className={styles.checkboxItem}>
              <span className={styles.checkboxBox}></span>
              <span>トイレ誘導</span>
            </div>
            <div className={styles.checkboxItem}>
              <span className={styles.checkboxBox}></span>
              <span>身振り</span>
            </div>
            <div className={styles.checkboxItem}>
              <span className={styles.checkboxBox}></span>
              <span>その他</span>
            </div>
          </div>
        </div>
        
        <div className={styles.fieldRow}>
          <div className={styles.fieldLabel}>実施内容・様子</div>
          <div className={styles.fieldValueTextarea}>{recordData.challenge3Details}</div>
        </div>
      </div>

      {/* 活動セクション */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>活動</div>
        <div className={styles.fieldRow}>
          <div className={styles.fieldLabel}>活動等の内容</div>
          <div className={styles.fieldValueTextarea}>{recordData.activityContent}</div>
        </div>
      </div>

      {/* 身体拘束セクション */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>身体拘束</div>
        
        <div style={{ marginBottom: "3mm" }}>
          <div className={styles.fieldLabel} style={{ marginBottom: "2mm" }}>身体拘束の有無</div>
          <div className={styles.checkboxGroup}>
            <div className={styles.checkboxItem}>
              <span className={styles.checkboxBox}></span>
              <span>無</span>
            </div>
            <div className={styles.checkboxItem}>
              <span className={styles.checkboxBox}></span>
              <span>有（車いす）</span>
            </div>
            <div className={styles.checkboxItem}>
              <span className={styles.checkboxBox}></span>
              <span>有（テーブル）</span>
            </div>
            <div className={styles.checkboxItem}>
              <span className={styles.checkboxBox}></span>
              <span>有（胸ベルト）</span>
            </div>
            <div className={styles.checkboxItem}>
              <span className={styles.checkboxBox}></span>
              <span>有（その他）</span>
            </div>
          </div>
        </div>
        
        <div className={styles.fieldRow}>
          <div className={styles.fieldLabel}>実施理由（実施した場合）</div>
          <div className={styles.fieldValueTextarea}>{recordData.restraintReason}</div>
        </div>
      </div>

      {/* 特記事項セクション */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>特記事項</div>
        <div className={styles.fieldRow}>
          <div className={styles.fieldLabel}>特記事項</div>
          <div className={styles.fieldValueTextarea}>{recordData.specialNotes}</div>
        </div>
      </div>
    </div>
  )
}
