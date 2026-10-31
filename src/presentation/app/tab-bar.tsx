import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { CalculatorIcon, HistoryIcon, SlidersIcon } from '../components/icons';
import { TAB_IDS, type TabId } from './tabs';

const TAB_ICONS: Record<TabId, ReactNode> = {
  calculate: <CalculatorIcon />,
  history: <HistoryIcon />,
  settings: <SlidersIcon />,
};

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
          {TAB_ICONS[id]}
          {t(`tabs.${id}`)}
        </button>
      ))}
    </nav>
  );
}
