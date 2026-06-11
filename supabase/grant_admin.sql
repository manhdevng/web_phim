-- Run this after the admin user has signed up through the app or Supabase Auth.
-- Replace the email below, then run in Supabase SQL Editor.

insert into public.admin_users (user_id, email, role, active)
select id, lower(email), 'owner', true
from auth.users
where lower(email) = lower('your-admin-email@example.com')
on conflict ((lower(email))) do update
set user_id = excluded.user_id,
    role = excluded.role,
    active = true,
    updated_at = now();
