import React from 'react';
import { EventPlan } from '../types/event';
import {
  Sparkles,
  Calendar,
  DollarSign,
  Users,
  PlusCircle,
  MessageSquareCode,
  Download,
  ChevronDown,
} from 'lucide-react';
import { formatCurrency } from '../utils/eventCalculations';

interface NavbarProps {
  events: EventPlan[];
  activeEvent: EventPlan;
  onSelectEvent: (id: string) => void;
  onOpenNewEventModal: () => void;
  onOpenAiDrawer: () => void;
  onOpenExportModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  events,
  activeEvent,
  onSelectEvent,
  onOpenNewEventModal,
  onOpenAiDrawer,
  onOpenExportModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 min-w-0 flex-shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 flex items-center justify-center text-white shadow-xs flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-base sm:text-lg text-stone-900 tracking-tight">
                  EventCraft <span className="text-amber-600 font-sans text-xs uppercase px-1.5 py-0.5 rounded bg-amber-50 font-bold tracking-wider border border-amber-200">AI</span>
                </span>
              </div>
              <p className="text-[11px] text-stone-500 hidden md:block">Intelligent Event Planner & Producer</p>
            </div>
          </div>

          {/* Event Selector Dropdown */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <div className="relative min-w-0">
              <select
                aria-label="Select active event"
                value={activeEvent.id}
                onChange={(e) => onSelectEvent(e.target.value)}
                className="appearance-none bg-stone-100 hover:bg-stone-200/70 border border-stone-300 text-stone-800 text-xs sm:text-sm font-semibold rounded-lg pl-2.5 pr-7 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer max-w-[130px] sm:max-w-[200px] md:max-w-[280px] truncate transition-colors"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.type === 'wedding' ? '💍 ' : ev.type === 'birthday' ? '🎂 ' : ev.type === 'community' ? '🌳 ' : '✨ '}
                    {ev.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-stone-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              onClick={onOpenNewEventModal}
              className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-amber-800 bg-amber-100/80 hover:bg-amber-200 rounded-lg transition-colors border border-amber-300/50 flex-shrink-0"
              title="Create new AI event plan"
            >
              <PlusCircle className="w-4 h-4 text-amber-700" />
              <span className="hidden md:inline">New Event</span>
            </button>
          </div>

          {/* Quick Stats & Action Center */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            <div className="hidden lg:flex items-center gap-4 text-xs font-medium text-stone-600 border-x border-stone-200 px-4">
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  Budget: <strong className="text-stone-900 font-bold">{formatCurrency(activeEvent.targetBudget, activeEvent.currency)}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  Guests: <strong className="text-stone-900 font-bold">{activeEvent.guestCount}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  Date: <strong className="text-stone-900 font-bold">{activeEvent.date}</strong>
                </span>
              </div>
            </div>

            <button
              onClick={onOpenExportModal}
              aria-label="Export and print plan"
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors border border-stone-200"
              title="Export or print event summary"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenAiDrawer}
              aria-label="Ask AI Architect"
              className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 text-xs font-bold text-white bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 hover:from-black hover:to-stone-800 rounded-lg shadow-xs transition-all transform active:scale-95"
            >
              <MessageSquareCode className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Ask AI Architect</span>
              <span className="sm:hidden">AI</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
