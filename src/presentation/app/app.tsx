import { useState } from 'react';
import { useSwipe } from '../hooks/use-swipe';
import { CalculateScreen } from '../screens/calculate-screen';
import { HistoryScreen } from '../screens/history-screen';
import { SettingsScreen } from '../screens/settings-screen';
import './app.css';
import { TabBar } from './tab-bar';
import { adjacentTab, type TabId } from './tabs';

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>('calculate');
  // Which side a swiped-to screen slides in from. Tapping a tab switches without sliding.
  const [enteredFrom, setEnteredFrom] = useState<'left' | 'right' | null>(null);
  // Lives here so the hours survive a trip to Settings to change the rate.
  const [hoursText, setHoursText] = useState('');

  function selectTab(tab: TabId) {
    setEnteredFrom(null);
    setActiveTab(tab);
  }

  const swipeHandlers = useSwipe((direction) => {
    const tab = adjacentTab(activeTab, direction === 'left' ? 'next' : 'previous');
    if (!tab) return;
    setEnteredFrom(direction === 'left' ? 'right' : 'left');
    setActiveTab(tab);
  });

  return (
    <div className="app">
      <main
        key={activeTab}
        className="app__content"
        data-entered-from={enteredFrom ?? undefined}
        {...swipeHandlers}
      >
        {activeTab === 'calculate' && (
          <CalculateScreen
            hoursText={hoursText}
            onHoursTextChange={setHoursText}
            onChangeRate={() => selectTab('settings')}
          />
        )}
        {activeTab === 'history' && <HistoryScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </main>
      <TabBar activeTab={activeTab} onChange={selectTab} />
    </div>
  );
}
