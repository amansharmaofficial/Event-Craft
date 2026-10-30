import React from 'react';
import { EventPlan } from '../types/event';
import {
  Sparkles,
  MapPin,
  Calendar,
  Users,
  Pencil,
  PieChart,
  Clock,
  Briefcase,
  Lightbulb,
  LayoutDashboard,
} from 'lucide-react';

interface EventHeaderProps {
  event: EventPlan;
  activeTab: 'overview' | 'budget' | 'timeline' | 'vendors' | 'ideas';
  onSelectTab: (tab: 'overview' | 'budget' | 'timeline' | 'vendors' | 'ideas') => void;
  onEditDetails: () => void;
  onOpenRegenerate: () => void;
}

export const EventHeader: React.FC<EventHeaderProps> = ({
  event,
  activeTab,
  onSelectTab,
  onEditDetails,
  onOpenRegenerate,
}) => {
  // Calculate days remaining
  const daysRemaining = (() => {
    try {
      const today = new Date();
      const eventDate = new Date(event.date);
      const diffTime = eventDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return 0;
    }
  })();

  const typeConfig = {
    wedding: {
      label: 'Wedding Celebration',
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: '💍',
    },
    birthday: {
      label: 'Birthday Party',
      badge: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: '🎂',
    },
    community: {
      label: 'Community Event',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: '🌳',
    },
    custom: {
      label: 'Custom Gathering',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: '✨',
    },
  }[event.type] || {
    label: 'Event',
    badge: 'bg-stone-50 text-stone-700 border-stone-200',
    icon: '✨',
  };

  const tabs = [
    {
      id: 'overview' as const,
      label: 'Overview & Blueprint',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'budget' as const,
      label: 'Budget Planner',
      icon: PieChart,
      badge: `${event.budgetItems.length} items`,
    },
    {
      id: 'timeline' as const,
      label: 'Timeline & Schedule',
      icon: Clock,
      badge: `${event.timeline.length + event.runOfShow.length}`,
    },
    {
      id: 'vendors' as const,
      label: 'Vendors Hub',
      icon: Briefcase,
      badge: `${event.vendors.length}`,
    },
    {
      id: 'ideas' as const,
      label: 'Personalized AI Ideas',
      icon: Lightbulb,
      badge: 'GenAI',
    },
  ];

  return (
    <div className="bg-white border-b border-stone-200 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6">
          {/* Main Info */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${typeConfig.badge}`}
              >
                <span>{typeConfig.icon}</span>
                <span>{typeConfig.label}</span>
              </span>

              {daysRemaining > 0 ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                  ⏳ {daysRemaining} days away
                </span>
              ) : daysRemaining === 0 ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  🎉 Event is Today!
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-500 border border-stone-200">
                  Past Event
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold font-display text-stone-900 tracking-tight">
                {event.title}
              </h1>
              <button
                onClick={onEditDetails}
                aria-label="Edit event details"
                className="text-stone-400 hover:text-stone-700 transition-colors p-1"
                title="Edit title, date or budget"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>

            {event.tagline && (
              <p className="text-sm italic text-stone-600 max-w-2xl font-serif">
                "{event.tagline}"
              </p>
            )}

            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-stone-600 pt-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-stone-400" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-stone-400" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-stone-400" />
                <span>{event.guestCount} Guests</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenRegenerate}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200/80 border border-stone-300 rounded-xl transition-all shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Regenerate with GenAI</span>
            </button>

            <button
              onClick={onEditDetails}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-all shadow-xs"
            >
              <Pencil className="w-4 h-4" />
              <span>Edit Details</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-2 sm:space-x-8 overflow-x-auto no-scrollbar border-t border-stone-100 pt-1" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-amber-600 text-amber-700 font-bold'
                    : 'border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600' : 'text-stone-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      isActive
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
