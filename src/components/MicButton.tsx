import { useState } from 'react'
import { startListening, calcAccuracy } from '@/lib/speech'

interface Props {
  expectedText: string
  onResult: (accuracy: number) => void
}

export default function MicButton({ expectedText, onResult }: Props) {
  const [recording, setRecording] = useState(false)

  const handleMic = async () => {
    if (recording) return
    setRecording(true)
    try {
      const transcript = await startListening('en-US')
      const acc = calcAccuracy(expectedText, transcript)
      onResult(acc)
    } catch {
      // User denied or browser doesn't support
    } finally {
      setRecording(false)
    }
  }

  return (
    <button
      onClick={handleMic}
      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all nav-btn ${
        recording
          ? 'bg-red-500 text-white mic-pulse'
          : 'bg-stage-4/20 text-stage-4 hover:bg-stage-4/30'
      }`}
      aria-label={recording ? 'Recording...' : 'Start speaking'}
    >
      🎙️
    </button>
  )
}
