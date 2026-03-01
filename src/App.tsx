import { useState, useEffect } from 'react'
import { useAppStore } from '@/stores/useAppStore'
import ProgressBar from '@/components/ProgressBar'
import SwipeContainer from '@/components/SwipeContainer'
import JourneyMap from '@/components/JourneyMap'
import SentenceBook from '@/components/SentenceBook'
import XpToast from '@/components/XpToast'
import Onboarding from '@/components/Onboarding'

type View = 'main' | 'book'

export default function App() {
  const { completedCards, resetAll, totalCards, totalProgress, streak, updateStreak, hasOnboarded } = useAppStore()
  const [view, setView] = useState<View>('main')
  const isJourneyComplete = totalCards() > 0 && totalProgress() === 100

  // Update streak on mount
  useEffect(() => {
    updateStreak()
  }, [updateStreak])

  // Onboarding gate
  if (!hasOnboarded) {
    return <Onboarding />
  }

  if (view === 'book') {
    return (
      <div className="flex flex-col h-dvh bg-surface-950">
        <SentenceBook onBack={() => setView('main')} />
      </div>
    )
  }

  if (isJourneyComplete) {
    return (
      <div className="flex flex-col h-dvh bg-surface-950">
        <JourneyMap onShowBook={() => setView('book')} />
        <XpToast />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-dvh bg-surface-950">
      {/* Compact header */}
      <header className="shrink-0 px-4 pt-2 pb-0.5 flex items-center justify-between">
        <h1 className="text-base font-bold text-white tracking-tight">
          🔗 English Chain
        </h1>
        <div className="flex items-center gap-3">
          {streak > 0 && (
            <span className="text-[11px] font-bold text-orange-400">
              🔥 {streak}
            </span>
          )}
          <button
            onClick={() => setView('book')}
            className="text-[10px] text-chain-400 hover:text-chain-300 transition-colors"
          >
            All 87
          </button>
          <span className="text-[10px] text-surface-500">이중회로 영어회화</span>
          {completedCards.length > 0 && (
            <button
              onClick={resetAll}
              className="text-[10px] text-surface-500 hover:text-surface-300 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </header>

      {/* Progress */}
      <div className="shrink-0">
        <ProgressBar />
      </div>

      {/* Card area */}
      <SwipeContainer />
      <XpToast />
    </div>
  )
}
