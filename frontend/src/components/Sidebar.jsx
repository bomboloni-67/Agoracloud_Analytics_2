import { useState } from 'react';
import { 
  Menu, 
  LayoutDashboard, 
  MessageSquare, 
  Settings, 
  LogOut, 
  UserCircle, 
  Sparkles 
} from 'lucide-react';

// Added activeTab and setActiveTab to props
const Sidebar = ({ signOut, username, activeTab, setActiveTab }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { name: 'Ask Data', icon: <MessageSquare size={20} /> },
    { name: 'Dashboards', icon: <LayoutDashboard size={20} /> },
    { name: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside 
      className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col shadow-xl z-20
      ${isCollapsed ? 'w-20' : 'w-64'}`}
    >
      {/* BRANDING HEADER */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col items-center">
        <div className={`flex items-center w-full ${isCollapsed ? 'justify-center' : 'justify-between'} mb-2`}>
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none flex-shrink-0">
              <Sparkles size={18} className="text-white" />
            </div>
            
            {!isCollapsed && (
              <div className="animate-in fade-in duration-300">
                <h1 className="text-[12px] font-bold tracking-tight text-slate-800 dark:text-slate-100 uppercase leading-none">
                  AgoraCloud <span className="text-indigo-600 dark:text-indigo-400">Analytics</span>
                </h1>
                <p className="text-[9px] text-slate-500 font-medium uppercase tracking-widest mt-1">
                  AI Engine
                </p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button 
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400"
            >
              <Menu size={18} />
            </button>
          )}
        </div>

        {isCollapsed && (
          <button 
            onClick={() => setIsCollapsed(false)}
            className="mt-2 p-2 text-slate-400 hover:text-indigo-500 transition-colors"
          >
            <Menu size={20} />
          </button>
        )}
      </div>

      {/* NAVIGATION ITEMS */}
      <nav className="flex-1 mt-6 px-3 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.name}
            // This now triggers the useEffect in App.jsx
            onClick={() => setActiveTab(item.name)} 
            className={`w-full flex items-center p-3 rounded-xl transition-all group
              ${activeTab === item.name 
                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' 
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <div className={`${isCollapsed ? 'mx-auto' : 'mr-3'}`}>
              {item.icon}
            </div>
            {!isCollapsed && <span className="font-medium text-sm">{item.name}</span>}
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
            
            {!isCollapsed && (
              <div className="truncate text-left">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-none">
                  {username}
                </p>
                <p className="text-[10px] text-green-500 font-medium flex items-center mt-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                  Online
                </p>
              </div>
            )}
          </div>
        </button>

        <button
          onClick={signOut}
          className={`flex items-center w-full p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all
            ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="ml-3 font-medium text-sm">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;