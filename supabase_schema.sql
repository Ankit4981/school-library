-- =============================================================
-- VIRAJ INTERNATIONAL SCHOOL - DIGITAL LIBRARY HUB
-- SUPABASE POSTGRESQL SCHEMA & INITIAL DATA
-- =============================================================


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
  approval_token text,
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

-- Seed data for users
INSERT INTO users (id, username, name, pw, role, status, email, grade, at) VALUES (1, 'librarian', 'Librarian', '$2a$10$pV//m7aBgGzO5cCKRroIYuz/rgFyC1E65yy6LqveBUs04W8l7x3.y', 'librarian', 'active', 'librarian@virajis.edu.in', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO users (id, username, name, pw, role, status, email, grade, at) VALUES (2, 'ankit', 'librarian', '$2a$10$pV//m7aBgGzO5cCKRroIYuz/rgFyC1E65yy6LqveBUs04W8l7x3.y', 'admin', 'active', 'ankit@virajis.edu.in', NULL, NULL) ON CONFLICT DO NOTHING;
INSERT INTO users (id, username, name, pw, role, status, email, grade, at) VALUES (3, 'manasvi', 'Manasvi', '$2a$10$pV//m7aBgGzO5cCKRroIYuz/rgFyC1E65yy6LqveBUs04W8l7x3.y', 'admin', 'active', 'manasvi@virajis.edu.in', 'Faculty', 1793682185291) ON CONFLICT DO NOTHING;
INSERT INTO users (id, username, name, pw, role, status, email, grade, at) VALUES (4, 'manasvi@19', 'Manasvi', '$2a$10$pV//m7aBgGzO5cCKRroIYuz/rgFyC1E65yy6LqveBUs04W8l7x3.y', 'admin', 'active', 'manasvi19@virajis.edu.in', 'Faculty', 1793682185291) ON CONFLICT DO NOTHING;
SELECT setval(pg_get_serial_sequence('users', 'id'), coalesce(max(id), 1)) FROM users;

-- Seed data for items
INSERT INTO items (id, section, category, title, file, author, grade, read_time, content_type, description, featured, popular, at) VALUES (1, 'junior', 'Nursery Rhymes', 'Twinkle Twinkle & Bedtime Rhymes Collection', NULL, 'Traditional Heritage', 'Pre-K - Grade 1', '5 min read', 'book', 'A delightful collection of classic rhythmic rhymes with colorful visual stories.', 1, 1, 1791144189565) ON CONFLICT DO NOTHING;
INSERT INTO items (id, section, category, title, file, author, grade, read_time, content_type, description, featured, popular, at) VALUES (2, 'junior', 'Nursery Rhymes', 'Wheels on the Bus Singalong Edition', NULL, 'Kids Musical Circle', 'Pre-K - Grade 2', '4 min audio', 'audio', 'Energetic singalong rhymes designed to build early vocabulary and phonics.', 0, 1, 1791144189565) ON CONFLICT DO NOTHING;
INSERT INTO items (id, section, category, title, file, author, grade, read_time, content_type, description, featured, popular, at) VALUES (3, 'junior', 'Short Stories', 'The Lion and the Clever Rabbit (Panchatantra)', NULL, 'Vishnu Sharma Classics', 'Grades 1 - 3', '8 min read', 'book', 'Timeless Panchatantra fable teaching wit, wisdom and peaceful problem solving.', 1, 1, 1791144189565) ON CONFLICT DO NOTHING;
INSERT INTO items (id, section, category, title, file, author, grade, read_time, content_type, description, featured, popular, at) VALUES (4, 'junior', 'Short Stories', 'The Magic Mango Tree & Other Moral Tales', NULL, 'Sudha Murty Collection', 'Grades 2 - 4', '10 min read', 'book', 'Heartwarming stories of kindness, sharing, and honesty set in Indian villages.', 0, 1, 1791144189565) ON CONFLICT DO NOTHING;
INSERT INTO items (id, section, category, title, file, author, grade, read_time, content_type, description, featured, popular, at) VALUES (5, 'junior', 'Flip Books', 'World of Animals: Interactive Illustrated Flip Guide', NULL, 'Viraj Junior Science Hub', 'Grades 1 - 4', '12 min read', 'flipbook', 'Turn pages to discover fascinating wildlife habitats, animal sounds, and habits.', 1, 0, 1791144189565) ON CONFLICT DO NOTHING;
INSERT INTO items (id, section, category, title, file, author, grade, read_time, content_type, description, featured, popular, at) VALUES (6, 'junior', 'Flip Books', 'Space Explorers: The Solar System for Young Minds', NULL, 'NASA & Cambridge Kids', 'Grades 2 - 5', '15 min read', 'flipbook', 'Take a journey across planets, glowing stars, rocket ships, and moons.', 1, 1, 1791144189565) ON CONFLICT DO NOTHING;
INSERT INTO items (id, section, category, title, file, author, grade, read_time, content_type, description, featured, popular, at) VALUES (7, 'junior', 'Audio', 'Bedtime Audio Fairy Tales - Hansel & Gretel', NULL, 'Brothers Grimm (Audio Theatre)', 'Grades 1 - 4', '14 min audio', 'audio', 'Full voice-dramatized classic fairy tale with ambient sound effects.', 0, 1, 1791144189565) ON CONFLICT DO NOTHING;
INSERT INTO items (id, section, category, title, file, author, grade, read_time, content_type, description, featured, popular, at) VALUES (8, 'junior', 'Audio', 'The Brave Little Hummingbird', NULL, 'Folk Tales of the World', 'Grades 1 - 3', '6 min audio', 'audio', 'Inspiring audio fable on courage and doing your part no matter how small you are.', 0, 0, 1791144189565) ON CONFLICT DO NOTHING;
INSERT INTO items (id, section, category, title, file, author, grade, read_time, content_type, description, featured, popular, at) VALUES (9, 'secondary', 'Academics', 'Foundations of Physics & Science Explorer', NULL, 'NCERT & Cambridge Press', 'Grades 6 - 8', '25 min read', 'book', 'Clear visual explanations of forces, light, electricity, matter, and atoms.', 1, 1, 1791144189565) ON CONFLICT DO NOTHING;
INSERT INTO items (id, section, category, title, file, author, grade, read_time, content_type, description, featured, popular, at) VALUES (10, 'secondary', 'Academics', 'Mastering Mathematics & Logic Puzzles', NULL, 'Prof. Ramanujan Academy', 'Grades 7 - 10', '20 min read', 'book', 'Algebraic problem solving, geometric patterns, and math Olympiad training puzzles.', 0, 1, 1791144189565) ON CONFLICT DO NOTHING;
INSERT INTO items (id, section, category, title, file, author, grade, read_time, content_type, description, featured, popular, at) VALUES (11, 'secondary', 'Comics', 'Amar Chitra Katha: Epic Heroes & Great Legends', NULL, 'Anant Pai Classics', 'Grades 5 - 9', '18 min read', 'comic', 'Vibrant illustrated graphic stories depicting historic heroes and valor.', 1, 1, 1791144189565) ON CONFLICT DO NOTHING;
INSERT INTO items (id, section, category, title, file, author, grade, read_time, content_type, description, featured, popular, at) VALUES (12, 'secondary', 'Comics', 'Adventures of Tintin & The Secret Island', NULL, 'Hergé', 'Grades 6 - 10', '22 min read', 'comic', 'The iconic reporter and his faithful dog Snowy uncover a global mystery.', 0, 1, 1791144189565) ON CONFLICT DO NOTHING;
INSERT INTO items (id, section, category, title, file, author, grade, read_time, content_type, description, featured, popular, at) VALUES (13, 'secondary', 'Novels', 'Around the World in Eighty Days', NULL, 'Jules Verne', 'Grades 6 - 12', '45 min read', 'book', 'Phileas Fogg embarks on an unforgettable high-stakes journey across continents.', 1, 1, 1791144189565) ON CONFLICT DO NOTHING;
INSERT INTO items (id, section, category, title, file, author, grade, read_time, content_type, description, featured, popular, at) VALUES (14, 'secondary', 'Novels', 'The Adventures of Sherlock Holmes', NULL, 'Sir Arthur Conan Doyle', 'Grades 7 - 12', '35 min read', 'book', 'Master detective Sherlock Holmes solves the most perplexing mysteries in Victorian London.', 1, 1, 1791144189565) ON CONFLICT DO NOTHING;
INSERT INTO items (id, section, category, title, file, author, grade, read_time, content_type, description, featured, popular, at) VALUES (15, 'secondary', 'Encyclopedias', 'DK Illustrated Visual Science Encyclopedia', NULL, 'DK Publishing', 'Grades 6 - 12', '30 min read', 'encyclopedia', 'Thousands of cutting-edge diagrams covering human anatomy, space, geology, and technology.', 1, 1, 1791144189565) ON CONFLICT DO NOTHING;
INSERT INTO items (id, section, category, title, file, author, grade, read_time, content_type, description, featured, popular, at) VALUES (16, 'secondary', 'Audio Books', 'Treasure Island - Full Audio Dramatization', NULL, 'Robert Louis Stevenson', 'Grades 6 - 11', '40 min audio', 'audio', 'Jim Hawkins sets sail on the Hispaniola in search of buried treasure.', 0, 1, 1791144189565) ON CONFLICT DO NOTHING;
INSERT INTO items (id, section, category, title, file, author, grade, read_time, content_type, description, featured, popular, at) VALUES (17, 'biography', 'Scientists', 'Wings of Fire - An Autobiography', NULL, 'Dr. A.P.J. Abdul Kalam', 'Grades 6 - 12', '30 min read', 'biography', 'The inspiring story of a boy from Rameswaram who became India Missile Pioneer and President.', 1, 1, 1791144189565) ON CONFLICT DO NOTHING;
INSERT INTO items (id, section, category, title, file, author, grade, read_time, content_type, description, featured, popular, at) VALUES (18, 'biography', 'Scientists', 'Albert Einstein: A Life of Genius & Discovery', NULL, 'Walter Isaacson Edition', 'Grades 7 - 12', '25 min read', 'biography', 'How a rebellious patent clerk transformed modern understanding of space, time, and gravity.', 1, 1, 1791144189565) ON CONFLICT DO NOTHING;
INSERT INTO items (id, section, category, title, file, author, grade, read_time, content_type, description, featured, popular, at) VALUES (19, 'biography', 'Inventors', 'Marie Curie: Courage, Curiosity & Radioactivity', NULL, 'Science Heritage Foundation', 'Grades 6 - 11', '22 min read', 'biography', 'The groundbreaking journey of the first woman to win two Nobel Prizes in physics and chemistry.', 1, 1, 1791144189565) ON CONFLICT DO NOTHING;
INSERT INTO items (id, section, category, title, file, author, grade, read_time, content_type, description, featured, popular, at) VALUES (20, 'biography', 'Leaders', 'Swami Vivekananda: Inspiring Vision for Youth', NULL, 'Ramakrishna Mission', 'Grades 7 - 12', '20 min read', 'biography', 'The awakening message of strength, education, and character building for young minds.', 0, 1, 1791144189565) ON CONFLICT DO NOTHING;
INSERT INTO items (id, section, category, title, file, author, grade, read_time, content_type, description, featured, popular, at) VALUES (21, 'biography', 'Indian Personalities', 'Srinivasa Ramanujan: The Man Who Knew Infinity', NULL, 'Robert Kanigel Digest', 'Grades 8 - 12', '28 min read', 'biography', 'The pure mathematical genius whose formulas continue to unlock modern black hole physics.', 1, 1, 1791144189565) ON CONFLICT DO NOTHING;
INSERT INTO items (id, section, category, title, file, author, grade, read_time, content_type, description, featured, popular, at) VALUES (22, 'biography', 'Global Personalities', 'Mahatma Gandhi: The Story of My Experiments with Truth', NULL, 'M.K. Gandhi Digest', 'Grades 7 - 12', '30 min read', 'biography', 'The monumental journey of non-violence, courage, and moral leadership that moved nations.', 0, 1, 1791144189565) ON CONFLICT DO NOTHING;
INSERT INTO items (id, section, category, title, file, author, grade, read_time, content_type, description, featured, popular, at) VALUES (23, 'secondary', 'Novels', 'Goosebumps #19: Deep Trouble', 'deep-trouble.html', 'R.L. Stine', 'Grades 4 - 8', '45 min read', 'book', 'Billy Deep and his sister Sheena visit their marine biologist uncle Dr. D on the Caribbean research boat Cassandra. A real mermaid and a twelve-tentacled sea monster lead them into a dangerous rescue mission against greedy smugglers.', 1, 1, 1792216613859) ON CONFLICT DO NOTHING;
INSERT INTO items (id, section, category, title, file, author, grade, read_time, content_type, description, featured, popular, at) VALUES (24, 'secondary', 'Novels', 'Goosebumps #22: Ghost Beach', 'ghost-beach.html', 'R.L. Stine', 'Grades 4 - 8', '45 min read', 'book', 'Jerry and Terri Sadler spend summer in New England with cousins Brad and Agatha. Exploring a cliffside cave and an ancient graveyard, they uncover headstones bearing the names of their new playmates—and a terrifying 350-year-old secret.', 1, 1, 1792213013859) ON CONFLICT DO NOTHING;
INSERT INTO items (id, section, category, title, file, author, grade, read_time, content_type, description, featured, popular, at) VALUES (25, 'secondary', 'Novels', 'Goosebumps #21: Go Eat Worms!', 'go-eat-worms.html', 'R.L. Stine', 'Grades 4 - 8', '45 min read', 'book', 'Todd Barstow is an avid worm collector preparing his school science expo project. After slicing a live worm in half, worms mysteriously invade his cap, food, and bed—until a monstrous mother worm rises from the earth seeking revenge!', 1, 1, 1792209413859) ON CONFLICT DO NOTHING;
INSERT INTO items (id, section, category, title, file, author, grade, read_time, content_type, description, featured, popular, at) VALUES (26, 'secondary', 'Novels', 'Goosebumps #18: Monster Blood II', 'monster-blood-2.html', 'R.L. Stine', 'Grades 4 - 8', '45 min read', 'book', 'Evan Ross thought the green Monster Blood was gone forever. But when bully Conan Barber torments him and he gets stuck on hamster duty, Andy feeds a spoonful of green slime to Cuddles the hamster—who expands into a 10-foot classroom terror!', 1, 1, 1792205813859) ON CONFLICT DO NOTHING;
INSERT INTO items (id, section, category, title, file, author, grade, read_time, content_type, description, featured, popular, at) VALUES (27, 'secondary', 'Novels', 'Goosebumps #16: One Day at HorrorLand', 'one-day-at-horrorland.html', 'R.L. Stine', 'Grades 4 - 8', '45 min read', 'book', 'The Morris family takes an unexpected turn to HorrorLand, a scary theme park with the Doom Slide and Coffin Cruise. But the scares are dangerously real—the park is run by actual monsters filming for The Monster Channel!', 1, 1, 1792202213859) ON CONFLICT DO NOTHING;
INSERT INTO items (id, section, category, title, file, author, grade, read_time, content_type, description, featured, popular, at) VALUES (28, 'biography', 'Comics', 'Amar chitra katha', 'https://drive.google.com/drive/folders/1LvkXH_yMJnQcPvAsqUenn45-f_pZ2Ppu?usp=drive_link', 'Amar chitra katha', 'All Grades', '10 min read', 'book', '', 0, 0, 1792980334769) ON CONFLICT DO NOTHING;
INSERT INTO items (id, section, category, title, file, author, grade, read_time, content_type, description, featured, popular, at) VALUES (29, 'junior', 'Short Stories', 'Panchatantra: The Loyal Mongoose', 'book_1792985217_1_01_Panchatantra_The_Loyal_Mongoose.pdf', 'Pandit Vishnu Sharma', 'Pre-K - Grade 5', '5 min read', 'book', 'Complete Short Stories volume in the Viraj Digital Library collection. 1 illustrated pages available for in-site reading.', 0, 0, 1792985217732) ON CONFLICT DO NOTHING;
INSERT INTO items (id, section, category, title, file, author, grade, read_time, content_type, description, featured, popular, at) VALUES (30, 'secondary', 'Comics', 'Amar Chitra Katha: Chanakya the Mastermind', 'book_1792985217_2_Amar_Chitra_Katha_Chanakya.pdf', 'Anant Pai', 'Grades 6 - 12', '5 min read', 'book', 'Complete Comics volume in the Viraj Digital Library collection. 1 illustrated pages available for in-site reading.', 0, 0, 1792985217732) ON CONFLICT DO NOTHING;
INSERT INTO items (id, section, category, title, file, author, grade, read_time, content_type, description, featured, popular, at) VALUES (31, 'biography', 'Indian Personalities', 'APJ Abdul Kalam: My Journey', 'book_1792985217_3_Biography_APJ_Abdul_Kalam.pdf', 'Dr. A.P.J. Abdul Kalam', 'Grades 5 - 12', '5 min read', 'book', 'Complete Indian Personalities volume in the Viraj Digital Library collection. 1 illustrated pages available for in-site reading.', 0, 0, 1792985217732) ON CONFLICT DO NOTHING;
SELECT setval(pg_get_serial_sequence('items', 'id'), coalesce(max(id), 1)) FROM items;

-- Seed data for news
INSERT INTO news (id, title, body, at, category, author) VALUES (1, 'Welcome to the New Viraj Digital Knowledge & Library Hub!', 'We are proud to unveil our redesigned digital library platform. Students and teachers can now access thousands of ebooks, curriculum study guides, audio stories, interactive quizzes, and voting polls seamlessly on any device.', 1791144219961, 'Announcements', 'Chief Librarian') ON CONFLICT DO NOTHING;
INSERT INTO news (id, title, body, at, category, author) VALUES (2, 'Annual Inter-House Reading Marathon 2026', 'The Inter-House Reading Championship is now live! Read digital books, explore biographies, and participate in the weekly Test Your Wits arena to earn valuable points for your house.', 1791057819961, 'Events', 'Reading Council') ON CONFLICT DO NOTHING;
INSERT INTO news (id, title, body, at, category, author) VALUES (3, 'New Science & Astronomy Encyclopedias Added', 'The secondary wing has been enriched with the latest DK Visual Encyclopedias and Cambridge Science Explorers. Visit the Secondary Wing to start reading.', 1790971419961, 'Acquisitions', 'Science Faculty') ON CONFLICT DO NOTHING;
INSERT INTO news (id, title, body, at, category, author) VALUES (4, 'Welcome to the New Viraj Digital Knowledge & Library Hub!', 'We are proud to unveil our redesigned digital library platform. Students and teachers can now access thousands of ebooks, curriculum study guides, audio stories, interactive quizzes, and voting polls seamlessly on any device.', 1791144261053, 'Announcements', 'Chief Librarian') ON CONFLICT DO NOTHING;
INSERT INTO news (id, title, body, at, category, author) VALUES (5, '🎃 Iconic Goosebumps Classics Added to Digital Library!', 'Five complete, unabridged Goosebumps horror-thriller books by R.L. Stine are now available in the Secondary Wing! Dive into One Day at HorrorLand, Monster Blood II, Deep Trouble, Go Eat Worms!, and Ghost Beach with full-chapter text, audio narration, and original cover art.', 1792216654743, 'Acquisitions', 'Head Librarian') ON CONFLICT DO NOTHING;
SELECT setval(pg_get_serial_sequence('news', 'id'), coalesce(max(id), 1)) FROM news;

-- Seed data for candidates
INSERT INTO candidates (id, title, author, description, at) VALUES (1, 'Percy Jackson & The Olympians: The Lightning Thief', 'Rick Riordan', 'A gripping modern mythological adventure of friendship, gods, and ancient Greek quests.', 1791144267001) ON CONFLICT DO NOTHING;
INSERT INTO candidates (id, title, author, description, at) VALUES (2, 'Atomic Habits for Young Scholars', 'James Clear', 'Practical and proven strategies for students to master study routines, focus, and time management.', 1791057867001) ON CONFLICT DO NOTHING;
INSERT INTO candidates (id, title, author, description, at) VALUES (3, 'A Brief History of Time', 'Stephen Hawking', 'An accessible exploration of the Big Bang, black holes, time travel, and the nature of the cosmos.', 1790971467001) ON CONFLICT DO NOTHING;
INSERT INTO candidates (id, title, author, description, at) VALUES (4, 'Malgudi Days (Special Illustrated Edition)', 'R.K. Narayan', 'A collection of endearing, humorous, and heartwarming short stories set in fictional South India.', 1790885067001) ON CONFLICT DO NOTHING;
INSERT INTO candidates (id, title, author, description, at) VALUES (5, 'Goosebumps: Night of the Living Dummy', 'R.L. Stine', 'Vote to acquire the legendary tale of Slappy the evil ventriloquist dummy and the eerie twin sisters Lindy and Kris!', 1792216654743) ON CONFLICT DO NOTHING;
SELECT setval(pg_get_serial_sequence('candidates', 'id'), coalesce(max(id), 1)) FROM candidates;

-- Seed data for questions
INSERT INTO questions (id, section, q, opts, ans, explanation) VALUES (1, 'junior', 'How many days are there in a standard calendar year?', '["365 days","300 days","400 days","360 days"]', 0, 'A standard year has 365 days, while a leap year has 366 days.') ON CONFLICT DO NOTHING;
INSERT INTO questions (id, section, q, opts, ans, explanation) VALUES (2, 'junior', 'Which animal is famously known as the Ship of the Desert?', '["Camel","Elephant","Horse","Lion"]', 0, 'Camels can survive long journeys in hot deserts without water.') ON CONFLICT DO NOTHING;
INSERT INTO questions (id, section, q, opts, ans, explanation) VALUES (3, 'junior', 'What sweet substance do bees collect from flowers to make honey?', '["Nectar","Leaves","Water","Petals"]', 0, 'Bees collect sugary nectar from blooming flowers.') ON CONFLICT DO NOTHING;
INSERT INTO questions (id, section, q, opts, ans, explanation) VALUES (4, 'junior', 'Which primary color combined with blue produces green?', '["Yellow","Red","Purple","Orange"]', 0, 'Mixing yellow and blue pigment creates green.') ON CONFLICT DO NOTHING;
INSERT INTO questions (id, section, q, opts, ans, explanation) VALUES (5, 'junior', 'How many legs does a spider have?', '["8 legs","6 legs","10 legs","4 legs"]', 0, 'Arachnids like spiders have 8 legs, unlike insects which have 6.') ON CONFLICT DO NOTHING;
INSERT INTO questions (id, section, q, opts, ans, explanation) VALUES (6, 'secondary', 'Which cell organelle is universally known as the Powerhouse of the Cell?', '["Mitochondria","Nucleus","Ribosome","Chloroplast"]', 0, 'Mitochondria produce ATP, the cellular energy currency.') ON CONFLICT DO NOTHING;
INSERT INTO questions (id, section, q, opts, ans, explanation) VALUES (7, 'secondary', 'Who authored the classic literary work Romeo and Juliet?', '["William Shakespeare","Charles Dickens","Mark Twain","Jane Austen"]', 0, 'William Shakespeare wrote Romeo and Juliet in the late 16th century.') ON CONFLICT DO NOTHING;
INSERT INTO questions (id, section, q, opts, ans, explanation) VALUES (8, 'secondary', 'What is the approximate speed of light in a vacuum?', '["300,000 km/s","150,000 km/s","500,000 km/s","1,000,000 km/s"]', 0, 'Light travels at approximately 299,792 km per second.') ON CONFLICT DO NOTHING;
INSERT INTO questions (id, section, q, opts, ans, explanation) VALUES (9, 'secondary', 'What is the chemical symbol for Gold on the periodic table?', '["Au","Ag","Fe","Gd"]', 0, 'Au is derived from the Latin word Aurum.') ON CONFLICT DO NOTHING;
INSERT INTO questions (id, section, q, opts, ans, explanation) VALUES (10, 'secondary', 'Which planet in our solar system is known as the Red Planet?', '["Mars","Venus","Jupiter","Mercury"]', 0, 'Iron oxide on Mars surface gives it a reddish appearance.') ON CONFLICT DO NOTHING;
INSERT INTO questions (id, section, q, opts, ans, explanation) VALUES (11, 'biography', 'Dr. A.P.J. Abdul Kalam was popularly known by which prestigious title?', '["Missile Man of India","Father of the Nation","Iron Man of India","Frontier Gandhi"]', 0, 'Dr. Kalam played a pivotal role in India space and missile development.') ON CONFLICT DO NOTHING;
INSERT INTO questions (id, section, q, opts, ans, explanation) VALUES (12, 'biography', 'Which scientist formulated the universal law of gravitation under an apple tree?', '["Sir Isaac Newton","Albert Einstein","Galileo Galilei","Nikola Tesla"]', 0, 'Sir Isaac Newton published his laws of motion and gravitation in 1687.') ON CONFLICT DO NOTHING;
INSERT INTO questions (id, section, q, opts, ans, explanation) VALUES (13, 'biography', 'Marie Curie made history by winning Nobel Prizes in which two distinct sciences?', '["Physics & Chemistry","Physics & Medicine","Chemistry & Peace","Medicine & Physiology"]', 0, 'Marie Curie won in Physics (1903) and Chemistry (1911).') ON CONFLICT DO NOTHING;
INSERT INTO questions (id, section, q, opts, ans, explanation) VALUES (14, 'secondary', 'In "One Day at HorrorLand", what unexpected weakness causes the Horrors to immediately deflate like balloons?', '["Pinching them","Splashing holy water","Shining bright sunlight","Saying \"Abrahadabra\""]', 0, 'Lizzy realizes the park signs saying "NO PINCHING" were dead serious—pinching the Horrors releases their air and deflates them!') ON CONFLICT DO NOTHING;
INSERT INTO questions (id, section, q, opts, ans, explanation) VALUES (15, 'secondary', 'In "Monster Blood II", which classroom pet eats the glowing green Monster Blood and swells to ten feet tall?', '["Cuddles the hamster","Biff the black ribbon eel","Trigger the cocker spaniel","Barnaby the white rabbit"]', 0, 'Andy gives a spoonful of Monster Blood to Mr. Murphy''s classroom hamster Cuddles, who turns into a giant, furniture-chewing monster!') ON CONFLICT DO NOTHING;
INSERT INTO questions (id, section, q, opts, ans, explanation) VALUES (16, 'secondary', 'In "Go Eat Worms!", what scares away the giant underground mother worm from dragging Todd into the mud?', '["The shadow of a giant papier-mâché robin","A loud fire engine siren","A bucket of spicy chicken salad","A blast of garden water"]', 0, 'Regina and Beth walk past carrying their giant papier-mâché bird "Christopher Robin". The worm thinks it is a real predator bird and dives back underground!') ON CONFLICT DO NOTHING;
INSERT INTO questions (id, section, q, opts, ans, explanation) VALUES (17, 'secondary', 'In "Ghost Beach", who is revealed to be the actual 350-year-old ghosts from the winter of 1642?', '["The Sadler children (Sam, Louisa, Nat) and cousins Brad & Agatha","Harrison Sadler the cave hermit","The local fisherman","Jerry and Terri Sadler"]', 0, 'Harrison Sadler was the human researcher trying to trap the spirits, while the local kids and elderly cousins Brad and Agatha were the ghosts all along!') ON CONFLICT DO NOTHING;
INSERT INTO questions (id, section, q, opts, ans, explanation) VALUES (18, 'secondary', 'In "Deep Trouble", who heroically saves Billy Deep when he is attacked and bitten by a hammerhead shark?', '["A real mermaid with a shiny green tail","His sister Sheena in her scuba gear","Alexander DuBrow with a dart gun","A pod of wild dolphins"]', 0, 'The blond-haired, green-tailed mermaid battles the hammerhead shark, strikes it on the head, and later soothes Billy''s coral burns with her touch!') ON CONFLICT DO NOTHING;
SELECT setval(pg_get_serial_sequence('questions', 'id'), coalesce(max(id), 1)) FROM questions;

-- Seed data for readers
INSERT INTO readers (id, kind, name, consumed, reflection, at, class_grade, favourite_book) VALUES (1, 'school', 'Aarav Sharma', '14 Classic World Literature Novels & Science Encyclopedias', 'Reading every day has expanded my vocabulary and given me the confidence to explore new concepts in science and history.', 1791057935046, 'Grade 8A', 'The Adventures of Sherlock Holmes') ON CONFLICT DO NOTHING;
INSERT INTO readers (id, kind, name, consumed, reflection, at, class_grade, favourite_book) VALUES (2, 'digital', 'Diya Patel', '22 Digital Audiobooks & Illustrated Interactive Flipbooks', 'The digital library portal makes reading so exciting. I love listening to audio dramatizations before bedtime!', 1790971535046, 'Grade 6B', 'Wings of Fire by Dr. A.P.J. Abdul Kalam') ON CONFLICT DO NOTHING;
SELECT setval(pg_get_serial_sequence('readers', 'id'), coalesce(max(id), 1)) FROM readers;
