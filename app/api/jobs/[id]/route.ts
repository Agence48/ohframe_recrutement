import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET(_: NextRequest, { params }: { params: { id: string } }){
  const admin = supabaseAdmin()
  const { data:job, error } = await admin
    .from('jobs')
    .select('id,title,level,link,test_json,candidates(id,name,email,score,status,video_url,answers_json)')
    .eq('id', params.id).single()
  if(error) return NextResponse.json({error:error.message},{status:404})
  return NextResponse.json({ job })
}
