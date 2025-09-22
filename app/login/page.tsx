'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function Login(){
  const [email,setEmail] = useState('')
  const [sent,setSent] = useState(false)
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: true } })

  const send = async (e: any)=>{
    e.preventDefault()
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard` } })
    if(error) alert(error.message); else setSent(true)
  }

  return (
    <main className="container">
      <div className="card" style={{maxWidth:520, margin:'40px auto'}}>
        <h2>Connexion par lien magique</h2>
        {!sent ? (
          <form onSubmit={send} style={{display:'grid', gap:10}}>
            <input type="email" placeholder="Email pro" value={email} onChange={e=>setEmail(e.target.value)} required/>
            <button className="button primary" type="submit">Envoyer le lien</button>
          </form>
        ) : <p>Vérifiez votre boite mail et cliquez sur le lien pour accéder au dashboard.</p>}
      </div>
    </main>
  )
}
