import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  Database, Table, Key, Shield, Layers, Search, 
  RefreshCw, CheckCircle2, AlertCircle, Info, ExternalLink
} from 'lucide-react';

export default function TablesPage() {
  const [tablesList, setTablesList] = useState([]);
  const [selectedTable, setSelectedTable] = useState('users');
  const [tableData, setTableData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('data'); // 'data' | 'schema'

  const fetchTables = async () => {
    try {
      const res = await api.get('/database/tables');
      setTablesList(res.data.tables || []);
    } catch (err) {
      console.error('Failed to fetch tables list:', err);
    }
  };

  const fetchTableDetail = async (tableName) => {
    setLoading(true);
    try {
      const res = await api.get(`/database/tables/${tableName}`);
      setTableData(res.data);
    } catch (err) {
      console.error(`Failed to fetch data for ${tableName}:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      fetchTableDetail(selectedTable);
    }
  }, [selectedTable]);

  // Filter rows based on search term
  const filteredRows = (tableData?.rows || []).filter((row) => {
    if (!searchTerm) return true;
    return Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-6 h-6 text-indigo-600" />
            Database & Table Explorer
          </h1>
          <p className="text-sm text-slate-500">
            Inspect relational tables, columns, constraints, and pre-seeded demo records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              tableData?.isLive
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
            }`}
          >
            {tableData?.isLive ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Live PostgreSQL Connected
              </>
            ) : (
              <>
                <Info className="w-3.5 h-3.5 text-indigo-600" /> Pre-Seeded Schema Snapshot
              </>
            )}
          </span>

          <button
            onClick={() => fetchTableDetail(selectedTable)}
            disabled={loading}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
            title="Refresh Table"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Table Selector Sidebar */}
        <div className="lg:col-span-1 space-y-2 bg-white rounded-2xl border border-slate-200 p-3 shadow-sm">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-2">
            Tables ({tablesList.length || 8})
          </h2>
          <div className="space-y-1">
            {(tablesList.length > 0 ? tablesList : [
              { name: 'users' }, { name: 'courses' }, { name: 'enrollments' },
              { name: 'modules' }, { name: 'materials' }, { name: 'quizzes' },
              { name: 'assignments' }, { name: 'submissions' }
            ]).map((t) => (
              <button
                key={t.name}
                onClick={() => {
                  setSelectedTable(t.name);
                  setSearchTerm('');
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition flex items-center justify-between ${
                  selectedTable === t.name
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Table className="w-4 h-4 opacity-80" />
                  <span className="font-mono">{t.name}</span>
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  selectedTable === t.name ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-500'
                }`}>
                  Table
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Table Viewport */}
        <div className="lg:col-span-3 space-y-4">
          {/* Table Header Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-mono font-bold text-slate-900">{selectedTable}</h2>
                  <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                    {tableData?.columns?.length || 0} Columns
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
                    {filteredRows.length} Records
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{tableData?.description}</p>
              </div>

              {/* View Toggle (Data vs Schema) */}
              <div className="flex items-center p-1 bg-slate-100 rounded-xl">
                <button
                  onClick={() => setActiveTab('data')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'data'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Records Data
                </button>
                <button
                  onClick={() => setActiveTab('schema')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'schema'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Column Schema
                </button>
              </div>
            </div>

            {/* Search filter for data tab */}
            {activeTab === 'data' && (
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={`Search ${selectedTable} rows...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Table Data Viewer */}
          {activeTab === 'data' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-12 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
                  Loading table data...
                </div>
              ) : filteredRows.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-sm">
                  No records match your search criteria.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                        {Object.keys(filteredRows[0] || {}).map((col) => (
                          <th key={col} className="px-4 py-3 font-mono">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-indigo-50/20 transition">
                          {Object.entries(row).map(([key, val], cellIdx) => (
                            <td key={cellIdx} className="px-4 py-3 text-slate-700 max-w-xs truncate font-mono">
                              {val === null || val === undefined ? (
                                <span className="text-slate-300 italic">null</span>
                              ) : typeof val === 'boolean' ? (
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  val ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {String(val)}
                                </span>
                              ) : (
                                String(val)
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Schema Viewer */}
          {activeTab === 'schema' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="px-4 py-3">Column Name</th>
                      <th className="px-4 py-3">Data Type</th>
                      <th className="px-4 py-3">Constraints & Keys</th>
                      <th className="px-4 py-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(tableData?.columns || []).map((col) => (
                      <tr key={col.name} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3 font-mono font-bold text-indigo-950">
                          {col.name}
                        </td>
                        <td className="px-4 py-3 font-mono text-purple-700">
                          {col.type}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                            col.key.includes('PRIMARY')
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : col.key.includes('FK')
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {col.key}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {col.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
