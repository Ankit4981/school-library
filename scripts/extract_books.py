import os
import re
import json
from pypdf import PdfReader

dir_path = r'C:\Users\Ankit pradhan\.gemini\antigravity-ide\brain\570fbb3c-8e12-4393-8e16-a9a76dff91ef\.user_uploaded'
output_dir = os.path.join(os.path.dirname(__file__), '..', 'public', 'books', 'data')
os.makedirs(output_dir, exist_ok=True)

books_meta = [
    {
        'file': 'media_1792214881602.pdf',
        'id': 'deep-trouble',
        'title': 'Deep Trouble',
        'full_title': 'Goosebumps #19: Deep Trouble',
        'author': 'R.L. Stine',
        'number': 19,
        'year': 1994,
        'tagline': "Swimming lessons won't help you now.",
        'genre': 'Horror / Marine Mystery / Adventure',
        'grade': 'Grades 4 - 8',
        'read_time': '45 min read',
        'cover': '/covers/deep-trouble.jpg',
        'pdf': '/books/pdf/deep-trouble.pdf',
        'characters': ['Billy Deep', 'Sheena Deep', 'Dr. George Deep (Dr. D)', 'Alexander DuBrow', 'The Mermaid'],
        'summary': 'Billy Deep and his sister Sheena are visiting their marine biologist uncle, Dr. D, on his Caribbean research boat Cassandra. While exploring the coral reefs, they encounter real hammerhead sharks, a mysterious glowing mermaid, and a twelve-tentacled sea monster. But when greedy smugglers kidnap the mermaid, Billy and his family must pull off a daring ocean rescue.'
    },
    {
        'file': 'media_1792214881616.pdf',
        'id': 'ghost-beach',
        'title': 'Ghost Beach',
        'full_title': 'Goosebumps #22: Ghost Beach',
        'author': 'R.L. Stine',
        'number': 22,
        'year': 1994,
        'tagline': 'No swimming. No surfing. No haunting.',
        'genre': 'Horror / Supernatural / Mystery',
        'grade': 'Grades 4 - 8',
        'read_time': '45 min read',
        'cover': '/covers/ghost-beach.jpg',
        'pdf': '/books/pdf/ghost-beach.pdf',
        'characters': ['Jerry Sadler', 'Terri Sadler', 'Brad and Agatha Sadler', 'Sam, Louisa & Nat', 'Harrison Sadler'],
        'summary': 'Jerry and Terri Sadler spend the summer in New England with their elderly cousins Brad and Agatha. Exploring a cliffside beach, they discover an ancient cemetery with gravestones from 1642 bearing the names of their new playmates. When a mysterious hermit in a candlelit cave claims the children are ghosts from the Great Winter, a horrifying plot twist awaits them.'
    },
    {
        'file': 'media_1792214881655.pdf',
        'id': 'go-eat-worms',
        'title': 'Go Eat Worms!',
        'full_title': 'Goosebumps #21: Go Eat Worms!',
        'author': 'R.L. Stine',
        'number': 21,
        'year': 1994,
        'tagline': 'Homework was never this gross before!',
        'genre': 'Horror / Creature Feature / Comedy',
        'grade': 'Grades 4 - 8',
        'read_time': '45 min read',
        'cover': '/covers/go-eat-worms.jpg',
        'pdf': '/books/pdf/go-eat-worms.pdf',
        'characters': ['Todd Barstow', 'Regina Barstow', 'Danny Fletcher', 'Beth Baker', 'Patrick MacKay'],
        'summary': 'Todd Barstow is an obsessive worm collector competing in his school science fair. After slicing a live worm in two and pulling mean pranks on his sister, wriggling worms start appearing inside his clothes, math notebook, and sandwich. But Todd’s true nightmare begins when a giant underground mother worm the size of a tree trunk rises to seek revenge.'
    },
    {
        'file': 'media_1792214881708.pdf',
        'id': 'monster-blood-2',
        'title': 'Monster Blood II',
        'full_title': 'Goosebumps #18: Monster Blood II',
        'author': 'R.L. Stine',
        'number': 18,
        'year': 1994,
        'tagline': "He's one hungry hamster!",
        'genre': 'Horror / Sci-Fi / Monster Mayhem',
        'grade': 'Grades 4 - 8',
        'read_time': '45 min read',
        'cover': '/covers/monster-blood-2.jpg',
        'pdf': '/books/pdf/monster-blood-2.pdf',
        'characters': ['Evan Ross', 'Andrea (Andy)', 'Trigger (the dog)', 'Mr. Murphy', 'Cuddles the Hamster', 'Conan Barber'],
        'summary': 'Evan Ross moved to a new school in Atlanta hoping to put his Monster Blood nightmare behind him. But school bully Conan Barber makes his life miserable, and teacher Mr. Murphy assigns him to clean the hamster cage. When Andy sneaks a spoonful of the green glowing goo to Cuddles the hamster, the tiny pet grows into a roaring, 10-foot classroom monster!'
    },
    {
        'file': 'media_1792214881725.pdf',
        'id': 'one-day-at-horrorland',
        'title': 'One Day at HorrorLand',
        'full_title': 'Goosebumps #16: One Day at HorrorLand',
        'author': 'R.L. Stine',
        'number': 16,
        'year': 1994,
        'tagline': 'Where nightmares come to life!',
        'genre': 'Horror / Dark Fantasy / Thriller',
        'grade': 'Grades 4 - 8',
        'read_time': '45 min read',
        'cover': '/covers/one-day-at-horrorland.jpg',
        'pdf': '/books/pdf/one-day-at-horrorland.pdf',
        'characters': ['Lizzy Morris', 'Luke Morris (The Mad Pincher)', 'Clay', 'Mr. and Mrs. Morris', 'The HorrorLand Horrors'],
        'summary': 'Lost in the desert on a family vacation, the Morris family discovers HorrorLand—a bizarre amusement park where the rides are shockingly lethal. After surviving the Doom Slide and Coffin Cruise, they learn they are the stars of a deadly broadcast on The Monster Channel. Can Lizzy and Luke uncover the monsters’ secret weakness before they are thrown into the boiling purple pond?'
    }
]

