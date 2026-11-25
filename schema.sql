-- Notes table: every note belongs to the logged-in user.
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null default '',
  content text not null default '',
  color text not null default 'default',
  tags text[] not null default '{}',
  pinned boolean not null default false,
  deleted_at timestamptz,            -- null = active, set = in trash
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notes_user_updated_idx on public.notes (user_id, updated_at desc);

alter table public.notes enable row level security;

-- Row Level Security: users can only touch their own notes.
create policy "notes_select_own" on public.notes for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "notes_insert_own" on public.notes for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "notes_update_own" on public.notes for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "notes_delete_own" on public.notes for delete to authenticated
  using ((select auth.uid()) = user_id);
