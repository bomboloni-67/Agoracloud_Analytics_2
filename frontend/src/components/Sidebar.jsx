import { useState } from 'react';
import { 
  Menu, 
  LayoutDashboard, 
  MessageSquare, 
  Settings, 
  LogOut, 
  UserCircle, 
  Sparkles,
  BookOpen,
  MonitorCloud
} from 'lucide-react';
import { TABS } from '../constants/appConstants';

// Added activeTab and setActiveTab to props
const Sidebar = ({ signOut, username, activeTab, setActiveTab, isLoading }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { name: TABS.DASHBOARDS, icon: <LayoutDashboard size={20} /> },
    { name: TABS.AiQ, icon: <MessageSquare size={20} /> },
    { name: TABS.WORKSPACE, icon: <MonitorCloud size={20} /> },
    { name: TABS.SETTINGS, icon: <Settings size={20} /> },
  ];

  const handleTabClick = (tabName) => {
    if (isLoading) return;
    setActiveTab(tabName);
  };
  
  return (
      <aside
        className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-xl z-20
        transition-[width] duration-500 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-[200px]'}`}
      >
      {/* BRANDING HEADER */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col items-center">
        <div className="flex items-center w-full justify-between mb-2">
          <div
              className={`
                flex items-center overflow-hidden
                ${isCollapsed ? 'justify-center w-full' : 'space-x-3'}
              `}
            >
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none flex-shrink-0">
              <Sparkles size={18} className="text-white" />
            </div>
            
            <div
              className={`
                overflow-hidden whitespace-nowrap transition-all duration-500
                ${isCollapsed
                  ? 'max-w-0 opacity-0 translate-x-2'
                  : 'max-w-[200px] opacity-100 translate-x-0'}
              `}
            >
              <h1 className="text-[12px] font-bold tracking-tight text-slate-800 dark:text-slate-100 uppercase leading-none">
                AiQ <span className="text-indigo-600 dark:text-indigo-400">Analytics</span>
              </h1>

              <p className="text-[9px] text-slate-500 font-medium uppercase tracking-widest mt-1">
                AI Engine
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`
              overflow-hidden
              hover:bg-slate-100 dark:hover:bg-slate-800
              rounded-lg text-slate-400
              transition-all duration-500
              ${isCollapsed
                ? 'w-0 opacity-0 pointer-events-none p-0'
                : 'w-8 opacity-100 p-1.5'}
            `}
          >
            <Menu size={18} />
          </button>
        </div>

        <button
          onClick={() => setIsCollapsed(false)}
          className={`
            mt-2 p-2 text-slate-400 hover:text-indigo-500
            transition-all duration-500
            ${isCollapsed
              ? 'opacity-100'
              : 'opacity-0 pointer-events-none h-0 overflow-hidden'}
          `}
        >
          <Menu size={20} />
        </button>
      </div>

      {/* NAVIGATION ITEMS */}
      <nav className="flex-1 mt-6 px-3 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.name}
            // This now triggers the useEffect in App.jsx
            onClick={() => handleTabClick(item.name)} 
            className={`w-full flex items-center p-3 rounded-xl transition-all group
              ${activeTab === item.name 
                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' 
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <div className={`${isCollapsed ? 'mx-auto' : 'mr-3'}`}>
              {item.icon}
            </div>
            <div
              className={`
                overflow-hidden whitespace-nowrap transition-all duration-500
                ${isCollapsed
                  ? 'max-w-0 opacity-0'
                  : 'max-w-[120px] opacity-100'}
              `}
            >
              <span className="font-medium text-sm">
                {item.name}
              </span>
            </div>
          </button>
        ))}
      </nav>

      {/* FOOTER: USER PROFILE & SIGN OUT */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <button className={`flex items-center w-full p-2 transition-all rounded-xl border group
          ${isCollapsed 
            ? 'justify-center border-transparent hover:bg-slate-100 dark:hover:bg-slate-800' 
            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 hover:border-indigo-300'}`}
        >
          <div className="flex items-center space-x-3 truncate">
            <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center text-indigo-600 transition-transform group-hover:scale-110">
              <UserCircle size={20} />
            </div>
            
            <div
              className={`
                overflow-hidden transition-all duration-500 text-left
                ${isCollapsed
                  ? 'max-w-0 opacity-0'
                  : 'max-w-[140px] opacity-100'}
              `}
            >
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-none">
                {username}
              </p>

              <p className="text-[10px] text-green-500 font-medium flex items-center mt-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                Online
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={signOut}
          className={`flex items-center w-full p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all
            ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={20} />
          <div
            className={`
              overflow-hidden whitespace-nowrap transition-all duration-500
              ${isCollapsed
                ? 'max-w-0 opacity-0'
                : 'max-w-[120px] opacity-100'}
            `}
          >
            <span className="ml-3 font-medium text-sm">Sign Out</span>
          </div>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;