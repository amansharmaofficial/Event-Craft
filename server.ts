import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server-side with User-Agent header
const apiKey = process.env.GEMINI_API_KEY || '';
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// -------------------------------------------------------------
// POST /api/generate-plan
// -------------------------------------------------------------
app.post('/api/generate-plan', async (req, res) => {
  const { eventType, title, guestCount, budget, currency, location, themeVibe, targetDate, notes } =
    req.body;

  const prompt = `You are a world-class professional event producer and planner.
Create a complete, realistic, comprehensive event master plan for:
- Event Type: ${eventType || 'Event'}
- Event Title: ${title || 'My Celebration'}
- Guest Count: ${guestCount || 100} attendees
- Target Budget: ${budget || 15000} ${currency || 'USD'}
- Location / Setting: ${location || 'Local venue / Outdoor hall'}
- Preferred Vibe / Aesthetic: ${themeVibe || 'Elegant, festive, memorable'}
- Target Event Date: ${targetDate || '2026-10-15'}
- Extra Details: ${notes || 'Make it memorable, seamless and well-budgeted.'}

Respond ONLY with valid JSON with this exact structure:
{
  "tagline": "string",
  "themes": [
    {
      "name": "string",
      "tagline": "string",
      "description": "string",
      "palette": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
      "stylingCues": ["string", "string", "string"]
    }
  ],
  "budgetBreakdown": [
    {
      "category": "Venue & Space | Catering & Beverages | Decor, Florals & Ambience | Photography & Videography | Entertainment & Music | Attire, Favors & Gifts | Logistics, AV & Rentals | Permits, Security & Insurance | Marketing & Invitations | Emergency Contingency | Other",
      "name": "string",
      "estimatedCost": number,
      "notes": "string"
    }
  ],
  "timelineMilestones": [
    {
      "phase": "6+ Months Before | 3-6 Months Before | 1-2 Months Before | 2-4 Weeks Before | Week of Event | Day Before | Day of Event | Post Event",
      "title": "string",
      "priority": "high | medium | low",
      "category": "string",
      "assignedTo": "string",
      "notes": "string"
    }
  ],
  "runOfShow": [
    {
      "startTime": "e.g. 02:00 PM",
      "endTime": "e.g. 03:00 PM",
      "title": "string",
      "location": "string",
      "responsibleRole": "string",
      "description": "string"
    }
  ],
  "vendors": [
    {
      "category": "string",
      "companyName": "string",
      "quoteAmount": number,
      "deliverables": ["string", "string"],
      "checklist": ["string", "string", "string"],
      "interviewQuestions": ["string", "string"],
      "notes": "string"
    }
  ],
  "menuSuggestions": {
    "cocktailOrBeverage": "string",
    "appetizers": ["string", "string"],
    "mains": ["string", "string"],
    "dessert": "string",
    "dietaryNotes": "string"
  },
  "icebreakersAndActivities": [
    {
      "title": "string",
      "description": "string",
      "targetAudience": "string",
      "suppliesNeeded": "string"
    }
  ],
  "speechAndInvitationSnippets": [
    {
      "category": "string",
      "wording": "string",
      "tone": "string"
    }
  ],
  "contingencyPlans": [
    {
      "risk": "string",
      "severity": "low | medium | high",
      "mitigationStrategy": "string"
    }
  ]
}
Ensure sum of estimated costs in budgetBreakdown roughly equals the target budget of ${budget} ${currency}. Provide at least 6 budget items, 6 timeline milestones, 6 run-of-show schedule items, and 3 essential vendors.`;

  try {
    if (!aiClient) {
      throw new Error('GEMINI_API_KEY is not configured on the server');
    }

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json({ success: true, plan: parsed });
  } catch (err: any) {
    console.error('Error in /api/generate-plan:', err?.message || err);

    // Provide intelligent fallback plan so user isn't stuck if offline or key is missing
    const numBudget = Number(budget) || 12000;
    const fallbackPlan = {
      tagline: `A bespoke celebration tailored for ${guestCount || 100} guests`,
      themes: [
        {
          name: `${themeVibe || 'Classic Elegance'} Signature`,
          tagline: 'Refined harmony of ambient lighting and thoughtful details',
          description: `Custom designed for ${title || 'your event'} to maximize guest immersion.`,
          palette: ['#C86D51', '#7D8C71', '#D4A373', '#FAF3E0', '#2E3D30'],
          stylingCues: [
            'Warm layered ambient lighting with warm white fairy lights',
            'Custom botanical or architectural focal point greeting guests',
            'Coordinated linen and personalized place cards',
          ],
        },
      ],
      budgetBreakdown: [
        {
          category: 'Venue & Space',
          name: 'Primary Space Rental & Facility Fees',
          estimatedCost: Math.round(numBudget * 0.35),
          notes: 'Space buyout and basic tables/chairs.',
        },
        {
          category: 'Catering & Beverages',
          name: 'Food Service, Canapes & Beverages',
          estimatedCost: Math.round(numBudget * 0.3),
          notes: `Designed for ${guestCount || 100} guests.`,
        },
        {
          category: 'Photography & Videography',
          name: 'Professional Photographer & Digital Album',
          estimatedCost: Math.round(numBudget * 0.12),
          notes: 'Full day coverage with digital rights.',
        },
        {
          category: 'Decor, Florals & Ambience',
          name: 'Floral Installations & Table Decor',
          estimatedCost: Math.round(numBudget * 0.1),
          notes: 'Centerpieces, signage, and accent lighting.',
        },
        {
          category: 'Entertainment & Music',
          name: 'Live DJ / Acoustic Musician & Sound Tech',
          estimatedCost: Math.round(numBudget * 0.08),
          notes: 'Includes wireless microphones and sound PA.',
        },
        {
          category: 'Emergency Contingency',
          name: 'Contingency Reserve & Unforeseen Expenses',
          estimatedCost: Math.round(numBudget * 0.05),
          notes: 'Reserve buffer for last-minute adjustments.',
        },
      ],
      timelineMilestones: [
        {
          phase: '3-6 Months Before',
          title: 'Finalize venue selection and sign rental agreement',
          priority: 'high',
          category: 'Venue',
          assignedTo: 'Lead Organizer',
          notes: 'Confirm deposit schedule.',
        },
        {
          phase: '1-2 Months Before',
          title: 'Send formal invitations with dietary RSVP deadline',
          priority: 'high',
          category: 'Guest List',
          assignedTo: 'Organizer',
          notes: 'Track headcounts weekly.',
        },
        {
          phase: '2-4 Weeks Before',
          title: 'Finalize schedule run-of-show with all vendors',
          priority: 'high',
          category: 'Logistics',
          assignedTo: 'Event Producer',
          notes: 'Distribute timeline to caterer, photographer, and DJ.',
        },
        {
          phase: 'Week of Event',
          title: 'Provide final catering guest headcount & load-in schedule',
          priority: 'high',
          category: 'Catering',
          assignedTo: 'Lead Organizer',
          notes: 'Confirm vendor meals and allergy list.',
        },
        {
          phase: 'Day Before',
          title: 'Deliver decor items to venue & venue walk-through',
          priority: 'medium',
          category: 'Setup',
          assignedTo: 'Setup Team',
          notes: 'Test AV sound equipment.',
        },
        {
          phase: 'Day of Event',
          title: 'Morning vendor check-in & event execution',
          priority: 'high',
          category: 'Day-Of',
          assignedTo: 'Event Lead',
          notes: 'Oversee schedule and guest arrival.',
        },
      ],
      runOfShow: [
        {
          startTime: '01:00 PM',
          endTime: '03:00 PM',
          title: 'Vendor Load-in, Floral Delivery & AV Soundcheck',
          location: 'Main Venue Space',
          responsibleRole: 'Event Coordinator & AV Tech',
          description: 'Caterer sets tables, sound system tested, decor placed.',
        },
        {
          startTime: '03:30 PM',
          endTime: '04:00 PM',
          title: 'Guest Arrival, Welcome Cocktails & Ambient Music',
          location: 'Foyer / Courtyard',
          responsibleRole: 'Host & Greeters',
          description: 'Guests arrive, check coats, receive welcome beverage.',
        },
        {
          startTime: '04:00 PM',
          endTime: '05:00 PM',
          title: 'Main Ceremony / Program Opening',
          location: 'Main Hall',
          responsibleRole: 'Emcee & Keynote / Officiant',
          description: 'Core ceremony or keynote celebration.',
        },
        {
          startTime: '05:00 PM',
          endTime: '06:15 PM',
          title: 'Cocktail Reception & Interactive Activities',
          location: 'Lounge / Patio',
          responsibleRole: 'Catering & DJ',
          description: 'Passed hors d’oeuvres, photo booth, guest socializing.',
        },
        {
          startTime: '06:30 PM',
          endTime: '08:00 PM',
          title: 'Dinner Service & Speeches / Toasts',
          location: 'Dining Area',
          responsibleRole: 'Catering Captain & Speakers',
          description: 'Main meal served followed by celebration toasts.',
        },
        {
          startTime: '08:00 PM',
          endTime: '10:30 PM',
          title: 'Dessert, Music, Dancing & Celebration',
          location: 'Dance Floor',
          responsibleRole: 'DJ / Band',
          description: 'High energy music set and cake/dessert service.',
        },
      ],
      vendors: [
        {
          category: 'Venue & Facilities',
          companyName: 'Premier Event Pavilion',
          quoteAmount: Math.round(numBudget * 0.35),
          deliverables: ['Exclusive access for 8 hours', 'Tables and banquet chairs included', 'Standard lighting package'],
          checklist: ['Sign rental contract', 'Submit certificate of insurance', 'Review sound curfew rules'],
          interviewQuestions: ['What is the load-in cutoff time?', 'Do you require a licensed security guard?'],
          notes: 'Deposit of 50% required at contract signing.',
        },
        {
          category: 'Catering & Bar',
          companyName: 'Artisan Culinary Group',
          quoteAmount: Math.round(numBudget * 0.3),
          deliverables: ['Custom 2-course meal', 'Service staff & kitchen crew', 'China, flatware and glassware'],
          checklist: ['Schedule tasting session', 'Collect dietary restrictions', 'Finalize cocktail menu'],
          interviewQuestions: ['How are last-minute guest count changes handled?', 'Do you provide vendor meals?'],
          notes: 'Full bar package or BYOB option available.',
        },
        {
          category: 'Photography',
          companyName: 'Vivid Memories Photography',
          quoteAmount: Math.round(numBudget * 0.12),
          deliverables: ['8 hours full coverage', 'Online private gallery with printing rights', 'Sneak peek gallery in 48 hours'],
          checklist: ['Provide shot list of key moments', 'Coordinate golden hour photo time'],
          interviewQuestions: ['What backup equipment do you bring?', 'Do you shoot with a secondary assistant?'],
          notes: 'Renowned for candid documentary style.',
        },
      ],
      menuSuggestions: {
        cocktailOrBeverage: 'Artisan Citrus Fizz & Rosemary Infused Sparkler',
        appetizers: ['Wild mushroom crostini with truffle drizzle', 'Smoked salmon blinis with fresh dill'],
        mains: ['Herb-crusted roasted tenderloin with seasonal root vegetables', 'Pan-roasted Chilean sea bass or wild risotto'],
        dessert: 'Decadent chocolate torte & espresso martini shooters',
        dietaryNotes: 'Vegetarian, vegan, and gluten-free alternatives labeled clearly.',
      },
      icebreakersAndActivities: [
        {
          title: 'Guest Photo Quest & Memory Wall',
          description: 'Guests receive a mini prompt card (e.g., "Find someone who traveled the furthest") and pin polaroids to a lighted memory wall.',
          targetAudience: 'All guests during cocktail hour',
          suppliesNeeded: 'Instant cameras, peg clips, fairy light grid',
        },
      ],
      speechAndInvitationSnippets: [
        {
          category: 'Invitation Header',
          wording: `Join us for a momentous celebration of ${title || 'our special day'} filled with great food, lively music, and cherished memories.`,
          tone: 'Warm, elegant, and festive',
        },
      ],
      contingencyPlans: [
        {
          risk: 'Inclement Weather for Outdoor Segments',
          severity: 'medium',
          mitigationStrategy: 'Pre-reserved transparent tenting and indoor ballroom space reserved as primary rain fallback.',
        },
      ],
    };

    return res.json({
      success: true,
      plan: fallbackPlan,
      isFallback: true,
      error: err?.message || 'Gemini API not available, used smart blueprint.',
    });
  }
});

