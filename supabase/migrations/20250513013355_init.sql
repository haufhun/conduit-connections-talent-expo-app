-- Create a table for public users
create table users (
  id uuid references auth.users on delete cascade not null primary key,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  email text unique not null,
  first_name text,
  last_name text,
    city text,
  state text,
  metadata jsonb default '{}'::jsonb,
  avatar_url text
);

-- Set up Row Level Security (RLS)
alter table users enable row level security;

create policy "Public users are viewable by everyone." on users
  for select using (true);

create policy "Users can insert their own profile." on users
  for insert with check ((select auth.uid()) = id);

create policy "Users can update own profile." on users
  for update using ((select auth.uid()) = id);

-- This trigger automatically creates a profile entry when a new user signs up via Supabase Auth.
create function public.handle_new_user()
returns trigger
set search_path = ''
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Set up Storage!
insert into storage.buckets (id, name)
  values ('avatars', 'avatars');

-- Set up access controls for storage.
create policy "Avatar images are publicly accessible." on storage.objects
  for select using (bucket_id = 'avatars');

create policy "Anyone can upload an avatar." on storage.objects
  for insert with check (bucket_id = 'avatars');