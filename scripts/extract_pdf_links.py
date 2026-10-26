"""
Extract Hyperlinks and Book Metadata from PDF files
Usage:
    python scripts/extract_pdf_links.py "path/to/catalog.pdf" [--section secondary] [--category Novels] [--insert]

Features:
- Extracts clickable annotations (/URI) and text-embedded URLs.
- Extracts matching text / labels for each link.
- Normalizes Google Drive links (preview / view format).
- Saves formatted batch list to extracted_books.txt.
- Optionally inserts directly into library.db.
"""

import sys
import os
import re
import argparse
from pypdf import PdfReader

def clean_drive_url(url):
    url = url.strip()
    
    # Check folder links
    m_folder = re.search(r'drive\.google\.com/(?:u/\d+/)?(?:drive/)?folders/([a-zA-Z0-9_-]+)', url)
    if m_folder:
        folder_id = m_folder.group(1)
        return f"https://drive.google.com/drive/folders/{folder_id}"

    # Check file / open / uc links with id query param
    m_id = re.search(r'[?&]id=([a-zA-Z0-9_-]+)', url)
    if m_id and ('drive.google.com' in url or 'docs.google.com' in url):
        return f"https://drive.google.com/file/d/{m_id.group(1)}/view"

    # Check standard file links
    m = re.search(r'drive\.google\.com/(?:u/\d+/)?file/d/([a-zA-Z0-9_-]+)', url)
    if m:
        file_id = m.group(1)
        return f"https://drive.google.com/file/d/{file_id}/view"
        
    return url

def clean_title(title, url):
    if not title or len(title.strip()) < 2 or title.strip().startswith('http') or title.strip().lower() == 'click here':
        # derive from url if possible
        filename = url.split('/')[-1].split('?')[0]
        if filename and not filename.startswith('view') and not re.match(r'^[a-zA-Z0-9_-]{20,}$', filename):
            title = filename.replace('.pdf', '').replace('-', ' ').replace('_', ' ')
        else:
            title = "Digital Book Resource"
    # Clean whitespace and unwanted characters
    title = re.sub(r'\s+', ' ', title).strip()
    return title.title()

def extract_links_from_pdf(pdf_path):
    print(f"[*] Reading PDF: {pdf_path}")
    reader = PdfReader(pdf_path)
    total_pages = len(reader.pages)
    print(f"[*] Total Pages: {total_pages}")
    
    found_items = []
    seen_urls = set()
    
    for page_idx, page in enumerate(reader.pages):
        page_num = page_idx + 1
        page_text = page.extract_text() or ''
        
        # 1. Check PDF Annotations (Clickable hyperlinks)
        if "/Annots" in page:
            annots = page["/Annots"]
            for annot in annots:
                try:
                    obj = annot.get_object()
                    uri = None
                    if "/A" in obj and "/URI" in obj["/A"]:
                        uri = obj["/A"]["/URI"]
                    elif "/URI" in obj:
                        uri = obj["/URI"]
                        
                    if uri:
                        norm_url = clean_drive_url(uri)
                        if norm_url in seen_urls:
                            continue
                        seen_urls.add(norm_url)
                        
                        # Try to get label from annotation contents or surrounding text
                        raw_title = obj.get("/Contents") or obj.get("/T") or ""
                        rect = obj.get("/Rect")
                        
                        # If no direct title in annotation object, try extracting near rect
                        if (not raw_title or str(raw_title).strip() == '') and rect:
                            try:
                                x0, y0, x1, y1 = [float(v) for v in rect]
                                rect_words = []
                                def visitor_body(text, cm, tm, fontDict, fontSize):
                                    tx, ty = tm[4], tm[5]
                                    if (min(x0, x1) - 4 <= tx <= max(x0, x1) + 4 and 
                                        min(y0, y1) - 6 <= ty <= max(y0, y1) + 6):
                                        rect_words.append(text)
                                page.extract_text(visitor_text=visitor_body)
                                extracted_title = "".join(rect_words).strip()
                                if len(extracted_title) > 2:
                                    raw_title = extracted_title
                            except Exception:
                                pass
                            
                        final_title = clean_title(str(raw_title) if raw_title else "", norm_url)
                        found_items.append({
                            'title': final_title,
                            'url': norm_url,
                            'page': page_num,
                            'source': 'hyperlink'
                        })
                except Exception:
                    continue

        # 2. Check for plain text URLs printed in text
        url_matches = re.findall(r'(https?://[^\s<>"\']+)', page_text)
        for raw_url in url_matches:
            # clean punctuation at end of URL
            raw_url = raw_url.rstrip('.,);:]')
            norm_url = clean_drive_url(raw_url)
            if norm_url in seen_urls:
                continue
            seen_urls.add(norm_url)
            
            # Find surrounding text line for title
            lines = [l.strip() for l in page_text.split('\n') if raw_url in l]
            title_guess = ""
            if lines:
                line = lines[0].replace(raw_url, '').strip(' -:|—')
                if len(line) > 2:
                    title_guess = line
                    
            final_title = clean_title(title_guess, norm_url)
            found_items.append({
                'title': final_title,
                'url': norm_url,
                'page': page_num,
                'source': 'text'
            })
            
    return found_items

