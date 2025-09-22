'use client'

import { useEffect, useMemo, useState } from 'react'

import CandidateModal from './CandidateModal'
import InterviewModal from './InterviewModal'
import type { CandidateSummary, JobDetails, JobListItem } from '@/lib/types/jobs'

type JobsResponse = { jobs: JobListItem[] }

type JobDetailsResponse = { job: JobDetails }

export default function Dashboard() {
  const [jobs, setJobs] = useState<JobListItem[]>([])
  const [jobsOpen, setJobsOpen] = useState(true)
  const [jobsLoading, setJobsLoading] = useState(false)
  const [jobsError, setJobsError] = useState<string | null>(null)

  const [selectedJobId, setSelectedJobId] = useState<number | null>(null)
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const controller = new AbortController()

    async function fetchJobs() {
      setJobsLoading(true)
      setJobsError(null)

      try {
        const response = await fetch('/api/jobs/list', {
          signal: controller.signal,
          cache: 'no-store'
        })

        if (!response.ok) {
          throw new Error(await response.text())
        }

        const payload: JobsResponse = await response.json()
        if (!active) return

        setJobs(payload.jobs ?? [])
        if ((payload.jobs?.length ?? 0) > 0) {
          setSelectedJobId((current) => current ?? payload.jobs[0].id)
        }
      } catch (error) {
        if (!active) return
        if ((error as Error).name === 'AbortError') return
        setJobsError('Impossible de charger vos annonces pour le moment.')
      } finally {
        if (active) {
          setJobsLoading(false)
        }
      }
    }

    fetchJobs()

    return () => {
      active = false
      controller.abort()
    }
  }, [])

  useEffect(() => {
    if (selectedJobId == null) {
      setJobDetails(null)
      return
    }

    let active = true
    const controller = new AbortController()

    async function fetchJobDetails(jobId: number) {
      setDetailsLoading(true)
      setDetailsError(null)

      try {
        const response = await fetch(`/api/jobs/${jobId}`, {
          signal: controller.signal,
          cache: 'no-store'
        })

        if (!response.ok) {
          throw new Error(await response.text())
        }

        const payload: JobDetailsResponse = await response.json()
        if (!active) return

        setJobDetails(payload.job)
      } catch (error) {
        if (!active) return
        if ((error as Error).name === 'AbortError') return
        setDetailsError('Impossible de charger les détails de l’annonce sélectionnée.')
        setJobDetails(null)
      } finally {
        if (active) {
          setDetailsLoading(false)
        }
      }
    }

    fetchJobDetails(selectedJobId)

    return () => {
      active = false
      controller.abort()
    }
  }, [selectedJobId])

  const selectedJobCandidates = useMemo(
    () => jobDetails?.candidates ?? [],
    [jobDetails]
  )

  const handleCandidateClick = (job: JobDetails, candidate: CandidateSummary) => {
    const evt = new CustomEvent('open-candidate', { detail: { job, candidate } })
    window.dispatchEvent(evt)
  }

  return (
    <main className="container">
      <div className="card" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16 }}>
        <aside>
          <button
            className="button"
            type="button"
            onClick={() => setJobsOpen((value) => !value)}
          >
            📄 {jobsOpen ? 'Masquer les annonces' : 'Mes annonces'}
          </button>

          {jobsOpen && (
            <div style={{ marginTop: 8, borderLeft: '1px solid var(--ring)', paddingLeft: 8 }}>
              {jobsLoading && <p className="muted">Chargement…</p>}
              {jobsError && <p className="muted">{jobsError}</p>}

              {!jobsLoading && !jobsError && jobs.length === 0 && (
                <p className="muted">Créez votre première annonce pour voir les candidats ici.</p>
              )}

              {jobs.map((job) => {
                const isSelected = job.id === selectedJobId
                const count = job.candidates?.[0]?.count ?? 0

                return (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => setSelectedJobId(job.id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '6px 8px',
                      cursor: 'pointer',
                      width: '100%',
                      border: 'none',
                      background: isSelected ? 'rgba(218,119,86,0.12)' : 'transparent',
                      borderRadius: 10,
                      color: 'inherit'
                    }}
                  >
                    <span style={{ textAlign: 'left' }}>{job.title}</span>
                    <span className="badge">{count}</span>
                  </button>
                )
              })}
            </div>
          )}
        </aside>

        <section>
          {detailsLoading && <p className="muted">Chargement des détails…</p>}
          {detailsError && <p className="muted">{detailsError}</p>}

          {!detailsLoading && !detailsError && !jobDetails && (
            <p className="muted">Sélectionnez une annonce pour consulter ses résultats.</p>
          )}

          {!detailsLoading && !detailsError && jobDetails && (
            <div style={{ display: 'grid', gap: 12 }}>
              <div className="card">
                <h3>
                  {jobDetails.title} <span className="badge">{jobDetails.level}</span>
                </h3>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <a className="badge" href={jobDetails.link} target="_blank" rel="noreferrer">
                    URL courte : <strong>{jobDetails.link}</strong>
                  </a>
                  <div className="badge">
                    Candidatures : <strong>{selectedJobCandidates.length}</strong>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3>Candidats</h3>
                {selectedJobCandidates.length === 0 ? (
                  <p className="muted">Aucun candidat n’a encore terminé le test.</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Score</th>
                        <th>Statut</th>
                        <th>Vidéo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedJobCandidates.map((candidate) => (
                        <tr
                          key={candidate.id}
                          onClick={() => handleCandidateClick(jobDetails, candidate)}
                          style={{ cursor: 'pointer' }}
                        >
                          <td>{candidate.name ?? '—'}</td>
                          <td>
                            {candidate.email ? (
                              <a href={`mailto:${candidate.email}`}>{candidate.email}</a>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td>{renderScoreBadge(candidate.score)}</td>
                          <td>{candidate.status ?? 'En revue'}</td>
                          <td>{candidate.video_url ? '🎥' : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      <CandidateModal />
      <InterviewModal />
    </main>
  )
}

function renderScoreBadge(score: number | null | undefined) {
  if (typeof score !== 'number' || Number.isNaN(score)) {
    return <span className="score">—</span>
  }

  const rounded = Math.round(score)
  const cls = rounded >= 80 ? 'ok' : rounded >= 65 ? 'mid' : 'bad'
  return <span className={`score ${cls}`}>{rounded}</span>
}
