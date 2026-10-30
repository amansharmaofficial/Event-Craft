export type EventType = 'wedding' | 'birthday' | 'community' | 'custom';

export type PaymentStatus = 'pending' | 'deposit_paid' | 'paid_in_full';

export type BudgetCategory =
  | 'Venue & Space'
  | 'Catering & Beverages'
  | 'Decor, Florals & Ambience'
  | 'Photography & Videography'
  | 'Entertainment & Music'
  | 'Attire, Favors & Gifts'
  | 'Logistics, AV & Rentals'
  | 'Permits, Security & Insurance'
  | 'Marketing & Invitations'
  | 'Emergency Contingency'
  | 'Other';

export interface BudgetItem {
  id: string;
  category: BudgetCategory;
  name: string;
  estimatedCost: number;
  actualCost: number;
  status: PaymentStatus;
  dueDate?: string;
  vendorName?: string;
  notes?: string;
}

export type TimelinePhase =
  | '6+ Months Before'
  | '3-6 Months Before'
  | '1-2 Months Before'
  | '2-4 Weeks Before'
  | 'Week of Event'
  | 'Day Before'
  | 'Day of Event'
  | 'Post Event';

export interface TimelineMilestone {
  id: string;
  phase: TimelinePhase;
  title: string;
  dueDate: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  assignedTo?: string;
  notes?: string;
}

export interface RunOfShowItem {
  id: string;
  startTime: string; // e.g., "14:00" or "2:00 PM"
  endTime?: string;
  title: string;
  location: string;
  responsibleRole: string; // e.g., "Emcee", "Catering Lead", "DJ"
  description: string;
  status: 'upcoming' | 'current' | 'done';
}

export type VendorStatus =
  | 'researching'
  | 'contacted'
  | 'proposal_received'
  | 'contract_signed'
  | 'confirmed';

export interface VendorChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface VendorItem {
  id: string;
  category: string;
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  quoteAmount: number;
  status: VendorStatus;
  deliverables: string[];
  checklist: VendorChecklistItem[];
  interviewQuestions: string[];
  notes: string;
}

export interface ThemeConcept {
  name: string;
  tagline: string;
  description: string;
  palette: string[]; // Hex color codes
  stylingCues: string[];
}

export interface PersonalizedIdeas {
  themes: ThemeConcept[];
  menuSuggestions: {
    cocktailOrBeverage: string;
    appetizers: string[];
    mains: string[];
    dessert: string;
    dietaryNotes: string;
  };
  icebreakersAndActivities: {
    title: string;
    description: string;
    targetAudience: string;
    suppliesNeeded?: string;
  }[];
  speechAndInvitationSnippets: {
    category: string; // 'Invitation Text', 'Welcome Toast', 'Closing Thanks'
    wording: string;
    tone: string;
  }[];
  contingencyPlans: {
    risk: string;
    severity: 'low' | 'medium' | 'high';
    mitigationStrategy: string;
  }[];
}

export interface EventPlan {
  id: string;
  type: EventType;
  title: string;
  tagline?: string;
  date: string; // YYYY-MM-DD
  location: string;
  guestCount: number;
  targetBudget: number;
  currency: string;
  themeVibe: string;
  notes?: string;
  budgetItems: BudgetItem[];
  timeline: TimelineMilestone[];
  runOfShow: RunOfShowItem[];
  vendors: VendorItem[];
  ideas: PersonalizedIdeas;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedAction?: {
    type: 'add_expense' | 'add_milestone' | 'add_vendor' | 'add_run_item';
    data: any;
    label: string;
  };
}
