import { useState } from 'react';
import { SendHorizonal, Sparkles, Command } from 'lucide-react';

const ChatPanel = ({ onSend }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    'What are the sales trends?',
    'Show me top products',
    'Compare Q1 vs Q2'
  ];

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="relative group">
        {/* Glow effect on focus */}
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-1000"></div>
        
        <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="flex items-center p-2">
            {/* Input Icon */}
            <div className="pl-3 pr-2 text-slate-400">
              <Sparkles size={18} />
            </div>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 bg-transparent px-2 py-3 outline-none text-slate-700 dark:text-slate-100 placeholder:text-slate-400 text-sm md:text-base"
              placeholder="Ask a question about your data..."
            />

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className={`p-2.5 rounded-xl transition-all flex items-center gap-2 
                ${input.trim() 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none hover:scale-105 active:scale-95' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}
            >
              <span className="hidden md:inline text-xs font-bold px-1">Send</span>
              <SendHorizonal size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Modernized Suggestions */}
      <div className="mt-4 flex flex-wrap items-center gap-2 px-1">
        <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-1">
          <Command size={12} className="mr-1" />
          Suggestions
        </div>
        {suggestions.map((suggestion, i) => (
          <button
            key={i}
            onClick={() => setInput(suggestion)}
            className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-full text-slate-600 dark:text-slate-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatPanel;