import { useState } from 'react'

interface Props {
  targetRef: React.RefObject<HTMLElement | null>
  journeyNumber: number
}

export default function ShareButton({ targetRef, journeyNumber }: Props) {
  const [sharing, setSharing] = useState(false)

  const handleShare = async () => {
    if (!targetRef.current || sharing) return
    setSharing(true)

    try {
      // Dynamic import to keep bundle size smaller
      const html2canvas = (await import('html2canvas-pro')).default
      const canvas = await html2canvas(targetRef.current, {
        backgroundColor: '#020617',
        scale: 2,
      })

      // Add watermark
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.font = '14px system-ui, sans-serif'
        ctx.fillStyle = 'rgba(148, 163, 184, 0.6)'
        ctx.textAlign = 'center'
        ctx.fillText(
          `English Chain — Journey #${journeyNumber.toLocaleString()} of 5,832`,
          canvas.width / 2,
          canvas.height - 16,
        )
      }

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png'),
      )
      if (!blob) return

      const file = new File([blob], `english-chain-journey-${journeyNumber}.png`, {
        type: 'image/png',
      })

      // Try Web Share API first (mobile), fallback to download
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: 'English Chain Journey',
          text: `Journey #${journeyNumber.toLocaleString()} of 5,832`,
          files: [file],
        })
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = file.name
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch {
      // User cancelled share or error
    } finally {
      setSharing(false)
    }
  }

  return (
    <button
      onClick={handleShare}
      disabled={sharing}
      className="w-full py-3 rounded-xl bg-surface-800 text-surface-300 font-medium text-sm hover:bg-surface-700 transition-colors nav-btn border border-surface-700 disabled:opacity-50"
    >
      {sharing ? '캡처 중...' : '📤 여정 공유하기'}
    </button>
  )
}
