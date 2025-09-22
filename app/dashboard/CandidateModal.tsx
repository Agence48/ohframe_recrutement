'use client'
import { useEffect, useState } from 'react'

export default function CandidateModal(){
  const [open,setOpen] = useState(false)
  const [data,setData] = useState<any>(null)

  useEffect(()=>{
    const onOpen = (e:any)=>{ setData(e.detail); setOpen(true) }
    window.addEventListener('open-candidate', onOpen as any)
    return ()=> window.removeEventListener('open-candidate', onOpen as any)
  },[])

  if(!open) return null
  const { job, c } = data

  return (
    <div style={{position:'fixed', inset:0, background:'rgba(16,12,8,.36)', display:'grid', placeItems:'center', padding:18}}>
      <div className="card" style={{maxWidth:900, width:'96vw'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h3>{c.name} — {job.title}</h3>
          <div style={{display:'flex', gap:8}}>
            <a className="button" href={`mailto:${c.email}?subject=Entretien ${encodeURIComponent(job.title)}&body=Bonjour ${c.name.split(' ')[0]},`}>Contacter par mail</a>
            <a className="button primary" onClick={()=> openInterview(c)}>Proposer un entretien</a>
            <a className="button" onClick={()=> setOpen(false)}>Fermer</a>
          </div>
        </div>
        <div style={{marginTop:12}}>
          <p><strong>Score global :</strong> <span className={`score ${c.score>=80?'ok':c.score>=65?'mid':'bad'}`}>{c.score}</span> — {c.status}</p>
          <div className="card" style={{marginTop:10}}>
            <h4>Réponses & scores par question</h4>
            <pre style={{whiteSpace:'pre-wrap', background:'var(--card)', border:'1px solid var(--ring)', padding:12, borderRadius:12, maxHeight:260, overflow:'auto'}}>
{JSON.stringify(c.answers_json||{}, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

function openInterview(c:any){
  const evt = new CustomEvent('open-interview', { detail: { c } })
  window.dispatchEvent(evt)
}
