import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBudgetSummary,
  calculateCategoryTotals,
  calculateTimelineStats,
  calculateRunOfShowStats,
  calculateVendorStats,
  formatCurrency,
  validateEventData,
} from './eventCalculations';
import { BudgetItem, TimelineMilestone, RunOfShowItem, VendorItem } from '../types/event';

test('calculateBudgetSummary computes accurate totals and balance', () => {
  const items: BudgetItem[] = [
    {
      id: '1',
      category: 'Venue & Space',
      name: 'Hall Rental',
      estimatedCost: 5000,
      actualCost: 5200,
      status: 'paid_in_full',
    },
    {
      id: '2',
      category: 'Catering & Beverages',
      name: 'Buffet',
      estimatedCost: 3000,
      actualCost: 2800,
      status: 'deposit_paid',
    },
    {
      id: '3',
      category: 'Entertainment & Music',
      name: 'Live Band',
      estimatedCost: 2000,
      actualCost: 0,
      status: 'pending',
    },
  ];

  const summary = calculateBudgetSummary(items, 12000);
  assert.equal(summary.targetBudget, 12000);
  assert.equal(summary.totalEstimated, 10000);
  assert.equal(summary.totalActual, 8000);
  // effective spent is totalActual = 8000
  assert.equal(summary.remainingFromTarget, 4000);
  assert.equal(summary.isOverBudget, false);
});

test('calculateBudgetSummary detects overbudget scenarios', () => {
  const items: BudgetItem[] = [
    {
      id: '1',
      category: 'Venue & Space',
      name: 'Castle',
      estimatedCost: 15000,
      actualCost: 16000,
      status: 'paid_in_full',
    },
  ];

  const summary = calculateBudgetSummary(items, 10000);
  assert.equal(summary.isOverBudget, true);
  assert.equal(summary.remainingFromTarget, -6000);
  assert.equal(summary.variancePercentage, 60);
});

test('calculateCategoryTotals aggregates correctly', () => {
  const items: BudgetItem[] = [
    {
      id: '1',
      category: 'Catering & Beverages',
      name: 'Dinner',
      estimatedCost: 4000,
      actualCost: 4000,
      status: 'paid_in_full',
    },
    {
      id: '2',
      category: 'Catering & Beverages',
      name: 'Wine & Cocktails',
      estimatedCost: 1000,
      actualCost: 1000,
      status: 'paid_in_full',
    },
    {
      id: '3',
      category: 'Photography & Videography',
      name: 'Photographer',
      estimatedCost: 2500,
      actualCost: 2500,
      status: 'pending',
    },
  ];

  const totals = calculateCategoryTotals(items, 10000);
  assert.equal(totals.length, 2);
  const catering = totals.find((t) => t.category === 'Catering & Beverages');
  assert.ok(catering);
  assert.equal(catering.actual, 5000);
  assert.equal(catering.itemCount, 2);
  assert.equal(catering.percentageOfBudget, 50);
});

test('calculateTimelineStats computes percentages and priorities', () => {
  const milestones: TimelineMilestone[] = [
    {
      id: '1',
      phase: '3-6 Months Before',
      title: 'Book venue',
      dueDate: '2026-06-01',
      completed: true,
      priority: 'high',
    },
    {
      id: '2',
      phase: '1-2 Months Before',
      title: 'Send invites',
      dueDate: '2026-08-01',
      completed: true,
      priority: 'high',
    },
    {
      id: '3',
      phase: 'Week of Event',
      title: 'Final count',
      dueDate: '2026-09-01',
      completed: false,
      priority: 'high',
    },
    {
      id: '4',
      phase: 'Day Before',
      title: 'Rehearsal',
      dueDate: '2026-09-10',
      completed: false,
      priority: 'medium',
    },
  ];

  const stats = calculateTimelineStats(milestones);
  assert.equal(stats.total, 4);
  assert.equal(stats.completed, 2);
  assert.equal(stats.pending, 2);
  assert.equal(stats.percentComplete, 50);
  assert.equal(stats.highPriorityPending, 1);
});

test('calculateRunOfShowStats tracks schedule items', () => {
  const items: RunOfShowItem[] = [
    {
      id: '1',
      startTime: '10:00',
      title: 'Load in',
      location: 'Main Hall',
      responsibleRole: 'Lead',
      description: 'Unload gear',
      status: 'done',
    },
    {
      id: '2',
      startTime: '11:00',
      title: 'Keynote',
      location: 'Stage',
      responsibleRole: 'Speaker',
      description: 'Opening speech',
      status: 'current',
    },
    {
      id: '3',
      startTime: '12:00',
      title: 'Lunch',
      location: 'Dining room',
      responsibleRole: 'Catering',
      description: 'Buffet',
      status: 'upcoming',
    },
  ];

  const stats = calculateRunOfShowStats(items);
  assert.equal(stats.total, 3);
  assert.equal(stats.done, 1);
  assert.equal(stats.current?.id, '2');
  assert.equal(stats.upcoming, 1);
  assert.equal(stats.completionPercentage, 33);
});

test('calculateVendorStats monitors contracts and checklist items', () => {
  const vendors: VendorItem[] = [
    {
      id: '1',
      category: 'Venue',
      companyName: 'Grand Estate',
      contactName: 'Alice',
      phone: '555-1234',
      email: 'alice@grand.com',
      quoteAmount: 6000,
      status: 'contract_signed',
      deliverables: ['Hall access', 'Chairs'],
      checklist: [
        { id: 'c1', text: 'Sign agreement', done: true },
        { id: 'c2', text: 'Pay deposit', done: true },
      ],
      interviewQuestions: [],
      notes: '',
    },
    {
      id: '2',
      category: 'DJ',
      companyName: 'Groove Beats',
      contactName: 'Bob',
      phone: '555-5678',
      email: 'bob@groove.com',
      quoteAmount: 1500,
      status: 'confirmed',
      deliverables: ['Sound system', '4hr set'],
      checklist: [
        { id: 'c3', text: 'Send playlist', done: false },
      ],
      interviewQuestions: [],
      notes: '',
    },
  ];

  const stats = calculateVendorStats(vendors);
  assert.equal(stats.total, 2);
  assert.equal(stats.contractSigned, 1);
  assert.equal(stats.confirmed, 1);
  assert.equal(stats.totalCommittedSpend, 7500);
  assert.equal(stats.totalChecklistItems, 3);
  assert.equal(stats.completedChecklistItems, 2);
  assert.equal(stats.checklistProgress, 67);
});

test('formatCurrency formats various currencies', () => {
  const usd = formatCurrency(5000, 'USD');
  assert.ok(usd.includes('5,000') || usd.includes('$5,000'));
});

test('validateEventData detects invalid fields', () => {
  const invalid = validateEventData({ title: '', guestCount: -5, targetBudget: -100 });
  assert.equal(invalid.valid, false);
  assert.equal(invalid.errors.length, 3);

  const valid = validateEventData({ title: 'Gala Night', guestCount: 150, targetBudget: 25000 });
  assert.equal(valid.valid, true);
  assert.equal(valid.errors.length, 0);
});
