/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState } from 'react';
import { SchemaBrowser, Reports, QueryGenerator, Glossary, Settings } from './components/Views';

// Simplified components for layout structure
const Sidebar = ({ active, setActive }: { active: string; setActive: (s: string) => void }) => (
  <nav className="w-64 bg-gray-900 text-white min-h-screen p-4">
    <h2 className="text-xl font-bold mb-6">Tharsten Intelligence</h2>
    {['Dashboard', 'Settings', 'Schema Browser', 'Reports', 'Query Generator', 'Glossary'].map(item => (
      <button
        key={item}
        onClick={() => setActive(item)}
        className={`block w-full text-left p-2 rounded ${active === item ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
      >
        {item}
      </button>
    ))}
  </nav>
);

export default function App() {
  const [active, setActive] = useState('Dashboard');
  const [connectionString, setConnectionString] = useState<string | null>(null);

  const renderContent = () => {
    switch (active) {
      case 'Settings': return <Settings setConnection={setConnectionString} />;
      case 'Schema Browser': return <SchemaBrowser connectionString={connectionString} />;
      case 'Reports': return <Reports />;
      case 'Query Generator': return <QueryGenerator />;
      case 'Glossary': return <Glossary />;
      default: return <p>System health and scan status...</p>;
    }
  };

  return (
    <div className="flex">
      <Sidebar active={active} setActive={setActive} />
      <main className="flex-1 p-8 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">{active}</h1>
        {renderContent()}
      </main>
    </div>
  );
}
