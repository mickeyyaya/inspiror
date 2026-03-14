export type Language = "en-US" | "zh-TW" | "zh-CN";

export interface TranslationKeys {
  greeting: string;
  error_connection: string;
  error_autofix_limit: string;
  error_oops: string;
  error_block_fix: string;
  buddy_tip_label: string;
  scaffold_hint: string;
  aria_my_projects: string;
  aria_hide_chat: string;
  aria_reset: string;
  aria_mute: string;
  aria_unmute: string;
  aria_enable_voice: string;
  aria_disable_voice: string;
  aria_send: string;
  aria_show_chat: string;
  aria_look_inside: string;
  aria_delete_block: string;
  aria_logic_blocks: string;
  aria_shuffle: string;
  aria_preview_sandbox: string;
  magic_button_prompt: string;
  input_placeholder: string;
  mode_build: string;
  mode_play: string;
  overlay_building: string;
  overlay_did_you_know: string;
  thinking: string;
  catalog_title: string;
  create_new: string;
  delete_project: string;
  confirm_delete: string;
  open_project: string;
  last_edited: string;
  time_just_now: string;
  time_min_ago: string;
  time_mins_ago: string;
  time_hour_ago: string;
  time_hours_ago: string;
  time_day_ago: string;
  time_days_ago: string;
  empty_catalog: string;
  what_will_you_create: string;
  tell_buddy: string;
  back_to_build: string;
  switch_language: string;
  confirm_reset: string;
  block_panel_close: string;
  block_panel_title: string;
  block_panel_hint: string;
  block_all_disabled: string;
  block_enable: string;
  block_disable: string;
  block_expand_params: string;
  block_collapse_params: string;
  param_on: string;
  param_off: string;
  converting_blocks: string;
  achievement_unlocked: string;
  achievement_awesome: string;
  badge_title: string;
  badge_builds: string;
  badge_bugs_fixed: string;
  badge_achievements: string;
  badge_buddy_avatars: string;
  aria_close_gallery: string;
  blocks_count: string;
  more_ideas: string;
  download_project: string;
  aria_download: string;
  save_error: string;
  templates_header: string;
  template_catch_star_title: string;
  template_catch_star_desc: string;
  template_bouncing_emoji_title: string;
  template_bouncing_emoji_desc: string;
  template_color_mixer_title: string;
  template_color_mixer_desc: string;
  template_counting_game_title: string;
  template_counting_game_desc: string;
  template_magic_wand_title: string;
  template_magic_wand_desc: string;
  template_emoji_rain_title: string;
  template_emoji_rain_desc: string;
  onboarding_step1_title: string;
  onboarding_step1_desc: string;
  onboarding_step2_title: string;
  onboarding_step2_desc: string;
  onboarding_step3_title: string;
  onboarding_step3_desc: string;
  onboarding_got_it: string;
  onboarding_skip: string;
  confirm_ok: string;
  confirm_cancel: string;
  share_project: string;
  aria_share: string;
  copy_html: string;
  aria_copy_html: string;
  copied_feedback: string;
  streak_days: string;
  aria_rename_project: string;
  project_count_one: string;
  project_count_many: string;
  projects_waiting: string;
  buddy_name: string;
}

