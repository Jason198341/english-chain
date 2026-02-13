import { motion } from 'framer-motion'
import { useAppStore } from '@/stores/useAppStore'
import type { ChoicePoint } from '@/data/types'
import { TIME_BLOCKS } from '@/data/types'

interface Props {
  choice: ChoicePoint
}

export default function ChoiceCard({ choice }: Props) {
  const chooseBranch = useAppStore((s) => s.chooseBranch)
  const timeBlock = TIME_BLOCKS.find((tb) => tb.id === choice.timeBlock)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base">{timeBlock?.emoji}</span>
          <span className="text-[11px] text-surface-500 font-mono">{choice.time}</span>
        </div>

        {/* Question card */}
        <div className="rounded-xl p-4 bg-surface-800 card-shadow">
          <p className="text-surface-400 text-[10px] mb-1 uppercase tracking-wider">
            갈림길
          </p>
          <p className="text-white font-bold text-lg leading-snug mb-1">
            {choice.question}
          </p>
          <p className="text-surface-400 text-sm">
            {choice.questionEn}
          </p>
        </div>
      </div>

      {/* Options */}
      <div className="flex-1 overflow-y-auto px-4 pb-20 space-y-3 pt-2">
        {choice.options.map((opt, i) => (
          <motion.button
            key={opt.branch}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 25 }}
            onClick={() => chooseBranch(choice.id, opt.branch)}
            className="w-full text-left rounded-xl p-4 bg-surface-800/80 border border-surface-700/40 hover:border-chain-500/40 hover:bg-surface-800 active:scale-[0.98] transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-surface-700/60 flex items-center justify-center text-2xl shrink-0 group-hover:bg-chain-600/20 transition-colors">
                {opt.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-white font-semibold text-[15px]">{opt.label}</p>
                  <p className="text-surface-400 text-xs">{opt.labelEn}</p>
                </div>
                <p className="text-surface-500 text-xs mt-0.5">{opt.description}</p>
              </div>
              <span className="text-surface-600 group-hover:text-chain-400 transition-colors text-sm">
                →
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
