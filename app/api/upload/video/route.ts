import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { z } from 'zod'

import { supabaseAdmin } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const MAX_VIDEO_SIZE = 200 * 1024 * 1024 // 200 MB
const VIDEO_UPLOAD_SECRET = process.env.VIDEO_UPLOAD_SECRET

const UploadTokenSchema = z.object({
  jobId: z.number().int().nonnegative(),
  candidateId: z.number().int().nonnegative(),
  questionId: z.string().optional(),
  exp: z.number().int().optional()
})

function verifyUploadToken(token: string) {
  if (!VIDEO_UPLOAD_SECRET) {
    throw new Error('Upload secret is not configured')
  }

  const [encodedPayload, signature] = token.split('.')
  if (!encodedPayload || !signature) {
    throw new Error('Malformed upload token')
  }

  let expectedSignature: string
  try {
    expectedSignature = createHmac('sha256', VIDEO_UPLOAD_SECRET).update(encodedPayload).digest('base64url')
  } catch (error) {
    throw new Error('Unable to sign upload token')
  }

  const signatureBuffer = Buffer.from(signature, 'base64url')
  const expectedBuffer = Buffer.from(expectedSignature, 'base64url')
  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    throw new Error('Invalid upload token signature')
  }

  const payloadJson = Buffer.from(encodedPayload, 'base64url').toString('utf8')
  let payload: unknown
  try {
    payload = JSON.parse(payloadJson)
  } catch (error) {
    throw new Error('Upload token payload is not valid JSON')
  }

  const parsed = UploadTokenSchema.parse(payload)
  if (parsed.exp && parsed.exp * 1000 < Date.now()) {
    throw new Error('Upload token has expired')
  }

  return parsed
}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_') || 'recording.webm'
}

export async function POST(req: NextRequest){
  let formData: FormData
  try {
    formData = await req.formData()
  } catch (error) {
    return NextResponse.json({ error: 'Invalid multipart form data' }, { status: 400 })
  }

  const token = formData.get('token')
  if (typeof token !== 'string') {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  let tokenPayload
  try {
    tokenPayload = verifyUploadToken(token)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid token'
    return NextResponse.json({ error: message }, { status: 401 })
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (file.size === 0) {
    return NextResponse.json({ error: 'Empty file' }, { status: 400 })
  }

  if (file.size > MAX_VIDEO_SIZE) {
    return NextResponse.json({ error: 'File too large' }, { status: 413 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const fileName = sanitizeFileName(file.name)
  const storagePath = `${tokenPayload.jobId}/${tokenPayload.candidateId}/${Date.now()}-${fileName}`

  const admin = supabaseAdmin()
  const { error: uploadError } = await admin.storage.from('videos').upload(storagePath, buffer, {
    contentType: file.type || 'video/webm',
    upsert: false
  })
  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: publicData } = admin.storage.from('videos').getPublicUrl(storagePath)
  const publicUrl = publicData?.publicUrl ?? null

  const { error: updateError } = await admin
    .from('candidates')
    .update({ video_url: publicUrl })
    .eq('id', tokenPayload.candidateId)
    .eq('job_id', tokenPayload.jobId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, url: publicUrl })
}
