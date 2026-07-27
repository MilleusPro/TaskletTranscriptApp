alter table public.meetings
  add column if not exists review_status text;

update public.meetings
set review_status = 'needs_review'
where review_status is null
   or review_status not in ('needs_review', 'reviewed', 'needs_correction');

alter table public.meetings
  alter column review_status set default 'needs_review';

alter table public.meetings
  alter column review_status set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'meetings_review_status_check'
  ) then
    alter table public.meetings
      add constraint meetings_review_status_check
      check (review_status in ('needs_review', 'reviewed', 'needs_correction'));
  end if;
end $$;
