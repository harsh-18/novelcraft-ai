import { useState, useEffect } from 'react';
import { auth } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { LogOut, BookOpen } from 'lucide-react';
import { logout } from './lib/firebase';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { HistoryView } from './components/HistoryView';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'dashboard' | 'history'>('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfcfb] flex items-center justify-center border-0 sm:border-[12px] border-[#1a1a1a]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-[#1a1a1a] rounded-full flex items-center justify-center text-white font-serif italic text-2xl mb-4">N</div>
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#1a1a1a]">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-[#fdfcfb] text-[#1a1a1a] font-sans border-0 sm:border-[12px] border-[#1a1a1a] flex flex-col print:border-none print:bg-white">
      <header className="h-20 border-b border-[#1a1a1a] flex items-center justify-between px-6 sm:px-10 bg-white relative z-10 print:hidden">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-[#1a1a1a] rounded-full flex items-center justify-center text-white font-serif italic text-xl">N</div>
          <h1 className="text-xs uppercase tracking-[0.3em] font-bold hidden sm:block">NovelCraft / Gen.01</h1>
        </div>
        <nav className="flex gap-8 sm:gap-10">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`text-[10px] uppercase tracking-widest cursor-pointer transition-colors ${currentView === 'dashboard' ? 'border-b-2 border-[#1a1a1a] pb-1 font-bold' : 'text-gray-400 hover:text-[#1a1a1a] pb-[6px]'}`}
          >
            Generator
          </button>
          <button
            onClick={() => setCurrentView('history')}
            className={`text-[10px] uppercase tracking-widest cursor-pointer transition-colors ${currentView === 'history' ? 'border-b-2 border-[#1a1a1a] pb-1 font-bold' : 'text-gray-400 hover:text-[#1a1a1a] pb-[6px]'}`}
          >
            Archive
          </button>
        </nav>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-bold uppercase">{user.displayName || 'Author'}</p>
            <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">Pro Account</p>
          </div>
          <div className="flex items-center gap-4">
            <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=f9f9f9&color=1a1a1a`} alt="Avatar" className="w-10 h-10 rounded-full border border-[#1a1a1a] bg-gray-100" />
            <button
              onClick={logout}
              className="text-gray-400 hover:text-[#1a1a1a] transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 print:p-0">
        {currentView === 'dashboard' ? <Dashboard user={user} /> : <HistoryView user={user} />}
      </main>
    </div>
  );
}
