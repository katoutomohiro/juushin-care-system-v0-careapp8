# 重忁E��アアプリ開発�E��E進機�E統合�Eラン�E�E2025.11.01版！E
## 🚀 目皁E
日本国冁E���E医療的ケア児老E��医ケア児）支援の最新動向を踏まえ、E��痁E��E��障がぁE�E老E��特化したケアアプリにおいて世界最高峰を目持E��先進機�Eを計画皁E��段階実裁E��るため�Eリファレンス斁E��、E
## ✁E優先度付き導�Eロード�EチE�E

### ✁ESTEP 1�E�即効性の高い業務効玁E��支援

**目樁E*: 日常業務�E記録・報告作業を大幁E��効玁E��し、スタチE��の負拁E��軽減すめE
#### 実裁E��E��

1. **音声入力による日誌記録 ↁE自動レポ�Eト生成機�E�E�EPT�E�E*
   - 状慁E 🚧 一部実裁E��み
   - 既存実裁E `components/VoiceRecorder.tsx`�E�Eeb Speech API�E�E   - 次のアクション:
     - [ ] OpenAI Whisper API連携�E�より高精度な斁E��起こし�E�E     - [ ] 音声から構造化データへの自動変換�E�EPT-4によるパ�Eス�E�E     - [ ] 記録カチE��リ自動推定（バイタル/発佁Eケア/観察！E
2. **AI要紁E���E�E�EangChain + GPT�E�をPDF月次レポ�Eトと連携**
   - 状慁E ✁E実裁E��み
   - 実裁E��み:
     - `services/langchain/agent.ts`: GPTベ�Eス要紁E��数
     - `config/langchain.ts`: モチE��設定�E一允E��琁E     - `tests/unit/langchain-agent.spec.ts`: ユニットテスト！E件�E�E   - 次のアクション:
     - [ ] 月次レポ�Eト生成フローへの統合！Ereports/generateMonthlyReport.ts`�E�E     - [ ] PDFコンポ�EネントへのAI要紁E��示�E�Ecomponents/pdf/monthly-report-doc.tsx`�E�E     - [ ] キャチE��ング機構（同一月�E再要紁E��避ける�E�E
3. **服薬リマインダー・与薬記録・相互作用警告（最低限実裁E��E*
   - 状慁E ⏳ 未着扁E   - 忁E��な実裁E
     - [ ] 服薬スケジュールチE�Eタ構造�E�Eexie DB拡張�E�E     - [ ] リマインダー通知機�E�E�Eervice Worker + Push API�E�E     - [ ] 与薬記録フォーム�E�投薬時刻/薬剤吁E用量！E     - [ ] 相互作用チェチE���E�薬剤マスタとの照合！E
---

### ✁ESTEP 2�E�家族と多�E種連携の強匁E
**目樁E*: 家族�E医療老E�E福祉スタチE��間�E惁E��共有を冁E��化し、チームケアの質を向上させる

#### 実裁E��E��

1. **関係老E��定チャチE��・メモ共有機�E�E�EIPAA準拠�E�E*
   - 状慁E ⏳ 未着扁E   - 忁E��な実裁E
     - [ ] リアルタイムメチE��ージング�E�EebSocket or Firebase Realtime DB�E�E     - [ ] ロールベ�Eスアクセス制御�E�家旁E医師/看護師/スタチE���E�E     - [ ] エンドツーエンド暗号化！Eeb Crypto API�E�E     - [ ] 監査ログ�E�誰がいつ何を閲覧/編雁E��たか�E�E
2. **共有カレンダー�E�ToDo�E�ファイル�E�診療サマリー等）保管**
   - 状慁E 🚧 一部実裁E��み�E�家族�Eータル仮ペ�Eジ�E�E   - 既存実裁E `app/family/page.tsx`�E��E有コード生成�EQR表示�E�E   - 次のアクション:
     - [ ] ToDoリストデータ構造�E�優先度/拁E��老E期限/完亁E��態！E     - [ ] カレンダーUI�E�予定�E劁E通知設定！E     - [ ] ファイルアチE�Eロード�Eプレビュー機�E�E�EDF/画像！E     - [ ] 共有篁E��設定（�E員/特定ユーザーのみ�E�E
3. **緊急通知機�E�E�EpO₂�E忁E��アラート、SOS送信�E�E*
   - 状慁E 🚧 一部実裁E��み�E�EI監視基盤�E�E   - 既存実裁E
     - `services/ai-monitoring/index.ts`: 閾値ベ�Eス異常検知
     - `app/settings/thresholds/page.tsx`: 閾値設定UI
   - 次のアクション:
     - [ ] リアルタイム通知�E�Eervice Worker + Push通知�E�E     - [ ] SMS/メール送信連携�E�Ewilio/SendGrid�E�E     - [ ] 緊急連絡先管琁EI
     - [ ] SOSボタン配置�E�ワンタチE�Eで全関係老E��通知�E�E
