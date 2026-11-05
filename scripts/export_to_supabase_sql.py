import sqlite3
import json

conn = sqlite3.connect('library.db')
conn.row_factory = sqlite3.Row
c = conn.cursor()

output = []
output.append('-- =============================================================')
output.append('-- VIRAJ INTERNATIONAL SCHOOL - DIGITAL LIBRARY HUB')
output.append('-- SUPABASE POSTGRESQL SCHEMA & INITIAL DATA')
output.append('-- =============================================================\n')

ddl = '''
-- Enable UUID extension if needed
create extension if not exists "uuid-ossp";

-- 1. Users
create table if not exists users (
  id serial primary key,
  username text unique not null,
  name text,
  email text,
  grade text,
  pw text not null,
  role text default 'member',
  status text default 'pending',
  at bigint
);

-- 2. Items (Books, Audio, Flipbooks, PDFs)
create table if not exists items (
  id serial primary key,
  section text,
  category text,
  title text not null,
  author text,
  grade text,
  read_time text,
  content_type text default 'book',
  description text,
  file text,
  featured integer default 0,
  popular integer default 0,
  at bigint
);

-- 3. Bookmarks
create table if not exists bookmarks (
  user_id integer not null,
  item_id integer not null,
  at bigint,
  primary key (user_id, item_id)
);

-- 4. Rentals (14-day digital loan passports)
create table if not exists rentals (
  id serial primary key,
  user_id integer not null,
  item_id integer not null,
  rented_at bigint,
  due_at bigint,
  returned integer default 0
);

-- 5. Campus News & Circulars
create table if not exists news (
  id serial primary key,
  title text not null,
  body text,
  category text default 'General',
  author text default 'Library Desk',
  at bigint
);

-- 6. Student Book Suggestions
create table if not exists suggestions (
  id serial primary key,
  user_id integer,
  title text,
  author text,
  category text,
  reason text,
  at bigint
);

-- 7. Democratic Book Polling Candidates
create table if not exists candidates (
  id serial primary key,
  title text,
  author text,
  description text,
  at bigint
);

-- 8. Book Votes
create table if not exists votes (
  user_id integer not null,
  cand_id integer not null,
  at bigint,
  primary key (user_id, cand_id)
);

-- 9. Test Your Wits (Quiz Bank)
create table if not exists questions (
  id serial primary key,
  section text,
  q text not null,
  opts text not null,
  ans integer not null,
  explanation text
);

-- 10. Avid Readers Spotlight
create table if not exists readers (
  id serial primary key,
  kind text,
  name text,
  class_grade text,
  consumed text,
  reflection text,
  favourite_book text,
  at bigint
);

-- 11. Activity Log
create table if not exists usage (
  id serial primary key,
  user_id integer,
  kind text,
  title text,
  at bigint
);

-- 12. Quiz Arena History
create table if not exists quiz_history (
  id serial primary key,
  user_id integer,
  category text,
  score integer,
  total integer,
  points integer,
  at bigint
);

-- 13. Persistent Sessions (for connect-pg-simple)
create table if not exists "session" (
  "sid" varchar not null collate "default",
  "sess" json not null,
  "expire" timestamp(6) not null,
  primary key ("sid")
);
create index if not exists "IDX_session_expire" on "session" ("expire");
'''
output.append(ddl)

def escape_sql(val):
    if val is None:
        return 'NULL'
    if isinstance(val, (int, float)):
        return str(val)
    s = str(val).replace("'", "''")
    return f"'{s}'"

tables = ['users', 'items', 'news', 'candidates', 'questions', 'readers']
for t in tables:
    c.execute(f'SELECT * FROM {t} ORDER BY id ASC')
    rows = c.fetchall()
    if not rows:
        continue
    cols = [col[0] for col in c.description]
    output.append(f'-- Seed data for {t}')
    for r in rows:
        val_strs = [escape_sql(r[col]) for col in cols]
        output.append(f"INSERT INTO {t} ({', '.join(cols)}) VALUES ({', '.join(val_strs)}) ON CONFLICT DO NOTHING;")
    output.append(f"SELECT setval(pg_get_serial_sequence('{t}', 'id'), coalesce(max(id), 1)) FROM {t};\n")

with open('supabase_schema.sql', 'w', encoding='utf-8') as f:
    f.write('\n'.join(output))

print('supabase_schema.sql generated successfully!')

