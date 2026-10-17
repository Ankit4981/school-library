const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const db = new DatabaseSync(path.join(__dirname, '..', 'library.db'));

const files = {
  'Goosebumps #19: Deep Trouble': {
    file: 'deep-trouble.html',
    desc: 'Billy Deep and his sister Sheena visit their marine biologist uncle Dr. D on the Caribbean research boat Cassandra. A real mermaid and a twelve-tentacled sea monster lead them into a dangerous rescue mission against greedy smugglers.'
  },
  'Goosebumps #22: Ghost Beach': {
    file: 'ghost-beach.html',
    desc: 'Jerry and Terri Sadler spend summer in New England with cousins Brad and Agatha. Exploring a cliffside cave and an ancient graveyard, they uncover headstones bearing the names of their new playmates—and a terrifying 350-year-old secret.'
  },
  'Goosebumps #21: Go Eat Worms!': {
    file: 'go-eat-worms.html',
    desc: 'Todd Barstow is an avid worm collector preparing his school science expo project. After slicing a live worm in half, worms mysteriously invade his cap, food, and bed—until a monstrous mother worm rises from the earth seeking revenge!'
  },
  'Goosebumps #18: Monster Blood II': {
    file: 'monster-blood-2.html',
    desc: 'Evan Ross thought the green Monster Blood was gone forever. But when bully Conan Barber torments him and he gets stuck on hamster duty, Andy feeds a spoonful of green slime to Cuddles the hamster—who expands into a 10-foot classroom terror!'
  },
  'Goosebumps #16: One Day at HorrorLand': {
    file: 'one-day-at-horrorland.html',
    desc: 'The Morris family takes an unexpected turn to HorrorLand, a scary theme park with the Doom Slide and Coffin Cruise. But the scares are dangerously real—the park is run by actual monsters filming for The Monster Channel!'
  }
};

for (const [title, data] of Object.entries(files)) {
  db.prepare('update items set file=?, description=?, content_type=? where title=?').run(data.file, data.desc, 'book', title);
}

console.log('Fixed items in DB:');
console.log(db.prepare('select id, title, file from items where title like ?').all('%Goosebumps%'));
