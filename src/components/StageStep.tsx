import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Card, StageId } from '@/data/types'
import { STAGE_NAMES } from '@/data/types'

interface Props {
  card: Card
  stageId: StageId
  status: 'completed' | 'active' | 'locked'
  onComplete: () => void
}

export default function StageStep({ card, stageId, status, onComplete }: Props) {
  const [revealed, setRevealed] = useState(false)
  const meta = STAGE_NAMES[stageId]

  const handleReveal = () => {
    if (!revealed) setRevealed(true)
  }

  const renderContent = () => {
    switch (stageId) {
      case 1: // 입영작 — respond
        return (
          <div className="space-y-3">
            <p className="text-surface-300 text-xs">
              한국어를 보고 영어로 말해보세요
            </p>
            <div className="bg-surface-900 rounded-lg p-3 border border-surface-700/50">
              <p className="text-base font-medium text-white">{card.korean}</p>
            </div>
            <div
              className={`rounded-lg p-3 transition-all cursor-pointer border ${
                revealed
                  ? 'bg-chain-600/10 border-chain-500/30 reveal-pulse'
                  : 'bg-surface-800/80 border-surface-700/30 hover:border-surface-600/50 active:scale-[0.98]'
              }`}
              onClick={handleReveal}
            >
              {revealed ? (
                <p className="text-chain-200 font-semibold">{card.english}</p>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-surface-400 font-mono text-sm">{card.stages.respond.hint}</p>
                  <span className="text-[10px] text-surface-500">tap</span>
                </div>
              )}
            </div>
            {revealed && (
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={onComplete}
                className="w-full py-2.5 rounded-lg bg-stage-1 text-white font-semibold text-sm nav-btn"
              >
                다음 단계 →
              </motion.button>
            )}
          </div>
        )

      case 2: // 낭독 — read aloud
        return (
          <div className="space-y-3">
            <p className="text-surface-300 text-xs">
              강세 표시를 보고 크게 3번 읽어보세요
            </p>
            <div className="bg-surface-900 rounded-lg p-3 space-y-2 border border-surface-700/50">
              <p className="text-lg font-semibold text-white leading-relaxed tracking-wide">
                {card.stages.readAloud.stress}
              </p>
              <p className="text-[11px] text-surface-400 font-mono">
                {card.stages.readAloud.ipa}
              </p>
            </div>
            <div className="flex items-center gap-2 text-surface-400">
              <div className="flex gap-1">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="w-5 h-5 rounded-full border border-surface-600 flex items-center justify-center text-[10px]">
                    {n}
                  </div>
                ))}
              </div>
              <span className="text-xs italic">3번 읽은 후 넘기세요</span>
            </div>
            <button
              onClick={onComplete}
              className="w-full py-2.5 rounded-lg bg-stage-2 text-white font-semibold text-sm nav-btn"
            >
              다음 단계 →
            </button>
          </div>
        )

      case 3: // 오감연결 — sensory
        return (
          <div className="space-y-3">
            <p className="text-surface-300 text-xs">
              눈을 감고 상황을 느끼며 영어로 말해보세요
            </p>
            <div className="bg-surface-900 rounded-lg p-4 border border-stage-3/20">
              <p className="text-surface-100 leading-relaxed italic text-sm">
                "{card.stages.sensory.prompt}"
              </p>
            </div>
            <div className="bg-surface-800/50 rounded-lg p-3 border border-surface-700/30">
              <p className="text-chain-200 font-medium text-sm">{card.english}</p>
            </div>
            <button
              onClick={onComplete}
              className="w-full py-2.5 rounded-lg bg-stage-3 text-white font-semibold text-sm nav-btn"
            >
              다음 단계 →
            </button>
          </div>
        )

      case 4: // 1분말하기 — speak
        return (
          <div className="space-y-3">
            <p className="text-surface-300 text-xs">
              1분 동안 자유롭게 확장하며 말해보세요
            </p>
            <div className="bg-surface-900 rounded-lg p-3 border border-stage-4/20">
              <p className="text-surface-100 font-medium text-sm">{card.stages.speak.expandPrompt}</p>
            </div>
            <div
              className={`rounded-lg p-3 cursor-pointer transition-all border ${
                revealed
                  ? 'bg-surface-800/80 border-surface-700/30'
                  : 'bg-surface-800/50 border-surface-700/20 hover:border-surface-600/40 active:scale-[0.98]'
              }`}
              onClick={handleReveal}
            >
              {revealed ? (
                <p className="text-surface-200 text-sm leading-relaxed">
                  {card.stages.speak.sampleExpansion}
                </p>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm">💡</span>
                  <span className="text-surface-400 text-xs">예시 답변 보기</span>
                </div>
              )}
            </div>
            <button
              onClick={onComplete}
              className="w-full py-2.5 rounded-lg bg-stage-4 text-white font-semibold text-sm nav-btn"
            >
              완료 ✓
            </button>
          </div>
        )
    }
  }

  return (
    <div className="relative">
      {/* Vertical connector line */}
      {stageId < 4 && (
        <div className="absolute left-[13px] top-7 bottom-0 w-px bg-surface-700/50" />
      )}

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-2">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-all duration-300 ${
            status === 'completed'
              ? 'bg-chain-600 text-white scale-90'
              : status === 'active'
                ? `${meta.color} text-white ring-2 ring-offset-2 ring-offset-surface-950 ring-${meta.color.replace('bg-', '')}/40`
                : 'bg-surface-800 text-surface-500 border border-surface-700'
          }`}
        >
          {status === 'completed' ? '✓' : stageId}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-semibold ${
              status === 'locked' ? 'text-surface-500' : 'text-surface-100'
            }`}
          >
            {meta.ko}
          </span>
          <span className={`text-[10px] ${status === 'locked' ? 'text-surface-600' : 'text-surface-400'}`}>
            {meta.en}
          </span>
        </div>
      </div>

      {/* Animated content */}
      <AnimatePresence>
        {status === 'active' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden ml-10"
          >
            <div className="pb-2">{renderContent()}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
