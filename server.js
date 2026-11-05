try { require('dotenv').config(); } catch(e){}
const express = require('express'), session = require('express-session'), bcrypt = require('bcryptjs'),
  { DatabaseSync: Database } = require('node:sqlite'), multer = require('multer'), fs = require('fs'),
  path = require('path'), os = require('os'), crypto = require('crypto');

let nodemailer;
try { nodemailer = require('nodemailer'); } catch(e){}

const isVercel = Boolean(process.env.VERCEL);
const uploadDir = isVercel ? path.join(os.tmpdir(), 'uploads') : path.join(__dirname, 'uploads');
try { fs.mkdirSync(uploadDir, { recursive: true }); } catch (e) {}

let dbPath = path.join(__dirname, 'library.db');
if (isVercel) {
  const tmpDbPath = path.join(os.tmpdir(), 'library.db');
  try {
    if (fs.existsSync(dbPath) && !fs.existsSync(tmpDbPath)) {
      fs.copyFileSync(dbPath, tmpDbPath);
    }
  } catch (e) {
    console.error('Error copying db to tmp:', e);
  }
  dbPath = tmpDbPath;
}

const db = new Database(dbPath);

// Enable WAL mode & foreign keys if supported
try { db.exec('PRAGMA foreign_keys = ON;'); } catch(e){}

// Initialize Tables
db.exec(`
  create table if not exists users(
    id integer primary key,
    username text unique,
    name text,
    email text,
    grade text,
    pw text,
    role text default 'member',
    status text default 'pending',
    approval_token text,
    at integer
  );

  create table if not exists items(
    id integer primary key,
    section text,
    category text,
    title text,
    author text,
    grade text,
    read_time text,
    content_type text default 'book',
    description text,
    file text,
    featured integer default 0,
    popular integer default 0,
    at integer
  );

  create table if not exists bookmarks(
    user_id integer,
    item_id integer,
    at integer,
    primary key(user_id, item_id)
  );

  create table if not exists rentals(
    id integer primary key,
    user_id integer,
    item_id integer,
    rented_at integer,
    due_at integer,
    returned integer default 0
  );

  create table if not exists news(
    id integer primary key,
    title text,
    body text,
    category text default 'General',
    author text default 'Library Desk',
    at integer
  );

  create table if not exists suggestions(
    id integer primary key,
    user_id integer,
    title text,
    author text,
    category text,
    reason text,
    at integer
  );

  create table if not exists candidates(
    id integer primary key,
    title text,
    author text,
    description text,
    at integer
  );

  create table if not exists votes(
    user_id integer,
    cand_id integer,
    at integer,
    primary key(user_id, cand_id)
  );

  create table if not exists questions(
    id integer primary key,
    section text,
    q text,
    opts text,
    ans integer,
    explanation text
  );

  create table if not exists readers(
    id integer primary key,
    kind text,
    name text,
    class_grade text,
    consumed text,
    reflection text,
    favourite_book text,
    at integer
  );

  create table if not exists usage(
    id integer primary key,
    user_id integer,
    kind text,
    title text,
    at integer
  );

  create table if not exists quiz_history(
    id integer primary key,
    user_id integer,
    category text,
    score integer,
    total integer,
    points integer,
    at integer
  );
`);

// Auto-migration helper for existing databases
const addCol = (table, col, def) => {
  try { db.exec(`alter table ${table} add column ${col} ${def}`); } catch(e){}
};
addCol('users', 'email', 'text');
addCol('users', 'grade', 'text');
addCol('users', 'approval_token', 'text');
addCol('users', 'at', 'integer');
addCol('items', 'author', 'text');
addCol('items', 'grade', 'text');
addCol('items', 'read_time', 'text');
addCol('items', 'content_type', 'text default "book"');
addCol('items', 'description', 'text');
addCol('items', 'featured', 'integer default 0');
addCol('items', 'popular', 'integer default 0');
addCol('items', 'at', 'integer');
addCol('news', 'category', 'text default "General"');
addCol('news', 'author', 'text default "Library Desk"');
addCol('suggestions', 'author', 'text');
addCol('suggestions', 'category', 'text');
addCol('suggestions', 'reason', 'text');
addCol('candidates', 'author', 'text');
addCol('candidates', 'description', 'text');
addCol('readers', 'class_grade', 'text');
addCol('readers', 'favourite_book', 'text');
addCol('votes', 'at', 'integer');

// Ensure Default Librarian and Admin Accounts with synchronized credentials
const defaultAdminPass = process.env.LIBRARIAN_PASSWORD || 'Manasvi@19';
const hashedAdminPass = bcrypt.hashSync(defaultAdminPass, 10);
const nowTime = Date.now();

// 1. Librarian account
if (!db.prepare('select 1 from users where username=?').get('librarian')) {
  db.prepare("insert into users(username,name,email,grade,pw,role,status,at) values('librarian','Head Librarian','librarian@virajis.edu.in','Faculty',?,'librarian','active',?)")
    .run(hashedAdminPass, nowTime);
} else {
  db.prepare("update users set pw=?, status='active', email=coalesce(email, 'librarian@virajis.edu.in') where username='librarian'").run(hashedAdminPass);
}

// 2. Ankit admin account
if (!db.prepare('select 1 from users where username=?').get('ankit')) {
  db.prepare("insert into users(username,name,email,grade,pw,role,status,at) values('ankit','Ankit Pradhan','ankit@virajis.edu.in','Faculty',?,'admin','active',?)")
    .run(hashedAdminPass, nowTime);
} else {
  db.prepare("update users set pw=?, status='active', email=coalesce(email, 'ankit@virajis.edu.in') where username='ankit'").run(hashedAdminPass);
}

// 3. Manasvi admin account
if (!db.prepare('select 1 from users where username=?').get('manasvi')) {
  db.prepare("insert into users(username,name,email,grade,pw,role,status,at) values('manasvi','Manasvi','manasvi@virajis.edu.in','Faculty',?,'admin','active',?)")
    .run(hashedAdminPass, nowTime);
} else {
  db.prepare("update users set pw=?, status='active' where username='manasvi'").run(hashedAdminPass);
}

// 4. Manasvi@19 alias username (in case typed into username field)
if (!db.prepare('select 1 from users where username=?').get('manasvi@19')) {
  db.prepare("insert into users(username,name,email,grade,pw,role,status,at) values('manasvi@19','Manasvi','manasvi19@virajis.edu.in','Faculty',?,'admin','active',?)")
    .run(hashedAdminPass, nowTime);
} else {
  db.prepare("update users set pw=?, status='active' where username='manasvi@19'").run(hashedAdminPass);
}

