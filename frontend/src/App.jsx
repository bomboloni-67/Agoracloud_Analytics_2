import { useState, useRef, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import AgoracloudEmbed from './components/AgoracloudEmbed';
import SuggestionBar from './components/SuggestionsBar';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [embedUrl, setEmbedUrl] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentLoadedTopicId, setCurrentLoadedTopicId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const [suggestions, setSuggestions] = useState({ 
    What: [], Why: [], Who: [], When: [], Other: [] 
  });

  const availableTopics = [
    { id: 'cYDn1dRMCtQaRlvEDOWvEFijOLdh1d6Q', name: 'Sales by Item', desc: 'Revenue & Volume metrics' },
    { id: 'wuNA6kLYLAeUrlsEHl1rBwww2n0e8qvG', name: 'Inventory by Item (Alpro)', desc: 'Stock levels & SKU health' },
  ];

  const API_GATEWAY_URL = "https://ugzwp0xwdh.execute-api.ap-southeast-1.amazonaws.com/test/get-url";

  // Persistent dropdown click-outside logic
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogin = (user) => {
    setUsername(user);
    setIsLoggedIn(true);
  };

  const handleSend = async (question, selectedTopicId) => {
    const isTopicSwitch = currentLoadedTopicId !== selectedTopicId;
    const needsInitialLoad = !embedUrl;

    if (needsInitialLoad || isTopicSwitch) {
      setIsLoading(true);
      setIsDropdownOpen(false); 
      try {
        const token = localStorage.getItem('custom_jwt');
        const res = await fetch(`${API_GATEWAY_URL}?topicId=${selectedTopicId}`, {
          headers: { 'Authorization': token }
        });
        const data = await res.json();
        
        if (res.ok) {
          setSuggestions(data.suggestions || { What: [], Why: [], Who: [], When: [], Other: [] });
          setCurrentQuestion(question || ''); 
          setEmbedUrl(data.embed_url || data.EmbedUrl);
          setCurrentLoadedTopicId(selectedTopicId); 
        }
      } catch (error) {
        console.error("🚨 API Error:", error);
      } finally {
        setIsLoading(false);
      }
    } else if (question) {
      setCurrentQuestion(''); 
      setTimeout(() => setCurrentQuestion(question), 10);
    }
  };

  const currentTopicName = availableTopics.find(t => t.id === currentLoadedTopicId)?.name || "Select Data Engine";

  if (!isLoggedIn) return <Login onLogin={handleLogin} />;

  return (
    <div className="fixed inset-0 flex bg-[#020617] text-slate-100 overflow-hidden font-sans">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <Sidebar username={username} signOut={() => {
        localStorage.removeItem('custom_jwt');
        setIsLoggedIn(false);
      }} />

      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="max-w-7xl mx-auto w-full h-full px-8 pt-2 pb-6 flex flex-col min-h-0">
            
            {/* --- SOURCE SWITCHER --- */}
            {/*Keep this outside the main visualization container to prevent re-renders of the iframe */}
            <div className="shrink-0 relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="group flex items-center gap-4 px-5 py-3 bg-slate-900/40 border border-slate-800/60 rounded-2xl hover:border-indigo-500/40 transition-all duration-300 backdrop-blur-md shadow-xl"
              >
                <div className="flex flex-col items-start text-left">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-0.5">Source</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-slate-100 tracking-tight">{currentTopicName}</span>
                    <svg className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* DROPDOWN MENU */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 w-72 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top">
                  <div className="py-2">
                    {availableTopics.map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() => handleSend('', topic.id)}
                        className={`w-full flex items-center gap-4 px-5 py-4 transition-all hover:bg-indigo-500/5 text-left border-b border-slate-800/50 last:border-0 ${
                          currentLoadedTopicId === topic.id ? "bg-indigo-500/10" : ""
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentLoadedTopicId === topic.id ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-400"}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-[11px] font-bold ${currentLoadedTopicId === topic.id ? "text-indigo-400" : "text-slate-200"}`}>{topic.name}</span>
                          <span className="text-[9px] text-slate-500 uppercase tracking-wider">{topic.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* --- SUGGESTION BAR --- */}
            {embedUrl && (
              <div className="shrink-0 z-30">
                <SuggestionBar 
                  suggestions={suggestions} 
                  onSend={handleSend} 
                  activeTopicId={currentLoadedTopicId} 
                />
              </div>
            )}

            {/* --- MAIN VISUALIZATION AREA --- */}
            <div className="flex-1 relative flex flex-col min-h-0 overflow-hidden">
              
              {isLoading && (
                <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-[#020617]/80 backdrop-blur-sm rounded-2xl">
                  <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-3"></div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-400 font-bold">Initializing {currentTopicName}</p>
                </div>
              )}

              {embedUrl ? (
                <div className="flex-1 flex flex-col min-h-0 relative">
                  <div className="flex items-center justify-between mb-2 px-2 shrink-0">
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Live Engine Session Active</span>
                     </div>
                  </div>
                  
                  <div key={currentLoadedTopicId} className="flex-1 w-full h-full relative z-10">
                    <AgoracloudEmbed 
                      embedUrl={embedUrl} 
                      initialQuestion={currentQuestion}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="relative w-20 h-20 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center shadow-2xl mb-6">
                    <span className="text-4xl">🚀</span>
                  </div>
                  <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Welcome, {username}</h1>
                  <p className="text-slate-500 text-xs max-w-xs mx-auto leading-relaxed">
                    Select an analytics engine from the menu above to begin.
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