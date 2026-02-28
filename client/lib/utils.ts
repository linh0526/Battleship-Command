const RANK_THRESHOLDS = [
    { min: 1800, title: 'Đô đốc' },
    { min: 1401, title: 'Đại tướng' },
    { min: 1101, title: 'Trung tướng' },
    { min: 851, title: 'Thiếu tướng' },
    { min: 651, title: 'Đại tá' },
    { min: 501, title: 'Thượng tá' },
    { min: 401, title: 'Trung tá' },
    { min: 311, title: 'Thiếu tá' },
    { min: 231, title: 'Đại úy' },
    { min: 161, title: 'Trung úy' },
    { min: 111, title: 'Thiếu úy' },
    { min: 71, title: 'Thượng sĩ' },
    { min: 41, title: 'Trung sĩ' },
    { min: 21, title: 'Hạ sĩ' },
    { min: 11, title: 'Tân binh III' },
    { min: 6, title: 'Tân binh II' },
    { min: 0, title: 'Tân binh I' }
];

export const getRank = (m: number) => {
    const rank = RANK_THRESHOLDS.find(r => m >= r.min);
    return rank ? rank.title : 'Tân binh I';
};