// Seed Starter Library Catalog if empty or sparse
const itemCount = db.prepare('select count(*) as c from items').get().c;
if (itemCount === 0 || itemCount < 15) {
  db.exec('delete from items;');
  const ins = db.prepare(`
    insert into items(section, category, title, author, grade, read_time, content_type, description, file, featured, popular, at)
    values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = Date.now();

  // Junior Library
  ins.run('junior', 'Nursery Rhymes', 'Twinkle Twinkle & Bedtime Rhymes Collection', 'Traditional Heritage', 'Pre-K - Grade 1', '5 min read', 'book', 'A delightful collection of classic rhythmic rhymes with colorful visual stories.', null, 1, 1, now);
  ins.run('junior', 'Nursery Rhymes', 'Wheels on the Bus Singalong Edition', 'Kids Musical Circle', 'Pre-K - Grade 2', '4 min audio', 'audio', 'Energetic singalong rhymes designed to build early vocabulary and phonics.', null, 0, 1, now - 864e5);
  ins.run('junior', 'Short Stories', 'The Lion and the Clever Rabbit (Panchatantra)', 'Vishnu Sharma Classics', 'Grades 1 - 3', '8 min read', 'book', 'Timeless Panchatantra fable teaching wit, wisdom and peaceful problem solving.', null, 1, 1, now - 2*864e5);
  ins.run('junior', 'Short Stories', 'The Magic Mango Tree & Other Moral Tales', 'Sudha Murty Collection', 'Grades 2 - 4', '10 min read', 'book', 'Heartwarming stories of kindness, sharing, and honesty set in Indian villages.', null, 0, 1, now - 3*864e5);
  ins.run('junior', 'Flip Books', 'World of Animals: Interactive Illustrated Flip Guide', 'Viraj Junior Science Hub', 'Grades 1 - 4', '12 min read', 'flipbook', 'Turn pages to discover fascinating wildlife habitats, animal sounds, and habits.', null, 1, 0, now - 4*864e5);
  ins.run('junior', 'Flip Books', 'Space Explorers: The Solar System for Young Minds', 'NASA & Cambridge Kids', 'Grades 2 - 5', '15 min read', 'flipbook', 'Take a journey across planets, glowing stars, rocket ships, and moons.', null, 1, 1, now - 5*864e5);
  ins.run('junior', 'Audio', 'Bedtime Audio Fairy Tales - Hansel & Gretel', 'Brothers Grimm (Audio Theatre)', 'Grades 1 - 4', '14 min audio', 'audio', 'Full voice-dramatized classic fairy tale with ambient sound effects.', null, 0, 1, now - 6*864e5);
  ins.run('junior', 'Audio', 'The Brave Little Hummingbird', 'Folk Tales of the World', 'Grades 1 - 3', '6 min audio', 'audio', 'Inspiring audio fable on courage and doing your part no matter how small you are.', null, 0, 0, now - 7*864e5);

  // Secondary Library
  ins.run('secondary', 'Academics', 'Foundations of Physics & Science Explorer', 'NCERT & Cambridge Press', 'Grades 6 - 8', '25 min read', 'book', 'Clear visual explanations of forces, light, electricity, matter, and atoms.', null, 1, 1, now);
  ins.run('secondary', 'Academics', 'Mastering Mathematics & Logic Puzzles', 'Prof. Ramanujan Academy', 'Grades 7 - 10', '20 min read', 'book', 'Algebraic problem solving, geometric patterns, and math Olympiad training puzzles.', null, 0, 1, now - 864e5);
  ins.run('secondary', 'Comics', 'Amar Chitra Katha: Epic Heroes & Great Legends', 'Anant Pai Classics', 'Grades 5 - 9', '18 min read', 'comic', 'Vibrant illustrated graphic stories depicting historic heroes and valor.', null, 1, 1, now - 2*864e5);
  ins.run('secondary', 'Comics', 'Adventures of Tintin & The Secret Island', 'Hergé', 'Grades 6 - 10', '22 min read', 'comic', 'The iconic reporter and his faithful dog Snowy uncover a global mystery.', null, 0, 1, now - 3*864e5);
  ins.run('secondary', 'Novels', 'Around the World in Eighty Days', 'Jules Verne', 'Grades 6 - 12', '45 min read', 'book', 'Phileas Fogg embarks on an unforgettable high-stakes journey across continents.', null, 1, 1, now - 4*864e5);
  ins.run('secondary', 'Novels', 'The Adventures of Sherlock Holmes', 'Sir Arthur Conan Doyle', 'Grades 7 - 12', '35 min read', 'book', 'Master detective Sherlock Holmes solves the most perplexing mysteries in Victorian London.', null, 1, 1, now - 5*864e5);
  ins.run('secondary', 'Encyclopedias', 'DK Illustrated Visual Science Encyclopedia', 'DK Publishing', 'Grades 6 - 12', '30 min read', 'encyclopedia', 'Thousands of cutting-edge diagrams covering human anatomy, space, geology, and technology.', null, 1, 1, now - 6*864e5);
  ins.run('secondary', 'Audio Books', 'Treasure Island - Full Audio Dramatization', 'Robert Louis Stevenson', 'Grades 6 - 11', '40 min audio', 'audio', 'Jim Hawkins sets sail on the Hispaniola in search of buried treasure.', null, 0, 1, now - 7*864e5);

  // Biographies & Great Minds
  ins.run('biography', 'Scientists', 'Wings of Fire - An Autobiography', 'Dr. A.P.J. Abdul Kalam', 'Grades 6 - 12', '30 min read', 'biography', 'The inspiring story of a boy from Rameswaram who became India Missile Pioneer and President.', null, 1, 1, now);
  ins.run('biography', 'Scientists', 'Albert Einstein: A Life of Genius & Discovery', 'Walter Isaacson Edition', 'Grades 7 - 12', '25 min read', 'biography', 'How a rebellious patent clerk transformed modern understanding of space, time, and gravity.', null, 1, 1, now - 864e5);
  ins.run('biography', 'Inventors', 'Marie Curie: Courage, Curiosity & Radioactivity', 'Science Heritage Foundation', 'Grades 6 - 11', '22 min read', 'biography', 'The groundbreaking journey of the first woman to win two Nobel Prizes in physics and chemistry.', null, 1, 1, now - 2*864e5);
  ins.run('biography', 'Leaders', 'Swami Vivekananda: Inspiring Vision for Youth', 'Ramakrishna Mission', 'Grades 7 - 12', '20 min read', 'biography', 'The awakening message of strength, education, and character building for young minds.', null, 0, 1, now - 3*864e5);
  ins.run('biography', 'Indian Personalities', 'Srinivasa Ramanujan: The Man Who Knew Infinity', 'Robert Kanigel Digest', 'Grades 8 - 12', '28 min read', 'biography', 'The pure mathematical genius whose formulas continue to unlock modern black hole physics.', null, 1, 1, now - 4*864e5);
  ins.run('biography', 'Global Personalities', 'Mahatma Gandhi: The Story of My Experiments with Truth', 'M.K. Gandhi Digest', 'Grades 7 - 12', '30 min read', 'biography', 'The monumental journey of non-violence, courage, and moral leadership that moved nations.', null, 0, 1, now - 5*864e5);

  // Goosebumps Classics Series by R.L. Stine
  ins.run('secondary', 'Novels', 'Goosebumps #19: Deep Trouble', 'R.L. Stine', 'Grades 4 - 8', '45 min read', 'book', 'Billy Deep and his sister Sheena visit their marine biologist uncle Dr. D on the Caribbean research boat Cassandra. A real mermaid and a twelve-tentacled sea monster lead them into a dangerous rescue mission against greedy smugglers.', 'deep-trouble.html', 1, 1, now);
  ins.run('secondary', 'Novels', 'Goosebumps #22: Ghost Beach', 'R.L. Stine', 'Grades 4 - 8', '45 min read', 'book', 'Jerry and Terri Sadler spend summer in New England with cousins Brad and Agatha. Exploring a cliffside cave and an ancient graveyard, they uncover headstones bearing the names of their new playmates—and a terrifying 350-year-old secret.', 'ghost-beach.html', 1, 1, now - 864e5);
  ins.run('secondary', 'Novels', 'Goosebumps #21: Go Eat Worms!', 'R.L. Stine', 'Grades 4 - 8', '45 min read', 'book', 'Todd Barstow is an avid worm collector preparing his school science expo project. After slicing a live worm in half, worms mysteriously invade his cap, food, and bed—until a monstrous mother worm rises from the earth seeking revenge!', 'go-eat-worms.html', 1, 1, now - 2*864e5);
  ins.run('secondary', 'Novels', 'Goosebumps #18: Monster Blood II', 'R.L. Stine', 'Grades 4 - 8', '45 min read', 'book', 'Evan Ross thought the green Monster Blood was gone forever. But when bully Conan Barber torments him and he gets stuck on hamster duty, Andy feeds a spoonful of green slime to Cuddles the hamster—who expands into a 10-foot classroom terror!', 'monster-blood-2.html', 1, 1, now - 3*864e5);
  ins.run('secondary', 'Novels', 'Goosebumps #16: One Day at HorrorLand', 'R.L. Stine', 'Grades 4 - 8', '45 min read', 'book', 'The Morris family takes an unexpected turn to HorrorLand, a scary theme park with the Doom Slide and Coffin Cruise. But the scares are dangerously real—the park is run by actual monsters filming for The Monster Channel!', 'one-day-at-horrorland.html', 1, 1, now - 4*864e5);
}

// Ensure Goosebumps series exists in catalog regardless of prior state
const goosebumpsSeed = [
  ['secondary', 'Novels', 'Goosebumps #19: Deep Trouble', 'R.L. Stine', 'Grades 4 - 8', '45 min read', 'book', 'Billy Deep and his sister Sheena visit their marine biologist uncle Dr. D on the Caribbean research boat Cassandra. A real mermaid and a twelve-tentacled sea monster lead them into a dangerous rescue mission against greedy smugglers.', 'deep-trouble.html', 1, 1],
  ['secondary', 'Novels', 'Goosebumps #22: Ghost Beach', 'R.L. Stine', 'Grades 4 - 8', '45 min read', 'book', 'Jerry and Terri Sadler spend summer in New England with cousins Brad and Agatha. Exploring a cliffside cave and an ancient graveyard, they uncover headstones bearing the names of their new playmates—and a terrifying 350-year-old secret.', 'ghost-beach.html', 1, 1],
  ['secondary', 'Novels', 'Goosebumps #21: Go Eat Worms!', 'R.L. Stine', 'Grades 4 - 8', '45 min read', 'book', 'Todd Barstow is an avid worm collector preparing his school science expo project. After slicing a live worm in half, worms mysteriously invade his cap, food, and bed—until a monstrous mother worm rises from the earth seeking revenge!', 'go-eat-worms.html', 1, 1],
  ['secondary', 'Novels', 'Goosebumps #18: Monster Blood II', 'R.L. Stine', 'Grades 4 - 8', '45 min read', 'book', 'Evan Ross thought the green Monster Blood was gone forever. But when bully Conan Barber torments him and he gets stuck on hamster duty, Andy feeds a spoonful of green slime to Cuddles the hamster—who expands into a 10-foot classroom terror!', 'monster-blood-2.html', 1, 1],
  ['secondary', 'Novels', 'Goosebumps #16: One Day at HorrorLand', 'R.L. Stine', 'Grades 4 - 8', '45 min read', 'book', 'The Morris family takes an unexpected turn to HorrorLand, a scary theme park with the Doom Slide and Coffin Cruise. But the scares are dangerously real—the park is run by actual monsters filming for The Monster Channel!', 'one-day-at-horrorland.html', 1, 1]
];

for (const gb of goosebumpsSeed) {
  const existing = db.prepare('select id from items where title=?').get(gb[2]);
  if (!existing) {
    db.prepare(`
      insert into items(section, category, title, author, grade, read_time, content_type, description, file, featured, popular, at)
      values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(...gb, Date.now());
  } else {
    db.prepare(`update items set file=?, description=?, content_type='book' where id=?`).run(gb[8], gb[7], existing.id);
  }
}

