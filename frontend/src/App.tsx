import React, { useState, useEffect, Suspense } from 'react';
import { Brain, Activity, Zap, Grid, LayoutGrid, Timer, BarChart3, Menu, X, CheckCircle2, BrainCogIcon } from 'lucide-react';
import { ReactionTest } from './components/tests/ReactionTest';
import { PatternTest } from './components/tests/PatternTest';
import { StroopTest } from './components/tests/StroopTest';
import { SequenceTest } from './components/tests/SequenceTest';
import { NBackTest } from './components/tests/NBackTest';
import { Button } from './components/Button';
import { getProfile, saveResult, saveMetrics, clearData } from './services/storageService';
import { analyzePerformance } from './services/geminiService';import type { TestResult, UserProfile } from '@/types';

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

const App = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [profile, setProfile] = useState<UserProfile>(getProfile());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // Refresh profile on mount to get latest from localstorage
    setProfile(getProfile());
  }, []);

  const handleTestComplete = (result: TestResult) => {
    const updated = saveResult(result);
    setProfile(updated);
    setCurrentView('dashboard');
  };

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const metrics = await analyzePerformance(profile.results);
      const updated = saveMetrics(metrics);
      setProfile(updated);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearHistory = () => {
    if(confirm("Are you sure you want to clear all data?")) {
      clearData();
      setProfile(getProfile());
    }
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
             <div className="relative z-10">
               <h1 className="text-3xl font-bold text-white mb-2">Welcome Back, {profile.name}</h1>
               <p className="text-indigo-200 mb-6 max-w-xl">
                 Your cognitive health requires consistent training. You've completed {profile.results.length} tests so far.
               </p>
               <div className="flex gap-4">
                 <Button onClick={handleAIAnalysis} disabled={isAnalyzing || profile.results.length === 0}>
                   {isAnalyzing ? "Analyzing..." : "Generate AI Analysis"}
                 </Button>
                 <Button variant="secondary" onClick={clearHistory}>Reset Data</Button>
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
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-stone-300">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        
        <div className="max-w-7xl mx-auto">
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

export default App;