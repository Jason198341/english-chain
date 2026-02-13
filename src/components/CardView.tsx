import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/stores/useAppStore'
import StageStep from './StageStep'
import type { Card, StageId } from '@/data/types'
import { TIME_BLOCKS } from '@/data/types'

interface Props {
  card: Card
}

export default function CardView({ card }: Props) {
  const { stageProgress, advanceStage, resetCard, goNext, buildPath } = useAppStore()
  const currentStage = (stageProgress[card.id] ?? 1) as number
  const isComplete = currentStage >= 5
  const timeBlock = TIME_BLOCKS.find((tb) => tb.id === card.timeBlock)
  const path = buildPath()
  const cardItems = path.filter((p): p is { type: 'card'; card: Card } => p.type === 'card')
  const isLast = cardItems.length > 0 && cardItems[cardItems.length - 1].card.id === card.id

  // Auto-advance 1.5s after card completion
  useEffect(() => {
    if (isComplete && !isLast) {
      const timer = setTimeout(goNext, 1500)
      return () => clearTimeout(timer)
    }
  }, [isComplete, isLast, goNext])

  return (
    <div className="flex flex-col h-full">
      {/* Card header — compact */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-base">{timeBlock?.emoji}</span>
            <span className="text-[11px] text-surface-500 font-mono">{card.time}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {isComplete && (
              <span className="text-[10px] text-chain-400 font-medium">DONE</span>
            )}
            <span className="text-[10px] text-surface-500 tabular-nums">#{card.id}</span>
          </div>
        </div>

        {/* Scene card */}
        <div className={`rounded-xl p-3.5 card-shadow ${isComplete ? 'shimmer-bg bg-surface-800/90' : 'bg-surface-800'}`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-surface-700/80 flex items-center justify-center text-2xl shrink-0">
              {card.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-surface-400 text-[10px] mb-0.5 uppercase tracking-wider">{card.scene}</p>
              <p className="text-white font-semibold text-[15px] leading-snug">{card.korean}</p>
            </div>
          </div>

          {/* Completion banner */}
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 pt-3 border-t border-chain-500/20"
            >
              <div className="flex items-center justify-between">
                <p className="text-chain-300 text-sm font-medium flex-1">
                  ✓ {card.english}
                </p>
                <button
                  onClick={() => resetCard(card.id)}
                  className="ml-2 text-[10px] text-surface-500 hover:text-surface-300 px-2 py-1 rounded bg-surface-700/50 transition-colors nav-btn"
                >
                  다시
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* 4 Stages */}
      <div className="flex-1 overflow-y-auto px-4 pb-20 space-y-3">
        {([1, 2, 3, 4] as StageId[]).map((stageId) => {
          const status: 'completed' | 'active' | 'locked' =
            stageId < currentStage
              ? 'completed'
              : stageId === currentStage && !isComplete
                ? 'active'
                : isComplete
                  ? 'completed'
                  : 'locked'
          return (
            <StageStep
              key={stageId}
              card={card}
              stageId={stageId}
              status={status}
              onComplete={() => advanceStage(card.id)}
            />
          )
        })}
      </div>
    </div>
  )
}
