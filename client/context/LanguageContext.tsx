"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'vi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const translations = {
  en: {
    // Header
    lobby: 'Lobby',
    barracks: 'Barracks',
    leaderboard: 'Leaderboard',
    search_room: 'Search Room ID',
    
    // Lobby
    deployment_zone: 'DEPLOYMENT ZONE',
    deployment_desc: 'Select a tactical operation or deploy immediately to the front lines.',
    quick_play: 'PvP Online',
    ranked_match: 'Global Matchmaking',
    pve_training: 'Ghost AI (PvE)',
    create_room: 'Create Custom Room',
    active_ops: 'Active Operations',
    op_name: 'Operation Name',
    difficulty: 'Difficulty',
    grid_size: 'Grid Size',
    captains: 'Captains',
    status: 'Status',
    deploy: 'JOIN',
    join: 'JOIN',
    action: 'ACTION',
    top_commanders: 'Top Commanders',
    community_chat: 'Community Chat',
    broadcast: 'Broadcast message...',
    enter_callsign: 'Enter Callsign',
    identify_commander: 'Identify yourself, Commander.',
    placeholder_name: 'Enter your name...',
    cancel: 'Cancel',
    confirm: 'Confirm',
    room_waiting: 'WAITING',
    room_placing: 'PREPARING',
    room_battle: 'BATTLE',
    room_full: 'FULL',
    opponent_left_title: 'OPPONENT DESERTED',
    opponent_left_desc: 'Your opponent has left the sector. Command, what are our orders?',
    continue_searching: 'Stay in the lobby',
    exit_to_lobby: 'EXIT TO LOBBY',
    confirm_exit_room: 'Are you sure you want to abandon this operation?',
    abort_title: 'ABORT MISSION?',
    abort_description: 'You are about to withdraw from the current sector. All progress and tactical data will be lost. Admiral, confirm your orders.',
    keep_fighting: 'NEGATIVE, KEEP FIGHTING',
    confirm_abort: 'CONFIRM ABORT',
    
    // Placement
    unit_deployment: 'UNIT DEPLOYMENT',
    vessel_manifest: 'Vessel Manifest',
    init_fleet: 'Initialize Fleet',
    tactical_tools: 'Tactical Tools',
    rotate_ship: 'Rotate Ship',
    rotate_desc: 'Toggle orientation (Hotkey: R)',
    auto_deploy: 'Auto-Deploy',
    auto_desc: 'Randomize fleet deployment',
    reset_board: 'Reset Board',
    reset_desc: 'Clear all tactical active units',
    finding_opponent: 'FINDING OPPONENT...',
    units_missing: 'Units missing for deployment',
    verified: 'Verified',
    incomplete: 'Incomplete',
    auth_level: 'Auth Level',
    status_label: 'Status',
    pvp_online: 'PvP Online',
    pve_ghost: 'Ghost AI (PBE)',
    fleet_pvp: 'Fleet-to-Fleet (PVP)',
    ghost_pve: 'Ghost Simulation (PVE)',
    selected_mode: 'Selected Mode:',
    drag_drop_active: 'DRAG & DROP DEACTIVATED',
    commander_lbl: 'COMMANDER',
    sector_lbl: 'Sector 7-A',
    dock_auth_active: 'Dry Dock Authorization Active',
    server_online: 'Connected',
    server_offline: 'CONNECTING...',
    
    // Additional Placement strings
    score: 'SCORE',
    simulation_mode: 'Simulation Mode',
    live_combat: 'Live Combat',
    status_training: 'TRAINING',
    status_ready: 'READY',
    status_waiting: 'WAITING',
    abort_action: 'Abort',
    opponent_placing: 'OPPONENT IS PLACING SHIPS',
    searching_opponent: 'SEARCHING FOR OPPONENT...',
    come_to_battle: 'Come To Battle',
    units_placed_lbl: 'Units Placed',
    registry: 'REG',
    length: 'LEN',
    targeting_matrix: 'Targeting Matrix',
    scanning: 'Scanning...',
    
    // Battle
    battle_arena: 'BATTLE ARENA',
    enemy_waters: 'Enemy Waters',
    defensive_grid: 'Defensive Grid',
    command_orders: 'Command Orders',
    battle_log: 'Battle Intel Log',
    live_feed: 'Live Operational Feed',
    sectors_active: 'Sectors Active',
    scanning_signals: 'Scanning for signals...',
    server_down_msg: 'Lost connection to Command Center. Server is offline.',
    find_match: 'FIND MATCH',

    // New Battle UI
    accuracy: 'Accuracy',
    enemy_ships: 'Enemy Ships',
    momentum: 'Momentum',
    advantage_you: 'Advantage: You',
    advantage_enemy: 'Advantage: Enemy',
    score_label: 'SCORE',
    commander: 'Commander',
    opponent: 'Opponent',
    ghost_ai: 'GHOST AI',
    your_turn: 'Your Turn',
    enemy_turn: 'Enemy Turn',
    timer: 'Timer',
    neural_link: 'Deploying Neural Link',
    scanning_freq: 'Scanning Frequency 142.85 MHz...',
    victory: 'VICTORY',
    defeat: 'DEFEAT',
    victory_desc: 'You have successfully eliminated the enemy fleet and secured the sector.',
    defeat_desc: 'Commander, our forces have been overwhelmed. We must regroup.',
    rematch_accept: 'Accept Rematch Request',
    waiting_opponent_rematch: 'Waiting for opponent...',
    rematch_btn: 'Rematch',
    redeploy_btn: 'Re-deploy',
    return_to_base: 'Return to Base',
    tactical_minimap: 'Tactical Mini-Map',
    fleet_active: 'Fleet Active',
    neural_feed: 'Neural Feed',
    you_go_first: 'YOU GO FIRST',
    enemy_go_first: 'ENEMY GO FIRST',

    // Battle Logs
    log_auto_fire: 'COMMANDER INACTIVE. AUTO-FIRE INITIATED.',
    log_strike_authorized: 'STRIKE AUTHORIZED',
    log_victory: 'VICTORY! ENEMY FLEET NEUTRALIZED. SECTOR SECURED.',
    log_mission_complete: 'MISSION COMPLETE',
    log_defeat: 'DEFEAT declared. Fleet non-operational.',
    log_mission_failed: 'MISSION FAILED',
    log_retreat: 'DEFEAT. FLEET DESTROYED. RETREAT IMMEDIATELY.',
    log_confirmed_kill: 'CONFIRMED KILL. ENEMY SHIP DESTROYED.',
    log_target_neutralized: 'TARGET NEUTRALIZED',
    log_warning_sunk: 'WARNING! {name} HAS BEEN DESTROYED!',
    log_critical_damage: 'CRITICAL DAMAGE',
    log_enemy_fired: 'Enemy fired at {pos}',
    log_direct_hit: 'DIRECT HIT!',
    log_splash_miss: 'Splash... Miss.',
    log_you_fired: 'You fired at {pos}',
    log_target_eliminated: 'TARGET ELIMINATED!',
    log_water_impact: 'Water impact. Miss.',
    log_negative_impact: 'NEGATIVE IMPACT. ENEMY TURN STARTING.',
    log_switching_defense: 'SWITCHING TO DEFENSE',
    log_confirmed_neutralized: 'CONFIRMED: {name} HAS BEEN NEUTRALIZED.',
    log_target_destroyed: 'TARGET DESTROYED',
  },
  vi: {
    // Header
    lobby: 'Sảnh Chờ',
    barracks: 'Doanh Trại',
    leaderboard: 'Bảng Xếp Hạng',
    search_room: 'Tìm Mã Phòng',
    
    // Lobby
    deployment_zone: 'KHU VỰC TRIỂN KHAI',
    deployment_desc: 'Chọn một chiến dịch tác chiến hoặc hành quân ngay ra tiền tuyến.',
    quick_play: 'PVP Trực Tuyến',
    ranked_match: 'Trận Đấu Đỉnh Caoo',
    pve_training: 'Ghost AI (PVE)',
    create_room: 'Tạo Phòng Tùy Chỉnh',
    active_ops: 'Chiến Dịch Đang Chạy',
    op_name: 'Tên Chiến Dịch',
    difficulty: 'Độ Khó',
    grid_size: 'Kích Thước Lưới',
    captains: 'Thuyền Trưởng',
    status: 'Trạng Thái',
    deploy: 'THAM GIA',
    join: 'THAM GIA',
    action: 'THAO TÁC',
    top_commanders: 'Đô Đốc Hàng Đầu',
    community_chat: 'Kênh Thế Giới',
    broadcast: 'Phát tin nhắn...',
    enter_callsign: 'Nhập Danh Xưng',
    identify_commander: 'Hãy xác nhận danh tính, thưa Đô đốc.',
    placeholder_name: 'Nhập tên của bạn...',
    cancel: 'Hủy',
    confirm: 'Xác nhận',
    room_waiting: 'ĐANG CHỜ',
    room_placing: 'DÀN TRẬN',
    room_battle: 'TRONG TRẬN',
    room_full: 'PHÒNG ĐẦY',
    opponent_left_title: 'ĐỐI THỦ ĐÃ BẢY CHỌ',
    opponent_left_desc: 'Đối thủ của bạn đã rút lui khỏi khu vực. Đô đốc, mệnh lệnh của ngài là gì?',
    continue_searching: 'Ở Lại',
    exit_to_lobby: 'RỜI ĐI',
    confirm_exit_room: 'Bạn có chắc chắn muốn hủy bỏ chiến dịch này không?',
    abort_title: 'HỦY CHIẾN DỊCH?',
    abort_description: 'Ngài sắp rút quân khỏi khu vực hiện tại. Toàn bộ tiến trình và dữ liệu chiến thuật sẽ bị xóa sạch. Đô đốc, hãy xác nhận mệnh lệnh.',
    keep_fighting: 'TIẾP TỤC CHIẾN ĐẤU',
    confirm_abort: 'XÁC NHẬN RÚT QUÂN',
    
    // Placement
    unit_deployment: 'TRIỂN KHAI ĐỘI HÌNH',
    vessel_manifest: 'Danh Sách Chiến Hạm',
    init_fleet: 'Khởi Tạo Hạm Đội',
    tactical_tools: 'Công Cụ Chiến Thuật',
    rotate_ship: 'Xoay Tàu',
    rotate_desc: 'Đổi hướng (Phím tắt: R)',
    auto_deploy: 'Tự Động Xếp',
    auto_desc: 'Sắp xếp ngẫu nhiên đội hình',
    reset_board: 'Làm Mới Bàn',
    reset_desc: 'Xóa toàn bộ đơn vị đang đặt',
    finding_opponent: 'ĐANG TÌM ĐỐI THỦ...',
    units_missing: 'Chưa đủ đơn vị để triển khai',
    verified: 'Đã Xác Minh',
    incomplete: 'Chưa Hoàn Tất',
    auth_level: 'Cấp Quyền',
    status_label: 'Trạng Thái',
    pvp_online: 'PvP Trực Tuyến',
    pve_ghost: 'Ghost AI (PBE)',
    fleet_pvp: 'Hạm Đội Đấu Hạm Đội (PVP)',
    ghost_pve: 'Mô Phỏng Bóng Ma (PVE)',
    selected_mode: 'Chế Độ Đang Chọn:',
    drag_drop_active: 'KÉO & THẢ ĐANG TẮT',
    commander_lbl: 'CHỈ HUY',
    sector_lbl: 'Khu Vực 7-A',
    dock_auth_active: 'Quyền Truy Cập Xưởng Tàu Đã Bật',
    server_online: 'HOẠT ĐỘNG',
    server_offline: 'MẤT KẾT NỐI',
    
    // Additional Placement strings
    score: 'ĐIỂM',
    simulation_mode: 'Chế Độ Mô Phỏng',
    live_combat: 'Tác Chiến Thực Tế',
    status_training: 'HUẤN LUYỆN',
    status_ready: 'SẴN SÀNG',
    status_waiting: 'ĐANG CHỜ',
    abort_action: 'Hủy Bỏ',
    opponent_placing: 'ĐỐI THỦ ĐANG DÀN TRẬN',
    searching_opponent: 'ĐANG TÌM ĐỐI THỦ...',
    come_to_battle: 'ĐẾN CHIẾN TRƯỜNG',
    units_placed_lbl: 'Đơn Vị Đã Đặt',
    registry: 'MS',
    length: 'DÀI',
    targeting_matrix: 'Ma Trận Mục Tiêu',
    scanning: 'Đang Quét...',
    
    // Battle
    battle_arena: 'CHIẾN TRƯỜNG',
    enemy_waters: 'Vùng Biển Địch',
    defensive_grid: 'Lưới Phòng Thủ',
    command_orders: 'Mệnh Lệnh Chỉ Huy',
    battle_log: 'Nhật Ký Tác Chiến',
    live_feed: 'RADAR HOẠT ĐỘNG',
    sectors_active: 'KHU VỰC CÓ TÍN HIỆU',
    scanning_signals: 'Đang quét tín hiệu...',
    server_down_msg: 'Mất kết nối với trung tâm chỉ huy. Server sập rồi mấy ní ơi:))',
    find_match: 'TÌM TRẬN',

    // New Battle UI
    accuracy: 'Độ Chính Xác',
    enemy_ships: 'Tàu Địch',
    momentum: 'Thế Trận',
    advantage_you: 'Ưu Thế: Bạn',
    advantage_enemy: 'Ưu Thế: Địch',
    score_label: 'ĐIỂM',
    commander: 'Đô Đốc',
    opponent: 'Đối Thủ',
    ghost_ai: 'GHOST AI',
    your_turn: 'Đến Lượt Bạn',
    enemy_turn: 'Đến Lượt Địch',
    timer: 'Thời Gian',
    neural_link: 'Đang Kết Nối Thần Kinh',
    scanning_freq: 'Đang Quét Tần Số 142.85 MHz...',
    victory: 'CHIẾN THẮNG',
    defeat: 'THẤT BẠI',
    victory_desc: 'Bạn đã tiêu diệt hoàn toàn hạm đội địch và làm chủ khu vực.',
    defeat_desc: 'Thưa Đô đốc, lực lượng của chúng ta đã bị áp đảo. Chúng ta cần tập hợp lại.',
    rematch_accept: 'Đồng ý yêu cầu chơi lại',
    waiting_opponent_rematch: 'Đang đợi đối thủ...',
    rematch_btn: 'Chơi Lại',
    redeploy_btn: 'Tái Triển Khai',
    return_to_base: 'Trở Về Căn Cứ',
    tactical_minimap: 'Bản Đồ Chiến Thuật',
    fleet_active: 'Hạm Đội Sẵn Sàng',
    neural_feed: 'Tín Hiệu Thần Kinh',
    you_go_first: 'BẠN ĐI TRƯỚC',
    enemy_go_first: 'ĐỐI THỦ ĐI TRƯỚC',

    // Battle Logs
    log_auto_fire: 'CHỈ HUY KHÔNG PHẢN HỒI. TỰ ĐỘNG KHAI HỎA.',
    log_strike_authorized: 'LỆNH CÔNG KÍCH ĐÃ DUYỆT',
    log_victory: 'CHIẾN THẮNG! HẠM ĐỘI ĐỊCH ĐÃ BỊ LOẠI BỎ. KHU VỰC ĐÃ AN TOÀN.',
    log_mission_complete: 'CHIẾN DỊCH HOÀN TẤT',
    log_defeat: 'THẤT BẠI. Hạm đội không còn khả năng tác chiến.',
    log_mission_failed: 'CHIẾN DỊCH THẤT BẠI',
    log_retreat: 'THẤT BẠI. HẠM ĐỘI ĐÃ BỊ PHÁ HỦY. RÚT QUÂN NGAY LẬP TỨC.',
    log_confirmed_kill: 'XÁC NHẬN TIÊU DIỆT. TÀU ĐỊCH ĐÃ BỊ PHÁ HỦY.',
    log_target_neutralized: 'MỤC TIÊU ĐÃ BỊ LOẠI BỎ',
    log_warning_sunk: 'CẢNH BÁO! {name} ĐÃ BỊ PHÁ HỦY!',
    log_critical_damage: 'THIỆT HẠI NGHIÊM TRỌNG',
    log_enemy_fired: 'Địch khai hỏa tại {pos}',
    log_direct_hit: 'TRÚNG ĐÍCH!',
    log_splash_miss: 'Trượt... Chỉ trúng nước.',
    log_you_fired: 'Bạn khai hỏa tại {pos}',
    log_target_eliminated: 'MỤC TIÊU ĐÃ BỊ TIÊU DIỆT!',
    log_water_impact: 'Trúng nước. Trượt.',
    log_negative_impact: 'CÔNG KÍCH THẤT BẠI. LƯỢT CỦA ĐỊCH BẮT ĐẦU.',
    log_switching_defense: 'CHUYỂN SANG PHÒNG THỦ',
    log_confirmed_neutralized: 'XÁC NHẬN: {name} ĐÃ BỊ LOẠI BỎ.',
    log_target_destroyed: 'MỤC TIÊU ĐÃ BỊ PHÁ HỦY',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  // Load language preference from local storage
  useEffect(() => {
    const saved = localStorage.getItem('app-language') as Language;
    if (saved && (saved === 'en' || saved === 'vi')) {
      setLanguage(saved);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('app-language', lang);
  };

  const t = (key: string, params?: Record<string, string>) => {
    let translation = translations[language][key as keyof typeof translations['en']] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        translation = translation.replace(`{${k}}`, v);
      });
    }
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
