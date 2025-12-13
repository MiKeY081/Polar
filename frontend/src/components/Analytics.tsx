import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';
import type { UserProfile } from '../types';
import { TestType } from '../types';

interface Props {
  profile: UserProfile;
}

export const Analytics: React.FC<Props> = ({ profile }) => {
  const { results , latestMetrics } = profile;

  // Prepare Data for Timeline (Reaction Time & Accuracy)
  // Separate and map each metric independently to avoid undefined values
  const reactionTimeData = results
    .filter(r => r.type === TestType.REACTION)
    .map((r, i) => ({
      id: `reaction-${i}`,
      date: new Date(r.timestamp).toISOString().slice(0,10),
      reactionTime: r.score,
    }))
    .slice(-10);

  const attentionScoreData = results
    .filter(r => r.type === TestType.STROOP)
    .map((r, i) => ({
      id: `stroop-${i}`,
      date: new Date(r.timestamp).toISOString().slice(0,10),
      attentionScore: r.accuracy,
    }))
    .slice(-10);

  // Combine and merge by date
  const timelineData = [...reactionTimeData, ...attentionScoreData]
    .reduce((acc: any[], item) => {
      const existing = acc.find(d => d.date === item.date);
      if (existing) {
        return acc.map(d => d.date === item.date ? { ...d, ...item } : d);
      }
      return [...acc, item];
    }, [])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-10);

  // Debug: log computed chart inputs
  if (process.env.NODE_ENV !== 'production') {
    // These logs help verify data plumbing when charts appear empty
    console.log('[Analytics] results count:', results.length);
    console.log('[Analytics] timelineData:', timelineData);
  }


  // Radar Data for Cognitive Profile (Normalized)
  // We aggregate latest scores for each category
  const getLatestScore = (type: string) => {
    const runs = results.filter(r => r.type === type);
    if (runs.length === 0) return 0;
    return Math.min(100, runs[runs.length - 1].accuracy || 50); // Fallback to 50, cap at 100
  };

  const reactionTestResult = results.find(r => r.type === TestType.REACTION);
  const speedScore = reactionTestResult ? Math.min(100, 10000 / (reactionTestResult.score || 500)) : 0;

  const radarData = [
    { subject: 'Speed', A: speedScore, fullMark: 100 },
    { subject: 'Memory', A: getLatestScore(TestType.PATTERN), fullMark: 100 },
    { subject: 'Attention', A: getLatestScore(TestType.STROOP), fullMark: 100 },
    { subject: 'Flexibility', A: getLatestScore(TestType.SEQUENCE), fullMark: 100 },
    { subject: 'Focus', A: getLatestScore(TestType.NPBACK), fullMark: 100 },
  ];


  return (
    <div className="space-y-8">
      {/* Metrics Cards */}
      {latestMetrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard title="Decision Confidence" value={latestMetrics.decisionConfidence} color="text-blue-400" />
          <MetricCard title="Cognitive Load" value={latestMetrics.cognitiveLoad} color="text-yellow-400" />
          <MetricCard title="Fatigue Index" value={latestMetrics.fatigueIndex} color="text-red-400" />
          <MetricCard title="Behavior Drift" value={latestMetrics.behaviorDrift} color="text-purple-400" />
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Weekly Drift Timeline */}
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-6">Performance Timeline</h3>
          {timelineData.length > 0 ? (
            <div className="">
                <LineChart data={timelineData} width={500} height={256}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" tick={{fontSize: 12}} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="reactionTime" stroke="#3b82f6" name="Reaction (ms)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="attentionScore" stroke="#22c55e" name="Attention (%)" strokeWidth={2} />
                </LineChart>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              <p>Complete Reaction Time or Stroop tests to view timeline data</p>
            </div>
          )}
        </div>

        {/* Cognitive Radar */}
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-6">Cognitive Profile</h3>
          {radarData.some(d => d.A > 0) ? (
            <div className="w-full">
                <RadarChart width={600} height={256} cx={300} cy={128} outerRadius={110} data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                  <Radar name="User" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                </RadarChart>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              <p>Complete cognitive tests to view your profile</p>
            </div>
          )}
        </div>
      </div>

      {/* Anomalies & Summary */}
      {latestMetrics && (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">AI Analysis</h3>
          <p className="text-slate-300 mb-4 leading-relaxed">{latestMetrics.summary}</p>
          {latestMetrics.anomalies.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Anomalies Detected</h4>
              <ul className="list-disc list-inside text-yellow-500/90 text-sm space-y-1">
                {latestMetrics.anomalies.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const MetricCard: React.FC<{title: string, value: number, color: string}> = ({ title, value, color }) => (
  <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
    <div className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">{title}</div>
    <div className={`text-3xl font-bold ${color}`}>{value}<span className="text-sm text-slate-600 ml-1">/100</span></div>
  </div>
);
