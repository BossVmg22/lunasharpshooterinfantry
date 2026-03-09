-- ============================================================
-- LSI WEBSITE — SUPABASE SCHEMA  (v2 — includes posts + gallery)
-- Run this entire file in Supabase > SQL Editor
-- ============================================================

-- PROFILES
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  username    text unique not null,
  role        text not null default 'member' check (role in ('member', 'staff', 'admin')),
  created_at  timestamptz default now()
);

-- CONTENT
create table if not exists public.content (
  id          serial primary key,
  section     text not null,
  key         text not null,
  value       text not null,
  updated_by  uuid references public.profiles(id),
  updated_at  timestamptz default now(),
  unique(section, key)
);

-- POSTS
create table if not exists public.posts (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  slug        text unique not null,
  excerpt     text,
  body        text,
  cover_url   text,
  category    text default 'mission' check (category in ('mission','announcement','news')),
  status      text default 'published' check (status in ('draft','published')),
  created_by  uuid references public.profiles(id),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- GALLERY
create table if not exists public.gallery (
  id          uuid primary key default gen_random_uuid(),
  title       text,
  caption     text,
  image_url   text not null,
  category    text default 'general',
  uploaded_by uuid references public.profiles(id),
  created_at  timestamptz default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.content   enable row level security;
alter table public.posts     enable row level security;
alter table public.gallery   enable row level security;

-- Profiles policies
drop policy if exists "Own profile readable" on public.profiles;
drop policy if exists "Admin reads all" on public.profiles;
drop policy if exists "Admin updates any" on public.profiles;
create policy "Own profile readable" on public.profiles for select using (auth.uid() = id);
create policy "Admin reads all"      on public.profiles for select using (exists(select 1 from public.profiles where id=auth.uid() and role='admin'));
create policy "Admin updates any"    on public.profiles for update using (exists(select 1 from public.profiles where id=auth.uid() and role='admin'));

-- Content policies
drop policy if exists "Content public read" on public.content;
drop policy if exists "Staff insert content" on public.content;
drop policy if exists "Staff update content" on public.content;
create policy "Content public read"  on public.content for select using (true);
create policy "Staff insert content" on public.content for insert with check (exists(select 1 from public.profiles where id=auth.uid() and role in ('staff','admin')));
create policy "Staff update content" on public.content for update using (exists(select 1 from public.profiles where id=auth.uid() and role in ('staff','admin')));

-- Posts policies
drop policy if exists "Posts public read" on public.posts;
drop policy if exists "Staff insert posts" on public.posts;
drop policy if exists "Staff update posts" on public.posts;
drop policy if exists "Staff delete posts" on public.posts;
create policy "Posts public read"  on public.posts for select using (status='published' or exists(select 1 from public.profiles where id=auth.uid() and role in ('staff','admin')));
create policy "Staff insert posts" on public.posts for insert with check (exists(select 1 from public.profiles where id=auth.uid() and role in ('staff','admin')));
create policy "Staff update posts" on public.posts for update using (exists(select 1 from public.profiles where id=auth.uid() and role in ('staff','admin')));
create policy "Staff delete posts" on public.posts for delete using (exists(select 1 from public.profiles where id=auth.uid() and role in ('staff','admin')));

-- Gallery policies
drop policy if exists "Gallery public read" on public.gallery;
drop policy if exists "Staff insert gallery" on public.gallery;
drop policy if exists "Staff delete gallery" on public.gallery;
create policy "Gallery public read"  on public.gallery for select using (true);
-- Members (any logged-in user) can upload images
create policy "Member insert gallery" on public.gallery for insert with check (auth.uid() is not null);
create policy "Staff delete gallery" on public.gallery for delete using (exists(select 1 from public.profiles where id=auth.uid() and role in ('staff','admin')));

-- Auto-create profile
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1)), 'member');
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Seed content
insert into public.content (section, key, value) values
('home','hero_tagline','"Matulis at Matatag" — The main fighting force of the Philippine Army. Highly trained in urban and jungle warfare, serving as the first line of defense against insurgents and threats to national sovereignty.'),
('home','notice_1','High Command Hell Day — Weekly report submissions due. Flag Ceremony and Weekly Practice Inspection hosted by ARCOM.'),
('home','notice_2','Regular Operations — All personnel fulfill daily quota. No major events before 4:00 PM GMT+8.'),
('home','notice_3','Rest Day — All division operations optional. Designated non-working day by the CiC.'),
('about','division_definition','The Luna Sharpshooters Infantry, with the slogan "Matulis at Matatag," is the main fighting force of the Philippine Army. Highly trained in urban and jungle warfare, they are the first line of defense against insurgents.'),
('about','division_function','The LSI provides ground support to the Filipino Army, serving as the main force of the TFA — the frontline unit. We are the first troops deployed in response to raids, terrorism, and operations requiring infantry support.'),
('about','division_vision','To be a highly trained, ready, and capable combined arms division, able to meet the needs of the nation in times of conflict and peace.'),
('brigades','brigade_101_desc','The 101st Mechanized Brigade is tasked with supporting and transporting troops across the battlefield. With armored personnel carriers and transport trucks, the brigade ensures swift deployment and provides vital backup support for frontline units. Contains the 24th and 32nd Auxiliary Companies.'),
('brigades','brigade_102_desc','The 102nd Brigade serves as the reconnaissance unit of the LSI, gathering vital intelligence within enemy territory without detection. Through meticulous observation and covert movements, they provide commanders with real-time situational awareness. Contains the 14th and 12th Reconnaissance Companies.'),
('brigades','brigade_104_desc','The 104th Brigade is the primary infantry unit of the LSI, renowned for its rapid deployment capabilities. Armed with M4A1 and Glock 17, this brigade stands ready to respond swiftly. Contains the 32nd "Daredevils" Company and 35th "Makamandag" Company.'),
('pi_manual','overview','The Weekly Practice Inspection (WPI) is a mandatory formal event hosted every Saturday by the Army Combat Command (ARCOM). All personnel from PFC and above are required to attend in proper uniform.'),
('pi_manual','step_1_title','Pre-Inspection Assembly'),
('pi_manual','step_1_desc','All personnel fall in at the designated assembly area in proper uniform prior to the scheduled time. Latecomers will be noted. No weapons drawn or equipped during assembly.'),
('pi_manual','step_2_title','Report Submission'),
('pi_manual','step_2_desc','Brigade Commanding Officers and Academy Director submit weekly operational reports to Division High Command before formation begins.'),
('pi_manual','step_3_title','Formation & Roll Call'),
('pi_manual','step_3_desc','All personnel form up by unit. The Division Sergeant Major calls roll. Absent personnel without authorized leave are marked and subject to the strike system.'),
('pi_manual','step_4_title','Uniform Inspection'),
('pi_manual','step_4_desc','The Disciplinary Department (DOD) conducts a walk-through inspection. Violations result in immediate strike issuance.'),
('pi_manual','step_5_title','Flag Ceremony'),
('pi_manual','step_5_desc','The weekly Flag Ceremony is conducted by ARCOM. All personnel stand at attention. No movement, no talking, no weapons equipped.'),
('pi_manual','step_6_title','Commanding Officer Remarks'),
('pi_manual','step_6_desc','The Division CO delivers the weekly address — commendations, announcements, policy updates, or direct orders. All personnel remain at attention.'),
('pi_manual','step_7_title','Dismissal'),
('pi_manual','step_7_desc','The Division Sergeant Major formally dismisses the formation by unit. DOD and Logistics resume optional operations.'),
('handbook','strike_responsibilities','[ To be filled by Luna High Command ]'),
('handbook','strike_system','[ To be filled by Luna High Command ]'),
('handbook','quota','[ To be filled by Luna High Command ]'),
('schedule','monday_desc','All division personnel, staff, and departments operate at full capacity. No major events before 4:00 PM GMT+8 out of respect for academic schedules.'),
('schedule','saturday_desc','Departmental operations halted (optional only). High Command Hell Day: weekly reports, meetings, Flag Ceremony, and Weekly Practice Inspection.'),
('schedule','sunday_desc','All operations fully optional. Designated non-working day by the CiC. Rest and spend time with family.')
on conflict (section, key) do nothing;

