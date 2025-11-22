'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Hash, 
  Plus,
  Search,
  MoreVertical,
  Paperclip,
  Smile,
  Phone,
  Video,
  Settings
} from 'lucide-react';
import { ChatMessage } from '@/types';

const channels = [
  { id: 'general', name: 'general', type: 'channel', unread: 0, members: 12 },
  { id: 'incidents', name: 'incidents', type: 'channel', unread: 3, members: 8 },
  { id: 'alerts', name: 'alerts', type: 'channel', unread: 1, members: 15 },
  { id: 'tools-discussion', name: 'tools-discussion', type: 'channel', unread: 0, members: 6 },
  { id: 'threat-intel', name: 'threat-intel', type: 'channel', unread: 2, members: 10 }
];

const directMessages = [
  { id: 'jane-smith', name: 'Jane Smith', status: 'online', unread: 0, role: 'Senior Analyst' },
  { id: 'mike-johnson', name: 'Mike Johnson', status: 'away', unread: 1, role: 'Security Engineer' },
  { id: 'sarah-wilson', name: 'Sarah Wilson', status: 'online', unread: 0, role: 'Incident Manager' },
  { id: 'alex-chen', name: 'Alex Chen', status: 'offline', unread: 0, role: 'Forensics Specialist' }
];

type ChatEntry = ChatMessage & { incidentId?: string };

const getStatusColor = (status: string) => {
  const colors = {
    online: 'bg-green-400',
    away: 'bg-yellow-400',
    offline: 'bg-gray-400'
  };
  return colors[status as keyof typeof colors] || 'bg-gray-400';
};

export default function TeamChatPage() {
  const [activeChannel, setActiveChannel] = useState('incidents');
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = useCallback(() => {
    setLoading(true);
    fetch(`/api/chat?channel=${activeChannel}`)
      .then(async (res) => {
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload.error ?? 'Failed to load messages');
        }
        return res.json();
      })
      .then((payload) => {
        const normalized: ChatEntry[] = (payload.data ?? []).map((item: any) => ({
          id: item.id,
          user: item.user_name,
          message: item.message,
          timestamp: item.created_at,
          incidentId: item.incident_reference ?? undefined,
        }));
        setMessages(normalized);
        setError(null);
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [activeChannel]);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 15000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const optimisticMessage: ChatEntry = {
      id: Date.now().toString(),
      user: 'John Doe',
      message: newMessage,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage('');

    fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        channel: activeChannel,
        user_name: 'John Doe',
        user_role: 'Security Analyst',
        message: optimisticMessage.message
      })
    })
      .then(async (res) => {
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(payload.error ?? 'Failed to send message');
        }
        return res.json();
      })
      .then((payload) => {
        const persisted = payload.data;
        if (persisted) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === optimisticMessage.id
                ? {
                    id: persisted.id,
                    user: persisted.user_name,
                    message: persisted.message,
                    timestamp: persisted.created_at,
                    incidentId: persisted.incident_reference ?? undefined
                  }
                : msg
            )
          );
        }
      })
      .catch((err: Error) => {
        setError(err.message);
      });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const activeChannelName = channels.find(c => c.id === activeChannel)?.name || 'incidents';

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] flex">
        {/* Sidebar */}
        <div className="w-80 bg-gray-800/50 border-r border-gray-700 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-[var(--cyber-blue)]" />
                Team Chat
              </h2>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-900/50"
              />
            </div>
          </div>

          {/* Channels */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Channels</h3>
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {channels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => setActiveChannel(channel.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeChannel === channel.id
                        ? 'bg-cyan-900/50 text-[var(--cyber-blue)]'
                        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center">
                      <Hash className="h-4 w-4 mr-2" />
                      <span>{channel.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400">{channel.members}</span>
                      {channel.unread > 0 && (
                        <Badge variant="danger" className="text-xs px-1.5 py-0.5">
                          {channel.unread}
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Messages */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Direct Messages</h3>
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {directMessages.map((dm) => (
                  <button
                    key={dm.id}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="relative">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center mr-2">
                          <span className="text-xs font-medium text-white">
                            {dm.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-800 ${getStatusColor(dm.status)}`}></div>
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{dm.name}</p>
                        <p className="text-xs text-gray-400">{dm.role}</p>
                      </div>
                    </div>
                    {dm.unread > 0 && (
                      <Badge variant="danger" className="text-xs px-1.5 py-0.5">
                        {dm.unread}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-700 bg-gray-800/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Hash className="h-5 w-5 mr-2 text-gray-400" />
                <h2 className="text-lg font-bold text-white">{activeChannelName}</h2>
                <Badge variant="info" className="ml-3">
                  {channels.find(c => c.id === activeChannel)?.members} members
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Users className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {error && (
              <div className="rounded border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                {error}
              </div>
            )}
            {loading && messages.length === 0 && (
              <div className="text-center text-sm text-gray-400">
                Loading messages…
              </div>
            )}
            {messages.map((message, index) => {
              const showDate = index === 0 || 
                formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);
              
              return (
                <div key={message.id}>
                  {showDate && (
                    <div className="flex items-center justify-center my-4">
                      <div className="bg-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full">
                        {formatDate(message.timestamp)}
                      </div>
                    </div>
                  )}
                  <div className="flex items-start space-x-3 hover:bg-gray-800/20 p-2 rounded-lg transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-medium text-white">
                        {message.user.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-white">{message.user}</span>
                        <span className="text-xs text-gray-400">{formatTime(message.timestamp)}</span>
                        {message.incidentId && (
                          <Badge variant="info" className="text-xs">
                            {message.incidentId}
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed">{message.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-700 bg-gray-800/30">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" type="button">
                <Paperclip className="h-4 w-4" />
              </Button>
              <div className="flex-1 relative">
                <Input
                  placeholder={`Message #${activeChannelName}`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="pr-10"
                />
                <Button variant="ghost" size="sm" type="button" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <Smile className="h-4 w-4" />
                </Button>
              </div>
              <Button type="submit" disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}