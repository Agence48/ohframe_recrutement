import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/stripe'

export const runtime = 'nodejs'

export async function POST(req: NextRequest){
  const sig = req.headers.get('stripe-signature')!
  const buf = Buffer.from(await req.arrayBuffer())
  let event
  try{
    event = await stripe.webhooks.constructEventAsync(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  }catch(e: any){
    return new NextResponse(`Webhook Error: ${e.message}`, { status: 400 })
  }
  // handle events: checkout.session.completed etc.
  return NextResponse.json({ received: true })
}