-- Seed sample posts
insert into public.posts (title, slug, excerpt, body, category, status) values
('Operation Red Arrow — After Action Report','operation-red-arrow','The 101st Brigade successfully executed a logistics convoy escort through contested terrain. Zero casualties. Mission objectives met in full.','The 101st "Three Red Arrows" Brigade conducted a multi-vehicle logistics escort on the 14th of March. Despite ambush attempts along the northern route, the convoy reached the forward operating base with all cargo intact and zero casualties. The operation highlighted the brigade''s coordination between armored personnel carriers and transport elements. Commendations have been issued to convoy lead personnel.','mission','published'),
('Weekly Practice Inspection — Week 12','wpi-week-12','This week''s inspection saw a 94% attendance rate. Two strikes issued for uniform violations. Commendations to the 102nd Brigade for perfect attendance.','The WPI for Week 12 concluded with a 94% division-wide attendance rate. The 102nd Brigade achieved perfect attendance and received a formal commendation from the Division CO. Two strikes were issued for Class B uniform violations. All High Command reports were submitted on time.','announcement','published'),
('New Recruits Inducted — Academy Phase 3 Complete','academy-phase-3','Fifteen new cadets successfully completed Phase 3 of the Infantry Academy and are awaiting brigade assignment.','Fifteen cadets completed Phase 3 of the LSI Infantry Academy this week, passing all evaluations administered by the Academy Department. The Recruitment Department is currently processing brigade assignments for all fifteen graduates.','news','published')
on conflict (slug) do nothing;

