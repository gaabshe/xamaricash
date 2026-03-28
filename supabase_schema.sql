-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS TABLE
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  display_name text,
  default_currency text default 'USD',
  theme text default 'dark',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS) for users
alter table public.users enable row level security;
create policy "Users can view own profile" on users for select using (auth.uid() = id);
create policy "Users can update own profile" on users for update using (auth.uid() = id);
create policy "Users can insert own profile" on users for insert with check (auth.uid() = id);

-- BOOKS TABLE
create table public.books (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  description text,
  currency text default 'USD',
  color_theme text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.books enable row level security;
create policy "Users can view own books" on books for select using (auth.uid() = user_id);
create policy "Users can insert own books" on books for insert with check (auth.uid() = user_id);
create policy "Users can update own books" on books for update using (auth.uid() = user_id);
create policy "Users can delete own books" on books for delete using (auth.uid() = user_id);

-- TRANSACTIONS TABLE
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  book_id uuid references public.books(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  amount numeric(10,2) not null,
  type text not null check (type in ('Income', 'Expense')),
  category text not null,
  date date not null,
  description text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.transactions enable row level security;
create policy "Users can view own transactions" on transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions" on transactions for insert with check (auth.uid() = user_id);
create policy "Users can update own transactions" on transactions for update using (auth.uid() = user_id);
create policy "Users can delete own transactions" on transactions for delete using (auth.uid() = user_id);

-- Create a trigger to automatically create a user profile when a new auth user signs up
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id, email, display_name)
  values (new.id, new.email, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
