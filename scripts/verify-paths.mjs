/**
 * Verify all 5,832 journey paths produce valid card sequences.
 * Run: node scripts/verify-paths.mjs
 */
import { readFileSync } from 'fs'

// ─── Parse cards.ts — extract fields line by line ─────────────────
const cardsSrc = readFileSync('src/data/cards.ts', 'utf8')
const lines = cardsSrc.split('\n')
const cards = []
let cur = null
for (const line of lines) {
  const idM = line.match(/^\s*id:\s*(\d+)/)
  if (idM) { cur = { id: +idM[1] }; continue }
  if (!cur) continue
  const segM = line.match(/^\s*segment:\s*(\d+)/)
  if (segM) { cur.segment = +segM[1]; continue }
  const brM = line.match(/^\s*branch:\s*'([^']+)'/)
  if (brM) { cur.branch = brM[1]; continue }
  const tbM = line.match(/^\s*timeBlock:\s*'([^']+)'/)
  if (tbM) { cur.timeBlock = tbM[1]; cards.push(cur); cur = null }
}

// ─── Parse choices.ts ─────────────────────────────────────────────
const choicesSrc = readFileSync('src/data/choices.ts', 'utf8')
const choiceBlocks = choicesSrc.match(/\{[^{}]*id:\s*'[^']+',\s*segment:\s*\d+[^}]*options:\s*\[[^\]]+\][^}]*\}/gs) || []
const CHOICE_POINTS = choiceBlocks.map(block => {
  const id = block.match(/id:\s*'([^']+)'/)[1]
  const segment = +block.match(/segment:\s*(\d+)/)[1]
  const branches = [...block.matchAll(/branch:\s*'([^']+)'/g)].map(m => m[1])
  return { id, segment, branches }
})

// ─── buildPath replica ────────────────────────────────────────────
function buildPath(chosenBranches) {
  const maxSeg = Math.max(...cards.map(c => c.segment), ...CHOICE_POINTS.map(cp => cp.segment))
  const path = []

  for (let seg = 1; seg <= maxSeg; seg++) {
    const cp = CHOICE_POINTS.find(c => c.segment === seg)

    if (cp) {
      if (chosenBranches[cp.id]) {
        const branchCards = cards.filter(c => c.segment === seg && c.branch === chosenBranches[cp.id])
        branchCards.forEach(c => path.push({ type: 'card', card: c }))
      }
    } else {
      const commonCards = cards.filter(c => c.segment === seg && c.branch === 'common')
      commonCards.forEach(c => path.push({ type: 'card', card: c }))
    }
  }
  return path
}

// ─── Generate all combinations ────────────────────────────────────
function* allCombinations(choices) {
  if (choices.length === 0) { yield {}; return }
  const [first, ...rest] = choices
  for (const branch of first.branches) {
    for (const combo of allCombinations(rest)) {
      yield { [first.id]: branch, ...combo }
    }
  }
}

// ─── Verify ───────────────────────────────────────────────────────
let total = 0
let passed = 0
let failed = 0
const failures = []
const cardCounts = new Map()

for (const combo of allCombinations(CHOICE_POINTS)) {
  total++
  const path = buildPath(combo)
  const cardItems = path.filter(p => p.type === 'card')
  const count = cardItems.length

  // Track distribution
  cardCounts.set(count, (cardCounts.get(count) || 0) + 1)

  // Validate: should have cards from all 16 segments (8 common + 8 choice)
  const segsHit = new Set(cardItems.map(p => p.card.segment))
  const expectedSegs = new Set()
  for (let s = 1; s <= 16; s++) expectedSegs.add(s)

  const missingSegs = [...expectedSegs].filter(s => !segsHit.has(s))

  if (missingSegs.length > 0 || count === 0) {
    failed++
    if (failures.length < 10) {
      const sig = Object.values(combo).join('-')
      failures.push({ sig, count, missingSegs })
    }
  } else {
    passed++
  }
}

// ─── Report ───────────────────────────────────────────────────────
console.log('╔══════════════════════════════════════════╗')
console.log('║   ENGLISH CHAIN — 5,832 PATH VERIFIER   ║')
console.log('╚══════════════════════════════════════════╝')
console.log()
console.log(`Total paths tested:  ${total}`)
console.log(`Passed:              ${passed}`)
console.log(`Failed:              ${failed}`)
console.log()
console.log('Card count distribution:')
const sorted = [...cardCounts.entries()].sort((a, b) => a[0] - b[0])
for (const [count, freq] of sorted) {
  console.log(`  ${count} cards → ${freq} paths`)
}

if (failures.length > 0) {
  console.log('\nFirst failures:')
  for (const f of failures) {
    console.log(`  ${f.sig} → ${f.count} cards, missing segs: [${f.missingSegs}]`)
  }
}

console.log()
console.log(failed === 0 ? '✅ ALL 5,832 PATHS VALID!' : `❌ ${failed} PATHS FAILED`)
process.exit(failed > 0 ? 1 : 0)
