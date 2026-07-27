alter table public.meetings
  add column if not exists meeting_type text not null default 'other';

update public.meetings
set meeting_type = case
  when trim(both '_' from lower(regexp_replace(coalesce(meeting_type, ''), '[^a-z]+', '_', 'g'))) = any (array[
    'partner_status',
    'customer_discovery',
    'demo',
    'seminar',
    'implementation_follow_up',
    'internal',
    'other'
  ])
    then trim(both '_' from lower(regexp_replace(coalesce(meeting_type, ''), '[^a-z]+', '_', 'g')))
  else 'other'
end;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'meetings_meeting_type_check'
      and conrelid = 'public.meetings'::regclass
  ) then
    alter table public.meetings
      add constraint meetings_meeting_type_check
      check (
        meeting_type = any (array[
          'partner_status',
          'customer_discovery',
          'demo',
          'seminar',
          'implementation_follow_up',
          'internal',
          'other'
        ])
      );
  end if;
end
$$;
