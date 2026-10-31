export const TAB_IDS = ['calculate', 'history', 'settings'] as const;
export type TabId = (typeof TAB_IDS)[number];
