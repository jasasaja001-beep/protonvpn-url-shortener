import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!)
const validSlug = /^[a-zA-Z0-9_-]{3,50}$/

export async function POST(request: Request) {
  try {
    const { originalUrl, customSlug } = await request.json()
    const url = new URL(originalUrl)
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('protocol')
    const slug = (customSlug || crypto.randomUUID().replaceAll('-', '').slice(0, 7)).trim().toLowerCase()
    if (!validSlug.test(slug)) return NextResponse.json({ error: 'Alias harus 3–50 karakter: huruf, angka, - atau _.' }, { status: 400 })
    const { error } = await supabase.from('links').insert({ slug, original_url: url.toString() })
    if (error?.code === '23505') return NextResponse.json({ error: 'Alias sudah dipakai.' }, { status: 409 })
    if (error) throw error
    return NextResponse.json({ slug, shortUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/${slug}` })
  } catch {
    return NextResponse.json({ error: 'URL tidak valid atau link gagal dibuat.' }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  const { slug } = await request.json()
  if (!slug) return NextResponse.json({ error: 'Slug wajib diisi.' }, { status: 400 })
  const { error } = await supabase.from('links').delete().eq('slug', slug)
  if (error) return NextResponse.json({ error: 'Gagal menghapus link.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
