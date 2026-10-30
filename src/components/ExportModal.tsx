import React, { useState } from 'react';
import { EventPlan } from '../types/event';
import { formatCurrency, calculateBudgetSummary } from '../utils/eventCalculations';
import { X, Download, Printer, Copy, Check, FileText } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventPlan;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, event }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const summary = calculateBudgetSummary(event.budgetItems, event.targetBudget);

  const generateMarkdownSummary = () => {
    return `# ${event.title}
**Date:** ${event.date} | **Location:** ${event.location} | **Guests:** ${event.guestCount}
**Target Budget:** ${formatCurrency(event.targetBudget, event.currency)} | **Committed:** ${formatCurrency(
      summary.totalActual || summary.totalEstimated,
      event.currency
    )}

## 💰 Budget Breakdown
${event.budgetItems
  .map(
    (b) =>
      `- [${b.status.toUpperCase()}] **${b.name}** (${b.category}): ${formatCurrency(
        b.actualCost > 0 ? b.actualCost : b.estimatedCost,
        event.currency
      )}`
  )
  .join('\n')}

## ⏱️ Day-Of Run of Show
${event.runOfShow
  .map(
    (r) =>
      `- **${r.startTime}${r.endTime ? ` - ${r.endTime}` : ''}** | ${r.title} (${r.responsibleRole} @ ${
        r.location
      })`
  )
  .join('\n')}

## 🤝 Key Vendors
${event.vendors
  .map(
    (v) =>
      `- **${v.companyName}** (${v.category}) — Status: ${v.status} | Quote: ${formatCurrency(
        v.quoteAmount,
        event.currency
      )} | Contact: ${v.contactName || 'N/A'} (${v.phone || v.email || 'N/A'})`
  )
  .join('\n')}
`;
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(event, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${event.title.replace(/\s+/g, '_')}_blueprint.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdownSummary());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-bold font-display text-stone-900">
              Export & Share Event Plan
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-stone-600">
          Export your complete event blueprint for team coordinators, clients, vendors, or personal archiving.
        </p>

        <div className="space-y-3">
          {/* Print Day-of Run of Show */}
          <button
            onClick={() => {
              onClose();
              setTimeout(() => window.print(), 300);
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-stone-200 hover:bg-stone-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                <Printer className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                  Print Master Schedule & Budget Sheet
                </h4>
                <p className="text-[11px] text-stone-500">
                  Formatted cleanly for day-of printouts and staff binders
                </p>
              </div>
            </div>
          </button>

          {/* Copy Markdown */}
          <button
            onClick={handleCopyMarkdown}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-stone-200 hover:bg-stone-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                  {copied ? 'Copied Markdown to Clipboard!' : 'Copy Summary as Markdown'}
                </h4>
                <p className="text-[11px] text-stone-500">
                  Ideal for pasting into emails, Google Docs, or Notion
                </p>
              </div>
            </div>
          </button>

          {/* Download JSON */}
          <button
            onClick={handleDownloadJson}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-stone-200 hover:bg-stone-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                  Download Full JSON Blueprint
                </h4>
                <p className="text-[11px] text-stone-500">
                  Complete structured data file for backup or re-import
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
