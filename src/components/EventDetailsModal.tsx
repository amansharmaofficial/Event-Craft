import React, { useState } from 'react';
import { EventPlan } from '../types/event';
import { X, Save } from 'lucide-react';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventPlan;
  onSave: (updates: Partial<EventPlan>) => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  isOpen,
  onClose,
  event,
  onSave,
}) => {
  const [title, setTitle] = useState(event.title);
  const [tagline, setTagline] = useState(event.tagline || '');
  const [date, setDate] = useState(event.date);
  const [location, setLocation] = useState(event.location);
  const [guestCount, setGuestCount] = useState(event.guestCount);
  const [targetBudget, setTargetBudget] = useState(event.targetBudget);
  const [currency, setCurrency] = useState(event.currency);
  const [themeVibe, setThemeVibe] = useState(event.themeVibe);
  const [notes, setNotes] = useState(event.notes || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title: title.trim(),
      tagline: tagline.trim(),
      date,
      location: location.trim(),
      guestCount: Number(guestCount) || 1,
      targetBudget: Number(targetBudget) || 0,
      currency,
      themeVibe: themeVibe.trim(),
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <h3 className="text-lg font-bold font-display text-stone-900">
            Edit Event Parameters
          </h3>
          <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
              Tagline / Subtitle
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="A poetic motto or short summary"
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                Event Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                Guest Count
              </label>
              <input
                type="number"
                min="1"
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                Target Budget
              </label>
              <input
                type="number"
                min="0"
                value={targetBudget}
                onChange={(e) => setTargetBudget(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
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

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
              Location / Venue Setting
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
              Aesthetic Style & Vibe
            </label>
            <input
              type="text"
              value={themeVibe}
              onChange={(e) => setThemeVibe(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-stone-900 hover:bg-stone-800 rounded-xl"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
