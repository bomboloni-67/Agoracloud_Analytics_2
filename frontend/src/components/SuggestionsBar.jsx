import React, { useState } from 'react';

const CATEGORIES = ['What', 'Why', 'Who', 'When', 'Other'];

const SuggestionBar = ({ suggestions, onSend, activeTopicId }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);

  const handleCategoryClick = (category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto gap-4">
      
      {/* 1. CENTERED CATEGORY SELECTOR */}
      <div className="flex flex-wrap justify-center gap-2 px-4">
        {CATEGORIES.map((category) => {
          const hasQuestions = (suggestions[category] || []).length > 0;
          const isActive = expandedCategory === category;

          return (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={`px-5 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-300 border ${
                isActive
                  ? "bg-indigo-600 border-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] scale-105"
                  : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-500 hover:text-slate-200"
              } ${!hasQuestions ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
              disabled={!hasQuestions}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* 2. VERTICAL SCROLLABLE QUESTIONS AREA */}
      <div className="w-full relative px-2">
        {expandedCategory && (
          <div 
            className="w-full max-w-2xl mx-auto max-h-[160px] overflow-y-auto pr-2 custom-scrollbar animate-in fade-in zoom-in-95 duration-300"
          >
            <div className="flex flex-col gap-2 pb-4">
              {(suggestions[expandedCategory] || []).map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onSend(q, activeTopicId);
                    setExpandedCategory(null);
                  }}
                  className="w-full group flex items-center gap-3 px-4 py-3 bg-slate-900/40 border border-slate-800/80 rounded-xl hover:bg-indigo-500/10 hover:border-indigo-500/40 transition-all text-left"
                >
                  <span className="flex-shrink-0 text-indigo-500 group-hover:animate-pulse">✨</span>
                  <span className="text-[11px] text-slate-300 group-hover:text-white font-medium leading-relaxed">
                    {q}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CSS for the scrollable area - add this to your global index.css or a style tag */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4f46e5;
        }
      `}</style>
    </div>
  );
};

export default SuggestionBar;