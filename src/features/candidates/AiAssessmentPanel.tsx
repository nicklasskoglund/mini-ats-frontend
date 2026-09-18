// AI assessment panel (DESIGN.md section 11): five states driven by a
// local "phase" plus the candidate's own data. Only "phase" is transient
// client state (idle/analyzing/failed) - never persisted, never polled,
// matching section 11's "the loading state exists only in the client".
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { CandidateRead } from '../../api/types'
import { deriveScoreLabel } from './candidateDisplay'
import './AiAssessmentPanel.css'

type Phase = 'idle' | 'analyzing' | 'failed'

interface AiAssessmentPanelProps {
  candidate: CandidateRead
  onAssess: (signal: AbortSignal) => Promise<void>
}

// The server call normally takes 15-30s (its own timeout against
// Anthropic is 20s, no retry - see app/services/ai_assessment.py). 40s
// gives reasonable margin without waiting needlessly long on a genuinely
// hung request.
const ASSESS_TIMEOUT_MS = 40_000

export function AiAssessmentPanel({ candidate, onAssess }: AiAssessmentPanelProps) {
  const [phase, setPhase] = useState<Phase>('idle')
  const abortControllerRef = useRef<AbortController | null>(null)

  // One cleanup path covers both unmounting (e.g. navigating away
  // entirely) and switching to a different candidate on the same route
  // (CandidateProfilePage doesn't remount on an id change) - React runs
  // this cleanup before the next effect body either way, so there's
  // nothing route-change-specific to handle separately. Tagged with a
  // reason (see handleRun's catch) so this specific abort stays silent
  // while a timeout abort still surfaces as a real failure.
  useEffect(() => {
    setPhase('idle')
    return () => {
      abortControllerRef.current?.abort('cleanup')
    }
  }, [candidate.id])

  async function handleRun() {
    const controller = new AbortController()
    abortControllerRef.current = controller
    const timeoutId = setTimeout(() => controller.abort('timeout'), ASSESS_TIMEOUT_MS)

    setPhase('analyzing')
    try {
      await onAssess(controller.signal)
      setPhase('idle')
    } catch {
      // Only a 'cleanup' abort (unmount or candidate switch, see the
      // effect above) is not a real failure - returning here avoids
      // flashing state 5 for a candidate the user has already left, and
      // avoids applying a stale response to whatever's now on screen. A
      // 'timeout' abort - or any other error - still surfaces as a
      // genuine failure; checking the reason instead of just
      // signal.aborted is what keeps these two apart.
      if (controller.signal.reason === 'cleanup') {
        return
      }
      setPhase('failed')
    } finally {
      clearTimeout(timeoutId)
    }
  }

  if (phase === 'analyzing') {
    return (
      <div className="ai-assessment-panel">
        <h3>Analyserar kandidat</h3>
        <div className="ai-assessment-panel__spinner" role="status" aria-label="Analyserar" />
        <p>Det tar vanligtvis 15–30 sekunder. Stanna kvar på sidan tills analysen är klar.</p>
        <p className="ai-assessment-panel__notice">
          ℹ️ Stäng inte sidan — om du lämnar sidan avbryts analysen och du behöver köra den
          igen.
        </p>
      </div>
    )
  }

  if (phase === 'failed') {
    return (
      <div className="ai-assessment-panel">
        <h3>Något gick fel</h3>
        <p>Vi kunde inte genomföra analysen just nu. Försök igen om en stund.</p>
        <button type="button" className="ai-assessment-panel__button" onClick={handleRun}>
          Försök igen
        </button>
      </div>
    )
  }

  if (!candidate.cv_text) {
    return (
      <div className="ai-assessment-panel">
        <h3>Lägg till CV-text först</h3>
        <p>Du behöver klistra in CV-texten på fliken CV innan en AI-bedömning kan göras.</p>
        <button type="button" className="ai-assessment-panel__button" disabled>
          Kör AI-bedömning
        </button>
      </div>
    )
  }

  if (candidate.ai_score == null) {
    return (
      <div className="ai-assessment-panel">
        <h3>Ingen bedömning ännu</h3>
        <p>Kör en AI-bedömning för att få en sammanfattning av kandidatens styrkor och luckor.</p>
        <button type="button" className="ai-assessment-panel__button" onClick={handleRun}>
          Kör AI-bedömning
        </button>
      </div>
    )
  }

  return (
    <div className="ai-assessment-panel">
      <div
        className="ai-assessment-panel__donut"
        style={{ '--ai-score-percent': `${(candidate.ai_score / 10) * 100}%` } as CSSProperties}
      >
        <span>{deriveScoreLabel(candidate.ai_score)}</span>
      </div>
      {candidate.ai_summary && <p className="ai-assessment-panel__summary">{candidate.ai_summary}</p>}
      {candidate.ai_strengths && candidate.ai_strengths.length > 0 && (
        <div>
          <h4>Styrkor</h4>
          <ul className="ai-assessment-panel__strengths">
            {candidate.ai_strengths.map((strength, index) => (
              // Index is safe here: the whole list is always replaced
              // together from a fresh assessment response, never
              // reordered/edited in place, and AI output could plausibly
              // repeat a string.
              <li key={index}>{strength}</li>
            ))}
          </ul>
        </div>
      )}
      {candidate.ai_gaps && candidate.ai_gaps.length > 0 && (
        <div>
          <h4>Luckor</h4>
          <ul className="ai-assessment-panel__gaps">
            {candidate.ai_gaps.map((gap, index) => (
              <li key={index}>{gap}</li>
            ))}
          </ul>
        </div>
      )}
      <button type="button" className="ai-assessment-panel__button" onClick={handleRun}>
        Kör om bedömning
      </button>
    </div>
  )
}
