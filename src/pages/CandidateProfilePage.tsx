// Route for "/candidates/:id" (DESIGN.md section 10): its own page, not a
// panel or dialog. Header, then four tabs.
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Stage } from '../api/types'
import { ActivitiesTab } from '../features/candidates/ActivitiesTab'
import { CandidateProfileHeader } from '../features/candidates/CandidateProfileHeader'
import { CvTab } from '../features/candidates/CvTab'
import { DeleteCandidateDialog } from '../features/candidates/DeleteCandidateDialog'
import { EditCandidateModal } from '../features/candidates/EditCandidateModal'
import { NotesTab } from '../features/candidates/NotesTab'
import { OverviewTab } from '../features/candidates/OverviewTab'
import { deleteCandidate, updateCandidate } from '../features/candidates/candidateMutations'
import { useCandidate } from '../features/candidates/useCandidate'
import { useJobs } from '../features/jobs/useJobs'
import './CandidateProfilePage.css'

type TabKey = 'overview' | 'cv' | 'notes' | 'activities'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Översikt' },
  { key: 'cv', label: 'CV' },
  { key: 'notes', label: 'Anteckningar' },
  { key: 'activities', label: 'Aktiviteter' },
]

export function CandidateProfilePage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { candidate, loading, loadError, reload } = useCandidate(id)
  const { jobs } = useJobs()
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const jobTitleById = useMemo(() => new Map(jobs.map((job) => [job.id, job.title])), [jobs])

  if (loading) {
    return null
  }

  if (loadError || !candidate) {
    return (
      <div className="candidate-profile-page__error">
        <p>Något gick fel. Försök igen.</p>
        <button type="button" onClick={reload}>
          Försök igen
        </button>
      </div>
    )
  }

  async function handleMove(targetStage: Stage) {
    await updateCandidate(id, { stage: targetStage })
    reload()
  }

  return (
    <div>
      <CandidateProfileHeader
        candidate={candidate}
        onMove={handleMove}
        onEdit={() => setEditing(true)}
        onDelete={() => setDeleting(true)}
      />

      <div className="candidate-profile-page__tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            className={
              activeTab === tab.key
                ? 'candidate-profile-page__tab candidate-profile-page__tab--active'
                : 'candidate-profile-page__tab'
            }
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="candidate-profile-page__panel">
        {activeTab === 'overview' && (
          <OverviewTab candidate={candidate} jobTitle={jobTitleById.get(candidate.job_id)} />
        )}
        {activeTab === 'cv' && (
          <CvTab
            candidate={candidate}
            onSave={(cvText) => updateCandidate(id, { cv_text: cvText }).then(() => reload())}
          />
        )}
        {activeTab === 'notes' && (
          <NotesTab
            candidate={candidate}
            onSave={(notes) => updateCandidate(id, { notes }).then(() => reload())}
          />
        )}
        {activeTab === 'activities' && <ActivitiesTab />}
      </div>

      {editing && (
        <EditCandidateModal
          candidate={candidate}
          onSubmit={(values) =>
            updateCandidate(id, {
              name: values.name,
              email: values.email,
              phone: values.phone || null,
              linkedin_url: values.linkedinUrl || null,
            }).then(() => reload())
          }
          onClose={() => setEditing(false)}
        />
      )}

      {deleting && (
        <DeleteCandidateDialog
          candidate={candidate}
          onDelete={(candidateId) => deleteCandidate(candidateId).then(() => navigate('/candidates'))}
          onClose={() => setDeleting(false)}
        />
      )}
    </div>
  )
}
