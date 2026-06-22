-- Nexus LMS - Initial schema

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  currency text default 'IDR' not null,
  language text default 'en' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Tasks
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  status text default 'todo' not null check (status in ('todo', 'in_progress', 'done')),
  priority text default 'medium' not null check (priority in ('low', 'medium', 'high')),
  due_date date,
  position integer default 0 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Notes
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null default 'Untitled',
  content text default '' not null,
  is_pinned boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Calendar events
create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  start_at timestamptz not null,
  end_at timestamptz,
  all_day boolean default false not null,
  color text default '#6366f1' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Wallets
create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  balance numeric(15, 2) default 0 not null,
  currency text default 'IDR' not null,
  icon text default 'wallet' not null,
  color text default '#6366f1' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Finance transactions (income / expense)
create table if not exists public.finance_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  wallet_id uuid references public.wallets on delete set null,
  type text not null check (type in ('income', 'expense')),
  amount numeric(15, 2) not null,
  category text,
  description text,
  transaction_date date default current_date not null,
  created_at timestamptz default now() not null
);

-- Savings goals
create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  target_amount numeric(15, 2) not null,
  current_amount numeric(15, 2) default 0 not null,
  deadline date,
  color text default '#10b981' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Indexes
create index if not exists tasks_user_id_idx on public.tasks (user_id);
create index if not exists tasks_status_idx on public.tasks (status);
create index if not exists notes_user_id_idx on public.notes (user_id);
create index if not exists calendar_events_user_id_idx on public.calendar_events (user_id);
create index if not exists calendar_events_start_at_idx on public.calendar_events (start_at);
create index if not exists wallets_user_id_idx on public.wallets (user_id);
create index if not exists finance_transactions_user_id_idx on public.finance_transactions (user_id);
create index if not exists savings_goals_user_id_idx on public.savings_goals (user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Updated_at trigger
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.update_updated_at();
create trigger tasks_updated_at before update on public.tasks
  for each row execute function public.update_updated_at();
create trigger notes_updated_at before update on public.notes
  for each row execute function public.update_updated_at();
create trigger calendar_events_updated_at before update on public.calendar_events
  for each row execute function public.update_updated_at();
create trigger wallets_updated_at before update on public.wallets
  for each row execute function public.update_updated_at();
create trigger savings_goals_updated_at before update on public.savings_goals
  for each row execute function public.update_updated_at();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.notes enable row level security;
alter table public.calendar_events enable row level security;
alter table public.wallets enable row level security;
alter table public.finance_transactions enable row level security;
alter table public.savings_goals enable row level security;

-- Profiles policies
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Tasks policies
create policy "Users can view own tasks" on public.tasks for select using (auth.uid() = user_id);
create policy "Users can insert own tasks" on public.tasks for insert with check (auth.uid() = user_id);
create policy "Users can update own tasks" on public.tasks for update using (auth.uid() = user_id);
create policy "Users can delete own tasks" on public.tasks for delete using (auth.uid() = user_id);

-- Notes policies
create policy "Users can view own notes" on public.notes for select using (auth.uid() = user_id);
create policy "Users can insert own notes" on public.notes for insert with check (auth.uid() = user_id);
create policy "Users can update own notes" on public.notes for update using (auth.uid() = user_id);
create policy "Users can delete own notes" on public.notes for delete using (auth.uid() = user_id);

-- Calendar policies
create policy "Users can view own events" on public.calendar_events for select using (auth.uid() = user_id);
create policy "Users can insert own events" on public.calendar_events for insert with check (auth.uid() = user_id);
create policy "Users can update own events" on public.calendar_events for update using (auth.uid() = user_id);
create policy "Users can delete own events" on public.calendar_events for delete using (auth.uid() = user_id);

-- Wallets policies
create policy "Users can view own wallets" on public.wallets for select using (auth.uid() = user_id);
create policy "Users can insert own wallets" on public.wallets for insert with check (auth.uid() = user_id);
create policy "Users can update own wallets" on public.wallets for update using (auth.uid() = user_id);
create policy "Users can delete own wallets" on public.wallets for delete using (auth.uid() = user_id);

-- Finance transactions policies
create policy "Users can view own transactions" on public.finance_transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions" on public.finance_transactions for insert with check (auth.uid() = user_id);
create policy "Users can update own transactions" on public.finance_transactions for update using (auth.uid() = user_id);
create policy "Users can delete own transactions" on public.finance_transactions for delete using (auth.uid() = user_id);

-- Savings goals policies
create policy "Users can view own savings" on public.savings_goals for select using (auth.uid() = user_id);
create policy "Users can insert own savings" on public.savings_goals for insert with check (auth.uid() = user_id);
create policy "Users can update own savings" on public.savings_goals for update using (auth.uid() = user_id);
create policy "Users can delete own savings" on public.savings_goals for delete using (auth.uid() = user_id);

-- Data API grants (required when "Automatically expose new tables" is disabled)
grant usage on schema public to postgres, anon, authenticated, service_role;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.tasks to authenticated;
grant select, insert, update, delete on public.notes to authenticated;
grant select, insert, update, delete on public.calendar_events to authenticated;
grant select, insert, update, delete on public.wallets to authenticated;
grant select, insert, update, delete on public.finance_transactions to authenticated;
grant select, insert, update, delete on public.savings_goals to authenticated;

grant usage, select on all sequences in schema public to authenticated;

-- Storage bucket for avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update their own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
