import { useEffect, useState } from 'react'

import BrainMetricsOverlay from './components/BrainMetricsOverlay'
import { Analytics } from './components/Analytics'

import { profileApi } from './services/apiService'
import { analyzePerformance } from './services/geminiService'
import type { UserProfile } from './types'

const emptyProfile: UserProfile = {
  name: '',
  results: [],
}

const Analyzer = () => {
  const [profile, setProfile] = useState<UserProfile>(emptyProfile)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [authStatus, setAuthStatus] =
    useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')

  const [banner, setBanner] = useState<string | null>(null)

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const { profile } = await profileApi.fetchProfile()
        setProfile(profile)
        setAuthStatus('authenticated')
      } catch {
        setAuthStatus('unauthenticated')
      }
    }

    bootstrap()
  }, [])

  const handleAIAnalysis = async () => {
    if (profile.results.length === 0) {
      setBanner('No test results to analyze')
      return
    }

    setIsAnalyzing(true)
    try {
      const metrics = await analyzePerformance(profile.results)
      const { profile: updated } = await profileApi.saveMetrics(metrics)
      setProfile(updated)
      setBanner('AI metrics saved successfully')
      setTimeout(() => setBanner(null), 3000)
    } catch (error: any) {
      setBanner(error?.message || 'Could not save metrics')
      setTimeout(() => setBanner(null), 3000)
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (authStatus === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Cognitive Analysis
          </h1>
          <button
            onClick={handleAIAnalysis}
            disabled={isAnalyzing || profile.results.length === 0}
            className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg font-semibold hover:from-violet-500 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? 'Analyzing...' : 'Run AI Analysis'}
          </button>
        </div>

        {/* Banner */}
        {banner && (
          <div className="mb-6 p-4 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-200">
            {banner}
          </div>
        )}

        {/* Brain Metrics Overlay */}
        {profile.latestMetrics && (
          <div className="mb-8">
            <BrainMetricsOverlay data={profile.latestMetrics} image="./assets/brain.png" />
          </div>
        )}

        {/* Analytics Dashboard */}
        <Analytics profile={profile} />
      </div>
    </div>
  )
}

export default Analyzer
