export interface IncidentRecord {
  id: string;
  reference_id: string;
  title: string;
  type: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Investigating' | 'Contained' | 'Resolved' | 'Closed';
  description: string | null;
  reporter: string | null;
  assignee: string | null;
  created_at: string;
  updated_at: string;
  tools_used: IncidentTool[];
  evidence: IncidentEvidence[];
  timeline: IncidentTimelineEvent[];
}

export interface IncidentTool {
  name: string;
  description: string;
  impact: string;
}

export interface IncidentEvidence {
  id: string;
  type: 'image' | 'document' | 'log';
  name: string;
  url: string;
}

export interface IncidentTimelineEvent {
  id: string;
  timestamp: string;
  action: string;
  description: string;
  user: string;
  type: 'detection' | 'analysis' | 'containment' | 'eradication' | 'recovery';
}

export interface ToolRecord {
  id: string;
  name: string;
  description: string;
  screenshot: string | null;
  impact: string | null;
  category: string | null;
  last_used: string | null;
  usage_count: number | null;
  effectiveness: 'Critical' | 'High' | 'Medium' | 'Low' | null;
}

export interface SystemLogRecord {
  id: string;
  event_time: string;
  severity: 'Info' | 'Warning' | 'Error' | 'Critical';
  source: string;
  source_ip: string;
  action: string;
  description: string;
}

export interface ChatMessageRecord {
  id: string;
  channel: string;
  user_name: string;
  user_role: string | null;
  message: string;
  incident_reference: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      incidents: {
        Row: IncidentRecord;
        Insert: Partial<Omit<IncidentRecord, 'id' | 'created_at' | 'updated_at'>> & {
          reference_id?: string;
        };
        Update: Partial<IncidentRecord>;
      };
      tools: {
        Row: ToolRecord;
        Insert: Partial<Omit<ToolRecord, 'id'>>;
        Update: Partial<ToolRecord>;
      };
      system_logs: {
        Row: SystemLogRecord;
        Insert: Partial<Omit<SystemLogRecord, 'id' | 'event_time'>> & {
          event_time?: string;
        };
        Update: Partial<SystemLogRecord>;
      };
      chat_messages: {
        Row: ChatMessageRecord;
        Insert: Partial<Omit<ChatMessageRecord, 'id' | 'created_at'>> & {
          channel: string;
          message: string;
          user_name: string;
        };
        Update: Partial<ChatMessageRecord>;
      };
    };
  };
}

