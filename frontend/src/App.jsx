import { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import AgoracloudEmbed from './components/AgoracloudEmbed';
import SuggestionBar from './components/SuggestionsBar';
import Settings from './components/Settings';

const TOPIC_CONFIGS = {
  'YDTZk9p3ROgBAIk1oeF2uMoBarE6eZvo': {
    categories: ['Sales', 'Inventory', 'Supplier', 'Department', 'Other'],
    rules: [
      { key: 'Sales', keywords: ['sale', 'revenue', 'sold', 'profit', 'profitable', 'gp','sales'] },
      { key: 'Inventory', keywords: ['stock', 'inventory', 'sku', 'on hand', 'availability','holding','hold'] },
      { key: 'Supplier', keywords: ['supplier', 'vendor', 'manufacturer'] },
      { key: 'Department', keywords: ['dept', 'department', 'category', 'division'] },
    ],
    defaultCategory: 'Other'
  },
  'DEFAULT': {
    categories: ['What', 'Why', 'Who', 'When', 'Other'],
    rules: [
      { key: 'What', keywords: ['what'] },
      { key: 'Why', keywords: ['why'] },
      { key: 'Who', keywords: ['who'] },
      { key: 'When', keywords: ['when', 'time', 'date', 'month', 'year'] },
    ],
    defaultCategory: 'Other'
  }
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [embedUrl, setEmbedUrl] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentLoadedId, setCurrentLoadedId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Ask Data'); 
  
  const dropdownRef = useRef(null);

  // Updated state to hold both the categories and the grouped questions
  const [suggestionData, setSuggestionData] = useState({ 
    keys: TOPIC_CONFIGS['DEFAULT'].categories,
    grouped: { What: [], Why: [], Who: [], When: [], Other: [] } 
  });

  const availableTopics = [
    { id: 'cYDn1dRMCtQaRlvEDOWvEFijOLdh1d6Q', name: 'Sales by Item', desc: 'Revenue & Volume metrics' },
    { id: 'YDTZk9p3ROgBAIk1oeF2uMoBarE6eZvo', name: 'Inventory by Item', desc: 'Stock levels & SKU health' },
  ];

  const availableDashboards = [
    { id: '1abefc0d-e34b-4323-b7a2-fdf06c8a10c3', name: 'RFM Analysis (DEMO)', desc: 'Recency, Frequency, Monetary Analysis' },
    { id: 'be7beb03-c131-4cec-a7dc-4fbd58dc03d4', name: 'Sales Performance (UC1)', desc: 'Sales Performaance Dashboard' }
  ];

  const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL;

  const categorizeQuestions = (rawQuestions, topicId) => {
    const config = TOPIC_CONFIGS[topicId] || TOPIC_CONFIGS['DEFAULT'];
        
    const grouped = {};
    config.categories.forEach(cat => { grouped[cat] = []; });

    rawQuestions.forEach((q) => {
      const lowerQ = typeof q === 'string' ? q.toLowerCase() : "";
      const matchedRule = config.rules.find(rule => 
        rule.keywords.some(keyword => lowerQ.includes(keyword))
      );

      // 3. The Fix: Ensure the key actually exists in 'grouped' before pushing
      const targetKey = (matchedRule && grouped[matchedRule.key]) 
        ? matchedRule.key 
        : config.defaultCategory;

      if (grouped[targetKey]) {
        grouped[targetKey].push(q);
      } else {
        // If even the defaultCategory is missing from the keys, initialize it on the fly
        grouped[targetKey] = [q];
      }
  });

  return { keys: Object.keys(grouped), grouped };
};

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setEmbedUrl('');
    setCurrentLoadedId('');
    setCurrentQuestion('');
    if (activeTab === 'Stories') {
      handleSend('', 'gallery');
    }
  }, [activeTab]);

  const handleLogin = (user) => {
    setUsername(user);
    setIsLoggedIn(true);
  };

  const handleSend = async (question, selectedId) => {
    const targetId = selectedId || currentLoadedId;

    if (question && targetId === currentLoadedId && activeTab === 'Ask Data') {
      setCurrentQuestion(question);
      return; 
    }

    setIsLoading(true);
    setIsDropdownOpen(false); 
    
    try {
      const token = localStorage.getItem('custom_jwt');
      const modeMap = { 'Dashboards': 'DASHBOARD', 'Stories': 'STORIES', 'Ask Data': 'Q' };
      const mode = modeMap[activeTab];
      
      const res = await fetch(`${API_GATEWAY_URL}?type=${mode}&id=${targetId || 'default'}`, {
        headers: { 'Authorization': token }
      });
      const data = await res.json();
      
      if (res.ok) {
        // --- REFINED FRONTEND CATEGORIZATION ---
        // data.suggestions is now a flat array of strings from the Lambda
        const processed = categorizeQuestions(data.suggestions || [], targetId);
        setSuggestionData(processed);
        
        setCurrentQuestion(question || ''); 
        setEmbedUrl(data.embed_url);
        setCurrentLoadedId(targetId); 
      }
    } catch (error) {
      console.error("🚨 API Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentList = activeTab === 'Dashboards' ? availableDashboards : availableTopics;
  const currentSelectionName = currentList.find(item => item.id === currentLoadedId)?.name 
    || (activeTab === 'Dashboards' ? "Select Dashboard" : "Select Topic");

  if (!isLoggedIn) return <Login onLogin={handleLogin} />;

  return (
    <div className="fixed inset-0 flex bg-[#020617] text-slate-100 overflow-hidden font-sans">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <Sidebar 
        username={username} 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        signOut={() => {
          localStorage.removeItem('custom_jwt');
          localStorage.removeItem('user_email');
          setIsLoggedIn(false);
        }} 
      />

      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="max-w-7xl mx-auto w-full h-full px-8 pt-2 pb-6 flex flex-col min-h-0">
            
            <div className="flex items-center justify-between mb-4">
              {activeTab === 'Dashboards' || activeTab === 'Ask Data' ? (
                <div className="shrink-0 relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="group flex items-center gap-4 px-5 py-3 bg-slate-900/40 border border-slate-800/60 rounded-2xl hover:border-indigo-500/40 transition-all duration-300 backdrop-blur-md shadow-xl"
                  >
                    <div className="flex flex-col items-start text-left">
                      <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-0.5">
                        {activeTab === 'Dashboards' ? ' Dashboard' : 'Topic'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-slate-100 tracking-tight">{currentSelectionName}</span>
                        <svg className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 w-72 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top">
                      <div className="py-2">
                        {currentList.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleSend('', item.id)}
                            className={`w-full flex items-center gap-4 px-5 py-4 transition-all hover:bg-indigo-500/5 text-left border-b border-slate-800/50 last:border-0 ${
                              currentLoadedId === item.id ? "bg-indigo-500/10" : ""
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentLoadedId === item.id ? "bg-indigo-500/20 text-white" : "bg-slate-800 text-slate-400"}`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={activeTab === 'Dashboards' ? "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" : "M13 10V3L4 14h7v7l9-11h-7z"} />
                              </svg>
                            </div>
                            <div className="flex flex-col">
                              <span className={`text-[11px] font-bold ${currentLoadedId === item.id ? "text-indigo-400" : "text-slate-200"}`}>{item.name}</span>
                              <span className="text-[9px] text-slate-500 uppercase tracking-wider">{item.desc}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col">
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {activeTab === 'Settings' ? 'Account Settings' : 'Data Stories'}
                  </h2>
                  <p className="text-slate-500 text-xs">
                    {activeTab === 'Settings' ? 'Manage your profile and security preferences' : 'AI-generated narratives and insights'}
                  </p>
                </div>
              )}
            </div>

            {/* SUGGESTION BAR - Using refined state and new categoryKeys prop */}
            {embedUrl && activeTab === 'Ask Data' && (
              <div className="shrink-0 z-30 mb-4">
                <SuggestionBar 
                  suggestions={suggestionData.grouped} 
                  categoryKeys={suggestionData.keys}
                  onSend={handleSend} 
                  activeTopicId={currentLoadedId} 
                />
              </div>
            )}

            <div className="flex-1 relative flex flex-col min-h-0 overflow-hidden">
              {isLoading && (
                <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-[#020617]/80 backdrop-blur-sm rounded-2xl">
                  <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-3"></div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-400 font-bold">Loading {activeTab}...</p>
                </div>
              )}

              {activeTab === 'Settings' ? (
                <Settings/>
              ) : embedUrl ? (
                <div className="flex-1 flex flex-col min-h-0 relative">
                  <AgoracloudEmbed 
                    embedUrl={embedUrl} 
                    activeTab={activeTab} 
                    initialQuestion={currentQuestion} 
                  />
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                  <div className="relative w-20 h-20 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center shadow-2xl mb-6">
                    <span className="text-4xl">
                      {activeTab === 'Dashboards' ? '📊' : activeTab === 'Stories' ? '📖' : '🚀'}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
                    {activeTab === 'Dashboards' ? 'Analytics Dashboards' : activeTab === 'Stories' ? 'Data Stories' : `Welcome, ${username}`}
                  </h1>
                  <p className="text-slate-500 text-xs max-w-xs mx-auto leading-relaxed">
                    {activeTab === 'Dashboards' 
                      ? 'Select a dashboard from the list above to visualize your data.' 
                      : activeTab === 'Stories'
                      ? 'Access shared narratives or create new AI-powered stories.'
                      : 'Select a data engine from the menu to start asking questions.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;