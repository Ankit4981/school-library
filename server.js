const express = require('express'), session = require('express-session'), bcrypt = require('bcryptjs'),
  { DatabaseSync: Database } = require('node:sqlite'), multer = require('multer'), fs = require('fs');

fs.mkdirSync('uploads', { recursive: true });
const db = new Database('library.db');

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

// Ensure Default Librarian Account
if (!db.prepare('select 1 from users where username=?').get('librarian')) {
  db.prepare("insert into users(username,name,email,grade,pw,role,status,at) values('librarian','Head Librarian','librarian@virajis.edu.in','Faculty',?,'librarian','active',?)")
    .run(bcrypt.hashSync(process.env.LIBRARIAN_PASSWORD || 'ChangeMe123', 10), Date.now());
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
const app = express(), upload = multer({ dest: 'uploads/' }), WEEK = 7 * 864e5;
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
// AUTHENTICATION ROUTES
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
  run('insert into users(username, name, email, grade, pw, role, status, at) values(?, ?, ?, ?, ?, ?, ?, ?)',
    cleanUser, name.trim(), (email || '').trim().toLowerCase(), grade || 'Student', bcrypt.hashSync(password, 10), 'member', 'pending', now());
  
  s.json({ ok: 'Your account registration has been submitted! The librarian will verify and approve your account shortly.' });
});

app.post('/api/login', (q, s) => {
  const cred = (q.body.username || '').toLowerCase().trim();
  const pass = q.body.password || '';
  const u = get('select * from users where username=? or email=?', cred, cred);
  
  if (!u || !bcrypt.compareSync(pass, u.pw)) {
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
// LIBRARY CATALOG ITEMS
// -------------------------------------------------------------
app.get('/api/items', (q, s) => {
  const { section, category, grade, search, featured, popular } = q.query;
  let sql = 'select * from items where 1=1';
  const params = [];

  if (section) { sql += ' and section=?'; params.push(section); }
  if (category && category !== 'All') { sql += ' and lower(category)=lower(?)'; params.push(category); }
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
  
  // Attach bookmark status if logged in
  if (q.session.uid) {
    const userBm = new Set(all('select item_id from bookmarks where user_id=?', q.session.uid).map(b => b.item_id));
    items.forEach(i => { i.isBookmarked = userBm.has(i.id); });
  }
  
  s.json(items);
});

app.post('/api/items', lib, upload.single('file'), (q, s) => {
  const { section, category, title, author, grade, read_time, content_type, description, featured, popular } = q.body;
  if (!section || !category || !title) return s.status(400).json({ error: 'Section, Category and Title are required.' });
  
  run(`
    insert into items(section, category, title, author, grade, read_time, content_type, description, file, featured, popular, at)
    values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
    section, category, title, author || 'Viraj Educational Press', grade || 'All Grades',
    read_time || '10 min read', content_type || 'book', description || '',
    q.file ? q.file.filename : null,
    featured ? 1 : 0, popular ? 1 : 0, now()
  );
  s.json({ ok: 1 });
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
  const filter = q.query.range || 'week';
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
  s.json(all(sql, ...params));
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
  const stats = {
    users: get('select count(*) c from users').c,
    pendingUsers: get('select count(*) c from users where status="pending"').c,
    books: get('select count(*) c from items').c,
    juniorBooks: get('select count(*) c from items where section="junior"').c,
    secondaryBooks: get('select count(*) c from items where section="secondary"').c,
    biographies: get('select count(*) c from items where section="biography"').c,
    quizAttempts: get('select count(*) c from quiz_history').c,
    suggestions: get('select count(*) c from suggestions').c,
    votes: get('select count(*) c from votes').c,
    news: get('select count(*) c from news').c
  };
  s.json(stats);
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
app.use('/uploads', need, express.static('uploads'));
app.use(express.static('public'));

// Fallback to index.html for client-side routing
app.get('*', (q, s) => {
  s.sendFile('public/index.html', { root: __dirname });
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => console.log(`Viraj Digital Library server running on port ${PORT}`));
}

module.exports = app;

