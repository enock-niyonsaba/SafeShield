'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  AlertTriangle,
  Shield,
  CheckCircle,
  Clock,
  TrendingUp,
  Activity,
  Users,
  FileText
} from 'lucide-react';

type DashboardResponse = {
  metrics: {
    totalIncidents: number;
    activeIncidents: number;
    resolvedToday: number;
    criticalIncidents: number;
  };
  recentIncidents: Array<{
    reference_id: string;
    title: string;
    type: string;
    severity: string;
    status: string;
    reporter: string;
    created_at: string;
  }>;
};

const getSeverityBadge = (severity: string) => {
  const variants = {
    'Low': 'info',
    'Medium': 'warning',
    'High': 'danger',
    'Critical': 'danger'
  } as const;
  
  return <Badge variant={variants[severity as keyof typeof variants] || 'default'}>{severity}</Badge>;
};

const getStatusBadge = (status: string) => {
  const variants = {
    'Open': 'danger',
    'Investigating': 'warning',
    'Contained': 'info',
    'Resolved': 'success',
    'Closed': 'default'
  } as const;
  
  return <Badge variant={variants[status as keyof typeof variants] || 'default'}>{status}</Badge>;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(async (res) => {
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload.error ?? 'Failed to load dashboard data');
        }
        return res.json();
      })
      .then((payload) => {
        setData(payload);
        setError(null);
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const metrics = data?.metrics;
    return [
      {
        name: 'Total Incidents',
        value: metrics ? metrics.totalIncidents.toString() : '—',
        change: '',
        changeType: 'neutral',
        icon: FileText,
        color: 'text-blue-400'
      },
      {
        name: 'Active Incidents',
        value: metrics ? metrics.activeIncidents.toString() : '—',
        change: '',
        changeType: 'neutral',
        icon: AlertTriangle,
        color: 'text-yellow-400'
      },
      {
        name: 'Resolved Today',
        value: metrics ? metrics.resolvedToday.toString() : '—',
        change: '',
        changeType: 'neutral',
        icon: CheckCircle,
        color: 'text-green-400'
      },
      {
        name: 'Critical Incidents',
        value: metrics ? metrics.criticalIncidents.toString() : '—',
        change: '',
        changeType: 'neutral',
        icon: Shield,
        color: 'text-red-400'
      }
    ];
  }, [data]);

  const recentIncidents = data?.recentIncidents ?? [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Security Dashboard</h1>
          <p className="text-gray-400">Monitor and manage cybersecurity incidents in real-time</p>
        </div>

        {error && (
          <div className="rounded border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.name} variant="cyber" className="scan-line">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">{stat.name}</p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                    {!stat.change ? (
                      <p className="text-sm mt-1 text-gray-500">Live data</p>
                    ) : (
                      <p className={`text-sm mt-1 ${
                        stat.changeType === 'increase' ? 'text-green-400' : 
                        stat.changeType === 'decrease' ? 'text-red-400' : 
                        'text-gray-400'
                      }`}>
                        {stat.change}
                      </p>
                    )}
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Incidents */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-[var(--cyber-blue)]" />
                Recent Incidents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading && (
                  <p className="text-sm text-gray-400">Loading recent incidents…</p>
                )}
                {!loading && recentIncidents.length === 0 && (
                  <p className="text-sm text-gray-400">No incidents found.</p>
                )}
                {recentIncidents.map((incident) => (
                  <div key={incident.reference_id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors cursor-pointer">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-mono text-[var(--cyber-blue)]">{incident.reference_id}</span>
                        {getSeverityBadge(incident.severity)}
                      </div>
                      <h4 className="font-medium text-white text-sm">{incident.title}</h4>
                      <p className="text-xs text-gray-400 mt-1">
                        {incident.type} • Reported by {incident.reporter}
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(incident.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-[var(--matrix-green)]" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Network Security</span>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-green-400"></div>
                      <span className="text-sm text-green-400">Operational</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Firewall Status</span>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-green-400"></div>
                      <span className="text-sm text-green-400">Active</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">IDS/IPS</span>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                      <span className="text-sm text-yellow-400">Monitoring</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Backup Systems</span>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-green-400"></div>
                      <span className="text-sm text-green-400">Online</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-700">
                  <h4 className="text-sm font-medium text-white mb-3">Response Time Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Average Response</span>
                      <span className="text-white font-mono">4.2 min</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Resolution Rate</span>
                      <span className="text-green-400 font-mono">94.7%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">SLA Compliance</span>
                      <span className="text-green-400 font-mono">98.1%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}