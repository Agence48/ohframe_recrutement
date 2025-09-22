'use client'
import { useEffect, useState } from 'react'

type Job = { id:string; title:string; level:string; link:string; created_at:string; candidates?: { count: number }[] }
type JobsRes = { jobs: Job[] }

export default function Dashboard(){
  const [jobs,setJobs] = useState<Job[]>([])
  const [open,setOpen] = useState(false)
  const [selected,setSelected] = useState<any>(null)
  const [details,setDetails] = useState<any>(null)

  useEffect(()=>{
    fetch('/api/jobs/list').then(r=>r.json()).then((d:JobsRes)=> setJobs(d.jobs||[]))
  },[])

  const load = async (id:string)=>{
    setSelected(id)
    const j = await fetch('/api/jobs/'+id).then(r=>r.json())
    setDetails(j.job)
  }

  return (
    <main className="container">
      <div className="card" style={{display:'grid', gridTemplateColumns:'260px 1fr', gap:16}}>
        <aside>
          <a className="button" onClick={()=> setOpen(!open)}>📄 Mes annonces</a>
          {open && (
            <div style={{marginTop:8, borderLeft:'1px solid var(--ring)', paddingLeft:8}}>
              {jobs.map(j=>(
                <div key={j.id} style={{display:'flex', justifyContent:'space-between', padding:'6px 8px', cursor:'pointer'}}
                     onClick={()=> load(j.id)}>
                  <span>{j.title}</span>
                  <span className="badge">{j.candidates?.[0]?.count ?? 0}</span>
                </div>
              ))}
            </div>
          )}
        </aside>
        <section>
          {!details ? <p className="muted">Sélectionnez une annonce…</p> : (
            <div style={{display:'grid', gap:12}}>
              <div className="card">
                <h3>{details.title} <span className="badge">{details.level}</span></h3>
                <div style={{display:'flex', gap:10, flexWrap:'wrap'}}>
                  <div className="badge">URL courte : <strong>{details.link}</strong></div>
                  <div className="badge">Candidatures : <strong>{details.candidates?.length||0}</strong></div>
                </div>
              </div>
              <div className="card">
                <h3>Candidats</h3>
                <table><thead><tr><th>Nom</th><th>Email</th><th>Score</th><th>Statut</th><th>Vidéo</th></tr></thead><tbody>
                  {details.candidates?.map((c:any)=>(
                    <tr key={c.id} onClick={()=> openCandidate(details, c)} style={{cursor:'pointer'}}>
                      <td>{c.name}</td><td><a href={`mailto:${c.email}`}>{c.email}</a></td>
                      <td>{scoreBadge(c.score)}</td><td>{c.status}</td><td>{c.video_url? '🎥':'—'}</td>
                    </tr>
                  ))}
                </tbody></table>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function scoreBadge(n:number){ const cls = n>=80? 'ok' : n>=65? 'mid' : 'bad'; return <span className={`score ${cls}`}>{n}</span> }

function openCandidate(job:any, c:any){
  const evt = new CustomEvent('open-candidate', { detail: { job, c } })
  window.dispatchEvent(evt)
}
