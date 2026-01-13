import { useState } from 'react';
import { Search, LayoutDashboard, ChevronRight } from 'lucide-react';

const DashboardGallery = ({ dashboards, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDashboards = dashboards.filter(db =>
    db.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    db.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Search Bar Section */}
      <div className="flex justify-center mb-5 pt-2">
        <div className="relative w-full max-w-2xl group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-20">
            <Search 
                size={18} 
                className="text-slate-400 group-focus-within:text-indigo-400 transition-colors duration-300" 
            />
          </div>  
          <input 
            type="text"
            placeholder="Search for a specific dashboard..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/40 border border-slate-800/60 text-slate-200 text-sm rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all backdrop-blur-xl shadow-2xl"
          />
        </div>
      </div>

      {/* Grid Section */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-12 pt-5">
        {filteredDashboards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <div className="w-16 h-16 bg-slate-900/50 rounded-full flex items-center justify-center mb-4 border border-slate-800">
              <Search size={24} />
            </div>
            <p className="text-sm font-medium">No dashboards match your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filteredDashboards.map((db) => (
              <button
                key={db.id}
                onClick={() => onSelect('', db.id)}
                className="group relative flex flex-col text-left bg-slate-900/30 border border-slate-800/50 rounded-[2rem] p-7 hover:border-indigo-500/40 hover:bg-indigo-500/[0.02] transition-all duration-500 backdrop-blur-sm hover:-translate-y-2 shadow-lg hover:shadow-indigo-500/10"
              >
                {/* Card Icon */}
                <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-500">
                  <LayoutDashboard size={24} className="text-indigo-400" />
                </div>

                {/* Content */}
                <div className="space-y-1 mb-6">
                    <h3 className="text-lg font-bold text-slate-100 group-hover:text-white transition-colors">
                        {db.name}
                    </h3>
                    <div className="absolute bottom-20 flex items-center gap-2">
                        <span className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-bold">Ref_ID:</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                        {db.id}
                        </span>
                    </div>
                </div>

                {/* Bottom Action */}
                <div className="mt-auto pt-4 border-t border-slate-800/50 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-[-10px] group-hover:translate-x-0">
                    Open Dashboard
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