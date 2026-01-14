import { useState, useMemo } from 'react';
import { Search, LayoutDashboard, ChevronRight, Filter, Tag } from 'lucide-react';

const DashboardGallery = ({ dashboards, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const CATEGORY_RULES = {
    'Executive':  ['a299e', '10022', '2242f', 'd9d0c'],
    'Sales':     ['a299e', 'b8973', 'bbfed','b5610','2df77','e33ba','220ba','83725','fcc42','fd2d0','e0f6f'],
    'Inventory': ['f39d7', '8669e', '2242f'],
    'Member':    ['96948','510a2', '514d9', 'e236b','f911e','1abef','37351','6cbf9']
  };
  const categories = ['All', 'Executive', 'Sales', 'Inventory', 'Member'];
  
  const isDashboardInCategory = (dashboard, category) => {
    if (category === 'All') return true;
    
    const prefix = CATEGORY_RULES[category];

    return prefix.some(idPart => dashboard.id.toLowerCase().includes(idPart.toLowerCase()));
  };

  const filteredDashboards = useMemo(() => {
    return dashboards.filter(db => {
        const matchesSearch = db.name.toLowerCase().includes(searchTerm.toLowerCase()) || db.id.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = isDashboardInCategory(db, selectedCategory);

        return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, dashboards]); 

  return (
    <div className="flex-1 flex flex-col min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Search & Suggestions Header */}
      <div className="flex flex-col items-center mb-5 pt-2">
        <div className="relative w-full max-w-2xl group mb-6">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-20">
            <Search size={18} className="text-slate-400 group-focus-within:text-indigo-400 transition-colors" />
          </div>  
          <input 
            type="text"
            placeholder="Search for a specific dashboard..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/40 border border-slate-800/60 text-slate-200 text-sm rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all backdrop-blur-xl shadow-2xl"
          />
        </div>

        {/* Dynamic Category Suggestions Bar */}
        <div className="w-full max-w-3xl flex items-center gap-3 overflow-x-auto pb-2 px-4 no-scrollbar">
          <div className="flex items-center gap-2 text-slate-500 mr-2 shrink-0">
            <Tag size={14} className="text-indigo-500/50" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Categories:</span>
          </div>
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-[11px] font-bold transition-all duration-300 whitespace-nowrap border ${
                  selectedCategory === cat
                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.15)]'
                    : 'bg-slate-900/40 border-slate-800/60 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Section */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-12 pt-5">
        {filteredDashboards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <div className="w-16 h-16 bg-slate-900/50 rounded-full flex items-center justify-center mb-4 border border-slate-800">
              <Filter size={24} />
            </div>
            <p className="text-sm font-medium">No dashboards found under "{selectedCategory}"</p>
            <button 
              onClick={() => {setSearchTerm(''); setSelectedCategory('All');}}
              className="mt-4 text-xs text-indigo-400 hover:underline"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filteredDashboards.map((db) => (
              <button
                key={db.id}
                onClick={() => onSelect('', db.id)}
                className="group relative flex flex-col text-left bg-slate-900/30 border border-slate-800/50 rounded-[2rem] p-7 hover:border-indigo-500/40 hover:bg-indigo-500/[0.02] transition-all duration-500 backdrop-blur-sm hover:-translate-y-2 shadow-lg hover:shadow-indigo-500/10 min-h-[240px]"
              >
                <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-500">
                  <LayoutDashboard size={24} className="text-indigo-400" />
                </div>

                <div className="flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-white transition-colors mb-2 line-clamp-2 leading-snug">
                    {db.name}
                  </h3>
                  
                  {/* Standardized Ref ID Position */}
                  <div className="mt-auto mb-4 flex items-center gap-2">
                    <span className="text-[9px] text-slate-600 uppercase tracking-[0.2em] font-bold">Ref_ID:</span>
                    <span className="text-[10px] text-slate-500 font-mono truncate max-w-[120px] bg-slate-800/50 px-2 py-0.5 rounded">
                      {db.id}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/50 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-[-10px] group-hover:translate-x-0">
                    View Dashboard
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500">
                    <ChevronRight size={16} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardGallery;