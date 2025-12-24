import { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import AgoracloudEmbed from './components/AgoracloudEmbed';
import SuggestionBar from './components/SuggestionsBar';
import Settings from './components/Settings';

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
  const [suggestions, setSuggestions] = useState({ 
    What: [], Why: [], Who: [], When: [], Other: [] 
  });

  // Hard coded topics and dashboard ids
  const availableTopics = [
    { 
      id: 'cYDn1dRMCtQaRlvEDOWvEFijOLdh1d6Q', 
      name: 'Sales by Item', 
      desc: 'Revenue & Volume metrics' 
    },
    { 
      id: 'wuNA6kLYLAeUrlsEHl1rBwww2n0e8qvG', 
      name: 'Inventory by Item (Alpro)', 
      desc: 'Stock levels & SKU health' 
    },
  ];

  const availableDashboards = [
    { 
      id: '1abefc0d-e34b-4323-b7a2-fdf06c8a10c3',
      name: 'RFM Analysis (DEMO)',
      desc: 'Recency, Frequency, Monetary Analysis'
    }
  ];

  const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL;

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
  }, [activeTab]);

  const handleLogin = (user) => {
    setUsername(user);
    setIsLoggedIn(true);
  };

  /**
   * handleSend handles both loading new sources and sending questions.
   */
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
      const mode = activeTab === 'Dashboards' ? 'DASHBOARD' : 'Q';
      
      const res = await fetch(`${API_GATEWAY_URL}?type=${mode}&id=${targetId}`, {
        headers: { 'Authorization': token }
      });
      const data = await res.json();
      
      if (res.ok) {
        setSuggestions(data.suggestions || { What: [], Why: [], Who: [], When: [], Other: [] });
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
    || (activeTab === 'Dashboards' ? "Select Dashboard" : "Select Data Engine");

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
            
            {/* TOP BAR */}
            <div className="flex items-center justify-between mb-4">
              {activeTab !== 'Settings' ? (
                <div className="shrink-0 relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="group flex items-center gap-4 px-5 py-3 bg-slate-900/40 border border-slate-800/60 rounded-2xl hover:border-indigo-500/40 transition-all duration-300 backdrop-blur-md shadow-xl"
                  >
                    <div className="flex flex-col items-start text-left">
                      <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-0.5">
                        {activeTab === 'Dashboards' ? 'QuickSight Dashboard' : 'Ask Data Topic'}
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
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentLoadedId === item.id ? "bg-indigo-50 text-white" : "bg-slate-800 text-slate-400"}`}>
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
                  <h2 className="text-xl font-bold text-white tracking-tight">Account Settings</h2>
                  <p className="text-slate-500 text-xs">Manage your profile and security preferences</p>
                </div>
              )}
            </div>

            {/* SUGGESTION BAR */}
            {embedUrl && activeTab === 'Ask Data' && (
              <div className="shrink-0 z-30 mb-4">
                <SuggestionBar 
                  suggestions={suggestions} 
                  onSend={handleSend} 
                  activeTopicId={currentLoadedId} 
                />
              </div>
            )}

            {/* MAIN CONTENT AREA */}
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
                    <span className="text-4xl">{activeTab === 'Dashboards' ? '📊' : '🚀'}</span>
                  </div>
                  <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
                    {activeTab === 'Dashboards' ? 'Analytics Dashboards' : `Welcome, ${username}`}
                  </h1>
                  <p className="text-slate-500 text-xs max-w-xs mx-auto leading-relaxed">
                    {activeTab === 'Dashboards' 
                      ? 'Select a dashboard from the list above to visualize your data.' 
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