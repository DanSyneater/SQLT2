
import { useEffect, useState } from 'react';

export const Settings = ({ setConnection }: { setConnection: (s: string) => void }) => {
    const [val, setVal] = useState('');
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Database Settings</h2>
            <input 
                value={val}
                onChange={(e) => setVal(e.target.value)}
                placeholder="Connection String"
                className="w-full p-2 border rounded"
            />
            <button onClick={() => setConnection(val)} className="bg-green-600 text-white p-2 rounded">Set Connection</button>
        </div>
    );
}

export const SchemaBrowser = ({ connectionString }: { connectionString: string | null }) => {
    const [schema, setSchema] = useState<any>(null);

    useEffect(() => {
        if (!connectionString) return;
        Promise.all([
            fetch('/api/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ connectionString }) }).then(res => res.json()).catch(() => ({ tables: [], views: [], columns: [] })),
            fetch('/api/keys', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ connectionString }) }).then(res => res.json()).catch(() => [])
        ]).then(([schemaData, keysData]) => {
            setSchema({ 
                tables: schemaData.tables || [], 
                views: schemaData.views || [], 
                columns: schemaData.columns || [], 
                keys: Array.isArray(keysData) ? keysData : [] 
            });
        });
    }, [connectionString]);

    if (!connectionString) return <div>Please set connection string in Settings.</div>;
    if (!schema) return <div>Loading schema...</div>;

    const tables = schema.tables || [];
    const views = schema.views || [];
    const keys = schema.keys || [];

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Schema Browser</h2>
            <div className="bg-white p-4 rounded shadow">
                <h3 className="font-bold">Tables ({tables.length})</h3>
                <ul className="text-sm">
                    {tables.map((t: any) => <li key={t.TABLE_NAME}>{t.TABLE_NAME} ({t.ROW_COUNT} rows)</li>)}
                </ul>
            </div>
            <div className="bg-white p-4 rounded shadow">
                <h3 className="font-bold">Views ({views.length})</h3>
                <ul className="text-sm">
                    {views.map((v: any) => <li key={v.TABLE_NAME}>{v.TABLE_NAME}</li>)}
                </ul>
            </div>
            <div className="bg-white p-4 rounded shadow">
                <h3 className="font-bold">Relationships ({keys.length})</h3>
                <ul className="text-sm">
                    {keys.map((k: any) => <li key={k.ForeignKey}>{k.TableName} ({k.ColumnName}) &rarr; {k.ReferencedTableName} ({k.ReferencedColumnName})</li>)}
                </ul>
            </div>
        </div>
    );
};

export const Reports = () => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold">Reports (SSRS)</h2>
    <p>Parse and visualize business logic from .rdl files.</p>
  </div>
);

export const QueryGenerator = () => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold">Query Generator</h2>
    <textarea className="w-full h-32 p-2 border rounded" placeholder="Ask a question in natural language..."></textarea>
    <button className="bg-blue-600 text-white p-2 rounded">Generate SQL</button>
  </div>
);

export const Glossary = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Business Glossary</h2>
      <p>Approved business term definitions.</p>
    </div>
  );
