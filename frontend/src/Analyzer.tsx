import { useEffect, useState } from 'react'

import BrainMetricsOverlay from './components/BrainMetricsOverlay'
import { Analytics } from './components/Analytics'

import { profileApi } from './services/apiService'
import { analyzePerformance } from './services/geminiService'
import type { UserProfile } from './types'
import { BrainCogIcon } from 'lucide-react'
import { useNavigate } from 'react-router'

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
    const navigate = useNavigate()
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
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (authStatus === 'unauthenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-stone-900 text-white">
      <div className="container mx-auto px-4">
        {/* Header */}
         <div className="p-6" onClick={()=>navigate("/")}>
          <div className="flex items-center gap-3 text-indigo-400 ">
            <BrainCogIcon className="w-8 h-8 rotate-180" />
            <span className="text-xl font-bold tracking-tight text-white">Cognitive Test</span>
          </div>
          </div>
        
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
