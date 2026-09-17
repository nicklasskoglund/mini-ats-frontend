import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { CandidateRead } from '../../api/types'
import { AiAssessmentPanel } from './AiAssessmentPanel'

function buildCandidate(overrides: Partial<CandidateRead> = {}): CandidateRead {
  return {
    id: 'candidate-1',
    job_id: 'job-1',
    name: 'Anna Andersson',
    email: 'anna@example.com',
    phone: null,
    linkedin_url: null,
    cv_text: null,
    notes: null,
    stage: 'new',
    ai_score: null,
    ai_summary: null,
    ai_strengths: null,
    ai_gaps: null,
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('AiAssessmentPanel', () => {
  it('state 2: shows "Lägg till CV-text först" with a disabled button when there is no CV text', () => {
    render(<AiAssessmentPanel candidate={buildCandidate({ cv_text: null })} onAssess={vi.fn()} />)

    expect(screen.getByText('Lägg till CV-text först')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Kör AI-bedömning' })).toBeDisabled()
  })

  it('state 1: shows "Ingen bedömning ännu" with an enabled button once CV text exists', () => {
    render(
      <AiAssessmentPanel candidate={buildCandidate({ cv_text: 'CV', ai_score: null })} onAssess={vi.fn()} />,
    )

    expect(screen.getByText('Ingen bedömning ännu')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Kör AI-bedömning' })).toBeEnabled()
  })

  it('state 3: shows the analyzing state immediately on click, with no button visible', async () => {
    let resolveAssess: () => void = () => {}
    const onAssess = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveAssess = resolve
        }),
    )
    render(
      <AiAssessmentPanel candidate={buildCandidate({ cv_text: 'CV', ai_score: null })} onAssess={onAssess} />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Kör AI-bedömning' }))

    expect(screen.getByText('Analyserar kandidat')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()

    resolveAssess()
    await vi.waitFor(() => expect(screen.queryByText('Analyserar kandidat')).not.toBeInTheDocument())
  })

  it('state 4: renders exactly the strengths and gaps returned, not a hardcoded 3/2', () => {
    const { container } = render(
      <AiAssessmentPanel
        candidate={buildCandidate({
          cv_text: 'CV',
          ai_score: 8,
          ai_summary: 'Stark kandidat.',
          ai_strengths: ['Kommunikation', 'Ledarskap', 'Teknik', 'Erfarenhet'],
          ai_gaps: ['Saknar molnerfarenhet'],
        })}
        onAssess={vi.fn()}
      />,
    )

    expect(screen.getByText('8/10')).toBeInTheDocument()
    expect(screen.getByText('Stark kandidat.')).toBeInTheDocument()
    expect(container.querySelectorAll('.ai-assessment-panel__strengths li')).toHaveLength(4)
    expect(container.querySelectorAll('.ai-assessment-panel__gaps li')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Kör om bedömning' })).toBeInTheDocument()
  })

  it('state 4: renders no strengths/gaps list at all when the array is empty', () => {
    const { container } = render(
      <AiAssessmentPanel
        candidate={buildCandidate({ cv_text: 'CV', ai_score: 5, ai_strengths: [], ai_gaps: [] })}
        onAssess={vi.fn()}
      />,
    )

    expect(container.querySelector('.ai-assessment-panel__strengths')).toBeNull()
    expect(container.querySelector('.ai-assessment-panel__gaps')).toBeNull()
  })

  it('state 5: shows the failed state when the first run fails', async () => {
    const onAssess = vi.fn().mockRejectedValue(new Error('boom'))
    render(
      <AiAssessmentPanel candidate={buildCandidate({ cv_text: 'CV', ai_score: null })} onAssess={onAssess} />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Kör AI-bedömning' }))

    await screen.findByText('Något gick fel')
    expect(
      screen.getByText('Vi kunde inte genomföra analysen just nu. Försök igen om en stund.'),
    ).toBeInTheDocument()
  })

  it('state 5: hides the previous score/summary entirely when a re-run fails, no inline error', async () => {
    const onAssess = vi.fn().mockRejectedValue(new Error('boom'))
    render(
      <AiAssessmentPanel
        candidate={buildCandidate({
          cv_text: 'CV',
          ai_score: 9,
          ai_summary: 'Gammal sammanfattning',
          ai_strengths: ['Gammal styrka'],
        })}
        onAssess={onAssess}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Kör om bedömning' }))

    await screen.findByText('Något gick fel')
    expect(screen.queryByText('Gammal sammanfattning')).not.toBeInTheDocument()
    expect(screen.queryByText('Gammal styrka')).not.toBeInTheDocument()
    expect(screen.queryByText('9/10')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Försök igen' })).toBeInTheDocument()
  })

  it('resets to the current candidate data when the candidate changes after a failure', async () => {
    const onAssess = vi.fn().mockRejectedValue(new Error('boom'))
    const candidateA = buildCandidate({ id: 'candidate-1', cv_text: 'CV', ai_score: null })
    const { rerender } = render(<AiAssessmentPanel candidate={candidateA} onAssess={onAssess} />)

    fireEvent.click(screen.getByRole('button', { name: 'Kör AI-bedömning' }))
    await screen.findByText('Något gick fel')

    const candidateB = buildCandidate({ id: 'candidate-2', cv_text: null, ai_score: null })
    rerender(<AiAssessmentPanel candidate={candidateB} onAssess={vi.fn()} />)

    expect(screen.getByText('Lägg till CV-text först')).toBeInTheDocument()
  })

  describe('aborting the in-flight request', () => {
    it('aborts on unmount', () => {
      const abortSpy = vi.spyOn(AbortController.prototype, 'abort')
      const onAssess = vi.fn(() => new Promise<void>(() => {})) // never settles
      const { unmount } = render(
        <AiAssessmentPanel candidate={buildCandidate({ cv_text: 'CV', ai_score: null })} onAssess={onAssess} />,
      )

      fireEvent.click(screen.getByRole('button', { name: 'Kör AI-bedömning' }))
      unmount()

      expect(abortSpy).toHaveBeenCalledOnce()
      abortSpy.mockRestore()
    })

    it('aborts when the candidate changes on the same route', () => {
      const abortSpy = vi.spyOn(AbortController.prototype, 'abort')
      const onAssess = vi.fn(() => new Promise<void>(() => {})) // never settles
      const candidateA = buildCandidate({ id: 'candidate-a', cv_text: 'CV', ai_score: null })
      const { rerender } = render(<AiAssessmentPanel candidate={candidateA} onAssess={onAssess} />)

      fireEvent.click(screen.getByRole('button', { name: 'Kör AI-bedömning' }))
      rerender(
        <AiAssessmentPanel
          candidate={buildCandidate({ id: 'candidate-b', cv_text: 'CV', ai_score: null })}
          onAssess={vi.fn()}
        />,
      )

      expect(abortSpy).toHaveBeenCalledOnce()
      abortSpy.mockRestore()
    })

    it('does not flash the failed state for a candidate the user has already left', async () => {
      // Mirrors a real fetch: rejects with AbortError once its signal aborts.
      const onAssess = vi.fn(
        (signal: AbortSignal) =>
          new Promise<void>((_resolve, reject) => {
            signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
          }),
      )
      const candidateA = buildCandidate({ id: 'candidate-a', cv_text: 'CV', ai_score: null })
      const { rerender } = render(<AiAssessmentPanel candidate={candidateA} onAssess={onAssess} />)

      fireEvent.click(screen.getByRole('button', { name: 'Kör AI-bedömning' }))
      expect(screen.getByText('Analyserar kandidat')).toBeInTheDocument()

      const candidateB = buildCandidate({ id: 'candidate-b', cv_text: null, ai_score: null })
      rerender(<AiAssessmentPanel candidate={candidateB} onAssess={vi.fn()} />)

      // Give the aborted promise's rejection a tick to reach the catch
      // handler, then confirm it never overrides candidate B's own state.
      await vi.waitFor(() => {
        expect(screen.queryByText('Något gick fel')).not.toBeInTheDocument()
      })
      expect(screen.getByText('Lägg till CV-text först')).toBeInTheDocument()
    })

    it('shows the failed state when the request times out, instead of getting stuck on "Analyserar"', async () => {
      vi.useFakeTimers()
      try {
        // Never settles on its own - only the timeout's abort() ends it.
        const onAssess = vi.fn(
          (signal: AbortSignal) =>
            new Promise<void>((_resolve, reject) => {
              signal.addEventListener('abort', () => reject(new DOMException('Timed out', 'TimeoutError')))
            }),
        )
        render(
          <AiAssessmentPanel
            candidate={buildCandidate({ cv_text: 'CV', ai_score: null })}
            onAssess={onAssess}
          />,
        )

        fireEvent.click(screen.getByRole('button', { name: 'Kör AI-bedömning' }))
        expect(screen.getByText('Analyserar kandidat')).toBeInTheDocument()

        await act(async () => {
          await vi.advanceTimersByTimeAsync(40_000)
        })

        expect(screen.getByText('Något gick fel')).toBeInTheDocument()
        expect(screen.queryByText('Analyserar kandidat')).not.toBeInTheDocument()
      } finally {
        vi.useRealTimers()
      }
    })
  })
})
