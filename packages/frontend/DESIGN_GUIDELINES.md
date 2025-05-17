# CafeGame UI/UX Design Guidelines

## 核心理念: "活力霓虹境" (Vibrant Neon Realm)

**愿景进化:** 从原有的 "静谧霓虹 (Serene Neon)" 理念出发，我们进化为 **"活力霓虹境 (Vibrant Neon Realm)"**。新方向在保留侘寂风的质朴、未来科技的精致光感基础上，更主动地融入 **TapTap 式的社区活力、内容发现机制以及更鲜明的视觉层次与引导**。目标是打造一个既沉浸、富有科技魅力，又充满探索乐趣、易于玩家交流互动的游戏平台。解决原方案可能存在的视觉"空洞感"，通过更丰富的色彩层次和设计策略注入生机。

**核心原则:**
1.  **内容为王，社区驱动:** 借鉴 TapTap，强化游戏内容的发现效率和社区UGC的展示与互动。
2.  **视觉唤醒，层次分明:** 在深色基调上，通过优化的色彩对比、策略性的高光和材质运用，创造视觉焦点，提升信息可读性。
3.  **精致交互，直观易用:** 保持流畅、有意义的动效，确保所有交互（尤其是加密货币相关操作）清晰易懂。
4.  **模块化与一致性:** 组件设计遵循统一标准，确保整体体验的和谐与可扩展性。

## 一、 整体结构与导航 (Information Architecture & Navigation)

1.  **布局:** 顶部导航栏 + 主要内容区域。
    *   **顶部导航:** 简洁，包含核心入口：**发现 (Discover)**、**游戏库 (Games)**、**社区 (Community/Forum - 新增)**、**我的 (Profile/Me)** [连接钱包后显示]，以及 **钱包连接按钮**。
    *   **内容区域:**
        *   **首页 (Discover):** 借鉴TapTap，采用多板块信息流卡片式布局，包含：编辑推荐、热门游戏榜单、新游期待、精选评测/攻略、社区热议等。
        *   **其他页面:** 卡片式布局 (Card Layout) 或网格布局 (Grid Layout) 为主，辅以列表视图选项。

2.  **关键页面流程 (参考TapTap优化):**
    *   **发现页 (Homepage/Discover):**
        *   **氛围:** 应用第一印象，体现社区活力和平台内容丰富度，同时融入"活力霓虹境"的独特视觉风格。
        *   **内容:** 编辑推荐、新游、热门榜单、高分游戏、精选用户评测摘要、热门攻略入口、社区动态/话题区入口。
    *   **游戏库页 (Games):**
        *   **功能:** 强大的筛选（类型、标签、平台、支付方式等）与排序。
        *   **展示:** 默认卡片网格，可切换列表视图。游戏卡片需能快速展示核心信息（封面、名称、评分、标签）。
    *   **游戏详情页 (Game Detail):**
        *   **核心:** 顶部醒目的游戏主视觉（高质量封面/视频）、名称、开发商、评分、标签云、清晰的购买/获取按钮（加密货币支付标识）。
        *   **下方内容:** Tab式布局 (如TapTap)，包含：**简介** (详细介绍、截图、配置要求)、**评价** (用户评分、精华评论、全部评论区)、**攻略** (官方/玩家UGC)、**社区** (关联论坛/讨论区)。
    *   **社区/论坛页 (Community/Forum - 新增):**
        *   **功能:** 按游戏分子论坛，支持帖子发布（图文、视频链接）、回复、点赞、排序。设立综合讨论区、活动区等。
    *   **个人中心页 (Profile):**
        *   **功能:** 用户拥有的游戏NFT、游戏时长记录、发布的评测/攻略/帖子、钱包地址、偏好设置、社区成就/徽章。
        *   **风格:** 突出个人成就与贡献，视觉上与平台整体风格统一。
    *   **内容创作流程 (Creation):**
        *   简洁、干扰少的编辑器界面 (Markdown为主，支持图片上传)。明确关联游戏和用户身份。

## 二、 视觉设计与美学风格 (Visual Design & Aesthetics)