-- Seed sample gallery (using placeholder images — replace with real ones)
insert into public.gallery (title, caption, image_url, category) values
('Formation Drill','Weekly Practice Inspection — all three brigades present.','https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&q=80','inspection'),
('Field Operations','104th Sultan Brigade during training exercise.','https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80','operations'),
('101st Convoy','101st Three Red Arrows Brigade logistics convoy run.','https://images.unsplash.com/photo-1520637836862-4d197d17c78a?w=800&q=80','operations'),
('Academy Graduation','Phase 3 graduation ceremony — newly inducted cadets.','https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80','academy'),
('Flag Ceremony','Saturday Flag Ceremony conducted by ARCOM.','https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&q=80','ceremony'),
('Recon Patrol','102nd Igsoon Brigade on covert recon patrol.','https://images.unsplash.com/photo-1580974852861-c381510bc98a?w=800&q=80','operations')
on conflict do nothing;

-- ============================================================
-- ADDITIONAL SEED DATA  (run after the original schema)
-- Nav dropdown items, command chains (JSON), schedule rows (JSON)
-- ============================================================

-- Nav dropdown items (editable from admin mode)
insert into public.content (section, key, value) values
('nav','units_dropdown','[{"label":"All Brigades","to":"/brigades"},{"label":"101st Brigade","to":"/brigades/101"},{"label":"102nd Brigade","to":"/brigades/102"},{"label":"104th Brigade","to":"/brigades/104"},{"label":"Infantry Academy","to":"/academy"}]'),
('nav','manuals_dropdown','[{"label":"Practice Inspection","to":"/manuals/pi"},{"label":"Personnel Handbook","to":"/manuals/handbook"},{"label":"Uniform Regulations","to":"/manuals/uniforms"}]')
on conflict (section, key) do nothing;

-- Command page — PA chain (JSON array)
insert into public.content (section, key, value) values
('command','pa_chain','[{"rank":"Commander in Chief","name":"PinkLivesssNEW"},{"rank":"Secretary of National Defense","name":"JirokoM09"},{"rank":"Commanding General, Philippine Army","name":"[ Vacant ]"},{"rank":"Deputy Commanding General, PA","name":"RafGaming543"},{"rank":"Chief of Staff, Philippine Army","name":"VyreKriegs"},{"rank":"Sergeant Major, Philippine Army","name":"GabrielDogey2230"}]'),
('command','lsi_chain','[{"rank":"Commanding Officer","name":"[ Vacant ]"},{"rank":"Executive Officer","name":"[ Vacant ]"},{"rank":"Division Sergeant Major","name":"[ Vacant ]"},{"rank":"Brigade CO / Academic Director","name":"[ Vacant ]"},{"rank":"Brigade XO / Deputy Academic Director","name":"[ Vacant ]"},{"rank":"Brigade Sergeant Major","name":"[ Vacant ]"},{"rank":"Company Commanding Officer","name":"[ Vacant ]"},{"rank":"Company Executive Officer","name":"[ Vacant ]"},{"rank":"Instructor","name":"[ Vacant ]"},{"rank":"Personnel","name":"[ Vacant ]"}]')
on conflict (section, key) do nothing;

-- Schedule rows (JSON array)
insert into public.content (section, key, value) values
('schedule','schedule_rows','[{"day":"Mon\u2013Fri","statusType":"green","statusLabel":"Regular Day","description":"All division personnel, staff, and departments operate at full capacity. No major events before 4:00 PM GMT+8 out of respect for academic schedules."},{"day":"Saturday","statusType":"red","statusLabel":"DoD Rest / HC Hell Day","description":"Departmental operations halted (optional only). High Command Hell Day: weekly reports, meetings, Flag Ceremony, and Weekly Practice Inspection."},{"day":"Sunday","statusType":"","statusLabel":"Rest Day","description":"All operations fully optional. Designated non-working day by the CiC. Rest and spend time with family."}]')
on conflict (section, key) do nothing;
