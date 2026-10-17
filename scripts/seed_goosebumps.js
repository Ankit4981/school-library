const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'library.db');
const db = new DatabaseSync(dbPath);

console.log('Seeding Goosebumps books into library.db...');

const books = [
  {
    section: 'secondary',
    category: 'Novels',
    title: 'Goosebumps #19: Deep Trouble',
    author: 'R.L. Stine',
    grade: 'Grades 4 - 8',
    read_time: '45 min read',
    content_type: 'book',
    description: 'Billy Deep and his sister Sheena visit their marine biologist uncle Dr. D on the Caribbean research boat Cassandra. A real mermaid and a twelve-tentacled sea monster lead them into a dangerous rescue mission against greedy smugglers.',
    file: 'deep-trouble.html',
    featured: 1,
    popular: 1
  },
  {
    section: 'secondary',
    category: 'Novels',
    title: 'Goosebumps #22: Ghost Beach',
    author: 'R.L. Stine',
    grade: 'Grades 4 - 8',
    read_time: '45 min read',
    content_type: 'book',
    description: 'Jerry and Terri Sadler spend summer in New England with cousins Brad and Agatha. Exploring a cliffside cave and an ancient graveyard, they uncover headstones bearing the names of their new playmates—and a terrifying 350-year-old secret.',
    file: 'ghost-beach.html',
    featured: 1,
    popular: 1
  },
  {
    section: 'secondary',
    category: 'Novels',
    title: 'Goosebumps #21: Go Eat Worms!',
    author: 'R.L. Stine',
    grade: 'Grades 4 - 8',
    read_time: '45 min read',
    content_type: 'book',
    description: 'Todd Barstow is an avid worm collector preparing his school science expo project. After slicing a live worm in half, worms mysteriously invade his cap, food, and bed—until a monstrous mother worm rises from the earth seeking revenge!',
    file: 'go-eat-worms.html',
    featured: 1,
    popular: 1
  },
  {
    section: 'secondary',
    category: 'Novels',
    title: 'Goosebumps #18: Monster Blood II',
    author: 'R.L. Stine',
    grade: 'Grades 4 - 8',
    read_time: '45 min read',
    content_type: 'book',
    description: 'Evan Ross thought the green Monster Blood was gone forever. But when bully Conan Barber torments him and he gets stuck on hamster duty, Andy feeds a spoonful of green slime to Cuddles the hamster—who expands into a 10-foot classroom terror!',
    file: 'monster-blood-2.html',
    featured: 1,
    popular: 1
  },
  {
    section: 'secondary',
    category: 'Novels',
    title: 'Goosebumps #16: One Day at HorrorLand',
    author: 'R.L. Stine',
    grade: 'Grades 4 - 8',
    read_time: '45 min read',
    content_type: 'book',
    description: 'The Morris family takes an unexpected turn to HorrorLand, a scary theme park with the Doom Slide and Coffin Cruise. But the scares are dangerously real—the park is run by actual monsters filming for The Monster Channel!',
    file: 'one-day-at-horrorland.html',
    featured: 1,
    popular: 1
  }
];