1.  **色彩体系 (Color Palette) - "活力霓虹境"定制:**
    *   **主导风格:** 依然以深色模式为主，营造沉浸感，但通过色彩层次和对比度优化，注入活力。
    *   **核心调色板优化建议:**
        *   **主背景 (Main Background):** `#0D0F12` (非常深的近黑，可考虑细微噪点/纹理增加质感) 或 `#121017` (略带紫调的深黑)。
        *   **主要表面/卡片 (Primary Surface):** `#1C1A27` (深紫灰，与主背景形成对比) 或 `#1F232C` (深蓝灰)。这是提升视觉层次的关键。
        *   **次要表面/模态框/下拉菜单 (Secondary Surface):** `#252233` (比主要表面略浅的灰调，可审慎运用玻璃拟态效果)。
        *   **主要文字 (Primary Text):** `#F0F0F5` (高对比度浅灰，近白)。
        *   **次要文字 (Secondary Text):** `#A8A5B3` (中等亮度灰，带有轻微色彩倾向以匹配表面色)。
        *   **提示性/禁用文字 (Muted/Disabled Text):** `#6F6C7A` (暗灰色)。
        *   **边框/分割线 (Borders/Dividers):** `#353240` (深灰色，用于区隔但不过于抢眼)。
        *   **主霓虹强调色 (Primary Neon Accent):** `#00DFD8` (明亮青色/蓝绿色)。用于：激活状态的图标/标签、按钮边框、进度条、重要统计数据、交互焦点外发光等。
        *   **次级霓虹强调色 (Secondary Neon Accent):** `#7F5AF0` (科技紫)。用于：次要按钮、非关键信息的点缀、部分图标或标签。
        *   **活力CTA霓虹色 (Vibrant CTA Neon):** `#F250A2` (霓虹粉/洋红) 或 `#ADFF2F` (霓虹绿)。**严格限制使用范围**，用于最关键的购买按钮、发布成功等强引导/积极反馈。
        *   **警告/错误色 (Warning/Error Neon):** `#FF4757` (霓虹红) 或 `#FF6B35` (酸性橙)。
        *   **中性色点缀:** 可考虑引入非常淡的米白或象牙色 (`#FFFBF5`) 作为某些特定文本标签或小面积背景的点缀，与深色形成强烈对比，增加呼吸感，但需非常克制。
    *   **色彩运用原则:**
        *   **提升对比度:** 确保文本、可交互元素与其背景有足够的对比度 (遵循WCAG AA标准)。
        *   **层次感:** 利用不同深浅的表面色和灰色调来构建视觉深度。
        *   **霓虹聚焦:** 霓虹色是视觉引导和品牌识别的关键，但避免滥用。主霓虹色引导常规交互，活力霓虹色用于少数关键转化点。
        *   **游戏素材优先:** 高质量的游戏封面、截图、视频是天然的色彩和活力来源，UI应为其提供最佳展示环境。

2.  **排版 (Typography):**
    *   **字体:** 无衬线字体。西文: Inter, Manrope, Satoshi; 中文: 思源黑体 / Noto Sans CJK。保持一致，注重清晰度和现代感。
    *   **字号与层级:** 严格控制层级 (如 H1-H6, Body, Caption)，利用字重、颜色（主/次/提示文字色）、以及霓虹强调色（如重要标题的微妙辉光或用强调色作为标题旁边的装饰线）来清晰区分。

3.  **布局与留白 (Layout & Whitespace):**
    *   **结构化布局:** 借鉴TapTap，采用清晰的网格系统和模块化布局，使信息组织有序。
    *   **策略性留白:** 保持呼吸感，尤其是在信息密度较高的区域。深色背景下，合理的留白有助于突出内容焦点。
    *   **响应式设计:** 优先考虑移动端体验，确保各尺寸屏幕下布局依然清晰易用。

4.  **图像与图标 (Imagery & Icons):**
    *   **游戏素材:** 必须是高质量、引人注目的。设计应围绕如何最佳呈现游戏封面、截图和视频。
    *   **图标:** 保持线性、简洁、一致 (如 Radix UI Icons, Lucide Icons)。图标颜色遵循：默认状态为中灰色，悬停/激活状态可变为浅灰色或主/次霓虹强调色。
    *   **装饰性元素与科技感体现 (延续并优化):**
        *   **精致辉光 (Refined Glow):** 霓虹辉光效果应更细腻、有层次，避免模糊不清。可用于卡片边缘悬停、按钮激活、焦点输入框等。
        *   **玻璃拟态 (Glassmorphism):** 审慎运用于模态框、特定面板背景、或作为卡片元素的叠加层，提升现代感和通透性。
        *   **细微肌理与网格:** 背景可叠加极淡的、与主背景色同色系但不同亮度的噪点或科技网格图案，增加视觉深度。
        *   **纤细线条与几何图形:** 可用作分隔、点缀，颜色可为中性灰或次级霓虹色。

