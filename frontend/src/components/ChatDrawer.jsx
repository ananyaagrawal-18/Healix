import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  ArrowRight
} from 'lucide-react';

export default function ChatDrawer({
  isOpen,
  onClose,
  onSendMessage,
  messages = [],
  isLoading,
  selectedWorkflow
}) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input, selectedWorkflow?.id);
    setInput('');
  };

  const handleSuggestionClick = (text) => {
    onSendMessage(text, selectedWorkflow?.id);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[460px] bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 z-50 flex flex-col animate-in slide-in-from-right duration-200 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Drawer Header */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/95 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Healix AI Engineer
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Active Context: {selectedWorkflow?.name || 'All Monitored Workflows'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="py-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-slate-800 dark:text-white text-sm">
              How can I assist you with your pipelines?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
              Ask me general questions, investigate failures, explain root causes, or guide self-healing actions.
            </p>

            {/* Quick prompts */}
            <div className="mt-5 space-y-2 text-left">
              {[
                "💡 What is self-healing automation in plain English?",
                "🧩 What is schema drift and how does Healix fix it?",
                `🔍 Why did ${selectedWorkflow?.name || 'Customer Data Sync'} fail?`,
                "⚡ What causes HTTP 429 rate limit errors?",
                "🛡️ Give me a fleet health summary of all workflows."
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-emerald-500/70 dark:hover:border-emerald-500/50 hover:bg-emerald-50/40 dark:hover:bg-slate-850 text-xs text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-between group shadow-2xs"
                >
                  <span className="truncate">{suggestion}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={index}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                
                <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  isUser 
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white rounded-br-xs' 
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-bl-xs'
                }`}>
                  <div className="whitespace-pre-wrap font-sans">
                    {msg.text}
                  </div>

                  {msg.source && (
                    <div className="mt-2 pt-1.5 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                      <Sparkles className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Healix Autonomous Engine</span>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce delay-100" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce delay-200" />
              <span className="ml-1 text-[11px]">Healix is analyzing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Drawer Input Form */}
      <form onSubmit={handleSubmit} className="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2 focus-within:border-emerald-500 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask Healix about ${selectedWorkflow?.name || 'workflows'}...`}
            className="flex-1 bg-transparent text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-1.5 rounded-lg bg-slate-900 dark:bg-emerald-600 text-white hover:bg-slate-800 dark:hover:bg-emerald-500 disabled:opacity-30 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
