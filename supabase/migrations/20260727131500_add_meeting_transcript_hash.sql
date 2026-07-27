alter table public.meetings
  add column if not exists transcript_hash text;
