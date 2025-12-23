import { useState } from 'react';
import { User, Lock, Sparkles, ArrowRight } from 'lucide-react';

export default function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isSignup && password !== confirmPassword) {
      alert('Passwords do not match');
      setLoading(false);
      return;
    }

    const endpoint = isSignup ? '/api/register' : '/api/login';

    try {
      const response = await fetch(`http://localhost:4000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const displayName = email.split('@')[0];
        const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
        
        localStorage.setItem('custom_jwt', data.token);
        localStorage.setItem('user_email', email)
        onLogin(formattedName);
        
      } else {
        alert(data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Could not connect to the server. Is your backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] text-slate-100">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 mb-4">
            <Sparkles className="text-indigo-500 w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
            AgoraCloud
          </h1>
          <p className="text-slate-500 mt-2 text-sm">Data Intelligence Engine</p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl mb-1">
          <h2 className="text-xl font-semibold mb-6 text-center">
            {isSignup ? 'Create account' : 'Welcome back'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">
                Email Address
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700/50 p-3.5 pl-11 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all placeholder:text-slate-600"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700/50 p-3.5 pl-11 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all placeholder:text-slate-600"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {isSignup && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700/50 p-3.5 pl-11 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all placeholder:text-slate-600"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full group bg-indigo-600 hover:bg-indigo-500 text-white p-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              <span>{loading ? 'Processing...' : isSignup ? 'Create Account' : 'Sign In'}</span>
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <button
            onClick={() => {
                setIsSignup(!isSignup);
                setEmail('');
                setPassword('');
                setConfirmPassword('');
            }}
            className="w-full mt-6 text-sm text-slate-400 hover:text-indigo-400 transition-colors"
          >
            {isSignup ? (
              <>Already have an account? <span className="font-bold text-indigo-500">Log in</span></>
            ) : (
              <>Don't have an account? <span className="font-bold text-indigo-500">Sign up</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}