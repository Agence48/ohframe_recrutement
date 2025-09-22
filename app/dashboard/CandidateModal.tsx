'use client'

import { useEffect, useMemo, useState } from 'react'

import type { CandidateSummary, JobDetails } from '@/lib/types/jobs'

type CandidateEventDetail = { job: JobDetails; candidate: CandidateSummary }

export default function CandidateModal() {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<CandidateEventDetail | null>(null)

  useEffect(() => {
    const onOpen = (event: Event) => {
      const detail = (event as CustomEvent<CandidateEventDetail>).detail
      setData(detail)
      setOpen(true)
    }

    window.addEventListener('open-candidate', onOpen as EventListener)

    return () => {
      window.removeEventListener('open-candidate', onOpen as EventListener)
    }
  }, [])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeModal()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  const closeModal = () => {
    setOpen(false)
    setData(null)
  }

  if (!open || !data) return null

  const { job, candidate } = data
  const candidateName = candidate.name?.trim() || 'Candidat inconnu'
  const firstName = candidate.name?.split(/\s+/)[0] || 'candidat'
  const score = typeof candidate.score === 'number' ? Math.round(candidate.score) : null
  const scoreClass = score == null ? '' : score >= 80 ? 'ok' : score >= 65 ? 'mid' : 'bad'
  const answers = useMemo(() => normaliseAnswers(candidate.answers_json), [candidate.answers_json])

  const mailtoHref = useMemo(() => {
    if (!candidate.email) return undefined
    const subject = encodeURIComponent(`Entretien ${job.title}`)
    const body = encodeURIComponent(
      `Bonjour ${firstName},\n\nNous vous proposons un entretien de 30 minutes pour faire connaissance.\n\nCordialement,`
    )
    return `mailto:${candidate.email}?subject=${subject}&body=${body}`
  }, [candidate.email, firstName, job.title])

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(16,12,8,.36)', display: 'grid', placeItems: 'center', padding: 18 }}>
      <div className="card" style={{ maxWidth: 900, width: '96vw', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div>
            <h3 style={{ margin: 0 }}>{candidateName} — {job.title}</h3>
            <p className="muted" style={{ marginTop: 4 }}>{candidate.email ?? 'Email non renseigné'}</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end' }}>
            {mailtoHref && (
              <a className="button" href={mailtoHref}>Contacter par mail</a>
            )}
            <button className="button primary" type="button" onClick={() => openInterview(job, candidate)}>
              Proposer un entretien
            </button>
            <button className="button" type="button" onClick={closeModal}>
              Fermer
            </button>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <p>
            <strong>Score global :</strong>{' '}
            <span className={`score ${scoreClass}`}>{score ?? '—'}</span>{' '}
            — {candidate.status ?? 'En revue'}
          </p>
          <div className="card" style={{ marginTop: 10 }}>
            <h4>Réponses & scores par question</h4>
            <pre
              style={{
                whiteSpace: 'pre-wrap',
                background: 'var(--card)',
                border: '1px solid var(--ring)',
                padding: 12,
                borderRadius: 12,
                maxHeight: 260,
                overflow: 'auto'
              }}
            >{JSON.stringify(answers, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
    )
  }

function openInterview(job: JobDetails, candidate: CandidateSummary) {
  const evt = new CustomEvent('open-interview', { detail: { job, candidate } })
  window.dispatchEvent(evt)
}

function normaliseAnswers(raw: unknown) {
  if (raw == null) return {}
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw)
    } catch (error) {
      return { raw }
    }
  }
  return raw
}
