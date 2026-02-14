# Multi-Agent Development Plan for Juushin Care System

## Vision and Goals

Our long-term objective is to evolve the juushin-care-system into a world-class platform that improves the quality of care for people with severe motor and intellectual disabilities. We will achieve this by:

1. **Accelerating development** through a multi-agent architecture that automates coding, review, testing, documentation, and research tasks. Each agent will specialise in a single role to ensure consistency and quality.

2. **Incorporating assistive features** inspired by leading solutions in the field (e.g. Ishin Denshin for body-movement communication, AI謾ｯ謠ｴ縺輔ｓ for voice-driven record keeping, Poteer for creative expression, DFree for IoT-based health monitoring).

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

## 繝励Ο繧ｸ繧ｧ繧ｯ繝域ｦりｦ・ｼ郁ｿｽ蜉・・
蛹ｻ逋ら噪繧ｱ繧｢縺悟ｿ・ｦ√↑驥咲裸蠢・ｺｫ髫懊′縺・・閠・↓蟇ｾ縺吶ｋ荳也阜譛鬮伜ｳｰ繧｢繝励Μ繧堤岼謖・＠縲∵命險ｭ閨ｷ蜩｡繧・ｨｪ蝠丈ｻ玖ｭｷ蜩｡縺ｮ讌ｭ蜍呵ｲ諡・ｻｽ貂帙→諠・ｱ蜈ｱ譛峨ｒ螳溽樟縺吶ｋ縲ょ茜逕ｨ閠・・蛛･蠎ｷ繝ｻ蠢・炊迥ｶ諷九ｒAI縺ｧ繝｢繝九ち繝ｪ繝ｳ繧ｰ縺励∝ｮｶ譌上ｄ蛹ｻ逋り・→騾｣謳ｺ縺ｧ縺阪ｋ讖溯・繧貞ｙ縺医ｋ縲・
## 邨ｱ蜷医☆縺ｹ縺堺ｸｻ隕∵ｩ溯・・郁ｿｽ蜉・・
1. 荳蜈・噪縺ｪ繧ｱ繧｢險倬鹸繝ｻ繧ｯ繝ｩ繧ｦ繝牙・譛会ｼ医し繝ｼ繝薙せ讓ｪ譁ｭ縺ｧ繝舌う繧ｿ繝ｫ縲・｣滉ｺ九∵賜豕・∵恪阮ｬ縲√Μ繝上ン繝ｪ遲峨ｒ險倬鹸・・2. 逶ｴ諢溽噪縺ｪ蜈･蜉婉I・磯浹螢ｰ蜈･蜉帙・繝・Φ繝励Ξ繝ｼ繝医・AI陬懷勧・・3. AI縺ｫ繧医ｋ蛛･蠎ｷ迥ｶ諷九→邊ｾ逾樒憾諷九Δ繝九ち繝ｪ繝ｳ繧ｰ・亥ｹｳ蟶ｸ譎ゅ→縺ｮ蟾ｮ逡ｰ讀懃衍繝ｻ逡ｰ蟶ｸ繧｢繝ｩ繝ｼ繝茨ｼ・4. 繝・・繧ｿ蜿ｯ隕門喧縺ｨ繝ｬ繝昴・繝亥・蜉幢ｼ域怦谺｡繝ｻ蟷ｴ谺｡繧ｰ繝ｩ繝輔￣DF繝ｬ繝昴・繝茨ｼ・5. 螳ｶ譌上・蛹ｻ逋り・→縺ｮ騾｣謳ｺ・亥ｮｶ譌冗畑繝昴・繧ｿ繝ｫ縲∝現蟶ｫ騾｣邨｡蟶ｳ・・6. 讌ｭ蜍呎髪謠ｴ・医す繝輔ヨ邂｡逅・∬ｫ区ｱる｣謳ｺ縲∫⊃螳ｳ譎ゅが繝輔Λ繧､繝ｳ髢ｲ隕ｧ・・7. 逋ｺ驕疲髪謠ｴ繝ｻ繧ｳ繝溘Η繝九こ繝ｼ繧ｷ繝ｧ繝ｳ謾ｯ謠ｴ・医ョ繧ｸ繝ｪ繝上ｄ諢乗晁｡ｨ遉ｺ繝・・繝ｫ縺ｮ邨ｱ蜷茨ｼ・
## 蜆ｪ蜈亥ｮ溯｣・・岼・郁ｿｽ蜉・・
- 譌･隱瑚ｨ倬鹸縺ｮ蜈ｨ繧ｵ繝ｼ繝薙せ縺ｸ縺ｮ螻暮幕縺ｨ陦ｨ諠・・逋ｺ菴懆ｨ倬鹸縺ｮ邨ｱ蜷・- 蛻ｩ逕ｨ閠・ョ繝ｼ繧ｿ繝｢繝・Ν縺ｮ邨ｱ蜷医→API繝ｪ繝輔ぃ繧ｯ繧ｿ繝ｪ繝ｳ繧ｰ
- AI繝｢繝九ち繝ｪ繝ｳ繧ｰ蝓ｺ逶､縺ｮ險ｭ險医・蛻・梵蜃ｦ逅・・螳溯｣・- 繧ｰ繝ｩ繝戊｡ｨ遉ｺ縺ｨ繝ｬ繝昴・繝域ｩ溯・縺ｮ霑ｽ蜉

## 髢狗匱縺ｮ蝓ｺ譛ｬ謇矩・ｼ郁ｿｽ蜉・・
1. UI險ｭ險医・UX謾ｹ蝟・2. 繝・・繧ｿ繝吶・繧ｹ讒矩邨ｱ蜷・3. 譌･隱梧ｩ溯・諡｡蠑ｵ・亥・繧ｵ繝ｼ繝薙せ螻暮幕縲∬｡ｨ諠・・逋ｺ菴懆ｨ倬鹸邨ｱ蜷茨ｼ・4. AI繝｢繝九ち繝ｪ繝ｳ繧ｰ蟆主・・育ｵｱ險郁ｩ穂ｾ｡竊貞ｭｦ鄙偵い繝ｫ繧ｴ繝ｪ繧ｺ繝・・5. 繧ｰ繝ｩ繝輔→繝ｬ繝昴・繝域ｩ溯・・・DF蜃ｺ蜉幢ｼ・6. 螳ｶ譌上・蛹ｻ逋り・・繝ｼ繧ｿ繝ｫ
7. 繝・せ繝医・E2E 閾ｪ蜍募喧