---

### ✁ESTEP 3�E�バイタル・排況E�E生活支援チE�Eタ連携

**目樁E*: IoTセンサー・ウェアラブルチE��イスと連携し、客観皁E��ータに基づくケアを実現する

#### 実裁E��E��

1. **DFree/ウェアラブル連携による排況E��測 ↁEアプリ通知**
   - 状慁E ⏳ 未着扁E   - 忁E��な実裁E
     - [ ] Bluetooth Low Energy (BLE) 接続ライブラリ
     - [ ] DFree SDK統合（排況E��測API�E�E     - [ ] 予測通知UI�E�、E0刁E��冁E��排況E�E可能性」！E     - [ ] 排況E��録との自動紐付け

2. **SpO₁E忁E��のBluetooth連携、状態変化を記録・警呁E*
   - 状慁E 🚧 一部実裁E��み�E�手動�E力�Eみ�E�E   - 既存実裁E `components/forms/vitals-form.tsx`�E�手動バイタル入力！E   - 次のアクション:
     - [ ] BLE対応パルスオキシメータ連携
     - [ ] 自動記録�E�バチE��グラウンドで定期取得！E     - [ ] 異常値検知時�E自動警告！EI監視と統合！E
3. **体位変換リマインダーとセンサー統合（褥瘡予防�E�E*
   - 状慁E ⏳ 未着扁E   - 忁E��な実裁E
     - [ ] 体位変換スケジュール管琁E     - [ ] 圧力センサー連携�E��EチE��埋込垁Eマット型�E�E     - [ ] リマインダー通知�E�E時間ごと等！E     - [ ] 体位変換記録フォーム�E�左側臥佁E右側臥佁E仰臥位！E
---

### ✁ESTEP 4�E�本人向け機�E�E�インクルーシブ設計！E
**目樁E*: 利用老E��人の自己決定�E表現・創作活動を支援し、QOLを向上させる

#### 実裁E��E��

1. **非言語コミュニケーション支援�E�意思伝達裁E��連携�E�E*
   - 状慁E ⏳ 未着扁E   - 参老E��品E 「いしん伝忁E��（視線�E劁Eジェスチャー認識！E   - 忁E��な実裁E
     - [ ] Mediapipe統合（視線追跡/ジェスチャー検�E�E�E     - [ ] 意思表示ボタン配置�E�「�EぁEぁE��ぁE痛い/嬉しぁE��等！E     - [ ] 記録との連携�E�感惁E�E意思表示を日誌に自動追加�E�E
2. **感覚刺激�E�Eight Box等）や創作支援�E��EチE��ア連携�E�E*
   - 状慁E ⏳ 未着扁E   - 参老E��品E 「Poteer」（身体動作�EアーチE音楽生�E�E�E   - 忁E��な実裁E
     - [ ] 視覚刺激UI�E�色変化/パターン表示�E�E     - [ ] 音声リズム検�E→音楽生�E
     - [ ] 創作物ギャラリー�E�保孁E共有機�E�E�E
3. **音声読み上げ、視認性高いUI�E�高コントラスト対応！E*
   - 状慁E 🚧 一部実裁E��み�E�ERIA属性�E�E   - 既存実裁E 吁E��ォームコンポ�EネントでARIA対応済み
   - 次のアクション:
     - [ ] Web Speech API�E�読み上げ�E��Eペ�Eジ実裁E     - [ ] ハイコントラストテーマ（白黒反転/大きな斁E��！E     - [ ] キーボ�Eドナビゲーション完�E対忁E
---

### ✁ESTEP 5�E�医療老E�E行政との連携

**目樁E*: 医療機関・行政との連携を強化し、シームレスな惁E��共有とエビデンスに基づくケアを実現する

#### 実裁E��E��

1. **PHR�E�ケア記録 ⇁E主治医�E��E有機�E�E�EHIR準拠も視野�E�E*
   - 状慁E ⏳ 未着扁E   - 忁E��な実裁E
     - [ ] FHIR形式へのチE�Eタ変換�E�Ebservation/Condition/MedicationStatement�E�E     - [ ] OAuth2認証�E�医療機関シスチE��との連携�E�E     - [ ] 共有同意管琁EI�E�本人/家族�E明示皁E��意！E
2. **GPTチャチE��ボットによるQ&A�E�親・スタチE��向け�E�E*
   - 状慁E 🚧 基盤実裁E��み�E�EangChain Agent�E�E   - 既存実裁E `services/langchain/agent.ts`
   - 次のアクション:
     - [ ] FAQ機�Eの拡張�E�医ケア児特有�E質問対応！E     - [ ] チャチE��UIコンポ�Eネント作�E
     - [ ] RAG�E�検索拡張生�E�E�による専門知識�Eース参�E

