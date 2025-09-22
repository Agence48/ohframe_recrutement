import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET(req: NextRequest, { params }: { params: { slug: string } }){
  const admin = supabaseAdmin()
  const { data:job, error } = await admin.from('jobs').select('id,title,level,test_json').eq('slug', params.slug).single()
  if(error) return NextResponse.json({error:'Not found'},{status:404})
  // return minimal test definition
  return NextResponse.json({ jobId: job.id, title: job.title, level: job.level, test: job.test_json })
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }){
  // submit answers
  const body = await req.json()
  const { candidate, email, answers, score, status } = body
  const admin = supabaseAdmin()
  // create candidate row
  const { data:job } = await admin.from('jobs').select('id').eq('slug', params.slug).single()
  if(!job) return NextResponse.json({error:'Invalid job'},{status:400})
  const { error } = await admin.from('candidates').insert({
    job_id: job.id, name: candidate, email, score, status, answers_json: answers
  })
  if(error) return NextResponse.json({error:error.message},{status:500})
  return NextResponse.json({ ok: true })
}
