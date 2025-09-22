'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { createClient } from '@supabase/supabase-js'

type AuthStatus = 'idle' | 'loading' | 'sent' | 'error'

export default function Login() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<AuthStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anonKey) {
      console.error('Supabase environment variables are missing')
      return null
    }
    return createClient(url, anonKey, { auth: { persistSession: true } })
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (status === 'loading') return

    if (!supabase) {
      setStatus('error')
      setErrorMessage('Configuration Supabase manquante. Merci de contacter un administrateur.')
      return
    }

    setStatus('loading')
    setErrorMessage(null)

    const redirectBase = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: redirectBase ? { emailRedirectTo: `${redirectBase}/dashboard` } : undefined
    })

    if (error) {
      setStatus('error')
      setErrorMessage(error.message)
      return
    }

    setStatus('sent')
  }

  return (
    <main className="container">
      <div className="card" style={{ maxWidth: 520, margin: '40px auto', display: 'grid', gap: 16 }}>
        <div>
          <h2 style={{ marginBottom: 8 }}>Connexion par lien magique</h2>
          <p className="muted" style={{ margin: 0 }}>
            Renseignez votre email professionnel pour recevoir un lien sécurisé.
          </p>
        </div>
        {status !== 'sent' ? (
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Email professionnel</span>
              <input
                type="email"
                placeholder="prenom@entreprise.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </label>
            {errorMessage && <p className="muted" style={{ color: '#8d2d2d' }}>{errorMessage}</p>}
            <button className="button primary" type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Envoi…' : 'Envoyer le lien'}
            </button>
          </form>
        ) : (
          <p>Vérifiez votre boîte mail et cliquez sur le lien pour accéder au dashboard.</p>
        )}
      </div>
    </main>
  )
}
