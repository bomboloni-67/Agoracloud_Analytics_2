import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import Login from './components/Login';
import AgoracloudEmbed from './components/AgoracloudEmbed';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [embedUrl, setEmbedUrl] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentLoadedTopicId, setCurrentLoadedTopicId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Define your topics here - these IDs should match your QuickSight Topic ARNs or IDs
  const availableTopics = [
    { id: 'wuNA6kLYLAeUrlsEHl1rBwww2n0e8qvG', name: 'Inventory by Item (Alpro)' },
    { id: 'cYDn1dRMCtQaRlvEDOWvEFijOLdh1d6Q', name: 'Sales by Item' }
  ];

  const API_GATEWAY_URL = "https://ugzwp0xwdh.execute-api.ap-southeast-1.amazonaws.com/test/get-url";

  const handleLogin = (user) => {
    setUsername(user);
    setIsLoggedIn(true);
  };

  const handleSend = async (question, selectedTopicId) => {
    console.log(`🚀 Sending: "${question}" for Topic: ${selectedTopicId}`);
    
    // 1. Immediately update the question so the UI reflects it
    setCurrentQuestion(question);

    // 2. Check if we need a fresh URL (Initial load OR Topic Switch)
    const isNewTopic = currentLoadedTopicId !== selectedTopicId;

    if (!embedUrl || isNewTopic) {
      console.log(isNewTopic ? "🔄 Topic switch detected. Fetching new session..." : "🌐 Initializing first session...");
      setIsLoading(true);
      setEmbedUrl(''); // Clear current embed to show loading spinner
      
      try {
        const token = localStorage.getItem('custom_jwt');
        
        // Pass the topicId to your Lambda via query string
        const res = await fetch(`${API_GATEWAY_URL}?topicId=${selectedTopicId}`, {
          method: 'GET',
          headers: { 
            'Authorization': token,
            'Content-Type': 'application/json' 
          }
        });
        
        const data = await res.json();
        
        if (res.ok) {
          const finalUrl = data.embed_url || data.embedUrl || data.EmbedUrl;
          if (finalUrl) {
            setEmbedUrl(finalUrl);
            setCurrentLoadedTopicId(selectedTopicId);
          }
        } else {
          console.error("❌ API Error:", data);
          alert(`Session Error: ${data.message || "Failed to load data engine"}`);
        }
      } catch (error) {
        console.error("🚨 Network Exception:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      // 3. Same topic? The AgoracloudEmbed useEffect will handle .setQuestion()
      console.log("⚡ Same topic active. Injecting question into current frame.");
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    /* FIXED VIEWPORT: 'fixed inset-0' and 'overflow-hidden' prevents all external scrolling */
    <div className="fixed inset-0 flex bg-[#020617] text-slate-100 selection:bg-indigo-500/30 overflow-hidden">
      
      {/* BACKGROUND GLOW */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <Sidebar username={username} signOut={() => {
        localStorage.removeItem('custom_jwt');
        setIsLoggedIn(false);
      }} />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="max-w-6xl mx-auto w-full h-full px-8 pt-6 pb-2 flex flex-col min-h-0">
            
            {/* LOADING STATE */}
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center animate-pulse">
                <div className="w-12 h-12 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Synchronizing Data Engine</p>
              </div>
            ) : embedUrl ? (
              /* REAL QUICKSIGHT VIEW */
              <div className="flex-1 flex flex-col min-h-0 animate-in fade-in duration-500">
                <div className="flex items-center justify-between mb-4 px-2 shrink-0">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Secure Session Active</span>
                   </div>
                   <div className="text-[10px] text-slate-500 italic max-w-[300px] truncate">
                     "{currentQuestion}"
                   </div>
                </div>
                <AgoracloudEmbed embedUrl={embedUrl} initialQuestion={currentQuestion} />
              </div>
            ) : (
              /* INITIAL WELCOME STATE */
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="group relative mb-8">
                  <div className="absolute inset-0 bg-indigo-500/20 blur-3xl group-hover:bg-indigo-500/40 transition-all duration-700"></div>
                  <div className="relative w-24 h-24 bg-slate-900 border border-slate-800 rounded-[2.5rem] flex items-center justify-center shadow-2xl">
                    <span className="text-4xl">💎</span>
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight mb-3">
                  Welcome, <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">{username}</span>
                </h1>
                <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed font-medium">
                  Select a data source below and ask your first question to begin.
                </p>
              </div>
            )}
            
          </div>
        </main>

        {/* FOOTER INPUT AREA: Locked to bottom with fixed spacing */}
        <footer className="px-6 py-6 shrink-0 relative z-20 bg-[#020617]">
          <div className="max-w-3xl mx-auto">
            <ChatPanel 
              onSend={handleSend} 
              topics={availableTopics} 
              activeTopicId={currentLoadedTopicId} 
            />
            <p className="text-right text-[9px] text-slate-700 tracking-widest uppercase font-bold mt-4">
              Powered by AgoraCloud Engine
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;