'use client';

import { useState } from 'react';
import { useChat } from 'ai/react';
import { Radio, Send, X, AlertCircle } from 'lucide-react';

export default function AIAssistant({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [error, setError] = useState<string | null>(null);
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/perplexity/chat',
    onError: (error) => {
      console.error('Chat error:', error);
      setError('Failed to get a response. Please try again.');
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    handleSubmit(e);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-slate-900 border-l border-slate-700 shadow-xl flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Radio className="h-5 w-5 text-emerald-500" />
          <h2 className="text-lg font-semibold text-white">Sonar Pro</h2>
          <span className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-full">AI Trading Assistant</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="h-5 w-5 text-slate-400" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        {messages.length === 0 && (
          <div className="text-center text-slate-400 py-8">
            <Radio className="h-12 w-12 mx-auto mb-4 text-emerald-500 opacity-50" />
            <p className="text-sm">Hi! I&apos;m Sonar Pro, your AI trading assistant. Ask me about market analysis, trading strategies, or technical indicators.</p>
            <div className="mt-4 grid grid-cols-2 gap-2 max-w-xs mx-auto">
              <button
                onClick={() => handleInputChange({ target: { value: "What&apos;s RSI and how do I use it?" } } as any)}
                className="text-xs p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
              >
                Explain RSI
              </button>
              <button
                onClick={() => handleInputChange({ target: { value: "How to read candlestick patterns?" } } as any)}
                className="text-xs p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
              >
                Candlestick Patterns
              </button>
              <button
                onClick={() => handleInputChange({ target: { value: "What&apos;s a good risk management strategy?" } } as any)}
                className="text-xs p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
              >
                Risk Management
              </button>
              <button
                onClick={() => handleInputChange({ target: { value: "Explain moving averages" } } as any)}
                className="text-xs p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
              >
                Moving Averages
              </button>
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'assistant' ? 'justify-start' : 'justify-end'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'assistant'
                  ? 'bg-slate-800 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg px-4 py-2 bg-slate-800 text-white">
              <div className="flex items-center gap-2">
                <div className="animate-pulse">Analyzing...</div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="p-4 border-t border-slate-700">
        <div className="relative">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about trading, analysis, or market data..."
            className="w-full pl-4 pr-10 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-slate-400"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4 text-emerald-500" />
          </button>
        </div>
      </form>
    </div>
  );
} 