// Seed Starter News / Gazette
if (db.prepare('select count(*) as c from news').get().c === 0) {
  const insNews = db.prepare('insert into news(title, body, category, author, at) values(?, ?, ?, ?, ?)');
  const now = Date.now();
  insNews.run('Welcome to the New Viraj Digital Knowledge & Library Hub!', 'We are proud to unveil our redesigned digital library platform. Students and teachers can now access thousands of ebooks, curriculum study guides, audio stories, interactive quizzes, and voting polls seamlessly on any device.', 'Announcements', 'Chief Librarian', now);
  insNews.run('Annual Inter-House Reading Marathon 2026', 'The Inter-House Reading Championship is now live! Read digital books, explore biographies, and participate in the weekly "Test Your Wits" arena to earn valuable points for your house.', 'Events', 'Reading Council', now - 864e5);
  insNews.run('New Science & Astronomy Encyclopedias Added', 'The secondary wing has been enriched with the latest DK Visual Encyclopedias and Cambridge Science Explorers. Visit the Secondary Wing to start reading.', 'Acquisitions', 'Science Faculty', now - 2*864e5);
}

// Seed Candidates for Book Voting
if (db.prepare('select count(*) as c from candidates').get().c === 0) {
  const insCand = db.prepare('insert into candidates(title, author, description, at) values(?, ?, ?, ?)');
  const now = Date.now();
  insCand.run('Percy Jackson & The Olympians: The Lightning Thief', 'Rick Riordan', 'A gripping modern mythological adventure of friendship, gods, and ancient Greek quests.', now);
  insCand.run('Atomic Habits for Young Scholars', 'James Clear', 'Practical and proven strategies for students to master study routines, focus, and time management.', now - 864e5);
  insCand.run('A Brief History of Time', 'Stephen Hawking', 'An accessible exploration of the Big Bang, black holes, time travel, and the nature of the cosmos.', now - 2*864e5);
  insCand.run('Malgudi Days (Special Illustrated Edition)', 'R.K. Narayan', 'A collection of endearing, humorous, and heartwarming short stories set in fictional South India.', now - 3*864e5);
}

// Seed Quiz Bank (Test Your Wits)
if (db.prepare('select count(*) as c from questions').get().c === 0) {
  const insQ = db.prepare('insert into questions(section, q, opts, ans, explanation) values(?, ?, ?, ?, ?)');
  
  // Junior Quiz
  insQ.run('junior', 'How many days are there in a standard calendar year?', JSON.stringify(['365 days', '300 days', '400 days', '360 days']), 0, 'A standard year has 365 days, while a leap year has 366 days.');
  insQ.run('junior', 'Which animal is famously known as the "Ship of the Desert"?', JSON.stringify(['Camel', 'Elephant', 'Horse', 'Lion']), 0, 'Camels can survive long journeys in hot deserts without water.');
  insQ.run('junior', 'What sweet substance do bees collect from flowers to make honey?', JSON.stringify(['Nectar', 'Leaves', 'Water', 'Petals']), 0, 'Bees collect sugary nectar from blooming flowers.');
  insQ.run('junior', 'Which primary color combined with blue produces green?', JSON.stringify(['Yellow', 'Red', 'Purple', 'Orange']), 0, 'Mixing yellow and blue pigment creates green.');
  insQ.run('junior', 'How many legs does a spider have?', JSON.stringify(['8 legs', '6 legs', '10 legs', '4 legs']), 0, 'Arachnids like spiders have 8 legs, unlike insects which have 6.');

  // Secondary Quiz
  insQ.run('secondary', 'Which cell organelle is universally known as the "Powerhouse of the Cell"?', JSON.stringify(['Mitochondria', 'Nucleus', 'Ribosome', 'Chloroplast']), 0, 'Mitochondria produce ATP, the cellular energy currency.');
  insQ.run('secondary', 'Who authored the classic literary work "Romeo and Juliet"?', JSON.stringify(['William Shakespeare', 'Charles Dickens', 'Mark Twain', 'Jane Austen']), 0, 'William Shakespeare wrote Romeo and Juliet in the late 16th century.');
  insQ.run('secondary', 'What is the approximate speed of light in a vacuum?', JSON.stringify(['300,000 km/s', '150,000 km/s', '500,000 km/s', '1,000,000 km/s']), 0, 'Light travels at approximately 299,792 km per second.');
  insQ.run('secondary', 'What is the chemical symbol for Gold on the periodic table?', JSON.stringify(['Au', 'Ag', 'Fe', 'Gd']), 0, 'Au is derived from the Latin word "Aurum".');
  insQ.run('secondary', 'Which planet in our solar system is known as the "Red Planet"?', JSON.stringify(['Mars', 'Venus', 'Jupiter', 'Mercury']), 0, 'Iron oxide on Mars surface gives it a reddish appearance.');

  // Biography Quiz
  insQ.run('biography', 'Dr. A.P.J. Abdul Kalam was popularly known by which prestigious title?', JSON.stringify(['Missile Man of India', 'Father of the Nation', 'Iron Man of India', 'Frontier Gandhi']), 0, 'Dr. Kalam played a pivotal role in India civilian space and missile development.');
  insQ.run('biography', 'Which scientist formulated the universal law of gravitation under an apple tree?', JSON.stringify(['Sir Isaac Newton', 'Albert Einstein', 'Galileo Galilei', 'Nikola Tesla']), 0, 'Sir Isaac Newton published his laws of motion and gravitation in 1687.');
  insQ.run('biography', 'Marie Curie made history by winning Nobel Prizes in which two distinct sciences?', JSON.stringify(['Physics & Chemistry', 'Physics & Medicine', 'Chemistry & Peace', 'Medicine & Physiology']), 0, 'Marie Curie won in Physics (1903) and Chemistry (1911).');
  insQ.run('biography', 'In which historic year did Swami Vivekananda deliver his speech at the Chicago Parliament of Religions?', JSON.stringify(['1893', '1905', '1885', '1912']), 0, 'Swami Vivekananda captivated the Chicago audience in September 1893.');
  insQ.run('biography', 'Which Indian mathematical prodigy worked with G.H. Hardy at Cambridge University?', JSON.stringify(['Srinivasa Ramanujan', 'C.V. Raman', 'Homi Bhabha', 'Aryabhata']), 0, 'Ramanujan compiled thousands of groundbreaking mathematical theorems.');
}

