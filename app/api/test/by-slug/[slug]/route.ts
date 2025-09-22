import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { supabaseAdmin } from '@/lib/supabase/server'
import { TestDefinitionSchema } from '@/lib/types/test'

const SubmitAnswersSchema = z.object({
  candidate: z.string().min(1),
  email: z.string().email(),
  answers: z.unknown(),
  score: z.number().min(0).max(100),
  status: z.string().min(1),
  videoUrl: z.string().url().optional()
})

export async function GET(_: NextRequest, { params }: { params: { slug: string } }){
  const admin = supabaseAdmin()
  const { data:job, error } = await admin.from('jobs').select('id,title,level,test_json').eq('slug', params.slug).single()
  if(error || !job?.test_json) return NextResponse.json({error:'Not found'},{status:404})

  const test = TestDefinitionSchema.parse(job.test_json)
  // return minimal test definition
  return NextResponse.json({ jobId: job.id, title: job.title, level: job.level, test })
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }){
  // submit answers
  let payload: unknown
  try {
    payload = await req.json()
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  const parsed = SubmitAnswersSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid submission payload', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { candidate, email, answers, score, status, videoUrl } = parsed.data
  const admin = supabaseAdmin()
  // create candidate row
  const { data:job } = await admin.from('jobs').select('id').eq('slug', params.slug).single()
  if(!job) return NextResponse.json({error:'Invalid job'},{status:400})
  const { error } = await admin.from('candidates').insert({
    job_id: job.id,
    name: candidate,
    email,
    score,
    status,
    answers_json: answers,
    video_url: videoUrl ?? null
  })
  if(error) return NextResponse.json({error:error.message},{status:500})
  return NextResponse.json({ ok: true })
}
