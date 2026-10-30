import { BudgetItem, TimelineMilestone, RunOfShowItem, VendorItem } from '../types/event';

export interface BudgetSummary {
  targetBudget: number;
  totalEstimated: number;
  totalActual: number;
  remainingFromTarget: number;
  paidAmount: number;
  pendingAmount: number;
  isOverBudget: boolean;
  variancePercentage: number;
}

export interface CategorySummary {
  category: string;
  estimated: number;
  actual: number;
  itemCount: number;
  percentageOfBudget: number;
}

export function calculateBudgetSummary(
  items: BudgetItem[],
  targetBudget: number
): BudgetSummary {
  const safeTarget = Math.max(0, targetBudget || 0);
  let totalEstimated = 0;
  let totalActual = 0;
  let paidAmount = 0;
  let pendingAmount = 0;

  for (const item of items) {
    const est = Number(item.estimatedCost) || 0;
    const act = Number(item.actualCost) || 0;
    totalEstimated += est;
    totalActual += act;

    if (item.status === 'paid_in_full') {
      paidAmount += act > 0 ? act : est;
    } else if (item.status === 'deposit_paid') {
      // Typically 50% deposit paid, rest pending
      const deposit = (act > 0 ? act : est) * 0.5;
      paidAmount += deposit;
      pendingAmount += (act > 0 ? act : est) * 0.5;
    } else {
      pendingAmount += act > 0 ? act : est;
    }
  }

  const effectiveSpent = totalActual > 0 ? totalActual : totalEstimated;
  const remainingFromTarget = safeTarget - effectiveSpent;
  const isOverBudget = effectiveSpent > safeTarget;
  const variancePercentage =
    safeTarget > 0 ? Math.round(((effectiveSpent - safeTarget) / safeTarget) * 100) : 0;

  return {
    targetBudget: safeTarget,
    totalEstimated,
    totalActual,
    remainingFromTarget,
    paidAmount,
    pendingAmount,
    isOverBudget,
    variancePercentage,
  };
}

export function calculateCategoryTotals(
  items: BudgetItem[],
  targetBudget: number
): CategorySummary[] {
  const safeTarget = targetBudget > 0 ? targetBudget : 1;
  const map = new Map<string, { estimated: number; actual: number; count: number }>();

  for (const item of items) {
    const cat = item.category || 'Other';
    const current = map.get(cat) || { estimated: 0, actual: 0, count: 0 };
    current.estimated += Number(item.estimatedCost) || 0;
    current.actual += Number(item.actualCost) || 0;
    current.count += 1;
    map.set(cat, current);
  }

  const result: CategorySummary[] = [];
  for (const [category, val] of map.entries()) {
    const costForPercent = val.actual > 0 ? val.actual : val.estimated;
    result.push({
      category,
      estimated: val.estimated,
      actual: val.actual,
      itemCount: val.count,
      percentageOfBudget: Math.min(100, Math.round((costForPercent / safeTarget) * 100)),
    });
  }

  // Sort descending by cost
  return result.sort((a, b) => (b.actual || b.estimated) - (a.actual || a.estimated));
}

export function calculateTimelineStats(milestones: TimelineMilestone[]) {
  const total = milestones.length;
  const completed = milestones.filter((m) => m.completed).length;
  const pending = total - completed;
  const percentComplete = total > 0 ? Math.round((completed / total) * 100) : 0;
  const highPriorityPending = milestones.filter(
    (m) => !m.completed && m.priority === 'high'
  ).length;

  return {
    total,
    completed,
    pending,
    percentComplete,
    highPriorityPending,
  };
}

export function calculateRunOfShowStats(items: RunOfShowItem[]) {
  const total = items.length;
  const done = items.filter((i) => i.status === 'done').length;
  const current = items.find((i) => i.status === 'current') || null;
  const upcoming = items.filter((i) => i.status === 'upcoming').length;

  return {
    total,
    done,
    current,
    upcoming,
    completionPercentage: total > 0 ? Math.round((done / total) * 100) : 0,
  };
}

export function calculateVendorStats(vendors: VendorItem[]) {
  const total = vendors.length;
  const confirmed = vendors.filter((v) => v.status === 'confirmed').length;
  const contractSigned = vendors.filter((v) => v.status === 'contract_signed').length;
  const researchingOrContacted = vendors.filter(
    (v) => v.status === 'researching' || v.status === 'contacted'
  ).length;

  let totalCommittedSpend = 0;
  let totalChecklistItems = 0;
  let completedChecklistItems = 0;

  for (const v of vendors) {
    if (v.status === 'contract_signed' || v.status === 'confirmed') {
      totalCommittedSpend += Number(v.quoteAmount) || 0;
    }
    if (v.checklist) {
      totalChecklistItems += v.checklist.length;
      completedChecklistItems += v.checklist.filter((c) => c.done).length;
    }
  }

  const checklistProgress =
    totalChecklistItems > 0
      ? Math.round((completedChecklistItems / totalChecklistItems) * 100)
      : 100;

  return {
    total,
    confirmed,
    contractSigned,
    researchingOrContacted,
    totalCommittedSpend,
    totalChecklistItems,
    completedChecklistItems,
    checklistProgress,
  };
}

export function formatCurrency(amount: number, currencyCode: string = 'USD'): string {
  const safeNum = Number(amount) || 0;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(safeNum);
  } catch {
    return `$${safeNum.toLocaleString()}`;
  }
}

export function validateEventData(data: {
  title?: string;
  guestCount?: number;
  targetBudget?: number;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push('Event title is required');
  }

  if (data.guestCount !== undefined && (isNaN(data.guestCount) || data.guestCount < 1)) {
    errors.push('Guest count must be at least 1');
  }

  if (data.targetBudget !== undefined && (isNaN(data.targetBudget) || data.targetBudget < 0)) {
    errors.push('Target budget cannot be negative');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
