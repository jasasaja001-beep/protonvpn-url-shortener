import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)
const count = (items: any[], key: string) => items.reduce((a, x) => ({ ...a, [x[key] || 'Unknown']: (a[x[key] || 'Unknown'] || 0) + 1 }), {})

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const { data: link } = await supabase.from('links').select('*').eq('slug', params.slug).single()
  if (!link) return NextResponse.json({ error: 'Link tidak ditemukan.' }, { status: 404 })
  const { data: clicks = [] } = await supabase.from('clicks').select('*').eq('link_slug', params.slug).order('clicked_at', { ascending: false }).limit(100)
  const daily = clicks.reduce((a: Record<string, number>, x: any) => { const d = x.clicked_at.slice(0, 10); a[d] = (a[d] || 0) + 1; return a }, {})
  return NextResponse.json({ link, totalClicks: clicks.length, daily, countries: count(clicks, 'country'), devices: count(clicks, 'device'), browsers: count(clicks, 'browser'), referrers: count(clicks, 'referrer'), recent: clicks.slice(0, 20) })
}
