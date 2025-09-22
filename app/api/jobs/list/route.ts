import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET(){
  const admin = supabaseAdmin()
  const { data, error } = await admin.from('jobs').select('id,title,level,link,created_at,candidates(count)')
  if(error) return NextResponse.json({error:error.message},{status:500})
  return NextResponse.json({ jobs: data })
}
