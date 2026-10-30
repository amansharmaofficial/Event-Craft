import React, { useState } from 'react';
import { VendorItem, VendorStatus, VendorChecklistItem } from '../types/event';
import { calculateVendorStats, formatCurrency } from '../utils/eventCalculations';
import {
  Briefcase,
  Phone,
  Mail,
  CheckSquare,
  Square,
  HelpCircle,
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';

interface VendorsHubProps {
  vendors: VendorItem[];
  currency: string;
  onAddVendor: (item: Omit<VendorItem, 'id'>) => void;
  onUpdateVendor: (id: string, updates: Partial<VendorItem>) => void;
  onDeleteVendor: (id: string) => void;
}

export const VendorsHub: React.FC<VendorsHubProps> = ({
  vendors,
  currency,
  onAddVendor,
  onUpdateVendor,
  onDeleteVendor,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [expandedVendorId, setExpandedVendorId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);

  // Form states
  const [vCategory, setVCategory] = useState('Venue & Facilities');
  const [vCompany, setVCompany] = useState('');
  const [vContact, setVContact] = useState('');
  const [vPhone, setVPhone] = useState('');
  const [vEmail, setVEmail] = useState('');
  const [vQuote, setVQuote] = useState('');
  const [vStatus, setVStatus] = useState<VendorStatus>('researching');
  const [vDeliverables, setVDeliverables] = useState('');
  const [vChecklist, setVChecklist] = useState('');
  const [vQuestions, setVQuestions] = useState('');
  const [vNotes, setVNotes] = useState('');

  const stats = calculateVendorStats(vendors);

  const filteredVendors = vendors.filter((v) => {
    if (filterStatus === 'all') return true;
    return v.status === filterStatus;
  });

  const toggleChecklistItem = (vendor: VendorItem, checkId: string) => {
    const updated = vendor.checklist.map((item) =>
      item.id === checkId ? { ...item, done: !item.done } : item
    );
    onUpdateVendor(vendor.id, { checklist: updated });
  };

  const handleOpenAdd = () => {
    setEditingVendorId(null);
    setVCategory('Venue & Facilities');
    setVCompany('');
    setVContact('');
    setVPhone('');
    setVEmail('');
    setVQuote('');
    setVStatus('researching');
    setVDeliverables('All-day space access\nTables and banquet chairs\nDay-of cleanup service');
    setVChecklist('Review standard contract\nSubmit liability insurance\nPay 50% deposit');
    setVQuestions('What is the overtime rate per hour?\nAre outside caterers permitted?');
    setVNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: VendorItem) => {
    setEditingVendorId(v.id);
    setVCategory(v.category);
    setVCompany(v.companyName);
    setVContact(v.contactName);
    setVPhone(v.phone);
    setVEmail(v.email);
    setVQuote(String(v.quoteAmount || ''));
    setVStatus(v.status);
    setVDeliverables((v.deliverables || []).join('\n'));
    setVChecklist((v.checklist || []).map((c) => c.text).join('\n'));
    setVQuestions((v.interviewQuestions || []).join('\n'));
    setVNotes(v.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vCompany.trim()) return;

    const deliverablesArr = vDeliverables
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const checklistArr: VendorChecklistItem[] = vChecklist
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((text, i) => ({
        id: `check-${Date.now()}-${i}`,
        text,
        done: false,
      }));

    const questionsArr = vQuestions
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingVendorId) {
      // keep existing checklist checkmarks if unchanged
      const currentVendor = vendors.find((v) => v.id === editingVendorId);
      const existingDoneMap = new Map(
        (currentVendor?.checklist || []).map((c) => [c.text, c.done])
      );
      const preservedChecklist = checklistArr.map((c) => ({
        ...c,
        done: existingDoneMap.get(c.text) || false,
      }));

      onUpdateVendor(editingVendorId, {
        category: vCategory,
        companyName: vCompany.trim(),
        contactName: vContact.trim(),
        phone: vPhone.trim(),
        email: vEmail.trim(),
        quoteAmount: parseFloat(vQuote) || 0,
        status: vStatus,
        deliverables: deliverablesArr,
        checklist: preservedChecklist,
        interviewQuestions: questionsArr,
        notes: vNotes.trim(),
      });
    } else {
      onAddVendor({
        category: vCategory,
        companyName: vCompany.trim(),
        contactName: vContact.trim(),
        phone: vPhone.trim(),
        email: vEmail.trim(),
        quoteAmount: parseFloat(vQuote) || 0,
        status: vStatus,
        deliverables: deliverablesArr,
        checklist: checklistArr,
        interviewQuestions: questionsArr,
        notes: vNotes.trim(),
      });
    }

    setIsModalOpen(false);
  };

  const getStatusBadge = (status: VendorStatus) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'contract_signed':
        return 'bg-blue-50 text-blue-800 border-blue-300';
      case 'proposal_received':
        return 'bg-purple-50 text-purple-800 border-purple-300';
      case 'contacted':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Vendors</span>
            <Briefcase className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl font-bold font-display text-stone-900">{stats.total}</div>
          <p className="text-xs text-stone-500 mt-1">
            {stats.confirmed} confirmed • {stats.contractSigned} contract signed
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Committed Spend</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-display text-stone-900">
            {formatCurrency(stats.totalCommittedSpend, currency)}
          </div>
          <p className="text-xs text-stone-500 mt-1">Contracts & confirmed bookings</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Deliverables Progress</span>
            <FileCheck2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-display text-stone-900">
            {stats.checklistProgress}%
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {stats.completedChecklistItems} of {stats.totalChecklistItems} checklist items done
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Contracts Locked</span>
            <ShieldCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-display text-stone-900">
            {stats.confirmed + stats.contractSigned} / {stats.total}
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {stats.researchingOrContacted} still negotiating
          </p>
        </div>
      </div>

      {/* Control Bar & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Vendors' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'contract_signed', label: 'Contract Signed' },
            { id: 'proposal_received', label: 'Proposal In' },
            { id: 'contacted', label: 'Contacted' },
            { id: 'researching', label: 'Researching' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus === tab.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Vendor</span>
        </button>
      </div>

      {/* Vendor Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredVendors.length === 0 ? (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-500">
            No vendors match this status.{' '}
            <button onClick={handleOpenAdd} className="text-amber-600 font-semibold underline">
              Add a new vendor
            </button>
          </div>
        ) : (
          filteredVendors.map((vendor) => {
            const isExpanded = expandedVendorId === vendor.id;

            return (
              <div
                key={vendor.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 sm:p-6 space-y-4 hover:border-stone-300 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                      {vendor.category}
                    </span>
                    <h3 className="text-lg font-bold font-display text-stone-900">
                      {vendor.companyName}
                    </h3>
                    {vendor.contactName && (
                      <p className="text-xs text-stone-500">Contact: {vendor.contactName}</p>
                    )}
                  </div>

                  <div className="text-right space-y-1.5">
                    <div className="text-lg font-bold font-display text-stone-900">
                      {formatCurrency(vendor.quoteAmount, currency)}
                    </div>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${getStatusBadge(
                        vendor.status
                      )}`}
                    >
                      {vendor.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Contact Quick Links */}
                {(vendor.phone || vendor.email) && (
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-stone-600">
                    {vendor.phone && (
                      <a
                        href={`tel:${vendor.phone}`}
                        className="inline-flex items-center gap-1 hover:text-amber-700 font-medium bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200"
                      >
                        <Phone className="w-3.5 h-3.5 text-stone-400" />
                        <span>{vendor.phone}</span>
                      </a>
                    )}
                    {vendor.email && (
                      <a
                        href={`mailto:${vendor.email}`}
                        className="inline-flex items-center gap-1 hover:text-amber-700 font-medium bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200"
                      >
                        <Mail className="w-3.5 h-3.5 text-stone-400" />
                        <span>{vendor.email}</span>
                      </a>
                    )}
                  </div>
                )}

                {/* Deliverables Overview */}
                {vendor.deliverables && vendor.deliverables.length > 0 && (
                  <div className="space-y-1.5 bg-stone-50/70 p-3 rounded-xl border border-stone-200/60">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                      Core Deliverables
                    </span>
                    <ul className="text-xs text-stone-700 space-y-1">
                      {vendor.deliverables.map((d, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-600 font-bold">•</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Interactive Contract Checklist */}
                {vendor.checklist && vendor.checklist.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                      <span>Action Items & Milestones</span>
                      <span className="text-stone-500 font-normal">
                        {vendor.checklist.filter((c) => c.done).length}/{vendor.checklist.length}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {vendor.checklist.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => toggleChecklistItem(vendor, item.id)}
                          className="w-full flex items-center gap-2 p-2 rounded-lg text-left text-xs bg-stone-50 hover:bg-stone-100/80 transition-colors border border-stone-200/60"
                        >
                          {item.done ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-stone-400 flex-shrink-0" />
                          )}
                          <span
                            className={
                              item.done
                                ? 'line-through text-stone-400'
                                : 'text-stone-800 font-medium'
                            }
                          >
                            {item.text}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Interview Questions Accordion */}
                {vendor.interviewQuestions && vendor.interviewQuestions.length > 0 && (
                  <div className="border border-stone-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() =>
                        setExpandedVendorId(isExpanded ? null : vendor.id)
                      }
                      className="w-full px-3 py-2 bg-stone-50 flex items-center justify-between text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors"
                    >
                      <div className="flex items-center gap-1.5 text-amber-700">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>AI Vetting Questions ({vendor.interviewQuestions.length})</span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-stone-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-stone-400" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="p-3 bg-white space-y-2 text-xs text-stone-600 border-t border-stone-200">
                        <p className="text-[11px] text-stone-400 italic">
                          Ask these specific questions before signing contracts:
                        </p>
                        <ol className="list-decimal pl-4 space-y-1.5">
                          {vendor.interviewQuestions.map((q, i) => (
                            <li key={i} className="text-stone-800 font-medium">
                              {q}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                )}

                {vendor.notes && (
                  <p className="text-xs text-stone-500 italic bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/40">
                    💡 Note: {vendor.notes}
                  </p>
                )}

                {/* Bottom Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                  <button
                    onClick={() => handleOpenEdit(vendor)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 rounded-lg transition-colors border border-stone-200"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Vendor</span>
                  </button>

                  <button
                    onClick={() => onDeleteVendor(vendor.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete vendor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Vendor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold font-display text-stone-900 mb-4">
              {editingVendorId ? 'Edit Vendor Details' : 'Add New Vendor'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={vCompany}
                    onChange={(e) => setVCompany(e.target.value)}
                    placeholder="e.g. Apex Audio Visual"
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={vCategory}
                    onChange={(e) => setVCategory(e.target.value)}
                    placeholder="e.g. Catering, Venue, DJ"
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={vContact}
                    onChange={(e) => setVContact(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Quoted Cost ({currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={vQuote}
                    onChange={(e) => setVQuote(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={vPhone}
                    onChange={(e) => setVPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={vEmail}
                    onChange={(e) => setVEmail(e.target.value)}
                    placeholder="contact@vendor.com"
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Contract / Booking Status
                </label>
                <select
                  value={vStatus}
                  onChange={(e) => setVStatus(e.target.value as VendorStatus)}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="researching">Researching</option>
                  <option value="contacted">Contacted</option>
                  <option value="proposal_received">Proposal Received</option>
                  <option value="contract_signed">Contract Signed</option>
                  <option value="confirmed">Confirmed & Locked</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Deliverables (one per line)
                </label>
                <textarea
                  rows={2}
                  value={vDeliverables}
                  onChange={(e) => setVDeliverables(e.target.value)}
                  placeholder="e.g. 8 hours sound service&#10;Wireless lapel mic&#10;Stage lighting package"
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Checklist Items (one per line)
                </label>
                <textarea
                  rows={2}
                  value={vChecklist}
                  onChange={(e) => setVChecklist(e.target.value)}
                  placeholder="e.g. Sign contract&#10;Pay deposit&#10;Send event timeline"
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Interview Questions to Ask
                </label>
                <textarea
                  rows={2}
                  value={vQuestions}
                  onChange={(e) => setVQuestions(e.target.value)}
                  placeholder="Questions for vetting or contracting..."
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Internal Notes
                </label>
                <textarea
                  rows={2}
                  value={vNotes}
                  onChange={(e) => setVNotes(e.target.value)}
                  placeholder="Special stipulations, payment schedules, cancellation terms..."
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl"
                >
                  {editingVendorId ? 'Update Vendor' : 'Add Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
