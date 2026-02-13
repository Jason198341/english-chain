import { useAppStore } from '@/stores/useAppStore'
import { TIME_BLOCKS } from '@/data/types'
import { cards } from '@/data/cards'

/** Maps time block id -> fill color for the segmented bar */
const BLOCK_COLORS: Record<string, string> = {
  morning: 'bg-morning',
  commute: 'bg-work',
  daytime: 'bg-work',
  lunch: 'bg-lunch',
  afternoon: 'bg-afternoon',
  'commute-pm': 'bg-evening',
  evening: 'bg-evening',
  night: 'bg-night',
}

export default function ProgressBar() {
  const { completedCards, activeTimeBlock, setTimeBlock, totalProgress, totalCards } = useAppStore()

  return (
    <div className="px-4 pt-1 pb-2">
      {/* Overall progress row */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] text-surface-400 tabular-nums">
          {completedCards.length} / {totalCards()}
        </span>
        <span className="text-[10px] font-bold text-chain-400 tabular-nums">
          {totalProgress()}%
        </span>
      </div>

      {/* Segmented progress — each block has its own color */}
      <div className="flex gap-[2px] mb-2.5">
        {TIME_BLOCKS.map((tb) => {
          const blockCards = cards.filter((c) => c.timeBlock === tb.id)
          const doneCount = blockCards.filter((c) => completedCards.includes(c.id)).length
          const pct = blockCards.length > 0 ? (doneCount / blockCards.length) * 100 : 0
          const isActive = activeTimeBlock === tb.id
          return (
            <button
              key={tb.id}
              onClick={() => setTimeBlock(activeTimeBlock === tb.id ? null : tb.id)}
              className={`flex-1 h-1.5 rounded-full overflow-hidden transition-all ${
                isActive ? 'ring-1 ring-white/30 ring-offset-1 ring-offset-surface-950' : ''
              }`}
              style={{ background: 'var(--color-surface-800)' }}
            >
              <div
                className={`h-full rounded-full ${BLOCK_COLORS[tb.id] ?? 'bg-chain-500'} transition-all duration-500`}
                style={{ width: `${pct}%` }}
              />
            </button>
          )
        })}
      </div>

      {/* Time block pills */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setTimeBlock(null)}
          className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
            activeTimeBlock === null
              ? 'bg-chain-600 text-white shadow-md shadow-chain-600/20'
              : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
          }`}
        >
          All
        </button>
        {TIME_BLOCKS.map((tb) => {
          const blockCards = cards.filter((c) => c.timeBlock === tb.id)
          const doneCount = blockCards.filter((c) => completedCards.includes(c.id)).length
          const allDone = doneCount === blockCards.length && doneCount > 0
          return (
            <button
              key={tb.id}
              onClick={() => setTimeBlock(activeTimeBlock === tb.id ? null : tb.id)}
              className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                activeTimeBlock === tb.id
                  ? 'bg-chain-600 text-white shadow-md shadow-chain-600/20'
                  : allDone
                    ? 'bg-chain-600/15 text-chain-300 border border-chain-600/20'
                    : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
              }`}
            >
              {tb.emoji} {tb.label}
              {doneCount > 0 && (
                <span className="ml-1 text-[9px] opacity-60">
                  {doneCount}/{blockCards.length}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