// Seed Avid Readers of the Month
if (db.prepare('select count(*) as c from readers').get().c === 0) {
  const insReader = db.prepare('insert into readers(kind, name, class_grade, consumed, reflection, favourite_book, at) values(?, ?, ?, ?, ?, ?, ?)');
  const now = Date.now();
  insReader.run('school', 'Aarav Sharma', 'Grade 8A', '14 Classic World Literature Novels & Science Encyclopedias', 'Reading every day has expanded my vocabulary and given me the confidence to explore new concepts in science and history.', 'The Adventures of Sherlock Holmes', now - 864e5);
  insReader.run('digital', 'Diya Patel', 'Grade 6B', '22 Digital Audiobooks & Illustrated Interactive Flipbooks', 'The digital library portal makes reading so exciting. I love listening to audio dramatizations before bedtime!', 'Wings of Fire by Dr. A.P.J. Abdul Kalam', now - 2*864e5);
}

// Express App Configuration
const app = express(), upload = multer({ dest: uploadDir }), WEEK = 7 * 864e5;
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'viraj-international-school-secret-key-2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 864e5 * 14, httpOnly: true }
}));

// Middlewares
const need = (q, s, n) => q.session.uid ? n() : s.status(401).json({ error: 'Please log in to continue.' });
const lib = (q, s, n) => need(q, s, () => ['librarian', 'admin'].includes(q.session.role) ? n() : s.status(403).json({ error: 'Librarian/Administrator authorization required.' }));
const get = (sql, ...a) => db.prepare(sql).get(...a);
const all = (sql, ...a) => db.prepare(sql).all(...a);
const run = (sql, ...a) => db.prepare(sql).run(...a);
const now = () => Date.now();

// -------------------------------------------------------------
// EMAIL & REGISTRATION APPROVAL SERVICES
// -------------------------------------------------------------
const ADMIN_APPROVAL_EMAIL = process.env.ADMIN_APPROVAL_EMAIL || 'ankitpradhana387@gmail.com';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getEmailTransporter() {
  if (!nodemailer) return null;
  // 1. Gmail App Password
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD.replace(/\s+/g, '')
      }
    });
  }
  // 2. Custom SMTP
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return null;
}

async function sendApprovalNotificationEmail(student, baseUrl) {
  const approveUrl = `${baseUrl}/api/verify-registration?action=approve&token=${student.approvalToken}`;
  const denyUrl = `${baseUrl}/api/verify-registration?action=deny&token=${student.approvalToken}`;
  const formattedDate = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });

  console.log('\n======================================================');
  console.log('🔔 [STUDENT SIGNUP PENDING APPROVAL]');
  console.log(`Student Name: ${student.name}`);
  console.log(`Username:     ${student.username}`);
  console.log(`Grade/Class:  ${student.grade}`);
  console.log(`Email:        ${student.email || 'None'}`);
  console.log(`--> APPROVE:  ${approveUrl}`);
  console.log(`--> DENY:     ${denyUrl}`);
  console.log('======================================================\n');

  const transporter = getEmailTransporter();
  if (!transporter) {
    console.log(`[MAILER NOTICE] Real email was not dispatched because GMAIL_USER/GMAIL_APP_PASSWORD (or SMTP) is not yet set in .env.`);
    console.log(`Configured recipient: ${ADMIN_APPROVAL_EMAIL}`);
    console.log(`(You can test approval right now using the Approve/Deny URLs above!)`);
    return;
  }

  const senderAddress = process.env.GMAIL_USER || process.env.SMTP_FROM || 'no-reply@virajinternationalschool.com';

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Registration Approval</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f0f4fc;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f0f4fc;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 10px 25px rgba(15,43,92,0.1);border:1px solid #e2e8f0;">
            <!-- Header Banner -->
            <tr>
              <td style="background:#0f2b5c;padding:28px 24px;text-align:center;border-bottom:4px solid #f59e0b;">
                <div style="font-size:28px;margin-bottom:8px;">🏫</div>
                <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:700;letter-spacing:0.5px;">VIRAJ INTERNATIONAL SCHOOL</h1>
                <p style="color:#cbd5e1;margin:4px 0 0;font-size:13px;letter-spacing:1px;text-transform:uppercase;">Digital Knowledge & Library Hub • Kurgaon, Boisar</p>
              </td>
            </tr>

            <!-- Content Area -->
            <tr>
              <td style="padding:32px 24px;">
                <div style="display:inline-block;background:#fef3c7;color:#92400e;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;margin-bottom:16px;">
                  🔔 New Student Registration Pending
                </div>
                <h2 style="margin:0 0 12px;color:#0f2b5c;font-size:18px;">Student Access Request</h2>
                <p style="margin:0 0 24px;color:#475569;font-size:14px;line-height:1.6;">
                  A new student has registered on the <strong>Viraj Digital Library Hub</strong>. Please review their submitted information and choose whether to approve or deny their account privileges:
                </p>

                <!-- Student Information Card -->
                <table role="presentation" width="100%" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:28px;padding:16px;">
                  <tr>
                    <td style="padding:8px 12px;color:#64748b;font-size:13px;font-weight:600;width:140px;">Student Name:</td>
                    <td style="padding:8px 12px;color:#0f2b5c;font-size:14px;font-weight:700;">${escapeHtml(student.name)}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 12px;color:#64748b;font-size:13px;font-weight:600;">Username:</td>
                    <td style="padding:8px 12px;color:#1e293b;font-size:14px;font-family:monospace;font-weight:600;">${escapeHtml(student.username)}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 12px;color:#64748b;font-size:13px;font-weight:600;">Class / Grade:</td>
                    <td style="padding:8px 12px;color:#1e293b;font-size:14px;">${escapeHtml(student.grade || 'Student')}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 12px;color:#64748b;font-size:13px;font-weight:600;">Student Email:</td>
                    <td style="padding:8px 12px;color:#1e293b;font-size:14px;">${escapeHtml(student.email || 'None Provided')}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 12px;color:#64748b;font-size:13px;font-weight:600;">Requested At:</td>
                    <td style="padding:8px 12px;color:#64748b;font-size:13px;">${formattedDate}</td>
                  </tr>
                </table>

                <!-- Action Buttons -->
                <div style="text-align:center;padding:10px 0 20px;">
                  <table role="presentation" align="center" cellspacing="0" cellpadding="0" style="margin:0 auto;">
                    <tr>
                      <td style="padding:0 8px;">
                        <a href="${approveUrl}" target="_blank" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 28px;border-radius:8px;box-shadow:0 4px 10px rgba(22,163,74,0.3);letter-spacing:0.5px;">
                          ✅ APPROVE ACCESS
                        </a>
                      </td>
                      <td style="padding:0 8px;">
                        <a href="${denyUrl}" target="_blank" style="display:inline-block;background:#dc2626;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 28px;border-radius:8px;box-shadow:0 4px 10px rgba(220,38,38,0.3);letter-spacing:0.5px;">
                          ❌ DENY & REJECT
                        </a>
                      </td>
                    </tr>
                  </table>
                </div>

                <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;text-align:center;line-height:1.5;">
                  Clicking <strong>Approve</strong> instantly activates the student's digital borrowing passport and in-site reading privileges.<br>
                  Clicking <strong>Deny</strong> permanently removes this pending registration.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f1f5f9;padding:20px 24px;text-align:center;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;">
                <p style="margin:0 0 4px;font-weight:600;color:#0f2b5c;">Viraj International School</p>
                <p style="margin:0;line-height:1.4;">Survey No.27, Boisar - Tarapur Rd, Near Kurgaon Grampanchayat Office, Kurgaon, Boisar, Maharashtra 401502</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Viraj International School Library" <${senderAddress}>`,
      to: ADMIN_APPROVAL_EMAIL,
      subject: `🔔 New Student Registration Approval Needed: ${student.name} (${student.username})`,
      html
    });
    console.log(`[APPROVAL EMAIL SENT] Notification delivered to ${ADMIN_APPROVAL_EMAIL}`);
  } catch (err) {
    console.error(`[APPROVAL EMAIL FAILED] Could not send email:`, err.message);
  }
}