5.  **动效与交互 (Animation & Interaction):**
    *   **原则:** 微妙、流畅、有意义、响应迅速。避免花哨和干扰。
    *   **应用:**
        *   元素状态变化 (如按钮悬停/点击) 可伴随霓虹辉光的细腻变化、颜色过渡或轻微的缩放/呼吸感。
        *   页面切换、模态框弹出等采用平滑的渐入渐出或符合空间逻辑的过渡。
        *   加载状态：骨架屏（使用表面色和略亮的闪动效果）、简约Spinner（可融入主/次霓虹色）。
        *   加密交易反馈：清晰的Toast/Modal提示，明确展示交易状态（处理中、成功、失败），并使用相应的霓虹色（如活力CTA色表示成功，警告色表示失败）。

## 三、 关键组件设计思考 (融入新色彩与TapTap思路)

1.  **游戏卡片 (Game Card):**
    *   **信息架构 (参考TapTap):** 封面图显著，下方紧凑排列游戏名、类型/平台标签、平均评分（星级+数字）、价格/获取状态。评论数或热度指标也可考虑。
    *   **风格:**
        *   **背景:** 使用"主要表面色" (如 `#1C1A27` 深紫灰)。
        *   **封面图区域:** 占据卡片较大比例，图片边缘可有轻微内阴影或与卡片背景的细微分隔，突出立体感。
        *   **文字:** 游戏名使用"主要文字色"，其他信息使用"次要文字色"。评分使用特定颜色（如黄色系或主霓虹色）。
        *   **交互:** 悬停时卡片可有轻微上浮效果，边缘出现"主霓虹强调色"的柔和辉光。游戏名颜色可变为"主霓虹强调色"。
2.  **按钮 (Button):**
    *   **主要按钮 (Primary - 如购买、核心操作):**
        *   **默认:** 背景透明或使用深色（如次要表面色），边框使用"主霓虹强调色"，文字为"主霓虹强调色"或"主要文字色"。
        *   **悬停/激活:** 背景填充"主霓虹强调色"，文字变为高对比度的暗色或白色。或背景色加深，辉光增强。
    *   **活力CTA按钮 (Vibrant CTA - 如最终购买确认、发布):**
        *   **默认:** 背景使用"活力CTA霓虹色"，文字为高对比度的暗色/白色。可带有轻微辉光。
        *   **悬停/激活:** 背景亮度/饱和度微调，辉光增强。
    *   **次要/幽灵按钮 (Secondary/Ghost):**
        *   **默认:** 透明背景，文字为"次要文字色"或"主霓虹强调色"（取决于重要性）。边框可选，若有则为"边框色"或"次级霓虹色"。
        *   **悬停/激活:** 文字颜色变亮或变为"主霓虹强调色"，背景可轻微填充半透明的表面色或霓虹色。
        *   **状态:** Disabled状态显著降低透明度/对比度，移除霓虹效果。
3.  **表单 (Forms):**
    *   **输入框:** 背景使用"主要表面色"或略暗一级，边框使用"边框色"。
    *   **标签:** 清晰，使用"主要文字色"或"次要文字色"。
    *   **焦点状态 (Focus):** 输入框边框变为"主霓虹强调色"，并可伴有轻微的同色系内/外辉光。
    *   **校验状态:** 成功校验可显示"主霓虹色"的对勾图标或边框，错误校验显示"警告/错误色"的提示和图标/边框。
4.  **标签与徽章 (Tags & Badges):**
    *   用于游戏类型、平台、状态、用户成就等。
    *   背景可使用半透明的"主要表面色"或"次级霓虹色"，文字清晰。特定状态（如"热门"、"推荐"）可使用更鲜明的"主霓虹色"或"活力CTA霓虹色"的变体。
5.  **导航与Tabs:**
    *   未选中项使用"次要文字色"。
    *   选中项/悬停项使用"主要文字色"，并附带"主霓虹强调色"的下划线、背景或图标点缀。
6.  **用户生成内容区域 (评论、帖子):**
    *   背景使用"主要表面色"或"次要表面色"来区隔。
    *   用户名可使用"主霓虹强调色"或"次级霓虹强调色"的变体以突出。
    *   评分、点赞等交互元素清晰，并有明确的视觉反馈。

## 四、 设计一致性与实现

