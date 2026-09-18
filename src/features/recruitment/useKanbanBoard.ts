// Data and filter state for the kanban board. Filtering happens via the
// API (job_id/name query params), never client-side (DESIGN.md section 7).
import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../../api/client'
import { getGenericErrorMessage, isActingAsCustomerNotFound } from '../../api/errors'
import type { CandidateRead, JobRead, KanbanBoard, Stage } from '../../api/types'
import { useActingAs } from '../../context/ActingAsProvider'
import { useToast } from '../../context/ToastProvider'
import { STAGE_LABELS } from '../candidates/stageLabels'
import { moveCandidateInBoard } from './kanbanBoardHelpers'

const NAME_FILTER_DEBOUNCE_MS = 300

function buildEmptyBoard(): KanbanBoard {
  return { new: [], screening: [], interview: [], offer: [], hired: [], rejected: [] }
}

export function useKanbanBoard() {
  const { customerId } = useActingAs()
  const { showToast } = useToast()

  const [jobs, setJobs] = useState<JobRead[]>([])
  const [board, setBoard] = useState<KanbanBoard | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  const [jobFilter, setJobFilter] = useState<string | null>(null)
  const [nameFilter, setNameFilter] = useState('')
  const [debouncedNameFilter, setDebouncedNameFilter] = useState('')
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    const timeout = setTimeout(
      () => setDebouncedNameFilter(nameFilter.trim()),
      NAME_FILTER_DEBOUNCE_MS,
    )
    return () => clearTimeout(timeout)
  }, [nameFilter])

  // Also feeds the job-title map on cards - job_id is all CandidateRead has.
  useEffect(() => {
    let cancelled = false
    apiFetch<JobRead[]>('/jobs')
      .then((result) => {
        if (!cancelled) {
          setJobs(result)
        }
      })
      .catch((error: unknown) => {
        // The acting-as-customer-cleared toast is already shown centrally;
        // this hook's own effects will re-run once that clears.
        if (!cancelled && !isActingAsCustomerNotFound(error)) {
          showToast(getGenericErrorMessage(error))
        }
      })
    return () => {
      cancelled = true
    }
  }, [customerId, showToast])

  // reloadToken has no bearing on the request itself - it exists purely so
  // the "Försök igen" button (see KanbanBoard.tsx) can force this effect to
  // re-run without needing a useCallback wrapper for a plain re-fetch.
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError(false)

    const params = new URLSearchParams()
    if (jobFilter) {
      params.set('job_id', jobFilter)
    }
    if (debouncedNameFilter) {
      params.set('name', debouncedNameFilter)
    }
    const query = params.toString()

    apiFetch<KanbanBoard>(`/candidates/kanban${query ? `?${query}` : ''}`)
      .then((result) => {
        if (!cancelled) {
          setBoard(result)
        }
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return
        }
        if (!isActingAsCustomerNotFound(error)) {
          setLoadError(true)
          showToast(getGenericErrorMessage(error))
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [customerId, jobFilter, debouncedNameFilter, reloadToken, showToast])

  const reload = useCallback(() => setReloadToken((token) => token + 1), [])

  const jobTitleById = useMemo(() => new Map(jobs.map((job) => [job.id, job.title])), [jobs])

  const moveCandidate = useCallback(
    async (candidate: CandidateRead, targetStage: Stage) => {
      if (!board || candidate.stage === targetStage) {
        return
      }

      const previousBoard = board
      setBoard(moveCandidateInBoard(board, candidate, targetStage))

      try {
        await apiFetch(`/candidates/${candidate.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ stage: targetStage }),
        })
        showToast(
          `Kandidaten har flyttats — ${candidate.name} flyttades till ${STAGE_LABELS[targetStage]}.`,
        )
      } catch (error) {
        setBoard(previousBoard)
        if (!isActingAsCustomerNotFound(error)) {
          showToast(getGenericErrorMessage(error))
        }
      }
    },
    [board, showToast],
  )

  return {
    board: board ?? buildEmptyBoard(),
    jobs,
    jobTitleById,
    loading,
    loadError,
    jobFilter,
    setJobFilter,
    nameFilter,
    setNameFilter,
    moveCandidate,
    reload,
  }
}
