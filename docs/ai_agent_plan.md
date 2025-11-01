# Multi-Agent Development Plan for Juushin Care System

## Vision and Goals

Our long-term objective is to evolve the juushin-care-system into a world-class platform that improves the quality of care for people with severe motor and intellectual disabilities. We will achieve this by:

1. **Accelerating development** through a multi-agent architecture that automates coding, review, testing, documentation, and research tasks. Each agent will specialise in a single role to ensure consistency and quality.

2. **Incorporating assistive features** inspired by leading solutions in the field (e.g. Ishin Denshin for body-movement communication, AI支援さん for voice-driven record keeping, Poteer for creative expression, DFree for IoT-based health monitoring).

3. **Maintaining high standards** for accessibility, security, performance and user experience through continuous integration (CI), automated testing, code reviews and documentation.

## Agent Roles and Responsibilities

### Implementation Agent
- Receives a detailed user story or task and proposes code changes or new files.
- Produces high-quality, maintainable TypeScript/React code adhering to project conventions.
- Communicates its rationale and any assumptions clearly for downstream agents.

### Review Agent
- Examines diffs produced by the Implementation Agent and flags issues relating to correctness, security, performance, accessibility and style.
- Suggests improvements and generates unified diff patches.
- The existing `scripts/agent_review_autogen.py` script can be extended to support this role for additional modules.

### Test Agent
- Designs unit, integration and snapshot tests to cover new features and regressions.
- Uses Vitest/React Testing Library for front-end components.
- Ensures tests are minimal yet effective and that CI execution time remains reasonable.

### Documentation Agent
- Updates README, API docs and usage guides when new features are introduced.
- Creates user-facing help files explaining how to use features such as voice logging and sensor integration.

### Research Agent (optional)
- Performs deep searches for the latest best practices and comparable products.
- Summarises relevant findings and suggests enhancements.
- The Genspark Super Agent can fulfil this role.

## Phase-Based Implementation Roadmap

### Phase 1: Foundation and Multi-Agent Setup

1. **Adopt a multi-agent framework** such as AutoGen or CrewAI to orchestrate agent roles. Create a configuration file (`.ai/agents_config.yaml`) describing each agent, its tool access and prompt style.

2. **Extend `scripts/agent_review_autogen.py`** to run Implementation and Documentation agents before Review and Test. The planner/reviewer/test designer prompts contained in the script serve as a useful template. Similar system prompts should be written for Implementation and Documentation roles.

3. **Create a root command** (`scripts/agent_run.py`) that accepts a high-level task description (e.g. "Add voice recording feature") and invokes the multi-agent sequence. This script should:
   - Instantiate the Implementation Agent to generate diffs.
   - Pass diffs to the Review Agent for critique and patch suggestions.
   - Merge patches and generate tests via the Test Agent.
   - Write a report for human developers summarising actions and next steps.

### Phase 2: Feature Development

The following features should be prioritised to align with our vision. Each item includes tasks for the Implementation Agent and notes for UI designers (e.g. v0) and GitHub Copilot prompts.

#### 2.1 Body-Movement Communication

**Goal**: Enable users with limited speech to communicate via subtle gestures.

**Tasks**:
- Create a new page/component (`components/body-movement.tsx`) that interfaces with a pose-detection library (e.g. Mediapipe or TensorFlow.js) and maps specific gestures to predefined messages.
- The Implementation Agent should generate stub code with placeholder gesture detection logic and UI controls for training.
- Add UI to calibrate sensitivity and provide feedback ("Message recognised: thirsty").
- Future integration with external sensors (inspired by Ishin Denshin) can be added once hardware details are available.

#### 2.2 Voice Recording and Log Generation

**Goal**: Allow caregivers to dictate care records via voice.

**Tasks**:
- Implement a `VoiceRecorder` React component that uses the browser's SpeechRecognition API (with fallback to a service like Google Cloud Speech) to transcribe audio to text.
- Add this component to `app/page.tsx` and connect the transcribed text to the existing log-creation flow.
- Provide a start/stop button, a visual indicator while recording, and error handling for unsupported browsers.
- The Implementation Agent should ensure accessibility (keyboard operation and ARIA labels) and maintain the existing data structures.

#### 2.3 Creative Activity Module

**Goal**: Empower users to turn eye movement, voice rhythm and body motion into creative outputs (akin to Poteer).

**Tasks**:
- Create a new page (`pages/creative.tsx`) with modules for generative art and music.
- Use simple randomised algorithms or integrate with open-source generative libraries.
- Accept user input via eye-tracking (where available) or pointer movement.
- Implement a gallery view to save and display generated works. This data should be stored locally or in a backend to be decided.

#### 2.4 Health Monitoring and IoT Integration

**Goal**: Collect real-time physiological data (e.g. bladder status, pulse, seizure detection) to enable proactive care.

**Tasks**:
- Design API interfaces and data structures to ingest sensor data. For example, create a `services/sensors.ts` module that listens for events from devices like DFree.
- Create dashboards and alerts within a new `HealthMonitoringPage` component. This page should display sensor trends and highlight any warnings.
- Provide stub functions for future integration with actual devices. Use dummy data during initial development.

### Phase 3: Optimisation and Continuous Improvement

- **Accessibility & UX**: Conduct audits with the Review Agent focusing on screen reader compatibility, keyboard navigation and colour contrast. Address any critical findings before broad deployment.

- **Performance**: Optimise bundle size and rendering, especially for sensor-heavy pages.

- **Data Privacy**: Ensure that sensor and voice data are handled securely. Consult a security specialist for encryption and anonymisation strategies.

