/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { EventPlan, BudgetItem, TimelineMilestone, RunOfShowItem, VendorItem, PersonalizedIdeas } from './types/event';
import { SEED_EVENTS } from './data/seedEvents';
import { Navbar } from './components/Navbar';
import { EventHeader } from './components/EventHeader';
import { OverviewView } from './components/OverviewView';
import { BudgetPlanner } from './components/BudgetPlanner';
import { TimelineAndSchedule } from './components/TimelineAndSchedule';
import { VendorsHub } from './components/VendorsHub';
import { PersonalizedIdeasView } from './components/PersonalizedIdeasView';
import { AiStudioGeneratorModal } from './components/AiStudioGeneratorModal';
import { EventDetailsModal } from './components/EventDetailsModal';
import { ExportModal } from './components/ExportModal';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';
import { formatCurrency } from './utils/eventCalculations';

export default function App() {
  // Load events from localStorage or initialize with SEED_EVENTS
  const [events, setEvents] = useState<EventPlan[]>(() => {
    try {
      const saved = localStorage.getItem('eventcraft_events_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load events from storage', e);
    }
    return SEED_EVENTS;
  });

  const [activeEventId, setActiveEventId] = useState<string>(() => {
    // Check URL query
    try {
      const params = new URLSearchParams(window.location.search);
      const urlEvent = params.get('event');
      if (urlEvent && SEED_EVENTS.some((e) => e.id === urlEvent)) {
        return urlEvent;
      }
    } catch {}
    return SEED_EVENTS[0].id;
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'budget' | 'timeline' | 'vendors' | 'ideas'>('overview');

  // Modals state
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [isEditDetailsModalOpen, setIsEditDetailsModalOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [aiDrawerQuery, setAiDrawerQuery] = useState<string | undefined>(undefined);
  const [notification, setNotification] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('eventcraft_events_v1', JSON.stringify(events));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  }, [events]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Current active event
  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];

  // Helper to update active event in array
  const updateActiveEvent = (fn: (ev: EventPlan) => EventPlan) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === activeEvent.id ? { ...fn(e), updatedAt: new Date().toISOString() } : e))
    );
  };

  // Action handlers
  const handleSelectEvent = (id: string) => {
    setActiveEventId(id);
    setActiveTab('overview');
  };

  const handleSaveNewPlan = (newPlan: EventPlan) => {
    setEvents((prev) => [newPlan, ...prev]);
    setActiveEventId(newPlan.id);
    setActiveTab('overview');
    showNotification(`Created blueprint for "${newPlan.title}"!`);
  };

  const handleUpdateDetails = (updates: Partial<EventPlan>) => {
    updateActiveEvent((ev) => ({ ...ev, ...updates }));
    showNotification('Event details updated successfully.');
  };

  // AI Drawer opener
  const handleOpenAiDrawerWithQuery = (query?: string) => {
    setAiDrawerQuery(query);
    setIsAiDrawerOpen(true);
  };

  // Applying AI suggestions
  const handleApplyAiAction = (action: { type: string; data: any; label: string }) => {
    if (action.type === 'add_expense' && action.data) {
      const newBudget: BudgetItem = {
        id: `b-${Date.now()}`,
        category: action.data.category || 'Other',
        name: action.data.name || 'AI Recommended Item',
        estimatedCost: Number(action.data.estimatedCost) || 500,
        actualCost: 0,
        status: 'pending',
        notes: action.data.notes,
      };
      updateActiveEvent((ev) => ({
        ...ev,
        budgetItems: [...ev.budgetItems, newBudget],
      }));
      showNotification(`Added "${newBudget.name}" to budget.`);
    } else if (action.type === 'add_milestone' && action.data) {
      const newM: TimelineMilestone = {
        id: `t-${Date.now()}`,
        phase: action.data.phase || '1-2 Months Before',
        title: action.data.title || 'AI Recommended Milestone',
        dueDate: activeEvent.date,
        completed: false,
        priority: action.data.priority || 'medium',
      };
      updateActiveEvent((ev) => ({
        ...ev,
        timeline: [...ev.timeline, newM],
      }));
      showNotification(`Added milestone: "${newM.title}".`);
    } else if (action.type === 'add_vendor' && action.data) {
      const newV: VendorItem = {
        id: `v-${Date.now()}`,
        category: action.data.category || 'Specialty Service',
        companyName: action.data.companyName || 'Recommended Vendor',
        contactName: 'Inquiry Lead',
        phone: '',
        email: '',
        quoteAmount: Number(action.data.quoteAmount) || 0,
        status: 'researching',
        deliverables: action.data.deliverables || [],
        checklist: [{ id: `c-${Date.now()}`, text: 'Request formal quote', done: false }],
        interviewQuestions: action.data.interviewQuestions || [],
        notes: action.data.notes || '',
      };
      updateActiveEvent((ev) => ({
        ...ev,
        vendors: [...ev.vendors, newV],
      }));
      showNotification(`Added vendor: "${newV.companyName}".`);
    } else if (action.type === 'add_run_item' && action.data) {
      const newR: RunOfShowItem = {
        id: `r-${Date.now()}`,
        startTime: action.data.startTime || '04:00 PM',
        endTime: action.data.endTime,
        title: action.data.title || 'Schedule Block',
        location: action.data.location || activeEvent.location,
        responsibleRole: action.data.responsibleRole || 'Host',
        description: action.data.description || '',
        status: 'upcoming',
      };
      updateActiveEvent((ev) => ({
        ...ev,
        runOfShow: [...ev.runOfShow, newR],
      }));
      showNotification(`Added schedule item: "${newR.title}".`);
    }
  };

  // Budget Item CRUD
  const handleAddBudgetItem = (item: Omit<BudgetItem, 'id'>) => {
    const newItem: BudgetItem = { ...item, id: `b-${Date.now()}` };
    updateActiveEvent((ev) => ({
      ...ev,
      budgetItems: [newItem, ...ev.budgetItems],
    }));
    showNotification(`Added "${item.name}" to budget.`);
  };

  const handleUpdateBudgetItem = (id: string, updates: Partial<BudgetItem>) => {
    updateActiveEvent((ev) => ({
      ...ev,
      budgetItems: ev.budgetItems.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    }));
  };

  const handleDeleteBudgetItem = (id: string) => {
    updateActiveEvent((ev) => ({
      ...ev,
      budgetItems: ev.budgetItems.filter((b) => b.id !== id),
    }));
    showNotification('Expense removed.');
  };

  // Timeline CRUD
  const handleAddMilestone = (item: Omit<TimelineMilestone, 'id'>) => {
    const newItem: TimelineMilestone = { ...item, id: `t-${Date.now()}` };
    updateActiveEvent((ev) => ({
      ...ev,
      timeline: [...ev.timeline, newItem],
    }));
    showNotification('Added planning milestone.');
  };

  const handleUpdateMilestone = (id: string, updates: Partial<TimelineMilestone>) => {
    updateActiveEvent((ev) => ({
      ...ev,
      timeline: ev.timeline.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    }));
  };

  const handleDeleteMilestone = (id: string) => {
    updateActiveEvent((ev) => ({
      ...ev,
      timeline: ev.timeline.filter((m) => m.id !== id),
    }));
    showNotification('Milestone removed.');
  };

  // Run of Show CRUD
  const handleAddRunItem = (item: Omit<RunOfShowItem, 'id'>) => {
    const newItem: RunOfShowItem = { ...item, id: `r-${Date.now()}` };
    updateActiveEvent((ev) => ({
      ...ev,
      runOfShow: [...ev.runOfShow, newItem],
    }));
    showNotification('Added day-of schedule cue.');
  };

  const handleUpdateRunItem = (id: string, updates: Partial<RunOfShowItem>) => {
    updateActiveEvent((ev) => ({
      ...ev,
      runOfShow: ev.runOfShow.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    }));
  };

  const handleDeleteRunItem = (id: string) => {
    updateActiveEvent((ev) => ({
      ...ev,
      runOfShow: ev.runOfShow.filter((r) => r.id !== id),
    }));
    showNotification('Schedule item removed.');
  };

  // Vendor CRUD
  const handleAddVendor = (item: Omit<VendorItem, 'id'>) => {
    const newItem: VendorItem = { ...item, id: `v-${Date.now()}` };
    updateActiveEvent((ev) => ({
      ...ev,
      vendors: [newItem, ...ev.vendors],
    }));
    showNotification(`Vendor "${item.companyName}" added.`);
  };

  const handleUpdateVendor = (id: string, updates: Partial<VendorItem>) => {
    updateActiveEvent((ev) => ({
      ...ev,
      vendors: ev.vendors.map((v) => (v.id === id ? { ...v, ...updates } : v)),
    }));
  };

  const handleDeleteVendor = (id: string) => {
    updateActiveEvent((ev) => ({
      ...ev,
      vendors: ev.vendors.filter((v) => v.id !== id),
    }));
    showNotification('Vendor removed.');
  };

  const handleUpdateIdeas = (ideas: PersonalizedIdeas) => {
    updateActiveEvent((ev) => ({ ...ev, ideas }));
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col text-stone-900 selection:bg-amber-100 selection:text-amber-900">
      {/* Navbar */}
      <Navbar
        events={events}
        activeEvent={activeEvent}
        onSelectEvent={handleSelectEvent}
        onOpenNewEventModal={() => setIsNewEventModalOpen(true)}
        onOpenAiDrawer={() => handleOpenAiDrawerWithQuery()}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* Hero Header & Tabs */}
      <EventHeader
        event={activeEvent}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onEditDetails={() => setIsEditDetailsModalOpen(true)}
        onOpenRegenerate={() => setIsNewEventModalOpen(true)}
      />

      {/* Main Tab Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Floating toast notification */}
        {notification && (
          <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{notification}</span>
          </div>
        )}

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <OverviewView
            event={activeEvent}
            onNavigateTab={setActiveTab}
            onToggleMilestone={(m) =>
              handleUpdateMilestone(m.id, { completed: !m.completed })
            }
            onOpenAiDrawer={handleOpenAiDrawerWithQuery}
          />
        )}

        {/* Tab 2: Budget */}
        {activeTab === 'budget' && (
          <BudgetPlanner
            items={activeEvent.budgetItems}
            targetBudget={activeEvent.targetBudget}
            currency={activeEvent.currency}
            onAddItem={handleAddBudgetItem}
            onUpdateItem={handleUpdateBudgetItem}
            onDeleteItem={handleDeleteBudgetItem}
          />
        )}

        {/* Tab 3: Timeline & Schedule */}
        {activeTab === 'timeline' && (
          <TimelineAndSchedule
            timeline={activeEvent.timeline}
            runOfShow={activeEvent.runOfShow}
            onAddMilestone={handleAddMilestone}
            onUpdateMilestone={handleUpdateMilestone}
            onDeleteMilestone={handleDeleteMilestone}
            onAddRunItem={handleAddRunItem}
            onUpdateRunItem={handleUpdateRunItem}
            onDeleteRunItem={handleDeleteRunItem}
          />
        )}

        {/* Tab 4: Vendors Hub */}
        {activeTab === 'vendors' && (
          <VendorsHub
            vendors={activeEvent.vendors}
            currency={activeEvent.currency}
            onAddVendor={handleAddVendor}
            onUpdateVendor={handleUpdateVendor}
            onDeleteVendor={handleDeleteVendor}
          />
        )}

        {/* Tab 5: Ideas */}
        {activeTab === 'ideas' && (
          <PersonalizedIdeasView
            event={activeEvent}
            ideas={activeEvent.ideas}
            onUpdateIdeas={handleUpdateIdeas}
            onOpenAiDrawer={handleOpenAiDrawerWithQuery}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 text-center text-xs text-stone-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© EventCraft AI • GenAI Event Planning Assistant</p>
          <div className="flex items-center gap-4">
            <span>Powered by Gemini 3.8 Flash</span>
            <span>•</span>
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="hover:text-stone-900 underline"
            >
              Export Blueprint
            </button>
          </div>
        </div>
      </footer>

      {/* Print-only View */}
      <div className="hidden print-only p-8 text-black bg-white">
        <h1 className="text-3xl font-bold font-serif mb-2">{activeEvent.title}</h1>
        <p className="text-sm mb-4">
          Date: {activeEvent.date} | Location: {activeEvent.location} | Target Budget: {formatCurrency(activeEvent.targetBudget, activeEvent.currency)}
        </p>

        <h2 className="text-xl font-bold border-b border-black pb-1 mt-6 mb-3">Day-of Run of Show</h2>
        <table className="w-full text-xs text-left mb-6">
          <thead>
            <tr className="border-b">
              <th className="py-2">Time</th>
              <th className="py-2">Event Cue</th>
              <th className="py-2">Lead Role</th>
              <th className="py-2">Location</th>
              <th className="py-2">Description</th>
            </tr>
          </thead>
          <tbody>
            {activeEvent.runOfShow.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="py-1.5 font-bold">{r.startTime}</td>
                <td className="py-1.5">{r.title}</td>
                <td className="py-1.5">{r.responsibleRole}</td>
                <td className="py-1.5">{r.location}</td>
                <td className="py-1.5">{r.description}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="text-xl font-bold border-b border-black pb-1 mt-6 mb-3">Budget Ledger</h2>
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2">Item</th>
              <th className="py-2">Category</th>
              <th className="py-2">Estimated</th>
              <th className="py-2">Actual</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {activeEvent.budgetItems.map((b) => (
              <tr key={b.id} className="border-b">
                <td className="py-1.5 font-medium">{b.name}</td>
                <td className="py-1.5">{b.category}</td>
                <td className="py-1.5">{formatCurrency(b.estimatedCost, activeEvent.currency)}</td>
                <td className="py-1.5">{b.actualCost > 0 ? formatCurrency(b.actualCost, activeEvent.currency) : '—'}</td>
                <td className="py-1.5 uppercase">{b.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals & Drawers */}
      <AiStudioGeneratorModal
        isOpen={isNewEventModalOpen}
        onClose={() => setIsNewEventModalOpen(false)}
        onSavePlan={handleSaveNewPlan}
      />

      <EventDetailsModal
        isOpen={isEditDetailsModalOpen}
        onClose={() => setIsEditDetailsModalOpen(false)}
        event={activeEvent}
        onSave={handleUpdateDetails}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        event={activeEvent}
      />

      <AiAssistantDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        event={activeEvent}
        initialQuery={aiDrawerQuery}
        onApplyAction={handleApplyAiAction}
      />
    </div>
  );
}
