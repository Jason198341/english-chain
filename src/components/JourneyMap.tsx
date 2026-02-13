import { useAppStore } from '@/stores/useAppStore'
import { CHOICE_POINTS } from '@/data/choices'
import { cards } from '@/data/cards'
import { TIME_BLOCKS } from '@/data/types'
import type { TimeBlock } from '@/data/types'

/** Color gradient from morning → night */
const TB_COLORS: Record<TimeBlock, string> = {
  morning: 'from-amber-500 to-orange-400',
  commute: 'from-blue-400 to-cyan-400',
  daytime: 'from-blue-500 to-indigo-500',
  lunch: 'from-emerald-500 to-green-400',
  afternoon: 'from-indigo-500 to-violet-500',
  'commute-pm': 'from-orange-500 to-amber-400',
  evening: 'from-rose-500 to-pink-400',
  night: 'from-violet-600 to-purple-500',
}

const TB_BG: Record<TimeBlock, string> = {
  morning: 'bg-amber-500',
  commute: 'bg-blue-400',
  daytime: 'bg-blue-500',
  lunch: 'bg-emerald-500',
  afternoon: 'bg-indigo-500',
  'commute-pm': 'bg-orange-500',
  evening: 'bg-rose-500',
  night: 'bg-violet-600',
}

interface MapRow {
  segment: number
  type: 'common' | 'choice'
  timeBlock: TimeBlock
  time: string
  emoji: string
  label: string
  // choice-specific
  choiceId?: string
  chosenBranch?: string
  chosenLabel?: string
  chosenEmoji?: string
  options?: { branch: string; label: string; emoji: string; chosen: boolean }[]
}

/** Calculate journey number (1-5832) from chosen branches */
function journeyNumber(chosenBranches: Record<string, string>): number {
  let index = 0
  let multiplier = 1

  // Process choice points in reverse order (last choice = least significant)
  for (let i = CHOICE_POINTS.length - 1; i >= 0; i--) {
    const cp = CHOICE_POINTS[i]
    const branchIdx = cp.options.findIndex((o) => o.branch === chosenBranches[cp.id])
    index += (branchIdx >= 0 ? branchIdx : 0) * multiplier
    multiplier *= cp.options.length
  }

  return index + 1 // 1-based
}

function buildMapData(chosenBranches: Record<string, string>): MapRow[] {
  const rows: MapRow[] = []

  for (let seg = 1; seg <= 16; seg++) {
    const cp = CHOICE_POINTS.find((c) => c.segment === seg)

    if (cp) {
      const chosen = chosenBranches[cp.id]
      const chosenOpt = cp.options.find((o) => o.branch === chosen)
      rows.push({
        segment: seg,
        type: 'choice',
        timeBlock: cp.timeBlock,
        time: cp.time,
        emoji: chosenOpt?.emoji ?? '?',
        label: chosenOpt?.label ?? '?',
        choiceId: cp.id,
        chosenBranch: chosen,
        chosenLabel: chosenOpt?.label,
        chosenEmoji: chosenOpt?.emoji,
        options: cp.options.map((o) => ({
          branch: o.branch,
          label: o.label,
          emoji: o.emoji,
          chosen: o.branch === chosen,
        })),
      })
    } else {
      // Common segment — pick first card as representative
      const segCards = cards.filter((c) => c.segment === seg && c.branch === 'common')
      if (segCards.length > 0) {
        const first = segCards[0]
        rows.push({
          segment: seg,
          type: 'common',
          timeBlock: first.timeBlock,
          time: first.time,
          emoji: first.emoji,
          label: segCards.map((c) => c.emoji).join(' '),
        })
      }
    }
  }

  return rows
}