- **User Feedback**: Implement a feedback form and integrate analytics to monitor feature usage and satisfaction.

## Prompts for GitHub Copilot

Below are examples of prompts to feed into GitHub Copilot Chat to generate code aligned with this plan. Adjust as you refine requirements.

### 1. Create the VoiceRecorder component

\`\`\`
You are a TypeScript/React developer. Generate a `VoiceRecorder.tsx` component for a Next.js 14 app using client components. It should provide a start and stop button to control audio recording via the Web Speech API (window.SpeechRecognition). Display transcribed text in a text area, call a supplied callback when transcription completes, and handle errors gracefully. Include minimal CSS for layout and ensure ARIA labels for accessibility.
\`\`\`

### 2. Add the VoiceRecorder to the main page

\`\`\`
I have a Next.js 14 project with an `app/page.tsx` that renders care categories and a log form. Show me how to import and embed the `VoiceRecorder` component you created above into the page. When a recording finishes, append the transcribed text to the notes field of the log form. Ensure state updates correctly.
\`\`\`

### 3. Stub out the Body-Movement Communication page

\`\`\`
Create a new file `components/body-movement.tsx` for a Next.js project. The component should set up a video element and integrate with @mediapipe/pose (as a placeholder) to detect basic gestures (e.g. left hand raised). For now, just log recognised gestures to the console and display a message on screen when a gesture is detected. Make sure to clean up resources on unmount.
\`\`\`

## Prompts for v0.dev / v0.app

v0 allows natural-language UI generation. When using v0's AI to scaffold pages, you can provide high-level descriptions. Here are examples:

### Generate a Voice Recording UI

\`\`\`
Create a page for voice logging in a care-management app. Include a section with a microphone button that starts and stops voice recording, shows the live transcription in real time, and a button to save the transcript. Use large buttons and high-contrast colours suitable for caregivers working in a medical environment.
\`\`\`

### Design a Body-Movement Communication Page

\`\`\`
Add a new page called 'Body Communication'. It should show a webcam feed, instructions to perform simple gestures, and a list of phrases that can be triggered by detected gestures. Arrange elements in a clean grid and ensure the page is responsive.
\`\`\`

### Create a Creative Activity Gallery

\`\`\`
Generate a gallery page to display artworks created by users. Include a masonry grid of images or sketches, a button to start a new creation session, and an accessibility-friendly colour palette. The page should encourage creativity and self-expression.
\`\`\`

## Updating This Plan

As new agents and features are integrated, update this file. Each phase or major feature should include:

- A clear objective.
- Specific tasks for Implementation, Review, Test and Documentation agents.
- Prompts or instructions for GitHub Copilot and v0 (or other tools) to execute.

Maintaining a living plan ensures alignment across human developers and AI agents and helps us iteratively build the world's best care application for individuals with severe disabilities.

---

## プロジェクト概要（追加）

医療的ケアが必要な重症心身障がい児者に対する世界最高峰アプリを目指し、施設職員や訪問介護員の業務負担軽減と情報共有を実現する。利用者の健康・心理状態をAIでモニタリングし、家族や医療者と連携できる機能を備える。

## 統合すべき主要機能（追加）

1. 一元的なケア記録・クラウド共有（サービス横断でバイタル、食事、排泄、服薬、リハビリ等を記録）
2. 直感的な入力UI（音声入力・テンプレート・AI補助）
3. AIによる健康状態と精神状態モニタリング（平常時との差異検知・異常アラート）
4. データ可視化とレポート出力（月次・年次グラフ、PDFレポート）
5. 家族・医療者との連携（家族用ポータル、医師連絡帳）
6. 業務支援（シフト管理、請求連携、災害時オフライン閲覧）
7. 発達支援・コミュニケーション支援（デジリハや意思表示ツールの統合）

## 優先実装項目（追加）

- 日誌記録の全サービスへの展開と表情・発作記録の統合
- 利用者データモデルの統合とAPIリファクタリング
- AIモニタリング基盤の設計・分析処理の実装
- グラフ表示とレポート機能の追加

## 開発の基本手順（追加）

1. UI設計・UX改善
2. データベース構造統合
3. 日誌機能拡張（全サービス展開、表情・発作記録統合）
4. AIモニタリング導入（統計評価→学習アルゴリズム）
5. グラフとレポート機能（PDF出力）
6. 家族・医療者ポータル
7. テスト・E2E 自動化

---

## 実装進捗（本ブランチ）

- ✅ 統一データモデル `schemas/unified.ts`（既存コードへの影響なし、将来のAPI統合に備え）
- ✅ 変換アダプタ `lib/model-adapters.ts`（journal/Dexie日誌 ↔ unified）＋ ユニットテスト
- ✅ AIモニタリングMVP `services/ai-monitoring/`（移動平均・zスコア・しきい値アラート）＋ テスト
- ✅ 月次レポート生成 `reports/generateMonthlyReport.ts` と印刷用コンポーネント `components/pdf/monthly-report-doc.tsx`
- ✅ 家族ポータル仮ページ `app/family/page.tsx`（既存フロー不変）
- ✅ 共通日誌UI `components/diary/CommonDiary.tsx`（unified準拠、カテゴリ選択、ARIA属性強化）
- ✅ 月次レポート印刷統合 `app/diary/monthly/page.tsx`（印刷ボタン＋モーダル表示）
- ✅ AIしきい値設定UI `app/settings/thresholds/page.tsx`（localStorage永続化、ARIA対応）

次段階では unified スキーマを段階的に既存フォーム/APIへ適用しつつ、LangChainベースのマニュアルQ&Aエージェントの統合を検討します。
