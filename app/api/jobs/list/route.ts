import { NextResponse } from 'next/server'

import { supabaseAdmin } from '@/lib/supabase/server'
import { JobListItemSchema } from '@/lib/types/jobs'

export async function GET(){
  const admin = supabaseAdmin()
  const { data, error } = await admin
    .from('jobs')
    .select('id,title,level,link,created_at,candidates(count)')
    .order('created_at', { ascending: false })

  if(error) return NextResponse.json({error:error.message},{status:500})
  const jobs = JobListItemSchema.array().parse(data ?? [])
  return NextResponse.json({ jobs })
}