def clean_ocr_text(t):
    if not t:
        return ''
    t = t.replace('\t', ' ')
    t = t.replace('\r\n', '\n').replace('\r', '\n')
    # clean scanning artifacts
    t = re.sub(r'\(An Undead Scan.*?\)', '', t, flags=re.IGNORECASE)
    t = re.sub(r'Scanning, formatting and proofing by Undead\.', '', t, flags=re.IGNORECASE)
    t = re.sub(r'Table of Contents\s*Start', '', t, flags=re.IGNORECASE)
    # clean excess spaces
    t = re.sub(r'[ \t]+', ' ', t)
    return t.strip()

all_catalog = []

for b in books_meta:
    pdf_path = os.path.join(dir_path, b['file'])
    reader = PdfReader(pdf_path)
    
    pages_data = []
    for i, p in enumerate(reader.pages):
        raw = p.extract_text() or ''
        cleaned = clean_ocr_text(raw)
        if cleaned:
            pages_data.append((i + 1, cleaned))
            
    # Parse into chapters
    chapters = []
    current_ch_num = 0
    current_paragraphs = []
    
    for page_num, text in pages_data:
        # Check if this page starts a chapter or contains chapter heading
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        if not lines:
            continue
            
        # Ignore cover / title page
        if any(b['title'].lower() in l.lower() for l in lines) and len(lines) <= 5:
            continue
            
        # Detect chapter number pattern
        ch_idx = -1
        detected_num = None
        for idx, line in enumerate(lines):
            # check if line is purely integer matching expected next chapter
            if line.isdigit():
                val = int(line)
                if val == current_ch_num + 1 and val <= 35:
                    ch_idx = idx
                    detected_num = val
                    break
                    
        if detected_num is not None:
            # flush previous chapter
            before = lines[:ch_idx]
            if before and current_ch_num > 0:
                current_paragraphs.append(' '.join(before))
            if current_paragraphs and current_ch_num > 0:
                chapters.append({
                    'chapter': current_ch_num,
                    'title': f'Chapter {current_ch_num}',
                    'text': '\n\n'.join(current_paragraphs)
                })
            current_ch_num = detected_num
            current_paragraphs = []
            after = lines[ch_idx + 1:]
            if after:
                current_paragraphs.append(' '.join(after))
        else:
            if current_ch_num > 0:
                current_paragraphs.append(' '.join(lines))
                
    if current_paragraphs and current_ch_num > 0:
        chapters.append({
            'chapter': current_ch_num,
            'title': f'Chapter {current_ch_num}',
            'text': '\n\n'.join(current_paragraphs)
        })
        
    b_data = dict(b)
    b_data['chapters'] = chapters
    b_data['total_chapters'] = len(chapters)
    
    # Save individual book JSON
    out_file = os.path.join(output_dir, f"{b['id']}.json")
    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(b_data, f, indent=2, ensure_ascii=False)
        
    print(f"Saved {b['full_title']}: {len(chapters)} chapters -> {out_file}")
    all_catalog.append(b_data)

# Save master goosebumps collection JSON
master_out = os.path.join(output_dir, 'goosebumps_collection.json')
with open(master_out, 'w', encoding='utf-8') as f:
    json.dump(all_catalog, f, indent=2, ensure_ascii=False)

print(f"\nAll 5 books successfully compiled into {master_out}!")
