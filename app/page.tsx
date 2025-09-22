import Link from 'next/link'

export default function Home() {
  return (
    <main className="container">
      <div className="card" style={{marginTop:24}}>
        <h1>OhFrame — Recrutez par compétences, pas par CV</h1>
        <p>Générez des tests de 25 min adaptés à vos fiches de poste (Junior/Inter/Senior), recevez un scoring multi-métriques, et décidez plus vite.</p>
        <div style={{display:'flex', gap:10, marginTop:12}}>
          <Link className="button primary" href="/login">Se connecter</Link>
          <a className="button" href="https://anthropic.com" target="_blank">Comment ça marche</a>
        </div>
      </div>
    </main>
  )
}