def insert_to_db(items, section='secondary', category='General', grade='All Grades', author='Viraj Educational Press'):
    import sqlite3
    db_path = os.path.join(os.path.dirname(__file__), '..', 'library.db')
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    count = 0
    now = int(__import__('time').time() * 1000)
    for it in items:
        cur.execute(
            """
            INSERT INTO items(section, category, title, author, grade, read_time, content_type, description, file, featured, popular, at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                section,
                category,
                it['title'],
                author,
                grade,
                '15 min read',
                'book',
                f"Digital resource imported from Google Drive (Page {it.get('page', 1)})",
                it['url'],
                0,
                0,
                now
            )
        )
        count += 1
        
    conn.commit()
    conn.close()
    return count

def main():
    parser = argparse.ArgumentParser(description="Extract Google Drive and PDF links from a master PDF.")
    parser.add_argument("pdf_path", help="Path to the PDF file to scan")
    parser.add_argument("--section", default="secondary", choices=["junior", "secondary", "biography"], help="Target library section")
    parser.add_argument("--category", default="General", help="Target book category")
    parser.add_argument("--grade", default="All Grades", help="Grade/Class range")
    parser.add_argument("--author", default="Viraj Educational Press", help="Default author name")
    parser.add_argument("--insert", action="store_true", help="Directly insert extracted items into library.db")
    parser.add_argument("--json", action="store_true", help="Output results as JSON to stdout")

    args = parser.parse_args()

    if not os.path.isfile(args.pdf_path):
        if args.json:
            import json
            print(json.dumps({"error": f"File not found at '{args.pdf_path}'"}))
            sys.exit(1)
        print(f"Error: File not found at '{args.pdf_path}'")
        sys.exit(1)

    items = extract_links_from_pdf(args.pdf_path)
    
    if args.json:
        import json
        print("__JSON_START__" + json.dumps(items) + "__JSON_END__")
        return

    print(f"\n[+] Found {len(items)} unique links/books in PDF!")
    
    if not items:
        print("No hyperlinks or URLs were found in the provided PDF.")
        return

    # Write formatted batch list
    out_path = os.path.abspath(args.output)
    with open(out_path, 'w', encoding='utf-8') as f:
        for it in items:
            # Format: Title | Link | Author | Category
            f.write(f"{it['title']} | {it['url']} | {args.author} | {args.category}\n")
            
    print(f"[+] Saved formatted batch import list to:\n    {out_path}")
    print(f"\nFirst 5 items preview:")
    for it in items[:5]:
        print(f"  - {it['title']}  -->  {it['url']}")

    if args.insert:
        inserted = insert_to_db(items, args.section, args.category, args.grade, args.author)
        print(f"\n[🚀 SUCCESS] Directly inserted {inserted} books into library.db!")
    else:
        print("\nTip: To directly insert into the database, run with --insert:")
        print(f'  python scripts/extract_pdf_links.py "{args.pdf_path}" --insert')
        print("Or copy the contents of 'extracted_books.txt' and paste into the Librarian Portal -> 'Batch Import Drive Links' button.")

if __name__ == '__main__':
    main()

