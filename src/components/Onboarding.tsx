import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/stores/useAppStore'

const slides = [
  {
    emoji: '🌅',
    title: '하루를 영어로 살아보세요',
    desc: '아침 기상부터 취침까지,\n당신의 하루를 영어로 표현하는 여정',
  },
  {
    emoji: '🔗',
    title: '4단계 이중회로 학습법',
    desc: '입영작 → 낭독 → 오감연결 → 1분말하기\n한 문장을 4번 반복하며 체화합니다',
    stages: ['🟡 입영작', '🔵 낭독', '🟢 오감연결', '🔴 1분말하기'],
  },
  {
    emoji: '🗺️',
    title: '5,832개의 여정',
    desc: '8번의 선택이 만드는 나만의 하루\n매일 다른 길을 걸어보세요',
    cta: true,
  },
]

export default function Onboarding() {
  const [slide, setSlide] = useState(0)
  const { setOnboarded } = useAppStore()
  const current = slides[slide]

  const next = () => {
    if (slide < slides.length - 1) setSlide(slide + 1)
    else setOnboarded()
  }

  return (
    <div className="flex flex-col h-dvh bg-surface-950 items-center justify-center px-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.3 }}
          className="text-center max-w-sm"
        >
          <div className="text-6xl mb-6">{current.emoji}</div>
          <h2 className="text-2xl font-bold text-white mb-3">{current.title}</h2>
          <p className="text-surface-400 text-sm whitespace-pre-line leading-relaxed mb-6">
            {current.desc}
          </p>

          {current.stages && (
            <div className="flex justify-center gap-2 mb-6 flex-wrap">
              {current.stages.map((s) => (
                <span key={s} className="px-3 py-1 rounded-full bg-surface-800 text-surface-200 text-xs font-medium">
                  {s}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="flex gap-2 mb-8">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${
              i === slide ? 'bg-chain-500 w-6' : 'bg-surface-700'
            }`}
          />
        ))}
      </div>

      {/* Action */}
      <button
        onClick={next}
        className="w-full max-w-sm py-3.5 rounded-xl bg-chain-600 text-white font-semibold text-base hover:bg-chain-500 transition-colors nav-btn"
      >
        {slide === slides.length - 1 ? '시작하기' : '다음'}
      </button>

      {slide < slides.length - 1 && (
        <button
          onClick={setOnboarded}
          className="mt-3 text-xs text-surface-500 hover:text-surface-400 transition-colors"
        >
          건너뛰기
        </button>
      )}
    </div>
  )
}
