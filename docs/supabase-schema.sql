-- Enable extensions for UUID helpers
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Incidents table -----------------------------------------------------------
create table if not exists public.incidents (
  id uuid primary key default uuid_generate_v4(),
  reference_id text not null unique,
  title text not null,
  type text not null,
  severity text not null,
  status text not null,
  description text,
  reporter text,
  assignee text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  tools_used jsonb not null default '[]'::jsonb,
  evidence jsonb not null default '[]'::jsonb,
  timeline jsonb not null default '[]'::jsonb
);

-- Tools table ---------------------------------------------------------------
create table if not exists public.tools (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  screenshot text,
  impact text,
  category text,
  last_used timestamptz,
  usage_count int default 0,
  effectiveness text
);

-- System logs ---------------------------------------------------------------
create table if not exists public.system_logs (
  id uuid primary key default uuid_generate_v4(),
  event_time timestamptz not null default now(),
  severity text not null,
  source text not null,
  source_ip text not null,
  action text not null,
  description text not null
);

-- Chat messages -------------------------------------------------------------
create table if not exists public.chat_messages (
  id uuid primary key default uuid_generate_v4(),
  channel text not null,
  user_name text not null,
  user_role text,
  message text not null,
  incident_reference text,
  created_at timestamptz not null default now()
);

-- Sample incident data ------------------------------------------------------
insert into public.incidents (
  reference_id,
  title,
  type,
  severity,
  status,
  description,
  reporter,
  assignee,
  created_at,
  updated_at,
  tools_used,
  evidence,
  timeline
)
values
('INC-2024-001',
 'Suspicious SQL Injection Attempt',
 'SQL Injection',
 'High',
 'Investigating',
 'Multiple SQL injection attempts detected on the customer portal login form.',
 'John Doe',
 'Jane Smith',
 '2024-01-15T10:30:00Z',
 '2024-01-15T12:15:00Z',
 '[
    {"name":"Burp Suite","description":"Intercept and analyze HTTP requests","impact":"Confirmed SQLi vectors"},
    {"name":"Nmap","description":"Port scanning and service enumeration","impact":"Identified exposed database ports"},
    {"name":"Splunk","description":"Log correlation","impact":"47 injection attempts within 2 hours"}
  ]'::jsonb,
 '[
    {"id":"1","type":"image","name":"burp-suite-analysis.png","url":"#"},
    {"id":"2","type":"log","name":"access-logs.txt","url":"#"},
    {"id":"3","type":"document","name":"vulnerability-report.pdf","url":"#"}
  ]'::jsonb,
 '[
    {"id":"1","timestamp":"2024-01-15T10:30:00Z","action":"Incident Detected","description":"Monitoring system detected suspicious SQL queries","user":"System","type":"detection"},
    {"id":"2","timestamp":"2024-01-15T10:35:00Z","action":"Initial Assessment","description":"Analyst confirmed SQL injection attack","user":"John Doe","type":"analysis"},
    {"id":"3","timestamp":"2024-01-15T11:00:00Z","action":"Containment Started","description":"Rate limiting applied to affected endpoints","user":"Jane Smith","type":"containment"}
  ]'::jsonb
),
('INC-2024-002',
 'Phishing Email Campaign Detected',
 'Phishing',
 'Medium',
 'Contained',
 'Enterprise-wide phishing campaign targeting finance users.',
 'Jane Smith',
 'Mike Johnson',
 '2024-01-15T09:15:00Z',
 '2024-01-15T11:30:00Z',
 '[
    {"name":"Splunk","description":"Email log analysis","impact":"Correlated 200+ malicious emails"},
    {"name":"Wireshark","description":"Packet capture for malicious domains","impact":"Captured payload download attempt"}
  ]'::jsonb,
 '[]'::jsonb,
 '[]'::jsonb
),
('INC-2024-003',
 'Malware Detection on Workstation',
 'Malware',
 'Critical',
 'Open',
 'Ransomware artifact discovered during EDR alert triage.',
 'Mike Johnson',
 'John Doe',
 '2024-01-15T08:45:00Z',
 '2024-01-15T08:45:00Z',
 '[
    {"name":"Volatility","description":"Memory forensics","impact":"Extracted malware persistence keys"},
    {"name":"Wireshark","description":"Network packet review","impact":"Detected beaconing to C2"}
  ]'::jsonb,
 '[]'::jsonb,
 '[]'::jsonb
),
('INC-2024-004',
 'DDoS Attack on Web Server',
 'DDoS',
 'High',
 'Resolved',
 'Layer 7 DDoS against public web properties.',
 'Sarah Wilson',
 'Jane Smith',
 '2024-01-14T16:22:00Z',
 '2024-01-15T09:10:00Z',
 '[
    {"name":"Splunk","description":"Traffic anomaly detection","impact":"Identified malicious IP ranges"},
    {"name":"Nmap","description":"Port scan validation","impact":"Verified only HTTPS endpoints impacted"}
  ]'::jsonb,
 '[]'::jsonb,
 '[]'::jsonb
),
('INC-2024-005',
 'Unauthorized Access Attempt',
 'Data Breach',
 'Critical',
 'Investigating',
 'Multiple failed admin logins followed by success from unusual geo.',
 'Alex Chen',
 'John Doe',
 '2024-01-14T14:18:00Z',
 '2024-01-15T10:45:00Z',
 '[
    {"name":"Burp Suite","description":"Session manipulation testing","impact":"Confirmed weak session validation"},
    {"name":"Metasploit","description":"Exploit validation","impact":"Demonstrated credential reuse risk"}
  ]'::jsonb,
 '[]'::jsonb,
 '[]'::jsonb
),
('INC-2024-006',
 'Suspicious Network Traffic',
 'Insider Threat',
 'Medium',
 'Closed',
 'Unusual data exfil pattern detected from internal workstation.',
 'David Lee',
 'Mike Johnson',
 '2024-01-13T11:33:00Z',
 '2024-01-14T16:20:00Z',
 '[
    {"name":"Splunk","description":"Data transfer monitoring","impact":"Verified data movement volumes"},
    {"name":"Wireshark","description":"Packet capture","impact":"Captured payload for forensic storage"}
  ]'::jsonb,
 '[]'::jsonb,
 '[]'::jsonb
)
on conflict (reference_id) do update set
  title = excluded.title,
  type = excluded.type,
  severity = excluded.severity,
  status = excluded.status,
  description = excluded.description,
  reporter = excluded.reporter,
  assignee = excluded.assignee,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  tools_used = excluded.tools_used,
  evidence = excluded.evidence,
  timeline = excluded.timeline;