// -------------------------------------------------------------
// POST /api/chat-assistant
// -------------------------------------------------------------
app.post('/api/chat-assistant', async (req, res) => {
  const { eventSummary, currentBudget, guestCount, chatHistory, userMessage } = req.body;

  const systemInstruction = `You are "Event Architect", an enthusiastic, ultra-practical senior event producer AI.
You help the user optimize their event budget, run of show, vendor negotiations, creative themes, and guest experience.
Current Event Context:
- Title & Type: ${eventSummary?.title || 'Event'} (${eventSummary?.type || 'General'})
- Target Budget: ${currentBudget || '$10,000'}
- Guest Count: ${guestCount || 100}
- Current Spend: ${eventSummary?.currentSpend || 'N/A'}
- Venue: ${eventSummary?.location || 'Unspecified'}

When relevant, if you suggest a specific concrete task or budget item or vendor or run-of-show item, you can optionally include an actionable proposal in JSON at the very end of your response inside a <<<ACTION>>> ... <<</ACTION>>> tag with structure:
<<<ACTION>>>
{
  "type": "add_expense" | "add_milestone" | "add_vendor" | "add_run_item",
  "label": "Button label for user to click, e.g., 'Add Photo Booth ($600)'",
  "data": { ...item fields matching app schema... }
}
<<</ACTION>>>

Keep your conversational tone supportive, crisp, and insightful. Offer specific numbers, timeframes, or vendor negotiating tips!`;

  try {
    if (!aiClient) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const messages = chatHistory || [];
    // Convert to Gemini format
    let promptText = `User says: "${userMessage}"\nProvide helpful advice based on the event context.`;
    if (messages.length > 0) {
      const historyStr = messages
        .slice(-6)
        .map((m: any) => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
        .join('\n');
      promptText = `Previous conversation:\n${historyStr}\n\nUser now asks: "${userMessage}"`;
    }

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || 'I am ready to help you plan your event!';
    return res.json({ success: true, reply });
  } catch (err: any) {
    console.error('Error in /api/chat-assistant:', err?.message || err);

    // Contextual fallback advice
    let fallbackReply = `Great question! For a ${eventSummary?.type || 'event'} of ${guestCount || 100} guests:
- **Budget Tip**: Ensure you allocate 40-45% to venue and catering, as food and beverage is usually where guest satisfaction is won.
- **Timeline Cues**: Always buffer 15-20 minutes between ceremony/speeches and dinner so guests don't feel rushed.
- **Vendor Advice**: When booking vendors, always ask for an all-inclusive quote that covers travel, equipment breakdown, and overtime fees.`;

    if (userMessage.toLowerCase().includes('budget') || userMessage.toLowerCase().includes('cost')) {
      fallbackReply = `Looking at your budget of ${currentBudget}:
1. Venue + Catering typically absorbs 45-50% of overall costs.
2. Entertainment (DJ/Band) and Photography should take roughly 20-25%.
3. Keep 5-8% set aside as an emergency buffer for unexpected overtime or extra rentals.
Would you like me to suggest specific vendor cutbacks or alternatives?`;
    } else if (userMessage.toLowerCase().includes('timeline') || userMessage.toLowerCase().includes('schedule')) {
      fallbackReply = `For your run of show:
- Vendor load-in should begin at least 3 hours before guest arrival.
- Keep welcome remarks and toasts under 4 minutes each to maintain momentum.
- Transition from dinner to dancing with a high-energy song cue so guests naturally flow to the floor!`;
    }

    return res.json({
      success: true,
      reply: fallbackReply,
      isFallback: true,
    });
  }
});

// -------------------------------------------------------------
// POST /api/generate-ideas
// -------------------------------------------------------------
app.post('/api/generate-ideas', async (req, res) => {
  const { eventType, title, topic, specificPrompt } = req.body;

  const prompt = `As a creative event director, generate 3 innovative, high-impact ideas for:
Event: ${title} (${eventType})
Category / Topic: ${topic}
Details: ${specificPrompt || 'Provide creative, memorable, practical ideas'}

Respond ONLY with valid JSON:
{
  "ideas": [
    {
      "title": "string",
      "summary": "string",
      "implementation": "string",
      "budgetImpact": "low | medium | high",
      "tags": ["string", "string"]
    }
  ]
}`;

  try {
    if (!aiClient) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{"ideas":[]}');
    return res.json({ success: true, ideas: parsed.ideas });
  } catch (err: any) {
    console.error('Error in /api/generate-ideas:', err?.message || err);
    return res.json({
      success: true,
      ideas: [
        {
          title: `Custom Interactive Experience for ${eventType}`,
          summary: 'A personalized sensory station that engages guests upon arrival.',
          implementation: 'Set up an artisan sampling or photo station with curated lighting and props.',
          budgetImpact: 'low',
          tags: ['Guest Experience', 'High Engagement'],
        },
        {
          title: 'Signature Toast & Audio Keepsake',
          summary: 'A dedicated audio guestbook or coordinated toast moment.',
          implementation: 'Have a roving microphone or audio guest phone where attendees leave messages.',
          budgetImpact: 'low',
          tags: ['Memories', 'Sentimental'],
        },
      ],
      isFallback: true,
    });
  }
});

// -------------------------------------------------------------
// Vite Middleware / Static serving
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EventCraft AI Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
