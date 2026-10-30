import React from 'react';
import { EventPlan, TimelineMilestone } from '../types/event';
import {
  calculateBudgetSummary,
  calculateTimelineStats,
  calculateVendorStats,
  calculateRunOfShowStats,
  formatCurrency,
} from '../utils/eventCalculations';
import {
  DollarSign,
  Calendar,
  Users,
  Briefcase,
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
  Palette,
  AlertCircle,
  Clock,
} from 'lucide-react';

interface OverviewViewProps {
  event: EventPlan;
  onNavigateTab: (tab: 'budget' | 'timeline' | 'vendors' | 'ideas') => void;
  onToggleMilestone: (milestone: TimelineMilestone) => void;
  onOpenAiDrawer: (initialQuery?: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  event,
  onNavigateTab,
  onToggleMilestone,
  onOpenAiDrawer,
}) => {
  const budgetSummary = calculateBudgetSummary(event.budgetItems, event.targetBudget);
  const timelineStats = calculateTimelineStats(event.timeline);
  const vendorStats = calculateVendorStats(event.vendors);
  const runStats = calculateRunOfShowStats(event.runOfShow);

  // Next 4 upcoming milestones
  const upcomingMilestones = event.timeline
    .filter((m) => !m.completed)
    .slice(0, 4);

  // First 4 run-of-show cues
  const upcomingRunCues = event.runOfShow.slice(0, 4);

  const topTheme = event.ideas?.themes?.[0];

  return (
    <div className="space-y-8">
      {/* Event Pulse Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                Planning Readiness Pulse
              </span>
            </div>
            <h2 className="text-2xl font-bold font-display text-stone-900">
              {event.title}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              {event.location} • {event.guestCount} Attendees Expected on {event.date}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenAiDrawer('Give me a readiness diagnostic of my event plan')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300/60 rounded-xl transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span>AI Plan Diagnostic</span>
            </button>
          </div>
        </div>

        {/* 4 Core Vital Progress Gauges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-stone-100">
          {/* Budget Committed */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span>Budget Spent</span>
              <strong className="text-stone-900">
                {Math.round(
                  ((budgetSummary.totalActual || budgetSummary.totalEstimated) /
                    (budgetSummary.targetBudget || 1)) *
                    100
                )}%
              </strong>
            </div>
            <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  budgetSummary.isOverBudget ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{
                  width: `${Math.min(
                    100,
                    Math.round(
                      ((budgetSummary.totalActual || budgetSummary.totalEstimated) /
                        (budgetSummary.targetBudget || 1)) *
                        100
                    )
                  )}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-stone-500">
              {formatCurrency(budgetSummary.remainingFromTarget, event.currency)} left
            </p>
          </div>

          {/* Milestones Done */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span>Milestones</span>
              <strong className="text-stone-900">{timelineStats.percentComplete}%</strong>
            </div>
            <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full"
                style={{ width: `${timelineStats.percentComplete}%` }}
              />
            </div>
            <p className="text-[11px] text-stone-500">
              {timelineStats.completed}/{timelineStats.total} done
            </p>
          </div>

          {/* Vendors Locked */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span>Vendors Signed</span>
              <strong className="text-stone-900">
                {vendorStats.total > 0
                  ? Math.round(
                      ((vendorStats.confirmed + vendorStats.contractSigned) /
                        vendorStats.total) *
                        100
                    )
                  : 0}%
              </strong>
            </div>
            <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full"
                style={{
                  width: `${
                    vendorStats.total > 0
                      ? Math.round(
                          ((vendorStats.confirmed + vendorStats.contractSigned) /
                            vendorStats.total) *
                            100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
            <p className="text-[11px] text-stone-500">
              {vendorStats.confirmed + vendorStats.contractSigned} of {vendorStats.total} locked
            </p>
          </div>

          {/* Run of Show Cues */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span>Day-Of Schedule</span>
              <strong className="text-stone-900">{runStats.completionPercentage}%</strong>
            </div>
            <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-purple-500 h-full rounded-full"
                style={{ width: `${runStats.completionPercentage}%` }}
              />
            </div>
            <p className="text-[11px] text-stone-500">
              {runStats.total} schedule cues scheduled
            </p>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Active Tasks & Day-Of Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Next Urgent Milestones */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              <h3 className="text-base font-bold text-stone-900">Upcoming Milestones</h3>
            </div>
            <button
              onClick={() => onNavigateTab('timeline')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              <span>View all ({timelineStats.pending})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-stone-100">
            {upcomingMilestones.length === 0 ? (
              <p className="py-6 text-center text-xs text-stone-500">
                🎉 All planning milestones are completed!
              </p>
            ) : (
              upcomingMilestones.map((m) => (
                <div
                  key={m.id}
                  className="py-3 flex items-start justify-between gap-3 hover:bg-stone-50/50 rounded-lg px-2 transition-colors"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <button
                      onClick={() => onToggleMilestone(m)}
                      className="mt-0.5 text-stone-300 hover:text-emerald-600 transition-colors"
                      title="Click to check off"
                    >
                      <Circle className="w-4 h-4" />
                    </button>
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-xs font-bold text-stone-900 truncate">{m.title}</p>
                      <div className="flex items-center gap-2 text-[11px] text-stone-500">
                        <span className="font-semibold text-amber-700">{m.phase}</span>
                        {m.dueDate && <span>• Due {m.dueDate}</span>}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      m.priority === 'high'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {m.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Day-of Run of Show Preview */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <h3 className="text-base font-bold text-stone-900">Run of Show Preview</h3>
            </div>
            <button
              onClick={() => onNavigateTab('timeline')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              <span>Full Schedule ({event.runOfShow.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {upcomingRunCues.length === 0 ? (
              <p className="py-6 text-center text-xs text-stone-500">
                No schedule cues generated yet.
              </p>
            ) : (
              upcomingRunCues.map((cue, idx) => (
                <div
                  key={cue.id}
                  className="p-3 rounded-xl bg-stone-50 border border-stone-200/60 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono font-bold text-stone-800 bg-white px-2 py-1 rounded border border-stone-200">
                      {cue.startTime}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-stone-900 truncate">{cue.title}</h4>
                      <p className="text-[11px] text-stone-500 truncate">
                        {cue.responsibleRole} • {cue.location}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400">Step {idx + 1}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Aesthetic Moodboard & Top Vendors Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Aesthetic Concept Card */}
        {topTheme && (
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-stone-900">Featured Aesthetic</h3>
              </div>
              <button
                onClick={() => onNavigateTab('ideas')}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800"
              >
                Ideas & Menu →
              </button>
            </div>

            <h4 className="text-lg font-bold font-display text-stone-900">{topTheme.name}</h4>
            <p className="text-xs text-stone-600 line-clamp-2">{topTheme.description}</p>

            <div className="flex items-center gap-2 pt-2">
              {topTheme.palette.map((hex, i) => (
                <div
                  key={i}
                  className="flex-1 h-8 rounded-lg border border-black/10 shadow-2xs"
                  style={{ backgroundColor: hex }}
                  title={hex}
                />
              ))}
            </div>
          </div>
        )}

        {/* Budget Snapshot */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-stone-900">Budget Health</h3>
            </div>
            <button
              onClick={() => onNavigateTab('budget')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800"
            >
              Planner →
            </button>
          </div>

          <div className="space-y-1">
            <div className="text-2xl font-bold font-display text-stone-900">
              {formatCurrency(budgetSummary.totalActual || budgetSummary.totalEstimated, event.currency)}
            </div>
            <p className="text-xs text-stone-500">
              Target: {formatCurrency(event.targetBudget, event.currency)}
            </p>
          </div>

          <div className="pt-2 text-xs space-y-1 border-t border-stone-100">
            <div className="flex justify-between text-stone-600">
              <span>Paid Out</span>
              <strong className="text-stone-900">
                {formatCurrency(budgetSummary.paidAmount, event.currency)}
              </strong>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Pending Invoices</span>
              <strong className="text-stone-900">
                {formatCurrency(budgetSummary.pendingAmount, event.currency)}
              </strong>
            </div>
          </div>
        </div>

        {/* Vendors Snapshot */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-stone-900">Key Vendors</h3>
            </div>
            <button
              onClick={() => onNavigateTab('vendors')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800"
            >
              Vendor Hub →
            </button>
          </div>

          <div className="space-y-2">
            {event.vendors.slice(0, 3).map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between text-xs py-1.5 border-b border-stone-100 last:border-0"
              >
                <div>
                  <div className="font-semibold text-stone-900">{v.companyName}</div>
                  <div className="text-[10px] text-stone-400">{v.category}</div>
                </div>
                <span className="font-mono font-bold text-stone-700">
                  {formatCurrency(v.quoteAmount, event.currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
