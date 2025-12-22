import React, { useState } from 'react';

export default function ChatPanel({ onSend, topics, activeTopicId }) {
  const [input, setInput] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(activeTopicId || topics[0]?.id);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    // We pass both the question and the selected topic up
    onSend(input, selectedTopic);
    setInput('');
  };

  return (
    <div className="flex flex-col gap-3 w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="relative group">
        {/* TOPIC DROPDOWN INSIDE PANEL */}
        <div className="flex items-center gap-2 mb-2">
          <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">
            Data Source:
          </label>
          <select 
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-300 text-[11px] rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer hover:border-slate-700"
          >
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
        </div>

       {/* INPUT BOX CONTAINER */}
        <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl transition-all duration-300 focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/10 overflow-hidden">
          <div className="relative flex items-center px-2">
            
            {/* Sparkles/Icon (Optional but matches your style) */}
            <div className="pl-3 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
            </div>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AgoraCloud AI..."
              /* CRITICAL CHANGES:
                1. Removed bg-slate-900/50 (Parent handles bg)
                2. Removed border-slate-800 (Parent handles border)
                3. Added bg-transparent and border-none
                4. Added focus:ring-0 to prevent default browser outline
              */
              className="flex-1 bg-transparent border-none text-slate-700 dark:text-slate-100 pl-3 pr-12 py-4 focus:ring-0 outline-none placeholder:text-slate-500 text-sm md:text-base"
            />

            <button
              type="submit"
              className="absolute right-3 p-2 text-indigo-500 hover:text-indigo-400 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}