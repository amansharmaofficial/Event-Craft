import React, { useState } from 'react';
import { BudgetItem, BudgetCategory, PaymentStatus } from '../types/event';
import {
  calculateBudgetSummary,
  calculateCategoryTotals,
  formatCurrency,
} from '../utils/eventCalculations';
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Trash2,
  Edit2,
  DollarSign,
  TrendingDown,
  TrendingUp,
  CreditCard,
} from 'lucide-react';

interface BudgetPlannerProps {
  items: BudgetItem[];
  targetBudget: number;
  currency: string;
  onAddItem: (item: Omit<BudgetItem, 'id'>) => void;
  onUpdateItem: (id: string, updates: Partial<BudgetItem>) => void;
  onDeleteItem: (id: string) => void;
}

const CATEGORIES: BudgetCategory[] = [
  'Venue & Space',
  'Catering & Beverages',
  'Decor, Florals & Ambience',
  'Photography & Videography',
  'Entertainment & Music',
  'Attire, Favors & Gifts',
  'Logistics, AV & Rentals',
  'Permits, Security & Insurance',
  'Marketing & Invitations',
  'Emergency Contingency',
  'Other',
];

export const BudgetPlanner: React.FC<BudgetPlannerProps> = ({
  items,
  targetBudget,
  currency,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<BudgetCategory>('Venue & Space');
  const [formEstimated, setFormEstimated] = useState<string>('');
  const [formActual, setFormActual] = useState<string>('');
  const [formStatus, setFormStatus] = useState<PaymentStatus>('pending');
  const [formDueDate, setFormDueDate] = useState('');
  const [formVendor, setFormVendor] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const summary = calculateBudgetSummary(items, targetBudget);
  const categoryTotals = calculateCategoryTotals(items, targetBudget);

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.vendorName && item.vendorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;

    const matchesStatus =
      selectedStatus === 'all' || item.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingItemId(null);
    setFormName('');
    setFormCategory('Venue & Space');
    setFormEstimated('');
    setFormActual('');
    setFormStatus('pending');
    setFormDueDate('');
    setFormVendor('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: BudgetItem) => {
    setEditingItemId(item.id);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormEstimated(String(item.estimatedCost || ''));
    setFormActual(String(item.actualCost || ''));
    setFormStatus(item.status);
    setFormDueDate(item.dueDate || '');
    setFormVendor(item.vendorName || '');
    setFormNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const est = parseFloat(formEstimated) || 0;
    const act = parseFloat(formActual) || 0;

    if (editingItemId) {
      onUpdateItem(editingItemId, {
        name: formName.trim(),
        category: formCategory,
        estimatedCost: est,
        actualCost: act,
        status: formStatus,
        dueDate: formDueDate || undefined,
        vendorName: formVendor.trim() || undefined,
        notes: formNotes.trim() || undefined,
      });
    } else {
      onAddItem({
        name: formName.trim(),
        category: formCategory,
        estimatedCost: est,
        actualCost: act,
        status: formStatus,
        dueDate: formDueDate || undefined,
        vendorName: formVendor.trim() || undefined,
        notes: formNotes.trim() || undefined,
      });
    }

    setIsModalOpen(false);
  };

  const cycleStatus = (item: BudgetItem) => {
    const nextStatus: Record<PaymentStatus, PaymentStatus> = {
      pending: 'deposit_paid',
      deposit_paid: 'paid_in_full',
      paid_in_full: 'pending',
    };
    onUpdateItem(item.id, { status: nextStatus[item.status] });
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Target Budget */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Target Budget</span>
            <DollarSign className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl font-bold font-display text-stone-900">
            {formatCurrency(summary.targetBudget, currency)}
          </div>
          <p className="text-xs text-stone-500 mt-1">Cap set for overall event</p>
        </div>

        {/* Total Projected / Actual */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Committed</span>
            {summary.isOverBudget ? (
              <TrendingUp className="w-4 h-4 text-rose-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-emerald-500" />
            )}
          </div>
          <div className="text-2xl font-bold font-display text-stone-900">
            {formatCurrency(summary.totalActual > 0 ? summary.totalActual : summary.totalEstimated, currency)}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-stone-500">
            <span>Est: {formatCurrency(summary.totalEstimated, currency)}</span>
            <span>•</span>
            <span>Act: {formatCurrency(summary.totalActual, currency)}</span>
          </div>
        </div>

        {/* Remaining Balance */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Remaining Balance</span>
            {summary.isOverBudget ? (
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            )}
          </div>
          <div
            className={`text-2xl font-bold font-display ${
              summary.isOverBudget ? 'text-rose-600' : 'text-emerald-700'
            }`}
          >
            {formatCurrency(summary.remainingFromTarget, currency)}
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {summary.isOverBudget
              ? `Over budget by ${summary.variancePercentage}%`
              : `${Math.round((summary.remainingFromTarget / (summary.targetBudget || 1)) * 100)}% available`}
          </p>
        </div>

        {/* Cashflow Paid vs Pending */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Paid to Vendors</span>
            <CreditCard className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl font-bold font-display text-stone-900">
            {formatCurrency(summary.paidAmount, currency)}
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Pending payments: <strong className="text-stone-700">{formatCurrency(summary.pendingAmount, currency)}</strong>
          </p>
        </div>
      </div>

      {/* Category Breakdown Progress */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-stone-900">Category Allocation</h2>
          <span className="text-xs text-stone-500">Sorted by expenditure</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryTotals.map((cat) => {
            const cost = cat.actual > 0 ? cat.actual : cat.estimated;
            return (
              <div
                key={cat.category}
                className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-stone-800">
                  <span className="truncate pr-2">{cat.category}</span>
                  <span className="font-bold">{formatCurrency(cost, currency)}</span>
                </div>
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, cat.percentageOfBudget)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-stone-500">
                  <span>{cat.itemCount} {cat.itemCount === 1 ? 'item' : 'items'}</span>
                  <span>{cat.percentageOfBudget}% of budget</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expense Ledger Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {/* Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search expenses, vendors..."
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="relative">
              <select
                aria-label="Filter by category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-stone-50 border border-stone-200 rounded-lg pl-3 pr-8 py-2 text-xs sm:text-sm text-stone-700 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <Filter className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <select
              aria-label="Filter by payment status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-stone-700 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="deposit_paid">Deposit Paid</option>
              <option value="paid_in_full">Paid in Full</option>
            </select>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>

        {/* Ledger Items */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-stone-700">
            <thead className="bg-stone-50 text-[11px] uppercase tracking-wider text-stone-500 border-b border-stone-200">
              <tr>
                <th className="py-3 px-4 sm:px-6">Item & Category</th>
                <th className="py-3 px-4">Estimated</th>
                <th className="py-3 px-4">Actual</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4 hidden md:table-cell">Due Date</th>
                <th className="py-3 px-4 hidden lg:table-cell">Vendor / Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-500">
                    No budget items match your filters.{' '}
                    <button
                      onClick={handleOpenAdd}
                      className="text-amber-600 font-semibold underline hover:text-amber-700"
                    >
                      Add an expense
                    </button>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/70 transition-colors">
                    {/* Name & Category */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="font-semibold text-stone-900">{item.name}</div>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-stone-600 border border-stone-200">
                        {item.category}
                      </span>
                    </td>

                    {/* Estimated Cost */}
                    <td className="py-3.5 px-4 text-stone-600 font-medium">
                      {formatCurrency(item.estimatedCost, currency)}
                    </td>

                    {/* Actual Cost */}
                    <td className="py-3.5 px-4 font-bold text-stone-900">
                      {item.actualCost > 0
                        ? formatCurrency(item.actualCost, currency)
                        : <span className="text-stone-400 font-normal italic">—</span>}
                    </td>

                    {/* Status Badge (Click to cycle) */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => cycleStatus(item)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all border ${
                          item.status === 'paid_in_full'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            : item.status === 'deposit_paid'
                            ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                            : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                        }`}
                        title="Click to advance status"
                      >
                        {item.status === 'paid_in_full' ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Paid in Full</span>
                          </>
                        ) : item.status === 'deposit_paid' ? (
                          <>
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Deposit Paid</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5 text-stone-400" />
                            <span>Pending</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Due Date */}
                    <td className="py-3.5 px-4 hidden md:table-cell text-xs text-stone-500">
                      {item.dueDate || '—'}
                    </td>

                    {/* Vendor & Notes */}
                    <td className="py-3.5 px-4 hidden lg:table-cell text-xs text-stone-500 max-w-[200px]">
                      {item.vendorName && (
                        <div className="font-medium text-stone-800 truncate">
                          {item.vendorName}
                        </div>
                      )}
                      {item.notes && <p className="truncate text-stone-500">{item.notes}</p>}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          aria-label={`Edit ${item.name}`}
                          className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                          title="Edit item"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          aria-label={`Delete ${item.name}`}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add / Edit Expense */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold font-display text-stone-900 mb-4">
              {editingItemId ? 'Edit Expense Item' : 'Add New Expense Item'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Glasshouse Venue Deposit"
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as BudgetCategory)}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Payment Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as PaymentStatus)}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="deposit_paid">Deposit Paid</option>
                    <option value="paid_in_full">Paid in Full</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Estimated Cost ({currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formEstimated}
                    onChange={(e) => setFormEstimated(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Actual Cost ({currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formActual}
                    onChange={(e) => setFormActual(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                    Vendor Company
                  </label>
                  <input
                    type="text"
                    value={formVendor}
                    onChange={(e) => setFormVendor(e.target.value)}
                    placeholder="e.g. Acme Floral Co"
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Terms, deliverables, contract stipulations..."
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shadow-xs"
                >
                  {editingItemId ? 'Update Expense' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
