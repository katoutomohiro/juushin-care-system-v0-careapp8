# Voice Notes Schema Migration

## Overview
This document describes the database schema for storing voice transcription records in Supabase.

## Table: `voice_notes`

### Purpose
Stores voice recording metadata and transcribed text from Web Speech API or Whisper API.

### Schema

\`\`\`sql
CREATE TABLE IF NOT EXISTS voice_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  duration_ms integer NOT NULL,
  text text NOT NULL,
  avg_level real,
  device text,
  user_id uuid NULL
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_voice_notes_created_at ON voice_notes (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_voice_notes_user_id ON voice_notes (user_id) WHERE user_id IS NOT NULL;
\`\`\`

### Columns

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | uuid | NO | Primary key, auto-generated |
| `created_at` | timestamptz | NO | Record creation timestamp (UTC) |
| `duration_ms` | integer | NO | Recording duration in milliseconds |
| `text` | text | NO | Transcribed text from speech recognition |
| `avg_level` | real | YES | Average audio level (0.0-1.0) during recording |
| `device` | text | YES | User agent string or device identifier |
| `user_id` | uuid | YES | Future: FK to users/profiles table for auth |

### Migration Steps

1. **Connect to Supabase SQL Editor**
   - Navigate to your Supabase project dashboard
   - Go to SQL Editor

2. **Run the schema creation**
   \`\`\`sql
   CREATE TABLE IF NOT EXISTS voice_notes (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     created_at timestamptz NOT NULL DEFAULT now(),
     duration_ms integer NOT NULL,
     text text NOT NULL,
     avg_level real,
     device text,
     user_id uuid NULL
   );

   CREATE INDEX IF NOT EXISTS idx_voice_notes_created_at ON voice_notes (created_at DESC);
   CREATE INDEX IF NOT EXISTS idx_voice_notes_user_id ON voice_notes (user_id) WHERE user_id IS NOT NULL;
   \`\`\`

3. **Verify table creation**
   \`\`\`sql
   SELECT * FROM voice_notes LIMIT 1;
   \`\`\`

4. **Configure Row Level Security (RLS)** (Optional, for production)
   \`\`\`sql
   -- Enable RLS
   ALTER TABLE voice_notes ENABLE ROW LEVEL SECURITY;

   -- Policy: Allow service role to insert/read (for API route usage)
   CREATE POLICY "Service role full access" ON voice_notes
     FOR ALL
     USING (true)
     WITH CHECK (true);

   -- Policy: Authenticated users can read their own records (future)
   -- CREATE POLICY "Users read own records" ON voice_notes
   --   FOR SELECT
   --   USING (auth.uid() = user_id);
   \`\`\`

### Environment Variables

Add the following to your `.env.local`:

\`\`\`env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
\`\`\`

**Important**: Use the **service role key** (not anon key) in API routes to bypass RLS for server-side operations.

### Testing

After migration, test the API:

\`\`\`bash
# Test save endpoint
curl -X POST http://dev-app.local:3000/api/voice/save \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Test transcript",
    "durationMs": 5000,
    "avgLevel": 0.45,
    "device": "Test"
  }'
\`\`\`

Expected response (with valid Supabase credentials):
\`\`\`json
{
  "id": "uuid-here"
}
\`\`\`

Or (without credentials):
\`\`\`json
{
  "id": "dry-run-id",
  "message": "[DRY-RUN] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set"
}
\`\`\`

### Future Enhancements

- Add `user_id` FK constraint when authentication is implemented
- Add full-text search index on `text` column for search functionality
- Consider partitioning by `created_at` for large datasets
- Add soft-delete column (`deleted_at`) for audit trail

