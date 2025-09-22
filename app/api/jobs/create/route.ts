import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { generateTestFromJD } from '@/lib/ai/claude'

export async function POST(req: NextRequest){
  const body = await req.json()
  const { title, level, jd } = body
  if(!title || !level || !jd) return NextResponse.json({error:'Missing fields'}, {status:400})

  // Generate questions via Claude
  const test = await generateTestFromJD(jd, level)

  // Persist job + questions
  const admin = supabaseAdmin()
  const slug = Math.random().toString(36).slice(2,8)
  const { data:job, error } = await admin.from('jobs').insert({
    title, level, slug, link: `https://ohframe.app/t/${slug}`, jd, test_json: test
  }).select().single()
  if(error) return NextResponse.json({error: error.message}, {status:500})

  return NextResponse.json({ job })
}
