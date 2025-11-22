import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceSupabaseClient } from '@/lib/supabase/server';

const logSchema = z.object({
  event_time: z.string().optional(),
  severity: z.enum(['Info', 'Warning', 'Error', 'Critical']),
  source: z.string(),
  source_ip: z.string(),
  action: z.string(),
  description: z.string(),
});

export async function GET(request: Request) {
  const supabase = getServiceSupabaseClient();
  const { searchParams } = new URL(request.url);
  const severity = searchParams.get('severity');
  const source = searchParams.get('source');
  const limit = Number(searchParams.get('limit') ?? '100');

  let query = supabase
    .from('system_logs')
    .select('*')
    .order('event_time', { ascending: false })
    .limit(limit);

  if (severity && severity !== 'all') {
    query = query.eq('severity', severity);
  }

  if (source && source !== 'all') {
    query = query.eq('source', source);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch logs', details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = logSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const supabase = getServiceSupabaseClient();
  const { data, error } = await supabase
    .from('system_logs')
    .insert({
      ...parsed.data,
      event_time: parsed.data.event_time ?? new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: 'Failed to create log entry', details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ data }, { status: 201 });
}

