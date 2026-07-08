import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession, signOut, signInWithRedirect } from 'aws-amplify/auth';

//Components imports
import Sidebar from './components/Sidebar';
import Embedding from './components/Embedding';
import SuggestionBar from './components/SuggestionsBar';
import DashboardGallery from './components/DashboardGallery';
import { PAGE_METADATA, TABS } from './constants/appConstants';
import { useQS } from './hooks/useQS';

function App() {
  // --- AUTHENTICATION STATE ---
  const { authStatus } = useAuthenticator(context => [context.user]);
  const isLoggedIn = authStatus === 'authenticated';
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState(TABS.TOPICS);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null); 
  const [userEmail, setUserEmail] = useState('');

  const timeoutRef = useRef(null);
  const IDLE_TIME = 30 * 60 * 1000; // 30 minutes
  
  const {
    isLoading, embedUrl, setEmbedUrl, embedType,
    currentQuestion, setCurrentQuestion,
    currentLoadedId, setCurrentLoadedId,
    availableTopics, availableDashboards,
    suggestionData, handleSend
  } = useQS(userEmail, activeTab);

  const resetAppState = () => {
    setActiveTab(TABS.TOPICS);
    setEmbedUrl('');
    setCurrentLoadedId('');
    setCurrentQuestion('');
    setIsDropdownOpen(false);
    setUserEmail('');
  };

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    resetAppState();
    await signOut();
  };

   const resetTimer = () => {
    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      handleSignOut();
    }, IDLE_TIME);
  };

  useEffect(() => {
    const events = [
      'mousedown',
      'keypress',
      'scroll',
      'touchstart'
    ];

    events.forEach(event =>
      window.addEventListener(event, resetTimer)
    );

    resetTimer();

    return () => {
      clearTimeout(timeoutRef.current);

      events.forEach(event =>
        window.removeEventListener(event, resetTimer)
      );
    };
  }, []);

  // Derived Values
  const displayUsername = useMemo(() => userEmail.match(/^[^@]+/)?.[0] || 'User', [userEmail]);

  /**
   * EFFECT: Identity Initialization
   * Resolves the user's email from the Cognito token and triggers initial data discovery.
   */
  useEffect(() => {
    if (isLoggedIn) {
      const initializeUser = async () => {
        try {
          const session = await fetchAuthSession();
          const email = session.tokens?.idToken?.payload?.email;
          setIsLoggingOut(false); 
          console.log("Email found:", email);
          if (email) {
            setUserEmail(email);
          }
        } catch (err) {
          console.error("Failed to initialize user identity", err);
        }
      };

      initializeUser();
    }
    console.log("isLoggedIn changed:", isLoggedIn);
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) {
      console.log("SESSION RESET");

      resetAppState();
    }
  }, [isLoggedIn]);
    
  /**
   * EFFECT: Managed UI Redirect
   * Automatically redirects unauthenticated users to the Hosted UI login page.
   */
  useEffect(() => {
    if (authStatus === 'unauthenticated' && !isLoggingOut) {
      signInWithRedirect();
    }
  }, [authStatus, isLoggingOut]);

  /**
   * EFFECT: Click Outside Handler
   * Closes the dropdown menus when a user clicks anywhere outside the ref area.
   */
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }

    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /**
   * EFFECT: Closes dropdown when loading new content
   * Ensures the dropdown doesn't remain open when the user initiates a new selection.
   */
  useEffect(() => {
    if (isLoading) {
      setIsDropdownOpen(false);
    }
  }, [isLoading]);


  /**
   * EFFECT: State Cleanup
   * Resets local view state immediately when the tab changes to prevent 
   * "ghosting" (seeing old data while new data loads).
   */
  useEffect(() => {
    setEmbedUrl('');
    setCurrentLoadedId('');
    setCurrentQuestion('');
  }, [activeTab, setEmbedUrl, setCurrentLoadedId, setCurrentQuestion]);

  /**
   * EFFECT: Auto-Loader
   * Handles the initial data fetch for specific tabs.
   */
  useEffect(() => {
    // Guard: Only auto-load if we have user identity and aren't already loading
    console.log("=== AUTO LOADER ===");
    console.log("isLoggedIn:", isLoggedIn);
    console.log("userEmail:", userEmail);
    console.log("activeTab:", activeTab);
    console.log("availableTopics:", availableTopics.length);
    console.log("embedUrl:", embedUrl);
    if (!isLoggedIn || !userEmail) {
      console.warn("AUTO LOADER EXIT: Missing login/email");
      return;
    }


    // Don't auto-load "TOPICS" until we have topics
    if (
      activeTab === TABS.TOPICS &&
      availableTopics.length === 0
    ) {
      console.warn("AUTO LOADER EXIT: No topics");
      return;
    }

    const performAutoLoad = async () => {
      if (activeTab === TABS.STORIES) {
        handleSend('', 'gallery');
      } else if (activeTab === TABS.TOPICS) {
        // Use availableTopics from the hook to decide what to load
        const targetId = availableTopics[0].id;
        console.log("AUTOLOADER FIRED");
        console.log("availableTopics", availableTopics);
        handleSend('', targetId);
      }
    };

    performAutoLoad();

  }, [activeTab, isLoggedIn, userEmail, availableTopics.length]);

  const currentList = useMemo(() => {
    const sourceList =
      activeTab === TABS.DASHBOARDS
        ? availableDashboards
        : availableTopics;

    const sortedList = [...sourceList].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    if (!currentLoadedId) {
      return sortedList;
    }

    const selectedItem = sortedList.find(
      item => item.id === currentLoadedId
    );

    if (!selectedItem) {
      return sortedList;
    }

    return [
      selectedItem,
      ...sortedList.filter(item => item.id !== currentLoadedId)
    ];
  }, [
    activeTab,
    availableDashboards,
    availableTopics,
    currentLoadedId
  ]);

  const currentSelectionName = currentList.find(item => item.id === currentLoadedId)?.name || ' ';


    /**
   * View Resolver: Content Body
   * Logic extracted from the return statement to improve scannability.
   * This determines which primary UI module to display based on app state.
   */
  const renderContentBody = () => {
    console.log("RENDER STATE", {
      isLoading,
      embedUrl,
      availableTopics: availableTopics.length,
      activeTab
    });

    // 1. Global Loading State
    if (isLoggedIn && isLoading) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <h1 className="text-xl font-bold text-white mb-2">
            Loading...
          </h1>
          <p className="text-slate-500 text-xs">
            Please wait while we load your content.
          </p>
        </div>
      );
    }

    // 2. Dashboard Gallery View
    if (activeTab === TABS.DASHBOARDS) {
      if (!embedUrl || embedType !== TABS.DASHBOARDS) {
        return (
          <DashboardGallery
            dashboards={availableDashboards}
            handleSend={handleSend}
          />
        );
      }
    }

    // 3. Embedded Asset View
    if (embedUrl && embedType === activeTab) {
      return (
        <div className="flex-1 flex flex-col min-h-0 relative">
          <Embedding
            key={currentLoadedId}
            embedUrl={embedUrl}
            activeTab={activeTab}
            initialQuestion={currentQuestion}
          />
        </div>
      );
    }

    // 4. Prevent "Work in Progress" flash while Topics are available
    if (
      activeTab === TABS.TOPICS &&
      availableTopics.length > 0
    ) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-3"></div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-400 font-bold">
            Loading...
          </p>
        </div>
      );
    }

    // 5. Final Fallback State
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 opacity-50">
        <h1 className="text-xl font-bold text-white mb-2">
          Work in Progress
        </h1>
        <p className="text-slate-500 text-xs">
          Please try other features.
        </p>
      </div>
    );
  };

  /**
   * View Resolver: Header
   * Manages the transition between the Asset Selector (Dropdown) 
   * and the static page titles/descriptions.
   */
  const renderHeader = () => {
    const isAssetView = (
      (activeTab === TABS.TOPICS && availableTopics.length > 0 && embedUrl) || 
      (activeTab === TABS.DASHBOARDS && embedUrl && availableDashboards.length > 0 && embedType === TABS.DASHBOARDS)
    ) && !isLoading;

    if (isAssetView) {
      return (
        /* Added flex and items-center to align button and dropdown */
        <div className="flex items-center gap-3 shrink-0 relative">
          
          {/* NEW: Back Button moved here */}
          {activeTab === TABS.DASHBOARDS && (
            <button 
              onClick={() => { setEmbedUrl(''); setCurrentLoadedId(''); }}
              className="gap-4 px-6 py-4 bg-slate-900/60 hover:bg-indigo-600/40 border border-slate-800 rounded-2xl text-[10px] font-bold text-white transition-all backdrop-blur-md"
            >
               <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="w-6 h-6 text-slate-400 group-hover:text-indigo-400 transition-colors" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          <div ref={dropdownRef} className="relative">
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

            {/* Dropdown Menu Portal remains the same */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 w-72 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl z-[100] overflow-hidden">
                <div className="py-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                  {currentList.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSend('', item.id)}
                      className={`w-full flex items-center gap-4 px-5 py-4 transition-all hover:bg-indigo-500/5 text-left border-b border-slate-800/50 last:border-0 ${currentLoadedId === item.id ? "bg-indigo-500/10" : ""}`}
                    >
                      <div className="flex flex-col">
                        <span className={`text-[11px] font-bold ${currentLoadedId === item.id ? "text-indigo-400" : "text-slate-200"}`}>{item.name}</span>
                        {/* <span className="text-[9px] text-slate-500 truncate">{item.id}</span> */}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Fallback: Standard Page Titles
    const content = PAGE_METADATA[activeTab] || PAGE_METADATA[TABS.TOPICS];

    return (
      <div className="flex flex-col">
        <h2 className="text-xl font-bold text-white tracking-tight">
          {content.h2}
        </h2>
        <p className="text-slate-500 text-xs">
          {content.p}
        </p>
      </div>
    );
  };

  // --- RENDER: LOGIN REDIRECT ---
  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#020617]">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    /**
     * LAYER 0: APP CONTAINER
     * Main viewport wrapper with global background and ambient lighting effect.
     */
    <div className="fixed inset-0 flex bg-[#020617] text-slate-100 overflow-hidden font-sans">
      {/* Decorative ambient glow background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/**
       * LAYER 1: NAVIGATION SIDEBAR
       * Handles global tab switching and user authentication controls.
       */}
      <Sidebar 
        username={displayUsername || 'User'} 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        signOut={handleSignOut} 
        isLoading={isLoading} 
      />

      {/**
       * LAYER 2: MAIN CONTENT AREA
       * A flex-column layout that houses the Header, Suggestion Bar, and Content Body.
       */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <main className="flex-1 flex flex-col min-h-0">
          <div className="max-w-full mx-auto w-full h-full px-8 pt-2 pb-6 flex flex-col min-h-0">
            
            {/* --- SECTION: DYNAMIC HEADER --- 
                Renders either a Topic Selector Dropdown or Page Title depending on context.
            */}
            <div className="flex items-center justify-between mb-4">
              {renderHeader()}
            </div>

            {/* --- SECTION: SUGGESTION DISCOVERY --- 
                Contextual prompt helper for the 'TOPICS' (Q) experience.
            */}
            {activeTab === TABS.TOPICS && embedUrl && !isLoading && (
              <div className="shrink-0 z-30 mb-4">
                <SuggestionBar 
                  suggestions={suggestionData.grouped} 
                  categoryKeys={suggestionData.keys}
                  handleSend={handleSend} 
                  activeTopicId={currentLoadedId} 
                />
              </div>
            )}

            {/* --- SECTION: CONTENT BODY --- 
                The core engine of the UI. Dynamically switches between:
                1. Loading State Overlay
                2. Dashboard Gallery (Discovery)
                3. QuickSight Embedded Frame (Active Insight)
                4. Default Empty State
            */}
            <div className="flex-1 relative flex flex-col min-h-0 overflow-hidden">
              
              {/* Global Loading Spinner Overlay */}
              {isLoading && (
                <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-[#020617]/80 backdrop-blur-sm rounded-2xl">
                  <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-3"></div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-400 font-bold">Loading...</p>
                </div>
              )}
              {/* Render the main content based on current state */}
              {renderContentBody()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;