import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServiceSupabaseClient } from '@/lib/supabase/server';

const toolSchema = z.object({
  name: z.string(),
  description: z.string(),
  impact: z.string(),
});

const evidenceSchema = z.object({
  id: z.string(),
  type: z.enum(['image', 'document', 'log']),
  name: z.string(),
  url: z.string(),
});

const timelineSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  action: z.string(),
  description: z.string(),
  user: z.string(),
  type: z.enum(['detection', 'analysis', 'containment', 'eradication', 'recovery']),
});

const createIncidentSchema = z.object({
  referenceId: z.string().optional(),
  title: z.string().min(3),
  type: z.string().min(2),
  severity: z.enum(['Low', 'Medium', 'High', 'Critical']),
  status: z.enum(['Open', 'Investigating', 'Contained', 'Resolved', 'Closed']).default('Open'),
  description: z.string().min(10),
  reporter: z.string(),
  assignee: z.string().optional().nullable(),
  toolsUsed: z.array(toolSchema).default([]),
  evidence: z.array(evidenceSchema).default([]),
  timeline: z.array(timelineSchema).default([]),
});

function generateReferenceId() {
  const now = new Date();
  const year = now.getFullYear();
  const random = Math.floor(Math.random() * 900) + 100;
  return `INC-${year}-${random}`;
}

export async function GET(request: Request) {
  const supabase = getServiceSupabaseClient();
  const { searchParams } = new URL(request.url);
  const severity = searchParams.get('severity');
  const status = searchParams.get('status');
  const search = searchParams.get('search');
  const limit = Number(searchParams.get('limit') ?? '50');

  let query = supabase
    .from('incidents')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (severity && severity !== 'all') {
    query = query.eq('severity', severity);
  }

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,reference_id.ilike.%${search}%,reporter.ilike.%${search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch incidents', details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createIncidentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const supabase = getServiceSupabaseClient();
  const referenceId = parsed.data.referenceId ?? generateReferenceId();

  const { data, error } = await supabase
    .from('incidents')
    .insert({
      reference_id: referenceId,
      title: parsed.data.title,
      type: parsed.data.type,
      severity: parsed.data.severity,
      status: parsed.data.status,
      description: parsed.data.description,
      reporter: parsed.data.reporter,
      assignee: parsed.data.assignee ?? null,
      tools_used: parsed.data.toolsUsed,
      evidence: parsed.data.evidence,
      timeline: parsed.data.timeline,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: 'Failed to create incident', details: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ data }, { status: 201 });
}

