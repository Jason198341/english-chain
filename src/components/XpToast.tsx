import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/stores/useAppStore'

export default function XpToast() {
  const { pendingXp, clearPendingXp } = useAppStore()

  useEffect(() => {
    if (pendingXp !== null) {
      const timer = setTimeout(clearPendingXp, 1500)
      return () => clearTimeout(timer)
    }
  }, [pendingXp, clearPendingXp])

  return (
    <AnimatePresence>
      {pendingXp !== null && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <div className="px-4 py-2 rounded-full bg-chain-600 text-white font-bold text-sm shadow-lg shadow-chain-600/30">
            +{pendingXp} XP
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
