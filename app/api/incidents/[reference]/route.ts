import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceSupabaseClient } from '@/lib/supabase/server';

const updateSchema = z.object({
  title: z.string().optional(),
  type: z.string().optional(),
  severity: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
  status: z
    .enum(['Open', 'Investigating', 'Contained', 'Resolved', 'Closed'])
    .optional(),
  description: z.string().optional(),
  reporter: z.string().optional(),
  assignee: z.string().nullable().optional(),
  tools_used: z.array(z.any()).optional(),
  evidence: z.array(z.any()).optional(),
  timeline: z.array(z.any()).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { reference: string } }
) {
  const supabase = getServiceSupabaseClient();
  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .eq('reference_id', params.reference)
    .single();

  if (error) {
    return NextResponse.json(
      { error: 'Incident not found', details: error.message },
      { status: 404 }
    );
  }

  return NextResponse.json({ data });
}

export async function PATCH(
  request: Request,
  { params }: { params: { reference: string } }
) {
  const body = await request.json();
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const payload = {
    ...parsed.data,
    updated_at: new Date().toISOString(),
  };

  const supabase = getServiceSupabaseClient();
  const { data, error } = await supabase
    .from('incidents')
    .update(payload)
    .eq('reference_id', params.reference)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: 'Failed to update incident', details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}

export async function DELETE(
  request: Request,
  { params }: { params: { reference: string } }
) {
  const supabase = getServiceSupabaseClient();
  const { error } = await supabase
    .from('incidents')
    .delete()
    .eq('reference_id', params.reference);

  if (error) {
    return NextResponse.json(
      { error: 'Failed to delete incident', details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

