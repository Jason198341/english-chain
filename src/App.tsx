import { useAppStore } from '@/stores/useAppStore'
import ProgressBar from '@/components/ProgressBar'
import SwipeContainer from '@/components/SwipeContainer'
import JourneyMap from '@/components/JourneyMap'

export default function App() {
  const { completedCards, resetAll, totalCards, totalProgress } = useAppStore()
  const isJourneyComplete = totalCards() > 0 && totalProgress() === 100

  if (isJourneyComplete) {
    return (
      <div className="flex flex-col h-dvh bg-surface-950">
        <JourneyMap />
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
    </div>
  )
}
