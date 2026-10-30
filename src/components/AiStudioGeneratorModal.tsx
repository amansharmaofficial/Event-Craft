import React, { useState } from 'react';
import { EventType, EventPlan } from '../types/event';
import {
  Sparkles,
  X,
  Calendar,
  DollarSign,
  Users,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AiStudioGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePlan: (plan: EventPlan) => void;
  defaultEventType?: EventType;
}

export const AiStudioGeneratorModal: React.FC<AiStudioGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSavePlan,
  defaultEventType = 'wedding',
}) => {
  const [eventType, setEventType] = useState<EventType>(defaultEventType);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-10-24');
  const [location, setLocation] = useState('');
  const [guestCount, setGuestCount] = useState<number>(100);
  const [budget, setBudget] = useState<number>(18000);
  const [currency, setCurrency] = useState('USD');
  const [themeVibe, setThemeVibe] = useState('');
  const [notes, setNotes] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');

  if (!isOpen) return null;

  const eventTypeOptions: { type: EventType; label: string; icon: string; defaultTitle: string; defaultVibe: string; defaultLocation: string }[] = [
    {
      type: 'wedding',
      label: 'Wedding Celebration',
      icon: '💍',
      defaultTitle: "Chloe & Julian's Coastal Vineyard Wedding",
      defaultVibe: 'Romantic Mediterranean, Olive Foliage, Linen & Candlelight',
      defaultLocation: 'Estate Vineyard & Olive Grove, Sonoma, CA',
    },
    {
      type: 'birthday',
      label: 'Birthday Party',
      icon: '🎂',
      defaultTitle: "Maya's 30th Studio 54 Disco Soiree",
      defaultVibe: 'Retro Glitter Disco, Mirrorballs, Champagne Towers & Velvet',
      defaultLocation: 'Rooftop Lounge & Terrace, Chicago, IL',
    },
    {
      type: 'community',
      label: 'Community Event',
      icon: '🌳',
      defaultTitle: 'Spring Neighborhood Art & Music Fair',
      defaultVibe: 'Vibrant Community, Food Trucks, Outdoor Stage & Kids Crafts',
      defaultLocation: 'Civic Park & Amphitheater, Austin, TX',
    },
    {
      type: 'custom',
      label: 'Custom Gathering',
      icon: '✨',
      defaultTitle: 'Founders & Creators Annual Summit Dinner',
      defaultVibe: 'Sophisticated Modern, Warm Wood, Ambient Jazz & Fire Pits',
      defaultLocation: 'Industrial Glasshouse Loft, Brooklyn, NY',
    },
  ];

  const handleSelectType = (type: EventType) => {
    setEventType(type);
    const opt = eventTypeOptions.find((o) => o.type === type);
    if (opt) {
      if (!title) setTitle(opt.defaultTitle);
      if (!themeVibe) setThemeVibe(opt.defaultVibe);
      if (!location) setLocation(opt.defaultLocation);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoadingStep('Consulting Event Architect with Gemini 3.8 Flash...');

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          title: title || `${eventType.toUpperCase()} Celebration`,
          guestCount: Number(guestCount) || 100,
          budget: Number(budget) || 15000,
          currency,
          location: location || 'Private Event Venue',
          themeVibe: themeVibe || 'Elegant, memorable, and vibrant',
          targetDate: date,
          notes,
        }),
      });

      setLoadingStep('Structuring budget categories and vendor deliverables...');
      const data = await response.json();

      if (data.plan) {
        const p = data.plan;

        const newPlan: EventPlan = {
          id: `plan-${Date.now()}`,
          type: eventType,
          title: title || `${eventType.toUpperCase()} Celebration`,
          tagline: p.tagline || `A memorable ${eventType} planned with EventCraft AI`,
          date: date || '2026-10-24',
          location: location || 'Private Event Venue',
          guestCount: Number(guestCount) || 100,
          targetBudget: Number(budget) || 15000,
          currency,
          themeVibe: themeVibe || 'Sophisticated and celebratory',
          notes,
          budgetItems: (p.budgetBreakdown || []).map((b: any, i: number) => ({
            id: `b-${Date.now()}-${i}`,
            category: b.category || 'Other',
            name: b.name || 'Expense item',
            estimatedCost: Number(b.estimatedCost) || 0,
            actualCost: 0,
            status: 'pending',
            notes: b.notes || '',
          })),
          timeline: (p.timelineMilestones || []).map((t: any, i: number) => ({
            id: `t-${Date.now()}-${i}`,
            phase: t.phase || '1-2 Months Before',
            title: t.title || 'Milestone item',
            dueDate: date,
            completed: false,
            priority: t.priority || 'medium',
            category: t.category,
            assignedTo: t.assignedTo,
            notes: t.notes,
          })),
          runOfShow: (p.runOfShow || []).map((r: any, i: number) => ({
            id: `r-${Date.now()}-${i}`,
            startTime: r.startTime || '03:00 PM',
            endTime: r.endTime,
            title: r.title || 'Program item',
            location: r.location || location || 'Main Venue',
            responsibleRole: r.responsibleRole || 'Host',
            description: r.description || '',
            status: 'upcoming',
          })),
          vendors: (p.vendors || []).map((v: any, i: number) => ({
            id: `v-${Date.now()}-${i}`,
            category: v.category || 'Venue',
            companyName: v.companyName || 'Premier Provider',
            contactName: 'Inquiry Coordinator',
            phone: '(555) 123-4567',
            email: 'hello@vendor.com',
            quoteAmount: Number(v.quoteAmount) || 0,
            status: 'researching',
            deliverables: v.deliverables || ['Full service delivery', 'Setup and strike'],
            checklist: (v.checklist || ['Sign agreement', 'Pay deposit']).map(
              (text: string, cIdx: number) => ({
                id: `vc-${Date.now()}-${i}-${cIdx}`,
                text,
                done: false,
              })
            ),
            interviewQuestions: v.interviewQuestions || ['What is your cancellation policy?'],
            notes: v.notes || '',
          })),
          ideas: {
            themes: p.themes || [],
            menuSuggestions: p.menuSuggestions || {
              cocktailOrBeverage: 'Artisan Signature Punch',
              appetizers: ['Seasonal crostini', 'Gourmet sliders'],
              mains: ['Herb roasted main entree', 'Vegetarian seasonal pasta'],
              dessert: 'Celebration cake and espresso bar',
              dietaryNotes: 'Vegetarian and gluten free options highlighted',
            },
            icebreakersAndActivities: p.icebreakersAndActivities || [],
            speechAndInvitationSnippets: p.speechAndInvitationSnippets || [],
            contingencyPlans: p.contingencyPlans || [],
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        try {
          confetti({
            particleCount: 50,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch {
          // safe
        }

        onSavePlan(newPlan);
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      alert('Could not generate plan right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-stone-900">
                AI Event Architect & Blueprint Generator
              </h2>
              <p className="text-xs text-stone-500">
                Powered by Gemini 3.8 Flash • Generates custom budget, run of show, and vendors
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Form */}
        <form onSubmit={handleGenerate} className="space-y-6 pt-5">
          {/* Step 1: Event Type Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
              1. Select Event Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {eventTypeOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.type}
                  onClick={() => handleSelectType(opt.type)}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    eventType === opt.type
                      ? 'border-amber-600 bg-amber-50/70 text-amber-950 font-bold shadow-xs ring-2 ring-amber-500/20'
                      : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <span className="text-xs">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Title and Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Event Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Liam & Maya's Autumn Wedding"
                className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Location / Setting
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Botanical Glasshouse, Portland"
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Date, Guest Count & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Event Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Guest Count
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="1"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  placeholder="100"
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Target Budget
              </label>
              <div className="flex gap-1.5">
                <div className="relative flex-1">
                  <DollarSign className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="100"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    placeholder="15000"
                    className="w-full pl-9 pr-2 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-20 px-2 py-2.5 text-xs font-semibold bg-stone-50 border border-stone-300 rounded-xl"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="AUD">AUD ($)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Step 4: Aesthetic Vibe & Special Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Desired Aesthetic & Vibe
            </label>
            <input
              type="text"
              value={themeVibe}
              onChange={(e) => setThemeVibe(e.target.value)}
              placeholder="e.g. Organic Autumn Garden, terracotta & sage with candlelit romance"
              className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Special Preferences & Priorities
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Vegetarian food focus, live acoustic string trio, prioritize high energy dancing after 9pm"
              className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200/80 flex items-center gap-3 text-amber-900 text-xs sm:text-sm animate-pulse">
              <RefreshCw className="w-5 h-5 animate-spin text-amber-600 flex-shrink-0" />
              <span>{loadingStep}</span>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !title.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? 'Architecting Plan...' : 'Generate Blueprint with GenAI'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
