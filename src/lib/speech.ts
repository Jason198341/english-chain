// Web Speech API wrapper — $0 cost, browser-native

let voices: SpeechSynthesisVoice[] = []

/** Pre-load available voices (Chrome requires user gesture context) */
export function preloadVoices(): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  const load = () => {
    voices = window.speechSynthesis.getVoices()
  }
  load()
  window.speechSynthesis.onvoiceschanged = load
}

function getEnVoice(): SpeechSynthesisVoice | undefined {
  if (voices.length === 0) voices = window.speechSynthesis.getVoices()
  return (
    voices.find((v) => v.lang === 'en-US' && v.localService) ||
    voices.find((v) => v.lang.startsWith('en-US')) ||
    voices.find((v) => v.lang.startsWith('en'))
  )
}

/** Speak text using Web Speech API */
export function speak(text: string, lang = 'en-US'): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      reject(new Error('Speech synthesis not supported'))
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = 0.9
    utterance.pitch = 1
    const voice = getEnVoice()
    if (voice) utterance.voice = voice
    utterance.onend = () => resolve()
    utterance.onerror = (e) => reject(e)
    window.speechSynthesis.speak(utterance)
  })
}

/** Stop any ongoing speech */
export function stopSpeaking(): void {
  if (window.speechSynthesis) window.speechSynthesis.cancel()
}

// --- STT (Speech-to-Text) ---

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
}

/** Start listening and return transcript */
export function startListening(lang = 'en-US'): Promise<string> {
  return new Promise((resolve, reject) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      reject(new Error('Speech recognition not supported'))
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = lang
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript
      resolve(transcript)
    }
    recognition.onerror = (e: any) => reject(e)
    recognition.onend = () => {} // handled by onresult
    recognition.start()
  })
}

/** Calculate accuracy between expected and actual text (0-100) */
export function calcAccuracy(expected: string, actual: string): number {
  const a = expected.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
  const b = actual.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
  if (a === b) return 100
  if (!a || !b) return 0

  // Levenshtein distance on words
  const wordsA = a.split(/\s+/)
  const wordsB = b.split(/\s+/)
  const m = wordsA.length
  const n = wordsB.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = wordsA[i - 1] === wordsB[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }

  const dist = dp[m][n]
  const maxLen = Math.max(m, n)
  return Math.round(((maxLen - dist) / maxLen) * 100)
}
