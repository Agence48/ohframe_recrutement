import { NextRequest, NextResponse } from 'next/server'

import { supabaseAdmin } from '@/lib/supabase/server'
import { JobDetailsSchema } from '@/lib/types/jobs'

export async function GET(_: NextRequest, { params }: { params: { id: string } }){
  const jobId = Number(params.id)
  if (Number.isNaN(jobId)) {
    return NextResponse.json({ error: 'Invalid job id' }, { status: 400 })
  }

  const admin = supabaseAdmin()
  const { data:job, error } = await admin
    .from('jobs')
    .select('id,title,level,link,created_at,test_json,candidates(id,name,email,score,status,video_url,answers_json)')
    .eq('id', jobId).single()
  if(error) return NextResponse.json({error:error.message},{status:404})
  const safeJob = JobDetailsSchema.parse(job)
  return NextResponse.json({ job: safeJob })
}