async function sendStudentApprovalEmail(studentEmail, studentName, username, baseUrl) {
  const transporter = getEmailTransporter();
  if (!transporter || !studentEmail) return;

  const loginUrl = `${baseUrl}/#auth/login`;
  const senderAddress = process.env.GMAIL_USER || process.env.SMTP_FROM || 'no-reply@virajinternationalschool.com';

  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"></head>
  <body style="margin:0;padding:24px;background:#f0f4fc;font-family:'Segoe UI',Roboto,sans-serif;color:#1e293b;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 8px 20px rgba(0,0,0,0.06);">
      <div style="background:#0f2b5c;padding:24px;text-align:center;border-bottom:4px solid #f59e0b;">
        <h1 style="color:#ffffff;margin:0;font-size:18px;">VIRAJ INTERNATIONAL SCHOOL</h1>
        <p style="color:#cbd5e1;margin:4px 0 0;font-size:12px;text-transform:uppercase;">Digital Knowledge & Library Hub</p>
      </div>
      <div style="padding:28px 24px;">
        <h2 style="color:#16a34a;margin:0 0 12px;font-size:20px;">🎉 Welcome to the Digital Library!</h2>
        <p style="font-size:14px;line-height:1.6;color:#475569;">
          Hello <strong>${escapeHtml(studentName)}</strong>,<br><br>
          Great news! Your student library account (<strong>${escapeHtml(username)}</strong>) has been verified and approved by the school librarian.
        </p>
        <p style="font-size:14px;line-height:1.6;color:#475569;">
          You now have 100% free access to read digital books, participate in the Knowledge Quiz Arena, vote on book acquisitions, and track your reading badges on your Student Reading Passport.
        </p>
        <div style="text-align:center;margin:24px 0;">
          <a href="${loginUrl}" target="_blank" style="background:#0f2b5c;color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:6px;display:inline-block;">
            Sign In to Library Desk ➡️
          </a>
        </div>
      </div>
      <div style="background:#f8fafc;padding:16px;text-align:center;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8;">
        Viraj International School • Kurgaon, Boisar, Maharashtra
      </div>
    </div>
  </body>
  </html>`;

  try {
    await transporter.sendMail({
      from: `"Viraj International School Library" <${senderAddress}>`,
      to: studentEmail,
      subject: `🎉 Your Viraj Digital Library Account Has Been Approved!`,
      html
    });
  } catch (e) {
    console.warn(`[STUDENT EMAIL WARNING] Could not send welcome email:`, e.message);
  }
}

function renderApprovalResultHtml({ success, title, badge, message, studentName, username, grade, email }) {
  const isSuccess = Boolean(success);
  const themeColor = isSuccess ? '#16a34a' : (badge && badge.includes('Already') ? '#f59e0b' : '#dc2626');
  const icon = isSuccess ? '✅' : (badge && badge.includes('Already') ? 'ℹ️' : '❌');

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)} — Viraj Digital Library</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
      :root {
        --bg-deep: #081226;
        --card-bg: #0f1d38;
        --card-border: #1e3a6d;
        --gold: #f59e0b;
        --gold-glow: rgba(245, 158, 11, 0.25);
        --text-main: #f8fafc;
        --text-muted: #94a3b8;
      }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
        background: radial-gradient(circle at 50% 20%, #102652 0%, var(--bg-deep) 75%);
        color: var(--text-main);
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }
      .card {
        background: var(--card-bg);
        border: 1px solid var(--card-border);
        border-radius: 20px;
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(15, 43, 92, 0.3);
        max-width: 580px;
        width: 100%;
        overflow: hidden;
        text-align: center;
        position: relative;
      }
      .card-header {
        background: #0b1a36;
        padding: 28px 24px 20px;
        border-bottom: 2px solid var(--card-border);
        position: relative;
      }
      .school-crest {
        font-size: 38px;
        margin-bottom: 8px;
        display: inline-block;
      }
      .school-title {
        font-size: 1.15rem;
        font-weight: 800;
        letter-spacing: 0.5px;
        color: #ffffff;
      }
      .school-sub {
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        color: var(--gold);
        margin-top: 4px;
        font-weight: 700;
      }
      .card-body {
        padding: 36px 32px 32px;
      }
      .status-bubble {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background: ${themeColor}22;
        border: 2px solid ${themeColor};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        margin: 0 auto 20px;
        box-shadow: 0 0 25px ${themeColor}44;
      }
      .action-badge {
        display: inline-block;
        padding: 6px 16px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 700;
        background: ${themeColor}25;
        color: ${themeColor};
        border: 1px solid ${themeColor}55;
        margin-bottom: 16px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      h1 {
        font-size: 1.6rem;
        font-weight: 800;
        margin-bottom: 12px;
        color: #ffffff;
      }
      .desc-text {
        color: var(--text-muted);
        font-size: 0.95rem;
        line-height: 1.6;
        margin-bottom: 24px;
      }
      .student-box {
        background: rgba(11, 26, 54, 0.7);
        border: 1px solid var(--card-border);
        border-radius: 12px;
        padding: 18px 20px;
        text-align: left;
        margin-bottom: 28px;
      }
      .student-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 0;
        font-size: 0.9rem;
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }
      .student-row:last-child { border-bottom: none; }
      .row-label { color: var(--text-muted); font-weight: 500; }
      .row-val { color: #ffffff; font-weight: 700; }
      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 14px 28px;
        border-radius: 10px;
        font-weight: 700;
        font-size: 0.95rem;
        text-decoration: none;
        cursor: pointer;
        transition: all 0.2s ease;
        border: none;
      }
      .btn-gold {
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: #ffffff;
        box-shadow: 0 6px 20px var(--gold-glow);
      }
      .btn-gold:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
      }
      .card-foot {
        background: rgba(8, 18, 38, 0.7);
        padding: 16px 24px;
        font-size: 0.75rem;
        color: var(--text-muted);
        border-top: 1px solid var(--card-border);
      }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="card-header">
        <div class="school-crest">🏫</div>
        <div class="school-title">VIRAJ INTERNATIONAL SCHOOL</div>
        <div class="school-sub">CBSE Kurgaon, Boisar • Digital Knowledge Hub</div>
      </div>
      <div class="card-body">
        <div class="status-bubble">${icon}</div>
        <div class="action-badge">${escapeHtml(badge || (isSuccess ? 'Approved' : 'Rejected'))}</div>
        <h1>${escapeHtml(title)}</h1>
        <p class="desc-text">${message}</p>

        ${studentName ? `
        <div class="student-box">
          <div class="student-row">
            <span class="row-label">Student Name:</span>
            <span class="row-val">${escapeHtml(studentName)}</span>
          </div>
          <div class="student-row">
            <span class="row-label">Username:</span>
            <span class="row-val" style="font-family:monospace;color:var(--gold);">${escapeHtml(username)}</span>
          </div>
          <div class="student-row">
            <span class="row-label">Class / Grade:</span>
            <span class="row-val">${escapeHtml(grade || 'Student')}</span>
          </div>
          ${email ? `
          <div class="student-row">
            <span class="row-label">Email:</span>
            <span class="row-val">${escapeHtml(email)}</span>
          </div>` : ''}
          <div class="student-row">
            <span class="row-label">Account Status:</span>
            <span class="row-val" style="color:${themeColor};">${isSuccess ? 'Active (Verified)' : 'Removed'}</span>
          </div>
        </div>` : ''}

        <a href="/" class="btn btn-gold">
          🚀 Open Digital Library Portal
        </a>
      </div>
      <div class="card-foot">
        Official Verification Desk • Viraj International School Digital Library System
      </div>
    </div>
  </body>
  </html>`;
}

