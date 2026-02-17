import React, { useState } from 'react';
import { Button } from './Button';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Badge } from './Badge';
import { ThesisConceptReplica } from './ThesisConceptReplica';
import {
    Activity, ArrowRight, BarChart2, Bell, Check, ChevronDown,
    CreditCard, Download, Globe, Home, Layout, Lock, Settings,
    Shield, User, Zap
} from 'lucide-react';

export const DesignSystemLab: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'typography', label: 'Typography' },
        { id: 'colors', label: 'Colors' },
        { id: 'components', label: 'Components' },
        { id: 'replica', label: 'Concept Replica' }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 p-6 lg:p-10 font-sans custom-scrollbar overflow-y-auto">
            <header className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                        <Layout className="text-white" size={20} />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Design System Lab</h1>
                </div>
                <p className="text-slate-400 max-w-2xl">
                    A dedicated environment for auditing, testing, and documenting the DePIN Dashboard's
                    UI design language. This lab ensures consistency across all modules.
                </p>
            </header>

            {/* Navigation */}
            <nav className="flex items-center gap-1 mb-10 border-b border-slate-800 pb-1">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors relative ${activeTab === tab.id
                            ? 'text-indigo-400 bg-indigo-500/10'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'
                            }`}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 translate-y-1 rounded-full" />
                        )}
                    </button>
                ))}
            </nav>

            <div className="space-y-12">

                {/* 1. BUTTONS */}
                {(activeTab === 'overview' || activeTab === 'components') && (
                    <section id="buttons" className="space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-200">
                            <span className="w-1 h-6 bg-indigo-500 rounded-full" />
                            Buttons
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Variants */}
                            <Card variant="glass" className="p-6">
                                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6">Variants</h3>
                                <div className="flex flex-wrap gap-4 items-center">
                                    <Button>Primary Action</Button>
                                    <Button variant="secondary">Secondary</Button>
                                    <Button variant="ghost">Ghost Button</Button>
                                    <Button variant="danger">Danger Zone</Button>
                                </div>
                            </Card>

                            {/* Sizes */}
                            <Card variant="glass" className="p-6">
                                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6">Sizes</h3>
                                <div className="flex flex-wrap gap-4 items-center">
                                    <Button size="sm">Small</Button>
                                    <Button size="md">Medium</Button>
                                    <Button size="lg">Large</Button>
                                </div>
                            </Card>

                            {/* States */}
                            <Card variant="glass" className="p-6">
                                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6">States</h3>
                                <div className="flex flex-wrap gap-4 items-center">
                                    <Button isLoading>Loading</Button>
                                    <Button disabled>Disabled</Button>
                                    <Button icon={<Download size={16} />}>With Icon</Button>
                                    <Button variant="secondary" icon={<ArrowRight size={16} />} className="flex-row-reverse">
                                        Right Icon
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </section>
                )}

                {/* 2. BADGES & STATUS */}
                {(activeTab === 'overview' || activeTab === 'components') && (
                    <section id="badges" className="space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-200">
                            <span className="w-1 h-6 bg-emerald-500 rounded-full" />
                            Badges & Status
                        </h2>

                        <Card variant="default" className="p-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                <div className="space-y-3">
                                    <h4 className="text-xs text-slate-500 font-bold uppercase">Success</h4>
                                    <div className="flex flex-col items-start gap-2">
                                        <Badge variant="success">Active</Badge>
                                        <Badge variant="success" dot>Operational</Badge>
                                        <Badge variant="success" size="md">98% Retention</Badge>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-xs text-slate-500 font-bold uppercase">Warning</h4>
                                    <div className="flex flex-col items-start gap-2">
                                        <Badge variant="warning">Watchlist</Badge>
                                        <Badge variant="warning" dot>Degraded</Badge>
                                        <Badge variant="warning" size="md">Payback &gt; 12mo</Badge>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-xs text-slate-500 font-bold uppercase">Critical</h4>
                                    <div className="flex flex-col items-start gap-2">
                                        <Badge variant="critical">Intervention</Badge>
                                        <Badge variant="critical" dot>Offline</Badge>
                                        <Badge variant="critical" size="md">Insolvent</Badge>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-xs text-slate-500 font-bold uppercase">Neutral</h4>
                                    <div className="flex flex-col items-start gap-2">
                                        <Badge variant="neutral">Draft</Badge>
                                        <Badge variant="outline">v1.2.0</Badge>
                                        <Badge variant="default">Beta</Badge>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </section>
                )}

                {/* 3. CARDS & SURFACES */}
                {(activeTab === 'overview' || activeTab === 'components') && (
                    <section id="cards" className="space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-200">
                            <span className="w-1 h-6 bg-slate-500 rounded-full" />
                            Surfaces
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card variant="default">
                                <CardHeader>
                                    <CardTitle>Default Surface</CardTitle>
                                </CardHeader>
                                <CardContent className="text-slate-400 text-sm">
                                    Standard card background (Slate 900). Used for general content and layout containers.
                                </CardContent>
                            </Card>

                            <Card variant="glass">
                                <CardHeader>
                                    <CardTitle className="text-indigo-200">Glassmorphism</CardTitle>
                                </CardHeader>
                                <CardContent className="text-slate-300 text-sm">
                                    Translucent background with blur effect. Best for floating panels or featuring content over complex backgrounds.
                                </CardContent>
                            </Card>

                            <Card variant="gradient">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Zap size={16} className="text-amber-400" />
                                        Featured Gradient
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-slate-300 text-sm">
                                    Subtle gradient background for high-priority items or call-to-actions.
                                </CardContent>
                            </Card>
                        </div>
                    </section>
                )}

                {/* 4. TYPOGRAPHY & COLORS */}
                {(activeTab === 'overview' || activeTab === 'typography') && (
                    <section id="typography" className="space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-200">
                            <span className="w-1 h-6 bg-rose-500 rounded-full" />
                            Typography
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="p-8">
                                <div className="space-y-6">
                                    <div>
                                        <h1 className="text-4xl font-bold text-white mb-2">Heading 1</h1>
                                        <p className="text-slate-500 text-xs font-mono">text-4xl font-bold</p>
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold text-white mb-2">Heading 2</h2>
                                        <p className="text-slate-500 text-xs font-mono">text-3xl font-bold</p>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-2">Heading 3</h3>
                                        <p className="text-slate-500 text-xs font-mono">text-2xl font-bold</p>
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-semibold text-white mb-2">Heading 4</h4>
                                        <p className="text-slate-500 text-xs font-mono">text-xl font-semibold</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-8 space-y-4">
                                <div>
                                    <p className="text-base text-slate-200 leading-relaxed">
                                        This is the standard body text. It uses <span className="text-white font-bold">Inter</span> for maximum legibility.
                                        Design systems should precise and consistent.
                                    </p>
                                    <p className="text-slate-500 text-xs font-mono mt-1">text-base text-slate-200</p>
                                </div>

                                <hr className="border-slate-800" />

                                <div>
                                    <p className="text-sm text-slate-400 leading-relaxed">
                                        This is smaller utility text, often used for descriptions or secondary information.
                                    </p>
                                    <p className="text-slate-500 text-xs font-mono mt-1">text-sm text-slate-400</p>
                                </div>

                                <hr className="border-slate-800" />

                                <div>
                                    <p className="font-mono text-sm text-indigo-400 bg-slate-950 p-2 rounded border border-slate-800">
                                        0x71C...9B21
                                    </p>
                                    <p className="text-slate-500 text-xs font-mono mt-1">font-mono (JetBrains Mono)</p>
                                </div>
                            </Card>
                        </div>
                    </section>
                )}

                {(activeTab === 'overview' || activeTab === 'colors') && (
                    <section id="pallete" className="space-y-6 pb-20">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-200">
                            <span className="w-1 h-6 bg-white rounded-full" />
                            Color Palette
                        </h2>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {/* Slate */}
                            <div className="space-y-2">
                                <div className="h-12 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-xs text-slate-400">950</div>
                                <div className="h-12 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-xs text-slate-400">900</div>
                                <div className="h-12 rounded-lg bg-slate-800 flex items-center justify-center text-xs text-slate-300">800</div>
                                <div className="h-12 rounded-lg bg-slate-700 flex items-center justify-center text-xs text-slate-200">700</div>
                                <div className="h-12 rounded-lg bg-slate-500 flex items-center justify-center text-xs text-white">500</div>
                                <div className="text-center text-xs font-bold text-slate-500 mt-2">Slate (Base)</div>
                            </div>

                            {/* Indigo */}
                            <div className="space-y-2">
                                <div className="h-12 rounded-lg bg-indigo-950 flex items-center justify-center text-xs text-indigo-400">950</div>
                                <div className="h-12 rounded-lg bg-indigo-900 flex items-center justify-center text-xs text-indigo-300">900</div>
                                <div className="h-12 rounded-lg bg-indigo-600 flex items-center justify-center text-xs text-white">600</div>
                                <div className="h-12 rounded-lg bg-indigo-500 flex items-center justify-center text-xs text-white">500</div>
                                <div className="h-12 rounded-lg bg-indigo-400 flex items-center justify-center text-xs text-indigo-950">400</div>
                                <div className="text-center text-xs font-bold text-indigo-500 mt-2">Indigo (Primary)</div>
                            </div>

                            {/* Emerald */}
                            <div className="space-y-2">
                                <div className="h-12 rounded-lg bg-emerald-950 flex items-center justify-center text-xs text-emerald-400">950</div>
                                <div className="h-12 rounded-lg bg-emerald-900 flex items-center justify-center text-xs text-emerald-300">900</div>
                                <div className="h-12 rounded-lg bg-emerald-600 flex items-center justify-center text-xs text-white">600</div>
                                <div className="h-12 rounded-lg bg-emerald-500 flex items-center justify-center text-xs text-white">500</div>
                                <div className="h-12 rounded-lg bg-emerald-400 flex items-center justify-center text-xs text-emerald-950">400</div>
                                <div className="text-center text-xs font-bold text-emerald-500 mt-2">Emerald (Success)</div>
                            </div>

                            {/* Rose */}
                            <div className="space-y-2">
                                <div className="h-12 rounded-lg bg-rose-950 flex items-center justify-center text-xs text-rose-400">950</div>
                                <div className="h-12 rounded-lg bg-rose-900 flex items-center justify-center text-xs text-rose-300">900</div>
                                <div className="h-12 rounded-lg bg-rose-600 flex items-center justify-center text-xs text-white">600</div>
                                <div className="h-12 rounded-lg bg-rose-500 flex items-center justify-center text-xs text-white">500</div>
                                <div className="h-12 rounded-lg bg-rose-400 flex items-center justify-center text-xs text-rose-950">400</div>
                                <div className="text-center text-xs font-bold text-rose-500 mt-2">Rose (Critical)</div>
                            </div>

                            {/* Amber */}
                            <div className="space-y-2">
                                <div className="h-12 rounded-lg bg-amber-950 flex items-center justify-center text-xs text-amber-400">950</div>
                                <div className="h-12 rounded-lg bg-amber-900 flex items-center justify-center text-xs text-amber-300">900</div>
                                <div className="h-12 rounded-lg bg-amber-600 flex items-center justify-center text-xs text-white">600</div>
                                <div className="h-12 rounded-lg bg-amber-500 flex items-center justify-center text-xs text-white">500</div>
                                <div className="h-12 rounded-lg bg-amber-400 flex items-center justify-center text-xs text-amber-950">400</div>
                                <div className="text-center text-xs font-bold text-amber-500 mt-2">Amber (Warning)</div>
                            </div>

                        </div>
                    </section>
                )}

                {(activeTab === 'replica') && (
                    <section id="replica" className="pt-4">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-200 mb-6">
                            <span className="w-1 h-6 bg-indigo-500 rounded-full" />
                            Concept Replica (Thesis Dashboard)
                        </h2>
                        <p className="text-slate-400 mb-8 max-w-3xl">
                            This view demonstrates how the design system atoms (Cards, Badges, Buttons) come together to recreate the
                            high-fidelity concept. This is a static implementation using the actual React components.
                        </p>
                        <ThesisConceptReplica />
                    </section>
                )}

            </div>
        </div>
    );
};
