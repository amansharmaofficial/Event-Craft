import React, { useState, useEffect, useRef } from 'react';
import { EventPlan, ChatMessage } from '../types/event';
import {
  X,
  Send,
  Sparkles,
  User,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { formatCurrency } from '../utils/eventCalculations';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventPlan;
  initialQuery?: string;
  onApplyAction: (action: { type: string; data: any; label: string }) => void;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  event,
  initialQuery,
  onApplyAction,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-welcome',
      sender: 'assistant',
      text: `Hello! I'm your Event Architect AI. I've analyzed **${event.title}** (${event.guestCount} guests, budget of ${formatCurrency(
        event.targetBudget,
        event.currency
      )}). How can I help you fine-tune your budget, run-of-show, vendor negotiations, or creative elements today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        id: `welcome-${event.id}`,
        sender: 'assistant',
        text: `Hello! I'm your Event Architect AI. I've analyzed **${event.title}** (${event.guestCount} guests, budget of ${formatCurrency(
          event.targetBudget,
          event.currency
        )}). How can I help you fine-tune your budget, run-of-show, vendor negotiations, or creative elements today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [event.id]);

  useEffect(() => {
    if (initialQuery) {
      setInputValue(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputValue.trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventSummary: {
            title: event.title,
            type: event.type,
            location: event.location,
            currentSpend: formatCurrency(
              event.budgetItems.reduce((acc, i) => acc + (i.actualCost || i.estimatedCost), 0),
              event.currency
            ),
          },
          currentBudget: formatCurrency(event.targetBudget, event.currency),
          guestCount: event.guestCount,
          chatHistory: messages,
          userMessage: textToSend,
        }),
      });

      const data = await res.json();
      let replyText = data.reply || 'Here is what I recommend for your plan.';

      // Check for <<<ACTION>>> ... <<</ACTION>>>
      let actionObj = undefined;
      const actionMatch = replyText.match(/<<<ACTION>>>([\s\S]*?)<<<\/ACTION>>>/);
      if (actionMatch && actionMatch[1]) {
        try {
          actionObj = JSON.parse(actionMatch[1].trim());
          replyText = replyText.replace(/<<<ACTION>>>[\s\S]*?<<<\/ACTION>>>/, '').trim();
        } catch (e) {
          console.warn('Could not parse suggested action', e);
        }
      }

      const botMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedAction: actionObj,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'I ran into an issue connecting with the AI model. Let me suggest reviewing your budget allocations and vendor contracts!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    'How should I divide my budget across categories?',
    'What are 5 essential questions to ask our caterer?',
    'Write a heartfelt 3-minute welcome toast',
    'Suggest backup rain contingencies for the schedule',
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg h-full flex flex-col shadow-2xl border-l border-stone-200">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-display tracking-wide">Event Architect AI</h3>
              <p className="text-[11px] text-stone-400">Context: {event.title}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
            aria-label="Close assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-stone-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-stone-900 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold shadow-xs">
                  AI
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm space-y-2 shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-amber-600 text-white rounded-tr-none'
                    : 'bg-white text-stone-800 border border-stone-200 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed font-sans">{msg.text}</div>

                {/* Suggested One-Click Action */}
                {msg.suggestedAction && (
                  <div className="pt-2 border-t border-stone-100">
                    <button
                      onClick={() => onApplyAction(msg.suggestedAction!)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition-all shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-700" />
                      <span>{msg.suggestedAction.label}</span>
                    </button>
                  </div>
                )}

                <div
                  className={`text-[10px] text-right ${
                    msg.sender === 'user' ? 'text-amber-200' : 'text-stone-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-7 h-7 rounded-full bg-stone-900 text-amber-400 flex items-center justify-center flex-shrink-0 text-xs">
                AI
              </div>
              <div className="bg-white border border-stone-200 rounded-2xl p-3.5 flex items-center gap-2 text-xs text-stone-500 shadow-xs">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
                <span>Event Architect is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggested Prompts */}
        <div className="p-3 bg-stone-100/70 border-t border-stone-200 overflow-x-auto no-scrollbar flex items-center gap-2">
          {samplePrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 whitespace-nowrap transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-stone-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask for advice, budget adjustments, speech copy..."
              className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              aria-label="Send message"
              className="p-2.5 text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-40 rounded-xl transition-colors shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