const checkStmt = db.prepare('select id from items where title=?');
const insStmt = db.prepare(`
  insert into items(section, category, title, author, grade, read_time, content_type, description, file, featured, popular, at)
  values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const updateStmt = db.prepare(`
  update items set section=?, category=?, author=?, grade=?, read_time=?, content_type=?, description=?, file=?, featured=?, popular=?
  where id=?
`);

const now = Date.now();

books.forEach((b, idx) => {
  const existing = checkStmt.get(b.title);
  if (existing) {
    updateStmt.run(b.section, b.category, b.author, b.grade, b.read_time, b.content_type, b.description, b.file, b.featured, b.popular, existing.id);
    console.log(`Updated existing item: ${b.title} (ID: ${existing.id})`);
  } else {
    insStmt.run(b.section, b.category, b.title, b.author, b.grade, b.read_time, b.content_type, b.description, b.file, b.featured, b.popular, now - idx * 3600000);
    console.log(`Inserted item: ${b.title}`);
  }
});

// Seed news item
const newsCheck = db.prepare('select id from news where title like ?').get('%Goosebumps%');
if (!newsCheck) {
  db.prepare('insert into news(title, body, category, author, at) values(?, ?, ?, ?, ?)').run(
    '🎃 Iconic Goosebumps Classics Added to Digital Library!',
    'Five complete, unabridged Goosebumps horror-thriller books by R.L. Stine are now available in the Secondary Wing! Dive into One Day at HorrorLand, Monster Blood II, Deep Trouble, Go Eat Worms!, and Ghost Beach with full-chapter text, audio narration, and original cover art.',
    'Acquisitions',
    'Head Librarian',
    now
  );
  console.log('Added Goosebumps news announcement.');
}

// Seed candidate for next book election
const candCheck = db.prepare('select id from candidates where title like ?').get('%Night of the Living Dummy%');
if (!candCheck) {
  db.prepare('insert into candidates(title, author, description, at) values(?, ?, ?, ?)').run(
    'Goosebumps: Night of the Living Dummy',
    'R.L. Stine',
    'Vote to acquire the legendary tale of Slappy the evil ventriloquist dummy and the eerie twin sisters Lindy and Kris!',
    now
  );
  console.log('Added Night of the Living Dummy to voting candidates.');
}

// Seed Goosebumps Quiz Questions
const gbQuestions = [
  {
    section: 'secondary',
    q: 'In "One Day at HorrorLand", what unexpected weakness causes the Horrors to immediately deflate like balloons?',
    opts: JSON.stringify(['Pinching them', 'Splashing holy water', 'Shining bright sunlight', 'Saying "Abrahadabra"']),
    ans: 0,
    explanation: 'Lizzy realizes the park signs saying "NO PINCHING" were dead serious—pinching the Horrors releases their air and deflates them!'
  },
  {
    section: 'secondary',
    q: 'In "Monster Blood II", which classroom pet eats the glowing green Monster Blood and swells to ten feet tall?',
    opts: JSON.stringify(['Cuddles the hamster', 'Biff the black ribbon eel', 'Trigger the cocker spaniel', 'Barnaby the white rabbit']),
    ans: 0,
    explanation: 'Andy gives a spoonful of Monster Blood to Mr. Murphy\'s classroom hamster Cuddles, who turns into a giant, furniture-chewing monster!'
  },
  {
    section: 'secondary',
    q: 'In "Go Eat Worms!", what scares away the giant underground mother worm from dragging Todd into the mud?',
    opts: JSON.stringify(['The shadow of a giant papier-mâché robin', 'A loud fire engine siren', 'A bucket of spicy chicken salad', 'A blast of garden water']),
    ans: 0,
    explanation: 'Regina and Beth walk past carrying their giant papier-mâché bird "Christopher Robin". The worm thinks it is a real predator bird and dives back underground!'
  },
  {
    section: 'secondary',
    q: 'In "Ghost Beach", who is revealed to be the actual 350-year-old ghosts from the winter of 1642?',
    opts: JSON.stringify(['The Sadler children (Sam, Louisa, Nat) and cousins Brad & Agatha', 'Harrison Sadler the cave hermit', 'The local fisherman', 'Jerry and Terri Sadler']),
    ans: 0,
    explanation: 'Harrison Sadler was the human researcher trying to trap the spirits, while the local kids and elderly cousins Brad and Agatha were the ghosts all along!'
  },
  {
    section: 'secondary',
    q: 'In "Deep Trouble", who heroically saves Billy Deep when he is attacked and bitten by a hammerhead shark?',
    opts: JSON.stringify(['A real mermaid with a shiny green tail', 'His sister Sheena in her scuba gear', 'Alexander DuBrow with a dart gun', 'A pod of wild dolphins']),
    ans: 0,
    explanation: 'The blond-haired, green-tailed mermaid battles the hammerhead shark, strikes it on the head, and later soothes Billy\'s coral burns with her touch!'
  }
];

const checkQ = db.prepare('select id from questions where q=?');
const insQ = db.prepare('insert into questions(section, q, opts, ans, explanation) values(?, ?, ?, ?, ?)');

gbQuestions.forEach(q => {
  if (!checkQ.get(q.q)) {
    insQ.run(q.section, q.q, q.opts, q.ans, q.explanation);
    console.log(`Added quiz question: ${q.q.slice(0, 40)}...`);
  }
});

console.log('Seeding completed successfully!');
