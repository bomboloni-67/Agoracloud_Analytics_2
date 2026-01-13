import { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import AgoracloudEmbed from './components/AgoracloudEmbed';
import SuggestionBar from './components/SuggestionsBar';
import Settings from './components/Settings';
import DashboardGallery from './components/DashboardGallery';

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
  const [availableTopics, setAvailableTopics] = useState([]);
  const [availableDashboards, setAvailableDashboards] = useState([]);
  
  const dropdownRef = useRef(null);
  const [suggestionData, setSuggestionData] = useState({ 
    keys: TOPIC_CONFIGS['DEFAULT'].categories,
    grouped: { What: [], Why: [], Who: [], When: [], Other: [] } 
  });

  const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL;
  const API_MONGODB_URL = import.meta.env.VITE_API_MONGODB;

  // --- HELPER: CATEGORIZATION ---
  const categorizeQuestions = (rawQuestions, topicId) => {
    const config = TOPIC_CONFIGS[topicId] || TOPIC_CONFIGS['DEFAULT'];
    const grouped = {};
    config.categories.forEach(cat => { grouped[cat] = []; });

    rawQuestions.forEach((q) => {
      const lowerQ = typeof q === 'string' ? q.toLowerCase() : "";
      const matchedRule = config.rules.find(rule => 
        rule.keywords.some(keyword => lowerQ.includes(keyword))
      );
      const targetKey = (matchedRule && grouped[matchedRule.key]) 
        ? matchedRule.key 
        : config.defaultCategory;
      if (grouped[targetKey]) grouped[targetKey].push(q);
    });
    return { keys: Object.keys(grouped), grouped };
  };

  // --- EFFECT: DISCOVERY ON LOGIN ---
  useEffect(() => {
    if (isLoggedIn) {
      // Fetch initial lists for both modes
      fetchDiscoveryData('Q');
      fetchDiscoveryData('DASHBOARD');
    }
  }, [isLoggedIn]);

  const fetchDiscoveryData = async (mode) => {
    try {
      const token = localStorage.getItem('custom_jwt');
      const res = await fetch(`${API_GATEWAY_URL}?type=${mode}&id=default`, {
        headers: { 'Authorization': token }
      });
      const data = await res.json();
      if (res.ok) {
        if (mode === 'DASHBOARD' && data.available_dashboards) setAvailableDashboards(data.available_dashboards);
        if (mode === 'Q' && data.available_topics) setAvailableTopics(data.available_topics);
      }
    } catch (error) {
      console.error(`🚨 Discovery Error (${mode}):`, error);
    }
  };

  // --- EFFECT: CLICK OUTSIDE DROPDOWN ---
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- EFFECT: TAB SWITCHING ---
  useEffect(() => {
    setEmbedUrl('');
    setCurrentLoadedId('');
    setCurrentQuestion('');
    
    if (isLoggedIn) {
      if (activeTab === 'Dashboards') return;
      
      if (activeTab === 'Stories') {
        handleSend('', 'gallery');
      } else if (activeTab === 'Ask Data') {
        if (availableTopics.length > 0) {
          handleSend('', availableTopics[0].id);
        } else {
          handleSend('', 'default');
        }
      }
    }
  }, [activeTab, isLoggedIn]);

  // --- HANDLERS ---
  const handleLogin = (user) => {
    setUsername(user);
    setIsLoggedIn(true);
  };

  const handleSend = async (question, selectedId) => {
    const isDiscovery = selectedId === 'default' || (!selectedId && !currentLoadedId);
    const targetId = selectedId || currentLoadedId || 'default';

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
      
      const res = await fetch(`${API_GATEWAY_URL}?type=${mode}&id=${targetId}`, {
        headers: { 'Authorization': token }
      });
      
      let data = await res.json();
      
      if (res.ok) {
        if (data.available_dashboards) setAvailableDashboards(data.available_dashboards);
        if (data.available_topics) setAvailableTopics(data.available_topics);
        
        let finalId = targetId;
        let finalEmbedUrl = data.embed_url;

        // Auto-load 'Ask Data' discovery
        if (isDiscovery && activeTab === 'Ask Data') {
          const newList = data.available_topics;
          if (newList && newList.length > 0) {
            finalId = newList[0].id;
            const autoLoadRes = await fetch(`${API_GATEWAY_URL}?type=${mode}&id=${finalId}`, {
              headers: { 'Authorization': token }
            });
            const autoLoadData = await autoLoadRes.json();
            finalEmbedUrl = autoLoadData.embed_url;
            data = autoLoadData;
          }
        }

        const processed = categorizeQuestions(data.suggestions || [], finalId);
        setSuggestionData(processed);
        setCurrentQuestion(question || ''); 
        setEmbedUrl(finalEmbedUrl);
        if (finalId && finalId !== 'default') setCurrentLoadedId(finalId);
      }
    } catch (error) {
      console.error("🚨 API Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentList = activeTab === 'Dashboards' ? availableDashboards : availableTopics;
  const currentSelectionName = currentList.find(item => item.id === currentLoadedId)?.name || "Select Topic";

  if (!isLoggedIn) return <Login onLogin={handleLogin} apiUrl={API_MONGODB_URL} />;

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

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <main className="flex-1 flex flex-col min-h-0">
          <div className="max-w-full mx-auto w-full h-full px-8 pt-2 pb-6 flex flex-col min-h-0">
            
            {/* Header Area */}
            <div className="flex items-center justify-between mb-4">
              {(activeTab === 'Ask Data' || (activeTab === 'Dashboards' && embedUrl)) ? (
                <div className="shrink-0 relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="group flex items-center gap-4 px-5 py-3 bg-slate-900/40 border border-slate-800/60 rounded-2xl hover:border-indigo-500/40 transition-all duration-300 backdrop-blur-md shadow-xl"
                  >
                    <div className="flex flex-col items-start text-left">
                      <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-0.5">
                        {activeTab === 'Dashboards' ? 'Dashboard' : 'Topic'}
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
                    <div className="absolute top-full left-0 w-72 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      <div className="py-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {currentList.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleSend('', item.id)}
                            className={`w-full flex items-center gap-4 px-5 py-4 transition-all hover:bg-indigo-500/5 text-left border-b border-slate-800/50 last:border-0 ${currentLoadedId === item.id ? "bg-indigo-500/10" : ""}`}
                          >
                            <div className="flex flex-col">
                              <span className={`text-[11px] font-bold ${currentLoadedId === item.id ? "text-indigo-400" : "text-slate-200"}`}>{item.name}</span>
                              <span className="text-[9px] text-slate-500 truncate">{item.id}</span>
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
                    {activeTab === 'Dashboards' ? 'Intelligence Hub' : activeTab === 'Settings' ? 'Account Settings' : 'Data Stories'}
                  </h2>
                  <p className="text-slate-500 text-xs">
                    {activeTab === 'Dashboards' 
                      ? 'Select a specialized visualization card to begin' 
                      : activeTab === 'Settings' 
                        ? 'Manage your profile and security preferences' 
                        : 'Create exciting stories from your data insights'}
                  </p>
                </div>
              )}
            </div>

            {/* SUGGESTION BAR - Only visible in Ask Data when a topic is loaded */}
            {activeTab === 'Ask Data' && embedUrl && (
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
                  <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-400 font-bold">Loading...</p>
                </div>
              )}

              {activeTab === 'Settings' ? (
                <Settings apiUrl={API_MONGODB_URL}/>
              ) : activeTab === 'Dashboards' && !embedUrl ? (
                <DashboardGallery dashboards={availableDashboards} onSelect={handleSend} />
              ) : embedUrl ? (
                <div className="flex-1 flex flex-col min-h-0 relative">
                  {/* Back to Gallery UI for Dashboards */}
                  {activeTab === 'Dashboards' && (
                    <button 
                      onClick={() => { setEmbedUrl(''); setCurrentLoadedId(''); }}
                      className="absolute top-2 left-4 z-50 px-4 py-2 bg-slate-900/90 hover:bg-indigo-600 border border-slate-700 rounded-xl text-[10px] font-bold text-white transition-all shadow-2xl backdrop-blur-md"
                    >
                      ← Back to Gallery
                    </button>
                  )}
                  <AgoracloudEmbed embedUrl={embedUrl} activeTab={activeTab} initialQuestion={currentQuestion} />
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-4 opacity-50">
                  <h1 className="text-xl font-bold text-white mb-2">Ready to explore?</h1>
                  <p className="text-slate-500 text-xs">Select a data engine to start.</p>
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