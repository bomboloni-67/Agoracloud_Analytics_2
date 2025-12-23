import { useState } from 'react';

const Settings = () => {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userEmail = localStorage.getItem('user_email');
  const handleUpdate = async (e) => {
    e.preventDefault();
    setStatus({ type: '', msg: '' });

    // 1. Basic Validation
    if (formData.newPassword !== formData.confirmPassword) {
      return setStatus({ type: 'error', msg: 'New passwords do not match' });
    }

    setIsSubmitting(true);

    try {
      // 2. API Call to your Node.js backend
      const response = await fetch('http://localhost:4000/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('custom_jwt') 
        },
        body: JSON.stringify({
          email: userEmail,
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', msg: 'Password updated successfully!' });
        setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setStatus({ type: 'error', msg: data.msg || 'Failed to update password' });
      }
    } catch (error) {
      setStatus({ type: 'error', msg: 'Server connection error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start pt-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="w-full max-w-md bg-slate-900/40 border border-slate-800/60 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Form Section */}
        <form onSubmit={handleUpdate} className="p-8 space-y-5">
          
          {/* Status Message */}
          {status.msg && (
            <div className={`p-3 rounded-xl text-xs font-medium text-center animate-in zoom-in-95 ${
              status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {status.msg}
            </div>
          )}

          {/* Input Fields */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">Current Password</label>
              <input 
                type="password"
                required
                value={formData.oldPassword}
                onChange={(e) => setFormData({...formData, oldPassword: e.target.value})}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-200 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all duration-300"
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">New Password</label>
              <input 
                type="password"
                required
                value={formData.newPassword}
                onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-200 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all duration-300"
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">Confirm New Password</label>
              <input 
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-200 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all duration-300"
                placeholder="Repeat new password"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all duration-300 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;