import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TimeBlock, PathItem } from '@/data/types'
import { cards } from '@/data/cards'
import { CHOICE_POINTS } from '@/data/choices'
import { checkStreak } from '@/lib/streak'

interface AppState {
  // Navigation
  currentIndex: number
  activeTimeBlock: TimeBlock | null

  // Branching
  chosenBranches: Record<string, string>  // choiceId -> chosen branch key

  // Progress
  stageProgress: Record<number, number>   // cardId -> current stage (1-4, 5=done)
  completedCards: number[]

  // XP & Levels
  xp: number
  level: number
  pendingXp: number | null  // for toast display
  addXp: (amount: number) => void
  clearPendingXp: () => void

  // Streak
  streak: number
  lastActiveDate: string | null
  bestStreak: number
  updateStreak: () => void

  // Settings
  autoPlayTts: boolean
  setAutoPlayTts: (v: boolean) => void
  hasOnboarded: boolean
  setOnboarded: () => void

  // Actions
  setCurrentIndex: (i: number) => void
  goNext: () => void
  goPrev: () => void
  setTimeBlock: (tb: TimeBlock | null) => void
  chooseBranch: (choiceId: string, branch: string) => void
  advanceStage: (cardId: number) => void
  resetCard: (cardId: number) => void
  resetAll: () => void

  // Derived
  buildPath: () => PathItem[]
  totalCards: () => number
  totalProgress: () => number
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentIndex: 0,
      activeTimeBlock: null,
      chosenBranches: {},
      stageProgress: {},
      completedCards: [],

      // XP & Levels
      xp: 0,
      level: 1,
      pendingXp: null,

      addXp: (amount) => {
        const prev = get().xp
        const next = prev + amount
        const newLevel = Math.min(10, Math.floor(next / 100) + 1)
        set({ xp: next, level: newLevel, pendingXp: amount })
      },

      clearPendingXp: () => set({ pendingXp: null }),

      // Streak
      streak: 0,
      lastActiveDate: null,
      bestStreak: 0,

      updateStreak: () => {
        const { lastActiveDate, streak, bestStreak } = get()
        const result = checkStreak(lastActiveDate)
        const newStreak = result.reset ? 1 : streak + (result.increment ? 1 : 0)
        const today = new Date().toISOString().slice(0, 10)
        set({
          streak: newStreak,
          lastActiveDate: today,
          bestStreak: Math.max(bestStreak, newStreak),
        })
      },

      // Settings
      autoPlayTts: false,
      setAutoPlayTts: (v) => set({ autoPlayTts: v }),
      hasOnboarded: false,
      setOnboarded: () => set({ hasOnboarded: true }),

      setCurrentIndex: (i) => set({ currentIndex: i }),

      goNext: () => {
        const path = get().buildPath()
        const next = Math.min(get().currentIndex + 1, path.length - 1)
        set({ currentIndex: next })
      },

      goPrev: () => {
        const prev = Math.max(get().currentIndex - 1, 0)
        set({ currentIndex: prev })
      },

      setTimeBlock: (tb) => set({ activeTimeBlock: tb, currentIndex: 0 }),

      chooseBranch: (choiceId, branch) => {
        const newChoices = { ...get().chosenBranches, [choiceId]: branch }
        set({ chosenBranches: newChoices })
        get().addXp(5) // choice made = +5 XP
      },

      advanceStage: (cardId) => {
        const current = get().stageProgress[cardId] ?? 1
        if (current >= 5) return
        const next = current + 1
        const newProgress = { ...get().stageProgress, [cardId]: next }

        if (next === 5) {
          const completed = get().completedCards.includes(cardId)
            ? get().completedCards
            : [...get().completedCards, cardId]
          set({ stageProgress: newProgress, completedCards: completed })
        } else {
          set({ stageProgress: newProgress })
        }
      },

      resetCard: (cardId) => {
        const newProgress = { ...get().stageProgress }
        delete newProgress[cardId]
        set({
          stageProgress: newProgress,
          completedCards: get().completedCards.filter((id) => id !== cardId),
        })
      },

      resetAll: () => set({
        stageProgress: {},
        completedCards: [],
        currentIndex: 0,
        chosenBranches: {},
      }),

      buildPath: () => {
        const chosen = get().chosenBranches
        const tb = get().activeTimeBlock
        const path: PathItem[] = []

        // Get all segments in order
        const maxSegment = Math.max(...cards.map((c) => c.segment), ...CHOICE_POINTS.map((cp) => cp.segment))

        for (let seg = 1; seg <= maxSegment; seg++) {
          // Common cards for this segment
          const commonCards = cards
            .filter((c) => c.segment === seg && c.branch === 'common')
            .filter((c) => !tb || c.timeBlock === tb)

          // Check if there's a choice point for this segment
          const choicePoint = CHOICE_POINTS.find((cp) => cp.segment === seg)

          if (choicePoint) {
            // If timeBlock filter is active and doesn't match, skip
            if (tb && choicePoint.timeBlock !== tb) continue

            if (chosen[choicePoint.id]) {
              // Branch chosen — show branch cards
              const branchCards = cards
                .filter((c) => c.segment === seg && c.branch === chosen[choicePoint.id])
                .filter((c) => !tb || c.timeBlock === tb)
              branchCards.forEach((c) => path.push({ type: 'card', card: c }))
            } else {
              // Not chosen yet — show choice point
              path.push({ type: 'choice', choice: choicePoint })
            }
          } else {
            // No choice — just common cards
            commonCards.forEach((c) => path.push({ type: 'card', card: c }))
          }
        }

        return path
      },

      totalCards: () => {
        const chosen = get().chosenBranches
        return cards.filter((c) => {
          if (c.branch === 'common') return true
          const cp = CHOICE_POINTS.find((cp) => cp.segment === c.segment)
          return cp && chosen[cp.id] === c.branch
        }).length
      },

      totalProgress: () => {
        const total = get().totalCards()
        if (total === 0) return 0
        const chosen = get().chosenBranches
        const pathCardIds = cards.filter((c) => {
          if (c.branch === 'common') return true
          const cp = CHOICE_POINTS.find((p) => p.segment === c.segment)
          return cp && chosen[cp.id] === c.branch
        }).map((c) => c.id)
        const done = get().completedCards.filter((id) => pathCardIds.includes(id)).length
        return Math.round((done / total) * 100)
      },
    }),
    {
      name: 'ec_progress',
      partialize: (state) => ({
        stageProgress: state.stageProgress,
        completedCards: state.completedCards,
        currentIndex: state.currentIndex,
        activeTimeBlock: state.activeTimeBlock,
        chosenBranches: state.chosenBranches,
        xp: state.xp,
        level: state.level,
        streak: state.streak,
        lastActiveDate: state.lastActiveDate,
        bestStreak: state.bestStreak,
        autoPlayTts: state.autoPlayTts,
        hasOnboarded: state.hasOnboarded,
      }),
    },
  ),
)
