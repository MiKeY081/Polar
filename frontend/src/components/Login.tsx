import React from 'react';
import { BrainCogIcon, Sparkles, Mail, Lock, User as UserIcon, LogIn } from 'lucide-react';
import { Button } from './Button';

export type AuthMode = 'login' | 'register';

export interface AuthFormState {
  name: string;
  email: string;
  password: string;
}

interface LoginProps {
  mode: AuthMode;
  form: AuthFormState;
  error?: string | null;
  isSubmitting: boolean;
  apiBase: string;
  onModeToggle: () => void;
  onChange: (fields: Partial<AuthFormState>) => void;
  onSubmit: (event: React.FormEvent) => void;
}

export const Login: React.FC<LoginProps> = ({
  mode,
  form,
  error,
  isSubmitting,
  apiBase,
  onModeToggle,
  onChange,
  onSubmit,
}) => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white overflow-hidden flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),transparent_35%),radial-gradient(circle_at_30%_20%,_rgba(56,189,248,0.12),transparent_30%)]" />
      <div className="absolute inset-0 backdrop-blur-[2px]" />

      <div className="relative w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6 bg-white/5 border border-white/10 rounded-3xl p-10 shadow-2xl">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-200 border border-indigo-500/30">
            <Sparkles size={18} />
            <span>Neuro stack connected</span>
          </div>
          <h1 className="text-3xl font-bold leading-tight">Sign in to sync cognitive tests with your cloud profile</h1>
          <p className="text-stone-200/80 text-lg">Secure, cookie-based sessions let you run tests on any device and keep analytics aligned with your profile.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <StatCard label="API" value={apiBase} subtle />
            <StatCard label="Data Stored" value="Profiles + metrics" subtle />
            <StatCard label="Session" value="HttpOnly cookie" subtle />
            <StatCard label="Latency" value="Optimized for 8001" subtle />
          </div>
          <div className="flex gap-3 text-sm text-stone-300/80">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live backend connection
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-400" />
              Cookie-based auth
            </div>
          </div>
        </div>

        <div className="bg-stone-900/70 backdrop-blur-xl border border-stone-800 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                <BrainCogIcon className="w-6 h-6 text-indigo-300" />
              </div>
              <div>
                <p className="text-sm text-stone-400">Cognitive Suite</p>
                <p className="text-lg font-semibold">Secure Access</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onModeToggle}>
              {mode === 'login' ? 'Create account' : 'Use existing'}
            </Button>
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            {mode === 'register' && (
              <LabeledInput
                icon={<UserIcon size={16} />}
                label="Name"
                type="text"
                value={form.name}
                onChange={(e: any) => onChange({ name: e.target.value })}
                placeholder="Dr. Ada Lovelace"
                autoComplete="name"
              />
            )}

            <LabeledInput
              icon={<Mail size={16} />}
              label="Email"
              type="email"
              value={form.email}
              onChange={(e: any) => onChange({ email: e.target.value })}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />

            <LabeledInput
              icon={<Lock size={16} />}
              label="Password"
              type="password"
              value={form.password}
              onChange={(e: any) => onChange({ password: e.target.value })}
              placeholder="********"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
            />

            {error && (
              <div className="text-sm text-red-300 bg-red-900/30 border border-red-800 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              <div className="flex items-center justify-center gap-2">
                {isSubmitting ? 'Connecting...' : mode === 'login' ? 'Login & Sync' : 'Register & Sync'}
                <LogIn className="w-4 h-4" />
              </div>
            </Button>
          </form>

          <div className="mt-6 text-xs text-stone-500 flex items-center justify-between">
            <span>API target: {apiBase}</span>
            <span>Cookies: HttpOnly, credentialed fetch</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const LabeledInput = ({ label, icon, ...props }: any) => (
  <label className="block">
    <span className="text-sm text-stone-300 flex items-center gap-2 mb-2">{icon}{label}</span>
    <input
      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white placeholder:text-stone-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-600/30 transition"
      {...props}
    />
  </label>
);

const StatCard = ({ label, value, subtle = false }: any) => (
  <div className={`rounded-2xl border ${subtle ? 'border-white/10 bg-white/5' : 'border-stone-800 bg-stone-900'} p-4`}>
    <p className="text-xs uppercase tracking-wide text-stone-400">{label}</p>
    <p className="text-lg font-semibold text-white truncate">{value}</p>
  </div>
);

export default Login;
