// Composes job and candidate data into the jobs table's rows (with a
// computed candidate count - see countCandidatesByJob.ts) and exposes the
// create/update/delete mutations the table's modals and dialogs call.
import { useMemo } from 'react'
import { apiFetch } from '../../api/client'
import type { JobCreate, JobRead, JobUpdate } from '../../api/types'
import { useCandidates } from '../candidates/useCandidates'
import { countCandidatesByJob } from './countCandidatesByJob'
import type { JobStatus } from './jobStatus'
import { useJobs } from './useJobs'

export interface JobWithCandidateCount extends JobRead {
  candidateCount: number
}

export function useJobsList() {
  const {
    jobs,
    loading: jobsLoading,
    loadError: jobsLoadError,
    reload: reloadJobs,
  } = useJobs()
  const {
    candidates,
    loading: candidatesLoading,
    loadError: candidatesLoadError,
    reload: reloadCandidates,
  } = useCandidates()

  const candidateCounts = useMemo(() => countCandidatesByJob(candidates), [candidates])

  const jobsWithCounts: JobWithCandidateCount[] = useMemo(
    () => jobs.map((job) => ({ ...job, candidateCount: candidateCounts.get(job.id) ?? 0 })),
    [jobs, candidateCounts],
  )

  function reload() {
    reloadJobs()
    reloadCandidates()
  }

  async function createJob(input: { title: string; description: string }): Promise<void> {
    const body: JobCreate = { title: input.title, description: input.description, status: 'active' }
    await apiFetch<JobRead>('/jobs', { method: 'POST', body: JSON.stringify(body) })
    reloadJobs()
  }

  async function updateJob(
    jobId: string,
    input: { title: string; description: string; status: JobStatus },
  ): Promise<void> {
    const body: JobUpdate = {
      title: input.title,
      description: input.description,
      status: input.status,
    }
    await apiFetch<JobRead>(`/jobs/${jobId}`, { method: 'PATCH', body: JSON.stringify(body) })
    reloadJobs()
  }

  async function deleteJob(jobId: string): Promise<void> {
    // Rejects with an ApiError (409) if the job still has candidates - the
    // caller (DeleteJobDialog) checks the status itself rather than this
    // hook swallowing or reinterpreting it.
    await apiFetch<void>(`/jobs/${jobId}`, { method: 'DELETE' })
    reloadJobs()
  }

  return {
    jobs: jobsWithCounts,
    loading: jobsLoading || candidatesLoading,
    loadError: jobsLoadError || candidatesLoadError,
    reload,
    createJob,
    updateJob,
    deleteJob,
  }
}
