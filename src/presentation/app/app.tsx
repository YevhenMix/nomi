import { useState } from 'react';
import { usePageSwipe } from '../hooks/use-page-swipe';
import { CalculateScreen } from '../screens/calculate-screen';
import { HistoryScreen } from '../screens/history-screen';
import { SettingsScreen } from '../screens/settings-screen';
import './app.css';
import { TabBar } from './tab-bar';
import { TAB_IDS, type TabId } from './tabs';

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>('calculate');
  const [hoursText, setHoursText] = useState('');

  function goToTab(tab: TabId) {
    // Saves a field being edited and closes the keyboard before its screen slides away.
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    setActiveTab(tab);
  }

  const { trackRef, restingTransform, handlers } = usePageSwipe({
    pageIndex: TAB_IDS.indexOf(activeTab),
    pageCount: TAB_IDS.length,
    onPageChange: (index) => goToTab(TAB_IDS[index] ?? activeTab),
  });

  const screens: Record<TabId, React.JSX.Element> = {
    calculate: (
      <CalculateScreen
        hoursText={hoursText}
        onHoursTextChange={setHoursText}
        onChangeRate={() => goToTab('settings')}
      />
    ),
    history: <HistoryScreen />,
    settings: <SettingsScreen />,
  };

  return (
    <div className="app">
      <main className="app__content" {...handlers}>
        {/* All screens stay mounted side by side, so the next one is ready to slide in. */}
        <div ref={trackRef} className="pager" style={{ transform: restingTransform }}>
          {TAB_IDS.map((tab) => (
            <div
              key={tab}
              className="pager__page"
              inert={tab !== activeTab}
              aria-hidden={tab !== activeTab}
            >
              {screens[tab]}
            </div>
          ))}
        </div>
      </main>
      <TabBar activeTab={activeTab} onChange={goToTab} />
    </div>
  );
}
