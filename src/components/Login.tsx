import { useState } from 'react';
import { loginWithGoogle } from '../lib/firebase';
import { BookOpen, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError('Failed to sign in. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb] flex items-center justify-center p-4 border-0 sm:border-[12px] border-[#1a1a1a]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white border border-[#1a1a1a] overflow-hidden"
      >
        <div className="p-12 text-center border-b border-[#1a1a1a] bg-[#f9f9f9]">
          <div className="mx-auto w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-6">
            <span className="text-white font-serif italic text-3xl">N</span>
          </div>
          <h1 className="text-4xl font-serif italic text-[#1a1a1a] mb-3">NovelCraft</h1>
          <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Generator & Archive</p>
        </div>
        
        <div className="p-8">
          <div className="space-y-8">
            <div className="text-center text-sm font-serif italic text-gray-600">
              Generate rich synopsis, world-building, and characters in seconds.
            </div>
            
            {error && (
              <div className="p-3 text-[10px] uppercase tracking-widest font-bold text-red-600 border border-red-200 bg-red-50 text-center">
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-4 bg-[#1a1a1a] text-white text-[10px] uppercase tracking-[0.3em] font-bold py-4 px-4 hover:bg-[#333] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1a1a1a] disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Sign in with Google
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
