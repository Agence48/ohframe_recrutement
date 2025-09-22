import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { z } from 'zod'

import { generateTestFromJD } from '@/lib/ai/claude'
import { supabaseAdmin } from '@/lib/supabase/server'
import { JobDetailsSchema } from '@/lib/types/jobs'
import type { TestDefinition } from '@/lib/types/test'

const CreateJobSchema = z.object({
  title: z.string().min(2),
  level: z.enum(['Junior', 'Intermédiaire', 'Senior']),
  jd: z.string().min(20)
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://ohframe.app'

function generateSlug() {
  return randomBytes(4).toString('hex')
}

export async function POST(req: NextRequest){
  let payload: unknown
  try {
    payload = await req.json()
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  const parsed = CreateJobSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid job payload', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { title, level, jd } = parsed.data

  // Generate questions via Claude
  let test: TestDefinition
  try {
    test = await generateTestFromJD(jd, level)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Claude error'
    return NextResponse.json({ error: message }, { status: 502 })
  }

  // Persist job + questions
  const admin = supabaseAdmin()
  const slug = generateSlug()
  const link = `${SITE_URL}/t/${slug}`
  const { data: job, error } = await admin.from('jobs').insert({
    title,
    level,
    slug,
    link,
    jd,
    test_json: test
  }).select('id,title,level,link,created_at,test_json').single()
  if(error) return NextResponse.json({error: error.message}, {status:500})

  const safeJob = JobDetailsSchema.parse({ ...job, candidates: [] })

  return NextResponse.json({ job: safeJob })
}
