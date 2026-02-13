import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDrag } from '@use-gesture/react'
import { useAppStore } from '@/stores/useAppStore'
import CardView from './CardView'
import ChoiceCard from './ChoiceCard'

const SWIPE_THRESHOLD = 50

export default function SwipeContainer() {
  const { currentIndex, goNext, goPrev, buildPath } = useAppStore()
  const path = buildPath()
  const item = path[currentIndex]
  const [direction, setDirection] = useState(0)
  const prevIndex = useRef(currentIndex)

  // Track direction for animation
  useEffect(() => {
    setDirection(currentIndex > prevIndex.current ? 1 : -1)
    prevIndex.current = currentIndex
  }, [currentIndex])

  // Swipe gesture (only for card items, not choices)
  const bind = useDrag(
    ({ last, movement: [mx], cancel }) => {
      if (!last) return
      if (mx < -SWIPE_THRESHOLD) {
        goNext()
        cancel()
      } else if (mx > SWIPE_THRESHOLD) {
        goPrev()
        cancel()
      }
    },
    { axis: 'x', filterTaps: true },
  )

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    },
    [goNext, goPrev],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!item) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-surface-500 text-sm">이 시간대에 카드가 없습니다.</p>
      </div>
    )
  }

  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < path.length - 1
  // Unique key for animation
  const itemKey = item.type === 'card' ? `card-${item.card.id}` : `choice-${item.choice.id}`

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Main card area with swipe */}
      <div
        {...bind()}
        className="flex-1 overflow-hidden relative"
        style={{ touchAction: 'pan-y' }}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={itemKey}
            custom={direction}
            initial={{ x: direction > 0 ? 200 : -200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction > 0 ? -200 : 200, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35, mass: 0.8 }}
            className="absolute inset-0 overflow-y-auto"
          >
            {item.type === 'card' ? (
              <CardView card={item.card} />
            ) : (
              <ChoiceCard choice={item.choice} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom navigation bar */}
      <div className="shrink-0 bg-surface-900/95 backdrop-blur-sm border-t border-surface-800 px-4 py-2.5 flex items-center justify-between">
        <button
          onClick={goPrev}
          disabled={!hasPrev}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium nav-btn ${
            hasPrev
              ? 'bg-surface-800 text-surface-200 hover:bg-surface-700'
              : 'text-surface-600 cursor-default'
          }`}
        >
          ← 이전
        </button>

        <span className="text-xs text-surface-400 tabular-nums font-mono">
          {currentIndex + 1} / {path.length}
        </span>

        <button
          onClick={goNext}
          disabled={!hasNext}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium nav-btn ${
            hasNext
              ? 'bg-chain-600 text-white hover:bg-chain-500'
              : 'text-surface-600 cursor-default'
          }`}
        >
          다음 →
        </button>
      </div>
    </div>
  )
}
