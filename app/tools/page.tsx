'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
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
import Textarea from '@/components/ui/Textarea';
import {
  Wrench,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Upload,
  Download,
  Shield,
  Zap,
  Bug,
  Network,
  Lock
} from 'lucide-react';
import { Tool } from '@/types';

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

type ToolEntry = Tool & {
  category: string | null;
  lastUsed: string | null;
  usageCount: number | null;
  effectiveness: string | null;
};

const categoryOptions = [
  { value: 'all', label: 'All Categories' },
  { value: 'Network Scanning', label: 'Network Scanning' },
  { value: 'Web Security', label: 'Web Security' },
  { value: 'Exploitation', label: 'Exploitation' },
  { value: 'Network Analysis', label: 'Network Analysis' },
  { value: 'SIEM', label: 'SIEM' },
  { value: 'Forensics', label: 'Forensics' }
];

const effectivenessOptions = [
  { value: 'all', label: 'All Effectiveness' },
  { value: 'Critical', label: 'Critical' },
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' }
];

const getCategoryIcon = (category: string) => {
  const icons = {
    'Network Scanning': Network,
    'Web Security': Shield,
    'Exploitation': Zap,
    'Network Analysis': Network,
    'SIEM': Shield,
    'Forensics': Bug
  };
  
  const Icon = icons[category as keyof typeof icons] || Wrench;
  return <Icon className="h-5 w-5" />;
};

const getEffectivenessBadge = (effectiveness: string) => {
  const variants = {
    'Critical': 'danger',
    'High': 'warning',
    'Medium': 'info',
    'Low': 'default'
  } as const;
  
  return <Badge variant={variants[effectiveness as keyof typeof variants] || 'default'}>{effectiveness}</Badge>;
};

export default function ToolsUsedPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [effectivenessFilter, setEffectivenessFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [tools, setTools] = useState<ToolEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetch('/api/tools')
      .then(async (res) => {
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload.error ?? 'Failed to load tools');
        }
        return res.json();
      })
      .then((payload) => {
        if (!isMounted) return;
        setTools(
          (payload.data ?? []).map((tool: any) => ({
            id: tool.id,
            name: tool.name,
            description: tool.description ?? '',
            screenshot: tool.screenshot,
            impact: tool.impact ?? 'Impact pending documentation',
            category: tool.category,
            lastUsed: tool.last_used,
            usageCount: tool.usage_count,
            effectiveness: tool.effectiveness,
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

  const filteredTools = useMemo(
    () =>
      tools.filter((tool) => {
        const matchesSearch =
          tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tool.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
          categoryFilter === 'all' ||
          !categoryFilter ||
          tool.category === categoryFilter;
        const matchesEffectiveness =
          effectivenessFilter === 'all' ||
          !effectivenessFilter ||
          tool.effectiveness === effectivenessFilter;

        return matchesSearch && matchesCategory && matchesEffectiveness;
      }),
    [tools, searchTerm, categoryFilter, effectivenessFilter]
  );

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const mostUsedTool = useMemo(() => {
    return filteredTools.reduce(
      (top, current) => {
        if ((current.usageCount ?? 0) > (top.usageCount ?? 0)) {
          return current;
        }
        return top;
      },
      filteredTools[0] ?? null
    );
  }, [filteredTools]);

  const categoryCount = useMemo(() => {
    const set = new Set(
      filteredTools.map((tool) => tool.category ?? 'Uncategorized')
    );
    return set.size;
  }, [filteredTools]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
              <Wrench className="h-8 w-8 mr-3 text-[var(--tech-purple)]" />
              Security Tools
            </h1>
            <p className="text-gray-400">Manage and track security tools used in incident investigations</p>
          </div>
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <Button
              variant="outline"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? 'List View' : 'Grid View'}
            </Button>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Tool
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
                              <CustomSelect
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  options={categoryOptions}
                />
                <CustomSelect
                  value={effectivenessFilter}
                  onChange={(e) => setEffectivenessFilter(e.target.value)}
                  options={effectivenessOptions}
                />
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="rounded border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card variant="cyber">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Tools</p>
                  <p className="text-2xl font-bold text-white">{filteredTools.length}</p>
                </div>
                <Wrench className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
          <Card variant="cyber">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Most Used</p>
                  {mostUsedTool ? (
                    <>
                      <p className="text-lg font-bold text-white">
                        {mostUsedTool.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {mostUsedTool.usageCount ?? 0} uses
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-gray-400">
                      No usage data available
                    </p>
                  )}
                </div>
                <Shield className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card variant="cyber">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Critical Tools</p>
                  <p className="text-2xl font-bold text-red-400">
                    {filteredTools.filter(tool => tool.effectiveness === 'Critical').length}
                  </p>
                </div>
                <Zap className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
          <Card variant="cyber">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Categories</p>
                  <p className="text-2xl font-bold text-green-400">
                    {categoryCount}
                  </p>
                </div>
                <Network className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tools Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => (
              <Card key={tool.id} className="hover:border-cyan-500/30 transition-all duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-lg">
                      {getCategoryIcon(tool.category ?? 'default')}
                      <span className="ml-2">{tool.name}</span>
                    </CardTitle>
                    {tool.effectiveness && getEffectivenessBadge(tool.effectiveness)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tool.screenshot && (
                      <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-800">
                        <Image
                          src={tool.screenshot}
                          alt={`${tool.name} screenshot`}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover opacity-80"
                        />
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm text-gray-300 mb-2">{tool.description}</p>
                      <div className="text-xs text-gray-400 space-y-1">
                        <p><span className="font-medium">Category:</span> {tool.category ?? 'Uncategorized'}</p>
                        <p><span className="font-medium">Last Used:</span> {formatDate(tool.lastUsed)}</p>
                        <p><span className="font-medium">Usage Count:</span> {tool.usageCount ?? 0}</p>
                      </div>
                    </div>

                    <div className="bg-gray-800/30 p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-white mb-1">Impact</h4>
                      <p className="text-xs text-gray-300">{tool.impact}</p>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
                <CardHeader>
              <CardTitle>{loading ? 'Loading tools…' : `Tools List (${filteredTools.length})`}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-300">Tool</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-300">Category</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-300">Effectiveness</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-300">Usage Count</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-300">Last Used</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTools.map((tool) => (
                      <tr key={tool.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            {getCategoryIcon(tool.category ?? 'default')}
                            <div>
                              <p className="font-medium text-white">{tool.name}</p>
                              <p className="text-sm text-gray-400 truncate max-w-xs">{tool.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-300">{tool.category ?? 'Uncategorized'}</span>
                        </td>
                        <td className="py-3 px-4">
                          {tool.effectiveness && getEffectivenessBadge(tool.effectiveness)}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-mono text-[var(--cyber-blue)]">{tool.usageCount ?? 0}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-400">{formatDate(tool.lastUsed)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-red-400" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}