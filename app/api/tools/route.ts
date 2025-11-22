import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceSupabaseClient } from '@/lib/supabase/server';

const toolPayloadSchema = z.object({
  name: z.string(),
  description: z.string(),
  impact: z.string().optional(),
  category: z.string().optional(),
  screenshot: z.string().url().optional(),
  effectiveness: z.enum(['Critical', 'High', 'Medium', 'Low']).optional(),
  usage_count: z.number().optional(),
  last_used: z.string().optional(),
});

export async function GET() {
  const supabase = getServiceSupabaseClient();
  const { data, error } = await supabase
    .from('tools')
    .select('*')
    .order('usage_count', { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tools', details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = toolPayloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const supabase = getServiceSupabaseClient();
  const { data, error } = await supabase
    .from('tools')
    .insert(parsed.data)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: 'Failed to create tool', details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ data }, { status: 201 });
}

