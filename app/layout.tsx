import './globals.css'
import type { ReactNode } from 'react'

export const metadata = {
  title: 'OhFrame',
  description: 'Tests pré-entretien par compétences'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
