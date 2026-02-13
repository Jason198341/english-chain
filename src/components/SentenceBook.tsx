import { cards } from '@/data/cards'
import { CHOICE_POINTS } from '@/data/choices'
import { TIME_BLOCKS } from '@/data/types'
import type { TimeBlock, Card } from '@/data/types'

const TB_GRADIENT: Record<TimeBlock, string> = {
  morning: 'from-amber-500/20 to-amber-500/0',
  commute: 'from-blue-400/20 to-blue-400/0',
  daytime: 'from-blue-500/20 to-blue-500/0',
  lunch: 'from-emerald-500/20 to-emerald-500/0',
  afternoon: 'from-indigo-500/20 to-indigo-500/0',
  'commute-pm': 'from-orange-500/20 to-orange-500/0',
  evening: 'from-rose-500/20 to-rose-500/0',
  night: 'from-violet-600/20 to-violet-600/0',
}

const TB_ACCENT: Record<TimeBlock, string> = {
  morning: 'bg-amber-500',
  commute: 'bg-blue-400',
  daytime: 'bg-blue-500',
  lunch: 'bg-emerald-500',
  afternoon: 'bg-indigo-500',
  'commute-pm': 'bg-orange-500',
  evening: 'bg-rose-500',
  night: 'bg-violet-600',
}

const TB_TEXT: Record<TimeBlock, string> = {
  morning: 'text-amber-400',
  commute: 'text-blue-300',
  daytime: 'text-blue-400',
  lunch: 'text-emerald-400',
  afternoon: 'text-indigo-400',
  'commute-pm': 'text-orange-400',
  evening: 'text-rose-400',
  night: 'text-violet-400',
}

const TB_PILL: Record<TimeBlock, string> = {
  morning: 'bg-amber-500/15 text-amber-300',
  commute: 'bg-blue-400/15 text-blue-300',
  daytime: 'bg-blue-500/15 text-blue-300',
  lunch: 'bg-emerald-500/15 text-emerald-300',
  afternoon: 'bg-indigo-500/15 text-indigo-300',
  'commute-pm': 'bg-orange-500/15 text-orange-300',
  evening: 'bg-rose-500/15 text-rose-300',
  night: 'bg-violet-600/15 text-violet-300',
}

/** Group cards by timeBlock in TIME_BLOCKS order */
function groupByTimeBlock(): { tb: TimeBlock; label: string; emoji: string; range: string; cards: Card[] }[] {
  return TIME_BLOCKS.map((info) => ({
    tb: info.id,
    label: info.label,
    emoji: info.emoji,
    range: info.range,
    cards: cards
      .filter((c) => c.timeBlock === info.id)
      .sort((a, b) => a.segment - b.segment || a.id - b.id),
  })).filter((g) => g.cards.length > 0)
}

function branchLabel(card: Card): string | null {
  if (card.branch === 'common') return null
  const cp = CHOICE_POINTS.find((c) => c.segment === card.segment)
  if (!cp) return null
  const opt = cp.options.find((o) => o.branch === card.branch)
  return opt ? `${opt.emoji} ${opt.label}` : card.branch
}

interface Props {
  onBack: () => void
}

export default function SentenceBook({ onBack }: Props) {
  const groups = groupByTimeBlock()
  const totalCount = cards.length

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-surface-950">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-surface-950/95 backdrop-blur-sm border-b border-surface-800/50">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-surface-400 hover:text-white transition-colors text-sm flex items-center gap-1"
          >
            <span className="text-lg leading-none">&larr;</span> Back
          </button>
          <div className="text-center">
            <h2 className="text-sm font-bold text-white">All Sentences</h2>
            <p className="text-[10px] text-surface-500">{totalCount} sentences across your day</p>
          </div>
          <div className="w-12" /> {/* spacer */}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 space-y-8">
        {groups.map((group) => {
          // Sub-group by branch for clarity
          const commonCards = group.cards.filter((c) => c.branch === 'common')
          const branchCards = group.cards.filter((c) => c.branch !== 'common')

          // Group branch cards by branch name
          const branchGroups = new Map<string, Card[]>()
          branchCards.forEach((c) => {
            const existing = branchGroups.get(c.branch) || []
            existing.push(c)
            branchGroups.set(c.branch, existing)
          })

          return (
            <section key={group.tb}>
              {/* Time block header */}
              <div className={`rounded-xl bg-gradient-to-r ${TB_GRADIENT[group.tb]} p-3 mb-3`}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${TB_ACCENT[group.tb]}`} />
                  <span className={`text-xs font-bold uppercase tracking-widest ${TB_TEXT[group.tb]}`}>
                    {group.emoji} {group.label}
                  </span>
                  <span className="text-[10px] text-surface-500 font-mono ml-auto">{group.range}</span>
                </div>
              </div>

              {/* Common cards */}
              {commonCards.length > 0 && (
                <div className="space-y-1 mb-3">
                  {commonCards.map((card) => (
                    <SentenceRow key={card.id} card={card} />
                  ))}
                </div>
              )}

              {/* Branch cards */}
              {[...branchGroups.entries()].map(([branch, bCards]) => {
                const label = branchLabel(bCards[0])
                return (
                  <div key={branch} className="mb-3">
                    {label && (
                      <div className="flex items-center gap-2 mb-1 ml-1">
                        <div className="w-4 border-t border-surface-700" />
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${TB_PILL[group.tb]} font-medium`}>
                          {label}
                        </span>
                        <div className="flex-1 border-t border-surface-700/50" />
                      </div>
                    )}
                    <div className="space-y-1 pl-2 border-l border-surface-800/60 ml-1">
                      {bCards.map((card) => (
                        <SentenceRow key={card.id} card={card} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </section>
          )
        })}

        {/* Footer stats */}
        <div className="text-center py-6 border-t border-surface-800/50">
          <p className="text-surface-500 text-xs">
            {totalCount} sentences &middot; {TIME_BLOCKS.length} time blocks &middot; {CHOICE_POINTS.length} choice points
          </p>
          <p className="text-surface-600 text-[10px] mt-1 font-mono">
            {CHOICE_POINTS.reduce((acc, cp) => acc * cp.options.length, 1).toLocaleString()} unique journeys
          </p>
        </div>
      </div>
    </div>
  )
}

function SentenceRow({ card }: { card: Card }) {
  return (
    <div className="group flex items-start gap-2.5 py-1.5 px-2 rounded-lg hover:bg-surface-900/50 transition-colors">
      <span className="text-base leading-none mt-0.5 shrink-0">{card.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-white text-[13px] leading-snug font-medium">{card.english}</p>
        <p className="text-surface-500 text-[11px] leading-snug mt-0.5">{card.korean}</p>
      </div>
      <span className="text-[10px] text-surface-600 font-mono shrink-0 mt-0.5">{card.time}</span>
    </div>
  )
}