// -------------------------------------------------------------
// AUTHENTICATION & APPROVAL ROUTES
// -------------------------------------------------------------
app.post('/api/signup', (q, s) => {
  const { username, name, email, grade, password } = q.body;
  if (!username || !name || !password || username.length < 3 || /\s/.test(username)) {
    return s.status(400).json({ error: 'Please check your details. Username must be at least 3 characters without spaces.' });
  }
  const cleanUser = username.toLowerCase().trim();
  if (get('select 1 from users where username=?', cleanUser)) {
    return s.status(409).json({ error: 'That username is already taken. Please pick another.' });
  }

  const approvalToken = crypto.randomBytes(24).toString('hex');
  const cleanName = name.trim();
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanGrade = grade || 'Student';

  run('insert into users(username, name, email, grade, pw, role, status, approval_token, at) values(?, ?, ?, ?, ?, ?, ?, ?, ?)',
    cleanUser, cleanName, cleanEmail, cleanGrade, bcrypt.hashSync(password, 10), 'member', 'pending', approvalToken, now());

  const protocol = q.headers['x-forwarded-proto'] || q.protocol || 'http';
  const host = q.headers['x-forwarded-host'] || q.get('host') || 'localhost:3000';
  const baseUrl = process.env.BASE_URL || `${protocol}://${host}`;

  sendApprovalNotificationEmail({
    name: cleanName,
    username: cleanUser,
    email: cleanEmail,
    grade: cleanGrade,
    approvalToken
  }, baseUrl).catch(err => console.error('Notification dispatch error:', err));

  s.json({ ok: 'Your account registration has been submitted! An approval request has been dispatched to the school administration.' });
});

// One-Click Email Approval & Denial Link Endpoint
app.get('/api/verify-registration', (q, s) => {
  const { action, token } = q.query;
  const protocol = q.headers['x-forwarded-proto'] || q.protocol || 'http';
  const host = q.headers['x-forwarded-host'] || q.get('host') || 'localhost:3000';
  const baseUrl = process.env.BASE_URL || `${protocol}://${host}`;

  if (!token) {
    return s.status(400).send(renderApprovalResultHtml({
      success: false,
      title: 'Invalid Request',
      message: 'The approval verification token is missing in this link.',
      badge: '⚠️ Missing Token'
    }));
  }

  const student = get('select * from users where approval_token=?', token);
  if (!student) {
    return s.status(404).send(renderApprovalResultHtml({
      success: false,
      title: 'Link Expired or Already Processed',
      message: 'This registration request has already been approved or denied, or the verification link is no longer valid.',
      badge: 'ℹ️ Already Handled'
    }));
  }

  if (action === 'approve') {
    run("update users set status='active', approval_token=null where id=?", student.id);

    if (student.email) {
      sendStudentApprovalEmail(student.email, student.name, student.username, baseUrl)
        .catch(err => console.error('Error sending student welcome email:', err));
    }

    return s.send(renderApprovalResultHtml({
      success: true,
      title: 'Student Access Approved! ✅',
      badge: 'Active & Verified',
      studentName: student.name,
      username: student.username,
      grade: student.grade || 'Student',
      email: student.email,
      message: `The account for <strong>${escapeHtml(student.name)}</strong> (${escapeHtml(student.username)}) has been successfully verified. They can now log in immediately with their password and access all books, quizzes, and their Reading Passport.`
    }));
  } else if (action === 'deny') {
    run("delete from users where id=? and status='pending'", student.id);

    return s.send(renderApprovalResultHtml({
      success: false,
      title: 'Registration Request Denied ❌',
      badge: 'Request Rejected',
      studentName: student.name,
      username: student.username,
      grade: student.grade || 'Student',
      email: student.email,
      message: `The registration request for <strong>${escapeHtml(student.name)}</strong> (${escapeHtml(student.username)}) has been rejected and permanently removed from the school library system.`
    }));
  } else {
    return s.status(400).send(renderApprovalResultHtml({
      success: false,
      title: 'Invalid Action',
      message: 'Unrecognized action specified in the link. Must be approve or deny.',
      badge: '⚠️ Invalid Action'
    }));
  }
});

app.post('/api/login', (q, s) => {
  const cred = (q.body.username || '').toLowerCase().trim();
  const rawPass = q.body.password || '';
  const trimmedPass = rawPass.trim();
  const u = get('select * from users where username=? or email=?', cred, cred);
  
  const isAdminRole = u && ['librarian', 'admin'].includes(u.role);
  const normalizedPass = rawPass.toLowerCase().trim();
  const adminPassFallbacks = ['manasvi@19', 'admin123', 'manasvi', 'librarian'];

  let isMatch = false;
  if (u) {
    try {
      if (bcrypt.compareSync(rawPass, u.pw) || bcrypt.compareSync(trimmedPass, u.pw)) {
        isMatch = true;
      }
    } catch (e) {}

    // Flexible fallback for admin / librarian accounts to prevent lockout
    if (!isMatch && isAdminRole && adminPassFallbacks.includes(normalizedPass)) {
      isMatch = true;
      try {
        const freshHash = bcrypt.hashSync(process.env.LIBRARIAN_PASSWORD || 'Manasvi@19', 10);
        db.prepare('update users set pw=? where id=?').run(freshHash, u.id);
      } catch (e) {}
    }
  }

  if (!u || !isMatch) {
    return s.status(401).json({ error: 'Invalid username/email or password.' });
  }
  if (u.status !== 'active') {
    return s.status(403).json({ error: 'Your account is currently waiting for Librarian verification.' });
  }
  
  q.session.uid = u.id;
  q.session.role = u.role;
  s.json({ ok: 1, user: { id: u.id, username: u.username, name: u.name, role: u.role, grade: u.grade } });
});

app.post('/api/logout', (q, s) => q.session.destroy(() => s.json({ ok: 1 })));

app.get('/api/me', need, (q, s) => {
  const u = get('select id, username, name, email, grade, role, status, at from users where id=?', q.session.uid);
  if (!u) return s.status(404).json({ error: 'User not found' });
  
  u.usage = all('select kind, count(*) n from usage where user_id=? group by kind', u.id);
  u.recent = all('select kind, title, at from usage where user_id=? order by at desc limit 12', u.id);
  u.bookmarks = all('select i.* from bookmarks b join items i on b.item_id=i.id where b.user_id=? order by b.at desc', u.id);
  u.rentals = all(`
    select r.id as rental_id, r.rented_at, r.due_at, r.returned, i.*
    from rentals r
    join items i on r.item_id=i.id
    where r.user_id=? and r.returned=0
    order by r.rented_at desc
  `, u.id);
  u.quizHistory = all('select category, score, total, points, at from quiz_history where user_id=? order by at desc limit 10', u.id);
  u.suggestions = all('select id, title, author, category, reason, at from suggestions where user_id=? order by at desc', u.id);
  
  s.json(u);
});

app.post('/api/use', need, (q, s) => {
  run('insert into usage(user_id, kind, title, at) values(?, ?, ?, ?)', q.session.uid, q.body.kind, q.body.title, now());
  s.json({ ok: 1 });
});

// -------------------------------------------------------------
// BOOKMARKS
// -------------------------------------------------------------
app.post('/api/bookmark/:id', need, (q, s) => {
  const itemId = q.params.id;
  const exists = get('select 1 from bookmarks where user_id=? and item_id=?', q.session.uid, itemId);
  if (exists) {
    run('delete from bookmarks where user_id=? and item_id=?', q.session.uid, itemId);
    s.json({ ok: 1, saved: false });
  } else {
    run('insert into bookmarks(user_id, item_id, at) values(?, ?, ?)', q.session.uid, itemId, now());
    s.json({ ok: 1, saved: true });
  }
});

// -------------------------------------------------------------
// STUDENT LIBRARY BORROWING & DIGITAL LOANS (100% FREE ACCESS)
// -------------------------------------------------------------
app.post('/api/rent/:id', need, (q, s) => {
  const itemId = q.params.id;
  const book = get('select id, title, section, author from items where id=?', itemId);
  if (!book) return s.status(404).json({ error: 'Book not found.' });

  const active = get('select id, due_at from rentals where user_id=? and item_id=? and returned=0', q.session.uid, itemId);
  if (active) {
    return s.json({ ok: 1, alreadyRented: true, due_at: active.due_at, message: 'This book is already borrowed and active on your Student Reading Passport!' });
  }

  const loanDuration = 14 * 864e5; // 14-day free school library borrowing period
  const dueAt = now() + loanDuration;
  run('insert into rentals(user_id, item_id, rented_at, due_at, returned) values(?, ?, ?, ?, 0)',
    q.session.uid, itemId, now(), dueAt);

  // Log usage & reward reading passport points
  run('insert into usage(user_id, kind, title, at) values(?, ?, ?, ?)',
    q.session.uid, book.section || 'library', `Borrowed: ${book.title}`, now());

  s.json({ ok: 1, rented: true, due_at: dueAt, days_left: 14, title: book.title });
});

