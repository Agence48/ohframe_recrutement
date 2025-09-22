import { NextRequest, NextResponse } from 'next/server'
import formidable from 'formidable'
import { supabaseAdmin } from '@/lib/supabase/server'
import { createReadStream } from 'fs'
import { promisify } from 'util'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function parseForm(req: NextRequest): Promise<{ fields: any, files: any }>{
  const form = formidable({ multiples: false })
  return new Promise((resolve, reject) => {
    // @ts-ignore
    form.parse(req as any, (err: any, fields: any, files: any) => {
      if (err) reject(err); else resolve({ fields, files })
    })
  })
}

export async function POST(req: any){
  const { fields, files } = await parseForm(req)
  const token = fields.token
  if(!token) return NextResponse.json({error:'Missing token'},{status:400})
  // TODO: verify token signature HMAC (server secret); decode job/candidate/question

  const file = files.file
  if(!file) return NextResponse.json({error:'No file'},{status:400})

  // In real app: upload to Supabase Storage or S3, link to candidate row
  const admin = supabaseAdmin()
  // Dummy OK
  return NextResponse.json({ ok: true })
}
