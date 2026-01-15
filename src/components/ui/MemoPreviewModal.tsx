import React from 'react';
import { X, Download, Copy, CheckCircle2, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { downloadMemo, Verdict } from '../../utils/reportGenerator';

interface MemoPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    memoContent: string;
    protocolName: string;
    verdict: Verdict;
}

export const MemoPreviewModal: React.FC<MemoPreviewModalProps> = ({
    isOpen,
    onClose,
    memoContent,
    protocolName,
    verdict
}) => {
    const [copied, setCopied] = React.useState(false);

    if (!isOpen) return null;

    const handleCopy = async () => {
        await navigator.clipboard.writeText(memoContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        downloadMemo(memoContent, `${protocolName.toLowerCase().replace(/\s+/g, '_')}_memo.md`);
    };

    const getVerdictStyle = () => {
        switch (verdict) {
            case 'STRONG BUY':
                return { bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-400', icon: TrendingUp };
            case 'CAUTIOUS':
                return { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-400', icon: TrendingUp };
            case 'HIGH RISK':
                return { bg: 'bg-orange-500/20', border: 'border-orange-500/50', text: 'text-orange-400', icon: AlertTriangle };
            case 'UNINVESTABLE':
                return { bg: 'bg-rose-500/20', border: 'border-rose-500/50', text: 'text-rose-400', icon: TrendingDown };
            default:
                return { bg: 'bg-slate-500/20', border: 'border-slate-500/50', text: 'text-slate-400', icon: AlertTriangle };
        }
    };

    const style = getVerdictStyle();
    const VerdictIcon = style.icon;

    // Convert markdown to simple HTML for preview
    const renderMarkdown = (md: string) => {
        const lines = md.split('\n');
        const elements: React.ReactNode[] = [];
        let i = 0;

        while (i < lines.length) {
            const line = lines[i];

            // Headers
            if (line.startsWith('# ')) {
                elements.push(<h1 key={i} className="text-2xl font-black text-white mt-6 mb-2">{line.slice(2)}</h1>);
                i++;
                continue;
            }
            if (line.startsWith('## ')) {
                elements.push(<h2 key={i} className="text-lg font-bold text-white mt-6 mb-2 border-b border-slate-700 pb-2">{line.slice(3)}</h2>);
                i++;
                continue;
            }
            if (line.startsWith('### ')) {
                elements.push(<h3 key={i} className="text-sm font-bold text-slate-300 mt-4 mb-1">{line.slice(4)}</h3>);
                i++;
                continue;
            }

            // Detect table (starts with | and next line is separator)
            if (line.startsWith('|') && i + 1 < lines.length && lines[i + 1].includes('---')) {
                // Parse full table
                const tableRows: string[][] = [];
                let j = i;

                while (j < lines.length && lines[j].startsWith('|')) {
                    // Skip separator line
                    if (lines[j].includes('---')) {
                        j++;
                        continue;
                    }
                    const cells = lines[j].split('|').filter(c => c.trim()).map(c => c.trim());
                    tableRows.push(cells);
                    j++;
                }

                if (tableRows.length > 0) {
                    elements.push(
                        <div key={`table-${i}`} className="my-4 rounded-lg overflow-hidden border border-slate-700">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-800">
                                        {tableRows[0].map((cell, ci) => (
                                            <th key={ci} className="px-4 py-2 text-left font-bold text-slate-300 border-b border-slate-700">
                                                {cell}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableRows.slice(1).map((row, ri) => (
                                        <tr key={ri} className={ri % 2 === 0 ? 'bg-slate-900/50' : 'bg-slate-800/30'}>
                                            {row.map((cell, ci) => (
                                                <td key={ci} className={`px-4 py-2 ${ci === 0 ? 'font-semibold text-slate-300' : 'text-slate-400'}`}>
                                                    {cell}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                }
                i = j;
                continue;
            }

            // Skip standalone table separator lines (shouldn't happen with above logic)
            if (line.includes('|') && line.includes('---')) {
                i++;
                continue;
            }

            // List items with emoji/icons
            if (line.startsWith('- ⚠️') || line.startsWith('- ✅')) {
                const content = line.slice(2);
                elements.push(
                    <div key={i} className="flex items-start gap-2 py-1 text-sm text-slate-400">
                        <span>{content}</span>
                    </div>
                );
                i++;
                continue;
            }

            // Regular list items
            if (line.startsWith('- ')) {
                elements.push(<li key={i} className="text-sm text-slate-400 ml-4 list-disc">{line.slice(2)}</li>);
                i++;
                continue;
            }

            // Numbered list items
            if (/^\d+\.\s/.test(line)) {
                elements.push(<li key={i} className="text-sm text-slate-400 ml-4 list-decimal">{line.replace(/^\d+\.\s/, '')}</li>);
                i++;
                continue;
            }

            // Horizontal rule
            if (line.trim() === '---') {
                elements.push(<hr key={i} className="border-slate-700 my-4" />);
                i++;
                continue;
            }

            // Empty line
            if (!line.trim()) {
                elements.push(<div key={i} className="h-2" />);
                i++;
                continue;
            }

            // Bold text handling
            if (line.includes('**')) {
                const parts = line.split(/\*\*(.*?)\*\*/g);
                elements.push(
                    <p key={i} className="text-sm text-slate-400 leading-relaxed">
                        {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-white font-bold">{part}</strong> : part)}
                    </p>
                );
                i++;
                continue;
            }

            // Italics (*text*)
            if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
                elements.push(<p key={i} className="text-xs text-slate-500 italic">{line.slice(1, -1)}</p>);
                i++;
                continue;
            }

            // Regular paragraph
            elements.push(<p key={i} className="text-sm text-slate-400 leading-relaxed">{line}</p>);
            i++;
        }

        return elements;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-800">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-black text-white">Investment Memo</h2>
                        <div className={`px-3 py-1 rounded-full ${style.bg} ${style.border} border flex items-center gap-2`}>
                            <VerdictIcon size={14} className={style.text} />
                            <span className={`text-xs font-bold ${style.text}`}>{verdict}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-1">
                    {renderMarkdown(memoContent)}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-800">
                    <button
                        onClick={handleCopy}
                        className={`px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold transition-all ${copied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                            }`}
                    >
                        {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                        {copied ? 'Copied!' : 'Copy to Clipboard'}
                    </button>
                    <button
                        onClick={handleDownload}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center gap-2 text-sm font-bold transition-all"
                    >
                        <Download size={16} />
                        Download .md
                    </button>
                </div>
            </div>
        </div>
    );
};
