
# 🛡️ Safe Shield – Cybersecurity Incident Platform

A Next.js 13 App Router experience for tracking incidents, tools, logs, and team communication.  
This update adds a Supabase-backed backend with RESTful endpoints so the UI no longer depends on hard-coded fixtures.

## ✨ Features

- Dashboard metrics generated from Supabase data
- Incident catalog with filtering, detail view, evidence, and timeline
- Incident report form that persists to the database
- Security tools catalog and usage metrics
- Real-time style team chat (polling) scoped per channel
- System log explorer with export-ready data
- REST API surface (`/api/*`) powered by Supabase

## 🏁 Getting Started

```bash
npm install
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000).

### Environment variables

Copy `env.example` to `.env.local` and provide your Supabase project credentials.

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> ⚠️ Never expose the service role key outside server-side contexts.

### Database bootstrap

1. Create a new Supabase project.
2. Run the SQL in `docs/supabase-schema.sql` (includes schema + seed data).
3. Optional: customize the seed data to align with your environment.

## 🔌 API Surface

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/incidents` | GET/POST | List or create incidents |
| `/api/incidents/[reference]` | GET/PATCH/DELETE | Work with a single incident |
| `/api/tools` | GET/POST | Manage security tools |
| `/api/logs` | GET/POST | Retrieve or add system logs |
| `/api/chat` | GET/POST | Channel-based chat messages |
| `/api/dashboard` | GET | Aggregate metrics for the dashboard |

All routes use Supabase server-side clients; payload validation is handled with `zod`.

## 🧱 Project Structure

```
app/              # Next.js app router pages & API routes
components/       # Reusable UI components (Radix + Tailwind)
docs/             # Supabase schema & other reference docs
hooks/            # Custom hooks
lib/              # Supabase clients + utilities
types/            # Shared TypeScript types
```

## 📄 License

MIT — see original repository for attribution details.
