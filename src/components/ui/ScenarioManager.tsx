import React, { useState, useEffect } from 'react';
import { Save, FolderOpen, Trash2, X, Download, Upload, Bookmark, ChevronDown } from 'lucide-react';
import { SimulationParams } from '../../model/types';
import {
    CustomScenario,
    getCustomScenarios,
    saveCustomScenario,
    deleteCustomScenario,
    exportScenarios,
    importScenarios
} from '../../utils/scenarioStorage';
import { SCENARIOS, SimulationScenario } from '../../data/scenarios';

interface ScenarioManagerProps {
    currentParams: SimulationParams;
    protocolId: string;
    protocolName: string;
    onLoadScenario: (params: Partial<SimulationParams>) => void;
}

export const ScenarioManager: React.FC<ScenarioManagerProps> = ({
    currentParams,
    protocolId,
    protocolName,
    onLoadScenario
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [customScenarios, setCustomScenarios] = useState<CustomScenario[]>([]);
    const [saveName, setSaveName] = useState('');
    const [saveDescription, setSaveDescription] = useState('');

    useEffect(() => {
        setCustomScenarios(getCustomScenarios());
    }, []);

    const handleSave = () => {
        if (!saveName.trim()) return;

        const saved = saveCustomScenario(
            saveName,
            saveDescription,
            protocolId,
            currentParams
        );

        setCustomScenarios(prev => [...prev, saved]);
        setSaveName('');
        setSaveDescription('');
        setShowSaveModal(false);
    };

    const handleDelete = (id: string) => {
        if (deleteCustomScenario(id)) {
            setCustomScenarios(prev => prev.filter(s => s.id !== id));
        }
    };

    const handleExport = () => {
        const json = exportScenarios();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `depin_scenarios_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const json = event.target?.result as string;
            const count = importScenarios(json);
            if (count > 0) {
                setCustomScenarios(getCustomScenarios());
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="relative">
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-amber-500/20 border border-slate-700 hover:border-amber-500/50 text-[10px] font-bold text-slate-400 hover:text-amber-400 transition-all flex items-center gap-1.5"
            >
                <Bookmark size={12} />
                Scenarios
                <ChevronDown size={10} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                    {/* Header */}
                    <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                        <span className="text-xs font-bold text-white">Scenario Library</span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setShowSaveModal(true)}
                                className="p-1.5 hover:bg-slate-800 rounded text-emerald-400"
                                title="Save Current"
                            >
                                <Save size={14} />
                            </button>
                            <button
                                onClick={handleExport}
                                className="p-1.5 hover:bg-slate-800 rounded text-slate-400"
                                title="Export All"
                            >
                                <Download size={14} />
                            </button>
                            <label className="p-1.5 hover:bg-slate-800 rounded text-slate-400 cursor-pointer" title="Import">
                                <Upload size={14} />
                                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                            </label>
                        </div>
                    </div>

                    {/* Built-in Scenarios */}
                    <div className="p-2 border-b border-slate-800">
                        <div className="text-[9px] text-slate-500 font-bold uppercase px-2 mb-1">Built-in Presets</div>
                        {SCENARIOS.map(scenario => (
                            <button
                                key={scenario.id}
                                onClick={() => { onLoadScenario(scenario.params); setIsOpen(false); }}
                                className="w-full px-2 py-2 hover:bg-slate-800 rounded-lg text-left transition-colors"
                            >
                                <div className="text-xs font-bold text-white">{scenario.name}</div>
                                <div className="text-[10px] text-slate-500 line-clamp-1">{scenario.description}</div>
                            </button>
                        ))}
                    </div>

                    {/* Custom Scenarios */}
                    <div className="p-2 max-h-48 overflow-y-auto">
                        <div className="text-[9px] text-slate-500 font-bold uppercase px-2 mb-1">
                            My Saved ({customScenarios.length})
                        </div>
                        {customScenarios.length === 0 ? (
                            <div className="px-2 py-4 text-center text-xs text-slate-500">
                                No saved scenarios yet.<br />
                                <span className="text-slate-600">Click the save icon to save current settings.</span>
                            </div>
                        ) : (
                            customScenarios.map(scenario => (
                                <div
                                    key={scenario.id}
                                    className="flex items-center justify-between px-2 py-2 hover:bg-slate-800 rounded-lg group"
                                >
                                    <button
                                        onClick={() => { onLoadScenario(scenario.params); setIsOpen(false); }}
                                        className="flex-1 text-left"
                                    >
                                        <div className="text-xs font-bold text-white">{scenario.name}</div>
                                        <div className="text-[10px] text-slate-500">{scenario.protocolId}</div>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(scenario.id)}
                                        className="p-1 hover:bg-rose-500/20 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={12} className="text-rose-400" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Save Modal */}
            {showSaveModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-96">
                        <div className="flex items-center justify-between p-4 border-b border-slate-800">
                            <h3 className="text-sm font-bold text-white">Save Scenario</h3>
                            <button onClick={() => setShowSaveModal(false)} className="p-1 hover:bg-slate-800 rounded">
                                <X size={16} className="text-slate-400" />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Scenario Name</label>
                                <input
                                    type="text"
                                    value={saveName}
                                    onChange={(e) => setSaveName(e.target.value)}
                                    placeholder={`${protocolName} - Custom`}
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Description (optional)</label>
                                <textarea
                                    value={saveDescription}
                                    onChange={(e) => setSaveDescription(e.target.value)}
                                    placeholder="Notes about this configuration..."
                                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 resize-none h-20"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 p-4 border-t border-slate-800">
                            <button
                                onClick={() => setShowSaveModal(false)}
                                className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!saveName.trim()}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold transition-colors"
                            >
                                Save Scenario
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
