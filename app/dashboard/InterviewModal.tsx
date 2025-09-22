'use client'

import { useEffect, useMemo, useState } from 'react'

import type { CandidateSummary, JobDetails } from '@/lib/types/jobs'

type InterviewEventDetail = { candidate: CandidateSummary; job?: JobDetails }

export default function InterviewModal() {
  const [open, setOpen] = useState(false)
  const [candidate, setCandidate] = useState<CandidateSummary | null>(null)
  const [job, setJob] = useState<JobDetails | null>(null)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [message, setMessage] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    const onOpen = (event: Event) => {
      const detail = (event as CustomEvent<InterviewEventDetail>).detail
      setCandidate(detail.candidate)
      setJob(detail.job ?? null)
      setDate('')
      setTime('')
      setFeedback(null)
      setMessage(buildDefaultMessage(detail.candidate, detail.job))
      setOpen(true)
    }

    window.addEventListener('open-interview', onOpen as EventListener)
    return () => window.removeEventListener('open-interview', onOpen as EventListener)
  }, [])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        handleClose()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  const interviewDateLabel = useMemo(() => formatInterviewDate(date, time), [date, time])

  const mailtoHref = useMemo(() => {
    if (!candidate?.email || !interviewDateLabel) return undefined
    const subject = encodeURIComponent(`Invitation entretien ${job?.title ?? ''}`.trim())
    const body = encodeURIComponent(`${message}\n\n📅 ${interviewDateLabel}`)
    return `mailto:${candidate.email}?subject=${subject}&body=${body}`
  }, [candidate?.email, interviewDateLabel, job?.title, message])

  const canSend = Boolean(mailtoHref)

  const handleSend = () => {
    if (!mailtoHref) return
    setFeedback('Invitation générée dans votre client mail.')
    window.location.href = mailtoHref
  }

  const handleClose = () => {
    setOpen(false)
  }

  if (!open || !candidate) return null

  const candidateName = candidate.name ?? 'candidat'

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(16,12,8,.36)', display: 'grid', placeItems: 'center', padding: 18 }}>
      <div className="card" style={{ maxWidth: 680, width: '96vw', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0 }}>Proposer un entretien</h3>
            <p className="muted" style={{ marginTop: 4 }}>
              {candidateName}
              {job ? ` — ${job.title}` : ''}
            </p>
          </div>
          <button className="button" type="button" onClick={handleClose}>
            Fermer
          </button>
        </div>

        <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            <input type="time" value={time} onChange={(event) => setTime(event.target.value)} />
          </div>
          <textarea rows={6} value={message} onChange={(event) => setMessage(event.target.value)} />
          <button className="button primary" type="button" onClick={handleSend} disabled={!canSend}>
            Envoyer l'invitation
          </button>
          {feedback && <p className="muted">{feedback}</p>}
          {!candidate.email && <p className="muted">Ajoutez l’email du candidat pour générer l’invitation.</p>}
          {candidate.email && !interviewDateLabel && <p className="muted">Sélectionnez une date et une heure.</p>}
        </div>
      </div>
    </div>
  )
}

function buildDefaultMessage(candidate: CandidateSummary, job?: JobDetails | null) {
  const firstName = candidate.name?.split(/\s+/)[0] ?? 'Bonjour'
  const jobLabel = job ? ` pour le poste ${job.title}` : ''
  return `Bonjour ${firstName},\n\nNous vous proposons un entretien de 30 minutes${jobLabel}. Merci de nous confirmer votre disponibilité.\n\nCordialement,`
}

function formatInterviewDate(date: string, time: string) {
  if (!date || !time) return null
  const isoString = `${date}T${time}`
  const parsed = new Date(isoString)
  if (Number.isNaN(parsed.getTime())) return null
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'full',
    timeStyle: 'short'
  }).format(parsed)
}
