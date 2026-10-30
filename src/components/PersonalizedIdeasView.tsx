import React, { useState } from 'react';
import { EventPlan, PersonalizedIdeas } from '../types/event';
import {
  Palette,
  UtensilsCrossed,
  Sparkles,
  FileText,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  Wine,
  Users,
} from 'lucide-react';

interface PersonalizedIdeasViewProps {
  event: EventPlan;
  ideas: PersonalizedIdeas;
  onUpdateIdeas: (ideas: PersonalizedIdeas) => void;
  onOpenAiDrawer: (initialQuery?: string) => void;
}

export const PersonalizedIdeasView: React.FC<PersonalizedIdeasViewProps> = ({
  event,
  ideas,
  onUpdateIdeas: _onUpdateIdeas,
  onOpenAiDrawer,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSparkLoading, setIsSparkLoading] = useState(false);
  const [sparkCategory, setSparkCategory] = useState<'themes' | 'menu' | 'activities' | 'speeches' | 'contingency'>('themes');
  const [sparkIdeas, setSparkIdeas] = useState<any[]>([]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerateSparkIdeas = async () => {
    setIsSparkLoading(true);
    try {
      const res = await fetch('/api/generate-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: event.type,
          title: event.title,
          topic: sparkCategory,
          specificPrompt: `Provide 3 unique ideas for ${event.title} (${event.guestCount} guests, budget ${event.targetBudget} ${event.currency})`,
        }),
      });
      const data = await res.json();
      if (data.ideas) {
        setSparkIdeas(data.ideas);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSparkLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-50 via-stone-50 to-amber-50/50 p-6 rounded-3xl border border-amber-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-600 text-white">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-bold font-display text-stone-900">
              Personalized GenAI Ideas & Creative Concepts
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 max-w-2xl">
            Bespoke aesthetic palettes, signature culinary menus, icebreaker activities, and contingency protocols curated specifically for {event.title}.
          </p>
        </div>

        <button
          onClick={() => onOpenAiDrawer('Brainstorm 3 fresh creative signature twists for my event')}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-stone-900 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl shadow-xs transition-all"
        >
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Ask Event Architect</span>
        </button>
      </div>

      {/* 1. THEMES & COLOR PALETTES */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-amber-600" />
          <h3 className="text-lg font-bold font-display text-stone-900">
            Aesthetic Concepts & Color Palettes
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(ideas.themes || []).map((theme, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4 hover:border-amber-300 transition-all"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  Concept #{index + 1}
                </span>
                <h4 className="text-xl font-bold font-display text-stone-900 mt-1">
                  {theme.name}
                </h4>
                <p className="text-xs italic text-stone-500 font-serif">"{theme.tagline}"</p>
              </div>

              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {theme.description}
              </p>

              {/* Color Swatches */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  Curated Color Palette
                </span>
                <div className="flex items-center gap-2">
                  {theme.palette.map((hex, hIdx) => {
                    const key = `hex-${index}-${hIdx}`;
                    const isCopied = copiedKey === key;
                    return (
                      <button
                        key={hIdx}
                        onClick={() => handleCopy(hex, key)}
                        className="group relative flex flex-col items-center flex-1"
                        title={`Click to copy ${hex}`}
                      >
                        <div
                          className="w-full h-10 rounded-lg shadow-xs border border-black/10 group-hover:scale-105 transition-transform"
                          style={{ backgroundColor: hex }}
                        />
                        <span className="text-[10px] font-mono text-stone-500 mt-1 uppercase">
                          {isCopied ? 'Copied!' : hex}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Styling Cues */}
              {theme.stylingCues && theme.stylingCues.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-stone-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                    Key Styling Elements
                  </span>
                  <ul className="text-xs text-stone-700 space-y-1">
                    {theme.stylingCues.map((cue, cIdx) => (
                      <li key={cIdx} className="flex items-start gap-1.5">
                        <span className="text-amber-600">•</span>
                        <span>{cue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 2. MENU & BEVERAGE PAIRING */}
      {ideas.menuSuggestions && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-bold font-display text-stone-900">
              Curated Menu & Signature Beverage
            </h3>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
            {/* Signature Drink Hero */}
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-800 flex-shrink-0">
                <Wine className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                  Signature Cocktail / Mocktail
                </span>
                <p className="text-sm font-bold text-stone-900">
                  {ideas.menuSuggestions.cocktailOrBeverage}
                </p>
              </div>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Appetizers */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 border-b border-stone-200 pb-1">
                  Passed Hors d’Oeuvres
                </h4>
                <ul className="text-xs text-stone-600 space-y-2">
                  {(ideas.menuSuggestions.appetizers || []).map((app, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-stone-400 font-bold">•</span>
                      <span>{app}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mains */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 border-b border-stone-200 pb-1">
                  Main Entrees
                </h4>
                <ul className="text-xs text-stone-600 space-y-2">
                  {(ideas.menuSuggestions.mains || []).map((main, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-stone-400 font-bold">•</span>
                      <span>{main}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Dessert & Dietary */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 border-b border-stone-200 pb-1">
                  Dessert & Special Diets
                </h4>
                <p className="text-xs font-semibold text-stone-900">
                  🍰 {ideas.menuSuggestions.dessert}
                </p>
                {ideas.menuSuggestions.dietaryNotes && (
                  <p className="text-xs text-stone-500 pt-1 italic bg-amber-50/50 p-2 rounded-lg border border-amber-200/50">
                    🌱 {ideas.menuSuggestions.dietaryNotes}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. INTERACTIVE ICEBREAKERS & ACTIVITIES */}
      {ideas.icebreakersAndActivities && ideas.icebreakersAndActivities.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-bold font-display text-stone-900">
              Interactive Guest Activities & Icebreakers
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ideas.icebreakersAndActivities.map((act, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-stone-900">{act.title}</h4>
                  <span className="text-[10px] font-semibold bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full">
                    {act.targetAudience}
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">{act.description}</p>
                {act.suppliesNeeded && (
                  <div className="text-[11px] text-stone-500 pt-1">
                    <strong className="text-stone-700">Supplies needed:</strong> {act.suppliesNeeded}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. SPEECHES & INVITATION COPY */}
      {ideas.speechAndInvitationSnippets && ideas.speechAndInvitationSnippets.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-bold font-display text-stone-900">
              Wording & Speech Templates
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ideas.speechAndInvitationSnippets.map((snippet, index) => {
              const copyKey = `speech-${index}`;
              const isCopied = copiedKey === copyKey;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      {snippet.category}
                    </span>
                    <span className="text-[11px] text-stone-500 italic">{snippet.tone}</span>
                  </div>

                  <blockquote className="text-xs sm:text-sm text-stone-700 italic border-l-2 border-amber-400 pl-3 py-1 font-serif">
                    "{snippet.wording}"
                  </blockquote>

                  <button
                    onClick={() => handleCopy(snippet.wording, copyKey)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied to Clipboard</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Wording</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. CONTINGENCY & CRISIS PREDICTOR */}
      {ideas.contingencyPlans && ideas.contingencyPlans.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-bold font-display text-stone-900">
              Contingency & Risk Management Plan
            </h3>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-3">
            {ideas.contingencyPlans.map((c, index) => (
              <div
                key={index}
                className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        c.severity === 'high'
                          ? 'bg-rose-100 text-rose-800'
                          : c.severity === 'medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-200 text-stone-800'
                      }`}
                    >
                      {c.severity} severity
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-stone-900">{c.risk}</h4>
                  </div>
                  <p className="text-xs text-stone-600 pl-1">{c.mitigationStrategy}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. ON-DEMAND IDEA SPARK STUDIO */}
      <section className="bg-stone-900 text-white p-6 sm:p-8 rounded-3xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gemini 3.8 Flash Studio</span>
            </div>
            <h3 className="text-xl font-bold font-display text-white">
              Spark New Ideas On-Demand
            </h3>
            <p className="text-xs sm:text-sm text-stone-400">
              Select a dimension below and let the AI generate fresh concepts tailored to your event.
            </p>
          </div>

          <button
            onClick={handleGenerateSparkIdeas}
            disabled={isSparkLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSparkLoading ? 'animate-spin' : ''}`} />
            <span>{isSparkLoading ? 'Generating...' : 'Spark Ideas'}</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: 'themes', label: '🎨 Themes & Styling' },
            { id: 'menu', label: '🍽️ Menu & Mixology' },
            { id: 'activities', label: '🎲 Icebreakers & Games' },
            { id: 'speeches', label: '🎙️ Speeches & Invitation' },
            { id: 'contingency', label: '🛡️ Contingencies & Risks' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSparkCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                sparkCategory === cat.id
                  ? 'bg-amber-500 text-stone-900 font-bold'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Spark Output */}
        {sparkIdeas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {sparkIdeas.map((spark, idx) => (
              <div
                key={idx}
                className="bg-stone-800/90 border border-stone-700 p-4 rounded-2xl space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-amber-300">{spark.title}</h4>
                  <span className="text-[10px] uppercase font-semibold text-stone-400">
                    {spark.budgetImpact} cost
                  </span>
                </div>
                <p className="text-xs text-stone-300">{spark.summary}</p>
                <p className="text-xs text-stone-400 border-t border-stone-700/80 pt-2">
                  <strong className="text-stone-300">Execution:</strong> {spark.implementation}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
