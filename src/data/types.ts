export type TimeBlock =
  | 'morning'      // 06:00-07:30 기상/아침
  | 'commute'      // 07:30-09:00 이동
  | 'daytime'      // 09:00-12:00 오전
  | 'lunch'        // 12:00-13:00 점심
  | 'afternoon'    // 13:00-18:00 오후
  | 'commute-pm'   // 18:00-19:00 퇴근
  | 'evening'      // 19:00-22:00 저녁/여가
  | 'night'        // 22:00-23:00 취침

export type StageId = 1 | 2 | 3 | 4

/** A branch key: 'common' for shared cards, anything else for branch-specific */
export type BranchKey = string

export interface Card {
  id: number
  segment: number          // 1-16, for ordering
  branch: BranchKey        // 'common' | 'eat' | 'skip' | 'bus' | etc.
  timeBlock: TimeBlock
  time: string
  scene: string
  korean: string
  english: string
  emoji: string
  stages: {
    respond: { hint: string }
    readAloud: { stress: string; ipa: string }
    sensory: { prompt: string }
    speak: { expandPrompt: string; sampleExpansion: string }
  }
}

export interface ChoiceOption {
  branch: BranchKey
  label: string
  labelEn: string
  emoji: string
  description: string
}

export interface ChoicePoint {
  id: string
  segment: number          // this choice gates this segment's branch cards
  timeBlock: TimeBlock
  time: string
  question: string
  questionEn: string
  options: ChoiceOption[]
}

/** Union type for path items */
export type PathItem =
  | { type: 'card'; card: Card }
  | { type: 'choice'; choice: ChoicePoint }

export interface TimeBlockInfo {
  id: TimeBlock
  label: string
  emoji: string
  color: string
  range: string
}

export const TIME_BLOCKS: TimeBlockInfo[] = [
  { id: 'morning', label: '아침', emoji: '🌅', color: 'text-morning', range: '06:00-07:30' },
  { id: 'commute', label: '이동', emoji: '🚇', color: 'text-work', range: '07:30-09:00' },
  { id: 'daytime', label: '오전', emoji: '💼', color: 'text-work', range: '09:00-12:00' },
  { id: 'lunch', label: '점심', emoji: '🍜', color: 'text-lunch', range: '12:00-13:00' },
  { id: 'afternoon', label: '오후', emoji: '📊', color: 'text-afternoon', range: '13:00-18:00' },
  { id: 'commute-pm', label: '퇴근', emoji: '🏠', color: 'text-evening', range: '18:00-19:00' },
  { id: 'evening', label: '저녁', emoji: '🍽️', color: 'text-evening', range: '19:00-22:00' },
  { id: 'night', label: '취침', emoji: '🌙', color: 'text-night', range: '22:00-23:00' },
]

export const STAGE_NAMES: Record<StageId, { ko: string; en: string; color: string }> = {
  1: { ko: '입영작', en: 'Respond', color: 'bg-stage-1' },
  2: { ko: '낭독', en: 'Read Aloud', color: 'bg-stage-2' },
  3: { ko: '오감연결', en: 'Sensory', color: 'bg-stage-3' },
  4: { ko: '1분말하기', en: 'Speak', color: 'bg-stage-4' },
}