1.  **设计 Tokens:**
    *   在项目中（如 Tailwind CSS 配置文件 `tailwind.config.js` 或全局 CSS 变量）统一定义上述色彩、字体、间距、圆角、阴影等设计tokens。
    *   所有组件和页面样式均从这些tokens派生，确保全局一致性。
2.  **组件库 (Radix UI + shadcn/ui):**
    *   基于 Radix UI 和 shadcn/ui 的组件，通过修改其默认主题/样式或封装新组件，使其符合 "活力霓虹境" 的视觉规范。
    *   特别注意交互状态（hover, focus, active, disabled）在所有组件上的表现一致性。
3.  **响应式与可访问性:**
    *   在组件开发和页面布局时，始终考虑不同屏幕尺寸下的表现。
    *   确保色彩对比度符合WCAG AA或AAA标准，键盘导航友好，为屏幕阅读器提供必要的ARIA属性。

## 总结

新的 **"活力霓虹境 (Vibrant Neon Realm)"** 设计方向，旨在通过借鉴TapTap的成功经验和优化视觉表现，为CafeGame平台带来更强的吸引力和用户粘性。关键在于 **平衡 (Balance)**——平衡深色调的沉浸感与多层次色彩的活力感，平衡科技的酷炫与社区的亲和，平衡信息密度与阅读舒适度。通过对细节的持续打磨和对设计tokens的严格执行，实现一个独特且用户友好的游戏平台体验。 

## 五、 设计实施计划

以下是逐步实施新 "活力霓虹境" 设计的计划：

**Phase 0: 基础建设与设计 Tokens (Foundation & Design Tokens)**
Status: 已完成
    *   `tailwind.config.mjs` 已配置新的颜色调色板 (直接使用十六进制颜色值)、字体 (更新了 sans-serif 栈) 和新的 `boxShadow` 工具类 (用于霓虹辉光效果)。旧的基于 HSL 的自定义颜色已被移除。

**Phase 1: 应用顶层样式更新 (App Shell & Global Styles)**
Status: 已完成
    *   `App.tsx`: Radix UI `<Theme appearance="dark" accentColor="cyan" grayColor="mauve">` 配置与新设计指南一致。
    *   `index.css`:
        *   全局 `body` 样式已通过 `@apply bg-realm-background text-realm-text-primary` 应用新规范。
        *   `.connect-button` 中已修复因 `tailwind.config.mjs` 颜色名称变更导致的类名错误 (从 `bg-neon-primary` 更新为 `bg-realm-neon-primary`)。
        *   已移除不再使用的 `.scaffold-button` 类。
    *   `components/layout/Header.tsx`: 背景 (`bg-realm-surface-primary/80`)、导航链接颜色 (`text-realm-text-secondary hover:text-realm-neon-primary`) 等已符合新规范。
    *   `components/layout/Footer.tsx`: 背景 (`bg-realm-surface-secondary`)、链接颜色 (`text-realm-text-secondary hover:text-realm-text-primary`) 等已符合新规范。

**Phase 2: 核心页面 - 首页 (`IndexPage.tsx`)**
Status: 已完成
    *   `IndexPage.tsx`:
        *   整体布局和间距初步审视，依赖 `AppLayout.tsx` 的容器。
        *   页面 ("Discover Games" - `text-realm-neon-primary`) 和板块标题 ("Recommended For You" - `text-realm-neon-secondary`) 颜色已更新。
        *   "List New Game" 按钮已更新为使用 `<CustomButton asChild variant="outline">`。
    *   `GameCard.tsx`:
        *   完全改造，应用 "活力霓虹境" 风格：新背景色 (`bg-realm-surface-primary`)、图片区域样式 (`bg-realm-surface-secondary`)、文字颜色 (`text-realm-text-primary`, `text-realm-text-secondary`)、霓虹评分 (`text-realm-neon-primary`)、新的悬停效果（上浮 `hover:-translate-y-1`、辉光 `hover:shadow-realm-glow-primary-md`、霓虹边框 `hover:border-realm-neon-primary/50`）。
    *   排行榜组件 (`HotGamesLeaderboard.tsx`, `TopRatedGamesLeaderboard.tsx`):
        *   容器卡片样式更新 (背景 `bg-realm-surface-primary`，辉光 `shadow-realm-glow-secondary-xs`)。
        *   标题 (`text-realm-neon-secondary`) 和列表项文本颜色 (`text-realm-text-primary`, `text-realm-text-secondary`) 更新，链接悬停为 `text-realm-neon-primary`。
        *   `TopRatedGamesLeaderboard` 中的评分星星和数字颜色更新为 `text-realm-neon-primary`。

