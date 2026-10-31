import { useState } from 'react';
import { CalculateScreen } from '../screens/calculate-screen';
import { HistoryScreen } from '../screens/history-screen';
import { SettingsScreen } from '../screens/settings-screen';
import './app.css';
import { TabBar, type TabId } from './tab-bar';

const SCREENS: Record<TabId, () => React.JSX.Element> = {
  calculate: CalculateScreen,
  history: HistoryScreen,
  settings: SettingsScreen,
};

export function App() {
  const [activeTab, setActiveTab] = useState<TabId>('calculate');
  const Screen = SCREENS[activeTab];

  return (
    <div className="app">
      <main className="app__content">
        <Screen />
      </main>
      <TabBar activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
}