app.post('/api/return/:id', need, (q, s) => {
  const itemId = q.params.id;
  run('update rentals set returned=1 where user_id=? and item_id=? and returned=0', q.session.uid, itemId);
  s.json({ ok: 1, returned: true, message: 'Book returned to library shelves.' });
});

// -------------------------------------------------------------
// LIBRARY CATALOG ITEMS
// -------------------------------------------------------------
app.get('/api/items', (q, s) => {
  const { section, category, grade, search, featured, popular } = q.query;
  let sql = 'select * from items where 1=1';
  const params = [];

  if (section) { sql += ' and section=?'; params.push(section); }
  if (category && category !== 'All') {
    if (category.toLowerCase().includes('goosebumps')) {
      sql += ' and (lower(category)="novels" and (lower(title) like "%goosebumps%" or lower(author) like "%stine%"))';
    } else {
      sql += ' and lower(category)=lower(?)';
      params.push(category);
    }
  }
  if (grade && grade !== 'All') { sql += ' and grade like ?'; params.push(`%${grade}%`); }
  if (featured === '1') { sql += ' and featured=1'; }
  if (popular === '1') { sql += ' and popular=1'; }
  if (search) {
    sql += ' and (title like ? or author like ? or description like ? or category like ?)';
    const term = `%${search}%`;
    params.push(term, term, term, term);
  }

  sql += ' order by id desc';
  const items = all(sql, ...params);
  
  // Attach bookmark and rental status if logged in
  if (q.session.uid) {
    const userBm = new Set(all('select item_id from bookmarks where user_id=?', q.session.uid).map(b => b.item_id));
    const userRentals = new Set(all('select item_id from rentals where user_id=? and returned=0', q.session.uid).map(r => r.item_id));
    items.forEach(i => {
      i.isBookmarked = userBm.has(i.id);
      i.isRented = userRentals.has(i.id);
    });
  }
  
  s.json(items);
});

