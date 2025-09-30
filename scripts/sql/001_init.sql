-- Enable uuid
create extension if not exists "pgcrypto";

-- Users (admins)
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  password_hash text not null,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- Sessions
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token text unique not null,
  created_at timestamptz default now(),
  expires_at timestamptz
);

-- Symptoms
do $$
begin
  if not exists (select 1 from pg_type where typname = 'symptom_type') then
    create type symptom_type as enum ('boolean', 'severity');
  end if;
end $$;

create table if not exists symptoms (
  id text primary key,
  name text not null,
  type symptom_type not null default 'boolean',
  help text
);

-- Diseases
create table if not exists diseases (
  id text primary key,
  name text not null,
  description text,
  serious boolean default false,
  recommendation text
);

-- Rules
create table if not exists rules (
  id serial primary key,
  disease_id text not null references diseases(id) on delete cascade,
  cf numeric not null check (cf >= 0 and cf <= 1),
  conditions jsonb not null,
  explanation text
);

-- Cases
create table if not exists cases (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  symptoms jsonb not null,
  results jsonb,
  top_disease_id text references diseases(id),
  top_score numeric
);

-- Seed admin
insert into users (email, name, password_hash, is_admin)
values
  ('admin@example.com', 'Admin', '$2a$10$V3K5.0xqfC4v6s8n2g4fzuqCHQO3Y8lKQx7p2v1G6cF6LwTtZqOLe', true) -- password123
on conflict (email) do nothing;

-- Seed symptoms (examples)
insert into symptoms (id, name, type, help) values
  ('S01','Demam','severity','Peningkatan suhu tubuh'),
  ('S02','Batuk berdahak','severity','Produksi dahak'),
  ('S03','Batuk kering','severity','Tanpa dahak'),
  ('S04','Sesak napas','severity','Kesulitan bernapas'),
  ('S05','Nyeri dada','severity','Rasa nyeri atau tekanan di dada'),
  ('S06','Pilek/bersin','severity','Hidung tersumbat/bersin'),
  ('S07','Riwayat alergi','boolean','Alergi sebelumnya'),
  ('S08','Keringat malam','boolean','Sering berkeringat saat malam'),
  ('S09','Penurunan berat badan','severity','Turun berat badan tanpa sebab'),
  ('S10','Nafas mengi (wheezing)','severity','Bunyi nafas bernada tinggi')
on conflict (id) do nothing;

-- Seed diseases
insert into diseases (id, name, serious, description, recommendation) values
  ('D01','Batuk berdahak (bronkitis ringan)', false, 'Peradangan bronkus dengan dahak', 'Istirahat, cairan hangat, konsultasi bila berlanjut'),
  ('D02','Batuk kering (infeksi virus)', false, 'Batuk non-produktif sering akibat virus', 'Istirahat, hidrasi, pantau gejala'),
  ('D03','Batuk alergi', false, 'Dipicu alergen', 'Hindari pemicu, antihistamin jika perlu'),
  ('D04','Tuberkulosis (TB)', true, 'Infeksi kronis Mycobacterium tuberculosis', 'Segera konsultasi ke dokter untuk pemeriksaan lanjut'),
  ('D05','Pneumonia', true, 'Infeksi paru yang dapat serius', 'Segera ke fasilitas kesehatan'),
  ('D06','Bronkitis akut', false, 'Peradangan bronkus akut', 'Istirahat, cairan, konsultasi jika gejala berat'),
  ('D07','Asma', true, 'Penyempitan saluran napas episodik', 'Gunakan inhaler sesuai anjuran, konsultasi dokter')
on conflict (id) do nothing;

-- Seed rules (>= 10)
insert into rules (disease_id, cf, conditions, explanation) values
  ('D01', 0.6, '{"S02":"medium","S01":"low"}', 'Dahak sedang + demam ringan'),
  ('D01', 0.4, '{"S02":"low","S05":"low"}', 'Dahak ringan + nyeri dada ringan'),
  ('D06', 0.5, '{"S02":"high","S01":"medium"}', 'Dahak berat + demam sedang'),
  ('D02', 0.6, '{"S03":"medium","S06":"medium"}', 'Batuk kering + pilek'),
  ('D02', 0.4, '{"S03":"low","S01":"low"}', 'Batuk kering ringan + demam ringan'),
  ('D03', 0.6, '{"S06":"medium","S07":true}', 'Pilek/bersin + riwayat alergi'),
  ('D07', 0.7, '{"S10":"medium","S04":"medium"}', 'Wheezing + sesak sedang'),
  ('D05', 0.7, '{"S01":"high","S04":"medium","S05":"medium"}', 'Demam tinggi + sesak + nyeri dada'),
  ('D04', 0.7, '{"S08":true,"S09":"medium","S03":"medium"}', 'Keringat malam + BB turun + batuk kering'),
  ('D05', 0.5, '{"S02":"medium","S01":"medium","S04":"low"}', 'Dahak + demam + sedikit sesak');

-- A couple more for coverage
insert into rules (disease_id, cf, conditions, explanation) values
  ('D07', 0.5, '{"S10":"low","S04":"low"}', 'Wheezing ringan + sesak ringan'),
  ('D03', 0.4, '{"S06":"low","S07":true}', 'Pilek ringan + alergi');
