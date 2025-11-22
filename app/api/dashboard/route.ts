import { NextResponse } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = getServiceSupabaseClient();
  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(25);

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data', details: error.message },
      { status: 500 }
    );
  }

  const now = new Date();
  const startOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).toISOString();

  const totalIncidents = data.length;
  const activeIncidents = data.filter(
    (incident) =>
      incident.status === 'Open' || incident.status === 'Investigating'
  ).length;
  const resolvedToday = data.filter(
    (incident) =>
      incident.status === 'Resolved' && incident.updated_at >= startOfDay
  ).length;
  const criticalIncidents = data.filter(
    (incident) => incident.severity === 'Critical'
  ).length;

  return NextResponse.json({
    metrics: {
      totalIncidents,
      activeIncidents,
      resolvedToday,
      criticalIncidents,
    },
    recentIncidents: data.slice(0, 6),
  });
}

