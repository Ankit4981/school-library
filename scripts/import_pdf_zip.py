#!/usr/bin/env python3
"""
Automated PDF ZIP Archive Extractor & Classifier
Extracts all PDFs from a zip file, analyzes filenames, folder structure,
and PDF metadata (via pypdf), auto-sorts them into library wings & categories,
and saves the PDFs into the uploads directory for instant 100% in-site reading.
"""

import sys
import os
import re
import json
import zipfile
import shutil
import time

try:
    from pypdf import PdfReader
    HAS_PYPDF = True
except ImportError:
    HAS_PYPDF = False


def clean_text(text):
    if not text:
        return ""
    return re.sub(r'\s+', ' ', text).strip()


def title_from_filename(filename):
    base = os.path.splitext(filename)[0]
    # Remove leading numbers like "01 - ", "01_", "1. "
    base = re.sub(r'^\d+[\s._-]+', '', base)
    # Replace underscores, dots, hyphens with spaces
    base = base.replace('_', ' ').replace('-', ' ').replace('.', ' ')
    base = re.sub(r'\s+', ' ', base).strip()
    # Title-case words nicely
    words = base.split()
    capitalized = []
    lowercase_words = {'a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'of', 'in', 'with'}
    for i, w in enumerate(words):
        lw = w.lower()
        if i == 0 or lw not in lowercase_words:
            capitalized.append(w.capitalize())
        else:
            capitalized.append(lw)
    return " ".join(capitalized) or "Digital Library Book"


def classify_book(filepath, title, author, text_sample=""):
    full_str = f"{filepath} {title} {author} {text_sample}".lower()

    # Determine Section (Wing)
    section = "secondary" # default
    grade = "All Grades"

    junior_keywords = ['junior', 'nursery', 'rhymes', 'fairy', 'tales', 'fables', 'kids', 'panchatantra', 
                       'jataka', 'bedtime', 'kindergarten', 'pre-k', 'grade 1', 'grade 2', 'grade 3', 
                       'grade 4', 'grade 5', 'primary', 'children', 'toddler', 'disney', 'dr seuss']
    
    biography_keywords = ['biography', 'biographies', 'autobiography', 'life of', 'story of my', 
                          'gandhi', 'einstein', 'kalam', 'ramanujan', 'curie', 'vivekananda', 
                          'mandela', 'lincoln', 'nehru', 'bose', 'bhagat singh', 'tagore', 
                          'mother teresa', 'ambedkar', 'sarojini naidu', 'personality', 'inventor']

    if any(k in full_str for k in biography_keywords):
        section = "biography"
        grade = "Grades 5 - 12"
    elif any(k in full_str for k in junior_keywords):
        section = "junior"
        grade = "Pre-K - Grade 5"
    else:
        section = "secondary"
        grade = "Grades 6 - 12"

    # Determine Category
    category = "General"
    if section == "biography":
        if any(k in full_str for k in ['einstein', 'newton', 'curie', 'edison', 'tesla', 'hawking', 'scientist', 'inventor']):
            category = "Scientists"
        elif any(k in full_str for k in ['gandhi', 'nehru', 'mandela', 'lincoln', 'bose', 'leader', 'freedom']):
            category = "Leaders"
        elif any(k in full_str for k in ['kalam', 'ramanujan', 'tagore', 'vivekananda', 'india', 'indian']):
            category = "Indian Personalities"
        else:
            category = "Global Personalities"
    elif section == "junior":
        if any(k in full_str for k in ['rhyme', 'poem', 'twinkle', 'bedtime', 'nursery']):
            category = "Nursery Rhymes"
        elif any(k in full_str for k in ['fairy', 'cinderella', 'snow white', 'magic', 'disney']):
            category = "Fairy Tales"
        elif any(k in full_str for k in ['panchatantra', 'jataka', 'moral', 'aesop', 'hitopadesha']):
            category = "Short Stories"
        else:
            category = "Picture Books"
    else: # Secondary
        if any(k in full_str for k in ['amar chitra', 'chitra katha', 'comic', 'tintin', 'asterix', 'manga', 'graphic novel', 'superhero']):
            category = "Comics"
        elif any(k in full_str for k in ['goosebumps', 'horror', 'stine', 'ghost', 'monster', 'fear']):
            category = "Novels"
        elif any(k in full_str for k in ['sherlock', 'holmes', 'conan doyle', 'mystery', 'detective', 'poirot']):
            category = "Novels"
        elif any(k in full_str for k in ['physics', 'chemistry', 'biology', 'science', 'math', 'ncert', 'cbse', 'class 9', 'class 10', 'class 11', 'class 12']):
            category = "Academics"
        elif any(k in full_str for k in ['encyclopedia', 'dk visual', 'visual guide', 'atlas', 'world history']):
            category = "Encyclopedias"
        elif any(k in full_str for k in ['novel', 'classic', 'literature', 'fiction', 'orwell', 'shakespeare']):
            category = "Novels"
        else:
            category = "World Literature"

    return section, category, grade


def process_zip(zip_path, uploads_dir, default_section=None):
    if not os.path.exists(zip_path):
        return {"error": f"ZIP file not found at {zip_path}"}
    if not os.path.exists(uploads_dir):
        os.makedirs(uploads_dir, exist_ok=True)

    extracted_items = []

    with zipfile.ZipFile(zip_path, 'r') as z:
        namelist = z.namelist()
        pdf_names = [n for n in namelist if n.lower().endswith('.pdf') and not n.startswith('__MACOSX') and not os.path.basename(n).startswith('._')]

        if not pdf_names:
            return {"error": "No PDF files found inside the uploaded ZIP archive."}

        timestamp = int(time.time())
        for idx, item_name in enumerate(pdf_names):
            base_filename = os.path.basename(item_name)
            if not base_filename or base_filename.startswith('.'):
                continue

            # Safe destination filename
            clean_name = re.sub(r'[^a-zA-Z0-9._-]', '_', base_filename)
            dest_filename = f"book_{timestamp}_{idx+1}_{clean_name}"
            dest_path = os.path.join(uploads_dir, dest_filename)

            # Extract file
            with z.open(item_name) as source, open(dest_path, 'wb') as target:
                shutil.copyfileobj(source, target)

            # Metadata extraction
            title = title_from_filename(base_filename)
            author = "Viraj Educational Press"
            num_pages = 20
            text_sample = ""

            if HAS_PYPDF:
                try:
                    reader = PdfReader(dest_path)
                    num_pages = len(reader.pages)
                    meta = reader.metadata
                    if meta:
                        if meta.title and len(meta.title.strip()) > 3:
                            # Verify title isn't a generic software name like "Microsoft Word"
                            cand_title = meta.title.strip()
                            if not any(bad in cand_title.lower() for bad in ['microsoft', 'untitled', 'adobe', 'coreldraw', 'scanner']):
                                title = cand_title
                        if meta.author and len(meta.author.strip()) > 2:
                            cand_author = meta.author.strip()
                            if not any(bad in cand_author.lower() for bad in ['administrator', 'user', 'hp', 'canon', 'epson']):
                                author = cand_author

                    # Extract text sample from first 2 pages
                    sample_chunks = []
                    for p in reader.pages[:2]:
                        try:
                            txt = p.extract_text()
                            if txt:
                                sample_chunks.append(txt)
                        except Exception:
                            pass
                    text_sample = clean_text(" ".join(sample_chunks))[:500]
                except Exception as e:
                    # Ignore pypdf read errors, fallback gracefully
                    pass

            # Smart Classification
            detected_sec, detected_cat, detected_grade = classify_book(item_name, title, author, text_sample)
            sec = default_section or detected_sec

            # Read time calculation based on page count
            est_mins = max(5, round(num_pages * 1.5))
            read_time = f"{est_mins} min read"

            # Clean description
            description = ""
            if text_sample:
                description = text_sample[:220] + "..." if len(text_sample) > 220 else text_sample
            else:
                description = f"Complete {detected_cat} volume in the Viraj Digital Library collection. {num_pages} illustrated pages available for in-site reading."

            extracted_items.append({
                "title": title,
                "author": author,
                "section": sec,
                "category": detected_cat,
                "grade": detected_grade,
                "read_time": read_time,
                "content_type": "book",
                "description": description,
                "file": dest_filename,
                "pages": num_pages
            })

    return {"ok": 1, "items": extracted_items}


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python import_pdf_zip.py <zip_path> <uploads_dir> [default_section]")
        sys.exit(1)

    zip_file = sys.argv[1]
    uploads_directory = sys.argv[2]
    def_section = sys.argv[3] if len(sys.argv) > 3 and sys.argv[3] in ['junior', 'secondary', 'biography'] else None

    result = process_zip(zip_file, uploads_directory, def_section)
    print("__JSON_START__" + json.dumps(result) + "__JSON_END__")
