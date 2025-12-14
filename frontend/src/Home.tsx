import React, { useState, useEffect, Suspense } from 'react';
import {
  Brain,
  Activity,
  Zap,
  Grid,
  LayoutGrid,
  Timer,
  BarChart3,
  Menu,
  X,
  CheckCircle2,
  BrainCogIcon,
  LogOut,
} from 'lucide-react';
import { ReactionTest } from './components/tests/ReactionTest';
import { PatternTest } from './components/tests/PatternTest';
import { StroopTest } from './components/tests/StroopTest';
import { SequenceTest } from './components/tests/SequenceTest';
import { NBackTest } from './components/tests/NBackTest';
import { Button } from './components/Button';
import { analyzePerformance } from './services/geminiService';
import { authApi, profileApi, getApiBase } from './services/apiService';
import { Login } from './components/Login';
import type { TestResult, UserProfile } from '@/types';
import { useNavigate } from 'react-router';

// Lazy load Analytics to prevent Recharts import issues from crashing the whole app
const Analytics = React.lazy(() => import('./components/Analytics').then(module => ({ default: module.Analytics })));

// Simple Error Boundary for Analytics
class AnalyticsErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Analytics failed to load:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center bg-stone-800 rounded-xl border border-red-500/30">
          <BarChart3 className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Analytics Visualization Unavailable</h3>
          <p className="text-stone-400">The chart library failed to load. Your test data is still being saved.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Simple Router State
type View = 'dashboard' | 'reaction' | 'pattern' | 'stroop' | 'sequence' | 'nback';

const emptyProfile: UserProfile = {
  name: 'Explorer',
  results: [],
};

