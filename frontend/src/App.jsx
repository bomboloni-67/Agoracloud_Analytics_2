import { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import Login from './components/Login';
import AgoracloudEmbed from './components/AgoracloudEmbed';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [embedUrl, setEmbedUrl] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (user) => {
    setUsername(user);
    setIsLoggedIn(true);
  };

  const handleSend = async (question) => {
    setIsLoading(true);
    setCurrentQuestion(question);

    try {
      // Get the RS256 token from storage
      const token = localStorage.getItem('custom_jwt');
      
      const res = await fetch('http://localhost:4000/api/embed-url', {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        }
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setEmbedUrl(data.embedUrl);
      } else {
        alert("Session expired. Please log in again.");
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Embedding failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="h-screen flex bg-[#020617] text-slate-100 selection:bg-indigo-500/30">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <Sidebar username={username} signOut={() => {
        localStorage.removeItem('custom_jwt');
        setIsLoggedIn(false);
      }} />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        <main className="flex-1 overflow-hidden flex flex-col">
          <div className="max-w-6xl mx-auto w-full h-full px-8 py-6 flex flex-col">
            
            {/* LOADING STATE */}
            {isLoading && !embedUrl ? (
              <div className="flex-1 flex flex-col items-center justify-center animate-pulse">
                <div className="w-12 h-12 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-bold">Initializing Secure Session</p>
              </div>
            ) : embedUrl ? (
              /* REAL QUICKSIGHT VIEW */
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-4 px-2">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Live Data Engine</span>
                   </div>
                   <div className="text-[10px] text-slate-500 italic">" {currentQuestion} "</div>
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
                  Welcome back, <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">{username}</span>
                </h1>
                <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed font-medium">
                  Your data intelligence is ready. Describe the insights you need in plain English.
                </p>
              </div>
            )}
            
          </div>
        </main>

        {/* Footer Input Area */}
        <footer className="px-6 pb-10 pt-4 relative">
          <div className="max-w-3xl mx-auto">
            <ChatPanel onSend={handleSend} />
            <p className="text-center text-[10px] text-slate-600 mt-4 tracking-wide uppercase font-semibold">
              Powered by AgoraCloud AI • Secured with RS256
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;