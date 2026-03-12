export type Language = "en-US" | "zh-TW" | "zh-CN";

export interface TranslationKeys {
  greeting: string;
  error_connection: string;
  error_autofix_limit: string;
  error_oops: string;
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
}

export const translations: Record<Language, TranslationKeys> = {
  "en-US": {
    greeting: "Hi! I'm your builder buddy. What do you want to create today?",
    error_connection: "Oops, my connection broke! Can we try again?",
    error_autofix_limit:
      "Hmm, this bug is really tricky! It keeps breaking. What should we try instead?",
    error_oops: "Oops, I made a little mistake! Let me fix that real quick...",
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
  },
  "zh-TW": {
    greeting: "嗨！我是你的建築夥伴。今天你想創造什麼呢？",
    error_connection: "哎呀，連線中斷了！我們可以再試一次嗎？",
    error_autofix_limit:
      "嗯，這個問題有點棘手！一直修不好。我們改試別的方法好嗎？",
    error_oops: "哎呀，我犯了個小錯誤！讓我趕快修正一下...",
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
  },
  "zh-CN": {
    greeting: "嗨！我是你的建筑夥伴。今天你想创造什么呢？",
    error_connection: "哎呀，连线中断了！我们可以再试一次吗？",
    error_autofix_limit:
      "嗯，这个问题有点棘手！一直修不好。我们改试别的方法好吗？",
    error_oops: "哎呀，我犯了个小错误！让我赶快修正一下...",
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
  },
};
