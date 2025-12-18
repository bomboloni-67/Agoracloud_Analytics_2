import { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import ResponseCard from './components/ResponseCard';
import VisualizationPlaceholder from './components/VisualizationPlaceholder';
import Login from './components/Login';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDark, setIsDark] = useState(true); // Default to Dark Mode for the aesthetic

  const handleLogin = (user) => {
    setUsername(user);
    setIsLoggedIn(true);
  };

  const handleSend = async (question) => {
    setIsLoading(true);
    // Clearing responses to ensure only one visual/summary is shown at a time
    setResponses([]); 

    try {
      const res = await fetch('/api/qna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setResponses([{ question, ...data }]);
    } catch (error) {
      // Mock for testing/UI refinement
      setResponses([{ 
        question, 
        answer: `Mock generative answer for: "${question}". This is a placeholder for AWS Quicksight/Quicksuite Q&A response.`, 
        visualization: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'], data: [15, 25, 12, 45, 30] } 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => setIsDark(!isDark);

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className={`h-screen flex ${isDark ? 'dark' : ''} bg-[#020617] text-slate-100 transition-colors duration-500`}>
      {/* 1. Sidebar contains all Branding, Navigation, and User Profile */}
      <Sidebar username={username} signOut={() => setIsLoggedIn(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 2. Main Data Area (Header Removed for Full Screen View) */}
        <main className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
          {/* max-w-3xl for the 'Thin' look, px-12 for 'Gutter' space, py-8 for top/bottom breathing room */}
          <div className="max-w-3xl mx-auto w-full px-12 py-8 flex-1">
            
            {/* LOADING STATE */}
            {isLoading ? (
              <div className="h-[70vh] flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-500 animate-pulse tracking-wide">
                  Analyzing insights...
                </p>
              </div>
            ) : responses.length > 0 ? (
              /* RESULT VIEW: Summary + Visualization */
              responses.map((res, i) => (
                <section key={i} className="flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {/* Subtle User Query Pill */}
                  <div className="flex justify-end mb-2">
                    <div className="bg-slate-800/40 border border-slate-700/50 px-4 py-1.5 rounded-full text-[11px] text-slate-400">
                      {res.question}
                    </div>
                  </div>

                  {/* Refined ResponseCard (Ensure internal text-sm is used) */}
                  <ResponseCard response={res} />

                  {/* Compact Visualization Card */}
                  <div className="bg-[#0f172a]/40 border border-slate-800 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center space-x-2 mb-4 opacity-50">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Visual Analysis
                      </span>
                    </div>
                    <VisualizationPlaceholder data={res.visualization} />
                  </div>
                </section>
              ))
            ) : (
              /* INITIAL WELCOME STATE */
              <div className="h-[70vh] flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-indigo-500/10 rounded-[2.5rem] flex items-center justify-center mb-6 border border-indigo-500/20 shadow-inner">
                  <span className="text-3xl animate-pulse">✨</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
                  Hello, {username}
                </h1>
                <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">
                  I'm ready to help you analyze your data. Ask me a question to get started.
                </p>
              </div>
            )}
            
          </div>
        </main>

        {/* 3. Footer Input Area */}
        <footer className="px-6 pb-8 pt-2 bg-gradient-to-t from-[#020617] via-[#020617] to-transparent">
          <div className="max-w-3xl mx-auto">
            <ChatPanel onSend={handleSend} />
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;