create extension if not exists pgcrypto;

create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null check (char_length(trim(text)) > 0),
  completed boolean not null default false,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  category text not null default '个人' check (category in ('工作', '个人', '健康', '学习')),
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.todos add column if not exists image_url text;
alter table public.todos replica identity full;

create index if not exists todos_user_id_idx on public.todos(user_id);
create index if not exists todos_user_id_created_at_idx on public.todos(user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_todos_updated_at on public.todos;
create trigger set_todos_updated_at
before update on public.todos
for each row
execute function public.set_updated_at();

alter table public.todos enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'todos'
  ) then
    alter publication supabase_realtime add table public.todos;
  end if;
end
$$;

drop policy if exists "authenticated users can read their own todos" on public.todos;
create policy "authenticated users can read their own todos"
on public.todos
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "authenticated users can insert their own todos" on public.todos;
create policy "authenticated users can insert their own todos"
on public.todos
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "authenticated users can update their own todos" on public.todos;
create policy "authenticated users can update their own todos"
on public.todos
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "authenticated users can delete their own todos" on public.todos;
create policy "authenticated users can delete their own todos"
on public.todos
for delete
to authenticated
using (auth.uid() = user_id);
