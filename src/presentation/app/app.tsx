import { useState } from 'react';
import { CalculateScreen } from '../screens/calculate-screen';
import { HistoryScreen } from '../screens/history-screen';
import { SettingsScreen } from '../screens/settings-screen';
import './app.css';
import { TabBar, type TabId } from './tab-bar';

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>('calculate');
  // Lives here so the hours survive a trip to Settings to change the rate.
  const [hoursText, setHoursText] = useState('');

  return (
    <div className="app">
      <main key={activeTab} className="app__content">
        {activeTab === 'calculate' && (
          <CalculateScreen
            hoursText={hoursText}
            onHoursTextChange={setHoursText}
            onChangeRate={() => setActiveTab('settings')}
          />
        )}
        {activeTab === 'history' && <HistoryScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </main>
      <TabBar activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
}