**Phase 3: 核心页面 - 游戏详情页 (`GameDetailPage.tsx`)**
Status: 已完成
    *   **`GameDetailPage.tsx` 整体:**
        *   页面元素（返回按钮、主视觉区背景、游戏标题、开发者名、标签、评分、价格、描述区标题和文本）已广泛使用 `realm-` 系列颜色，符合规范。
        *   Radix UI `<Tabs>` 组件通过 `App.tsx` 中的主题配置 (`accentColor="cyan"`) 与主霓虹色协调。
        *   Radix UI `<Button>` (如 "Add Your Review" 按钮) 与主霓虹色协调。
        *   错误文本使用 `text-destructive`，已确认其在暗模式下映射到 `realm-neon-warning`。
    *   **`PurchaseDownloadButton.tsx`:** 已更新，使用自定义 `Button` (variants `primary`, `cta`)，错误文本样式已修正。
    *   **`ReviewCard.tsx`:** 已更新，卡片背景、边框、辉光、星级评分、作者、内容、投票按钮和票数均符合 "活力霓虹境" 样式。
    *   **`GuideCard.tsx`:** 已更新，卡片背景、边框、辉光、标题、作者、徽章、点赞和查看数均符合 "活力霓虹境" 样式。
    *   **表单 (`CreateReviewForm.tsx`, `CreateGuideForm.tsx`):** 已更新，使用新的自定义 `Input`, `Textarea`, 和 `Button` (primary variant) 组件。其容器 `<Card>` (来自 `components/ui/Card.tsx`) 已确认符合 "活力霓虹境" 规范。

**Phase 4: 其他页面与通用组件**
Status: 已完成
    *   `CreateGamePage.tsx` (及子组件 `CreateGameMetadataForm.tsx`): 已检查，表单使用了更新后的自定义UI组件 (`Card`, `Input`, `Textarea`, `Button variant="cta"`)，整体符合 "活力霓虹境" 规范。Radix UI Callout 样式已调整为使用 `text-realm-neon-warning`。
    *   `DashboardPage.tsx` (及子组件 `DashboardFeature.tsx`, `DashboardManager.tsx`, `CreateDashboardForm.tsx`): 已检查。`Layout.tsx` 布局已修正。页面广泛使用自定义UI组件 (`Card`, `Input`) 或可接受的 Radix UI 组件 (Button, Heading, Text 等)。颜色与新规范协调。
    *   **通用UI组件 (在 `components/ui/`):**
        *   **`Button.tsx`:** 已确认符合 "活力霓虹境" 指南 (包含 primary, secondary, outline, cta, link variants 和多种尺寸，正确的颜色、辉光、焦点和禁用状态)。
        *   **`Input.tsx`:** 已确认符合 "活力霓虹境" 指南 (正确的背景、边框、文字、占位符颜色，以及新的焦点（辉光、ring）和错误状态样式，包含加载状态)。
        *   **`Textarea.tsx`:** 已确认符合 "活力霓虹境" 指南 (与 `Input.tsx` 样式保持一致，包含错误状态)。
        *   **`Card.tsx`:** 已确认符合 "活力霓虹境" 规范 (背景 `bg-realm-surface-primary`，边框 `border-realm-border`，标题 `text-realm-neon-secondary`，可选辉光效果)。
        *   **`Dialog.tsx`:** 依赖 Radix UI Theme (`grayColor="mauve"`)，其默认暗色模式下的表面颜色与 `realm-surface-secondary/tertiary` 协调，样式可接受。如果未来创建自定义 `components/ui/Dialog.tsx`，则需明确应用 "活力霓虹境" 规范 (如 `bg-realm-surface-secondary` 或 `tertiary` 作为内容背景，标题和文字颜色相应调整)。
        *   **`Toast.tsx` (via `react-hot-toast` in `Extra.tsx`):** 已确认 `Toaster` options (在 `Extra.tsx` 中配置) 使用 `bg-realm-surface-secondary`, `text-realm-text-primary`, `border-realm-border`, `shadow-realm-glow-primary-sm`，完全符合 "活力霓虹境" 规范。

**Phase 5: 社区功能强化 (当具体功能开发时)**
Status: 未开始

**Phase 6: 测试、迭代与优化**
Status: 未开始 