3. **感情刁E��・ストレス検知 ↁE自動リスクアラート提桁E*
   - 状慁E ⏳ 未着扁E   - 忁E��な実裁E
     - [ ] チE��スト感惁E�E析（日誌�E記述冁E��から�E�E     - [ ] バイタル変動パターン解析（ストレス持E��！E     - [ ] 自動アラート生成（「最迁E日間�Eストレスレベル上�E」！E     - [ ] 対処法提案！EPTによる推奨事頁E��成！E
---

## 🔁 LangChain Agent/AI Agent が実行時に参�Eすべき事頁E
### 基本原則

1. **こ�Eドキュメント�E構�E・優先頁E��を参�Eし、E��刁E��段階でのみ先進機�Eを設計�E実裁E�E評価すること、E*
2. LangChain Agent めEAI Assistant はこ�Eファイルを事前に読み込み、対象タスクのレベル・依存関係�E目皁E��確認すること、E3. VSコード�EのCoPilotへこ�Eファイルへのリンク、また�Emd冁E���Eし�E明示を含めた実行指示を送ること、E
### 実裁E�E進め方

#### 新機�E追加時�EチェチE��リスチE
- [ ] 該当するSTEPの目標と整合してぁE��ぁE- [ ] 既存実裁E��の依存関係を確認したか
- [ ] チE�Eタ構造の拡張が忁E��な場合、`lib/db.ts`また�E`schemas/unified.ts`を更新したぁE- [ ] アクセシビリチE���E�ERIA属性、キーボ�Eド操作）を老E�EしたぁE- [ ] ユニットテストを追加したか！Etests/unit/`配下！E- [ ] ビルド�EチE��トが通過することを確認したか�E�Epnpm -s build && pnpm -s vitest run`�E�E
#### CoPilot用プロンプト侁E
**侁E: STEP 2のToDo機�E実裁E*

```
以下�E先進機�E統合�Eラン�E�Eocs/advanced_features_plan.md�E�に基づき、STEP 2の連携機�E強化を対象とする実裁E��行ってください。まず�E「ToDoリスト機�E」�EチE�Eタ構造と保存�Eを定義し、仮UIを作�Eし、保存�E一覧・完亁E��グル機�Eを段階実裁E��てください、E
実裁E��件:
- Dexie DBにtodosチE�Eブルを追加
- schemas/todo.ts でTodoEntryスキーマ定義
- app/todos/page.tsx で一覧・追加・完亁EI作�E
- 優先度�E�髁E中/低）、担当老E��期限、完亁E��態を管琁E- ARIA属性を適刁E��設宁E```

**侁E: STEP 3のBLE連携**

```
docs/advanced_features_plan.md の STEP 3「SpO₁E忁E��のBluetooth連携」を実裁E��てください、E
実裁E��件:
- services/ble/pulse-oximeter.ts を作�E
- Web Bluetooth API を使用してBLE接綁E- 取得したSpO₁E忁E��チE�Eタを�E動的にDexie DBへ保孁E- components/forms/vitals-form.tsx に「デバイス接続」�Eタンを追加
- 接続状態�E表示とエラーハンドリング
```

---

## 📊 進捗追跡

### 実裁E��み機�E�E�✅�E�E
- [x] 統一チE�EタモチE���E�Eschemas/unified.ts`�E�E- [x] AIモニタリング基盤�E�Eservices/ai-monitoring/`�E�E- [x] LangChain Agentの基礎実裁E��Eservices/langchain/agent.ts`�E�E- [x] 月次レポ�Eト生成！Ereports/generateMonthlyReport.ts`�E�E- [x] 家族�Eータル仮ペ�Eジ�E��E有コード生成！E- [x] 音声記録コンポ�Eネント！Eeb Speech API�E�E
### 次期実裁E��補（優先度頁E��E
1. **STEP 1-2**: AI要紁E�E月次PDF統合（即効性大�E�E2. **STEP 2-2**: ToDoリスト機�E�E�多�E種連携の基盤�E�E3. **STEP 1-3**: 服薬リマインダー�E�業務効玁E���E�E4. **STEP 2-3**: 緊急通知機�E�E�既存AI監視との統合！E5. **STEP 3-2**: BLE連携�E�バイタル自動取得！E
---

## 📝 変更履歴

- **2025-11-01**: 初版作�E。既存実裁E��況を反映し、E段階ロード�EチE�Eを定義、E
---

## 📚 参老E��E��

- [FHIR日本実裁E��様](https://jpfhir.jp/)
- [Web Bluetooth API仕様](https://webbluetoothcg.github.io/web-bluetooth/)
- [WCAG 2.1�E�アクセシビリチE��ガイドライン�E�](https://www.w3.org/WAI/WCAG21/quickref/)
- [DFree公式サイチE(https://dfree.biz/)
- [Poteer公式サイチE(https://www.poteer.net/)