const Home = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const { profile } = await profileApi.fetchProfile();
        setProfile(profile);
        setAuthStatus('authenticated');
      } catch (error) {
        setAuthStatus('unauthenticated');
      }
    };

    bootstrap();
  }, []);

  const handleAuthSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setAuthError(null);

    try {
      if (authMode === 'register') {
        await authApi.register(authForm.name.trim(), authForm.email.trim(), authForm.password);
        setBanner('Account created. Session stored in secure cookie.');
      } else {
        await authApi.login(authForm.email.trim(), authForm.password);
        setBanner('Welcome back. Session restored.');
      }

      const { profile } = await profileApi.fetchProfile();
      setProfile(profile);
      setAuthStatus('authenticated');
      setMenuOpen(false);
    } catch (error: any) {
      setAuthError(error?.message || 'Unable to authenticate. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Best-effort logout; ignore network errors here
    }
    setProfile(emptyProfile);
    setAuthStatus('unauthenticated');
    setCurrentView('dashboard');
  };

  const handleTestComplete = async (result: TestResult) => {
    try {
      const { profile: updated } = await profileApi.saveResult(result);
      setProfile(updated);
      setBanner('Result synced to backend');
    } catch (error: any) {
      setBanner(error?.message || 'Could not save result');
    }
    setCurrentView('dashboard');
  };

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const metrics = await analyzePerformance(profile.results);
      const { profile: updated } = await profileApi.saveMetrics(metrics);
      navigate('/analyzer')
      setProfile(updated);
      setBanner('AI metrics saved to backend');
    } catch (error: any) {
      setBanner(error?.message || 'Could not save metrics');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearHistory = async () => {
    if (!confirm('Are you sure you want to clear all data?')) return;

    try {
      const { profile } = await profileApi.clearData();
      setProfile(profile);
      setBanner('History cleared on backend');
    } catch (error: any) {
      setBanner(error?.message || 'Could not clear data');
    }
  };

  const renderAuthScreen = () => {
    if (authStatus === 'loading') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-950 text-white">
          <div className="px-6 py-4 bg-stone-900 border border-stone-800 rounded-xl shadow-2xl">
            Checking session...
          </div>
        </div>
      );
    }

    return (
      <Login
        mode={authMode}
        form={authForm}
        error={authError}
        isSubmitting={isSubmitting}
        apiBase={getApiBase()}
        onModeToggle={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
        onChange={(fields) => setAuthForm({ ...authForm, ...fields })}
        onSubmit={handleAuthSubmit}
      />
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case 'reaction': return <TestWrapper title="Reaction Time" onBack={() => setCurrentView('dashboard')}><ReactionTest onComplete={handleTestComplete} /></TestWrapper>;
      case 'pattern': return <TestWrapper title="Pattern Recognition" onBack={() => setCurrentView('dashboard')}><PatternTest onComplete={handleTestComplete} /></TestWrapper>;
      case 'stroop': return <TestWrapper title="Stroop Test" onBack={() => setCurrentView('dashboard')}><StroopTest onComplete={handleTestComplete} /></TestWrapper>;
      case 'sequence': return <TestWrapper title="Sequence Memory" onBack={() => setCurrentView('dashboard')}><SequenceTest onComplete={handleTestComplete} /></TestWrapper>;
      case 'nback': return <TestWrapper title="N-Back Test" onBack={() => setCurrentView('dashboard')}><NBackTest onComplete={handleTestComplete} /></TestWrapper>;
      default: return (
        <div className="space-y-8 animate-fade-in">
          {/* Header Stats */}
          <div className="rounded-2xl p-8 shadow-xl border border-stone-700/50 relative overflow-hidden">
             <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
               <div>
                 <h1 className="text-3xl font-bold text-white mb-2">Welcome Back, {profile.name}</h1>
                 <p className="text-indigo-200 mb-4 max-w-2xl">
                   Your cognitive health stays synced across devices. You have completed {profile.results.length} tests.
                 </p>
                 <div className="flex flex-wrap gap-3">
                   <Button onClick={handleAIAnalysis} disabled={isAnalyzing || profile.results.length === 0}>
                     {isAnalyzing ? "Analyzing..." : "Generate AI Analysis"}
                   </Button>
                   <Button variant="secondary" onClick={clearHistory}>Reset Data</Button>
                 </div>
               </div>
              
             </div>
          </div>

          {/* Test Selector Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
             <TestCard 
               title="Reaction Time" 
               desc="Measure raw processing speed and alertness." 
               icon={<Zap className="text-yellow-400" />} 
               onClick={() => setCurrentView('reaction')} 
             />
             <TestCard 
               title="Pattern Recognition" 
               desc="Test visual memory and pattern recall." 
               icon={<Grid className="text-blue-400" />} 
               onClick={() => setCurrentView('pattern')} 
             />
             <TestCard 
               title="Stroop Interference" 
               desc="Challenge response inhibition and focus." 
               icon={<LayoutGrid className="text-red-400" />} 
               onClick={() => setCurrentView('stroop')} 
             />
             <TestCard 
               title="Sequence Memory" 
               desc="Track working memory capacity." 
               icon={<Activity className="text-green-400" />} 
               onClick={() => setCurrentView('sequence')} 
             />
             <TestCard 
               title="N-Back Test" 
               desc="Advanced working memory load test." 
               icon={<Timer className="text-purple-400" />} 
               onClick={() => setCurrentView('nback')} 
             />
          </div>

          {/* Analytics Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <BarChart3 /> Analytics Dashboard
            </h2>
            {profile.results.length > 0 ? (
              <AnalyticsErrorBoundary>
                <Suspense fallback={<div className="p-12 text-center text-slate-500 bg-stone-800 rounded-xl">Loading Analytics Visualization...</div>}>
                  <Analytics profile={profile} />
                </Suspense>
              </AnalyticsErrorBoundary>
            ) : (
              <div className="bg-stone-800/50 border border-stone-700 border-dashed rounded-xl p-12 text-center text-stone-500">
                Complete some tests to view analytics.
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  if (authStatus !== 'authenticated') return renderAuthScreen();

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex">
      {/* Sidebar Navigation (Desktop) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-stone-900 border-r border-stone-800 transform transition-transform duration-300 lg:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <div className="flex items-center gap-3 text-indigo-400 mb-8">
            <BrainCogIcon className="w-8 h-8 rotate-180" />
            <span className="text-xl font-bold tracking-tight text-white">Cognitive Test</span>
          </div>
          
          <nav className="space-y-2">
            <NavItem active={currentView === 'dashboard'} onClick={() => {setCurrentView('dashboard'); setMenuOpen(false);}} icon={<BarChart3 size={20}/>} label="Dashboard" />
            <div className="pt-4 pb-2 text-xs font-semibold text-stone-500 uppercase tracking-wider">Tests</div>
            <NavItem active={currentView === 'reaction'} onClick={() => {setCurrentView('reaction'); setMenuOpen(false);}} icon={<Zap size={20}/>} label="Reaction Time" />
            <NavItem active={currentView === 'pattern'} onClick={() => {setCurrentView('pattern'); setMenuOpen(false);}} icon={<Grid size={20}/>} label="Pattern Match" />
            <NavItem active={currentView === 'stroop'} onClick={() => {setCurrentView('stroop'); setMenuOpen(false);}} icon={<LayoutGrid size={20}/>} label="Stroop Test" />
            <NavItem active={currentView === 'sequence'} onClick={() => {setCurrentView('sequence'); setMenuOpen(false);}} icon={<Activity size={20}/>} label="Sequence" />
            <NavItem active={currentView === 'nback'} onClick={() => {setCurrentView('nback'); setMenuOpen(false);}} icon={<Timer size={20}/>} label="N-Back" />
          </nav>

          <div className="mt-8 pt-6 border-t border-stone-800">
            <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMenuOpen(false)} />
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="lg:hidden flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-indigo-400">
             <Brain className="w-6 h-6" />
             <span className="font-bold text-white">Cognitive Test</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-stone-300">
              {menuOpen ? <X /> : <Menu />}
            </button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto space-y-4">
          {banner && (
            <div className="bg-indigo-600/10 border border-indigo-500/40 text-indigo-100 px-4 py-3 rounded-xl flex items-center justify-between">
              <span>{banner}</span>
              <button className="text-indigo-200" onClick={() => setBanner(null)}>x</button>
            </div>
          )}
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

// Sub-components for clean Layout
const NavItem = ({active, onClick, icon, label}: any) => (

  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
      ${active ? 'bg-stone-800 text-indigo-400' : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'}
    `}
  >
    {icon}
    {label}
  </button>
);

const TestCard = ({title, desc, icon, onClick}: any) => (
  <div 
    onClick={onClick}
    className="group bg-stone-800 p-6 rounded-xl border border-stone-700 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all cursor-pointer flex flex-col items-start"
  >
    <div className="p-3 bg-stone-900 rounded-lg mb-4 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
    <p className="text-stone-400 text-sm">{desc}</p>
    <div className="mt-4 text-xs font-semibold text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
      START TEST <CheckCircle2 size={12} />
    </div>
  </div>
);

const TestWrapper = ({children, title, onBack}: any) => (
  <div className="h-[calc(100vh-100px)] flex flex-col">
    <div className="flex items-center gap-4 mb-6">
      <Button variant="ghost" onClick={onBack} size="sm">← Back to Dashboard</Button>
      <h2 className="text-2xl font-bold text-white">{title}</h2>
    </div>
    <div className="flex-1 bg-stone-900/50 rounded-2xl border border-stone-800 p-8 relative overflow-hidden flex flex-col">
      {children}
    </div>
  </div>
);

const StatCard = ({ label, value, subtle = false }: any) => (
  <div className={`rounded-2xl border ${subtle ? 'border-white/10 bg-white/5' : 'border-stone-800 bg-stone-900'} p-4`}> 
    <p className="text-xs uppercase tracking-wide text-stone-400">{label}</p>
    <p className="text-lg font-semibold text-white truncate">{value}</p>
  </div>
);

export default Home;