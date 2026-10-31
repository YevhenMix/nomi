import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export type TabId = 'calculate' | 'history' | 'settings';

const TAB_ICONS: Record<TabId, ReactNode> = {
  calculate: (
    <>
      <rect x="5" y="2.5" width="14" height="19" rx="3" />
      <path d="M9 7h6M9 12h.01M12 12h.01M15 12h.01M9 16.5h.01M12 16.5h.01M15 16.5h.01" />
    </>
  ),
  history: (
    <>
      <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3.5 8.4" />
      <path d="M3.5 3.5v4.9h4.9M12 7.5V12l3 2" />
    </>
  ),
  settings: (
    <>
      <path d="M3 7h9M18 7h3M3 17h3M12 17h9" />
      <circle cx="15" cy="7" r="2.5" />
      <circle cx="9" cy="17" r="2.5" />
    </>
  ),
};

const TAB_IDS: TabId[] = ['calculate', 'history', 'settings'];

interface TabBarProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

export function TabBar({ activeTab, onChange }: TabBarProps) {
  const { t } = useTranslation();

  return (
    <nav className="tab-bar" aria-label={t('tabs.label')}>
      {TAB_IDS.map((id) => (
        <button
          key={id}
          type="button"
          className="tab-bar__item"
          aria-current={id === activeTab ? 'page' : undefined}
          onClick={() => onChange(id)}
        >
          <svg
            className="tab-bar__icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {TAB_ICONS[id]}
          </svg>
          {t(`tabs.${id}`)}
        </button>
      ))}
    </nav>
  );
}