-- Sample tools --------------------------------------------------------------
insert into public.tools (name, description, impact, screenshot, category, last_used, usage_count, effectiveness)
values
('Nmap', 'Network discovery and port scanning', 'Identified open ports and vulnerable services', 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=400', 'Network Scanning', '2024-01-15T12:30:00Z', 47, 'High'),
('Metasploit', 'Penetration testing framework', 'Confirmed exploitation path for SQLi', 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400', 'Exploitation', '2024-01-14T16:45:00Z', 23, 'Critical'),
('Burp Suite', 'Web application security testing', 'Intercepted malicious payloads', 'https://images.pexels.com/photos/1181673/pexels-photo-1181673.jpeg?auto=compress&cs=tinysrgb&w=400', 'Web Security', '2024-01-15T10:15:00Z', 89, 'High'),
('Wireshark', 'Network protocol analyzer', 'Captured suspicious packets', 'https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg?auto=compress&cs=tinysrgb&w=400', 'Network Analysis', '2024-01-14T14:20:00Z', 34, 'High'),
('Splunk', 'SIEM platform for log correlation', 'Correlated events and attack timeline', 'https://images.pexels.com/photos/1181678/pexels-photo-1181678.jpeg?auto=compress&cs=tinysrgb&w=400', 'SIEM', '2024-01-15T13:45:00Z', 156, 'Critical')
on conflict (name) do update set
  description = excluded.description,
  impact = excluded.impact,
  screenshot = excluded.screenshot,
  category = excluded.category,
  last_used = excluded.last_used,
  usage_count = excluded.usage_count,
  effectiveness = excluded.effectiveness;

-- Sample logs ---------------------------------------------------------------
insert into public.system_logs (event_time, severity, source, source_ip, action, description) values
('2024-01-15T14:32:15Z','Critical','Firewall','192.168.1.100','BLOCKED','Multiple failed login attempts detected from external IP'),
('2024-01-15T14:28:42Z','Warning','IDS','10.0.0.45','ALERT','Suspicious SQL query pattern detected'),
('2024-01-15T14:25:18Z','Info','Web Server','203.0.113.42','LOGGED','User authentication successful for admin@company.com'),
('2024-01-15T14:22:33Z','Error','Database','10.0.0.12','FAILED','Database connection timeout during backup operation'),
('2024-01-15T14:18:07Z','Warning','Antivirus','10.0.0.78','QUARANTINED','Malicious file detected and quarantined: trojan.exe')
on conflict do nothing;

-- Sample chat ---------------------------------------------------------------
insert into public.chat_messages (channel, user_name, user_role, message, incident_reference, created_at)
values
('incidents','Jane Smith','Senior Analyst','Morning team! SQL injection incident has been patched.','INC-2024-001','2024-01-15T09:15:00Z'),
('incidents','Mike Johnson','Security Engineer','Firewall rules updated and network scan running.','INC-2024-001','2024-01-15T09:18:00Z'),
('incidents','Sarah Wilson','Incident Manager','Updating reports and notifying management.','INC-2024-001','2024-01-15T09:22:00Z'),
('incidents','John Doe','Security Analyst','Documented all tools used in the investigation.','INC-2024-001','2024-01-15T09:25:00Z'),
('incidents','Alex Chen','Forensics Specialist','Running memory forensics, results in 30 minutes.','INC-2024-003','2024-01-15T09:30:00Z')
on conflict do nothing;

