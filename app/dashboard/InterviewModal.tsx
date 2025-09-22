'use client'
import { useEffect, useState } from 'react'

export default function InterviewModal(){
  const [open,setOpen] = useState(false)
  const [c,setC] = useState<any>(null)
  const [d,setD] = useState('')
  const [t,setT] = useState('')
  const [m,setM] = useState('')

  useEffect(()=>{
    const onOpen = (e:any)=>{ setC(e.detail.c); setOpen(true); setM(`Bonjour ${e.detail.c.name},\n\nNous vous proposons un entretien (30 min). Merci de confirmer.\n\nCordialement,`) }
    window.addEventListener('open-interview', onOpen as any)
    return ()=> window.removeEventListener('open-interview', onOpen as any)
  },[])

  if(!open) return null
  return (
    <div style={{position:'fixed', inset:0, background:'rgba(16,12,8,.36)', display:'grid', placeItems:'center', padding:18}}>
      <div className="card" style={{maxWidth:680, width:'96vw'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h3>Proposer un entretien</h3>
          <a className="button" onClick={()=> setOpen(false)}>Fermer</a>
        </div>
        <div style={{display:'grid', gap:10, marginTop:10}}>
          <div style={{display:'flex', gap:10}}>
            <input type="date" value={d} onChange={e=>setD(e.target.value)} />
            <input type="time" value={t} onChange={e=>setT(e.target.value)} />
          </div>
          <textarea rows={6} value={m} onChange={e=>setM(e.target.value)} />
          <a className="button primary" onClick={()=> { alert('Invitation envoyée'); setOpen(false) }}>Envoyer l'invitation</a>
        </div>
      </div>
    </div>
  )
}
