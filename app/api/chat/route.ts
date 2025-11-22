import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceSupabaseClient } from '@/lib/supabase/server';

const chatSchema = z.object({
  channel: z.string().min(2),
  user_name: z.string().min(2),
  user_role: z.string().optional(),
  message: z.string().min(1),
  incident_reference: z.string().optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const channel = searchParams.get('channel') ?? 'general';
  const limit = Number(searchParams.get('limit') ?? '100');

  const supabase = getServiceSupabaseClient();
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('channel', channel)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch chat messages', details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = chatSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const supabase = getServiceSupabaseClient();
  const { data, error } = await supabase
    .from('chat_messages')
    .insert(parsed.data)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: 'Failed to create chat message', details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ data }, { status: 201 });
}