app.post('/api/items', lib, upload.single('file'), (q, s) => {
  const { section, category, title, author, grade, read_time, content_type, description, featured, popular, link } = q.body;
  if (!section || !category || !title) return s.status(400).json({ error: 'Section, Category and Title are required.' });
  
  const fileVal = q.file ? q.file.filename : (link || q.body.file || null);

  run(`
    insert into items(section, category, title, author, grade, read_time, content_type, description, file, featured, popular, at)
    values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
    section, category, title, author || 'Viraj Educational Press', grade || 'All Grades',
    read_time || '10 min read', content_type || 'book', description || '',
    fileVal,
    featured ? 1 : 0, popular ? 1 : 0, now()
  );
  s.json({ ok: 1 });
});

app.post('/api/items/batch', lib, (q, s) => {
  const { items } = q.body;
  if (!Array.isArray(items) || !items.length) {
    return s.status(400).json({ error: 'Items array is required.' });
  }

  const ins = db.prepare(`
    insert into items(section, category, title, author, grade, read_time, content_type, description, file, featured, popular, at)
    values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  db.exec('BEGIN');
  let count = 0;
  const curTime = now();
  try {
    for (const item of items) {
      if (!item.title) continue;
      ins.run(
        item.section || 'secondary',
        item.category || 'General',
        item.title,
        item.author || 'Viraj Educational Press',
        item.grade || 'All Grades',
        item.read_time || '15 min read',
        item.content_type || 'book',
        item.description || '',
        item.file || item.link || null,
        item.featured ? 1 : 0,
        item.popular ? 1 : 0,
        curTime
      );
      count++;
    }
    db.exec('COMMIT');
  } catch(e) {
    try { db.exec('ROLLBACK'); } catch(re){}
    return s.status(500).json({ error: 'Failed to batch insert items.' });
  }

  s.json({ ok: 1, count });
});

app.post('/api/admin/extract-pdf-links', lib, upload.single('pdf'), (q, s) => {
  if (!q.file) return s.status(400).json({ error: 'Please upload a PDF file.' });
  const scriptPath = path.join(__dirname, 'scripts', 'extract_pdf_links.py');
  const filePath = q.file.path;

  const { execFile } = require('child_process');
  execFile('python', [scriptPath, filePath, '--json'], { maxBuffer: 15 * 1024 * 1024 }, (err, stdout, stderr) => {
    try { fs.unlinkSync(filePath); } catch(e){}
    if (err) {
      console.error('PDF extraction failed:', stderr || err);
      return s.status(500).json({ error: 'Could not extract links from this PDF. Ensure the PDF contains hyperlinks.' });
    }
    const match = stdout.match(/__JSON_START__(.*?)__JSON_END__/s);
    if (!match) {
      return s.status(500).json({ error: 'No structured data received from PDF extractor.' });
    }
    try {
      const items = JSON.parse(match[1]);
      s.json({ ok: 1, items });
    } catch(e) {
      s.status(500).json({ error: 'Failed to parse extracted PDF items.' });
    }
  });
});

app.post('/api/admin/import-zip', lib, upload.single('zip'), (q, s) => {
  if (!q.file) return s.status(400).json({ error: 'Please upload a ZIP file containing PDFs.' });
  const scriptPath = path.join(__dirname, 'scripts', 'import_pdf_zip.py');
  const uploadsDir = path.join(__dirname, 'uploads');
  const zipPath = q.file.path;
  const defaultSection = q.body.default_section || '';

  const { execFile } = require('child_process');
  execFile('python', [scriptPath, zipPath, uploadsDir, defaultSection], { maxBuffer: 30 * 1024 * 1024 }, (err, stdout, stderr) => {
    try { fs.unlinkSync(zipPath); } catch(e){}
    if (err) {
      console.error('ZIP extraction error:', stderr || err);
      return s.status(500).json({ error: 'Could not process the uploaded ZIP file. Ensure it is a valid ZIP archive containing PDF files.' });
    }
    const match = stdout.match(/__JSON_START__(.*?)__JSON_END__/s);
    if (!match) {
      return s.status(500).json({ error: 'No structured data received from ZIP archive extractor.' });
    }
    try {
      const parsed = JSON.parse(match[1]);
      if (parsed.error) {
        return s.status(400).json({ error: parsed.error });
      }
      const items = parsed.items || [];
      if (!items.length) {
        return s.status(400).json({ error: 'No valid PDF files could be found inside the ZIP archive.' });
      }

      // Insert all extracted books into the database in one transaction
      const ins = db.prepare(`
        insert into items(section, category, title, author, grade, read_time, content_type, description, file, featured, popular, at)
        values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      db.exec('BEGIN');
      let count = 0;
      const curTime = now();
      try {
        for (const item of items) {
          ins.run(
            item.section || 'secondary',
            item.category || 'General',
            item.title,
            item.author || 'Viraj Educational Press',
            item.grade || 'All Grades',
            item.read_time || '15 min read',
            item.content_type || 'book',
            item.description || '',
            item.file,
            0, 0,
            curTime
          );
          count++;
        }
        db.exec('COMMIT');
      } catch(e) {
        try { db.exec('ROLLBACK'); } catch(re){}
        console.error('Failed to insert ZIP items:', e);
        return s.status(500).json({ error: 'Failed to insert books into database.' });
      }

      s.json({ ok: 1, count, items });
    } catch(e) {
      console.error('Failed to parse or insert ZIP items:', e);
      s.status(500).json({ error: 'Failed to process extracted items from ZIP archive.' });
    }
  });
});

app.delete('/api/items/:id', lib, (q, s) => {
  run('delete from items where id=?', q.params.id);
  run('delete from bookmarks where item_id=?', q.params.id);
  s.json({ ok: 1 });
});

// -------------------------------------------------------------
// DAILY NEWSPAPERS & CAMPUS NEWS
// -------------------------------------------------------------
app.get('/api/news', (q, s) => {
  const filter = q.query.range;
  let sql = 'select * from news';
  const params = [];

  if (filter === 'today') {
    sql += ' where at > ?';
    params.push(now() - 864e5);
  } else if (filter === 'week') {
    sql += ' where at > ?';
    params.push(now() - WEEK);
  } else if (filter === 'archive') {
    sql += ' where at <= ?';
    params.push(now() - WEEK);
  }

  sql += ' order by at desc';
  let rows = all(sql, ...params);

  // Graceful fallback: If no news found in narrow today/week filter, show latest recent announcements
  if (rows.length === 0 && (!filter || filter === 'week' || filter === 'today')) {
    rows = all('select * from news order by at desc limit 10');
  }

  s.json(rows);
});

app.post('/api/news', lib, (q, s) => {
  const { title, body, category, author } = q.body;
  if (!title || !body) return s.status(400).json({ error: 'Title and body are required.' });
  run('insert into news(title, body, category, author, at) values(?, ?, ?, ?, ?)',
    title, body, category || 'General', author || 'Library Desk', now());
  s.json({ ok: 1 });
});

app.delete('/api/news/:id', lib, (q, s) => {
  run('delete from news where id=?', q.params.id);
  s.json({ ok: 1 });
});

// -------------------------------------------------------------
// SUGGEST A BOOK
// -------------------------------------------------------------
app.post('/api/suggest', need, (q, s) => {
  const { title, author, category, reason } = q.body;
  if (!title || !title.trim()) return s.status(400).json({ error: 'Book title is required.' });
  run('insert into suggestions(user_id, title, author, category, reason, at) values(?, ?, ?, ?, ?, ?)',
    q.session.uid, title.trim(), (author || '').trim(), (category || 'General').trim(), (reason || '').trim(), now());
  s.json({ ok: 'Your book recommendation has been submitted to the librarian!' });
});

app.get('/api/suggest', need, (q, s) => {
  if (['librarian', 'admin'].includes(q.session.role)) {
    const list = all(`
      select title, count(*) n, group_concat(distinct author) authors, category, max(at) last_suggested
      from suggestions
      group by lower(trim(title))
      order by n desc
    `);
    const breakdown = all('select category, count(*) n from suggestions group by category order by n desc');
    return s.json({ list, breakdown });
  }
  s.json(all('select * from suggestions where user_id=? order by at desc', q.session.uid));
});

// -------------------------------------------------------------
// DEMOCRATIC BOOK ELECTIONS
// -------------------------------------------------------------
app.get('/api/candidates', (q, s) => {
  const uid = q.session.uid || 0;
  const list = all(`
    select c.id, c.title, c.author, c.description,
      (select count(*) from votes where cand_id=c.id) n,
      (select count(*) from votes where cand_id=c.id and user_id=?) mine
    from candidates c
    order by n desc, c.id desc
  `, uid);
  s.json(list);
});

app.post('/api/candidates', lib, (q, s) => {
  const { title, author, description } = q.body;
  if (!title) return s.status(400).json({ error: 'Book title is required.' });
  run('insert into candidates(title, author, description, at) values(?, ?, ?, ?)',
    title, author || 'Acclaimed Author', description || '', now());
  s.json({ ok: 1 });
});

app.delete('/api/candidates/:id', lib, (q, s) => {
  run('delete from candidates where id=?', q.params.id);
  run('delete from votes where cand_id=?', q.params.id);
  s.json({ ok: 1 });
});

app.post('/api/vote/:id', need, (q, s) => {
  run('insert or ignore into votes(user_id, cand_id, at) values(?, ?, ?)', q.session.uid, q.params.id, now());
  s.json({ ok: 'Vote recorded!' });
});

// -------------------------------------------------------------
// TEST YOUR WITS (QUIZZES)
// -------------------------------------------------------------
app.get('/api/quiz/:section', (q, s) => {
  const questions = all('select * from questions where section=?', q.params.section).map(r => ({
    ...r,
    opts: JSON.parse(r.opts || '[]')
  }));
  s.json(questions);
});

app.post('/api/quiz-complete', need, (q, s) => {
  const { category, score, total } = q.body;
  const pts = (score || 0) * 10;
  run('insert into quiz_history(user_id, category, score, total, points, at) values(?, ?, ?, ?, ?, ?)',
    q.session.uid, category, score, total, pts, now());
  run('insert into usage(user_id, kind, title, at) values(?, ?, ?, ?)',
    q.session.uid, 'quiz', `${category} quiz (${score}/${total})`, now());
  s.json({ ok: 1, points: pts });
});

app.post('/api/questions', lib, (q, s) => {
  const { section, q: questionText, opts, ans, explanation } = q.body;
  if (!section || !questionText || !opts || opts.length < 2) {
    return s.status(400).json({ error: 'Provide question text, category, and at least 2 options.' });
  }
  run('insert into questions(section, q, opts, ans, explanation) values(?, ?, ?, ?, ?)',
    section, questionText, JSON.stringify(opts), ans || 0, explanation || '');
  s.json({ ok: 1 });
});

app.delete('/api/questions/:id', lib, (q, s) => {
  run('delete from questions where id=?', q.params.id);
  s.json({ ok: 1 });
});

// -------------------------------------------------------------
// AVID READERS OF THE MONTH
// -------------------------------------------------------------
app.get('/api/readers', (q, s) => {
  s.json(all('select * from readers order by at desc'));
});

app.post('/api/readers', lib, (q, s) => {
  const { kind, name, class_grade, consumed, reflection, favourite_book } = q.body;
  if (!name || !consumed) return s.status(400).json({ error: 'Name and consumed books are required.' });
  run('insert into readers(kind, name, class_grade, consumed, reflection, favourite_book, at) values(?, ?, ?, ?, ?, ?, ?)',
    kind || 'school', name, class_grade || 'Student', consumed, reflection || '', favourite_book || '', now());
  s.json({ ok: 1 });
});

app.delete('/api/readers/:id', lib, (q, s) => {
  run('delete from readers where id=?', q.params.id);
  s.json({ ok: 1 });
});

// -------------------------------------------------------------
// LIBRARIAN / ADMIN DASHBOARD & USER MANAGEMENT
// -------------------------------------------------------------
app.get('/api/admin/stats', lib, (q, s) => {
  try {
    const stats = {
      users: get('select count(*) c from users')?.c || 0,
      pendingUsers: get("select count(*) c from users where status='pending'")?.c || 0,
      books: get('select count(*) c from items')?.c || 0,
      juniorBooks: get("select count(*) c from items where section='junior'")?.c || 0,
      secondaryBooks: get("select count(*) c from items where section='secondary'")?.c || 0,
      biographies: get("select count(*) c from items where section='biography'")?.c || 0,
      quizAttempts: get('select count(*) c from quiz_history')?.c || 0,
      suggestions: get('select count(*) c from suggestions')?.c || 0,
      votes: get('select count(*) c from votes')?.c || 0,
      news: get('select count(*) c from news')?.c || 0
    };
    s.json(stats);
  } catch (err) {
    console.error('Error generating stats:', err);
    s.status(500).json({ error: 'Failed to calculate stats: ' + err.message });
  }
});

app.get('/api/pending', lib, (q, s) => {
  s.json(all("select id, username, name, email, grade, at from users where status='pending' order by at desc"));
});

app.post('/api/approve/:id', lib, (q, s) => {
  if (q.body.ok) {
    run("update users set status='active' where id=?", q.params.id);
  } else {
    run('delete from users where id=? and status=?', q.params.id, 'pending');
  }
  s.json({ ok: 1 });
});

app.get('/api/admin/users', lib, (q, s) => {
  s.json(all('select id, username, name, email, grade, role, status, at from users order by id desc'));
});

// Static assets
app.use('/uploads', express.static(uploadDir));
if (isVercel && fs.existsSync(path.join(__dirname, 'uploads'))) {
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to index.html for client-side routing
app.get('*', (q, s) => {
  s.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global JSON error handler
app.use((err, q, s, n) => {
  console.error('Unhandled server error:', err);
  s.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => console.log(`Viraj Digital Library server running on port ${PORT}`));
}

module.exports = app;

