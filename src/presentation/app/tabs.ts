export const TAB_IDS = ['calculate', 'history', 'settings'] as const;
export type TabId = (typeof TAB_IDS)[number];

/** The tab beside this one, or null at either end: swiping doesn't wrap around. */
export function adjacentTab(tab: TabId, direction: 'next' | 'previous'): TabId | null {
  return TAB_IDS[TAB_IDS.indexOf(tab) + (direction === 'next' ? 1 : -1)] ?? null;
}
