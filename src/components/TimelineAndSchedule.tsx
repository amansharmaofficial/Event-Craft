import React, { useState } from 'react';
import { TimelineMilestone, RunOfShowItem, TimelinePhase } from '../types/event';
import { calculateTimelineStats, calculateRunOfShowStats } from '../utils/eventCalculations';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  Printer,
  Trash2,
  Edit2,
  User,
  MapPin,
  Flag,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TimelineAndScheduleProps {
  timeline: TimelineMilestone[];
  runOfShow: RunOfShowItem[];
  onAddMilestone: (item: Omit<TimelineMilestone, 'id'>) => void;
  onUpdateMilestone: (id: string, updates: Partial<TimelineMilestone>) => void;
  onDeleteMilestone: (id: string) => void;
  onAddRunItem: (item: Omit<RunOfShowItem, 'id'>) => void;
  onUpdateRunItem: (id: string, updates: Partial<RunOfShowItem>) => void;
  onDeleteRunItem: (id: string) => void;
}

const PHASES: TimelinePhase[] = [
  '6+ Months Before',
  '3-6 Months Before',
  '1-2 Months Before',
  '2-4 Weeks Before',
  'Week of Event',
  'Day Before',
  'Day of Event',
  'Post Event',
];

export const TimelineAndSchedule: React.FC<TimelineAndScheduleProps> = ({
  timeline,
  runOfShow,
  onAddMilestone,
  onUpdateMilestone,
  onDeleteMilestone,
  onAddRunItem,
  onUpdateRunItem,
  onDeleteRunItem,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'timeline' | 'runOfShow'>('timeline');

  // Milestone Modal
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [mPhase, setMPhase] = useState<TimelinePhase>('1-2 Months Before');
  const [mTitle, setMTitle] = useState('');
  const [mDueDate, setMDueDate] = useState('');
  const [mPriority, setMPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [mAssigned, setMAssigned] = useState('');
  const [mCategory, setMCategory] = useState('');
  const [mNotes, setMNotes] = useState('');

  // Run of Show Modal
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [editingRunId, setEditingRunId] = useState<string | null>(null);
  const [rStartTime, setRStartTime] = useState('');
  const [rEndTime, setREndTime] = useState('');
  const [rTitle, setRTitle] = useState('');
  const [rLocation, setRLocation] = useState('');
  const [rRole, setRRole] = useState('');
  const [rDesc, setRDesc] = useState('');
  const [rStatus, setRStatus] = useState<'upcoming' | 'current' | 'done'>('upcoming');

  const timelineStats = calculateTimelineStats(timeline);
  const runStats = calculateRunOfShowStats(runOfShow);

  // Trigger celebration on completing a milestone
  const toggleMilestone = (m: TimelineMilestone) => {
    const nextCompleted = !m.completed;
    onUpdateMilestone(m.id, { completed: nextCompleted });
    if (nextCompleted) {
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#D97706', '#059669', '#2563EB'],
        });
      } catch {
        // Safe fallback
      }
    }
  };

  const cycleRunStatus = (r: RunOfShowItem) => {
    const nextMap: Record<'upcoming' | 'current' | 'done', 'upcoming' | 'current' | 'done'> = {
      upcoming: 'current',
      current: 'done',
      done: 'upcoming',
    };
    onUpdateRunItem(r.id, { status: nextMap[r.status] });
  };

  // Milestone Save
  const handleMilestoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mTitle.trim()) return;

    if (editingMilestoneId) {
      onUpdateMilestone(editingMilestoneId, {
        phase: mPhase,
        title: mTitle.trim(),
        dueDate: mDueDate,
        priority: mPriority,
        assignedTo: mAssigned.trim() || undefined,
        category: mCategory.trim() || undefined,
        notes: mNotes.trim() || undefined,
      });
    } else {
      onAddMilestone({
        phase: mPhase,
        title: mTitle.trim(),
        dueDate: mDueDate,
        priority: mPriority,
        completed: false,
        assignedTo: mAssigned.trim() || undefined,
        category: mCategory.trim() || undefined,
        notes: mNotes.trim() || undefined,
      });
    }
    setIsMilestoneModalOpen(false);
  };

  const handleOpenMilestoneAdd = () => {
    setEditingMilestoneId(null);
    setMPhase('1-2 Months Before');
    setMTitle('');
    setMDueDate('');
    setMPriority('medium');
    setMAssigned('');
    setMCategory('');
    setMNotes('');
    setIsMilestoneModalOpen(true);
  };

  const handleOpenMilestoneEdit = (m: TimelineMilestone) => {
    setEditingMilestoneId(m.id);
    setMPhase(m.phase);
    setMTitle(m.title);
    setMDueDate(m.dueDate || '');
    setMPriority(m.priority);
    setMAssigned(m.assignedTo || '');
    setMCategory(m.category || '');
    setMNotes(m.notes || '');
    setIsMilestoneModalOpen(true);
  };

  // Run of Show Save
  const handleRunSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rTitle.trim() || !rStartTime.trim()) return;

    if (editingRunId) {
      onUpdateRunItem(editingRunId, {
        startTime: rStartTime.trim(),
        endTime: rEndTime.trim() || undefined,
        title: rTitle.trim(),
        location: rLocation.trim() || 'Main Venue',
        responsibleRole: rRole.trim() || 'Event Team',
        description: rDesc.trim(),
        status: rStatus,
      });
    } else {
      onAddRunItem({
        startTime: rStartTime.trim(),
        endTime: rEndTime.trim() || undefined,
        title: rTitle.trim(),
        location: rLocation.trim() || 'Main Venue',
        responsibleRole: rRole.trim() || 'Event Team',
        description: rDesc.trim(),
        status: rStatus,
      });
    }
    setIsRunModalOpen(false);
  };

  const handleOpenRunAdd = () => {
    setEditingRunId(null);
    setRStartTime('02:00 PM');
    setREndTime('03:00 PM');
    setRTitle('');
    setRLocation('');
    setRRole('');
    setRDesc('');
    setRStatus('upcoming');
    setIsRunModalOpen(true);
  };

  const handleOpenRunEdit = (r: RunOfShowItem) => {
    setEditingRunId(r.id);
    setRStartTime(r.startTime);
    setREndTime(r.endTime || '');
    setRTitle(r.title);
    setRLocation(r.location);
    setRRole(r.responsibleRole);
    setRDesc(r.description);
    setRStatus(r.status);
    setIsRunModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab('timeline')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeSubTab === 'timeline'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Calendar className="w-4 h-4 text-amber-600" />
            <span>Milestone Countdown</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-stone-100 text-stone-700">
              {timelineStats.completed}/{timelineStats.total}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('runOfShow')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeSubTab === 'runOfShow'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Day-of Run of Show</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-stone-100 text-stone-700">
              {runOfShow.length} cues
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === 'runOfShow' && (
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Schedule</span>
            </button>
          )}

          <button
            onClick={activeSubTab === 'timeline' ? handleOpenMilestoneAdd : handleOpenRunAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{activeSubTab === 'timeline' ? 'Add Milestone' : 'Add Schedule Block'}</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: MILESTONE COUNTDOWN */}
      {activeSubTab === 'timeline' && (
        <div className="space-y-6">
          {/* Progress Bar & Quick Stats */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Planning Roadmap Progress
                </span>
              </div>
              <span className="text-sm font-bold text-amber-700">
                {timelineStats.percentComplete}% Complete
              </span>
            </div>
            <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${timelineStats.percentComplete}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-stone-500 mt-2">
              <span>{timelineStats.completed} tasks completed</span>
              <span>{timelineStats.pending} pending tasks</span>
              {timelineStats.highPriorityPending > 0 && (
                <span className="text-rose-600 font-semibold">
                  ⚠️ {timelineStats.highPriorityPending} high priority pending
                </span>
              )}
            </div>
          </div>

          {/* Grouped by Phase */}
          <div className="space-y-6">
            {PHASES.map((phase) => {
              const phaseItems = timeline.filter((m) => m.phase === phase);
              if (phaseItems.length === 0) return null;

              return (
                <div
                  key={phase}
                  className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden"
                >
                  <div className="px-5 py-3 bg-stone-50/80 border-b border-stone-200 flex items-center justify-between">
                    <h3 className="text-xs sm:text-sm font-bold text-stone-800 tracking-wide uppercase">
                      {phase}
                    </h3>
                    <span className="text-xs font-medium text-stone-500">
                      {phaseItems.filter((i) => i.completed).length}/{phaseItems.length} done
                    </span>
                  </div>

                  <div className="divide-y divide-stone-100">
                    {phaseItems.map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 flex items-start justify-between gap-3 transition-colors ${
                          item.completed ? 'bg-stone-50/40 text-stone-400' : 'hover:bg-stone-50/70'
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <button
                            onClick={() => toggleMilestone(item)}
                            className="mt-0.5 text-stone-400 hover:text-emerald-600 transition-colors flex-shrink-0"
                            aria-label={`Mark ${item.title} as ${item.completed ? 'incomplete' : 'complete'}`}
                          >
                            {item.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                            ) : (
                              <Circle className="w-5 h-5 text-stone-300" />
                            )}
                          </button>

                          <div className="space-y-1 min-w-0">
                            <p
                              className={`text-sm font-semibold ${
                                item.completed
                                  ? 'line-through text-stone-400'
                                  : 'text-stone-900'
                              }`}
                            >
                              {item.title}
                            </p>

                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              {/* Priority */}
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                                  item.priority === 'high'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : item.priority === 'medium'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-stone-100 text-stone-600 border border-stone-200'
                                }`}
                              >
                                <Flag className="w-2.5 h-2.5" />
                                <span>{item.priority}</span>
                              </span>

                              {/* Due Date */}
                              {item.dueDate && (
                                <span className="inline-flex items-center gap-1 text-stone-500">
                                  <Calendar className="w-3 h-3" />
                                  <span>{item.dueDate}</span>
                                </span>
                              )}

                              {/* Assigned To */}
                              {item.assignedTo && (
                                <span className="inline-flex items-center gap-1 text-stone-600 font-medium">
                                  <User className="w-3 h-3 text-stone-400" />
                                  <span>{item.assignedTo}</span>
                                </span>
                              )}

                              {/* Category */}
                              {item.category && (
                                <span className="text-stone-400">
                                  • {item.category}
                                </span>
                              )}
                            </div>

                            {item.notes && (
                              <p className="text-xs text-stone-500 pt-0.5">{item.notes}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenMilestoneEdit(item)}
                            className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                            aria-label="Edit milestone"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteMilestone(item.id)}
                            className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            aria-label="Delete milestone"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: DAY-OF RUN OF SHOW */}
      {activeSubTab === 'runOfShow' && (
        <div className="space-y-4">
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                Live Day-Of Master Schedule
              </h4>
              <p className="text-xs text-amber-800/80">
                Click status badges during the event to advance cues from Upcoming → Current → Done.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{runStats.done} of {runStats.total} cues passed</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="divide-y divide-stone-100">
              {runOfShow.length === 0 ? (
                <div className="py-12 text-center text-stone-500">
                  No schedule cues added yet.{' '}
                  <button
                    onClick={handleOpenRunAdd}
                    className="text-amber-600 font-semibold underline"
                  >
                    Add your first schedule block
                  </button>
                </div>
              ) : (
                runOfShow.map((cue, index) => {
                  const isCurrent = cue.status === 'current';
                  const isDone = cue.status === 'done';

                  return (
                    <div
                      key={cue.id}
                      className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                        isCurrent
                          ? 'bg-blue-50/70 border-l-4 border-l-blue-600'
                          : isDone
                          ? 'bg-stone-50/40 opacity-75'
                          : 'hover:bg-stone-50/50'
                      }`}
                    >
                      {/* Left: Time & Step */}
                      <div className="flex items-start sm:items-center gap-4 flex-1">
                        <div className="w-24 flex-shrink-0">
                          <span className="text-xs font-mono font-bold text-stone-900 block">
                            {cue.startTime}
                          </span>
                          {cue.endTime && (
                            <span className="text-[11px] font-mono text-stone-400 block">
                              to {cue.endTime}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-stone-400">#{index + 1}</span>
                            <h4
                              className={`text-sm font-bold ${
                                isDone ? 'line-through text-stone-400' : 'text-stone-900'
                              }`}
                            >
                              {cue.title}
                            </h4>
                          </div>

                          <p className="text-xs text-stone-600">{cue.description}</p>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 pt-0.5">
                            <span className="inline-flex items-center gap-1 font-medium text-stone-700">
                              <User className="w-3 h-3 text-stone-400" />
                              <span>{cue.responsibleRole}</span>
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-stone-400" />
                              <span>{cue.location}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Status Pill & Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                        <button
                          onClick={() => cycleRunStatus(cue)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                            isCurrent
                              ? 'bg-blue-100 text-blue-800 border-blue-300 font-bold shadow-xs'
                              : isDone
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                          }`}
                          title="Click to cycle status"
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isCurrent
                                ? 'bg-blue-600 animate-ping'
                                : isDone
                                ? 'bg-emerald-600'
                                : 'bg-stone-400'
                            }`}
                          />
                          <span className="capitalize">{cue.status}</span>
                        </button>

                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenRunEdit(cue)}
                            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                            aria-label="Edit cue"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteRunItem(cue.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            aria-label="Delete cue"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: MILESTONE FORM */}
      {isMilestoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-lg font-bold font-display text-stone-900 mb-4">
              {editingMilestoneId ? 'Edit Milestone' : 'Add Planning Milestone'}
            </h3>

            <form onSubmit={handleMilestoneSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Milestone Title *
                </label>
                <input
                  type="text"
                  required
                  value={mTitle}
                  onChange={(e) => setMTitle(e.target.value)}
                  placeholder="e.g. Schedule floral arch mock-up with florist"
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Phase / Stage
                  </label>
                  <select
                    value={mPhase}
                    onChange={(e) => setMPhase(e.target.value as TimelinePhase)}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {PHASES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Priority
                  </label>
                  <select
                    value={mPriority}
                    onChange={(e) => setMPriority(e.target.value as 'low' | 'medium' | 'high')}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={mDueDate}
                    onChange={(e) => setMDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Assigned Person
                  </label>
                  <input
                    type="text"
                    value={mAssigned}
                    onChange={(e) => setMAssigned(e.target.value)}
                    placeholder="e.g. Lead Planner / John"
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Notes / Sub-tasks
                </label>
                <textarea
                  rows={2}
                  value={mNotes}
                  onChange={(e) => setMNotes(e.target.value)}
                  placeholder="Key contacts, links, deliverables..."
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsMilestoneModalOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl"
                >
                  {editingMilestoneId ? 'Update Milestone' : 'Save Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RUN OF SHOW FORM */}
      {isRunModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-lg font-bold font-display text-stone-900 mb-4">
              {editingRunId ? 'Edit Schedule Cue' : 'Add Run-of-Show Cue'}
            </h3>

            <form onSubmit={handleRunSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Cue Title *
                </label>
                <input
                  type="text"
                  required
                  value={rTitle}
                  onChange={(e) => setRTitle(e.target.value)}
                  placeholder="e.g. Cocktail Hour & Roving Acoustic Set"
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Start Time *
                  </label>
                  <input
                    type="text"
                    required
                    value={rStartTime}
                    onChange={(e) => setRStartTime(e.target.value)}
                    placeholder="04:30 PM"
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    End Time
                  </label>
                  <input
                    type="text"
                    value={rEndTime}
                    onChange={(e) => setREndTime(e.target.value)}
                    placeholder="05:45 PM"
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Responsible Role / Lead
                  </label>
                  <input
                    type="text"
                    value={rRole}
                    onChange={(e) => setRRole(e.target.value)}
                    placeholder="e.g. DJ & Emcee"
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Location / Room
                  </label>
                  <input
                    type="text"
                    value={rLocation}
                    onChange={(e) => setRLocation(e.target.value)}
                    placeholder="e.g. Terrace Courtyard"
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Description & Transition Cues
                </label>
                <textarea
                  rows={2}
                  value={rDesc}
                  onChange={(e) => setRDesc(e.target.value)}
                  placeholder="Specific instructions, mic switches, playlist cues..."
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsRunModalOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl"
                >
                  {editingRunId ? 'Update Cue' : 'Save Cue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
