'use client';

import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Activity, Search, Filter, Download, Calendar, AlertTriangle } from 'lucide-react';
import { SystemLog } from '@/types';

// Custom Select component wrapper
const CustomSelect = ({ value, onChange, options }: {
  value: string;
  onChange: (e: { target: { value: string } }) => void;
  options: { value: string; label: string }[];
}) => {
  return (
    <Select value={value} onValueChange={(newValue) => onChange({ target: { value: newValue } })}>
      <SelectTrigger className="w-full bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-400 focus:ring-[var(--cyber-blue)] focus:border-[var(--cyber-blue)]">
        <SelectValue placeholder="Select option" />
      </SelectTrigger>
      <SelectContent className="bg-gray-800 border-gray-700">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} className="text-white hover:bg-gray-700">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const severityOptions = [
  { value: 'all', label: 'All Severities' },
  { value: 'Info', label: 'Info' },
  { value: 'Warning', label: 'Warning' },
  { value: 'Error', label: 'Error' },
  { value: 'Critical', label: 'Critical' }
];

const sourceOptions = [
  { value: 'all', label: 'All Sources' },
  { value: 'Firewall', label: 'Firewall' },
  { value: 'IDS', label: 'IDS/IPS' },
  { value: 'Web Server', label: 'Web Server' },
  { value: 'Database', label: 'Database' },
  { value: 'Antivirus', label: 'Antivirus' },
  { value: 'Network Monitor', label: 'Network Monitor' },
  { value: 'VPN', label: 'VPN' },
  { value: 'Email Security', label: 'Email Security' },
  { value: 'File Server', label: 'File Server' },
  { value: 'Backup System', label: 'Backup System' }
];

const getSeverityBadge = (severity: string) => {
  const variants = {
    'Info': 'info',
    'Warning': 'warning',
    'Error': 'danger',
    'Critical': 'danger'
  } as const;
  
  return <Badge variant={variants[severity as keyof typeof variants] || 'default'}>{severity}</Badge>;
};

const getSeverityIcon = (severity: string) => {
  if (severity === 'Critical' || severity === 'Error') {
    return <AlertTriangle className="h-4 w-4 text-red-400" />;
  }
  return <Activity className="h-4 w-4 text-gray-400" />;
};

export default function SystemLogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [dateRange, setDateRange] = useState('today');
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetch('/api/logs')
      .then(async (res) => {
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload.error ?? 'Failed to load logs');
        }
        return res.json();
      })
      .then((payload) => {
        if (!isMounted) return;
        setLogs(
          (payload.data ?? []).map((log: any) => ({
            id: log.id,
            timestamp: log.event_time,
            severity: log.severity,
            source: log.source,
            sourceIP: log.source_ip,
            action: log.action,
            description: log.description,
          }))
        );
        setError(null);
      })
      .catch((err: Error) => {
        if (!isMounted) return;
        setError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredLogs = useMemo(() => logs.filter((log) => {
    const matchesSearch = log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.sourceIP.includes(searchTerm) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || !severityFilter || log.severity === severityFilter;
    const matchesSource = sourceFilter === 'all' || !sourceFilter || log.source === sourceFilter;
    
    return matchesSearch && matchesSeverity && matchesSource;
  }), [logs, searchTerm, severityFilter, sourceFilter]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleExportLogs = () => {
    // Simulate export functionality
    const csvContent = [
      'Timestamp,Severity,Source,Source IP,Action,Description',
      ...filteredLogs.map(log => 
        `${log.timestamp},${log.severity},${log.source},${log.sourceIP},${log.action},"${log.description}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
              <Activity className="h-8 w-8 mr-3 text-[var(--matrix-green)]" />
              System Logs
            </h1>
            <p className="text-gray-400">Monitor system events and security alerts in real-time</p>
          </div>
          <Button onClick={handleExportLogs} className="mt-4 sm:mt-0">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search logs, IPs, actions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <CustomSelect
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                options={severityOptions}
              />
              <CustomSelect
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                options={sourceOptions}
              />
              <CustomSelect
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                options={[
                  { value: 'today', label: 'Today' },
                  { value: 'week', label: 'This Week' },
                  { value: 'month', label: 'This Month' }
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card variant="cyber">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Events</p>
                  <p className="text-2xl font-bold text-white">{filteredLogs.length}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card variant="cyber">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Critical</p>
                  <p className="text-2xl font-bold text-red-400">
                    {filteredLogs.filter(log => log.severity === 'Critical').length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
          <Card variant="cyber">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Warnings</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {filteredLogs.filter(log => log.severity === 'Warning').length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          <Card variant="cyber">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Blocked</p>
                  <p className="text-2xl font-bold text-green-400">
                    {filteredLogs.filter(log => log.action === 'BLOCKED').length}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{loading ? 'Loading events…' : `System Events (${filteredLogs.length})`}</span>
              <Filter className="h-5 w-5 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                {error}
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Timestamp</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Severity</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Source</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Source IP</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Action</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-300">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <span className="text-sm font-mono text-gray-300">
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {getSeverityIcon(log.severity)}
                          {getSeverityBadge(log.severity)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-300">{log.source}</span>
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-sm text-[var(--cyber-blue)] font-mono bg-gray-800/50 px-2 py-1 rounded">
                          {log.sourceIP}
                        </code>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-sm font-medium px-2 py-1 rounded ${
                          log.action === 'BLOCKED' ? 'bg-red-900/30 text-red-400' :
                          log.action === 'ALERT' ? 'bg-yellow-900/30 text-yellow-400' :
                          log.action === 'COMPLETED' ? 'bg-green-900/30 text-green-400' :
                          'bg-gray-800/50 text-gray-300'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-300">{log.description}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}