export default function JourneyMap() {
  const { chosenBranches, completedCards, resetAll } = useAppStore()
  const rows = buildMapData(chosenBranches)
  const completed = completedCards.length
  const today = new Date()
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`
  const dayNames = ['일', '월', '화', '수', '목', '금', '토']
  const dayStr = dayNames[today.getDay()]

  // Generate a "journey signature" — unique color based on choices
  const choiceValues = Object.values(chosenBranches)
  const hash = choiceValues.join('-')
  const jNum = journeyNumber(chosenBranches)

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-surface-950">
      {/* Header */}
      <div className="text-center pt-6 pb-4 px-4">
        <p className="text-[10px] uppercase tracking-[0.3em] text-chain-400 mb-1">Journey Complete</p>
        <h2 className="text-2xl font-bold text-white mb-1">오늘의 여정</h2>
        <p className="text-surface-400 text-sm font-mono">{dateStr} ({dayStr})</p>
        <p className="mt-1 text-[11px] font-mono text-chain-500">
          Journey #{jNum.toLocaleString()} of 5,832
        </p>
        <div className="mt-3 flex items-center justify-center gap-4">
          <div className="text-center">
            <p className="text-xl font-bold text-chain-300">{completed}</p>
            <p className="text-[10px] text-surface-500">카드</p>
          </div>
          <div className="w-px h-8 bg-surface-700" />
          <div className="text-center">
            <p className="text-xl font-bold text-chain-300">{choiceValues.length}</p>
            <p className="text-[10px] text-surface-500">선택</p>
          </div>
          <div className="w-px h-8 bg-surface-700" />
          <div className="text-center">
            <p className="text-xl font-bold text-chain-300">
              {TIME_BLOCKS.length}
            </p>
            <p className="text-[10px] text-surface-500">시간대</p>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 px-6 pb-6">
        <div className="relative">
          {rows.map((row, i) => (
            <div key={row.segment} className="relative">
              {/* Connecting line to next */}
              {i < rows.length - 1 && (
                <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-gradient-to-b opacity-40"
                  style={{ backgroundImage: `linear-gradient(to bottom, var(--color-chain-500), var(--color-chain-700))` }}
                />
              )}

              <div className="flex items-start gap-3 pb-1">
                {/* Node */}
                <div className="relative z-10 shrink-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-lg ${
                      row.type === 'choice'
                        ? `bg-gradient-to-br ${TB_COLORS[row.timeBlock]} ring-2 ring-white/20`
                        : `${TB_BG[row.timeBlock]}/80`
                    }`}
                  >
                    {row.emoji}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-1.5">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] text-surface-500 font-mono">{row.time}</span>
                    {row.type === 'choice' && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-chain-600/20 text-chain-300 font-medium">
                        선택
                      </span>
                    )}
                  </div>

                  {row.type === 'choice' && row.options ? (
                    <div>
                      <p className="text-white font-semibold text-sm mb-1.5">{row.chosenLabel}</p>
                      {/* Branch options */}
                      <div className="flex gap-1.5 flex-wrap">
                        {row.options.map((opt) => (
                          <span
                            key={opt.branch}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${
                              opt.chosen
                                ? 'bg-chain-600/30 text-chain-200 font-semibold ring-1 ring-chain-500/30'
                                : 'bg-surface-800/50 text-surface-600'
                            }`}
                          >
                            {opt.emoji} {opt.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-surface-300 text-sm">{row.label}</p>
                  )}
                </div>
              </div>

              {/* Spacer between segments */}
              <div className="h-3" />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 px-4 pb-6 pt-2 space-y-3">
        {/* Journey signature line */}
        <div className="flex gap-1 justify-center">
          {rows
            .filter((r) => r.type === 'choice')
            .map((r) => (
              <div
                key={r.segment}
                className={`h-2 rounded-full bg-gradient-to-r ${TB_COLORS[r.timeBlock]}`}
                style={{ width: `${100 / 8}%` }}
              />
            ))}
        </div>
        <p className="text-center text-[10px] text-surface-600 font-mono">
          {hash}
        </p>

        <button
          onClick={resetAll}
          className="w-full py-3 rounded-xl bg-chain-600 text-white font-semibold text-sm hover:bg-chain-500 transition-colors nav-btn"
        >
          새로운 하루 시작하기
        </button>
      </div>
    </div>
  )
}
