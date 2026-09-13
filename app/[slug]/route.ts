import { createClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)
function browser(ua: string) { if (/edg/i.test(ua)) return 'Edge'; if (/firefox/i.test(ua)) return 'Firefox'; if (/chrome|crios/i.test(ua)) return 'Chrome'; if (/safari/i.test(ua)) return 'Safari'; return 'Unknown' }

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const { data: link } = await supabase.from('links').select('original_url').eq('slug', params.slug).single()
  if (!link) return new NextResponse('Link tidak ditemukan', { status: 404 })
  const h = headers(), ua = h.get('user-agent') || ''
  void supabase.from('clicks').insert({ link_slug: params.slug, country: h.get('x-vercel-ip-country') || 'Unknown', city: h.get('x-vercel-ip-city') || 'Unknown', device: /mobile/i.test(ua) ? 'Mobile' : 'Desktop', browser: browser(ua), referrer: h.get('referer') || 'Direct' })
  return NextResponse.redirect(link.original_url, 302)
}