export const translations: Record<Language, TranslationKeys> = {
  "en-US": {
    greeting: "Hi! I'm your builder buddy. What do you want to create today?",
    error_connection: "Oops, my connection broke! Can we try again?",
    error_autofix_limit:
      "Hmm, this bug is really tricky! It keeps breaking. What should we try instead?",
    error_oops: "Oops, I made a little mistake! Let me fix that real quick...",
    error_block_fix:
      "The block {blockId} caused this error: {error}. Please fix it.",
    buddy_tip_label: "Buddy Tip",
    scaffold_hint: "Fill in the blanks, then send!",
    aria_my_projects: "My Projects",
    aria_hide_chat: "Hide Chat",
    aria_reset: "Reset",
    aria_mute: "Mute",
    aria_unmute: "Unmute",
    aria_enable_voice: "Enable Voice",
    aria_disable_voice: "Disable Voice",
    aria_send: "Send",
    aria_show_chat: "Show Chat",
    aria_look_inside: "Look Inside",
    aria_delete_block: "Delete",
    aria_logic_blocks: "Logic blocks",
    aria_shuffle: "Shuffle suggestions",
    aria_preview_sandbox: "Preview Sandbox",
    magic_button_prompt: "Try a Magic Button! 👇",
    input_placeholder: "Type your grand idea...",
    mode_build: "Build Mode!",
    mode_play: "Play Mode!",
    overlay_building: "BUILDING!",
    overlay_did_you_know: "Did you know?",
    thinking: "Thinking",
    catalog_title: "My Creations",
    create_new: "Create New Project",
    delete_project: "Delete Project",
    confirm_delete: "Delete this project? This cannot be undone.",
    open_project: "Open Project",
    last_edited: "Last edited",
    time_just_now: "Just now",
    time_min_ago: "min ago",
    time_mins_ago: "mins ago",
    time_hour_ago: "hour ago",
    time_hours_ago: "hours ago",
    time_day_ago: "day ago",
    time_days_ago: "days ago",
    empty_catalog:
      "You haven't built anything yet! Let's create your first app! ✨",
    what_will_you_create: "What will YOU create today?",
    tell_buddy: "Tell your builder buddy your idea! ✨",
    back_to_build: "Back to Build",
    switch_language: "Switch Language",
    confirm_reset: "Reset this project? Your current work will be cleared.",
    block_panel_close: "Close",
    block_panel_title: "Blocks",
    block_panel_hint: "Drag to reorder · tap to toggle",
    block_all_disabled: "Enable a block to see your creation!",
    block_enable: "Enable",
    block_disable: "Disable",
    block_expand_params: "Expand parameters",
    block_collapse_params: "Collapse parameters",
    param_on: "on",
    param_off: "off",
    converting_blocks: "Converting your code to blocks...",
    achievement_unlocked: "Achievement Unlocked!",
    achievement_awesome: "Awesome!",
    badge_title: "My Badges",
    badge_builds: "Builds",
    badge_bugs_fixed: "Bugs Fixed",
    badge_achievements: "Achievements",
    badge_buddy_avatars: "Buddy Avatars",
    aria_close_gallery: "Close gallery",
    blocks_count: "Blocks",
    more_ideas: "More ideas",
    download_project: "Download",
    aria_download: "Download as HTML file",
    save_error: "Could not save — your storage is full!",
    templates_header: "Start from a Template",
    template_catch_star_title: "Catch the Star",
    template_catch_star_desc: "Tap a star to score points!",
    template_bouncing_emoji_title: "Bouncing Emoji",
    template_bouncing_emoji_desc: "Watch an emoji bounce around!",
    template_color_mixer_title: "Color Mixer",
    template_color_mixer_desc: "Buttons that change the background!",
    template_counting_game_title: "Counting Game",
    template_counting_game_desc: "Tap to count up to your goal!",
    template_magic_wand_title: "Magic Wand",
    template_magic_wand_desc: "Tap anywhere to create sparkles!",
    template_emoji_rain_title: "Emoji Rain",
    template_emoji_rain_desc: "Emojis falling from the sky!",
    onboarding_step1_title: "Tap a Magic Button!",
    onboarding_step1_desc:
      "Pick a suggestion to get started — your buddy will build it for you!",
    onboarding_step2_title: "Talk to Me!",
    onboarding_step2_desc: "Tap the mic to speak your idea instead of typing.",
    onboarding_step3_title: "Look Inside!",
    onboarding_step3_desc:
      "See the building blocks that make your app work. Drag and tweak them!",
    onboarding_got_it: "Got it!",
    onboarding_skip: "Skip tour",
    confirm_ok: "Yes, do it!",
    confirm_cancel: "Nope, go back",
    share_project: "Share",
    aria_share: "Share project",
    copy_html: "Copy HTML",
    aria_copy_html: "Copy project HTML to clipboard",
    copied_feedback: "Copied!",
    streak_days: "day streak!",
    aria_rename_project: "Rename project",
    project_count_one: "project",
    project_count_many: "projects",
    projects_waiting: "waiting for you!",
    buddy_name: "Builder Buddy",
  },
  "zh-TW": {
    greeting: "嗨！我是你的建築夥伴。今天你想創造什麼呢？",
    error_connection: "哎呀，連線中斷了！我們可以再試一次嗎？",
    error_autofix_limit:
      "嗯，這個問題有點棘手！一直修不好。我們改試別的方法好嗎？",
    error_oops: "哎呀，我犯了個小錯誤！讓我趕快修正一下...",
    error_block_fix: "積木 {blockId} 出現了這個錯誤：{error}。請幫我修正。",
    buddy_tip_label: "小幫手提示",
    scaffold_hint: "填入空白處，然後送出！",
    aria_my_projects: "我的專案",
    aria_hide_chat: "隱藏聊天",
    aria_reset: "重設",
    aria_mute: "靜音",
    aria_unmute: "取消靜音",
    aria_enable_voice: "開啟語音",
    aria_disable_voice: "關閉語音",
    aria_send: "發送",
    aria_show_chat: "顯示聊天",
    aria_look_inside: "看看程式碼",
    aria_delete_block: "刪除",
    aria_logic_blocks: "邏輯積木",
    aria_shuffle: "換一批建議",
    aria_preview_sandbox: "預覽沙盒",
    magic_button_prompt: "試試魔法按鈕！ 👇",
    input_placeholder: "輸入你的超棒點子...",
    mode_build: "建造模式！",
    mode_play: "遊玩模式！",
    overlay_building: "建造中！",
    overlay_did_you_know: "你知道嗎？",
    thinking: "思考中",
    catalog_title: "我的創作",
    create_new: "建立新專案",
    delete_project: "刪除專案",
    confirm_delete: "確定要刪除這個專案嗎？此操作無法復原。",
    open_project: "開啟專案",
    last_edited: "最後編輯於",
    time_just_now: "剛剛",
    time_min_ago: "分鐘前",
    time_mins_ago: "分鐘前",
    time_hour_ago: "小時前",
    time_hours_ago: "小時前",
    time_day_ago: "天前",
    time_days_ago: "天前",
    empty_catalog: "你還沒建立任何東西！讓我們開始你的第一個應用程式吧！ ✨",
    what_will_you_create: "今天你想<br/>創造什麼呢？",
    tell_buddy: "告訴你的建築夥伴你的點子吧！ ✨",
    back_to_build: "回到建造",
    switch_language: "切換語言",
    confirm_reset: "要重設這個專案嗎？目前的作品會被清除。",
    block_panel_close: "關閉",
    block_panel_title: "積木",
    block_panel_hint: "拖曳排序 · 點擊切換",
    block_all_disabled: "啟用一個積木來看看你的作品吧！",
    block_enable: "啟用",
    block_disable: "停用",
    block_expand_params: "展開參數",
    block_collapse_params: "收合參數",
    param_on: "開",
    param_off: "關",
    converting_blocks: "正在將您的程式碼轉換為積木...",
    achievement_unlocked: "成就解鎖！",
    achievement_awesome: "太棒了！",
    badge_title: "我的徽章",
    badge_builds: "建造次數",
    badge_bugs_fixed: "修復次數",
    badge_achievements: "成就",
    badge_buddy_avatars: "夥伴頭像",
    aria_close_gallery: "關閉徽章",
    blocks_count: "積木",
    more_ideas: "更多點子",
    download_project: "下載",
    aria_download: "下載為 HTML 檔案",
    save_error: "無法儲存 — 你的儲存空間已滿！",
    templates_header: "從範本開始",
    template_catch_star_title: "接住星星",
    template_catch_star_desc: "點擊星星來得分！",
    template_bouncing_emoji_title: "彈跳表情",
    template_bouncing_emoji_desc: "看表情符號到處彈跳！",
    template_color_mixer_title: "顏色調色盤",
    template_color_mixer_desc: "按按鈕改變背景顏色！",
    template_counting_game_title: "數數遊戲",
    template_counting_game_desc: "點擊數到你的目標！",
    template_magic_wand_title: "魔法棒",
    template_magic_wand_desc: "點擊任意處創造火花！",
    template_emoji_rain_title: "表情雨",
    template_emoji_rain_desc: "表情符號從天空落下！",
    onboarding_step1_title: "點擊魔法按鈕！",
    onboarding_step1_desc: "選一個建議開始吧 — 你的夥伴會幫你做出來！",
    onboarding_step2_title: "跟我說話！",
    onboarding_step2_desc: "點擊麥克風，用說的來告訴我你的點子。",
    onboarding_step3_title: "看看裡面！",
    onboarding_step3_desc: "看看組成你的應用的積木。你可以拖動和調整它們！",
    onboarding_got_it: "知道了！",
    onboarding_skip: "跳過導覽",
    confirm_ok: "好，執行！",
    confirm_cancel: "不，返回",
    share_project: "分享",
    aria_share: "分享專案",
    copy_html: "複製 HTML",
    aria_copy_html: "複製專案 HTML 到剪貼簿",
    copied_feedback: "已複製！",
    streak_days: "天連續！",
    aria_rename_project: "重新命名專案",
    project_count_one: "個專案",
    project_count_many: "個專案",
    projects_waiting: "正在等著你！",
    buddy_name: "小幫手",
  },
  "zh-CN": {
    greeting: "嗨！我是你的建筑夥伴。今天你想创造什么呢？",
    error_connection: "哎呀，连线中断了！我们可以再试一次吗？",
    error_autofix_limit:
      "嗯，这个问题有点棘手！一直修不好。我们改试别的方法好吗？",
    error_oops: "哎呀，我犯了个小错误！让我赶快修正一下...",
    error_block_fix: "积木 {blockId} 出现了这个错误：{error}。请帮我修正。",
    buddy_tip_label: "小帮手提示",
    scaffold_hint: "填入空白处，然后发送！",
    aria_my_projects: "我的项目",
    aria_hide_chat: "隐藏聊天",
    aria_reset: "重置",
    aria_mute: "静音",
    aria_unmute: "取消静音",
    aria_enable_voice: "开启语音",
    aria_disable_voice: "关闭语音",
    aria_send: "发送",
    aria_show_chat: "显示聊天",
    aria_look_inside: "看看程序码",
    aria_delete_block: "删除",
    aria_logic_blocks: "逻辑积木",
    aria_shuffle: "换一批建议",
    aria_preview_sandbox: "预览沙盒",
    magic_button_prompt: "试试魔法按钮！ 👇",
    input_placeholder: "输入你的超棒点子...",
    mode_build: "建造模式！",
    mode_play: "游玩模式！",
    overlay_building: "建造中！",
    overlay_did_you_know: "你知道吗？",
    thinking: "思考中",
    catalog_title: "我的创作",
    create_new: "建立新项目",
    delete_project: "删除项目",
    confirm_delete: "确定要删除这个项目吗？此操作无法撤销。",
    open_project: "开启项目",
    last_edited: "最后编辑于",
    time_just_now: "刚刚",
    time_min_ago: "分钟前",
    time_mins_ago: "分钟前",
    time_hour_ago: "小时前",
    time_hours_ago: "小时前",
    time_day_ago: "天前",
    time_days_ago: "天前",
    empty_catalog: "你还没建立任何东西！让我们开始你的第一个应用程式吧！ ✨",
    what_will_you_create: "今天你想<br/>创造什么呢？",
    tell_buddy: "告诉你的建筑夥伴你的点子吧！ ✨",
    back_to_build: "回到建造",
    switch_language: "切换语言",
    confirm_reset: "要重置这个项目吗？目前的作品会被清除。",
    block_panel_close: "关闭",
    block_panel_title: "积木",
    block_panel_hint: "拖拽排序 · 点击切换",
    block_all_disabled: "启用一个积木来看看你的作品吧！",
    block_enable: "启用",
    block_disable: "停用",
    block_expand_params: "展开参数",
    block_collapse_params: "收起参数",
    param_on: "开",
    param_off: "关",
    converting_blocks: "正在将您的代码转换为积木...",
    achievement_unlocked: "成就解锁！",
    achievement_awesome: "太棒了！",
    badge_title: "我的徽章",
    badge_builds: "建造次数",
    badge_bugs_fixed: "修复次数",
    badge_achievements: "成就",
    badge_buddy_avatars: "伙伴头像",
    aria_close_gallery: "关闭徽章",
    blocks_count: "积木",
    more_ideas: "更多点子",
    download_project: "下载",
    aria_download: "下载为 HTML 文件",
    save_error: "无法保存 — 你的存储空间已满！",
    templates_header: "从模板开始",
    template_catch_star_title: "接住星星",
    template_catch_star_desc: "点击星星来得分！",
    template_bouncing_emoji_title: "弹跳表情",
    template_bouncing_emoji_desc: "看表情符号到处弹跳！",
    template_color_mixer_title: "颜色调色板",
    template_color_mixer_desc: "按按钮改变背景颜色！",
    template_counting_game_title: "数数游戏",
    template_counting_game_desc: "点击数到你的目标！",
    template_magic_wand_title: "魔法棒",
    template_magic_wand_desc: "点击任意处创造火花！",
    template_emoji_rain_title: "表情雨",
    template_emoji_rain_desc: "表情符号从天空落下！",
    onboarding_step1_title: "点击魔法按钮！",
    onboarding_step1_desc: "选一个建议开始吧 — 你的伙伴会帮你做出来！",
    onboarding_step2_title: "跟我说话！",
    onboarding_step2_desc: "点击麦克风，用说的来告诉我你的点子。",
    onboarding_step3_title: "看看里面！",
    onboarding_step3_desc: "看看组成你的应用的积木。你可以拖动和调整它们！",
    onboarding_got_it: "知道了！",
    onboarding_skip: "跳过导览",
    confirm_ok: "好，执行！",
    confirm_cancel: "不，返回",
    share_project: "分享",
    aria_share: "分享项目",
    copy_html: "复制 HTML",
    aria_copy_html: "复制项目 HTML 到剪贴板",
    copied_feedback: "已复制！",
    streak_days: "天连续！",
    aria_rename_project: "重命名项目",
    project_count_one: "个项目",
    project_count_many: "个项目",
    projects_waiting: "正在等着你！",
    buddy_name: "小帮手",
  },
};
